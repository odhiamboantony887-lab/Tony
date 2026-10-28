/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, validateFirestoreConnection } from './lib/firebase.ts';
import {
  loadUserConversations,
  saveConversationToFirestore,
  deleteConversationFromFirestore,
  loadUserTrainings,
  saveTrainingItemToFirestore,
  deleteTrainingItemFromFirestore
} from './services/chatFirestoreService.ts';
import { Header } from './components/Header.tsx';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer.tsx';
import { MessageItem } from './components/MessageItem.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { SetupInfoModal } from './components/SetupInfoModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PersonaCustomizerModal } from './components/PersonaCustomizerModal.tsx';
import { TrainingModal } from './components/TrainingModal.tsx';
import {
  ChatMessage,
  Conversation,
  generateTitle,
  detectLanguage,
  estimateTokenCount,
  PersonaConfig,
  DEFAULT_PERSONA_CONFIG,
  TrainingItem,
  SAMPLE_TRAINING_ITEMS
} from './utils/chatUtils.ts';
import { AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'tony_ai_conversations_v3';
const PERSONA_STORAGE_KEY = 'tony_ai_persona_config_v2';
const TRAININGS_STORAGE_KEY = 'tony_ai_trainings_v2';
const AUTOSPEAK_KEY = 'tony_ai_autospeak';

function createNewConversation(
  persona: PersonaConfig = DEFAULT_PERSONA_CONFIG,
  tone?: 'balanced' | 'direct' | 'sheng' | 'swahili'
): Conversation {
  const now = Date.now();
  const id = `conv_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const assistantName = persona.name || 'TONY AI';

  let welcomeText = `Niaje! I'm **${assistantName}**, your personal mobile AI assistant powered by Google Gemini 3.8 Flash.\n\nI speak fluent **English**, **Kiswahili**, and **Sheng** 🔥. I give friendly, direct, and actionable answers without wasting your time.\n\nHow can I help you today? *Niambie rada yako ama niulize chochote!*`;

  if (persona.presetId === 'tony-coach' || tone === 'sheng') {
    welcomeText = `Niaje msee! Ni **${assistantName}** hapa, your personal hustle coach. Tuko fiti kabisa na Gemini 3.8 Flash. Niambie rada ni gani ama kazi unataka tuchape leo? Twende kazi! 🔥`;
  } else if (persona.presetId === 'tony-teacher' || tone === 'swahili') {
    welcomeText = `Habari yako! Mimi ni **${assistantName}**, msaidizi wako ninayetumia Gemini 3.8 Flash. Nina furaha kukusaidia kwa lugha safi ya Kiswahili, Kiingereza au Sheng. Ungependa tueleze nini leo?`;
  } else if (persona.presetId === 'tony-dev') {
    welcomeText = `Hey dev! **${assistantName}** ready. Powered by Gemini 3.8 Flash for clean architecture, fast code, and technical clarity. What are we building or debugging today? 💻`;
  } else if (persona.presetId === 'tony-diplomat') {
    welcomeText = `Greetings! I am **${assistantName}**, your executive advisor powered by Gemini 3.8 Flash. How may I assist you with professional communications, strategy, or analysis today?`;
  }

  const welcomeMessage: ChatMessage = {
    id: `msg_welcome_${now}`,
    role: 'assistant',
    content: welcomeText,
    timestamp: now,
    language: persona.presetId === 'tony-coach' ? 'sheng' : (persona.presetId === 'tony-teacher' ? 'sw' : 'en'),
    tokensUsed: estimateTokenCount(welcomeText)
  };

  return {
    id,
    title: 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: [welcomeMessage],
    tone: tone || 'balanced'
  };
}

export default function App() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Persona configuration state
  const [persona, setPersona] = useState<PersonaConfig>(() => {
    try {
      const savedPersona = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (savedPersona) {
        return JSON.parse(savedPersona);
      }
    } catch {
      // fallback
    }
    return DEFAULT_PERSONA_CONFIG;
  });

  // Training / memory items state
  const [trainings, setTrainings] = useState<TrainingItem[]>(() => {
    try {
      const saved = localStorage.getItem(TRAININGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return SAMPLE_TRAINING_ITEMS;
  });

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved conversations', e);
    }
    return [createNewConversation(DEFAULT_PERSONA_CONFIG)];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem(AUTOSPEAK_KEY) === 'true';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeId) ||
    conversations[0] ||
    createNewConversation(persona);

  // Validate Firestore and listen to Auth state changes
  useEffect(() => {
    validateFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudConvs = await loadUserConversations(user.uid);
          if (cloudConvs && cloudConvs.length > 0) {
            setConversations(cloudConvs);
            setActiveId(cloudConvs[0].id);
          } else {
            for (const conv of conversations) {
              await saveConversationToFirestore(user.uid, conv);
            }
          }

          // Sync custom training items
          const cloudTrainings = await loadUserTrainings(user.uid);
          if (cloudTrainings && cloudTrainings.length > 0) {
            setTrainings(cloudTrainings as TrainingItem[]);
          } else {
            for (const t of trainings) {
              await saveTrainingItemToFirestore(user.uid, t);
            }
          }
        } catch (err) {
          console.warn('Failed to sync with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      console.warn('Failed to save conversations to localStorage:', err);
    }
  }, [conversations]);

  // Save persona to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, JSON.stringify(persona));
    } catch (err) {
      console.warn('Failed to save persona to localStorage:', err);
    }
  }, [persona]);

  // Save trainings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TRAININGS_STORAGE_KEY, JSON.stringify(trainings));
    } catch (err) {
      console.warn('Failed to save trainings to localStorage:', err);
    }
  }, [trainings]);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => {
        console.warn('Server status check returned error:', err);
      });
  }, []);

  // Scroll to bottom smoothly on message change or loading state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading]);

  const handleToggleAutoSpeak = () => {
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    localStorage.setItem(AUTOSPEAK_KEY, String(nextVal));
  };

  const handleStartNewConversation = () => {
    const newConv = createNewConversation(persona, activeConversation?.tone || 'balanced');
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);

    if (currentUser) {
      saveConversationToFirestore(currentUser.uid, newConv).catch(console.warn);
    }
  };

  const handleDeleteConversation = (idToDelete: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== idToDelete);
      if (remaining.length === 0) {
        const fresh = createNewConversation(persona);
        setActiveId(fresh.id);
        if (currentUser) {
          saveConversationToFirestore(currentUser.uid, fresh).catch(console.warn);
        }
        return [fresh];
      }
      if (activeId === idToDelete) {
        setActiveId(remaining[0].id);
      }
      return remaining;
    });

    if (currentUser) {
      deleteConversationFromFirestore(idToDelete).catch(console.warn);
    }
  };

  const handleClearAllConversations = () => {
    if (currentUser) {
      for (const conv of conversations) {
        deleteConversationFromFirestore(conv.id).catch(console.warn);
      }
    }
    const fresh = createNewConversation(persona);
    setConversations([fresh]);
    setActiveId(fresh.id);
    if (currentUser) {
      saveConversationToFirestore(currentUser.uid, fresh).catch(console.warn);
    }
  };

  // Training Handlers
  const handleSaveTraining = (item: TrainingItem) => {
    setTrainings((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === item.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = item;
        return copy;
      }
      return [item, ...prev];
    });

    if (currentUser) {
      saveTrainingItemToFirestore(currentUser.uid, item).catch(console.warn);
    }
  };

  const handleToggleTraining = (id: string) => {
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, enabled: !t.enabled, updatedAt: Date.now() };
          if (currentUser) {
            saveTrainingItemToFirestore(currentUser.uid, updated).catch(console.warn);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      deleteTrainingItemFromFirestore(currentUser.uid, id).catch(console.warn);
    }
  };

  const handleLoadSamplePack = () => {
    setTrainings(SAMPLE_TRAINING_ITEMS);
    if (currentUser) {
      for (const t of SAMPLE_TRAINING_ITEMS) {
        saveTrainingItemToFirestore(currentUser.uid, t).catch(console.warn);
      }
    }
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }

    const now = Date.now();
    const detectedLang = detectLanguage(userText);
    const userMessage: ChatMessage = {
      id: `user_${now}`,
      role: 'user',
      content: userText,
      timestamp: now,
      language: detectedLang
    };

    // Calculate title if this is the first user query in conversation
    const isFirstUserMsg = !activeConversation.messages.some((m) => m.role === 'user');
    const updatedTitle = isFirstUserMsg ? generateTitle(userText) : activeConversation.title;

    // Append user message immediately
    const updatedMessages = [...activeConversation.messages, userMessage];
    const updatedConversation: Conversation = {
      ...activeConversation,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: now
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? updatedConversation : c))
    );

    if (currentUser) {
      saveConversationToFirestore(currentUser.uid, updatedConversation).catch(console.warn);
    }

    setIsLoading(true);

    try {
      // Build request payload with recent history
      const recentHistory = updatedMessages.slice(-12).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: recentHistory,
          tone: activeConversation.tone,
          personaConfig: persona,
          trainings: trainings.filter((t) => t.enabled)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      const answerText = data.text || "Sikupata jibu. Tafadhali jaribu tena.";
      const assistantLang = detectLanguage(answerText);

      const assistantMessage: ChatMessage = {
        id: `assist_${Date.now()}`,
        role: 'assistant',
        content: answerText,
        timestamp: Date.now(),
        language: assistantLang,
        tokensUsed: data.tokensUsed || estimateTokenCount(answerText)
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation: Conversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: Date.now()
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? finalConversation : c))
      );

      if (currentUser) {
        saveConversationToFirestore(currentUser.uid, finalConversation).catch(console.warn);
      }

      // Trigger text-to-speech if auto-read is enabled
      if (autoSpeak && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(answerText);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: unknown) {
      console.error('Failed to get answer from TONY AI:', err);
      const errorText =
        err instanceof Error
          ? err.message
          : 'Samahani! Kulitokea hitilafu kuwasiliana na Gemini. Tafadhali hakikisha API key imewekwa au jaribu tena.';

      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: errorText,
        timestamp: Date.now(),
        isError: true
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, errorMessage],
                updatedAt: Date.now()
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    const msgs = [...activeConversation.messages];
    const lastUserMsg = msgs.reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const activeTrainingsCount = trainings.filter((t) => t.enabled).length;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewConversation={handleStartNewConversation}
        onOpenSetupInfo={() => setIsSetupOpen(true)}
        onOpenPersonaModal={() => setIsPersonaOpen(true)}
        onOpenTrainingModal={() => setIsTrainingOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={handleToggleAutoSpeak}
        persona={persona}
        trainingsCount={activeTrainingsCount}
        currentUser={currentUser}
        isOnline={hasApiKey}
      />

      {/* API Key notice banner if missing */}
      {!hasApiKey && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <AlertTriangle className="w-4 h-4 flex-none" />
            <span className="truncate">GEMINI_API_KEY not detected. Tap to review setup steps.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="flex-none underline font-medium hover:text-white"
          >
            Setup Guide
          </button>
        </div>
      )}

      {/* Main Chat Scroll View */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-1 max-w-4xl w-full mx-auto">
        {activeConversation.messages.map((message, index) => {
          const isLastAssistant =
            message.role === 'assistant' &&
            index === activeConversation.messages.length - 1;

          return (
            <MessageItem
              key={message.id}
              message={message}
              onRetry={message.isError ? handleRetryLastMessage : undefined}
              isLastAssistantMessage={isLastAssistant}
              persona={persona}
            />
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3 my-3 sm:my-4 px-1 animate-pulse">
            <div className="flex-none pt-0.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                {persona.customInitial || persona.name[0] || 'T'}
              </div>
            </div>
            <div className="bg-slate-850 border border-slate-700/60 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-slate-400 text-xs ml-1 font-medium">{persona.name} anafikiria...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Bottom Composer */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewConversation={handleStartNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAllConversations={handleClearAllConversations}
      />

      {/* Setup Steps, Limits & Costs Modal */}
      <SetupInfoModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        hasApiKey={hasApiKey}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
      />

      {/* Persona & Avatar Customizer Modal */}
      <PersonaCustomizerModal
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
        currentPersona={persona}
        onSavePersona={(newPersona) => setPersona(newPersona)}
      />

      {/* Train TONY AI Modal */}
      <TrainingModal
        isOpen={isTrainingOpen}
        onClose={() => setIsTrainingOpen(false)}
        trainings={trainings}
        onSaveTraining={handleSaveTraining}
        onToggleTraining={handleToggleTraining}
        onDeleteTraining={handleDeleteTraining}
        onLoadSamplePack={handleLoadSamplePack}
      />
    </div>
  );
}
