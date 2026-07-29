import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BuiltInAiProductIdeaTestPage } from '@/features/tests/pages/BuiltInAiProductIdeaTestPage';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

describe('BuiltInAiProductIdeaTestPage', () => {
  it('keeps the built-in AI idea in the unfinished group before later recorded ideas', () => {
    const unfinishedGroup = testGroups.at(-1);

    expect(unfinishedGroup?.title).toBe('未做');
    expect(unfinishedGroup?.items).toContainEqual(expect.objectContaining({
      title: '月下写作内置免费 AI 方案',
      path: '/built-in-ai-product-idea-test',
    }));
  });

  it('records the recommendation, installation, operation, and safety boundaries', () => {
    render(<BuiltInAiProductIdeaTestPage />);

    expect(screen.getByText('月下写作内置免费 AI 助手')).toBeInTheDocument();
    expect(screen.getByText('仅记录，尚未实现')).toBeInTheDocument();
    expect(screen.getByText('月下AI·轻量')).toBeInTheDocument();
    expect(screen.getByText('月下AI·专业')).toBeInTheDocument();
    expect(screen.getByText('自动推荐与安装链路')).toBeInTheDocument();
    expect(screen.getByText('AI 操作安全边界')).toBeInTheDocument();
    expect(screen.getByText(/AI 识别意图与参数/)).toBeInTheDocument();
  });
});
