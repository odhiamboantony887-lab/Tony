/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle,
  Zap,
  Flame,
  Book,
  Code,
  Crown,
  Bot
} from 'lucide-react';
import {
  ChatMessage,
  formatMessageTime,
  PersonaConfig,
  AvatarStyle,
  AvatarIconType
} from '../utils/chatUtils.ts';
import { MarkdownView } from './MarkdownView.tsx';

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
  isLastAssistantMessage?: boolean;
  persona?: PersonaConfig;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRetry,
  isLastAssistantMessage,
  persona
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    if (message.language === 'sw' || message.language === 'sheng') {
      const voices = window.speechSynthesis.getVoices();
      const swVoice = voices.find((v) => v.lang.startsWith('sw') || v.lang.startsWith('af'));
      if (swVoice) utterance.voice = swVoice;
    }
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getGradient = (style?: AvatarStyle) => {
    switch (style) {
      case 'amber': return 'from-amber-500 to-orange-600';
      case 'indigo': return 'from-indigo-600 to-blue-500';
      case 'cyan': return 'from-cyan-500 to-blue-600';
      case 'violet': return 'from-purple-600 to-violet-500';
      case 'rose': return 'from-rose-500 to-pink-600';
      case 'emerald':
      default:
        return 'from-emerald-600 to-teal-500';
    }
  };

  const renderBadgeIcon = (icon?: AvatarIconType) => {
    switch (icon) {
      case 'flame': return <Flame className="w-2.5 h-2.5" />;
      case 'book': return <Book className="w-2.5 h-2.5" />;
      case 'code': return <Code className="w-2.5 h-2.5" />;
      case 'crown': return <Crown className="w-2.5 h-2.5" />;
      case 'zap': return <Zap className="w-2.5 h-2.5" />;
      case 'bot':
      default:
        return <Bot className="w-2.5 h-2.5" />;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3 sm:my-4 px-1">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-sm shadow-emerald-950/30 text-[14px] sm:text-[15px] leading-relaxed break-words">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 pr-1">
            <span>{formatMessageTime(message.timestamp)}</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy user message"
              className="hover:text-slate-300 transition-colors p-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  const assistantName = persona?.name || 'TONY AI';
  const initial = persona?.customInitial || assistantName[0] || 'T';

  return (
    <div className="flex gap-2.5 sm:gap-3 my-3 sm:my-4 px-1">
      {/* Avatar */}
      <div className="flex-none pt-0.5">
        <div
          className={`relative w-8 h-8 rounded-xl bg-gradient-to-tr ${getGradient(
            persona?.avatarStyle
          )} flex items-center justify-center text-white font-black text-xs shadow-sm shadow-emerald-950/40 select-none`}
        >
          <span>{initial}</span>
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-slate-200 border border-slate-700">
            {renderBadgeIcon(persona?.avatarIcon)}
          </span>
        </div>
      </div>

      {/* Bubble card */}
      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%]">
        <div
          className={`rounded-2xl rounded-tl-xs p-3.5 sm:p-4 border shadow-sm ${
            message.isError
              ? 'bg-red-950/30 border-red-800/60 text-red-200'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
          }`}
        >
          {/* Header row in message bubble */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-700/40">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-white">{assistantName}</span>
              {message.language === 'sheng' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                  🔥 Sheng
                </span>
              )}
              {message.language === 'sw' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                  🇰🇪 Kiswahili
                </span>
              )}
              {message.language === 'en' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/50 text-slate-300 font-medium border border-slate-600/30">
                  English
                </span>
              )}
            </div>

            {/* Message Action Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy assistant answer"
                title="Copy response"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleSpeak}
                aria-label={isSpeaking ? "Stop voice readout" : "Listen to answer"}
                title={isSpeaking ? "Stop speech" : "Read aloud"}
                className={`p-1 rounded transition-colors ${
                  isSpeaking
                    ? 'text-emerald-400 bg-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {message.isError && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label="Retry generating response"
                  title="Retry"
                  className="p-1 rounded text-red-300 hover:text-white hover:bg-red-800/40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Message Content */}
          {message.isError ? (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-red-300">
              <AlertCircle className="w-4 h-4 flex-none mt-0.5 text-red-400" />
              <div className="space-y-2">
                <p>{message.content}</p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-800/50 hover:bg-red-700/50 text-white border border-red-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <MarkdownView content={message.content} />
          )}
        </div>

        {/* Timestamp and token estimate */}
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 pl-1">
          <span>{formatMessageTime(message.timestamp)}</span>
          {message.tokensUsed ? (
            <>
              <span>•</span>
              <span>~{message.tokensUsed} tokens</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
