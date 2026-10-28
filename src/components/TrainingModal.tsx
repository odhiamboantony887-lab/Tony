/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrainingItem,
  TrainingType,
  SAMPLE_TRAINING_ITEMS
} from '../utils/chatUtils.ts';
import {
  X,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  Brain,
  MessageSquare,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainings: TrainingItem[];
  onSaveTraining: (item: TrainingItem) => void;
  onToggleTraining: (id: string) => void;
  onDeleteTraining: (id: string) => void;
  onLoadSamplePack: () => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  trainings,
  onSaveTraining,
  onToggleTraining,
  onDeleteTraining,
  onLoadSamplePack
}) => {
  const [activeTab, setActiveTab] = useState<TrainingType | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New item form state
  const [type, setType] = useState<TrainingType>('fact');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !response.trim()) return;

    const newItem: TrainingItem = {
      id: `train_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: title.trim(),
      prompt: prompt.trim() || title.trim(),
      response: response.trim(),
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveTraining(newItem);
    setTitle('');
    setPrompt('');
    setResponse('');
    setIsAdding(false);
  };

  const filteredTrainings = activeTab === 'all'
    ? trainings
    : trainings.filter(t => t.type === activeTab);

  const activeCount = trainings.filter(t => t.enabled).length;

  const getTypeIcon = (tType: TrainingType) => {
    switch (tType) {
      case 'fact': return <Brain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'qa': return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case 'vocabulary': return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'rule': return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getTypeBadge = (tType: TrainingType) => {
    switch (tType) {
      case 'fact':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Fact</span>;
      case 'qa':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Q&amp;A</span>;
      case 'vocabulary':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">Sheng Word</span>;
      case 'rule':
        return <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">Rule</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Train TONY AI Studio"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 text-emerald-400 border border-emerald-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Train TONY AI</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {activeCount} active
                </span>
              </div>
              <p className="text-xs text-slate-400">Teach custom facts, Q&amp;A, Sheng words &amp; habits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close training modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Add training / Quick pack */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Teach Something New'}</span>
          </button>

          {trainings.length === 0 && (
            <button
              type="button"
              onClick={onLoadSamplePack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Starter Pack</span>
            </button>
          )}
        </div>

        {/* Create new training form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Teach TONY AI New Knowledge
            </h3>

            {/* Type selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Training Type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'fact', label: 'Fact' },
                  { id: 'qa', label: 'Q&A' },
                  { id: 'vocabulary', label: 'Sheng Slang' },
                  { id: 'rule', label: 'Rule' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as TrainingType)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      type === item.id
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {type === 'vocabulary' ? 'Word / Slang Phrase' : 'Subject / Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'vocabulary'
                    ? 'e.g. Ndoko, Chapa luku, Rada'
                    : type === 'qa'
                    ? 'e.g. When asked about my work'
                    : 'e.g. My Freelance Design Studio'
                }
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {type === 'vocabulary' ? 'Usage in context or trigger' : 'Trigger Phrase / Question'}
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. What is my business? / When did I start coding?"
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {type === 'vocabulary'
                  ? 'Definition & Meaning'
                  : type === 'qa'
                  ? 'Expected Answer'
                  : 'Fact / Memory Details'}
              </label>
              <textarea
                rows={3}
                required
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={
                  type === 'vocabulary'
                    ? 'Means money or cash in Nairobi street slang.'
                    : 'Explain that I specialize in mobile app design and deliver within 48 hours.'
                }
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Memory</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'fact', label: '🧠 Facts' },
            { id: 'qa', label: '💬 Q&A' },
            { id: 'vocabulary', label: '🔥 Sheng Slang' },
            { id: 'rule', label: '🎯 Rules' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-none px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Training items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTrainings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
              <GraduationCap className="w-10 h-10 opacity-30 text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">No training items in this category.</p>
              <p className="text-[11px] max-w-xs text-slate-500">
                Teach Tony your specific slang, facts about your projects, or custom response habits!
              </p>
              <button
                type="button"
                onClick={onLoadSamplePack}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Starter Training Pack</span>
              </button>
            </div>
          ) : (
            filteredTrainings.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.enabled
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/20 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    {getTypeBadge(item.type)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleTraining(item.id)}
                      title={item.enabled ? 'Disable memory' : 'Enable memory'}
                      className={`text-xs p-1 transition-colors ${
                        item.enabled ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    >
                      {item.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTraining(item.id)}
                      title="Delete training item"
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.prompt && item.prompt !== item.title && (
                  <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                    Trigger: &quot;{item.prompt}&quot;
                  </p>
                )}

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  {item.response}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Trained memories are active in all chat replies.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
