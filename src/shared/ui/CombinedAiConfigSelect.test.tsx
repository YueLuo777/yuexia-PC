import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CombinedAiConfigSelect } from './CombinedAiConfigSelect';

describe('CombinedAiConfigSelect dropdown design', () => {
  it('keeps the original selectors while applying the floating dropdown design', () => {
    const onModelChange = vi.fn();
    const onPromptChange = vi.fn();
    const onModelManage = vi.fn();
    const onPromptManage = vi.fn();

    const { container } = render(
      <CombinedAiConfigSelect
        modelValue="deepseek"
        promptValue="brainstorm"
        modelOptions={[
          { value: 'deepseek', label: 'DeepSeek' },
          { value: 'gpt-5', label: 'GPT-5' },
        ]}
        promptOptions={[
          { value: 'group', label: '创作', disabled: true, variant: 'group', count: 1 },
          { value: 'brainstorm', label: '脑洞', variant: 'groupedOption', metaLabel: '默认' },
        ]}
        onModelChange={onModelChange}
        onPromptChange={onPromptChange}
        onModelManage={onModelManage}
        onPromptManage={onPromptManage}
      />,
    );

    expect(container.firstElementChild).toHaveClass('pt-3');
    expect(container.firstElementChild).not.toHaveClass('bg-[#F4F8FA]', 'rounded-2xl');
    expect(container.querySelector('.grid.h-11')).toHaveClass('border-2', 'border-[#08AACE]');
    fireEvent.click(screen.getByRole('button', { name: 'DeepSeek' }));
    expect(container.querySelector('.top-\\[calc\\(100\\%\\+0\\.5rem\\)\\]')).toHaveClass(
      'rounded-2xl',
      'border-white',
    );
    fireEvent.click(screen.getByRole('button', { name: 'GPT-5' }));
    expect(onModelChange).toHaveBeenCalledWith('gpt-5');

    fireEvent.click(screen.getByRole('button', { name: '脑洞' }));
    expect(screen.getByLabelText('已选择')).toHaveClass('text-emerald-500');
    expect(screen.getByText('默认')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '模型管理' }));
    fireEvent.click(screen.getByRole('button', { name: '提示词管理' }));
    expect(onModelManage).toHaveBeenCalledOnce();
    expect(onPromptManage).toHaveBeenCalledOnce();
  });
});
