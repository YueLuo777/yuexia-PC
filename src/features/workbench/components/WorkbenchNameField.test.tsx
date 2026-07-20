import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchNameField } from './WorkbenchNameField';

describe('WorkbenchNameField', () => {
  it('keeps one static frame and caption node when the setting tab label changes', () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <WorkbenchNameField label="设定名" value="玄幻世界" placeholder="设定名" onValueChange={onValueChange} />,
    );
    const frame = container.querySelector('.xy-workbench-name-field');
    const caption = container.querySelector('.xy-workbench-name-field-caption');

    rerender(
      <WorkbenchNameField label="人物姓名" value="萧炎" placeholder="填写人物姓名" onValueChange={onValueChange} />,
    );

    expect(container.querySelector('.xy-workbench-name-field')).toBe(frame);
    expect(container.querySelector('.xy-workbench-name-field-caption')).toBe(caption);
    expect(screen.getByLabelText('人物姓名')).toHaveValue('萧炎');
  });

  it('does not replace or transform the static caption when the input receives focus', () => {
    render(<WorkbenchNameField label="势力名称" value="魂殿" placeholder="势力名称" onValueChange={vi.fn()} />);
    const caption = screen.getByText('势力名称');

    fireEvent.focus(screen.getByLabelText('势力名称'));

    expect(screen.getByText('势力名称')).toBe(caption);
    expect(caption).toHaveClass('xy-workbench-name-field-caption');
  });
});
