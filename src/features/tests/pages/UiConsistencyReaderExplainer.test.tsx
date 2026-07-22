import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UiConsistencyReaderExplainer } from './UiConsistencyReaderExplainer';

describe('UiConsistencyReaderExplainer', () => {
  it('makes preview and explicit selection visibly different', () => {
    render(<UiConsistencyReaderExplainer />);

    fireEvent.click(screen.getByRole('button', { name: '仙侠经营' }));
    expect(screen.getByRole('heading', { name: '正在预览：仙侠经营' })).toBeInTheDocument();
    expect(screen.getByText('已选 0 项')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认关联' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: '关联仙侠经营' }));
    expect(screen.getByText('已选 1 项')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认关联' })).toBeEnabled();
  });

  it('keeps one shell while exposing multi-select and optional third-column differences', () => {
    render(<UiConsistencyReaderExplainer />);

    fireEvent.click(screen.getByRole('tab', { name: '关联其他设定' }));
    expect(screen.getByRole('checkbox', { name: '关联世界结构' })).toBeInTheDocument();
    expect(screen.getByText('多选')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '章纲关联资料' }));
    expect(screen.getByText('已选资料')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '关联第11章章纲' })).toBeInTheDocument();
  });
});
