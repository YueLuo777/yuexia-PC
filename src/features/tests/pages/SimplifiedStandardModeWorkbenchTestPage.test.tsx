import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SimplifiedStandardModeWorkbenchTestPage } from './SimplifiedStandardModeWorkbenchTestPage';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('SimplifiedStandardModeWorkbenchTestPage', () => {
  it('is appended after the professional and standard mode homepage test', () => {
    const collection = readTestCollectionSource();
    expect(collection).toContain("path: '/simplified-standard-mode-workbench-test'");
    expect(collection.indexOf("path: '/mode-switch-novel-library-test'")).toBeLessThan(
      collection.indexOf("path: '/simplified-standard-mode-workbench-test'"),
    );
  });

  it('keeps the nine workflow pages and removes the separate AI configuration panel', () => {
    render(<SimplifiedStandardModeWorkbenchTestPage />);

    const navigation = screen.getByRole('complementary', { name: '标准模式创作步骤' });
    for (const label of ['脑洞', '大纲设定', '章纲', '正文', '审核', '状态更新', '章节梗概', '风格润色', '综合点评']) {
      expect(within(navigation).getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    }
    expect(screen.queryByRole('complementary', { name: '当前功能操作台' })).not.toBeInTheDocument();
    expect(screen.queryByText('AI配置与操作')).not.toBeInTheDocument();
    expect(screen.getByTestId('simplified-stage-area')).toHaveTextContent('生成脑洞');
  });

  it('switches the replicated professional workspaces from the left workflow', () => {
    render(<SimplifiedStandardModeWorkbenchTestPage />);
    const navigation = screen.getByRole('complementary', { name: '标准模式创作步骤' });

    fireEvent.click(within(navigation).getByRole('button', { name: /大纲设定/ }));
    expect(screen.getByTestId('setting-workspace-preview')).toHaveTextContent('设定目录');

    fireEvent.click(within(navigation).getByRole('button', { name: /正文/ }));
    expect(screen.getByTestId('writing-workspace-preview')).toHaveTextContent('未发布');

    fireEvent.click(within(navigation).getByRole('button', { name: /综合点评/ }));
    expect(screen.getByTestId('review-workspace-preview')).toHaveTextContent('网文编辑');
  });

  it('uses one page-level action and reports the result inside the current page', () => {
    render(<SimplifiedStandardModeWorkbenchTestPage />);

    const generateButtons = screen.getAllByRole('button', { name: '生成脑洞' });
    fireEvent.click(generateButtons.at(-1)!);
    expect(screen.getByRole('status')).toHaveTextContent('生成脑洞已完成，结果已填入当前页面');
    expect(screen.getByRole('button', { name: '重新生成脑洞' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '下一步' }));
    expect(screen.getByTestId('setting-workspace-preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '生成整套设定' })).toBeInTheDocument();
  });

  it('keeps brainstorm generation, library preview, and association in the same center page', () => {
    render(<SimplifiedStandardModeWorkbenchTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '脑洞库' }));
    expect(screen.getByTestId('brainstorm-stage-preview')).toHaveTextContent('脑洞目录');

    fireEvent.click(screen.getByRole('button', { name: '关联脑洞' }));
    expect(screen.getByTestId('brainstorm-stage-preview')).toHaveTextContent('预览脑洞内容后');
  });
});
