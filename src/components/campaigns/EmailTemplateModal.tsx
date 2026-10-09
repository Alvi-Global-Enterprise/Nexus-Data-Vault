'use client';

import React, { useState } from 'react';
import { X, Check, Eye, Code, Sparkles, Send, Copy, ArrowRight, Layout } from 'lucide-react';
import { EMAIL_TEMPLATES } from '@/lib/templates/emailTemplates';
import { EmailTemplate } from '@/types/api';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EmailTemplate) => void;
  initialSelectedId?: string;
}

export function EmailTemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  initialSelectedId = 'saas_launch',
}: EmailTemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialSelectedId);
  const [previewTab, setPreviewTab] = useState<'visual' | 'code'>('visual');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentTemplate =
    EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentTemplate.htmlContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApply = () => {
    onSelectTemplate(currentTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] rounded-3xl border border-white/10 bg-[#0b101f] shadow-2xl shadow-cyan-950/40 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0e1529]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070b16]">
                <Layout className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  High-Converting Email Templates
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  4 Samples Available
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select a professionally engineered responsive template for your campaign.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Picker + Right Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Template Cards List (4 cols) */}
          <div className="lg:col-span-4 border-r border-white/10 bg-[#090d1a] p-4 overflow-y-auto space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Select Design Framework
            </div>

            {EMAIL_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${tmpl.badgeColor}`}
                    >
                      {tmpl.badge}
                    </span>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-slate-950">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 leading-snug">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {tmpl.description}
                  </p>

                  <div className="rounded-lg bg-black/30 border border-white/5 p-2 font-mono text-[11px] text-slate-300 truncate">
                    <span className="text-cyan-400 font-bold">Subj:</span> {tmpl.subjectDefault}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Interactive Preview & Code (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[#070b16] overflow-hidden">
            
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-[#0d1326]">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPreviewTab('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === 'visual'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Interactive Preview</span>
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === 'code'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>HTML Source</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {previewTab === 'code' && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedCode ? 'Copied HTML!' : 'Copy Code'}</span>
                  </button>
                )}

                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
                >
                  <span>Select & Apply Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Template Preview Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950/60">
              {previewTab === 'visual' ? (
                <div className="w-full max-w-[620px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#0b0f19]">
                  <iframe
                    title="Template Preview"
                    srcDoc={currentTemplate.htmlContent}
                    className="w-full h-[650px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl border border-white/10 bg-[#090d1a] p-4 overflow-auto">
                  <pre className="font-mono text-xs text-cyan-300 whitespace-pre-wrap leading-relaxed">
                    {currentTemplate.htmlContent}
                  </pre>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-[#0a0f1f] text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Variables supported: <code className="text-cyan-300 font-mono">{"{{firstName}}"}</code>, <code className="text-cyan-300 font-mono">{"{{company}}"}</code>, <code className="text-cyan-300 font-mono">{"{{email}}"}</code></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-cyan-400 transition-all"
            >
              <span>Use This Template</span>
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmailTemplateModal;
