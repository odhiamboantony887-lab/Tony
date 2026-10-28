/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Key, Zap, DollarSign, CheckCircle2, Cpu, Globe2, AlertCircle } from 'lucide-react';

interface SetupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
}

export const SetupInfoModal: React.FC<SetupInfoModalProps> = ({
  isOpen,
  onClose,
  hasApiKey
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Setup, Usage Limits, and Costs Guide"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">TONY AI Guide</h2>
              <p className="text-xs text-slate-400">Setup steps, usage limits & costs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-300 text-xs sm:text-sm">
          {/* Status banner */}
          <div
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              hasApiKey
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
            }`}
          >
            {hasApiKey ? (
              <CheckCircle2 className="w-5 h-5 flex-none text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-none text-amber-400 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {hasApiKey ? 'Server Ready & API Key Connected' : 'Waiting for API Key Configuration'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {hasApiKey
                  ? 'Your GEMINI_API_KEY is securely loaded on the Express server. TONY AI is ready to answer questions.'
                  : 'Please ensure GEMINI_API_KEY is configured in your Google AI Studio Secrets or local .env file.'}
              </p>
            </div>
          </div>

          {/* Section 1: Setup Steps */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3>1. Setup Steps You Must Complete</h3>
            </div>
            <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/90 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-none text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-slate-100">In Google AI Studio:</strong> Open the{' '}
                  <span className="text-emerald-300 font-medium">Settings &gt; Secrets</span> panel. AI Studio automatically injects your <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">GEMINI_API_KEY</code> into the server environment at runtime.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-none text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-slate-100">Local or External Hosting:</strong> Create a <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">.env</code> file containing <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">GEMINI_API_KEY="YOUR_KEY"</code>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-none text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-slate-100">Zero Client Exposure:</strong> The API key is kept strictly on the Node/Express backend (<code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">server.ts</code>) via the <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">@google/genai</code> SDK. The browser client never sees or downloads secrets.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Supported Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3>2. Supported Model: Gemini 3.8 Flash</h3>
            </div>
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-1.5 leading-relaxed">
              <p>
                TONY AI is configured to use <strong className="text-emerald-300">gemini-3.8-flash</strong>, the state-of-the-art general-purpose AI model from Google.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li><strong className="text-slate-200">Sub-second latency:</strong> Fast stream processing ideal for mobile phones.</li>
                <li><strong className="text-slate-200">Multilingual:</strong> Deep understanding of English, standard Kiswahili, and Sheng slang.</li>
                <li><strong className="text-slate-200">Friendly & Direct:</strong> Instructed to provide crisp, actionable, high-signal answers.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Usage Limits & Quotas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3>3. Usage Limits &amp; Quotas</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Free Tier (Default)</span>
                <p className="font-semibold text-slate-100">15 RPM &bull; 1,500 RPD</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  15 requests per minute, 1,000,000 tokens/min, and 1,500 daily requests. Perfect for personal use with zero billing required.
                </p>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Pay-As-You-Go Tier</span>
                <p className="font-semibold text-slate-100">1,000+ RPM</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  High-throughput ceiling with 4M+ tokens per minute and no daily request cap.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Costs Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3>4. Costs &amp; Pricing</h3>
            </div>
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-300">
                <span>Input tokens (user message + history)</span>
                <span className="font-semibold text-emerald-300">$0.075 / 1M tokens</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-300">
                <span>Output tokens (Tony AI response)</span>
                <span className="font-semibold text-emerald-300">$0.30 / 1M tokens</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                <strong className="text-slate-200">Real-World Math:</strong> A standard mobile conversation of ~150 words input and ~300 words answer costs less than <strong className="text-emerald-400">$0.0001</strong>. On the Free Tier, it is completely free of charge.
              </p>
            </div>
          </div>

          {/* Section 5: Languages Supported */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <h3>5. Languages: English, Kiswahili &amp; Sheng</h3>
            </div>
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-1.5 leading-relaxed text-slate-300">
              <p>
                You can chat naturally in English, Swahili, or Sheng. Try saying:
              </p>
              <div className="grid grid-cols-1 gap-1.5 mt-1 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                  &quot;Niaje Tony, rada ni gani? Nipe form ya leo.&quot;
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  &quot;Habari ya leo rafiki, unawezaje kunisaidia kupanga ratiba?&quot;
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200">
                  &quot;Hey Tony, summarize these meeting notes in 3 bullets.&quot;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Got it, let&apos;s chat!
          </button>
        </div>
      </div>
    </div>
  );
};
