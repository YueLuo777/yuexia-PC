import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PromptDrivenNovelWorkspaceTestPage } from './PromptDrivenNovelWorkspaceTestPage';
import { PROMPT_NOVEL_WORKFLOW, PROMPT_WORKSPACE_SECTIONS } from './PromptDrivenNovelWorkspaceData';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

const collectionSource = readTestCollectionSource;

describe('PromptDrivenNovelWorkspaceTestPage', () => {
  it('shows prompt-derived setting sections and keeps workflow details out of the setting list', () => {
    render(<PromptDrivenNovelWorkspaceTestPage />);

    expect(screen.getByTestId('prompt-driven-novel-workspace-test')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '提示词整理后的设定目录' })).toBeInTheDocument();
    for (const title of ['作品核心设定', '人物与关系设定', '世界资料库', '写作与审核规则', '剧情规划资料']) {
      expect(screen.getByRole('button', { name: new RegExp(title) })).toBeInTheDocument();
    }
    expect(screen.getByText('故事类型')).toBeInTheDocument();
    expect(screen.getByText('作品卖点')).toBeInTheDocument();
    expect(screen.getByText('核心设定红线')).toBeInTheDocument();
    expect(screen.queryByText('生成章节正文')).not.toBeInTheDocument();
  });

  it('switches to the AI writing workflow and shows reads, outputs, and next step', () => {
    render(<PromptDrivenNovelWorkspaceTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /AI生成流程/ }));
    expect(screen.getByRole('navigation', { name: 'AI小说生成流程目录' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /读取白皮书/ })).toBeInTheDocument();
    expect(screen.getByText('AI需要读取')).toBeInTheDocument();
    expect(screen.getByText('AI需要产出')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /初始化项目/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /发布章节并更新资料/ }));
    expect(screen.getByText('发布不是结束，要把正文造成的变化写回各个设定和摘要。')).toBeInTheDocument();
    expect(screen.getAllByText('进入下一章')).toHaveLength(2);
    expect(screen.getByText('人物/势力/物品状态变化')).toBeInTheDocument();
  });

  it('keeps the workflow sequence and setting source boundaries explicit', () => {
    expect(PROMPT_WORKSPACE_SECTIONS.find((section) => section.id === 'core-work')?.sourceFiles).toContain('创意白皮书模板.md');
    expect(PROMPT_WORKSPACE_SECTIONS.find((section) => section.id === 'world-library')?.fields.map((field) => field.label)).toContain('剧情摘要库');
    expect(PROMPT_WORKSPACE_SECTIONS.find((section) => section.id === 'writing-rules')?.fields.map((field) => field.label)).toContain('审核规则');
    expect(PROMPT_NOVEL_WORKFLOW.map((step) => step.title)).toEqual([
      '读取白皮书',
      '初始化项目',
      '完善设定档案',
      '规划整书与分卷',
      '生成章节正文',
      '审核与修改',
      '发布章节并更新资料',
      '进入下一章',
    ]);
    expect(PROMPT_NOVEL_WORKFLOW.find((step) => step.title === '发布章节并更新资料')?.outputs).toContain('章节摘要、卷摘要、全书主线和伏笔进度');
  });

  it('keeps the workflow test after the approved taxonomy test is retired', () => {
    const source = collectionSource();
    const current = source.indexOf("path: '/prompt-driven-novel-workspace-test'");

    expect(current).toBeGreaterThan(-1);
    expect(source).not.toContain("path: '/prompt-based-setting-taxonomy-test'");
    expect(source).toContain("const PromptDrivenNovelWorkspaceTestPage = lazy(() =>");
    expect(source).toContain("case '/prompt-driven-novel-workspace-test':");
  });
});
