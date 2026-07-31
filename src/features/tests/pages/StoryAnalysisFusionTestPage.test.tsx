import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StoryAnalysisFusionTestPage } from '@/features/tests/pages/StoryAnalysisFusionTestPage';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

describe('StoryAnalysisFusionTestPage', () => {
  it('keeps the new prototype at the end of the unfinished group', () => {
    const unfinishedItems = testGroups.find((group) => group.title === '未做')?.items ?? [];

    expect(unfinishedItems.at(-1)).toMatchObject({
      serial: 42,
      path: '/story-analysis-fusion-test',
      title: '文风蒸馏与拆书迭代融合方案',
    });
  });

  it('places Writing DNA checks after plot and text review without auto-overwriting the chapter', () => {
    render(<StoryAnalysisFusionTestPage />);

    expect(screen.getByTestId('style-audit-prototype')).toBeInTheDocument();
    expect(screen.getByText('剧情审核')).toBeInTheDocument();
    expect(screen.getByText('文本审核')).toBeInTheDocument();
    expect(screen.getAllByText('文风审查').length).toBeGreaterThan(0);
    expect(screen.getByText(/默认不发送原始语料库，也不把审查结果直接覆盖正文/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '选择文风：已授权参考风格' }));
    expect(screen.getByText('授权语料 · 20篇')).toBeInTheDocument();
  });

  it('creates a genre-transfer blueprint from abstract assets instead of copying story expression', () => {
    render(<StoryAnalysisFusionTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '拆书 + 类型迁移' }));

    expect(screen.getByTestId('deconstruction-prototype')).toBeInTheDocument();
    expect(screen.getByText('爽点公式')).toBeInTheDocument();
    expect(screen.getByText(/丢弃：人物名、专有名词、具体桥段、原句、章节顺序/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '女频悬疑' }));
    fireEvent.click(screen.getByRole('button', { name: '生成迁移蓝图' }));
    expect(screen.getByText(/已形成「女频悬疑」迁移蓝图/)).toBeInTheDocument();
  });

  it('shows the MIT notice duties and separates repository licenses from source-content rights', () => {
    render(<StoryAnalysisFusionTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '融合架构与许可' }));

    expect(screen.getByTestId('fusion-license-prototype')).toHaveTextContent('oh-story-claudecode');
    expect(screen.getByTestId('fusion-license-prototype')).toHaveTextContent('writing-dna-skill');
    expect(screen.getAllByText('MIT')).toHaveLength(2);
    expect(screen.getByText('许可证合规不等于原文合规')).toBeInTheDocument();
    expect(screen.getByText(/不以作者姓名作为生成按钮/)).toBeInTheDocument();
  });
});
