import { useEffect, useRef, useState } from 'react';
import {
  AtSign,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Diamond,
  Link2,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Rows3,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react';

import { ModalShell } from './EditorToolModalShell';
import {
  EDITOR_GRID_LINE_LEFT_OFFSET_PX,
  EDITOR_GRID_LINE_RIGHT_OFFSET_PX,
  getEditorGridLineStyle,
  getEditorTextLineHeight,
  getStoredHighFreqHighlightColor,
  getStoredHighFreqWords,
  getStoredSymbolReplaceSettings,
  HIGH_FREQ_HIGHLIGHT_COLOR_KEY,
  HIGH_FREQ_WORDS_KEY,
  highFreqHighlightColorOptions,
  isHighFreqEnabled,
  isSymbolReplaceEnabled,
  LEGACY_HIGH_FREQ_WORDS_KEY,
  setHighFreqEnabled,
  setSymbolReplaceEnabled,
  SYMBOL_REPLACE_KEY,
  writeJson,
} from './editorToolState';
import type { FontSettings, SymbolReplaceRule } from './editorToolState';

export function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 py-2.5 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
      </div>
      <Switch checked={checked} onClick={() => onChange(!checked)} />
    </div>
  );
}

export function Switch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2 py-1.5" title={checked ? '已启用，点击关闭' : '未启用，点击开启'}>
      <div className={`relative h-4 w-7 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-gray-300'}`}>
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`}
        />
      </div>
    </button>
  );
}

export function HighFreqModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [words, setWords] = useState<string[]>(getStoredHighFreqWords);
  const [input, setInput] = useState('');
  const [highlightColor, setHighlightColor] = useState(getStoredHighFreqHighlightColor);

  useEffect(() => {
    if (isOpen) {
      setWords(getStoredHighFreqWords());
      setHighlightColor(getStoredHighFreqHighlightColor());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addWords = () => {
    const nextWords = input
      .split(/[,，\n]+/)
      .map((word) => word.trim())
      .filter((word) => word && !words.includes(word));
    if (nextWords.length) setWords((prev) => [...prev, ...nextWords]);
    setInput('');
  };

  return (
    <ModalShell
      title="词语替换设置"
      icon={<BarChart3 className="h-4 w-4 text-brand" />}
      onClose={onClose}
      widthClass="w-[480px]"
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
        <div>
          <p className="mb-2 text-sm text-gray-700">添加需要替换的词语</p>
          <div className="mb-3 min-h-[60px] rounded-md border border-gray-200 bg-white p-3">
            {words.length === 0 ? (
              <p className="py-2 text-center text-sm text-gray-400">暂无替换词，请在下方添加</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {words.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                  >
                    {word}
                    <button
                      onClick={() => setWords((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addWords();
              }}
              placeholder="请输入需要替换的词语"
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              onClick={addWords}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            >
              添加
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">用逗号或换行分隔多个词。</p>
        </div>
        <div>
          <p className="mb-2 text-sm text-gray-700">替换词标记颜色</p>
          <div className="grid grid-cols-4 gap-2">
            {highFreqHighlightColorOptions.map((option) => {
              const selected = highlightColor === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHighlightColor(option.value)}
                  className={`flex h-10 items-center gap-2 rounded-lg border px-2 text-xs font-bold transition-colors ${
                    selected
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand/40'
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-md border border-black/10"
                    style={{ backgroundColor: option.value }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={() => {
            writeJson(HIGH_FREQ_WORDS_KEY, words);
            writeJson(LEGACY_HIGH_FREQ_WORDS_KEY, words);
            writeJson(HIGH_FREQ_HIGHLIGHT_COLOR_KEY, highlightColor);
            window.dispatchEvent(new CustomEvent('xinyuexia_high_freq_updated'));
            onClose();
          }}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
        >
          保存
        </button>
      </div>
    </ModalShell>
  );
}

export function HighFreqToggle() {
  const [enabled, setEnabled] = useState(isHighFreqEnabled);

  useEffect(() => {
    const sync = () => setEnabled(isHighFreqEnabled());
    window.addEventListener('xinyuexia_high_freq_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('xinyuexia_high_freq_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setHighFreqEnabled(next);
    window.dispatchEvent(new CustomEvent('xinyuexia_high_freq_updated'));
  };
  return <Switch checked={enabled} onClick={toggle} />;
}

export function SymbolReplaceToggle({ onEnable }: { onEnable?: () => void }) {
  const [enabled, setEnabled] = useState(isSymbolReplaceEnabled);

  useEffect(() => {
    const sync = () => setEnabled(isSymbolReplaceEnabled());
    window.addEventListener('xinyuexia_symbol_replace_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('xinyuexia_symbol_replace_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSymbolReplaceEnabled(next);
    if (next) onEnable?.();
  };

  return <Switch checked={enabled} onClick={toggle} />;
}

export function SymbolReplaceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState<SymbolReplaceRule[]>(getStoredSymbolReplaceSettings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSettings(getStoredSymbolReplaceSettings());
    setMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSettings = (next = settings) => {
    writeJson(SYMBOL_REPLACE_KEY, next);
    window.dispatchEvent(new CustomEvent('xinyuexia_symbol_replace_updated'));
  };

  const addRule = () => {
    setSettings((prev) => [...prev, { id: `symbol-rule-${Date.now()}-${prev.length}`, from: '', to: '' }]);
  };

  const updateRule = (id: string, field: 'from' | 'to', value: string) => {
    setSettings((prev) => prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  const removeRule = (id: string) => {
    setSettings((prev) => prev.filter((rule) => rule.id !== id));
  };

  return (
    <ModalShell title="文字替换" onClose={onClose} widthClass="w-[520px]" closeOnBackdrop={false}>
      <div className="flex max-h-[72vh] flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_78px] gap-3 px-7 pb-2 pt-5">
          <span className="text-sm font-bold text-gray-700">原文</span>
          <span className="text-sm font-bold text-gray-700">替换为</span>
          <span />
        </div>

        <div className="mx-7 min-h-[120px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/40">
          <div className="editor-scrollbar max-h-[260px] overflow-y-auto p-3">
            {settings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-400">
                暂无文字替换规则
              </div>
            ) : (
              <div className="space-y-3">
                {settings.map((rule) => (
                  <div key={rule.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_78px] gap-3">
                    <input
                      value={rule.from}
                      onChange={(event) => updateRule(rule.id, 'from', event.target.value)}
                      placeholder="例如 ——、……、某个词"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-brand"
                    />
                    <input
                      value={rule.to}
                      onChange={(event) => updateRule(rule.id, 'to', event.target.value)}
                      placeholder="例如 ……"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-brand"
                    />
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-7 py-3">
          <p className="text-xs leading-5 text-gray-400">自动模式下输入和粘贴正文时会自动替换。</p>
          {message && <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">{message}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-4 pr-10">
          <button
            onClick={addRule}
            className="h-11 min-w-[124px] rounded-xl border border-brand px-5 text-base font-bold text-brand hover:bg-brand-light"
          >
            新增规则
          </button>
          <button
            onClick={() => {
              saveSettings();
              setMessage('已保存规则');
            }}
            className="h-11 min-w-[124px] rounded-xl bg-brand px-5 text-base font-bold text-white hover:bg-brand-dark"
          >
            保存规则
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function HighlightOverlay({
  content,
  fontSettings,
  scrollTop = 0,
}: {
  content: string;
  fontSettings: FontSettings;
  scrollTop?: number;
}) {
  const [words, setWords] = useState<string[]>(getStoredHighFreqWords);
  const [enabled, setEnabled] = useState(isHighFreqEnabled);
  const [highlightColor, setHighlightColor] = useState(getStoredHighFreqHighlightColor);
  const editorGridLineStyle = getEditorGridLineStyle(fontSettings);
  const editorTextLineHeight = getEditorTextLineHeight(fontSettings);

  useEffect(() => {
    const sync = () => {
      setWords(getStoredHighFreqWords());
      setEnabled(isHighFreqEnabled());
      setHighlightColor(getStoredHighFreqHighlightColor());
    };
    window.addEventListener('xinyuexia_high_freq_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('xinyuexia_high_freq_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!content || !enabled || words.length === 0) return null;
  const editorTextPaddingLeft = `${EDITOR_GRID_LINE_LEFT_OFFSET_PX}px`;
  const editorTextPaddingRight = `${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px`;
  const shouldHighlightWords = enabled && words.length > 0;
  const escaped = shouldHighlightWords
    ? [...words].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    : [];
  const regex = escaped.length > 0 ? new RegExp(`(${escaped.join('|')})`, 'g') : null;
  const wordSet = new Set(words);
  const highlightOption =
    highFreqHighlightColorOptions.find((option) => option.value === highlightColor) ?? highFreqHighlightColorOptions[0];
  const lines = content.split('\n');

  return (
    <div
      className="xy-wa-editor-text-layer pointer-events-none absolute inset-0 z-0 overflow-hidden whitespace-pre-wrap break-words pb-6 pt-3 text-transparent"
      style={{
        ...editorGridLineStyle,
        fontFamily: fontSettings.fontFamily,
        color: 'transparent',
        fontSize: `${fontSettings.fontSize}px`,
        lineHeight: editorTextLineHeight,
        paddingLeft: editorTextPaddingLeft,
        paddingRight: editorTextPaddingRight,
        transform: `translateY(-${scrollTop}px)`,
      }}
    >
      {lines.map((line, lineIndex) => {
        const parts = regex ? line.split(regex) : [line || '\u00A0'];
        return (
          <span key={lineIndex}>
            {parts.map((part, partIndex) =>
              wordSet.has(part) ? (
                <span
                  key={partIndex}
                  className="rounded-sm text-transparent"
                  style={{
                    backgroundColor: highlightOption.value,
                    boxShadow: `0 0 0 1px ${highlightOption.ring}`,
                  }}
                >
                  {part}
                </span>
              ) : (
                <span key={partIndex}>{part}</span>
              ),
            )}
          </span>
        );
      })}
    </div>
  );
}
