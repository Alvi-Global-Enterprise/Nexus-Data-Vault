'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Eraser,
  RotateCcw,
  RotateCw,
  Code,
  Eye,
  Sparkles,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  dynamicTags?: { label: string; tag: string }[];
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your email here...',
  minHeight = '240px',
  disabled = false,
  dynamicTags = [
    { label: 'First Name', tag: '{{ firstName }}' },
    { label: 'Last Name', tag: '{{ lastName }}' },
    { label: 'Company', tag: '{{ company }}' },
    { label: 'Email', tag: '{{ email }}' },
  ],
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || '');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  // Keep rawHtml in sync with value
  useEffect(() => {
    setRawHtml(value || '');
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Update active format state on selection change
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  }, []);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (disabled || isCodeView) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    updateActiveFormats();
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      onChange(html);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setRawHtml(html);
    onChange(html);
    updateActiveFormats();
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setRawHtml(html);
    onChange(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  };

  const handleInsertTag = (tag: string) => {
    if (disabled) return;
    if (isCodeView) {
      setRawHtml((prev) => `${prev} ${tag}`);
      onChange(`${rawHtml} ${tag}`);
      return;
    }

    editorRef.current?.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(` ${tag} `);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      document.execCommand('insertText', false, ` ${tag} `);
    }

    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      onChange(html);
    }
  };

  const handleAddLink = () => {
    const url = prompt('Enter destination URL (e.g. https://example.com):', 'https://');
    if (url && url !== 'https://') {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e1c] overflow-hidden shadow-xl transition-all focus-within:border-cyan-500/50">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 bg-[#0c1326] px-3 py-2 text-xs">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Heading / Style Selector */}
          <select
            disabled={disabled || isCodeView}
            onChange={(e) => {
              const val = e.target.value;
              executeCommand('formatBlock', val);
              e.target.value = '';
            }}
            defaultValue=""
            className="rounded-lg border border-white/10 bg-[#090e1c] px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
          >
            <option value="" disabled>
              Heading Style
            </option>
            <option value="<p>">Normal Paragraph</option>
            <option value="<h1>">Large Heading (H1)</option>
            <option value="<h2>">Medium Heading (H2)</option>
            <option value="<h3>">Small Heading (H3)</option>
            <option value="<blockquote>">Quote Block</option>
          </select>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            title="Bold"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('bold')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.bold
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <Bold className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            title="Italic"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('italic')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.italic
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Underline"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('underline')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.underline
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <Underline className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Strikethrough"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('strikeThrough')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.strikeThrough
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="Bulleted List"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('insertUnorderedList')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.insertUnorderedList
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Numbered List"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('insertOrderedList')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.insertOrderedList
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Blockquote"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            title="Align Left"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('justifyLeft')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.justifyLeft
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Align Center"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('justifyCenter')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.justifyCenter
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Align Right"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('justifyRight')}
            className={`p-1.5 rounded-lg transition-all ${
              activeFormats.justifyRight
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } disabled:opacity-40`}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Link / Unlink */}
          <button
            type="button"
            title="Insert Link"
            disabled={disabled || isCodeView}
            onClick={handleAddLink}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Remove Link"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('unlink')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Clear Formatting"
            disabled={disabled || isCodeView}
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View Toggle (Visual vs Raw HTML) */}
        <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() => setIsCodeView(!isCodeView)}
            title={isCodeView ? 'Switch to Visual WYSIWYG Editor' : 'Switch to Raw HTML Code'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              isCodeView
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isCodeView ? (
              <>
                <Eye className="h-3 w-3" />
                <span>Visual Mode</span>
              </>
            ) : (
              <>
                <Code className="h-3 w-3" />
                <span>HTML Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Tags Bar */}
      {dynamicTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 bg-[#080d19] px-3 py-1.5 text-[10px]">
          <span className="text-slate-500 font-mono flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
            <span>Click to insert tag:</span>
          </span>
          {dynamicTags.map((t) => (
            <button
              key={t.tag}
              type="button"
              disabled={disabled}
              onClick={() => handleInsertTag(t.tag)}
              className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all active:scale-95 disabled:opacity-40"
              title={`Click to insert ${t.label} tag into your email`}
            >
              + {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="relative p-4 bg-[#070b16]">
        {isCodeView ? (
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            disabled={disabled}
            placeholder="<p>Write your raw email HTML here...</p>"
            style={{ minHeight }}
            className="w-full bg-transparent font-mono text-xs text-white placeholder-slate-600 focus:outline-none resize-y"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            style={{ minHeight }}
            className="w-full text-xs text-white placeholder-slate-500 focus:outline-none overflow-y-auto leading-relaxed prose prose-invert max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_a]:text-cyan-400 [&_a]:underline"
          />
        )}

        {/* Empty placeholder helper */}
        {!isCodeView && !rawHtml && (
          <div className="pointer-events-none absolute top-4 left-4 text-xs text-slate-600 font-sans">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

export default RichTextEditor;
