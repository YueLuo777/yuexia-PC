import { describe, expect, it } from 'vitest';

const readDashboardLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DashboardLayout.tsx'), 'utf8');
};

describe('DashboardLayout profile block', () => {
  it('centers the avatar with the user name underneath', async () => {
    const source = await readDashboardLayoutSource();
    const profileStart = source.indexOf('<div className="shrink-0 px-3 py-[14px]">');
    const navStart = source.indexOf('<div\n          ref={sidebarRef}', profileStart);
    const profileSource = source.slice(profileStart, navStart);

    expect(profileStart).toBeGreaterThan(-1);
    expect(profileSource).toContain('className="shrink-0 px-3 py-[14px]"');
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
    expect(source).not.toContain('className="flex w-[224px] shrink-0');
  });
});

describe('DashboardLayout footer settings actions', () => {
  it('uses readable text buttons instead of icon-only buttons', async () => {
    const source = await readDashboardLayoutSource();
    const footerStart = source.indexOf('<div className="grid shrink-0 grid-cols-2 gap-2 border-t');
    const asideEnd = source.indexOf('</aside>', footerStart);
    const footerSource = source.slice(footerStart, asideEnd);

    expect(footerSource).toContain('系统设置');
    expect(footerSource).toContain('主题颜色');
    expect(footerSource).toContain('快捷键');
    expect(footerSource).toContain('导航设置');
    expect(footerSource).toContain('className={SETTINGS_TEXT_BUTTON_CLASS}');
    expect(footerSource).not.toContain('className={SETTINGS_BUTTON_CLASS}');
    expect(footerSource).not.toContain('<Settings className=');
    expect(footerSource).not.toContain('<Palette className=');
    expect(footerSource).not.toContain('<Keyboard className=');
    expect(footerSource).not.toContain('<ListTree className=');
  });
});

describe('DashboardLayout navigation items', () => {
  it('renders the sidebar as a flat list without zone group rows', async () => {
    const source = await readDashboardLayoutSource();
    const navStart = source.indexOf('{visibleNavItems.map((item) => {');
    const footerStart = source.indexOf('<div className="grid shrink-0 grid-cols-2 gap-2 border-t', navStart);
    const navSource = source.slice(navStart, footerStart);

    expect(source).toContain("import { Camera, UserRound } from 'lucide-react'");
    expect(source).toContain('const visibleNavItems = navConfig.flatMap((group) => (');
    expect(navSource).toContain('visibleNavItems.map((item) => {');
    expect(navSource).toContain('const ItemIcon = getIconByName(item.iconName)');
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
