import type { CSSProperties } from 'react';

export interface FormatOptions {
  paragraphIndent: boolean;
  mergeParagraphs: boolean;
}

export type EditorGridLineMode = 'none' | 'solid' | 'dashed';

export interface FontSettings {
  fontFamily: string;
  fontColor: string;
  fontSize: number;
  lineHeight: number;
  gridLineMode: EditorGridLineMode;
  gridLineEnabled?: boolean;
}

export interface SymbolReplaceRule {
  id: string;
  from: string;
  to: string;
}

export interface HistorySnapshot {
  id: string;
  chapterId: number;
  content: string;
  wordCount: number;
  timestamp: string;
  trigger: 'manual' | 'auto';
}

export interface ChapterAssociateItem {
  id: number;
  serialNumber: number;
  wordCount: number;
}

export type GenerateMode = 'opening' | 'continue';

export const FONT_SETTINGS_KEY = 'xinyuexia_font_settings';
export const SMART_FORMAT_KEY = 'xinyuexia_smart_format_settings';
export const SMART_FORMAT_ENABLED_KEY = 'xinyuexia_smart_format_enabled';
export const HIGH_FREQ_WORDS_KEY = 'xinyuexia_high_freq_words';
export const HIGH_FREQ_ENABLED_KEY = 'xinyuexia_high_freq_enabled';
export const HIGH_FREQ_HIGHLIGHT_COLOR_KEY = 'xinyuexia_high_freq_highlight_color';
export const SYMBOL_REPLACE_KEY = 'xinyuexia_symbol_replace_settings';
export const SYMBOL_REPLACE_ENABLED_KEY = 'xinyuexia_symbol_replace_enabled';
export const LEGACY_SMART_FORMAT_KEY = 'smart_format_settings';
export const LEGACY_SMART_FORMAT_ENABLED_KEY = 'smart_format_enabled';
export const LEGACY_HIGH_FREQ_WORDS_KEY = 'high_freq_words';
export const LEGACY_HIGH_FREQ_ENABLED_KEY = 'high_freq_enabled';
export const HISTORY_KEY = 'xinyuexia_editor_history_snapshots';
export const ASSOCIATED_CHAPTERS_KEY = 'xinyuexia_associated_chapters';

export const defaultFontSettings: FontSettings = {
  fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
  fontColor: '#374151',
  fontSize: 22,
  lineHeight: 1.8,
  gridLineMode: 'dashed',
  gridLineEnabled: true,
};

export const EDITOR_GRID_LINE_TOP_OFFSET_PX = 12;
export const EDITOR_GRID_LINE_LEFT_OFFSET_PX = 64;
export const EDITOR_GRID_LINE_RIGHT_OFFSET_PX = 64;
export const EDITOR_GRID_LINE_CANVAS_WIDTH_PX = 3200;
export const EDITOR_GRID_LINE_MASK_COLOR = '#FFFFFF';
export const EDITOR_GRID_LINE_ROW_EXTRA_PX = 20;
export const EDITOR_GRID_LINE_FOOT_GAP_PX = 1;

export const editorGridLineModeOptions: Array<{ value: EditorGridLineMode; label: string }> = [
  { value: 'none', label: '无' },
  { value: 'solid', label: '实线' },
  { value: 'dashed', label: '虚线' },
];

export function normalizeEditorGridLineMode(value: unknown, legacyEnabled?: boolean): EditorGridLineMode {
  if (value === 'none' || value === 'solid' || value === 'dashed') return value;
  return legacyEnabled === false ? 'none' : 'dashed';
}

export function normalizeFontSettings(value: Partial<FontSettings>): FontSettings {
  const gridLineMode = normalizeEditorGridLineMode(value.gridLineMode, value.gridLineEnabled);
  return {
    ...defaultFontSettings,
    ...value,
    gridLineMode,
    gridLineEnabled: gridLineMode !== 'none',
  };
}

export function buildEditorGridLineBackground(
  lineHeightPx: number,
  lineOffsetPx: number,
  mode: Exclude<EditorGridLineMode, 'none'>,
) {
  const stroke = encodeURIComponent('#aab4c0');
  const dash = mode === 'dashed' ? " stroke-dasharray='7 7'" : '';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}' height='${lineHeightPx}' viewBox='0 0 ${EDITOR_GRID_LINE_CANVAS_WIDTH_PX} ${lineHeightPx}'><line x1='${EDITOR_GRID_LINE_LEFT_OFFSET_PX}' y1='${lineOffsetPx}.5' x2='${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}' y2='${lineOffsetPx}.5' stroke='${stroke}' stroke-width='1'${dash}/></svg>`;
  return `url("data:image/svg+xml,${svg}")`;
}

export function getEditorGridLineMetrics(fontSizePx: number) {
  const lineHeightPx = Math.max(fontSizePx + EDITOR_GRID_LINE_ROW_EXTRA_PX, Math.round(fontSizePx * 1.75));
  const lineOffsetPx = lineHeightPx - EDITOR_GRID_LINE_FOOT_GAP_PX;
  return { lineHeightPx, lineOffsetPx };
}

export function getEditorTextLineHeight(fontSettings: FontSettings) {
  const gridLineMode = normalizeEditorGridLineMode(fontSettings.gridLineMode, fontSettings.gridLineEnabled);
  if (gridLineMode === 'none') return fontSettings.lineHeight;
  return `${getEditorGridLineMetrics(fontSettings.fontSize).lineHeightPx}px`;
}

export function getEditorGridLineStyle(fontSettings: FontSettings, scrollTop = 0): CSSProperties {
  const gridLineMode = normalizeEditorGridLineMode(fontSettings.gridLineMode, fontSettings.gridLineEnabled);
  if (gridLineMode === 'none') return {};
  const { lineHeightPx, lineOffsetPx } = getEditorGridLineMetrics(fontSettings.fontSize);
  const repeatedTopLineMaskHeightPx = Math.max(0, EDITOR_GRID_LINE_TOP_OFFSET_PX + lineOffsetPx - lineHeightPx + 4);
  return {
    backgroundImage: `linear-gradient(${EDITOR_GRID_LINE_MASK_COLOR}, ${EDITOR_GRID_LINE_MASK_COLOR}), linear-gradient(${EDITOR_GRID_LINE_MASK_COLOR}, ${EDITOR_GRID_LINE_MASK_COLOR}), ${buildEditorGridLineBackground(lineHeightPx, lineOffsetPx, gridLineMode)}`,
    backgroundPosition: `left 0, right 0, 0 ${EDITOR_GRID_LINE_TOP_OFFSET_PX - scrollTop}px`,
    backgroundRepeat: 'no-repeat, no-repeat, repeat-y',
    backgroundSize: `100% ${repeatedTopLineMaskHeightPx}px, ${EDITOR_GRID_LINE_RIGHT_OFFSET_PX}px 100%, ${EDITOR_GRID_LINE_CANVAS_WIDTH_PX}px ${lineHeightPx}px`,
  };
}

export const defaultFormatOptions: FormatOptions = {
  paragraphIndent: false,
  mergeParagraphs: true,
};

export const fontOptions = [
  { label: '默认字体', value: 'PingFang SC, Microsoft YaHei, sans-serif' },
  { label: '宋体', value: 'SimSun, Songti SC, serif' },
  { label: '黑体', value: 'SimHei, Heiti SC, sans-serif' },
];

export const colorOptions = [
  '#374151',
  '#111827',
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#059669',
  '#0891B2',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
];

export const highFreqHighlightColorOptions = [
  { label: '暖黄', value: '#FDE68A', ring: 'rgba(234,179,8,0.35)' },
  { label: '浅橙', value: '#FED7AA', ring: 'rgba(249,115,22,0.30)' },
  { label: '浅青', value: '#BDEEF7', ring: 'rgba(8,170,206,0.30)' },
  { label: '浅绿', value: '#BBF7D0', ring: 'rgba(34,197,94,0.30)' },
  { label: '浅蓝', value: '#BFDBFE', ring: 'rgba(37,99,235,0.28)' },
  { label: '浅紫', value: '#DDD6FE', ring: 'rgba(124,58,237,0.28)' },
  { label: '浅粉', value: '#FBCFE8', ring: 'rgba(219,39,119,0.25)' },
  { label: '浅灰', value: '#E5E7EB', ring: 'rgba(100,116,139,0.24)' },
];

export const defaultHighFreqHighlightColor = highFreqHighlightColorOptions[0].value;

export function normalizeHighFreqHighlightColor(value: unknown) {
  return highFreqHighlightColorOptions.some((option) => option.value === value)
    ? String(value)
    : defaultHighFreqHighlightColor;
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredFontSettings(): FontSettings {
  return normalizeFontSettings(readJson<Partial<FontSettings>>(FONT_SETTINGS_KEY, {}));
}

export function getStoredFormatSettings(): FormatOptions {
  return {
    ...defaultFormatOptions,
    ...readJson<Partial<FormatOptions>>(LEGACY_SMART_FORMAT_KEY, {}),
    ...readJson<Partial<FormatOptions>>(SMART_FORMAT_KEY, {}),
  };
}

export function isSmartFormatEnabled() {
  if (localStorage.getItem(SMART_FORMAT_ENABLED_KEY) !== null) {
    return readJson<boolean>(SMART_FORMAT_ENABLED_KEY, false);
  }
  return readJson<boolean>(LEGACY_SMART_FORMAT_ENABLED_KEY, false);
}

export function setSmartFormatEnabled(value: boolean) {
  writeJson(SMART_FORMAT_ENABLED_KEY, value);
  writeJson(LEGACY_SMART_FORMAT_ENABLED_KEY, value);
  window.dispatchEvent(new CustomEvent('xinyuexia_smart_format_updated'));
}

export function normalizeSymbolReplaceRules(value: unknown): SymbolReplaceRule[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const rule = item as Partial<SymbolReplaceRule>;
      return {
        id: typeof rule.id === 'string' ? rule.id : `symbol-rule-${index}`,
        from: typeof rule.from === 'string' ? rule.from : '',
        to: typeof rule.to === 'string' ? rule.to : '',
      };
    });
  }
  if (value && typeof value === 'object') {
    const item = value as Partial<SymbolReplaceRule>;
    return [
      {
        id: `symbol-rule-${Date.now()}`,
        from: item.from ?? '',
        to: item.to ?? '',
      },
    ];
  }
  return [];
}

export function getStoredSymbolReplaceSettings(): SymbolReplaceRule[] {
  return normalizeSymbolReplaceRules(readJson<unknown>(SYMBOL_REPLACE_KEY, []));
}

export function isSymbolReplaceEnabled() {
  return readJson<boolean>(SYMBOL_REPLACE_ENABLED_KEY, false);
}

export function setSymbolReplaceEnabled(value: boolean) {
  writeJson(SYMBOL_REPLACE_ENABLED_KEY, value);
  window.dispatchEvent(new CustomEvent('xinyuexia_symbol_replace_updated'));
}

export function applySymbolReplace(text: string, settings = getStoredSymbolReplaceSettings()) {
  return settings.reduce((result, rule) => {
    if (!rule.from || rule.from === rule.to) return result;
    return result.split(rule.from).join(rule.to);
  }, text);
}

export function stripLineIndents(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[\u3000 ]+/, ''))
    .join('\n');
}

export function applyParagraphIndentToText(text: string, enabled: boolean) {
  const stripped = stripLineIndents(text);
  if (!enabled) return stripped;
  return stripped
    .split('\n')
    .map((line) => (line.trim() ? `\u3000\u3000${line}` : line))
    .join('\n');
}

export function removeParagraphInnerFullWidthSpaces(text: string) {
  return text
    .split('\n')
    .map((line) => {
      const leadingMatch = line.match(/^[\u3000 ]+/);
      const leading = leadingMatch?.[0] ?? '';
      return `${leading}${line.slice(leading.length).replace(/\u3000{2,}/g, '')}`;
    })
    .join('\n');
}

export function getStoredHighFreqWords() {
  return [...readJson<string[]>(LEGACY_HIGH_FREQ_WORDS_KEY, []), ...readJson<string[]>(HIGH_FREQ_WORDS_KEY, [])].filter(
    (word, index, list) => word && list.indexOf(word) === index,
  );
}

export function isHighFreqEnabled() {
  if (localStorage.getItem(HIGH_FREQ_ENABLED_KEY) !== null) {
    return readJson<boolean>(HIGH_FREQ_ENABLED_KEY, false);
  }
  return readJson<boolean>(LEGACY_HIGH_FREQ_ENABLED_KEY, false);
}

export function setHighFreqEnabled(value: boolean) {
  writeJson(HIGH_FREQ_ENABLED_KEY, value);
  writeJson(LEGACY_HIGH_FREQ_ENABLED_KEY, value);
}

export function getStoredHighFreqHighlightColor() {
  return normalizeHighFreqHighlightColor(
    readJson<string>(HIGH_FREQ_HIGHLIGHT_COLOR_KEY, defaultHighFreqHighlightColor),
  );
}

export function applyFormat(text: string, options: FormatOptions) {
  if (!text.trim()) return '';
  let result = stripLineIndents(text);
  result = removeParagraphInnerFullWidthSpaces(result);
  result = result.replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2');
  result = result.replace(/(\d)\s+(\d)/g, '$1$2');
  if (options.mergeParagraphs) {
    result = result
      .replace(/\n{2,}/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }
  result = applyParagraphIndentToText(result, options.paragraphIndent);
  return result;
}

export function applyFormatWithCursor(text: string, cursorPos: number, options: FormatOptions) {
  const formatted = applyFormat(text, options);
  if (formatted === text) return { text, cursorPos };

  const anchor = text.slice(Math.max(0, cursorPos - 10), cursorPos);
  if (anchor) {
    const anchorIndex = formatted.indexOf(anchor);
    if (anchorIndex >= 0) {
      return { text: formatted, cursorPos: anchorIndex + anchor.length };
    }
  }

  const ratio = text.length > 0 ? cursorPos / text.length : 1;
  return {
    text: formatted,
    cursorPos: Math.max(0, Math.min(formatted.length, Math.round(formatted.length * ratio))),
  };
}

export function loadSnapshots() {
  return readJson<Record<string, HistorySnapshot[]>>(HISTORY_KEY, {});
}

export function saveSnapshot(chapterId: number, content: string) {
  if (!content.trim()) return;
  const all = loadSnapshots();
  const key = String(chapterId);
  const list = all[key] ?? [];
  const now = Date.now();
  const last = list[list.length - 1];
  if (last && now - Number(last.id) < 5 * 60 * 1000) return;
  const date = new Date(now);
  const timestamp = date.toLocaleString('zh-CN', { hour12: false });
  const snapshot: HistorySnapshot = {
    id: String(now),
    chapterId,
    content,
    wordCount: content.replace(/\s/g, '').length,
    timestamp,
    trigger: 'auto',
  };
  all[key] = [...list, snapshot].slice(-20);
  writeJson(HISTORY_KEY, all);
}
