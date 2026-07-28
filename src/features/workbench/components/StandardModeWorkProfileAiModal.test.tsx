import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StandardModeWorkProfileAiModal } from './StandardModeWorkProfileAiModal';

const callModel = vi.fn();
const reserveAiCredits = vi.fn();
const settleAiCredits = vi.fn();
const releaseAiCredits = vi.fn();

vi.mock('@/features/models/hooks/useModels', () => ({
  useModels: () => ({
    models: [],
    activeModel: { id: 'model-1', name: '测试模型', baseUrl: 'https://example.com', apiKey: 'key' },
  }),
}));

vi.mock('@/features/models/services/callModel', () => ({ callModel: (...args: unknown[]) => callModel(...args) }));
vi.mock('@/features/credits/services/aiCreditGateway', () => ({
  reserveAiCredits: (...args: unknown[]) => reserveAiCredits(...args),
  settleAiCredits: (...args: unknown[]) => settleAiCredits(...args),
  releaseAiCredits: (...args: unknown[]) => releaseAiCredits(...args),
}));
vi.mock('@/features/prompts/hooks/usePrompts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/prompts/hooks/usePrompts')>();
  return {
    ...actual,
    usePrompts: () => ({
      prompts: [{ name: '标准模式-作品资料优化', category: '内置', content: '自定义内置作品资料提示词' }],
    }),
  };
});

const novel = {
  id: 7,
  title: '旧书名',
  type: 'novel' as const,
  channel: 'male' as const,
  category: '玄幻',
  targetWordCount: 1_000_000,
};

describe('StandardModeWorkProfileAiModal', () => {
  beforeEach(() => {
    callModel.mockReset();
    reserveAiCredits.mockReset().mockResolvedValue({ reservationId: null, estimatedCredits: null });
    settleAiCredits.mockReset().mockResolvedValue(undefined);
    releaseAiCredits.mockReset().mockResolvedValue(undefined);
  });

  it('generates selectable title and synopsis candidates with the configured built-in prompt', async () => {
    callModel.mockResolvedValue(JSON.stringify({
      candidates: [{ title: '系统让我反着修仙', synopsis: '林川得到反向修炼系统，每次失败都会变强。' }],
    }));
    const onApply = vi.fn();
    render(
      <StandardModeWorkProfileAiModal
        isOpen
        novel={novel}
        title="旧书名"
        synopsis="旧简介"
        initialTarget="both"
        onClose={vi.fn()}
        onApply={onApply}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/输入你喜欢的作品书名/), { target: { value: '参考书名' } });
    fireEvent.change(screen.getByPlaceholderText(/书名突出系统/), { target: { value: '强化反差' } });
    fireEvent.click(screen.getByRole('button', { name: '开始生成' }));

    expect(await screen.findByText('系统让我反着修仙')).toBeInTheDocument();
    expect(callModel).toHaveBeenCalledWith(expect.objectContaining({
      prompt: '自定义内置作品资料提示词',
      userContent: expect.stringContaining('用户要求：强化反差'),
    }));
    expect(reserveAiCredits).toHaveBeenCalledWith(expect.objectContaining({ quantity: 5 }));
    expect(settleAiCredits).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '使用此方案' }));
    expect(onApply).toHaveBeenCalledWith({
      title: '系统让我反着修仙',
      synopsis: '林川得到反向修炼系统，每次失败都会变强。',
    });
  });

  it('releases a reserved credit task when model generation fails', async () => {
    callModel.mockRejectedValue(new Error('网络错误'));
    render(
      <StandardModeWorkProfileAiModal
        isOpen
        novel={novel}
        title="旧书名"
        synopsis="旧简介"
        initialTarget="synopsis"
        onClose={vi.fn()}
        onApply={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '只生成简介' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '开始生成' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('生成失败：网络错误'));
    expect(releaseAiCredits).toHaveBeenCalled();
    expect(settleAiCredits).not.toHaveBeenCalled();
  });
});
