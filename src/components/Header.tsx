/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Plus,
  HelpCircle,
  Volume2,
  VolumeX,
  Sliders,
  User as UserIcon,
  GraduationCap,
  Zap,
  Flame,
  Book,
  Code,
  Crown,
  Bot
} from 'lucide-react';
import { PersonaConfig, AvatarStyle, AvatarIconType } from '../utils/chatUtils.ts';
import { User } from 'firebase/auth';

interface HeaderProps {
  onOpenHistory: () => void;
  onNewConversation: () => void;
  onOpenSetupInfo: () => void;
  onOpenPersonaModal: () => void;
  onOpenTrainingModal: () => void;
  onOpenAuthModal: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  persona: PersonaConfig;
  trainingsCount?: number;
  currentUser: User | null;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onNewConversation,
  onOpenSetupInfo,
  onOpenPersonaModal,
  onOpenTrainingModal,
  onOpenAuthModal,
  autoSpeak,
  onToggleAutoSpeak,
  persona,
  trainingsCount = 0,
  currentUser,
  isOnline
}) => {
  const getGradient = (style: AvatarStyle) => {
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

  const renderBadgeIcon = (icon: AvatarIconType) => {
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

  return (
    <header className="sticky top-0 z-30 flex-none bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 py-2 sm:px-4">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 max-w-4xl mx-auto">
        {/* Left: Drawer Toggle & Brand with customized avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label="Open chat history menu"
            className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700/80 rounded-full transition-colors flex items-center justify-center min-w-[38px] min-h-[38px]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Assistant Avatar & Info - Tappable to customize persona */}
          <button
            type="button"
            onClick={onOpenPersonaModal}
            aria-label="Customize Assistant Persona and Avatar"
            title="Customize Persona & Avatar"
            className="flex items-center gap-2 p-1 -m-1 rounded-xl hover:bg-slate-800/70 transition-colors text-left"
          >
            <div
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr ${getGradient(
                persona.avatarStyle
              )} shadow-md text-white font-black text-sm tracking-tighter`}
            >
              <span>{persona.customInitial || persona.name[0] || 'T'}</span>
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-slate-200 border border-slate-700">
                {renderBadgeIcon(persona.avatarIcon)}
              </span>
              {isOnline && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1">
                  {persona.name}
                </h1>
                <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>{persona.formality} &bull; {persona.shengLevel}</span>
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Persona tune, Voice readout, Auth user, Info, New chat */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Persona Tuning Quick Button */}
          <button
            type="button"
            onClick={onOpenPersonaModal}
            aria-label="Tune assistant persona and avatar"
            title="Tune Persona & Avatar"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Train TONY AI Button */}
          <button
            type="button"
            onClick={onOpenTrainingModal}
            aria-label="Train TONY AI: teach facts, vocabulary, Q&A"
            title="Train TONY AI (Custom Memory)"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            {trainingsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Voice Readout Toggle */}
          <button
            type="button"
            onClick={onToggleAutoSpeak}
            aria-label={autoSpeak ? "Turn off voice readout" : "Turn on voice readout"}
            title={autoSpeak ? "Voice Readout: ON" : "Voice Readout: OFF"}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
              autoSpeak
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Auth Profile Button */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            aria-label={currentUser ? "View Account" : "Sign In / Sign Up"}
            title={currentUser ? `Signed in as ${currentUser.email}` : "Sign In / Sign Up"}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all text-xs ${
              currentUser
                ? 'bg-slate-800 text-slate-200 border-emerald-500/40'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
          >
            <UserIcon className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline max-w-[80px] truncate">
              {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : 'Sign In'}
            </span>
          </button>

          {/* Setup, Limits & Costs Guide */}
          <button
            type="button"
            onClick={onOpenSetupInfo}
            aria-label="Open setup steps, limits, and cost guidelines"
            title="Setup, Limits & Costs"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* New Conversation Button */}
          <button
            type="button"
            onClick={onNewConversation}
            aria-label="Start new conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-950 transition-all min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
