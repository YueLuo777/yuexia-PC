import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MultiAiWritingIdeaTestPage } from '@/features/tests/pages/MultiAiWritingIdeaTestPage';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

describe('MultiAiWritingIdeaTestPage', () => {
  it('registers the idea at the end of the unfinished group', () => {
    const unfinishedGroup = testGroups.at(-1);

    expect(unfinishedGroup?.title).toBe('未做');
    expect(unfinishedGroup?.items.at(-1)).toMatchObject({
      serial: 33,
      title: '多 AI 一键生成正文',
      path: '/multi-ai-writing-idea-test',
    });
  });

  it('records the models, comparison flow, and future safeguards without claiming implementation', () => {
    render(<MultiAiWritingIdeaTestPage />);

    expect(screen.getByText('一键调用多个 AI 生成正文')).toBeInTheDocument();
    expect(screen.getByText('仅记录，尚未实现')).toBeInTheDocument();
    expect(screen.getByText('GPT')).toBeInTheDocument();
    expect(screen.getByText('Kimi')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek')).toBeInTheDocument();
    expect(screen.getByText('计划中的使用流程')).toBeInTheDocument();
    expect(screen.getByText('以后实现时必须保留的控制')).toBeInTheDocument();
  });
});
