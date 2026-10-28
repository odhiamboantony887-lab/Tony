/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectSuggestion?: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onSelectSuggestion
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Setup Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition isn't supported in this browser. You can type your message directly!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // On desktop or keyboards, Enter submits. Shift+Enter creates a new line.
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    { label: '🎓 Teach Tony', prompt: 'Tony, remember this about me: ' },
    { label: '🔥 Sheng chat', prompt: 'Niaje Tony! Rada ni gani leo bro?' },
    { label: '🇰🇪 Kiswahili', prompt: 'Habari ya leo Tony, unawezaje kunisaidia?' },
    { label: '💡 Tech in Sheng', prompt: 'Nielezlee jinsi API inafanya kazi lakini utumie Sheng ya kijanja' },
    { label: '✍️ Draft message', prompt: 'Help me draft a friendly but professional email update' },
    { label: '🚀 Kenyan Hustle', prompt: 'Nipe tips 3 kali za kuanza biashara ndogo ndogo Nairobi' }
  ];

  return (
    <div className="sticky bottom-0 z-20 flex-none bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-3 py-2 sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Suggestion Chips (horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-none ml-0.5" />
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(s.prompt);
                textareaRef.current?.focus();
              }}
              className="flex-none px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700/80 active:bg-emerald-900/40 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-medium transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-end gap-1.5 sm:gap-2">
          {/* Textarea container */}
          <div className="relative flex-1 flex items-center bg-slate-950/80 border border-slate-700 focus-within:border-emerald-500 rounded-2xl shadow-inner transition-colors min-h-[46px]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening to your voice..." : "Message TONY AI... (English, Swahili, Sheng)"}
              aria-label="Type message to TONY AI"
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm px-3.5 py-3 resize-none max-h-32 focus:outline-none leading-normal"
            />

            {/* Mic button inside input bar */}
            <button
              type="button"
              onClick={toggleRecording}
              aria-label={isRecording ? "Stop voice listening" : "Start voice listening"}
              title="Voice input"
              className={`p-2 mr-1 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            aria-label="Send message to TONY AI"
            className="flex-none w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md shadow-emerald-950/60 active:scale-95 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 translate-x-0.5" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>TONY AI • Direct & culturally fluent</span>
          <span>{text.length > 0 ? `${text.length} chars` : 'Gemini 3.8 Flash'}</span>
        </div>
      </div>
    </div>
  );
};
