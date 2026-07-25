import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AiInlineInput } from './AiInlineInput';

describe('AiInlineInput', () => {
  it('uses the shared transparent border backplate for its embedded label', () => {
    render(
      <AiInlineInput
        value="帮我设定一个主角"
        onChange={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        label="请输入要求"
      />,
    );

    expect(screen.getByText('请输入要求')).toHaveClass('xy-border-embedded-transparent-backplate');
  });
});
