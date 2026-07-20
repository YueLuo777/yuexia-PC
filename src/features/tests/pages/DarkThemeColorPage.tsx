import { Check, Copy } from 'lucide-react';
import { useState, type HTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CUSTOM_THEME_COLOR_SLOTS,
  DEFAULT_CUSTOM_THEME_COLORS,
  applyCustomThemeColors,
  normalizeCustomThemeHexColor,
  readCustomThemeColors,
  readCustomThemeRecentColors,
  rememberCustomThemeColor,
  writeCustomThemeColors,
  type CustomThemeColorMap,
  type CustomThemeColorSlot,
  type CustomThemeColorSlotKey,
} from '@/features/theme/model/customThemeColors';
import { renderDarkThemeColorPageView } from './DarkThemeColorPageView';

import {
  ThemeMode,
  ThemeColorTab,
  ColorItem,
  ColorGroup,
  ThemeSlot,
  DarkThemeColorPageProps,
  THEME_PALETTE_TARGET_COLOR_COUNT,
  colorGroups,
  extraColors,
  CUSTOM_COLOR_START_ID,
  GLOBAL_CUSTOM_THEME_SLOT_KEYS,
  DETAIL_OUTLINE_NUMBER_SLOT_KEYS,
  SETTINGS_SOLID_BUTTON_CLASS,
  globalCustomThemeSlots,
  detailOutlineNumberSlots,
  slots,
  defaultAssignments,
  uniqueThemePaletteColors,
  themePaletteColors,
  hexToRgb,
  getThemePaletteSortKey,
  sortedThemePaletteColors,
  getContrastText,
  getSlotStyle,
  loadThemeMode,
  getPagePalette,
  normalizePaletteHexColor,
  isCustomThemeChanged,
  readInitialCustomColors,
} from './darkThemeColorData';

export function DarkThemeColorPage({ variant = 'page', onClose, dragHandleProps }: DarkThemeColorPageProps = {}) {
  const navigate = useNavigate();
  const isEmbedded = variant === 'embedded';
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeColorTab>('custom');
  const [mode, setMode] = useState<ThemeMode>(loadThemeMode);
  const [pendingSlotKey, setPendingSlotKey] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState(defaultAssignments);
  const [customColorValue, setCustomColorValue] = useState('');
  const [customColors, setCustomColors] = useState<ColorItem[]>([]);
  const [copied, setCopied] = useState('');
  const [savedColors, setSavedColors] = useState(readInitialCustomColors);
  const [draftColors, setDraftColors] = useState(readInitialCustomColors);
  const [selectedTargetKey, setSelectedTargetKey] = useState<CustomThemeColorSlotKey>('sidebarBackground');
  const [manualColorValue, setManualColorValue] = useState(draftColors.sidebarBackground);
  const [recentColors, setRecentColors] = useState(readCustomThemeRecentColors);
  const [saveStatus, setSaveStatus] = useState('');

  const paletteColorOptions = [...sortedThemePaletteColors, ...customColors];
  const flatColors = paletteColorOptions;
  const current = assignments[mode];
  const preview = getSlotStyle(current);
  const page = getPagePalette(mode);
  const previewColors: CustomThemeColorMap = draftColors;
  const activeCustomThemeSlots = activeThemeTab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;
  const selectedTarget =
    activeCustomThemeSlots.find((slot) => slot.key === selectedTargetKey) ?? activeCustomThemeSlots[0];
  const hasCustomThemeChanges = isCustomThemeChanged(draftColors);
  const customWorkflowGridClass = variant === 'modal' ? 'flex min-h-0 flex-col gap-5' : 'flex flex-col gap-5';
  const customStickyOverviewClass =
    variant === 'modal'
      ? 'grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]'
      : 'grid grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(360px,1fr)]';
  const customTargetPanelClass =
    variant === 'modal' ? 'rounded-xl border bg-white p-3 xl:p-4' : 'rounded-xl border bg-white p-4';
  const customTargetListClass =
    variant === 'modal'
      ? 'editor-scrollbar max-h-[210px] space-y-2 overflow-y-auto pr-1 xl:max-h-[260px]'
      : 'editor-scrollbar max-h-[220px] space-y-2 overflow-y-auto pr-1';
  const customColorPickerPanelClass =
    variant === 'modal'
      ? 'flex min-h-[260px] flex-1 flex-col rounded-xl border bg-white p-4'
      : 'flex min-h-[320px] flex-col rounded-xl border bg-white p-4';
  const customPickerBodyClass =
    variant === 'modal'
      ? 'grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_150px_164px]'
      : 'grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_160px_180px]';
  const customScrollablePaletteClass =
    variant === 'modal'
      ? 'editor-scrollbar grid max-h-[360px] min-h-[220px] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9'
      : 'editor-scrollbar grid max-h-[460px] min-h-[240px] grid-cols-5 gap-2 overflow-y-auto pr-1 md:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11';
  const customRecentColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';
  const customActionColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';
  const customPreviewPanelClass =
    variant === 'modal' ? 'rounded-xl border bg-white p-3 xl:p-4' : 'rounded-xl border bg-white p-4';
  const customPreviewEditorClass = variant === 'modal' ? 'rounded-lg p-3' : 'rounded-lg p-4';
  const customPreviewLineStackClass = variant === 'modal' ? 'space-y-2' : 'space-y-3';
  const customPreviewLineCount = variant === 'modal' ? 2 : 2;

  const handleBack = () => {
    if (variant === 'modal') {
      onClose?.();
      return;
    }
    navigate('/novels');
  };

  const selectThemeTab = (tab: ThemeColorTab) => {
    setActiveThemeTab(tab);
    if (tab === 'palette') return;
    const nextSlots = tab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;
    const nextTarget = nextSlots.find((slot) => slot.key === selectedTargetKey) ?? nextSlots[0];
    setSelectedTargetKey(nextTarget.key);
    setManualColorValue(draftColors[nextTarget.key]);
    setSaveStatus('');
  };

  const handlePaletteColorClick = (color: ColorItem) => {
    if (!pendingSlotKey) {
      setSelectedColorId(color.id);
      return;
    }
    setAssignments((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [pendingSlotKey]: color.value,
      },
    }));
    setPendingSlotKey(null);
    setSelectedColorId(null);
  };

  const addCustomColor = () => {
    const normalized = normalizePaletteHexColor(customColorValue);
    if (!normalized) return;
    setCustomColors((prev) => {
      if (flatColors.some((color) => color.value.toLowerCase() === normalized.toLowerCase())) return prev;
      return [
        ...prev,
        {
          id: CUSTOM_COLOR_START_ID + prev.length,
          name: '自定义',
          value: normalized,
          usage: '用户添加',
        },
      ];
    });
    setCustomColorValue('');
  };

  const copyColor = async (value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(''), 1200);
  };

  const selectCustomTarget = (key: CustomThemeColorSlotKey) => {
    setSelectedTargetKey(key);
    setManualColorValue(draftColors[key]);
    setSaveStatus('');
  };

  const applyDraftColor = (color: string) => {
    const normalized = normalizeCustomThemeHexColor(color);
    if (!normalized) return;
    setDraftColors((prev) => ({ ...prev, [selectedTargetKey]: normalized }));
    setManualColorValue(normalized);
    setSaveStatus('');
  };

  const resetSelectedTarget = () => {
    applyDraftColor(selectedTarget.defaultColor);
  };

  const resetAllTargets = () => {
    setDraftColors({ ...DEFAULT_CUSTOM_THEME_COLORS });
    setManualColorValue(DEFAULT_CUSTOM_THEME_COLORS[selectedTargetKey]);
    setSaveStatus('');
  };

  const confirmCustomColors = () => {
    if (!hasCustomThemeChanges) {
      setSaveStatus('当前没有新的颜色变化');
      return;
    }

    const previous = savedColors;
    const next = writeCustomThemeColors(draftColors);
    applyCustomThemeColors(next);
    CUSTOM_THEME_COLOR_SLOTS.forEach((slot) => {
      if (previous[slot.key] !== next[slot.key]) rememberCustomThemeColor(next[slot.key]);
    });
    setSavedColors(next);
    setDraftColors(next);
    setRecentColors(readCustomThemeRecentColors());
    setSaveStatus('已保存并应用到全局界面');
  };

  const renderPaletteTab = () => (
    <section className="space-y-5">
      <section className="rounded-xl border p-5" style={{ backgroundColor: page.panel, borderColor: page.border }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: page.title }}>
              填色位置
            </h2>
            <p className="mt-1 text-sm" style={{ color: page.muted }}>
              {pendingSlotKey ? '已选择位置，请点击下方颜色完成填色。' : '先选择一个位置，位置会出现橙色边框。'}
            </p>
          </div>
          <button
            onClick={() => setAssignments((prev) => ({ ...prev, [mode]: defaultAssignments[mode] }))}
            className={SETTINGS_SOLID_BUTTON_CLASS}
          >
            恢复当前主题
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {slots.map((slot) => {
            const color = current[slot.key];
            const active = pendingSlotKey === slot.key;
            return (
              <button
                key={slot.key}
                onClick={() => {
                  setPendingSlotKey(slot.key);
                  setSelectedColorId(null);
                }}
                className="min-h-[86px] rounded-xl border p-3 text-left transition-colors"
                style={{
                  backgroundColor: page.card,
                  borderColor: active ? '#f97316' : page.border,
                  boxShadow: active ? '0 0 0 2px rgba(249, 115, 22, 0.22)' : 'none',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold" style={{ color: page.title }}>
                    {slot.title}
                  </span>
                  <span
                    className="h-5 w-5 shrink-0 rounded border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="font-mono text-xs" style={{ color: page.body }}>
                  {color}
                </div>
                <div className="mt-1 line-clamp-2 text-[11px]" style={{ color: page.muted }}>
                  {slot.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border p-5" style={{ backgroundColor: page.panel, borderColor: page.border }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: page.title }}>
              颜色
            </h2>
            <p className="mt-1 text-sm" style={{ color: page.muted }}>
              共 {flatColors.length} 种颜色，点击颜色后会填入当前橙框位置。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={customColorValue}
              onChange={(event) => setCustomColorValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addCustomColor();
              }}
              placeholder="#08B3D9"
              className="h-9 w-28 rounded-lg border px-3 font-mono text-sm outline-none"
              style={{ backgroundColor: page.card, borderColor: page.border, color: page.title }}
            />
            <button onClick={addCustomColor} className={SETTINGS_SOLID_BUTTON_CLASS}>
              添加颜色
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
          {flatColors.map((color) => {
            const active = selectedColorId === color.id;
            return (
              <button
                key={color.id}
                onClick={() => handlePaletteColorClick(color)}
                className="min-h-[92px] rounded-xl border p-2 text-left transition-all"
                style={{
                  backgroundColor: page.card,
                  borderColor: active ? page.strongBorder : page.border,
                  boxShadow: active ? '0 0 0 1px rgba(34,199,229,0.3)' : 'none',
                }}
                title={`${color.name} ${color.value}`}
              >
                <div
                  className="mb-2 flex h-10 items-center justify-between rounded-lg px-2 text-xs font-bold"
                  style={{ backgroundColor: color.value, color: getContrastText(color.value) }}
                >
                  <span>{color.id}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="truncate text-xs font-bold" style={{ color: page.title }}>
                  {color.name}
                </div>
                <div className="mt-1 truncate font-mono text-[11px]" style={{ color: page.body }}>
                  {color.value}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );

  const renderCustomThemeEditor = (slotsToRender: CustomThemeColorSlot[]) => (
    <section className={customWorkflowGridClass}>
      <section className={customStickyOverviewClass}>
        <section className={customTargetPanelClass} style={{ borderColor: page.border }}>
          <div className="mb-3">
            <h2 className="text-base font-black text-slate-950">选择位置</h2>
          </div>
          <div className={customTargetListClass}>
            {slotsToRender.map((slot) => {
              const active = selectedTargetKey === slot.key;
              const changed = draftColors[slot.key] !== savedColors[slot.key];
              return (
                <button
                  key={slot.key}
                  onClick={() => selectCustomTarget(slot.key)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors"
                  style={{
                    borderColor: active ? '#08AACE' : '#dbe4ef',
                    backgroundColor: active ? '#f0fbff' : '#ffffff',
                    boxShadow: active ? '0 0 0 1px rgba(8,170,206,0.18)' : 'none',
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-950">{slot.label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs font-medium text-slate-500">
                      {slot.description}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="h-6 w-6 rounded-md border"
                      style={{
                        backgroundColor: slot.key === 'detailOutlineSelected' ? '#ffffff' : draftColors[slot.key],
                        borderColor: slot.key === 'detailOutlineSelected' ? draftColors[slot.key] : '#e2e8f0',
                        boxShadow:
                          slot.key === 'detailOutlineSelected' ? `0 0 0 2px ${draftColors[slot.key]}` : undefined,
                      }}
                    />
                    <span className="font-mono text-[11px] font-black text-slate-500">{draftColors[slot.key]}</span>
                    {changed ? (
                      <span className="rounded-full bg-[#E7F8FD] px-2 py-0.5 text-[11px] font-black text-[#08AACE]">
                        预览中
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={customPreviewPanelClass} style={{ borderColor: page.border }}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950">预览</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-black text-slate-500">
              {selectedTarget.cssVar}
            </span>
          </div>

          {activeThemeTab === 'detailOutline' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 rounded-lg border border-[#BDEEF7] bg-[#E7F8FD] px-3 py-2 text-sm font-black text-slate-950">
                第一卷
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['选中', 'detailOutlineSelected'],
                    ['已用', 'detailOutlineUsed'],
                    ['有章纲', 'detailOutlineHasOutline'],
                    ['无章纲', 'detailOutlineNoOutline'],
                  ] as const
                ).map(([label, key], index) => (
                  <div key={key} className="space-y-1">
                    <div
                      className="grid h-9 w-9 place-items-center rounded-lg border text-sm font-black text-slate-950"
                      style={{
                        backgroundColor:
                          key === 'detailOutlineSelected' ? previewColors.detailOutlineHasOutline : previewColors[key],
                        borderColor:
                          key === 'detailOutlineSelected'
                            ? previewColors.detailOutlineSelected
                            : key === 'detailOutlineNoOutline'
                              ? '#e2e8f0'
                              : '#08AACE',
                        boxShadow:
                          key === 'detailOutlineSelected'
                            ? `0 0 0 2px #ffffff, 0 0 0 4px ${previewColors.detailOutlineSelected}`
                            : '0 1px 4px rgba(15,23,42,0.10)',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="text-center text-[11px] font-black text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div
                className="h-8 border-b border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600"
                style={{ backgroundColor: previewColors.titlebar }}
              >
                软件标题栏颜色
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <div
                  className="space-y-2 border-r border-slate-200 p-3"
                  style={{ backgroundColor: previewColors.sidebarBackground }}
                >
                  <div className="text-sm font-black text-slate-950">我的小说</div>
                  <div
                    className="rounded-md px-3 py-2 text-sm font-black text-slate-950"
                    style={{ backgroundColor: previewColors.sidebarActive }}
                  >
                    作品信息
                  </div>
                  <div className="rounded-md px-3 py-2 text-sm font-bold text-slate-500">测试集合</div>
                </div>
                <div className="space-y-3 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {['脑洞', '设定', '正文'].map((label, index) => (
                      <div
                        key={label}
                        className="rounded-md border px-3 py-2 text-center text-sm font-black"
                        style={{
                          backgroundColor: index === 2 ? previewColors.contentSelected : '#ffffff',
                          borderColor: '#dbe4ef',
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {['脑洞', '设定', '章纲', '正文'].map((label) => (
                      <div
                        key={label}
                        className="min-w-[68px] rounded-md border px-2 py-1.5 text-center text-sm font-black text-slate-950"
                        style={{
                          backgroundColor: label === '正文' ? previewColors.flowGroup : '#ffffff',
                          borderColor: label === '正文' ? '#8FE4F2' : '#dbe4ef',
                        }}
                      >
                        <div>{label}</div>
                        <div className="text-xs text-[#08AACE]">2章</div>
                      </div>
                    ))}
                  </div>
                  <div className={customPreviewEditorClass} style={{ backgroundColor: previewColors.editorBackground }}>
                    <div className={customPreviewLineStackClass}>
                      {Array.from({ length: customPreviewLineCount }, (_, index) => (
                        <div key={index} className="border-b border-dashed border-slate-300" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

      <section className={customColorPickerPanelClass} style={{ borderColor: page.border }}>
        <div className={customPickerBodyClass}>
          <div className={customScrollablePaletteClass}>
            {paletteColorOptions.map((color) => (
              <button
                key={`${color.id}-${color.value}`}
                onClick={() => applyDraftColor(color.value)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-left transition-colors hover:border-[#08AACE]"
                title={`${color.name} ${color.value}`}
              >
                <span
                  className="block h-10 rounded-md border border-white/70"
                  style={{ backgroundColor: color.value }}
                />
                <span className="mt-1 block truncate text-[11px] font-black text-slate-700">{color.name}</span>
                <span className="block truncate font-mono text-[10px] font-bold text-slate-400">
                  {color.value.toUpperCase()}
                </span>
              </button>
            ))}
          </div>

          <aside className={customRecentColumnClass}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-800">常用颜色</h3>
              <span className="text-xs font-black text-slate-400">{recentColors.length}/20</span>
            </div>
            {recentColors.length ? (
              <div className="editor-scrollbar grid max-h-[320px] grid-cols-4 gap-2 overflow-y-auto pr-1 xl:grid-cols-3">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => applyDraftColor(color)}
                    className="h-8 rounded-md border border-slate-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm font-bold leading-5 text-slate-400">
                暂无常用色
              </div>
            )}
          </aside>

          <aside className={customActionColumnClass}>
            <div className="space-y-2">
              <input
                type="color"
                value={manualColorValue}
                onChange={(event) => {
                  setManualColorValue(event.target.value.toUpperCase());
                  applyDraftColor(event.target.value);
                }}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              />
              <input
                value={manualColorValue}
                onChange={(event) => {
                  const nextValue = event.target.value.toUpperCase();
                  setManualColorValue(nextValue);
                  if (normalizeCustomThemeHexColor(nextValue)) applyDraftColor(nextValue);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyDraftColor(manualColorValue);
                }}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm font-bold text-slate-700"
              />
              <button onClick={resetSelectedTarget} className={`w-full ${SETTINGS_SOLID_BUTTON_CLASS}`}>
                恢复当前项默认
              </button>
              <button onClick={resetAllTargets} className={`w-full ${SETTINGS_SOLID_BUTTON_CLASS}`}>
                全部恢复默认
              </button>
              <button onClick={confirmCustomColors} className={`w-full ${SETTINGS_SOLID_BUTTON_CLASS}`}>
                确认替换
              </button>
            </div>
            {saveStatus ? <div className="mt-2 text-sm font-black leading-5 text-[#08AACE]">{saveStatus}</div> : null}
          </aside>
        </div>
      </section>
    </section>
  );

  return renderDarkThemeColorPageView({
    activeThemeTab,
    dragHandleProps,
    handleBack,
    isEmbedded,
    mode,
    page,
    renderCustomThemeEditor,
    renderPaletteTab,
    selectThemeTab,
    setMode,
    variant,
  });
}
