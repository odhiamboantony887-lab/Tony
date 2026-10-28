/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PersonaConfig,
  PersonaPreset,
  PRESET_PERSONAS,
  DEFAULT_PERSONA_CONFIG,
  AvatarStyle,
  AvatarIconType,
  FormalityLevel,
  DirectnessLevel,
  ShengLevel
} from '../utils/chatUtils.ts';
import {
  X,
  Zap,
  Flame,
  Book,
  Code,
  Crown,
  Bot,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Palette
} from 'lucide-react';

interface PersonaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: PersonaConfig;
  onSavePersona: (persona: PersonaConfig) => void;
}

export const PersonaCustomizerModal: React.FC<PersonaCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSavePersona
}) => {
  const [config, setConfig] = useState<PersonaConfig>(currentPersona);
  const [activeTab, setActiveTab] = useState<'presets' | 'avatar' | 'tuning'>('presets');

  if (!isOpen) return null;

  const colorStyles: Array<{ id: AvatarStyle; label: string; bgClass: string; ringClass: string }> = [
    { id: 'emerald', label: 'Emerald', bgClass: 'from-emerald-600 to-teal-500', ringClass: 'ring-emerald-400' },
    { id: 'amber', label: 'Amber', bgClass: 'from-amber-500 to-orange-600', ringClass: 'ring-amber-400' },
    { id: 'indigo', label: 'Indigo', bgClass: 'from-indigo-600 to-blue-500', ringClass: 'ring-indigo-400' },
    { id: 'cyan', label: 'Cyan', bgClass: 'from-cyan-500 to-blue-600', ringClass: 'ring-cyan-400' },
    { id: 'violet', label: 'Violet', bgClass: 'from-purple-600 to-violet-500', ringClass: 'ring-violet-400' },
    { id: 'rose', label: 'Rose', bgClass: 'from-rose-500 to-pink-600', ringClass: 'ring-rose-400' }
  ];

  const icons: Array<{ id: AvatarIconType; label: string; icon: any }> = [
    { id: 'zap', label: 'Lightning', icon: Zap },
    { id: 'flame', label: 'Flame', icon: Flame },
    { id: 'book', label: 'Book', icon: Book },
    { id: 'code', label: 'Terminal', icon: Code },
    { id: 'crown', label: 'Crown', icon: Crown },
    { id: 'bot', label: 'Bot', icon: Bot }
  ];

  const handleSelectPreset = (preset: PersonaPreset) => {
    setConfig({
      presetId: preset.id,
      name: preset.name,
      avatarStyle: preset.avatarStyle,
      avatarIcon: preset.avatarIcon,
      customInitial: preset.name[0] || 'T',
      formality: preset.formality,
      directness: preset.directness,
      shengLevel: preset.shengLevel,
      customToneNote: config.customToneNote || ''
    });
  };

  const handleSave = () => {
    onSavePersona(config);
    onClose();
  };

  const handleReset = () => {
    setConfig(DEFAULT_PERSONA_CONFIG);
  };

  const renderIcon = (type: AvatarIconType, className = 'w-4 h-4') => {
    switch (type) {
      case 'zap': return <Zap className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'book': return <Book className={className} />;
      case 'code': return <Code className={className} />;
      case 'crown': return <Crown className={className} />;
      case 'bot':
      default:
        return <Bot className={className} />;
    }
  };

  const getStyleGradient = (style: AvatarStyle) => {
    const found = colorStyles.find(c => c.id === style);
    return found ? found.bgClass : 'from-emerald-600 to-teal-500';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Persona and Avatar Customizer"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Persona &amp; Avatar</h2>
              <p className="text-xs text-slate-400">Customize TONY AI&apos;s looks and personality</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getStyleGradient(
                config.avatarStyle
              )} flex items-center justify-center text-white shadow-lg relative`}
            >
              <span className="font-black text-lg select-none">
                {config.customInitial || config.name[0] || 'T'}
              </span>
              <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700 text-slate-200">
                {renderIcon(config.avatarIcon, 'w-3 h-3')}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{config.name}</h3>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Persona
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {config.formality} &bull; {config.directness} &bull; {config.shengLevel} sheng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Reset to default"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/70 px-4 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Pre-Set Personas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'avatar'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Avatar &amp; Colors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tuning')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'tuning'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Personality Tuning
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                Choose a pre-tuned personality archetype. You can further customize it anytime.
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_PERSONAS.map((preset) => {
                  const isSelected = config.presetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700/80 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getStyleGradient(
                              preset.avatarStyle
                            )} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {renderIcon(preset.avatarIcon, 'w-4 h-4')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-100">{preset.name}</h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                                {preset.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-400 font-medium">{preset.role}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Assistant Display Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="e.g. TONY AI, Coach Tony"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Avatar Monogram Initial
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={config.customInitial || ''}
                  onChange={(e) => setConfig({ ...config, customInitial: e.target.value.toUpperCase() })}
                  placeholder="e.g. T"
                  className="w-20 bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Theme Color Palette
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {colorStyles.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConfig({ ...config, avatarStyle: c.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        config.avatarStyle === c.id
                          ? 'border-emerald-500 bg-slate-800 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${c.bgClass}`} />
                      <span className="text-[10px] text-slate-300 font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Badge Icon
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {icons.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setConfig({ ...config, avatarIcon: ic.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        config.avatarIcon === ic.id
                          ? 'border-emerald-500 bg-slate-800 ring-2 ring-emerald-500/30 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900">
                        {renderIcon(ic.id, 'w-4 h-4')}
                      </div>
                      <span className="text-[10px] font-medium">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tuning' && (
            <div className="space-y-4">
              {/* Formality */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Formality: <span className="text-emerald-400 capitalize">{config.formality}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['casual', 'balanced', 'formal'] as FormalityLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConfig({ ...config, formality: level })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                        config.formality === level
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directness */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Directness &amp; Length: <span className="text-emerald-400 capitalize">{config.directness}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['punchy', 'balanced', 'detailed'] as DirectnessLevel[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setConfig({ ...config, directness: d })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                        config.directness === d
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sheng Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Sheng &amp; Slang Level: <span className="text-emerald-400 capitalize">{config.shengLevel}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['heavy', 'moderate', 'minimal'] as ShengLevel[]).map((sl) => (
                    <button
                      key={sl}
                      type="button"
                      onClick={() => setConfig({ ...config, shengLevel: sl })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                        config.shengLevel === sl
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sl === 'heavy' ? '🔥 Heavy' : sl === 'moderate' ? '⚡ Balanced' : 'Minimal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tone Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Custom Guidance / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={config.customToneNote || ''}
                  onChange={(e) => setConfig({ ...config, customToneNote: e.target.value })}
                  placeholder="e.g. Always give actionable next steps; use Nairobi tech hustle examples."
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
