import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BrainstormPromptEditModal } from './BrainstormPromptEditModal';

describe('BrainstormPromptEditModal layout', () => {
  it('uses a shorter modal and larger editor text for prompt creation', () => {
    render(
      <BrainstormPromptEditModal
        isOpen
        isCreating
        draft={{ name: '大纲12', description: '', content: '内容' }}
        onDraftChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: '创建提示词' });
    expect(dialog).toHaveClass('h-[min(620px,78vh)]', 'w-[960px]');
    expect(screen.getByRole('heading', { name: '创建提示词' })).toHaveClass('text-lg');
    expect(screen.getByPlaceholderText('名称')).toHaveClass('text-base');
    expect(screen.getByPlaceholderText('说明')).toHaveClass('text-base');
    expect(screen.getByLabelText('提示词内容')).toHaveClass('text-base', 'font-medium', 'leading-7');
    expect(screen.getByText('提示词内容')).toHaveClass('xy-workbench-name-field-caption');
    expect(dialog.querySelector('header')).toHaveClass('cursor-move', 'active:cursor-grabbing');
  });
});
