import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('DarkThemeColorPage custom color tab', () => {
  it('shares one 100-color palette between the palette tab and custom color picker', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContain('const THEME_PALETTE_TARGET_COLOR_COUNT = 100;');
    expect(source).toContain('const themePaletteColors = [...colorGroups.flatMap((group) => group.colors), ...extraColors];');
    expect(source).toContain('function getThemePaletteSortKey(color: ColorItem)');
    expect(source).toContain('const sortedThemePaletteColors = [...themePaletteColors].sort(');
    expect(source).toContain('if (themePaletteColors.length !== THEME_PALETTE_TARGET_COLOR_COUNT)');
    expect(source).toContain('const paletteColorOptions = [...sortedThemePaletteColors, ...customColors];');
    expect(source).toContain('{paletteColorOptions.map((color) => (');
    expect(source).not.toContain('const systemColorOptions = [');
    expect(source).not.toContain('{systemColorOptions.map((color) => (');
  });

  it('opens the custom color workflow before the legacy palette tab', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContain("type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';");
    expect(source).toContain("const [activeThemeTab, setActiveThemeTab] = useState<ThemeColorTab>('custom');");
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

    expect(source).toContain("variant === 'modal' ? 'min-h-0 space-y-3 px-4 py-4' : 'space-y-4 px-5 py-4'");
    expect(source).toContain('className="grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 rounded-xl border px-4 py-2.5"');
    expect(source).toContain('className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"');
    expect(source).toContain('<h1 className="text-lg font-black"');
    expect(source).toContain("{ key: 'light' as const, label: '白色', icon: Sun }");
    expect(source).toContain("{ key: 'dark' as const, label: '黑色', icon: Moon }");
    expect(source).toContain('className="inline-flex rounded-lg border bg-white p-0.5"');
    expect(source).toContain('className="h-8 rounded-md px-4 text-sm font-black transition-colors"');
    expect(source).not.toContain('原主题色板保留为标签；自定义颜色可选择位置、点击颜色、预览后确认替换。');
    expect(source).not.toContain('白色主题（默认主题）');
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
    expect(contentAfterHeader).not.toContain('inline-flex rounded-lg border bg-white p-0.5');
  });

  it('keeps the custom preview visible when the modal is resized narrower', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContain("const customWorkflowGridClass = variant === 'modal'");
    expect(source).toContain("flex min-h-0 flex-col gap-5");
    expect(source).toContain("const customStickyOverviewClass = variant === 'modal'");
    expect(source).toContain("grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]");
    expect(source).toContain("const customTargetPanelClass = variant === 'modal'");
    expect(source).toContain("const customTargetListClass = variant === 'modal'");
    expect(source).toContain("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContain("const customColorPickerPanelClass = variant === 'modal'");
    expect(source).toContain("const customScrollablePaletteClass = variant === 'modal'");
    expect(source).toContain("const customPreviewLineCount = variant === 'modal' ? 2 : 2;");
    expect(source).toContain("max-h-[210px]");
    expect(source).toContain("xl:max-h-[260px]");
    expect(source).toContain("max-h-[320px]");
    expect(source).toContain("max-h-[460px]");
    expect(source).toContain("min-h-[220px]");
    expect(source).toContain("overflow-y-auto");
    expect(source).toContain('className={customWorkflowGridClass}');
    expect(source).toContain('className={customStickyOverviewClass}');
    expect(source).toContain('className={customTargetPanelClass}');
    expect(source).toContain('className={customTargetListClass}');
    expect(source).toContain('className={customPickerBodyClass}');
    expect(source).toContain('className={customColorPickerPanelClass}');
    expect(source).toContain('className={customPreviewPanelClass}');
    expect(source).toContain('className={customScrollablePaletteClass}');
  });

  it('pins target selection and preview above the scrollable custom color picker', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContain("const customStickyOverviewClass = variant === 'modal'");
    expect(source).toContain("grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(260px,390px)_minmax(360px,1fr)]");
    expect(source).toContain("const customColorPickerPanelClass = variant === 'modal'");
    expect(source).toContain("flex min-h-[260px] flex-1 flex-col rounded-xl border bg-white p-4");
    expect(source).toContain("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContain("xl:grid-cols-[minmax(0,1fr)_150px_164px]");
    expect(source).toContain('<section className={customStickyOverviewClass}>');
    expect(source).toContain('<section className={customColorPickerPanelClass}');
    expect(source).toContain('<div className={customPickerBodyClass}>');

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

    expect(source).toContain("const customPickerBodyClass = variant === 'modal'");
    expect(source).toContain("xl:grid-cols-[minmax(0,1fr)_150px_164px]");
    expect(source).toContain("xl:grid-cols-[minmax(0,1fr)_160px_180px]");
    expect(source).toContain("const customRecentColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';");
    expect(source).toContain("const customActionColumnClass = 'min-h-0 rounded-lg border border-slate-100 bg-slate-50/60 p-3';");
    expect(source).toContain('<div className={customScrollablePaletteClass}>');
    expect(source).toContain('<aside className={customRecentColumnClass}>');
    expect(source).toContain('<aside className={customActionColumnClass}>');
    expect(source).not.toContain('sticky top-0 z-10 mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white pb-3');

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

    expect(source).not.toContain('<h2 className="text-base font-black text-slate-950">点击颜色</h2>');
    expect(source).toContain('<div className={customPickerBodyClass}>');
  });

  it('keeps the original palette as one tab and adds the global custom color workflow as another tab', () => {
    const source = readSource('DarkThemeColorPage.tsx');

    expect(source).toContain("type ThemeColorTab = 'palette' | 'custom' | 'detailOutline';");
    expect(source).toContain('主题色板');
    expect(source).toContain('自定义颜色');
    expect(source).toContain('选择位置');
    expect(source).toContain('确认替换');
    expect(source).toContain('常用颜色');
    expect(source).toContain('type="color"');
  });

  it('adds a dedicated detail-outline number-block color tab and preview states', () => {
    const source = readSource('DarkThemeColorPage.tsx');
    const modelSource = readSource('../../theme/model/customThemeColors.ts');

    expect(source).toContain("const GLOBAL_CUSTOM_THEME_SLOT_KEYS: CustomThemeColorSlotKey[] = [");
    expect(source).toContain("const DETAIL_OUTLINE_NUMBER_SLOT_KEYS: CustomThemeColorSlotKey[] = [");
    expect(source).toContain("const activeCustomThemeSlots = activeThemeTab === 'detailOutline' ? detailOutlineNumberSlots : globalCustomThemeSlots;");
    expect(source).toContain("const renderCustomThemeEditor = (slotsToRender: CustomThemeColorSlot[]) =>");
    expect(source).toContain("activeThemeTab === 'detailOutline' ? renderCustomThemeEditor(detailOutlineNumberSlots)");
    expect(source).toContain("['选中', 'detailOutlineSelected']");
    expect(source).toContain("['已用', 'detailOutlineUsed']");
    expect(source).toContain("['有章纲', 'detailOutlineHasOutline']");
    expect(source).toContain("['无章纲', 'detailOutlineNoOutline']");

    [
      'detailOutlineSelected',
      'detailOutlineUsed',
      'detailOutlineHasOutline',
      'detailOutlineNoOutline',
      '--xy-detail-outline-number-selected',
      '--xy-detail-outline-number-used',
      '--xy-detail-outline-number-has-outline',
      '--xy-detail-outline-number-no-outline',
    ].forEach((token) => expect(modelSource).toContain(token));
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
    ].forEach((label) => expect(modelSource).toContain(label));
    expect(source).toContain('previewColors');
    expect(source).toContain('applyCustomThemeColors');
    expect(source).toContain('rememberCustomThemeColor');
  });
});
