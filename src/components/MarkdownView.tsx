/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  // Parse markdown content into structured blocks (paragraphs, code blocks, lists, headings)
  const blocks = React.useMemo(() => {
    const rawBlocks: Array<{ type: 'text' | 'code' | 'heading' | 'list'; content: string; lang?: string; level?: number }> = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';
    let textBuffer: string[] = [];

    const flushText = () => {
      if (textBuffer.length > 0) {
        const text = textBuffer.join('\n').trim();
        if (text) {
          rawBlocks.push({ type: 'text', content: text });
        }
        textBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          flushText();
          inCodeBlock = true;
          codeLang = line.trim().replace('```', '').trim() || 'plaintext';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          rawBlocks.push({
            type: 'code',
            content: codeBuffer.join('\n'),
            lang: codeLang
          });
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Check headings
      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        flushText();
        rawBlocks.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2]
        });
        continue;
      }

      textBuffer.push(line);
    }

    if (inCodeBlock && codeBuffer.length > 0) {
      rawBlocks.push({
        type: 'code',
        content: codeBuffer.join('\n'),
        lang: codeLang
      });
    }

    flushText();
    return rawBlocks;
  }, [content]);

  // Format inline markdown (bold, inline code, italics)
  const renderInline = (text: string) => {
    // Split by inline code `...`
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          >
            {codeText}
          </code>
        );
      }

      // Format bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${index}-${bIdx}`} className="font-semibold text-slate-100">
              {bPart.slice(2, -2)}
            </strong>
          );
        }

        // Format bullet lines inside text
        const lines = bPart.split('\n');
        return lines.map((l, lIdx) => {
          const isBullet = l.trim().startsWith('- ') || l.trim().startsWith('* ');
          const isNumbered = /^\d+\.\s+/.test(l.trim());

          if (isBullet) {
            return (
              <span key={`${index}-${bIdx}-${lIdx}`} className="flex items-start my-1 text-slate-300">
                <span className="text-emerald-400 mr-2 select-none">•</span>
                <span>{l.trim().substring(2)}</span>
              </span>
            );
          }

          if (isNumbered) {
            const numMatch = l.trim().match(/^(\d+\.)\s+(.*)$/);
            return (
              <span key={`${index}-${bIdx}-${lIdx}`} className="flex items-start my-1 text-slate-300">
                <span className="text-emerald-400 font-medium mr-2 select-none">{numMatch?.[1]}</span>
                <span>{numMatch?.[2]}</span>
              </span>
            );
          }

          return (
            <React.Fragment key={`${index}-${bIdx}-${lIdx}`}>
              {l}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          );
        });
      });
    });
  };

  return (
    <div className="space-y-2.5 text-[14px] sm:text-[15px] leading-relaxed break-words">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h1 key={idx} className="text-lg font-bold text-white border-b border-slate-700/60 pb-1 mt-2">
                {block.content}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={idx} className="text-base font-semibold text-emerald-300 mt-2">
                {block.content}
              </h2>
            );
          }
          return (
            <h3 key={idx} className="text-sm font-semibold text-slate-200 mt-1.5">
              {block.content}
            </h3>
          );
        }

        if (block.type === 'code') {
          const isCopied = copiedCodeIndex === idx;
          return (
            <div
              key={idx}
              className="my-3 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/90 text-xs sm:text-sm font-mono shadow-sm"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-xs">
                <span className="text-slate-400 font-medium lowercase">{block.lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(block.content, idx)}
                  aria-label="Copy code block"
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-emerald-200/90 font-mono text-[13px] leading-normal selection:bg-emerald-800">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={idx} className="text-slate-200">
            {renderInline(block.content)}
          </div>
        );
      })}
    </div>
  );
};
