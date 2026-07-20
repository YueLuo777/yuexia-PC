import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { UiConsistencyAuditTestPage } from './UiConsistencyAuditTestPage';

const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('UiConsistencyAuditTestPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('lists the six audited UI families with their application locations', () => {
    render(<UiConsistencyAuditTestPage />);

    for (const title of [
      '工作台素材库侧栏和条目',
      '关联资料阅读器',
      '点评、润色、状态三栏工作流',
      '全局弹窗外壳',
      '软件设置页面壳',
      '小型表单、确认框和空状态',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/软件位置：/).length).toBeGreaterThanOrEqual(12);
    expect(screen.getByText(/创作工坊 → 大纲设定 → 选中设定 → 关联脑洞/)).toBeInTheDocument();
    expect(screen.getAllByText('人物设定').length).toBeGreaterThan(0);
    expect(screen.getAllByText('关联脑洞').length).toBeGreaterThan(0);
    expect(screen.getAllByText('综合点评').length).toBeGreaterThan(0);
    expect(screen.getAllByText('导航设置').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('角色资料库版本现有界面粗略还原')).toBeInTheDocument();
  });

  it('selects, highlights, summarizes, and persists one version per UI family', () => {
    const { unmount } = render(<UiConsistencyAuditTestPage />);
    const roleVersion = screen.getByRole('button', { name: '选择第1类版本2：设定资料库版本' });
    const readerVersion = screen.getByRole('button', { name: '选择第2类版本3：章纲关联资料' });

    fireEvent.click(roleVersion);
    fireEvent.click(readerVersion);

    expect(roleVersion).toHaveAttribute('aria-pressed', 'true');
    expect(readerVersion).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('audit-summary-1')).toHaveTextContent('已选：版本 2 · 设定资料库版本');
    expect(screen.getByTestId('audit-summary-2')).toHaveTextContent('已选：版本 3 · 章纲关联资料');
    expect(screen.getByText('已选择 2 / 6 类')).toBeInTheDocument();

    unmount();
    render(<UiConsistencyAuditTestPage />);
    expect(screen.getByTestId('audit-summary-1')).toHaveTextContent('已选：版本 2 · 设定资料库版本');
  });

  it('clears all saved selections from the summary', () => {
    render(<UiConsistencyAuditTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '选择第1类版本1：角色资料库版本' }));
    fireEvent.click(screen.getByRole('button', { name: '清空全部选择' }));

    expect(screen.getByTestId('audit-summary-1')).toHaveTextContent('还未选择');
    expect(screen.getByText('已选择 0 / 6 类')).toBeInTheDocument();
  });

  it('keeps the audit page at the end of the UI and theme test group', () => {
    const source = readFileSync(collectionPath, 'utf8');
    const entryIndex = source.indexOf("path: '/ui-consistency-audit-test'");
    const uiGroupEnd = source.indexOf("title: 'AI 链路测试'");
    const precedingUiEntry = source.indexOf("path: '/workbench-flow-tabs-spacing-test'");

    expect(entryIndex).toBeGreaterThan(precedingUiEntry);
    expect(entryIndex).toBeLessThan(uiGroupEnd);
    expect(source).toContain("case '/ui-consistency-audit-test'");
    expect(source).toContain('UiConsistencyAuditTestPage');
  });
});
