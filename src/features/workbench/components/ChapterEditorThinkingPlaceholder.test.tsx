import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAiThinkingPlaceholder } from '@/features/workbench/model/chapterReviewLog';

import { renderAiThinkingContent } from './chapterEditorPresentation';
import { readChapterEditorSource } from './chapterEditorSource.testUtils';

describe('ChapterEditor review thinking placeholder', () => {
  it('renders the structure-audit first frame as the final thinking card shell', () => {
    render(renderAiThinkingContent(createAiThinkingPlaceholder(0)));

    expect(screen.getByText('正在思考（0 秒）')).toBeInTheDocument();
    expect(screen.queryByText('正在思考...')).not.toBeInTheDocument();
  });

  it('collapses reasoning to one row when the real answer is already present', () => {
    render(
      renderAiThinkingContent(
        '[[THINKING seconds=10 status=done]]\n这里是思考过程\n[[/THINKING]]\n【剧情审核结果】通过',
      ),
    );

    const toggle = screen.getByRole('button', { name: '已思考（用时 10 秒）' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('这里是思考过程')).not.toBeInTheDocument();
    expect(screen.getByText('【剧情审核结果】通过')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('这里是思考过程')).toBeInTheDocument();
  });

  it('automatically collapses once streamed output starts and preserves a manual reopen', () => {
    const reasoningOnly = '[[THINKING seconds=8 status=thinking]]\n流式思考内容\n[[/THINKING]]';
    const { rerender } = render(renderAiThinkingContent(reasoningOnly));

    expect(screen.getByRole('button', { name: '正在思考（8 秒）' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('流式思考内容')).toBeInTheDocument();

    rerender(
      renderAiThinkingContent(
        '[[THINKING seconds=9 status=thinking]]\n流式思考内容\n[[/THINKING]]\n第一段正式内容',
      ),
    );

    const toggle = screen.getByRole('button', { name: '正在思考（9 秒）' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('流式思考内容')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    rerender(
      renderAiThinkingContent(
        '[[THINKING seconds=10 status=done]]\n流式思考内容\n[[/THINKING]]\n第一段正式内容\n第二段正式内容',
      ),
    );

    expect(screen.getByRole('button', { name: '已思考（用时 10 秒）' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('流式思考内容')).toBeInTheDocument();
  });

  it('uses the marker-backed placeholder only for structure audit requests', () => {
    const source = readChapterEditorSource();

    expect(source).toContainSource('return { promptText, userText, chapterContext, requestLog, isStructureAudit };');
    expect(source).toContainSource(
      "const pendingOutput = isStructureAudit ? createAiThinkingPlaceholder(0) : '正在思考...';",
    );
    expect(source).toContainSource('initialOutput: pendingOutput');
    expect(source).toContainSource('output: pendingOutput');
  });
});
