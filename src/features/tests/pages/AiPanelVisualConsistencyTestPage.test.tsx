import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AiPanelVisualConsistencyTestPage } from './AiPanelVisualConsistencyTestPage';

describe('AiPanelVisualConsistencyTestPage', () => {
  it('shows the three real action variants inside one shared visual skeleton', () => {
    render(<AiPanelVisualConsistencyTestPage />);
    expect(screen.getByText('设定页面')).toBeInTheDocument();
    expect(screen.getByText('章纲页面')).toBeInTheDocument();
    expect(screen.getByText('正文页面')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '智能导入设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '替换章纲' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '替换正文' })).toBeInTheDocument();
    const settingPanel = screen.getByText('设定页面').closest('article') as HTMLElement;
    expect(within(settingPanel).queryByRole('button', { name: '复制内容' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制内容' })).toBeInTheDocument();
    expect(screen.getAllByText('清空')).toHaveLength(3);
    expect(screen.getAllByText('关联')).toHaveLength(3);
    expect(document.querySelectorAll('.w-12').length).toBeGreaterThanOrEqual(3);
  });

  it('keeps each preview interactive without calling a real model', () => {
    render(<AiPanelVisualConsistencyTestPage />);
    const input = screen.getByLabelText('章纲页面请输入要求');
    fireEvent.change(input, { target: { value: '加强结尾悬念' } });
    fireEvent.click(input.parentElement?.querySelector('.xy-ai-inline-send') as HTMLButtonElement);
    expect(screen.getByText(/追加要求：加强结尾悬念/)).toBeInTheDocument();
  });

  it('registers the page at the end of the UI group in the in-app test collection', () => {
    const collection = readFileSync(resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx'), 'utf8');
    const previousUiEntry = collection.indexOf("path: '/ui-consistency-audit-test'");
    const consistencyEntry = collection.indexOf("path: '/ai-panel-visual-consistency-test'");
    const nextGroup = collection.indexOf("title: 'AI 链路测试'");

    expect(collection).toContainSource('const AiPanelVisualConsistencyTestPage = lazy(() =>');
    expect(collection).toContainSource("case '/ai-panel-visual-consistency-test':");
    expect(consistencyEntry).toBeGreaterThan(previousUiEntry);
    expect(consistencyEntry).toBeLessThan(nextGroup);
  });

  it('keeps the formal setting input between association and import actions and segments the outline link', () => {
    const settingView = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/workbenchSettingLibraryView.tsx'),
      'utf8',
    );
    const outlineView = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/workbenchOutlineAiPanel.tsx'),
      'utf8',
    );
    const settingInput = settingView.indexOf('<AiInlineInput');
    const settingImport = settingView.indexOf('智能导入设定', settingInput);

    expect(settingInput).toBeGreaterThan(settingView.indexOf('activeSettingLinkSource'));
    expect(settingImport).toBeGreaterThan(settingInput);
    expect(outlineView).toContainSource('label="大纲"');
    expect(outlineView).toContainSource('prefixLabel="关联"');
    expect(outlineView).toContainSource('groupClassName="flex h-10 w-[134px]');
    expect(outlineView).toContainSource('prefixClassName="grid w-12');
  });
});
