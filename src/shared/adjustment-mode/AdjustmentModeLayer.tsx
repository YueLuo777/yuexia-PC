import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Download, Grid3X3, Lock, MousePointer2, Move, Palette, Plus, RotateCcw, Save, Settings, Trash2, Unlock, X } from 'lucide-react';

import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import {
  ADJUSTMENT_MODE_UPDATED_EVENT,
  ADJUSTMENT_PRESETS,
  ADJUSTMENT_SHORTCUT_ACTIONS,
  addAdjustmentHistoryEntry,
  addAdjustmentCustomButton,
  adjustmentShortcutFromKeyboardEvent,
  clearAdjustmentHistoryEntries,
  formatAdjustmentShortcut,
  isAdjustmentModeEnabled,
  makeAdjustmentExportPackage,
  matchesAdjustmentShortcut,
  parseAdjustmentCustomButtonsImportPackage,
  parseAdjustmentImportPackage,
  readAdjustmentCustomButtons,
  readAdjustmentHistoryEntries,
  readAdjustmentRules,
  readAdjustmentShortcuts,
  removeAdjustmentCustomButton,
  removeAdjustmentRule,
  resetAdjustmentShortcuts,
  restoreAdjustmentHistoryEntry,
  saveAdjustmentCustomButtons,
  saveAdjustmentRules,
  saveAdjustmentShortcuts,
  setAdjustmentModeEnabled,
  updateAdjustmentCustomButton,
  upsertAdjustmentRule,
  type AdjustmentApplyScope,
  type AdjustmentCustomButton,
  type AdjustmentHistoryEntry,
  type AdjustmentPreset,
  type AdjustmentRule,
  type AdjustmentShortcutId,
  type AdjustmentStylePatch,
} from '@/shared/adjustment-mode/adjustmentModeStore';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { readTextEditMode, setTextEditMode, TEXT_EDIT_MODE_EVENT } from '@/shared/text-overrides/textOverrideStore';

type TargetInfo = {
  targetKey: string;
  label: string;
  route: string;
  selector: string;
  tagName: string;
  originalText: string;
  classSignature: string;
  defaultScope: AdjustmentApplyScope;
};

type ElementBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DragState = {
  type: 'move' | 'resize';
  startX: number;
  startY: number;
  baseStyles: AdjustmentStylePatch;
  beforeRule: AdjustmentRule | null;
  startRect: DOMRect;
};

type PanelDragState = {
  startX: number;
  startY: number;
  startTop: number;
  startRight: number;
};

type GuideState = {
  x?: number;
  y?: number;
  label?: string;
};

const ADJUSTMENT_QUERY_RE = /[?&]adjustment=1/i;
const SNAP_THRESHOLD = 6;
const GRID_SIZE = 8;
const STYLE_KEYS: Array<keyof AdjustmentStylePatch> = [
  'fontSize',
  'color',
  'backgroundColor',
  'width',
  'height',
  'borderRadius',
  'paddingX',
  'paddingY',
  'offsetX',
  'offsetY',
  'opacity',
  'hidden',
];

const SCOPE_OPTIONS: Array<{ value: AdjustmentApplyScope; label: string; desc: string }> = [
  { value: 'single', label: '仅此元素', desc: '只调整当前选中的控件。' },
  { value: 'sameTextPage', label: '本页同文案', desc: '调整本页中相同文案的控件。' },
  { value: 'sameTextGlobal', label: '全局同文案', desc: '调整全应用中相同文案的控件。' },
  { value: 'sameKindPage', label: '本页同样式', desc: '调整本页中外观相似的控件。' },
  { value: 'sameKindGlobal', label: '全局同样式', desc: '调整全应用中外观相似的控件。' },
  { value: 'sameTagPage', label: '本页同类型', desc: '调整本页中相同类型的控件。' },
  { value: 'sameTagGlobal', label: '全局同类型', desc: '调整全应用中相同类型的控件。' },
];

function nowId() {
  return `adjust-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCurrentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  const route = hash.split('?')[0] || window.location.pathname || '/dashboard';
  return route.startsWith('/') ? route : `/${route}`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function getElementText(element: HTMLElement) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element.placeholder || element.value || element.name;
  if (element instanceof HTMLSelectElement) return element.selectedOptions[0]?.textContent || element.name;
  return normalizeText(element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '');
}

function makeLabel(element: HTMLElement) {
  const text = getElementText(element);
  if (text) return text.slice(0, 36);
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  return role ? `${tag}[${role}]` : tag;
}

function getElementIndex(element: Element) {
  const parent = element.parentElement;
  if (!parent) return 1;
  const sameTag = Array.from(parent.children).filter((item) => item.tagName === element.tagName);
  return Math.max(1, sameTag.indexOf(element) + 1);
}

function getClassSignature(element: HTMLElement) {
  const value = typeof element.className === 'string' ? element.className : '';
  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^(hover|focus|active|disabled|group-hover|sm|md|lg|xl|2xl):/.test(item))
    .sort()
    .slice(0, 30)
    .join(' ');
}

function getDefaultScope(element: HTMLElement): AdjustmentApplyScope {
  const text = getElementText(element);
  if (text && ['button', 'a', 'label'].includes(element.tagName.toLowerCase())) return 'sameTextGlobal';
  return 'single';
}

function buildCssSelector(element: HTMLElement) {
  const directId = element.getAttribute('data-ui-adjust-id') || element.id;
  if (directId) {
    const attr = element.getAttribute('data-ui-adjust-id') ? 'data-ui-adjust-id' : 'id';
    return `[${attr}="${CSS.escape(directId)}"]`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== document.body && current.id !== 'root') {
    const tag = current.tagName.toLowerCase();
    parts.unshift(`${tag}:nth-of-type(${getElementIndex(current)})`);
    current = current.parentElement;
  }
  return `#root ${parts.join(' > ')}`;
}

function pickAdjustableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null;
  if (target.closest('[data-adjustment-internal="true"]')) return null;
  const customButton = target.closest<HTMLElement>('[data-adjustment-custom-button="true"]');
  if (customButton) return customButton;
  if (target.closest('[data-adjustment-panel="true"]')) return null;
  const preferred = target.closest<HTMLElement>(
    'button,input,textarea,select,a,[role="button"],[data-ui-adjust-id],label,.workspace-tab',
  );
  const element = preferred ?? target;
  if (!element || element === document.body || element === document.documentElement) return null;
  if (element.closest('script,style')) return null;
  return element;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));
}

function targetInfoFromElement(element: HTMLElement): TargetInfo {
  const route = getCurrentRoute();
  const selector = buildCssSelector(element);
  const originalText = getElementText(element);
  return {
    targetKey: `${route}|${selector}`,
    label: makeLabel(element),
    route,
    selector,
    tagName: element.tagName.toLowerCase(),
    originalText,
    classSignature: getClassSignature(element),
    defaultScope: getDefaultScope(element),
  };
}

function isGlobalScope(scope: AdjustmentApplyScope) {
  return scope === 'sameTextGlobal' || scope === 'sameKindGlobal' || scope === 'sameTagGlobal';
}

function getRuleCandidates() {
  return Array.from(document.querySelectorAll<HTMLElement>(
    'button,input,textarea,select,a,[role="button"],[data-ui-adjust-id],label,.workspace-tab,[data-adjustment-custom-button="true"]',
  )).filter((item) => (
    item.hasAttribute('data-adjustment-custom-button') ||
    (!item.closest('[data-adjustment-panel="true"]') && !item.closest('[data-adjustment-internal="true"]'))
  ));
}

function matchesRuleScope(element: HTMLElement, rule: AdjustmentRule) {
  const tagName = element.tagName.toLowerCase();
  if (tagName !== rule.tagName) return false;
  if (rule.scope === 'sameTagPage' || rule.scope === 'sameTagGlobal') return true;
  if (rule.scope === 'sameTextPage' || rule.scope === 'sameTextGlobal') {
    return normalizeText(getElementText(element)) === normalizeText(rule.originalText);
  }
  if (rule.scope === 'sameKindPage' || rule.scope === 'sameKindGlobal') {
    return Boolean(rule.classSignature) && getClassSignature(element) === rule.classSignature;
  }
  return false;
}

function findElementsForRule(rule: AdjustmentRule) {
  if (!isGlobalScope(rule.scope) && rule.route && rule.route !== getCurrentRoute()) return [];
  if (rule.scope === 'single') {
    try {
      const element = document.querySelector(rule.selector);
      return element instanceof HTMLElement ? [element] : [];
    } catch {
      return [];
    }
  }
  return getRuleCandidates().filter((element) => matchesRuleScope(element, rule));
}

function findElementForRule(rule: AdjustmentRule) {
  return findElementsForRule(rule)[0] ?? null;
}

function getScopeLabel(scope: AdjustmentApplyScope) {
  return SCOPE_OPTIONS.find((item) => item.value === scope)?.label ?? '仅此元素';
}

function getScopeDescription(scope: AdjustmentApplyScope) {
  return SCOPE_OPTIONS.find((item) => item.value === scope)?.desc ?? '';
}

function getAffectedCount(rule: AdjustmentRule | null) {
  return rule ? findElementsForRule(rule).length : 0;
}

function getStyleActionLabel(key: keyof AdjustmentStylePatch) {
  const labels: Partial<Record<keyof AdjustmentStylePatch, string>> = {
    fontSize: 'Change font size',
    color: 'Change text color',
    backgroundColor: 'Change background',
    width: 'Change width',
    height: 'Change height',
    borderRadius: 'Change radius',
    paddingX: 'Change horizontal padding',
    paddingY: 'Change vertical padding',
    offsetX: 'Change horizontal position',
    offsetY: 'Change vertical position',
    opacity: 'Change opacity',
    hidden: 'Change hidden state',
    presetId: 'Apply UI preset',
  };
  return labels[key] ?? 'Adjust style';
}

function rulesLookSame(beforeRule: AdjustmentRule | null, afterRule: AdjustmentRule | null) {
  return JSON.stringify({
    scope: beforeRule?.scope ?? null,
    styles: beforeRule?.styles ?? null,
  }) === JSON.stringify({
    scope: afterRule?.scope ?? null,
    styles: afterRule?.styles ?? null,
  });
}

function formatHistoryTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function resetAllAdjustedElements() {
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('[data-adjustment-rule-id]'))) resetAdjustedStyles(element);
}

/*
function findElementForRuleLegacy(rule: AdjustmentRule) {
  if (rule.route && rule.route !== getCurrentRoute()) return null;
  try {
    const element = document.querySelector(rule.selector);
    return element instanceof HTMLElement ? element : null;
  } catch {
    return null;
  }
}
*/

function numericStyle(style: CSSStyleDeclaration, key: string) {
  const value = Number.parseFloat(style.getPropertyValue(key));
  return Number.isFinite(value) ? Math.round(value) : undefined;
}

function componentToHex(value: number) {
  return value.toString(16).padStart(2, '0').toUpperCase();
}

function normalizeHexColor(value: string, fallback = '#FFFFFF') {
  const trimmed = value.trim();
  const plain = trimmed.replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(plain)) {
    return `#${plain.split('').map((item) => item + item).join('')}`.toUpperCase();
  }
  if (/^[0-9a-f]{6}$/i.test(plain)) return `#${plain}`.toUpperCase();
  return fallback.toUpperCase();
}

function getValidHexColor(value: string) {
  const plain = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(plain)) return `#${plain.split('').map((item) => item + item).join('')}`.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(plain)) return `#${plain}`.toUpperCase();
  return '';
}

function colorToHex(value: string, fallback = '#FFFFFF') {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3,6}$/i.test(trimmed)) return normalizeHexColor(trimmed, fallback);
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i.exec(trimmed);
  if (!match) return fallback.toUpperCase();
  if (match[4] !== undefined && Number(match[4]) === 0) return fallback.toUpperCase();
  return `#${componentToHex(Number(match[1]))}${componentToHex(Number(match[2]))}${componentToHex(Number(match[3]))}`;
}

function getComputedPatch(element: HTMLElement): AdjustmentStylePatch {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    fontSize: numericStyle(style, 'font-size'),
    color: colorToHex(style.color, '#334155'),
    backgroundColor: colorToHex(style.backgroundColor, '#FFFFFF'),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    borderRadius: numericStyle(style, 'border-top-left-radius'),
    paddingX: numericStyle(style, 'padding-left'),
    paddingY: numericStyle(style, 'padding-top'),
    offsetX: 0,
    offsetY: 0,
    opacity: Number.parseFloat(style.opacity) || 1,
    hidden: false,
  };
}

function resetAdjustedStyles(element: HTMLElement) {
  element.style.fontSize = '';
  element.style.color = '';
  element.style.backgroundColor = '';
  element.style.width = '';
  element.style.height = '';
  element.style.borderRadius = '';
  element.style.paddingLeft = '';
  element.style.paddingRight = '';
  element.style.paddingTop = '';
  element.style.paddingBottom = '';
  element.style.transform = '';
  element.style.opacity = '';
  element.style.display = '';
  element.style.transition = '';
  element.removeAttribute('data-adjustment-rule-id');
}

function applyPatchToElement(element: HTMLElement, styles: AdjustmentStylePatch, ruleId: string) {
  if (element.closest('[data-adjustment-internal="true"]')) return;
  element.setAttribute('data-adjustment-rule-id', ruleId);
  element.style.transition = 'box-shadow 120ms ease, background-color 120ms ease, color 120ms ease';
  if (typeof styles.fontSize === 'number') element.style.fontSize = `${styles.fontSize}px`;
  if (styles.color) element.style.color = styles.color;
  if (styles.backgroundColor) element.style.backgroundColor = styles.backgroundColor;
  if (typeof styles.width === 'number') element.style.width = `${styles.width}px`;
  if (typeof styles.height === 'number') element.style.height = `${styles.height}px`;
  if (typeof styles.borderRadius === 'number') element.style.borderRadius = `${styles.borderRadius}px`;
  if (typeof styles.paddingX === 'number') {
    element.style.paddingLeft = `${styles.paddingX}px`;
    element.style.paddingRight = `${styles.paddingX}px`;
  }
  if (typeof styles.paddingY === 'number') {
    element.style.paddingTop = `${styles.paddingY}px`;
    element.style.paddingBottom = `${styles.paddingY}px`;
  }
  if (typeof styles.opacity === 'number') element.style.opacity = String(styles.opacity);
  const offsetX = styles.offsetX ?? 0;
  const offsetY = styles.offsetY ?? 0;
  if (offsetX || offsetY) element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  else element.style.transform = '';
  if (styles.hidden) element.style.display = 'none';
}

function getBox(element: HTMLElement | null): ElementBox | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function colorDistance(left?: string, right?: string) {
  if (!left || !right) return 0;
  const a = normalizeHexColor(left);
  const b = normalizeHexColor(right);
  if (a === b) return 0;
  const ar = Number.parseInt(a.slice(1, 3), 16);
  const ag = Number.parseInt(a.slice(3, 5), 16);
  const ab = Number.parseInt(a.slice(5, 7), 16);
  const br = Number.parseInt(b.slice(1, 3), 16);
  const bg = Number.parseInt(b.slice(3, 5), 16);
  const bb = Number.parseInt(b.slice(5, 7), 16);
  return Math.min(80, Math.round((Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb)) / 8));
}

function numericDistance(actual: number | undefined, expected: number | undefined, weight = 1) {
  if (typeof actual !== 'number' || typeof expected !== 'number') return 0;
  return Math.abs(actual - expected) * weight;
}

function findClosestPreset(styles: AdjustmentStylePatch, tagName?: string) {
  const candidates = ADJUSTMENT_PRESETS.filter((preset) => (
    tagName === 'button'
      ? preset.styles.backgroundColor || preset.styles.height || preset.styles.paddingX
      : true
  ));
  let best: { preset: AdjustmentPreset; score: number } | null = null;
  for (const preset of candidates) {
    const score =
      colorDistance(styles.backgroundColor, preset.styles.backgroundColor) +
      colorDistance(styles.color, preset.styles.color) +
      numericDistance(styles.fontSize, preset.styles.fontSize, 3) +
      numericDistance(styles.borderRadius, preset.styles.borderRadius, 2) +
      numericDistance(styles.height, preset.styles.height, 0.8) +
      numericDistance(styles.paddingX, preset.styles.paddingX, 1.5) +
      numericDistance(styles.paddingY, preset.styles.paddingY, 1.5);
    if (!best || score < best.score) best = { preset, score };
  }
  return best && best.score <= 58 ? best.preset : null;
}

function getPresetDisplay(preset: AdjustmentPreset | null) {
  return preset ? `${preset.id} - ${preset.name}` : '未匹配到 UI 记录';
}

function makeRule(target: TargetInfo, styles: AdjustmentStylePatch, scope: AdjustmentApplyScope = target.defaultScope): AdjustmentRule {
  const now = new Date().toISOString();
  const { defaultScope: _defaultScope, ...ruleTarget } = target;
  return {
    id: nowId(),
    ...ruleTarget,
    scope,
    styles,
    createdAt: now,
    updatedAt: now,
  };
}

function snapToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function collectAlignmentGuides(selectedElement: HTMLElement, targetRect: DOMRect, deltaX: number, deltaY: number) {
  const moved = {
    left: targetRect.left + deltaX,
    right: targetRect.right + deltaX,
    centerX: targetRect.left + deltaX + targetRect.width / 2,
    top: targetRect.top + deltaY,
    bottom: targetRect.bottom + deltaY,
    centerY: targetRect.top + deltaY + targetRect.height / 2,
  };
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('button,input,textarea,select,a,[role="button"],.workspace-tab,[data-ui-adjust-id]'))
    .filter((item) => (
      item !== selectedElement
      && (item.hasAttribute('data-adjustment-custom-button') || !item.closest('[data-adjustment-panel="true"]'))
      && !item.closest('[data-adjustment-internal="true"]')
    ));
  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) continue;
    const xLines = [rect.left, rect.right, rect.left + rect.width / 2];
    const yLines = [rect.top, rect.bottom, rect.top + rect.height / 2];
    for (const x of xLines) {
      if ([moved.left, moved.right, moved.centerX].some((line) => Math.abs(line - x) <= SNAP_THRESHOLD)) return { x, label: '对齐' };
    }
    for (const y of yLines) {
      if ([moved.top, moved.bottom, moved.centerY].some((line) => Math.abs(line - y) <= SNAP_THRESHOLD)) return { y, label: '对齐' };
    }
  }
  return {};
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number | undefined;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 text-xs font-black text-slate-700">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ''}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : undefined);
        }}
        className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-black text-slate-700 outline-none focus:border-brand"
      />
    </label>
  );
}

function HexColorInput({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | undefined;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const normalized = normalizeHexColor(value ?? fallback, fallback);
  const [draft, setDraft] = useState(normalized);

  useEffect(() => {
    setDraft(normalized);
  }, [normalized]);

  const commit = (next: string) => {
    const upper = next.trim().toUpperCase();
    setDraft(upper);
    const valid = getValidHexColor(upper);
    if (valid) onChange(valid);
  };

  return (
    <label className="text-xs font-black text-slate-700">
      {label}
      <div className="mt-1 grid h-10 grid-cols-[44px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <input
          type="color"
          value={normalized}
          onChange={(event) => commit(event.target.value)}
          className="h-full w-full cursor-pointer border-0 bg-white p-1"
          title={`${label}锛?{normalized}`}
        />
        <input
          value={draft}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setDraft(normalized)}
          onFocus={(event) => event.currentTarget.select()}
          className="h-full border-l border-slate-200 px-2 text-xs font-black uppercase tracking-wide text-slate-700 outline-none focus:bg-brand-light/40"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

function toCssSize(value: number | undefined, fallback: number) {
  return `${value ?? fallback}px`;
}

function PresetPreviewCard({
  preset,
  active,
  onApply,
}: {
  preset: AdjustmentPreset;
  active: boolean;
  onApply: () => void;
}) {
  const styles = preset.styles;
  return (
    <button
      type="button"
      onClick={onApply}
      className={`w-full rounded-xl border p-2 text-left transition ${
        active
          ? 'border-[#08AACE] bg-brand-light shadow-[0_0_0_2px_rgba(8,170,206,0.12)]'
          : 'border-slate-100 bg-white hover:border-[#08AACE]/40 hover:bg-slate-50'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-black text-slate-800">{preset.id} 路 {preset.name}</div>
          <div className="mt-0.5 text-[11px] font-bold text-slate-400">{preset.group}</div>
        </div>
        {active && <span className="rounded-full bg-[#08AACE] px-2 py-0.5 text-[10px] font-black text-white">Active</span>}
      </div>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
        <div
          className="mx-auto flex max-w-full items-center justify-center truncate border border-slate-200"
          style={{
            width: styles.width ? Math.min(styles.width, 190) : undefined,
            minWidth: styles.width ? undefined : 92,
            height: styles.height ? Math.min(styles.height, 46) : 34,
            borderRadius: toCssSize(styles.borderRadius, 10),
            paddingLeft: toCssSize(styles.paddingX, 12),
            paddingRight: toCssSize(styles.paddingX, 12),
            paddingTop: toCssSize(styles.paddingY, 6),
            paddingBottom: toCssSize(styles.paddingY, 6),
            backgroundColor: styles.backgroundColor ?? '#FFFFFF',
            color: styles.color ?? '#334155',
            fontSize: toCssSize(styles.fontSize, 13),
            fontWeight: 900,
          }}
        >
          预设预览
        </div>
      </div>
    </button>
  );
}

export function AdjustmentModeLayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const disableAdjustmentModeOnLaunch = window.xinyuexiaLaunch?.disableAdjustmentMode === true;
  const [enabled, setEnabled] = useState(() => (
    !disableAdjustmentModeOnLaunch && (isAdjustmentModeEnabled() || ADJUSTMENT_QUERY_RE.test(window.location.hash))
  ));
  const [selectMode, setSelectMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [showPresetColumn, setShowPresetColumn] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ top: 80, right: 16 });
  const [showShortcutPanel, setShowShortcutPanel] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [exitLocked, setExitLocked] = useState(true);
  const [rules, setRules] = useState<AdjustmentRule[]>(readAdjustmentRules);
  const [history, setHistory] = useState<AdjustmentHistoryEntry[]>(readAdjustmentHistoryEntries);
  const [customButtons, setCustomButtons] = useState<AdjustmentCustomButton[]>(readAdjustmentCustomButtons);
  const [addButtonMode, setAddButtonMode] = useState(false);
  const [newButtonLabel, setNewButtonLabel] = useState('新按钮');
  const [shortcutBindings, setShortcutBindings] = useState(readAdjustmentShortcuts);
  const [editingShortcutId, setEditingShortcutId] = useState<AdjustmentShortcutId | null>(null);
  const [selected, setSelected] = useState<TargetInfo | null>(null);
  const [selectedComputed, setSelectedComputed] = useState<AdjustmentStylePatch>({});
  const [hoverBox, setHoverBox] = useState<ElementBox | null>(null);
  const [selectedBox, setSelectedBox] = useState<ElementBox | null>(null);
  const [guides, setGuides] = useState<GuideState>({});
  const [message, setMessage] = useState('');
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const panelDragRef = useRef<PanelDragState | null>(null);
  const panelWasDraggedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedRule = useMemo(() => (
    selected ? rules.find((item) => item.targetKey === selected.targetKey) ?? null : null
  ), [rules, selected]);

  const displayStyles = useMemo(() => ({
    ...selectedComputed,
    ...(selectedRule?.styles ?? {}),
  }), [selectedComputed, selectedRule]);
  const selectedScope = selectedRule?.scope ?? selected?.defaultScope ?? 'single';
  const selectedPreset = useMemo(() => (
    ADJUSTMENT_PRESETS.find((preset) => preset.id === selectedRule?.styles.presetId) ?? null
  ), [selectedRule?.styles.presetId]);
  const inferredPreset = useMemo(() => (
    selectedPreset ?? findClosestPreset(displayStyles, selected?.tagName)
  ), [displayStyles, selected?.tagName, selectedPreset]);
  const selectedPreviewRule = selected ? (selectedRule ?? makeRule(selected, {}, selectedScope)) : null;
  const affectedCount = getAffectedCount(selectedPreviewRule);

  const currentRoute = location.pathname;
  const visibleCustomButtons = useMemo(() => (
    customButtons.filter((button) => button.route === currentRoute)
  ), [customButtons, currentRoute]);
  const shortcutPanelActions = useMemo(() => (
    ADJUSTMENT_SHORTCUT_ACTIONS.filter((action) => (
      action.id === 'selectElement' ||
      action.id === 'togglePanel' ||
      action.id === 'restoreCurrent'
    ))
  ), []);

  useEffect(() => {
    if (disableAdjustmentModeOnLaunch) {
      if (isAdjustmentModeEnabled()) setAdjustmentModeEnabled(false);
      setEnabled(false);
      return;
    }
    if (ADJUSTMENT_QUERY_RE.test(window.location.hash)) {
      setAdjustmentModeEnabled(true);
      setEnabled(true);
    }
  }, [disableAdjustmentModeOnLaunch]);

  useEffect(() => {
    const sync = () => {
      if (disableAdjustmentModeOnLaunch) {
        if (isAdjustmentModeEnabled()) setAdjustmentModeEnabled(false);
        setEnabled(false);
        return;
      }
      setEnabled(isAdjustmentModeEnabled());
      setRules(readAdjustmentRules());
      setHistory(readAdjustmentHistoryEntries());
      setCustomButtons(readAdjustmentCustomButtons());
      setShortcutBindings(readAdjustmentShortcuts());
    };
    window.addEventListener(ADJUSTMENT_MODE_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ADJUSTMENT_MODE_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [disableAdjustmentModeOnLaunch]);

  useEffect(() => {
    if (disableAdjustmentModeOnLaunch) return;
    if (enabled) setAdjustmentModeEnabled(true);
  }, [disableAdjustmentModeOnLaunch, enabled]);

  useEffect(() => {
    const handleShortcutAction = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id !== 'toggle_adjustment_mode') return;
      if (enabled) {
        closeAdjustmentMode();
        return;
      }
      setTextEditMode(false);
      setShowPanel(true);
      setShowShortcutPanel(false);
      setAdjustmentModeEnabled(true);
      setEnabled(true);
      setMessage('调整模式已启用。');
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcutAction);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcutAction);
  }, [enabled]);

  useEffect(() => {
    const syncTextEditMode = () => {
      const next = readTextEditMode();
      if (next) {
        setSelectMode(false);
        setAddButtonMode(false);
        setHoverBox(null);
      }
    };
    window.addEventListener(TEXT_EDIT_MODE_EVENT, syncTextEditMode);
    window.addEventListener('storage', syncTextEditMode);
    return () => {
      window.removeEventListener(TEXT_EDIT_MODE_EVENT, syncTextEditMode);
      window.removeEventListener('storage', syncTextEditMode);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const applyRules = () => {
      resetAllAdjustedElements();
      for (const rule of readAdjustmentRules()) {
        for (const element of findElementsForRule(rule)) {
          applyPatchToElement(element, rule.styles, rule.id);
        }
      }
      if (selected) {
        selectedElementRef.current = findElementForRule(selectedRule ?? makeRule(selected, {}));
        setSelectedBox(getBox(selectedElementRef.current));
      }
    };
    applyRules();
    const observer = new MutationObserver(() => window.requestAnimationFrame(applyRules));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', applyRules);
    window.addEventListener('scroll', applyRules, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyRules);
      window.removeEventListener('scroll', applyRules, true);
    };
  }, [enabled, rules, selected, selectedRule, currentRoute]);

  useEffect(() => {
    if (!enabled || !selectMode) {
      setHoverBox(null);
      return undefined;
    }

    const onPointerMove = (event: PointerEvent) => {
      const element = pickAdjustableElement(event.target);
      setHoverBox(getBox(element));
    };
    const onClick = (event: MouseEvent) => {
      const element = pickAdjustableElement(event.target);
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      const info = targetInfoFromElement(element);
      const computed = getComputedPatch(element);
      const preset = findClosestPreset(computed, info.tagName);
      selectedElementRef.current = element;
      setSelected(info);
      setSelectedComputed(computed);
      setSelectedBox(getBox(element));
      setHoverBox(null);
      setMessage(`已选择：${info.label} · UI：${getPresetDisplay(preset)}`);
    };

    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, selectMode]);

  useEffect(() => {
    if (!enabled || !addButtonMode) return undefined;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('[data-adjustment-panel="true"]')) return;
      event.preventDefault();
      event.stopPropagation();

      const label = newButtonLabel.trim() || '新按钮';
      const nextButton = addAdjustmentCustomButton({
        route: currentRoute,
        label,
        x: Math.max(8, Math.round(event.clientX - 48)),
        y: Math.max(8, Math.round(event.clientY - 18)),
        width: 96,
        height: 36,
        styles: {
          backgroundColor: '#08AACE',
          color: '#FFFFFF',
          borderRadius: 10,
          fontSize: 13,
          paddingX: 14,
          paddingY: 8,
        },
        note: '功能待配置',
      });
      const selector = `[data-ui-adjust-id="${CSS.escape(nextButton.id)}"]`;
      const info: TargetInfo = {
        targetKey: `${currentRoute}|${selector}`,
        label,
        route: currentRoute,
        selector,
        tagName: 'button',
        originalText: label,
        classSignature: 'adjustment-custom-button',
        defaultScope: 'single',
      };
      upsertAdjustmentRule(makeRule(info, {
        ...nextButton.styles,
        width: nextButton.width,
        height: nextButton.height,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
        hidden: false,
      }, 'single'));
      setCustomButtons(readAdjustmentCustomButtons());
      setRules(readAdjustmentRules());
      setAddButtonMode(false);
      setSelected(info);
      setSelectedComputed({
        ...nextButton.styles,
        width: nextButton.width,
        height: nextButton.height,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
        hidden: false,
      });
      window.requestAnimationFrame(() => {
        const element = document.querySelector<HTMLElement>(selector);
        selectedElementRef.current = element;
        setSelectedBox(getBox(element));
      });
      setMessage(`已添加按钮：${label}。功能待配置。`);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [addButtonMode, currentRoute, enabled, newButtonLabel]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const element = selectedElementRef.current;
      if (!drag || !selected || !element) return;
      let deltaX = event.clientX - drag.startX;
      let deltaY = event.clientY - drag.startY;
      const alignment = collectAlignmentGuides(element, drag.startRect, deltaX, deltaY);
      setGuides(alignment);
      if (showGrid) {
        deltaX = snapToGrid(deltaX);
        deltaY = snapToGrid(deltaY);
      }
      if (drag.type === 'move') {
        updateSelectedStyles({
          offsetX: (drag.baseStyles.offsetX ?? 0) + deltaX,
          offsetY: (drag.baseStyles.offsetY ?? 0) + deltaY,
        }, '拖拽移动', false);
      } else {
        updateSelectedStyles({
          width: Math.max(20, Math.round((drag.baseStyles.width ?? drag.startRect.width) + deltaX)),
          height: Math.max(20, Math.round((drag.baseStyles.height ?? drag.startRect.height) + deltaY)),
        }, '拖拽缩放', false);
      }
    };
    const onPointerUp = () => {
      const drag = dragRef.current;
      if (drag && selected) {
        const afterRule = findStoredSelectedRule(selected);
        recordAdjustmentChange(drag.type === 'move' ? '拖拽移动' : '拖拽缩放', drag.beforeRule, afterRule);
      }
      dragRef.current = null;
      setGuides({});
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [enabled, selected, showGrid]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = panelDragRef.current;
      if (!drag) return;
      event.preventDefault();
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) panelWasDraggedRef.current = true;
      const maxRight = Math.max(0, window.innerWidth - 160);
      const maxTop = Math.max(8, window.innerHeight - 88);
      setPanelPosition({
        right: Math.min(maxRight, Math.max(0, drag.startRight - deltaX)),
        top: Math.min(maxTop, Math.max(8, drag.startTop + deltaY)),
      });
    };
    const onPointerUp = () => {
      panelDragRef.current = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  function persistRules(next: AdjustmentRule[]) {
    setRules(next);
    saveAdjustmentRules(next);
  }

  function applyRuleSnapshot(nextRules: AdjustmentRule[], focusRule?: AdjustmentRule | null) {
    setRules(nextRules);
    resetAllAdjustedElements();
    for (const rule of nextRules) {
      for (const element of findElementsForRule(rule)) {
        applyPatchToElement(element, rule.styles, rule.id);
      }
    }
    selectedElementRef.current = focusRule ? findElementForRule(focusRule) : selectedElementRef.current;
    setSelectedBox(getBox(selectedElementRef.current));
  }

  function findStoredSelectedRule(target = selected) {
    if (!target) return null;
    return readAdjustmentRules().find((item) => item.targetKey === target.targetKey) ?? null;
  }

  function recordAdjustmentChange(action: string, beforeRule: AdjustmentRule | null, afterRule: AdjustmentRule | null) {
    if (rulesLookSame(beforeRule, afterRule)) return;
    const target = afterRule ?? beforeRule;
    if (!target) return;
    const nextEntry = addAdjustmentHistoryEntry({
      action,
      label: target.label,
      route: target.route,
      targetKey: target.targetKey,
      beforeRule,
      afterRule,
    });
    setHistory([nextEntry, ...readAdjustmentHistoryEntries().filter((item) => item.id !== nextEntry.id)]);
  }

  function updateSelectedStyles(styles: AdjustmentStylePatch, action = '调整样式', recordHistory = true) {
    if (!selected) return;
    const beforeRule = findStoredSelectedRule();
    const base = beforeRule ?? selectedRule ?? makeRule(selected, {}, selected.defaultScope);
    const nextRule = upsertAdjustmentRule({
      ...base,
      styles: {
        ...base.styles,
        ...styles,
      },
    });
    const nextRules = readAdjustmentRules();
    const afterRule = nextRules.find((item) => item.id === nextRule.id || item.targetKey === nextRule.targetKey) ?? nextRule;
    if (recordHistory) recordAdjustmentChange(action, beforeRule, afterRule);
    applyRuleSnapshot(nextRules, afterRule);
  }

  function updateSingleStyle<K extends keyof AdjustmentStylePatch>(key: K, value: AdjustmentStylePatch[K]) {
    updateSelectedStyles({ [key]: value } as AdjustmentStylePatch, getStyleActionLabel(key));
  }

  function updateSelectedScope(scope: AdjustmentApplyScope) {
    if (!selected) return;
    const beforeRule = findStoredSelectedRule();
    const base = beforeRule ?? selectedRule ?? makeRule(selected, {});
    const nextRule = upsertAdjustmentRule({
      ...base,
      scope,
    });
    const nextRules = readAdjustmentRules();
    const afterRule = nextRules.find((item) => item.id === nextRule.id || item.targetKey === nextRule.targetKey) ?? nextRule;
    recordAdjustmentChange('修改范围', beforeRule, afterRule);
    applyRuleSnapshot(nextRules, afterRule);
    setMessage(`范围已改为：${getScopeLabel(scope)}，影响 ${getAffectedCount(nextRule)} 个元素。`);
  }

  async function copyExport() {
    const text = JSON.stringify(makeAdjustmentExportPackage(rules), null, 2);
    await navigator.clipboard.writeText(text);
    setMessage('调整包已复制。');
  }

  function downloadExport() {
    const text = JSON.stringify(makeAdjustmentExportPackage(rules), null, 2);
    downloadText(`调整模式-${new Date().toISOString().slice(0, 10)}.json`, text);
    setMessage('调整包已下载。');
  }

  async function importRules(file: File) {
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    const imported = parseAdjustmentImportPackage(parsed);
    const importedButtons = parseAdjustmentCustomButtonsImportPackage(parsed);
    persistRules(imported);
    saveAdjustmentCustomButtons(importedButtons);
    setCustomButtons(importedButtons);
    setMessage(`已导入 ${imported.length} 条调整和 ${importedButtons.length} 个自定义按钮。`);
  }

  function clearAllRules() {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>('[data-adjustment-rule-id]'))) resetAdjustedStyles(element);
    clearAdjustmentHistoryEntries();
    saveAdjustmentCustomButtons([]);
    persistRules([]);
    setHistory([]);
    setCustomButtons([]);
    setSelected(null);
    setSelectedBox(null);
    setIsClearConfirmOpen(false);
    setMessage('调整记录已清空。');
  }

  function removeSelectedRule() {
    if (!selectedRule) return;
    const beforeRule = findStoredSelectedRule();
    removeAdjustmentRule(selectedRule.id);
    const nextRules = readAdjustmentRules();
    recordAdjustmentChange('恢复元素', beforeRule, null);
    applyRuleSnapshot(nextRules, null);
    setMessage('当前元素已恢复。');
  }

  function restoreHistoryEntry(entry: AdjustmentHistoryEntry) {
    const nextRules = restoreAdjustmentHistoryEntry(entry.id);
    setHistory(readAdjustmentHistoryEntries());
    const focusRule = nextRules.find((item) => item.targetKey === entry.targetKey) ?? null;
    applyRuleSnapshot(nextRules, focusRule);
    setMessage(entry.beforeRule ? `已恢复：${entry.label}` : `已撤回：${entry.label}`);
  }

  function selectCustomButton(button: AdjustmentCustomButton) {
    const selector = `[data-ui-adjust-id="${CSS.escape(button.id)}"]`;
    const info: TargetInfo = {
      targetKey: `${button.route}|${selector}`,
      label: button.label,
      route: button.route,
      selector,
      tagName: 'button',
      originalText: button.label,
      classSignature: 'adjustment-custom-button',
      defaultScope: 'single',
    };
    setSelected(info);
    window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(selector);
      selectedElementRef.current = element;
      if (element) setSelectedComputed(getComputedPatch(element));
      setSelectedBox(getBox(element));
    });
  }

  function renameCustomButton(button: AdjustmentCustomButton, label: string) {
    const nextLabel = label.trim() || '新按钮';
    updateAdjustmentCustomButton(button.id, { label: nextLabel });
    const nextButtons = readAdjustmentCustomButtons();
    setCustomButtons(nextButtons);
    const selector = `[data-ui-adjust-id="${CSS.escape(button.id)}"]`;
    const nextRules = readAdjustmentRules().map((rule) => (
      rule.selector === selector || rule.targetKey.includes(selector)
        ? { ...rule, label: nextLabel, originalText: nextLabel, updatedAt: new Date().toISOString() }
        : rule
    ));
    saveAdjustmentRules(nextRules);
    setRules(nextRules);
    setMessage(`已改名：${nextLabel}`);
  }

  function deleteCustomButton(button: AdjustmentCustomButton) {
    if (!window.confirm(`确定删除自定义按钮“${button.label}”吗？`)) return;
    const selector = `[data-ui-adjust-id="${CSS.escape(button.id)}"]`;
    removeAdjustmentCustomButton(button.id);
    const nextRules = readAdjustmentRules().filter((rule) => rule.selector !== selector && !rule.targetKey.includes(selector));
    saveAdjustmentRules(nextRules);
    setRules(nextRules);
    setCustomButtons(readAdjustmentCustomButtons());
    if (selected?.selector === selector) {
      setSelected(null);
      setSelectedBox(null);
    }
    setMessage(`已删除按钮：${button.label}`);
  }

  function updateShortcutBinding(id: AdjustmentShortcutId, binding: ReturnType<typeof adjustmentShortcutFromKeyboardEvent>) {
    if (!binding) return;
    const next = { ...shortcutBindings, [id]: binding };
    saveAdjustmentShortcuts(next);
    setShortcutBindings(next);
    setEditingShortcutId(null);
    const action = ADJUSTMENT_SHORTCUT_ACTIONS.find((item) => item.id === id);
    setMessage(`已修改快捷键：${action?.title ?? id} ${formatAdjustmentShortcut(binding)}`);
  }

  useEffect(() => {
    if (!editingShortcutId) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') {
        setEditingShortcutId(null);
        return;
      }
      updateShortcutBinding(editingShortcutId, adjustmentShortcutFromKeyboardEvent(event));
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [editingShortcutId, shortcutBindings]);

  function restoreDefaultShortcuts() {
    if (!window.confirm('确定恢复默认调整模式快捷键吗？')) return;
    const defaults = resetAdjustmentShortcuts();
    setShortcutBindings(defaults);
    setEditingShortcutId(null);
    setMessage('调整模式快捷键已恢复默认。');
  }

  function beginDrag(type: DragState['type'], event: ReactPointerEvent<HTMLElement>) {
    if (!selectedElementRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      type,
      startX: event.clientX,
      startY: event.clientY,
      baseStyles: displayStyles,
      beforeRule: findStoredSelectedRule(),
      startRect: selectedElementRef.current.getBoundingClientRect(),
    };
  }

  function beginPanelDrag(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('button,input,textarea,select,a,[data-no-panel-drag="true"]')) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    panelDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startTop: panelPosition.top,
      startRight: panelPosition.right,
    };
  }

  function beginFloatingPanelDrag(event: ReactPointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    panelWasDraggedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    panelDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startTop: panelPosition.top,
      startRight: panelPosition.right,
    };
  }

  function handleFloatingPanelClick(event: ReactMouseEvent<HTMLElement>) {
    if (panelWasDraggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(() => {
        panelWasDraggedRef.current = false;
      }, 0);
      return;
    }
    setShowPanel(true);
  }

  function closeAdjustmentMode() {
    setAddButtonMode(false);
    setSelectMode(false);
    setHoverBox(null);
    setSelected(null);
    setSelectedBox(null);
    setShowPanel(false);
    setAdjustmentModeEnabled(false);
    setEnabled(false);
  }

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (editingShortcutId) return;
      const typing = isTypingTarget(event.target);
      const handled = () => {
        event.preventDefault();
        event.stopPropagation();
      };
      const action = (id: AdjustmentShortcutId, options?: { allowShiftAcceleration?: boolean }) => (
        matchesAdjustmentShortcut(event, shortcutBindings[id], options)
      );

      if (event.key === 'Escape') {
        handled();
        closeAdjustmentMode();
        return;
        if (addButtonMode) {
          setAddButtonMode(false);
          setMessage('已退出添加按钮模式。');
          return;
        }
        if (selectMode) {
          setSelectMode(false);
          setHoverBox(null);
          setMessage('已退出选择模式。');
          return;
        }
        if (selected) {
          setSelected(null);
          setSelectedBox(null);
          setMessage('已取消选中。');
          return;
        }
        setShowPanel(false);
        return;
      }

      if (typing && !(event.ctrlKey || event.metaKey)) return;

      if (action('selectElement')) {
        handled();
        setAddButtonMode(false);
        setTextEditMode(false);
        setSelectMode((value) => !value);
        setMessage(selectMode ? '已退出选择模式。' : '请选择要调整的元素。');
        return;
      }

      if (action('addButton')) {
        handled();
        setSelectMode(false);
        setTextEditMode(false);
        setAddButtonMode((value) => !value);
        setMessage(addButtonMode ? '已退出添加按钮模式。' : '点击页面位置添加按钮。');
        return;
      }

      if (action('toggleGrid')) {
        handled();
        setShowGrid((value) => !value);
        setMessage(showGrid ? '网格已关闭。' : '网格已开启。');
        return;
      }

      if (action('togglePanel')) {
        handled();
        setShowPanel((value) => !value);
        return;
      }

      if (action('copyExport')) {
        handled();
        void copyExport();
        return;
      }

      if (action('downloadExport')) {
        handled();
        downloadExport();
        return;
      }

      if (action('clearAll')) {
        handled();
        setIsClearConfirmOpen(true);
        return;
      }

      if (!selected) return;

      if (action('restoreCurrent')) {
        handled();
        removeSelectedRule();
        return;
      }

      const moveStep = event.shiftKey ? 10 : 1;
      const resizeStep = event.shiftKey ? 20 : 4;
      if (action('resizeWidthDown', { allowShiftAcceleration: true }) || action('resizeWidthUp', { allowShiftAcceleration: true }) || action('resizeHeightDown', { allowShiftAcceleration: true }) || action('resizeHeightUp', { allowShiftAcceleration: true })) {
        handled();
        const widthDelta = action('resizeWidthUp', { allowShiftAcceleration: true }) ? resizeStep : action('resizeWidthDown', { allowShiftAcceleration: true }) ? -resizeStep : 0;
        const heightDelta = action('resizeHeightUp', { allowShiftAcceleration: true }) ? resizeStep : action('resizeHeightDown', { allowShiftAcceleration: true }) ? -resizeStep : 0;
        updateSelectedStyles({
          width: Math.max(20, (displayStyles.width ?? selectedBox?.width ?? 20) + widthDelta),
          height: Math.max(20, (displayStyles.height ?? selectedBox?.height ?? 20) + heightDelta),
        }, '快捷键缩放');
        return;
      }

      if (action('moveLeft', { allowShiftAcceleration: true }) || action('moveRight', { allowShiftAcceleration: true }) || action('moveUp', { allowShiftAcceleration: true }) || action('moveDown', { allowShiftAcceleration: true })) {
        handled();
        updateSelectedStyles({
          offsetX: (displayStyles.offsetX ?? 0) + (action('moveRight', { allowShiftAcceleration: true }) ? moveStep : action('moveLeft', { allowShiftAcceleration: true }) ? -moveStep : 0),
          offsetY: (displayStyles.offsetY ?? 0) + (action('moveDown', { allowShiftAcceleration: true }) ? moveStep : action('moveUp', { allowShiftAcceleration: true }) ? -moveStep : 0),
        }, '快捷键移动');
        return;
      }

      if (action('fontUp') || (shortcutBindings.fontUp.key === '=' && event.key === '+' && !event.ctrlKey && !event.altKey && !event.metaKey)) {
        handled();
        updateSingleStyle('fontSize', Math.min(72, (displayStyles.fontSize ?? 14) + 1));
        return;
      }

      if (action('fontDown')) {
        handled();
        updateSingleStyle('fontSize', Math.max(8, (displayStyles.fontSize ?? 14) - 1));
        return;
      }

      if (action('radiusDown')) {
        handled();
        updateSingleStyle('borderRadius', Math.max(0, (displayStyles.borderRadius ?? 0) - 1));
        return;
      }

      if (action('radiusUp')) {
        handled();
        updateSingleStyle('borderRadius', Math.min(64, (displayStyles.borderRadius ?? 0) + 1));
        return;
      }

      if (action('toggleHidden')) {
        handled();
        updateSingleStyle('hidden', !displayStyles.hidden);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [addButtonMode, displayStyles, editingShortcutId, enabled, selectMode, selected, selectedBox, shortcutBindings, showGrid]);

  if (!enabled) return null;

  return (
    <div data-adjustment-panel="true" data-adjustment-internal="true" className="adjustment-crisp fixed inset-0 z-[9998] pointer-events-none text-slate-900">
      {isClearConfirmOpen && (
        <div className="pointer-events-auto">
          <ConfirmDialog
            isOpen={isClearConfirmOpen}
            title="清空调整记录"
            description="确定要清空全部调整记录吗？当前页面预览样式会尽量恢复，自定义按钮和最近调整记录也会一起清空。"
            confirmText="清空全部"
            cancelText="再看看"
            confirmVariant="danger"
            onClose={() => setIsClearConfirmOpen(false)}
            onConfirm={clearAllRules}
          />
        </div>
      )}

      {showGrid && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(8,170,206,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(8,170,206,0.12) 1px, transparent 1px)',
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        />
      )}

      {visibleCustomButtons.map((button) => (
        <button
          key={button.id}
          data-adjustment-custom-button="true"
          data-ui-adjust-id={button.id}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            selectCustomButton(button);
            setMessage(`自定义按钮“${button.label}”。功能待配置。`);
          }}
          className="pointer-events-auto absolute rounded-[10px] bg-[#08AACE] px-3 py-2 text-xs font-black text-white shadow-lg"
          style={{
            left: button.x,
            top: button.y,
            width: button.width,
            height: button.height,
            backgroundColor: button.styles.backgroundColor ?? '#08AACE',
            color: button.styles.color ?? '#FFFFFF',
            borderRadius: button.styles.borderRadius,
            fontSize: button.styles.fontSize,
            paddingLeft: button.styles.paddingX,
            paddingRight: button.styles.paddingX,
            paddingTop: button.styles.paddingY,
            paddingBottom: button.styles.paddingY,
          }}
          title={`${button.label}：${button.note}`}
        >
          {button.label}
        </button>
      ))}

      {addButtonMode && (
        <div className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-xl bg-[#08AACE] px-4 py-2 text-xs font-black text-white shadow-xl">
          点击页面位置添加“{newButtonLabel.trim() || '新按钮'}”
        </div>
      )}

      {hoverBox && (
        <div
          className="absolute rounded-lg border-2 border-dashed border-[#08AACE] bg-[#08AACE]/5"
          style={{ left: hoverBox.left, top: hoverBox.top, width: hoverBox.width, height: hoverBox.height }}
        />
      )}

      {selectedBox && (
        <div
          className="absolute rounded-lg border-2 border-[#08AACE] shadow-[0_0_0_9999px_rgba(15,23,42,0.04)]"
          style={{ left: selectedBox.left, top: selectedBox.top, width: selectedBox.width, height: selectedBox.height }}
        >
          <button
            onPointerDown={(event) => beginDrag('move', event)}
            className="pointer-events-auto absolute -left-1 -top-8 flex h-7 items-center gap-1 rounded-lg bg-[#08AACE] px-2 text-xs font-black text-white shadow-lg"
          >
            <Move className="h-3.5 w-3.5" />
            移动
          </button>
          <button
            aria-label="调整大小"
            onPointerDown={(event) => beginDrag('resize', event)}
            className="pointer-events-auto absolute -bottom-2 -right-2 h-5 w-5 rounded-md border-2 border-white bg-[#08AACE] shadow-lg"
          />
        </div>
      )}

      {guides.x !== undefined && <div className="absolute top-0 h-full w-px bg-[#08AACE]" style={{ left: guides.x }} />}
      {guides.y !== undefined && <div className="absolute left-0 h-px w-full bg-[#08AACE]" style={{ top: guides.y }} />}
      {guides.label && (
        <div
          className="absolute rounded bg-[#08AACE] px-2 py-1 text-xs font-black text-white shadow"
          style={{ left: guides.x ?? 24, top: guides.y ?? 72 }}
        >
          {guides.label}
        </div>
      )}

      {showPanel && selected && (
        showPresetColumn ? (
          <aside
            className="modal-sharp pointer-events-auto absolute flex w-[350px] flex-col overflow-hidden rounded-l-2xl rounded-r-none border border-slate-200 bg-white text-slate-900 shadow-2xl"
            style={{
              right: panelPosition.right + 360,
              top: panelPosition.top,
              maxHeight: `calc(100vh - ${panelPosition.top + 16}px)`,
            }}
          >
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-900">套用 UI 记录样式</div>
                <div className="mt-0.5 text-[11px] font-bold text-slate-400">选择 UI 预设进行预览和套用</div>
              </div>
              <button
                onClick={() => setShowPresetColumn(false)}
                className="h-8 rounded-lg px-2 text-xs font-black text-[#08AACE] hover:bg-brand-light"
              >
                收起
              </button>
            </header>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {selectedPreset ? (
                <div className="rounded-xl border border-[#08AACE]/20 bg-brand-light p-2">
                  <div className="mb-1 text-[11px] font-black text-[#08AACE]">当前预设：{selectedPreset.id} - {selectedPreset.name}</div>
                  <div className="rounded-lg bg-white p-2">
                    <div
                      className="mx-auto flex max-w-full items-center justify-center truncate border border-slate-200"
                      style={{
                        width: selectedPreset.styles.width ? Math.min(selectedPreset.styles.width, 210) : undefined,
                        minWidth: selectedPreset.styles.width ? undefined : 110,
                        height: selectedPreset.styles.height ? Math.min(selectedPreset.styles.height, 48) : 36,
                        borderRadius: toCssSize(selectedPreset.styles.borderRadius, 10),
                        paddingLeft: toCssSize(selectedPreset.styles.paddingX, 12),
                        paddingRight: toCssSize(selectedPreset.styles.paddingX, 12),
                        paddingTop: toCssSize(selectedPreset.styles.paddingY, 6),
                        paddingBottom: toCssSize(selectedPreset.styles.paddingY, 6),
                        backgroundColor: selectedPreset.styles.backgroundColor ?? '#FFFFFF',
                        color: selectedPreset.styles.color ?? '#334155',
                        fontSize: toCssSize(selectedPreset.styles.fontSize, 13),
                        fontWeight: 900,
                      }}
                    >
                      当前效果
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-400">还没有套用 UI 记录</div>
              )}

              <button
                type="button"
                onClick={() => updateSelectedStyles({ presetId: undefined }, '取消套用 UI 记录')}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 hover:border-[#08AACE]/40 hover:text-[#08AACE]"
              >
                不套用预设
              </button>
              {ADJUSTMENT_PRESETS.map((preset) => (
                <PresetPreviewCard
                  key={preset.id}
                  preset={preset}
                  active={selectedRule?.styles.presetId === preset.id}
                  onApply={() => updateSelectedStyles({ ...preset.styles, presetId: preset.id }, `套用 ${preset.id}`)}
                />
              ))}
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setShowPresetColumn(true)}
            className="pointer-events-auto absolute rounded-l-xl rounded-r-none bg-[#08AACE] px-3 py-2 text-xs font-black text-white shadow-xl [writing-mode:vertical-rl]"
            style={{ right: panelPosition.right + 360, top: panelPosition.top }}
            title="展开 UI 预设预览"
          >
            UI预设
          </button>
        )
      )}

      {showPanel ? (
        <aside
          className={`modal-sharp pointer-events-auto absolute flex w-[360px] flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-2xl ${
          selected && showPresetColumn ? 'rounded-l-none rounded-r-2xl' : 'rounded-2xl'
        }`}
          style={{
            right: panelPosition.right,
            top: panelPosition.top,
            maxHeight: `calc(100vh - ${panelPosition.top + 16}px)`,
          }}
        >
          <header
            className="flex h-12 shrink-0 cursor-move items-center justify-between border-b border-slate-100 px-4"
            onPointerDown={beginPanelDrag}
            title="拖动这里可一起移动调整面板"
          >
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#08AACE]" />
              <span className="text-sm font-black text-slate-900">调整模式</span>
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{rules.length} 项</span>
            </div>
            <button
              type="button"
              data-no-panel-drag="true"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setShowShortcutPanel((value) => !value)}
              className={`grid h-10 w-12 cursor-pointer place-items-center rounded-xl text-xs font-black ${
                showShortcutPanel
                  ? 'bg-[#08AACE] text-white'
                  : 'bg-slate-50 text-[#08AACE] hover:bg-brand-light'
              }`}
              title="快捷键设置"
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <button
                data-no-panel-drag="true"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setExitLocked((value) => !value)}
                title={exitLocked ? '退出按钮已锁定，点击解锁。' : '退出按钮已解锁，点击上锁。'}
                className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-black ${
                  exitLocked
                    ? 'bg-brand-light text-[#08AACE] hover:bg-[#dff7fb]'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
              >
                {exitLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <button
                data-no-panel-drag="true"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  if (exitLocked) return;
                  setAdjustmentModeEnabled(false);
                  setEnabled(false);
                }}
                disabled={exitLocked}
                title={exitLocked ? '退出已锁定，请先解锁。' : '退出调整模式'}
                className={`h-8 rounded-lg px-2 text-xs font-black ${
                  exitLocked
                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                退出
              </button>
              <button
                data-no-panel-drag="true"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setShowPanel(false)}
                title="收起面板，但不退出调整模式"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {showShortcutPanel && (
            <section className="shrink-0 border-b border-slate-100 bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">快捷键设置</span>
                <button
                  type="button"
                  data-no-panel-drag="true"
                  onClick={restoreDefaultShortcuts}
                  className="h-8 cursor-pointer rounded-lg bg-slate-50 px-3 text-[11px] font-black text-[#08AACE] hover:bg-brand-light"
                >
                  恢复默认
                </button>
              </div>
              <div className="space-y-2">
                {shortcutPanelActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-slate-800">{action.title}</div>
                      <div className="mt-0.5 truncate text-[11px] font-bold text-slate-400">{action.desc}</div>
                    </div>
                    <button
                      type="button"
                      data-no-panel-drag="true"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        event.currentTarget.focus();
                      }}
                      onClick={(event) => {
                        event.currentTarget.focus();
                        setEditingShortcutId(action.id);
                      }}
                      className={`h-9 min-w-[112px] cursor-pointer rounded-lg px-3 text-[11px] font-black ${
                        editingShortcutId === action.id
                          ? 'bg-[#08AACE] text-white'
                          : 'bg-white text-slate-700 hover:bg-brand-light hover:text-[#08AACE]'
                      }`}
                    >
                      {editingShortcutId === action.id ? '按新快捷键' : formatAdjustmentShortcut(shortcutBindings[action.id])}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="shrink-0 border-b border-slate-100 bg-white p-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setAddButtonMode(false);
                  setTextEditMode(false);
                  setSelectMode((value) => !value);
                }}
                className={`flex h-10 items-center justify-center gap-1 rounded-xl text-xs font-black ${selectMode ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                <MousePointer2 className="h-3.5 w-3.5" />
                {selectMode ? '选择中' : '选择'}
              </button>
              <button
                onClick={() => setShowGrid((value) => !value)}
                className={`flex h-10 items-center justify-center gap-1 rounded-xl text-xs font-black ${showGrid ? 'bg-brand-light text-[#08AACE]' : 'bg-slate-100 text-slate-700'}`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                网格
              </button>
              <button onClick={() => navigate('/software-ui-catalog')} className="h-10 rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                UI库
              </button>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <section className="space-y-2 rounded-xl border border-[#08AACE]/15 bg-brand-light p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">添加按钮</span>
                <span className="text-[11px] font-black text-[#08AACE]">先占位，功能后续设置</span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
                <input
                  value={newButtonLabel}
                  onChange={(event) => setNewButtonLabel(event.target.value)}
                  className="h-10 rounded-xl border border-[#08AACE]/20 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-[#08AACE]"
                  placeholder="按钮文字"
                />
                <button
                  onClick={() => {
                    setSelectMode(false);
                    setTextEditMode(false);
                    setAddButtonMode((value) => !value);
                    setMessage(addButtonMode ? '已退出添加按钮模式。' : '点击页面位置添加按钮。');
                  }}
                  className={`flex h-10 items-center justify-center gap-1 rounded-xl text-xs font-black ${addButtonMode ? 'bg-[#08AACE] text-white' : 'bg-white text-[#08AACE]'}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {addButtonMode ? '添加中' : '添加'}
                </button>
              </div>
              {visibleCustomButtons.length > 0 && (
                <div className="editor-scrollbar max-h-32 space-y-1.5 overflow-y-auto pr-1">
                  {visibleCustomButtons.map((button) => (
                    <div key={button.id} className="grid grid-cols-[minmax(0,1fr)_52px_34px] gap-1.5">
                      <input
                        value={button.label}
                        onChange={(event) => renameCustomButton(button, event.target.value)}
                        onFocus={() => selectCustomButton(button)}
                        className="h-8 rounded-lg border border-[#08AACE]/15 bg-white px-2 text-[11px] font-black text-slate-700 outline-none focus:border-[#08AACE]"
                      />
                      <button onClick={() => selectCustomButton(button)} className="h-8 rounded-lg bg-white text-[11px] font-black text-[#08AACE]">
                        选中
                      </button>
                      <button onClick={() => deleteCustomButton(button)} className="grid h-8 place-items-center rounded-lg bg-red-50 text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-700">
              点击“选择”，再点击页面里的文字、按钮或输入框来调整样式。修改尺寸、颜色或间距前，先选择作用范围。
            </div>

            {selected ? (
              <section className="space-y-3">
                <div className="rounded-xl border border-[#08AACE]/25 bg-brand-light p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-slate-900">{selected.label}</div>
                      <div className="mt-1 line-clamp-2 text-[11px] font-black text-slate-600">
                        {selected.route} · {selected.tagName} · {getScopeLabel(selectedScope)} · 影响 {affectedCount} 个
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]" title={getPresetDisplay(inferredPreset)}>
                      {inferredPreset?.id ?? '无 UI'}
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg bg-white/70 px-2 py-1.5 text-[11px] font-bold text-slate-600">
                    UI库样式：<span className="font-black text-[#08AACE]">{getPresetDisplay(inferredPreset)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">修改范围</span>
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-black text-[#08AACE]">
                      {affectedCount} 个
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SCOPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSelectedScope(option.value)}
                        className={`h-8 rounded-lg text-[11px] font-black ${
                          selectedScope === option.value
                            ? 'bg-[#08AACE] text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-brand-light hover:text-[#08AACE]'
                        }`}
                        title={option.desc}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-bold leading-5 text-slate-600">
                    {getScopeDescription(selectedScope)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                    <div className="mb-2 text-xs font-black text-slate-500">字号</div>
                    <FontSizeStepper
                      value={displayStyles.fontSize ?? 14}
                      min={8}
                      max={72}
                      onChange={(value) => updateSingleStyle('fontSize', value)}
                      ariaLabel="调整模式字号"
                    />
                  </div>
                  <NumberInput label="圆角" value={displayStyles.borderRadius} min={0} max={48} onChange={(value) => updateSingleStyle('borderRadius', value)} />
                  <NumberInput label="宽度" value={displayStyles.width} min={20} max={1200} onChange={(value) => updateSingleStyle('width', value)} />
                  <NumberInput label="高度" value={displayStyles.height} min={20} max={900} onChange={(value) => updateSingleStyle('height', value)} />
                  <NumberInput label="Padding X" value={displayStyles.paddingX} min={0} max={80} onChange={(value) => updateSingleStyle('paddingX', value)} />
                  <NumberInput label="Padding Y" value={displayStyles.paddingY} min={0} max={80} onChange={(value) => updateSingleStyle('paddingY', value)} />
                  <NumberInput label="偏移X" value={displayStyles.offsetX} min={-500} max={500} onChange={(value) => updateSingleStyle('offsetX', value)} />
                  <NumberInput label="偏移Y" value={displayStyles.offsetY} min={-500} max={500} onChange={(value) => updateSingleStyle('offsetY', value)} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <HexColorInput label="字色" value={displayStyles.color} fallback="#334155" onChange={(value) => updateSingleStyle('color', value)} />
                  <HexColorInput label="背景" value={displayStyles.backgroundColor} fallback="#FFFFFF" onChange={(value) => updateSingleStyle('backgroundColor', value)} />
                </div>

                <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-black text-slate-600">
                  隐藏这个元素
                  <input type="checkbox" checked={Boolean(displayStyles.hidden)} onChange={(event) => updateSingleStyle('hidden', event.target.checked)} className="h-4 w-4 accent-[#08AACE]" />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={removeSelectedRule} className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600">
                    <RotateCcw className="h-3.5 w-3.5" />
                    恢复元素
                  </button>
                  <button onClick={() => setSelected(null)} className="h-10 rounded-xl bg-slate-100 text-xs font-black text-slate-700">
                    取消选中
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center">
                <div className="text-sm font-black text-slate-700">还没有选中元素</div>
                <div className="mt-1 text-xs font-bold text-slate-600">点击上方“选择”开始调整。</div>
              </section>
            )}

            <section className="space-y-2 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">最近调整</span>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{history.length} 条</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-bold leading-5 text-slate-500">
                可以在这里单独恢复一条调整，不用清空整个应用。
              </div>
              <div className="editor-scrollbar max-h-44 space-y-2 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-400">暂无最近调整</div>
                ) : history.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-slate-800">{entry.label}</div>
                         <div className="mt-0.5 truncate text-[11px] font-bold text-slate-400">{entry.action} · {formatHistoryTime(entry.createdAt)}</div>
                      </div>
                      <button
                        onClick={() => restoreHistoryEntry(entry)}
                        className="h-7 shrink-0 rounded-lg bg-[#08AACE] px-2 text-[11px] font-black text-white"
                      >
                        恢复
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="shrink-0 space-y-2 border-t border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">导出给 Codex</span>
                {message && <span className="text-[11px] font-black text-[#08AACE]">{message}</span>}
              </div>
              <div className="xy-capsule-group grid grid-cols-2">
                <button onClick={() => void copyExport()} className="xy-capsule-button">
                  <Save className="h-3.5 w-3.5" />
                  复制调整包
                </button>
                <button onClick={downloadExport} className="xy-capsule-button">
                  <Download className="h-3.5 w-3.5" />
                  下载
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="xy-capsule-button">导入调整包</button>
                <button onClick={() => setIsClearConfirmOpen(true)} className="xy-capsule-button xy-danger">清空全部</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void importRules(file).catch((error) => setMessage(error instanceof Error ? error.message : '导入失败'));
                }}
              />
          </section>
        </aside>
      ) : (
        <button
          data-adjustment-internal="true"
          onPointerDown={beginFloatingPanelDrag}
          onClick={handleFloatingPanelClick}
          className="pointer-events-auto absolute flex h-11 w-auto min-w-[116px] max-w-[160px] cursor-move items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#08AACE] px-4 text-sm font-black leading-none text-white shadow-xl"
          style={{ right: panelPosition.right, top: panelPosition.top }}
          title="拖动移动调整模式按钮，点击展开面板"
        >
          <Check className="h-4 w-4 shrink-0" />
          <span className="truncate">调整模式</span>
        </button>
      )}
    </div>
  );
}
