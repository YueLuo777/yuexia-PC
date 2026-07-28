import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/prompts/pages/PromptsPage', () => ({
  PromptsPage: ({ initialCategory }: { initialCategory?: string }) => <div>提示词分类：{initialCategory}</div>,
}));

import { BuiltInPromptManagerLauncher } from './BuiltInPromptManagerLauncher';

describe('BuiltInPromptManagerLauncher', () => {
  it('opens the shared prompt manager on the built-in category', async () => {
    render(<BuiltInPromptManagerLauncher />);

    fireEvent.click(screen.getByRole('button', { name: '提示词' }));

    expect(await screen.findByRole('dialog', { name: '内置提示词管理' })).toBeInTheDocument();
    expect(await screen.findByText('提示词分类：内置')).toBeInTheDocument();
  });
});
