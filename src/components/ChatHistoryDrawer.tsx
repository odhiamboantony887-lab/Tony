/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Zap } from 'lucide-react';
import { Conversation, formatMessageTime } from '../utils/chatUtils.ts';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAllConversations: () => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAllConversations
}) => {
  if (!isOpen) return null;

  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Conversation History">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content (Android style sheet from left) */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Chat History</h2>
              <p className="text-[11px] text-slate-400">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'} • {totalMessages} messages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat history"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            aria-label="Start a new chat"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/50 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4 text-slate-500">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-medium">No previous conversations yet.</p>
              <p className="text-[11px] mt-1 text-slate-500">Start talking with TONY AI to save chats here.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const dateStr = new Date(conv.updatedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                      : 'hover:bg-slate-800/70 text-slate-300 border border-transparent'
                  }`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-emerald-300 font-semibold' : 'text-slate-200'}`}>
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {dateStr} {formatMessageTime(conv.updatedAt)}
                      </span>
                      <span>•</span>
                      <span>{conv.messages.length} msgs</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    aria-label={`Delete conversation ${conv.title}`}
                    title="Delete conversation"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/60">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all conversation history? This cannot be undone.')) {
                  onClearAllConversations();
                  onClose();
                }
              }}
              aria-label="Clear all chat history"
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
