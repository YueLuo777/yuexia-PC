import { fireEvent, render, screen } from '@testing-library/react';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SettingsHierarchyDesignTestPage } from './SettingsHierarchyDesignTestPage';

const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');
const formalSettingsPath = resolve(process.cwd(), 'src/shared/settings/SettingsPage.tsx');
const compactSectionsPath = resolve(process.cwd(), 'src/shared/settings/SystemSettingsCompactSections.tsx');

describe('SettingsHierarchyDesignTestPage', () => {
  it('offers five distinct settings layouts while keeping scheme two', () => {
    render(<SettingsHierarchyDesignTestPage />);

    for (const name of ['全顶部导航', '图标窄栏＋文字次栏', '卡片首页逐级进入', '搜索优先设置中心', '单页折叠设置']) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /全顶部导航/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('navigation', { name: '方案二一级导航' })).toBeInTheDocument();
  });

  it('switches among the icon rail, card drill-down, search, and accordion prototypes', () => {
    render(<SettingsHierarchyDesignTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /图标窄栏＋文字次栏/ }));
    expect(screen.getByRole('navigation', { name: '方案三图标导航' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '数据迁移' }));
    expect(screen.getAllByRole('heading', { name: '数据迁移' })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /卡片首页逐级进入/ }));
    fireEvent.click(screen.getByRole('button', { name: /系统设置.*点击进入独立设置页面/ }));
    expect(screen.getByRole('button', { name: '← 返回设置首页' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /搜索优先设置中心/ }));
    fireEvent.change(screen.getByPlaceholderText('搜索窗口、快捷键、封面……'), { target: { value: '默认封面' } });
    expect(screen.getByRole('button', { name: '默认封面设置' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '导航设置' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /单页折叠设置/ }));
    const navigationAccordion = screen.getByRole('button', { name: '导航设置展开' });
    fireEvent.click(navigationAccordion);
    expect(navigationAccordion).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the compact formal settings shell and the test entry last in the UI group', async () => {
    const collectionSource = await readFile(collectionPath, 'utf8');
    const formalSettingsSource = await readFile(formalSettingsPath, 'utf8');
    const compactSectionsSource = await readFile(compactSectionsPath, 'utf8');
    const uiGroupStart = collectionSource.indexOf("title: 'UI 与主题'");
    const aiGroupStart = collectionSource.indexOf("title: 'AI 链路测试'");
    const uiGroupSource = collectionSource.slice(uiGroupStart, aiGroupStart);

    expect(uiGroupSource.lastIndexOf("path: '/settings-hierarchy-design-test'")).toBe(
      uiGroupSource.lastIndexOf('path:'),
    );
    expect(collectionSource).toContainSource("title: '软件设置入口多方案'");
    expect(collectionSource).toContainSource('SettingsHierarchyDesignTestPage');
    expect(collectionSource).toContainSource("case '/settings-hierarchy-design-test'");
    expect(formalSettingsSource).toContainSource('border-b border-slate-100 bg-white px-6 pt-4');
    expect(formalSettingsSource).not.toContainSource('min-h-[72px]');
    expect(formalSettingsSource).not.toContainSource('SYSTEM_SETTINGS_TABS');
    expect(formalSettingsSource).toContainSource("{ id: 'association', label: '关联设置'");
    expect(formalSettingsSource).toContainSource("{ id: 'appIcon', label: '软件图标'");
    expect(compactSectionsSource).toContainSource('sm:grid-cols-2 xl:grid-cols-4');
    expect(compactSectionsSource).not.toContainSource('mx-auto');
    expect(compactSectionsSource).not.toContainSource('max-w-[1080px]');
    expect(compactSectionsSource).toContainSource('WindowSettingsCompactSection');
  });
});
