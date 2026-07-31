import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AiRankingBookSearchIdeaTestPage } from '@/features/tests/pages/AiRankingBookSearchIdeaTestPage';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

describe('AiRankingBookSearchIdeaTestPage', () => {
  it('keeps the idea registered in the unfinished group', () => {
    const unfinishedGroup = testGroups.at(-1);

    expect(unfinishedGroup?.title).toBe('未做');
    expect(unfinishedGroup?.items.find((item) => item.path === '/ai-ranking-book-search-idea-test')).toMatchObject({
      serial: 34,
      title: 'AI 排行榜找书',
      path: '/ai-ranking-book-search-idea-test',
    });
  });

  it('records requirements, source verification, and safeguards without claiming implementation', () => {
    render(<AiRankingBookSearchIdeaTestPage />);

    expect(screen.getByRole('heading', { name: 'AI 排行榜找书' })).toBeInTheDocument();
    expect(screen.getByText('仅记录，尚未实现')).toBeInTheDocument();
    expect(screen.getByText('用户可以提出的找书要求')).toBeInTheDocument();
    expect(screen.getByText('计划中的找书流程')).toBeInTheDocument();
    expect(screen.getByText('以后实现时必须保留的核对规则')).toBeInTheDocument();
    expect(screen.getByText(/不得编造书名、排名或来源/)).toBeInTheDocument();
  });
});
