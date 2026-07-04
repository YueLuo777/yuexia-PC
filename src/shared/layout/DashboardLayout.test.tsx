import { describe, expect, it } from 'vitest';

const readDashboardLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DashboardLayout.tsx'), 'utf8');
};

const readErrorLogSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../features/tests/model/errorLogDefaultEntries.generated.ts'), 'utf8');
};

const readSharedStylesSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../styles/index.css'), 'utf8');
};

describe('DashboardLayout profile block', () => {
  it('centers the avatar with the user name underneath', async () => {
    const source = await readDashboardLayoutSource();
    const profileStart = source.indexOf('<div className="shrink-0 border-b border-[#e1e5eb] px-3 py-[14px]">');
    const navStart = source.indexOf('<div\n          ref={sidebarRef}', profileStart);
    const profileSource = source.slice(profileStart, navStart);

    expect(profileStart).toBeGreaterThan(-1);
    expect(profileSource).toContain('className="shrink-0 border-b border-[#e1e5eb] px-3 py-[14px]"');
    expect(profileSource).toContain('flex flex-col items-center justify-center');
    expect(profileSource).toContain('className="group relative flex h-12 w-12');
    expect(profileSource).toContain('className="mt-3 w-full min-w-0"');
    expect(profileSource).toContain('text-center text-[15px]');
    expect(profileSource).not.toContain('py-7');
    expect(profileSource).not.toContain('flex items-center gap-2.5');
    expect(profileSource).not.toContain('border-b border-[#e7e9ee]');
  });
});

describe('DashboardLayout sidebar splitter', () => {
  it('keeps the home sidebar width resizable and persisted', async () => {
    const source = await readDashboardLayoutSource();

    expect(source).toContain("const DASHBOARD_SIDEBAR_WIDTH_KEY = 'xinyuexia_dashboard_sidebar_width'");
    expect(source).toContain('style={{ width: sidebarWidth }}');
    expect(source).toContain('onMouseDown={handleSidebarResizeStart}');
    expect(source).toContain('onKeyDown={handleSidebarResizeKeyDown}');
    expect(source).toContain("document.body.style.cursor = 'ew-resize'");
    expect(source).toContain('localStorage.setItem(DASHBOARD_SIDEBAR_WIDTH_KEY, String(nextWidth))');
    expect(source).toContain('role="separator"');
    expect(source).toContain('cursor-ew-resize');
    expect(source).toContain('-ml-[3px] -mr-[3px]');
    expect(source).toContain('h-full w-px bg-[#1E71EF] opacity-0 transition-opacity group-hover:opacity-100');
    expect(source).not.toContain('hover:bg-[#eef7fb]');
    expect(source).not.toContain('className="flex w-[224px] shrink-0');
  });
});

describe('DashboardLayout footer settings actions', () => {
  it('uses one footer settings entry instead of four separate settings links', async () => {
    const source = await readDashboardLayoutSource();
    const footerStart = source.indexOf('data-testid="dashboard-footer-settings-group"');
    const asideEnd = source.indexOf('</aside>', footerStart);
    const footerSource = source.slice(footerStart, asideEnd);

    expect(footerStart).toBeGreaterThan(-1);
    expect(footerSource).toContain('className="grid grid-cols-1 gap-1.5"');
    expect(footerSource).not.toContain('rounded-lg border border-[#dfe5ee] bg-white/55 p-1.5 shadow-sm');
    expect(footerSource).toContain('to="/settings"');
    expect(footerSource).not.toContain('to="/system-settings"');
    expect(footerSource).not.toContain('to="/theme-colors"');
    expect(footerSource).not.toContain('to="/shortcut-settings"');
    expect(footerSource).not.toContain('to="/nav-settings"');
  });

  it('uses a readable text button instead of icon-only settings buttons', async () => {
    const source = await readDashboardLayoutSource();
    const footerStart = source.indexOf('data-testid="dashboard-footer-settings-group"');
    const asideEnd = source.indexOf('</aside>', footerStart);
    const footerSource = source.slice(footerStart, asideEnd);

    expect(footerSource).toContain('设置');
    expect(footerSource).not.toContain('系统设置');
    expect(footerSource).not.toContain('主题颜色');
    expect(footerSource).not.toContain('快捷键');
    expect(footerSource).not.toContain('导航设置');
    expect(footerSource).toContain('className={SETTINGS_TEXT_BUTTON_CLASS}');
    expect(footerSource).not.toContain('className={SETTINGS_BUTTON_CLASS}');
    expect(footerSource).not.toContain('<Settings className=');
    expect(footerSource).not.toContain('<Palette className=');
    expect(footerSource).not.toContain('<Keyboard className=');
    expect(footerSource).not.toContain('<ListTree className=');
  });

  it('records the framed footer settings group in the in-app error log', async () => {
    const errorLog = await readErrorLogSource();

    expect(errorLog).toContain('dashboard-footer-settings-actions-individual-frames-001');
  });
});

describe('DashboardLayout navigation items', () => {
  it('uses custom theme variables for the sidebar shell, footer, and active navigation item', async () => {
    const source = await readDashboardLayoutSource();
    const styles = await readSharedStylesSource();
    const navStart = source.indexOf('{visiblePublicNavItems.map((item) => {');
    const navEnd = source.indexOf('{navDividerAfterItemTos.has(item.to)', navStart);
    const navSource = source.slice(navStart, navEnd);

    expect(source).toContain('xy-dashboard-sidebar');
    expect(source).toContain('xy-dashboard-sidebar-footer');
    expect(navSource).toContain('xy-dashboard-sidebar-active');
    expect(navSource).toContain('font-black text-[#142033]');
    expect(navSource).toContain('font-bold text-[#354154]');
    expect(navSource).toContain('h-[18px] w-[18px] stroke-[2.4]');
    expect(navSource).toContain('text-[15px] leading-none');
    expect(navSource).not.toContain('bg-[#dbe7fb]');
    expect(styles).toContain('.xy-dashboard-sidebar-active');
    expect(styles).toContain('background: var(--xy-custom-sidebar-active-bg);');
  });

  it('renders the sidebar as a flat list without zone group rows', async () => {
    const source = await readDashboardLayoutSource();
    const navStart = source.indexOf('{visiblePublicNavItems.map((item) => {');
    const footerStart = source.indexOf('<div className="grid shrink-0 grid-cols-2 gap-2 border-t', navStart);
    const navSource = source.slice(navStart, footerStart);

    expect(source).toContain("import { Camera, UserRound } from 'lucide-react'");
    expect(source).toContain('const visibleNavItems = navConfig.flatMap((group) => (');
    expect(source).toContain('const visiblePublicNavItems = filterInternalRouteItems(visibleNavItems);');
    expect(source).toContain('const navDividerAfterItemTos = new Set(navConfig[0]?.dividerAfterItemTos ?? (');
    expect(navSource).toContain('visiblePublicNavItems.map((item) => {');
    expect(navSource).toContain('const ItemIcon = getIconByName(item.iconName)');
    expect(navSource).toContain('navDividerAfterItemTos.has(item.to)');
    expect(navSource).toContain('className="mx-3 my-2 border-t border-[#e1e5eb]"');
    expect(navSource).not.toContain('GroupFolderIcon');
    expect(navSource).not.toContain('groupIndex > 0');
    expect(navSource).not.toContain('aria-expanded={!isCollapsed}');
    expect(source).not.toContain('loadCollapsedSections');
    expect(source).not.toContain('saveCollapsedSections');
    expect(source).not.toContain('toggleSection');
    expect(source).not.toContain('FolderOpen');
    expect(source).not.toContain('Folder,');
    expect(navSource).not.toContain('<ChevronRight');
    expect(navSource).not.toContain('<ChevronDown');
  });
});
