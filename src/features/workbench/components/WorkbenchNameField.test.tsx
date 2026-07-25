import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
    expect(frame).toHaveAttribute('data-workbench-header-control', 'true');
  });

  it('does not replace or transform the static caption when the input receives focus', () => {
    render(<WorkbenchNameField label="势力名称" value="魂殿" placeholder="势力名称" onValueChange={vi.fn()} />);
    const caption = screen.getByText('势力名称');

    fireEvent.focus(screen.getByLabelText('势力名称'));

    expect(screen.getByText('势力名称')).toBe(caption);
    expect(caption).toHaveClass('xy-workbench-name-field-caption');
  });

  it('keeps the common header height while allowing only its width proportion to change', () => {
    const { container } = render(
      <WorkbenchNameField label="设定名" value="基础设定" width={260} placeholder="设定名" onValueChange={vi.fn()} />,
    );
    const frame = container.querySelector('.xy-workbench-name-field') as HTMLElement;

    expect(frame).toHaveStyle({ width: '260px', minWidth: '260px', maxWidth: '260px' });
    expect(frame).toHaveAttribute('data-workbench-header-control', 'true');
  });

  it('uses the same embedded border title typography as setting field cards', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-09.css'), 'utf8');

    expect(styles).toContain('.xy-workbench-name-field-caption {');
    expect(styles).toContain('left: 24px;');
    expect(styles).toContain('max-width: calc(100% - 48px);');
    expect(styles).toContain('font-size: 1rem;');
    expect(styles).toContain('font-weight: 900;');
    expect(styles).toContain('line-height: 24px;');
    expect(styles).toContain('transform: translateY(-50%);');
    expect(styles).toContain('padding: 0 1.5rem 2px;');
    expect(styles).toContain('.xy-workbench-name-field-input:disabled {');
    expect(styles).toContain('color: #020617;');
    expect(styles).toContain('opacity: 1;');
  });
});
