import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readErrorLogDefaultEntriesSource } from '../../features/tests/model/readErrorLogDefaultEntriesSource';

const readDashboardLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DashboardLayout.tsx'), 'utf8');
};

const readErrorLogSource = async () => readErrorLogDefaultEntriesSource();

const readSharedStylesSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return Array.from({ length: 12 }, (_, index) =>
    readFileSync(
      resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
      'utf8',
    ),
  ).join('\n');
};

describe('DashboardLayout profile block', () => {
  it('centers the avatar with the user name underneath', async () => {
    const source = await readDashboardLayoutSource();
    const profileStart = source.indexOf('<div className="shrink-0 border-b border-[#e1e5eb] px-3 py-[14px]">');
    const navStart = source.indexOf('<div\n          ref={sidebarRef}', profileStart);
    const profileSource = source.slice(profileStart, navStart);

    expect(profileStart).toBeGreaterThan(-1);
    expect(profileSource).toContainSource('className="shrink-0 border-b border-[#e1e5eb] px-3 py-[14px]"');
    expect(profileSource).toContainSource('flex flex-col items-center justify-center');
    expect(profileSource).toContainSource('className="group relative flex h-12 w-12');
    expect(profileSource).toContainSource('className="mt-3 w-full min-w-0"');
    expect(profileSource).toContainSource('text-center text-[15px]');
    expect(profileSource).not.toContainSource('py-7');
    expect(profileSource).not.toContainSource('flex items-center gap-2.5');
    expect(profileSource).not.toContainSource('border-b border-[#e7e9ee]');
  });
});

describe('DashboardLayout sidebar splitter', () => {
  it('keeps the home sidebar width resizable and persisted', async () => {
    const source = await readDashboardLayoutSource();

    expect(source).toContainSource("const DASHBOARD_SIDEBAR_WIDTH_KEY = 'xinyuexia_dashboard_sidebar_width'");
    expect(source).toContainSource('style={{ width: sidebarWidth }}');
    expect(source).toContainSource('onMouseDown={handleSidebarResizeStart}');
    expect(source).toContainSource('onKeyDown={handleSidebarResizeKeyDown}');
    expect(source).toContainSource("document.body.style.cursor = 'ew-resize'");
    expect(source).toContainSource('localStorage.setItem(DASHBOARD_SIDEBAR_WIDTH_KEY, String(nextWidth))');
    expect(source).toContainSource('role="separator"');
    expect(source).toContainSource('cursor-ew-resize');
    expect(source).toContainSource('-ml-[3px] -mr-[3px]');
    expect(source).toContainSource('h-full w-px bg-[#1E71EF] opacity-0 transition-opacity group-hover:opacity-100');
    expect(source).not.toContainSource('hover:bg-[#eef7fb]');
    expect(source).not.toContainSource('className="flex w-[224px] shrink-0');
  });
});

describe('DashboardLayout footer settings actions', () => {
  it('uses one footer settings entry instead of four separate settings links', async () => {
    const source = await readDashboardLayoutSource();
    const footerStart = source.indexOf('data-testid="dashboard-footer-settings-group"');
    const asideEnd = source.indexOf('</aside>', footerStart);
    const footerSource = source.slice(footerStart, asideEnd);

    expect(footerStart).toBeGreaterThan(-1);
    expect(footerSource).toContainSource('className="grid grid-cols-1 gap-1.5"');
    expect(footerSource).not.toContainSource('rounded-lg border border-[#dfe5ee] bg-white/55 p-1.5 shadow-sm');
    expect(footerSource).toContainSource('to="/settings"');
    expect(footerSource).not.toContainSource('to="/system-settings"');
    expect(footerSource).not.toContainSource('to="/theme-colors"');
    expect(footerSource).not.toContainSource('to="/shortcut-settings"');
    expect(footerSource).not.toContainSource('to="/nav-settings"');
  });

  it('uses a readable text button instead of icon-only settings buttons', async () => {
    const source = await readDashboardLayoutSource();
    const footerStart = source.indexOf('data-testid="dashboard-footer-settings-group"');
    const asideEnd = source.indexOf('</aside>', footerStart);
    const footerSource = source.slice(footerStart, asideEnd);

    expect(footerSource).toContainSource('设置');
    expect(footerSource).not.toContainSource('系统设置');
    expect(footerSource).not.toContainSource('主题颜色');
    expect(footerSource).not.toContainSource('快捷键');
    expect(footerSource).not.toContainSource('导航设置');
    expect(footerSource).toContainSource('className={SETTINGS_TEXT_BUTTON_CLASS}');
    expect(footerSource).not.toContainSource('className={SETTINGS_BUTTON_CLASS}');
    expect(footerSource).not.toContainSource('<Settings className=');
    expect(footerSource).not.toContainSource('<Palette className=');
    expect(footerSource).not.toContainSource('<Keyboard className=');
    expect(footerSource).not.toContainSource('<ListTree className=');
  });

  it('records the framed footer settings group in the in-app error log', async () => {
    const errorLog = await readErrorLogSource();

    expect(errorLog).toContainSource('dashboard-footer-settings-actions-individual-frames-001');
  });
});

describe('DashboardLayout navigation items', () => {
  it('uses custom theme variables for the sidebar shell, footer, and active navigation item', async () => {
    const source = await readDashboardLayoutSource();
    const styles = await readSharedStylesSource();
    const navStart = source.indexOf('{visiblePublicNavItems.map((item) => {');
    const navEnd = source.indexOf('{navDividerAfterItemTos.has(item.to)', navStart);
    const navSource = source.slice(navStart, navEnd);

    expect(source).toContainSource('xy-dashboard-sidebar');
    expect(source).toContainSource('xy-dashboard-sidebar-footer');
    expect(navSource).toContainSource('xy-dashboard-sidebar-active');
    expect(navSource).toContainSource('font-black text-[#142033]');
    expect(navSource).toContainSource('font-bold text-[#354154]');
    expect(navSource).toContainSource('h-[18px] w-[18px] stroke-[2.4]');
    expect(navSource).toContainSource('text-[15px] leading-none');
    expect(navSource).not.toContainSource('bg-[#dbe7fb]');
    expect(styles).toContainSource('.xy-dashboard-sidebar-active');
    expect(styles).toContainSource('background: var(--xy-custom-sidebar-active-bg);');
  });

  it('renders the sidebar as a flat list without zone group rows', async () => {
    const source = await readDashboardLayoutSource();
    const navStart = source.indexOf('{visiblePublicNavItems.map((item) => {');
    const footerStart = source.indexOf('<div className="grid shrink-0 grid-cols-2 gap-2 border-t', navStart);
    const navSource = source.slice(navStart, footerStart);

    expect(source).toContainSource("import { Camera, UserRound } from 'lucide-react'");
    expect(source).toContainSource('const visibleNavItems = navConfig.flatMap((group) => group.items.map');
    expect(source).toContainSource('const visiblePublicNavItems = filterInternalRouteItems(visibleNavItems);');
    expect(source).toContainSource('const navDividerAfterItemTos = new Set(navConfig[0]?.dividerAfterItemTos ?? (');
    expect(navSource).toContainSource('visiblePublicNavItems.map((item) => {');
    expect(navSource).toContainSource('const ItemIcon = getIconByName(item.iconName)');
    expect(navSource).toContainSource('navDividerAfterItemTos.has(item.to)');
    expect(navSource).toContainSource('className="mx-3 my-2 border-t border-[#e1e5eb]"');
    expect(navSource).not.toContainSource('GroupFolderIcon');
    expect(navSource).not.toContainSource('groupIndex > 0');
    expect(navSource).not.toContainSource('aria-expanded={!isCollapsed}');
    expect(source).not.toContainSource('loadCollapsedSections');
    expect(source).not.toContainSource('saveCollapsedSections');
    expect(source).not.toContainSource('toggleSection');
    expect(source).not.toContainSource('FolderOpen');
    expect(source).not.toContainSource('Folder,');
    expect(navSource).not.toContainSource('<ChevronRight');
    expect(navSource).not.toContainSource('<ChevronDown');
  });
});
