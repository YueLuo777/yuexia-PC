import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readErrorLogDefaultEntriesSource } from '../model/readErrorLogDefaultEntriesSource';
import { MemoryRouter } from 'react-router-dom';

import { CUSTOM_THEME_COLORS_STORAGE_KEY } from '@/features/theme/model/customThemeColors';
import { DarkThemeColorPage } from './DarkThemeColorPage';

const readSource = (relativePath: string) => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
  if (relativePath !== 'DarkThemeColorPage.tsx') return source;
  return [source, 'DarkThemeColorPageView.tsx', 'darkThemeColorData.ts']
    .map((file, index) =>
      index === 0 ? file : readFileSync(join(dirname(fileURLToPath(import.meta.url)), file), 'utf8'),
    )
    .join('\n');
};

describe('DarkThemeColorPage custom color tab', () => {
  it('enables confirm replacement as soon as a valid manual color is typed', () => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');

    const { container } = render(
      <MemoryRouter>
        <DarkThemeColorPage />
      </MemoryRouter>,
    );

    const confirmButton = screen.getByRole('button', { name: '确认替换' });
    expect(confirmButton).toBeEnabled();
    expect(screen.queryByRole('button', { name: '使用此颜色' })).toBeNull();

    const manualInput = container.querySelector('input:not([type])') as HTMLInputElement | null;
    expect(manualInput).not.toBeNull();

    fireEvent.change(manualInput!, { target: { value: '#111827' } });

    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);

    expect(JSON.parse(localStorage.getItem(CUSTOM_THEME_COLORS_STORAGE_KEY) ?? '{}').sidebarBackground).toBe('#111827');
    expect(document.documentElement.style.getPropertyValue('--xy-custom-sidebar-bg')).toBe('#111827');
  });

  it('records the manual color confirm regression in the in-app error log', () => {
    const errorLog = readErrorLogDefaultEntriesSource();

    expect(errorLog).toContainSource('theme-color-manual-input-confirm-disabled-001');
  });

  it('keeps confirm replacement clickable even when there is no pending change', () => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');

    render(
      <MemoryRouter>
        <DarkThemeColorPage />
      </MemoryRouter>,
    );

    const confirmButton = screen.getByRole('button', { name: '确认替换' });

    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);

    expect(screen.getByText('当前没有新的颜色变化')).toBeInTheDocument();
  });

  it('does not define duplicate colors in the shared theme palette', () => {
    const source = readSource('DarkThemeColorPage.tsx');
    const paletteBlock = source.slice(
      source.indexOf('const colorGroups: ColorGroup[] = ['),
      source.indexOf('const CUSTOM_COLOR_START_ID'),
    );
    const paletteHexValues = [...paletteBlock.matchAll(/value:\s*'(#(?:[0-9a-fA-F]{6}))'/g)].map((match) =>
      match[1].toLowerCase(),
    );

    expect(source).toContainSource('function uniqueThemePaletteColors(colors: ColorItem[])');
    expect(source).toContainSource(
      'const themePaletteColors = uniqueThemePaletteColors([...colorGroups.flatMap((group) => group.colors), ...extraColors]);',
    );
    expect(new Set(paletteHexValues).size).toBe(86);
  });

  it('shares one deduplicated palette between the palette tab and custom color picker', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource('const THEME_PALETTE_TARGET_COLOR_COUNT = 86;');
    expect(source).toContainSource(
      'const themePaletteColors = uniqueThemePaletteColors([...colorGroups.flatMap((group) => group.colors), ...extraColors]);',
    );
    expect(source).toContainSource('function getThemePaletteSortKey(color: ColorItem)');
    expect(source).toContainSource('const sortedThemePaletteColors = [...themePaletteColors].sort(');
    expect(source).toContainSource('if (themePaletteColors.length !== THEME_PALETTE_TARGET_COLOR_COUNT)');
    expect(source).toContainSource('const paletteColorOptions = [...sortedThemePaletteColors, ...customColors];');
    expect(source).toContainSource('{paletteColorOptions.map((color) => (');
    expect(source).not.toContainSource('const systemColorOptions = [');
    expect(source).not.toContainSource('{systemColorOptions.map((color) => (');
  });

  it('opens the custom color workflow before the legacy palette tab', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';");
    expect(source).toContainSource("const [activeThemeTab, setActiveThemeTab] = useState<ThemeColorTab>('custom');");
    const customTabIndex = source.indexOf("{ key: 'custom' as const");
    const detailOutlineTabIndex = source.indexOf("{ key: 'detailOutline' as const");
    const paletteTabIndex = source.indexOf("{ key: 'palette' as const");

    expect(customTabIndex).toBeGreaterThan(-1);
    expect(detailOutlineTabIndex).toBeGreaterThan(-1);
    expect(paletteTabIndex).toBeGreaterThan(-1);
    expect(customTabIndex).toBeLessThan(paletteTabIndex);
    expect(detailOutlineTabIndex).toBeLessThan(paletteTabIndex);
  });

  it('uses a compact header and tab strip for fewer clicks and less scanning', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("isEmbedded ? 'flex h-full min-h-0 flex-col space-y-4 overflow-y-auto pr-1'");
    expect(source).toContainSource("variant === 'modal' ? 'min-h-0 space-y-3 px-4 py-4'");
    expect(source).toContainSource("'mx-auto max-w-[1180px] space-y-5 px-8 py-6'");
    expect(source).toContainSource("variant === 'modal'");
    expect(source).toContainSource(
      "'grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 rounded-xl border px-4 py-2.5'",
    );
    expect(source).toContainSource(
      "'grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 border-b px-4 py-2.5'",
    );
    expect(source).toContainSource(
      'className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-white text-brand transition-colors hover:bg-brand-light"',
    );
    expect(source).toContainSource('<h1 className="text-lg font-black"');
    expect(source).toContainSource("{ key: 'light' as const, label: '白色', icon: Sun }");
    expect(source).toContainSource("{ key: 'dark' as const, label: '黑色', icon: Moon }");
    expect(source).toContainSource('className="inline-flex rounded-lg border bg-white p-0.5"');
    expect(source).toContainSource('className="h-8 rounded-md px-4 text-sm font-black transition-colors"');
    expect(source).not.toContainSource('原主题色板保留为标签；自定义颜色可选择位置、点击颜色、预览后确认替换。');
    expect(source).not.toContainSource('白色主题（默认主题）');
  });

  it('keeps the custom/palette tab strip inside the top header', () => {
    const source = readSource('DarkThemeColorPage.tsx');
    const headerStart = source.indexOf('<header');
    const headerEnd = source.indexOf('</header>');
    const tabStripIndex = source.indexOf('className="inline-flex rounded-lg border bg-white p-0.5"');
    const contentAfterHeader = source.slice(headerEnd, source.indexOf('{activeThemeTab'));

    expect(headerStart).toBeGreaterThan(-1);
    expect(headerEnd).toBeGreaterThan(headerStart);
    expect(tabStripIndex).toBeGreaterThan(headerStart);
    expect(tabStripIndex).toBeLessThan(headerEnd);
    expect(contentAfterHeader).not.toContainSource('inline-flex rounded-lg border bg-white p-0.5');
  });

  it('keeps the custom preview visible when the modal is resized narrower', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("const customWorkflowGridClass = variant === 'modal'");
    expect(source).toContainSource('flex min-h-0 flex-col gap-5');
    expect(source).toContainSource("const customStickyOverviewClass = variant === 'modal'");
    expect(source).toContainSource(
      'grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]',
    );
    expect(source).toContainSource("const customTargetPanelClass = variant === 'modal'");
    expect(source).toContainSource("const customTargetListClass = variant === 'modal'");
    expect(source).toContainSource("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContainSource("const customColorPickerPanelClass = variant === 'modal'");
    expect(source).toContainSource("const customScrollablePaletteClass = variant === 'modal'");
    expect(source).toContainSource("const customPreviewLineCount = variant === 'modal' ? 2 : 2;");
    expect(source).toContainSource('max-h-[210px]');
    expect(source).toContainSource('xl:max-h-[260px]');
    expect(source).toContainSource('max-h-[320px]');
    expect(source).toContainSource('max-h-[460px]');
    expect(source).toContainSource('min-h-[220px]');
    expect(source).toContainSource('overflow-y-auto');
    expect(source).toContainSource('className={customWorkflowGridClass}');
    expect(source).toContainSource('className={customStickyOverviewClass}');
    expect(source).toContainSource('className={customTargetPanelClass}');
    expect(source).toContainSource('className={customTargetListClass}');
    expect(source).toContainSource('className={customPickerBodyClass}');
    expect(source).toContainSource('className={customColorPickerPanelClass}');
    expect(source).toContainSource('className={customPreviewPanelClass}');
    expect(source).toContainSource('className={customScrollablePaletteClass}');
  });

  it('pins target selection and preview above the scrollable custom color picker', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("const customStickyOverviewClass = variant === 'modal'");
    expect(source).toContainSource(
      'grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]',
    );
    expect(source).toContainSource("const customColorPickerPanelClass = variant === 'modal'");
    expect(source).toContainSource('flex min-h-[260px] flex-1 flex-col rounded-xl border bg-white p-4');
    expect(source).toContainSource("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContainSource('xl:grid-cols-[minmax(0,1fr)_150px_164px]');
    expect(source).toContainSource('<section className={customStickyOverviewClass}>');
    expect(source).toContainSource('<section className={customColorPickerPanelClass}');
    expect(source).toContainSource('<div className={customPickerBodyClass}>');

    const targetIndex = source.indexOf('className={customTargetPanelClass}');
    const previewIndex = source.indexOf('className={customPreviewPanelClass}');
    const colorPickerIndex = source.indexOf('className={customColorPickerPanelClass}');

    expect(targetIndex).toBeGreaterThan(-1);
    expect(previewIndex).toBeGreaterThan(-1);
    expect(colorPickerIndex).toBeGreaterThan(-1);
    expect(targetIndex).toBeLessThan(colorPickerIndex);
    expect(previewIndex).toBeLessThan(colorPickerIndex);
  });

  it('splits the custom color picker into palette, recent colors, and action columns', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContainSource('xl:grid-cols-[minmax(0,1fr)_150px_164px]');
    expect(source).toContainSource('xl:grid-cols-[minmax(0,1fr)_160px_180px]');
    expect(source).toContainSource(
      "const customRecentColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';",
    );
    expect(source).toContainSource(
      "const customActionColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';",
    );
    expect(source).toContainSource('<div className={customScrollablePaletteClass}>');
    expect(source).toContainSource('<aside className={customRecentColumnClass}>');
    expect(source).toContainSource('<aside className={customActionColumnClass}>');
    expect(source).not.toContainSource(
      'sticky top-0 z-10 mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white pb-3',
    );

    const paletteIndex = source.indexOf('className={customScrollablePaletteClass}');
    const recentIndex = source.indexOf('className={customRecentColumnClass}');
    const actionIndex = source.indexOf('className={customActionColumnClass}');

    expect(paletteIndex).toBeGreaterThan(-1);
    expect(recentIndex).toBeGreaterThan(-1);
    expect(actionIndex).toBeGreaterThan(-1);
    expect(paletteIndex).toBeLessThan(recentIndex);
    expect(recentIndex).toBeLessThan(actionIndex);
  });

  it('does not show a redundant click-color title above the custom picker columns', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).not.toContainSource('<h2 className="text-base font-black text-slate-950">点击颜色</h2>');
    expect(source).toContainSource('<div className={customPickerBodyClass}>');
  });

  it('keeps the original palette as one tab and adds the global custom color workflow as another tab', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContainSource("type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';");
    expect(source).toContainSource('主题色板');
    expect(source).toContainSource('自定义颜色');
    expect(source).toContainSource('选择位置');
    expect(source).toContainSource('确认替换');
    expect(source).toContainSource('常用颜色');
    expect(source).toContainSource('type="color"');
    expect(source).not.toContainSource('使用此颜色');
  });

  it('adds a dedicated detail-outline number-block color tab and preview states', () => {
    const source = readSource('DarkThemeColorPage.tsx');
    const modelSource = readSource('../../theme/model/customThemeColors.ts');
    const styleSource = Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(source).toContainSource('const GLOBAL_CUSTOM_THEME_SLOT_KEYS: CustomThemeColorSlotKey[] = [');
    expect(source).toContainSource('const DETAIL_OUTLINE_NUMBER_SLOT_KEYS: CustomThemeColorSlotKey[] = [');
    expect(source).toContainSource(
      "const activeCustomThemeSlots = activeThemeTab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;",
    );
    expect(source).toContainSource('const renderCustomThemeEditor = (slotsToRender: CustomThemeColorSlot[]) =>');
    expect(source).toContainSource(
      "activeThemeTab === 'detailOutline' ? renderCustomThemeEditor(detailOutlineNumberSlots)",
    );
    expect(source).toContainSource("['选中', 'detailOutlineSelected']");
    expect(source).toContainSource("['已用', 'detailOutlineUsed']");
    expect(source).toContainSource("['有章纲', 'detailOutlineHasOutline']");
    expect(source).toContainSource("['无章纲', 'detailOutlineNoOutline']");

    [
      'detailOutlineSelected',
      'detailOutlineUsed',
      'detailOutlineHasOutline',
      'detailOutlineNoOutline',
      '--xy-detail-outline-number-selected',
      '--xy-detail-outline-number-used',
      '--xy-detail-outline-number-has-outline',
      '--xy-detail-outline-number-no-outline',
    ].forEach((token) => expect(modelSource).toContainSource(token));
    expect(modelSource).toContainSource("defaultColor: '#08AACE'");
    expect(modelSource).toContainSource(
      "if (slot.key === 'detailOutlineSelected' && normalized === LEGACY_DETAIL_OUTLINE_SELECTED_FILL_COLOR)",
    );
    expect(styleSource).toContainSource('border-color: var(--xy-detail-outline-number-selected);');
    expect(styleSource).toContainSource('background: var(--xy-detail-outline-number-has-outline);');
    expect(styleSource).toContainSource(
      'color-mix(in srgb, var(--xy-detail-outline-number-selected) 78%, transparent)',
    );
    expect(styleSource).not.toContainSource('background: var(--xy-detail-outline-number-selected);');
    expect(source).toContainSource(
      "backgroundColor: key === 'detailOutlineSelected' ? previewColors.detailOutlineHasOutline : previewColors[key]",
    );
    expect(source).toContainSource(
      "borderColor: key === 'detailOutlineSelected' ? previewColors.detailOutlineSelected",
    );
    expect(source).toContainSource(
      "boxShadow: key === 'detailOutlineSelected' ? `0 0 0 2px #ffffff, 0 0 0 4px ${previewColors.detailOutlineSelected}`",
    );
  });

  it('offers every requested global color target and previews before saving', () => {
    const source = readSource('DarkThemeColorPage.tsx');
    const modelSource = readSource('../../theme/model/customThemeColors.ts');

    [
      '主页左侧导航栏背景色',
      '主页左侧导航栏选中颜色',
      '脑洞/设定/正文选中颜色',
      '工作流分组颜色',
      '正文内容输入区域背景',
      '软件顶部标题栏颜色',
    ].forEach((label) => expect(modelSource).toContainSource(label));
    expect(source).toContainSource('previewColors');
    expect(source).toContainSource('applyCustomThemeColors');
    expect(source).toContainSource('rememberCustomThemeColor');
  });
});
