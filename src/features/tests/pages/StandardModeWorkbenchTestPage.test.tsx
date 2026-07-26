import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import type { StandardModeNovel } from './standardModeWorkbenchTestData';

vi.mock('./StandardModeProfessionalEditorPreview', () => ({
  StandardModeProfessionalEditorPreview: ({ novel }: { novel: StandardModeNovel }) => (
    <div data-testid="professional-mode-editor-preview">
      <span>{novel.title}</span>
      <span>共用专业模式正文页</span>
    </div>
  ),
}));

import { StandardModeWorkbenchTestPage } from './StandardModeWorkbenchTestPage';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('StandardModeWorkbenchTestPage', () => {
  it('is registered after the existing UI comparisons', () => {
    const collection = readTestCollectionSource();
    expect(collection).toContain("path: '/standard-mode-workbench-test'");
    expect(collection.indexOf("path: '/ui-consistency-comparison-test'")).toBeLessThan(
      collection.indexOf("path: '/standard-mode-workbench-test'"),
    );
  });

  it('opens the shared professional editor when the user clicks a novel body', () => {
    render(<StandardModeWorkbenchTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '打开《九重天劫》正文' }));

    expect(screen.getByTestId('professional-mode-editor-preview')).toBeInTheDocument();
    expect(screen.getByText('共用专业模式正文页')).toBeInTheDocument();
  });

  it('creates a blank novel and starts from brainstorm generation', () => {
    render(<StandardModeWorkbenchTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '新建小说' }));
    expect(screen.getByRole('dialog', { name: '新建小说' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /新建空白小说/ }));

    expect(screen.getByTestId('standard-mode-workbench')).toBeInTheDocument();
    expect(screen.getByText('未命名小说 · 创作工作台')).toBeInTheDocument();
    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('生成脑洞');
    expect(screen.queryByLabelText('标准模式流程图')).not.toBeInTheDocument();
  });

  it('links a brainstorm, chooses a setting template, and continues in the same workbench', () => {
    render(<StandardModeWorkbenchTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '新建小说' }));
    fireEvent.click(screen.getByRole('button', { name: /根据脑洞扩展/ }));
    const brainstormDirectory = screen.getByRole('complementary', { name: '脑洞目录' });
    fireEvent.click(within(brainstormDirectory).getByRole('button', { name: /我在万界开仙坊/ }));
    expect(within(brainstormDirectory).getAllByRole('button').filter((button) => button.hasAttribute('aria-current'))).toHaveLength(1);
    expect(within(brainstormDirectory).getByRole('button', { name: /我在万界开仙坊/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('brainstorm-selection-preview')).toHaveTextContent('仙坊每天随机连接一个修真世界');
    fireEvent.click(screen.getByRole('button', { name: '选择这个脑洞' }));
    fireEvent.click(screen.getByRole('button', { name: '关联并进入工作台' }));

    expect(screen.getByText('我在万界开仙坊 · 创作工作台')).toBeInTheDocument();
    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('当前已关联：我在万界开仙坊');
    const consolePanel = screen.getByRole('complementary', { name: '当前功能操作台' });
    fireEvent.click(within(consolePanel).getByRole('button', { name: '选择设定模板' }));
    expect(screen.getByRole('dialog', { name: '选择设定模板' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /精简开书模板/ }));
    fireEvent.click(screen.getByRole('button', { name: '使用这个模板' }));

    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('大纲设定');
    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('当前模板：精简开书模板');
  });

  it('uses the left directory, center workspace, right console, and clickable workflow stages', () => {
    render(<StandardModeWorkbenchTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '进入《九重天劫》创作工作台' }));

    const left = screen.getByRole('complementary', { name: '创作功能区' });
    const center = screen.getByTestId('standard-mode-center-content');
    const consolePanel = screen.getByRole('complementary', { name: '当前功能操作台' });
    expect(left).toHaveTextContent('导入已有小说');
    expect(within(left).getByTestId('workflow-shortcuts')).toHaveClass('grid-cols-2');
    expect(center).toHaveTextContent('章纲目录');
    expect(consolePanel).toHaveTextContent('生成本章章纲');

    fireEvent.click(within(left).getByRole('button', { name: '大纲设定' }));
    const settingWorkspace = screen.getByTestId('setting-workspace-preview');
    expect(settingWorkspace).toHaveTextContent('设定名');
    expect(settingWorkspace).toHaveTextContent('所属分组');
    expect(settingWorkspace.querySelector('section')).toHaveClass('overflow-x-hidden');
    expect(settingWorkspace.querySelector('input')).toHaveClass('min-w-0');
    expect(settingWorkspace.querySelector('select')).toHaveClass('min-w-0');
    expect(settingWorkspace.querySelector('textarea')).toHaveClass('min-w-0');
    expect(within(left).getByRole('button', { name: '大纲设定' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(within(left).getByRole('button', { name: '风格润色' }));
    expect(screen.getByTestId('polish-workspace-preview')).toHaveTextContent('润色稿');
    expect(consolePanel).toHaveTextContent('生成润色稿');

    fireEvent.click(within(left).getByRole('button', { name: '正文' }));
    expect(screen.getByTestId('writing-workspace-preview')).toHaveTextContent('未发布');
    expect(screen.getByLabelText('正文编辑区')).toBeInTheDocument();
  });

  it('switches all brainstorm child functions and reports button actions', () => {
    render(<StandardModeWorkbenchTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '进入《万界商途》创作工作台' }));

    const left = screen.getByRole('complementary', { name: '创作功能区' });
    const brainstormShortcuts = within(left).getByTestId('brainstorm-shortcuts');
    expect(brainstormShortcuts).toHaveClass('grid-cols-2');
    expect(within(brainstormShortcuts).getByRole('button', { name: '关联脑洞' })).toHaveClass('col-span-2');
    expect(within(brainstormShortcuts).getByRole('button', { name: '生成脑洞' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.click(within(left).getByRole('button', { name: '进入脑洞库' }));
    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('脑洞目录');
    expect(within(brainstormShortcuts).getByRole('button', { name: '进入脑洞库' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(within(left).getByRole('button', { name: '关联脑洞' }));
    expect(screen.getByTestId('standard-mode-center-content')).toHaveTextContent('关联脑洞');

    fireEvent.click(within(left).getByRole('button', { name: '导入已有小说' }));
    expect(screen.getByRole('status')).toHaveTextContent('已打开：智能导入已有小说');
  });

  it('builds the editor preview from the real professional components', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'StandardModeProfessionalEditorPreview.tsx'),
      'utf8',
    );

    expect(source).toContain("import { ChapterEditor } from '@/features/workbench/components/ChapterEditor'");
    expect(source).toContain("import { WorkbenchHeader } from '@/features/workbench/components/WorkbenchHeader'");
    expect(source).toContain(
      "import { WorkbenchWritingLayout } from '@/features/workbench/components/WorkbenchWritingLayout'",
    );
    expect(source).not.toContain('aria-label="正文内容"');
  });
});
