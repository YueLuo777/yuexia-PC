import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { readSettingGenerationFlow } from '@/features/owner-test-mode/model/settingGenerationFlow';

import { SettingGenerationFlowLauncher } from './SettingGenerationFlowLauncher';

describe('SettingGenerationFlowLauncher', () => {
  beforeEach(() => localStorage.clear());

  it('opens the owner configuration and saves step changes', () => {
    render(<SettingGenerationFlowLauncher />);

    fireEvent.click(screen.getByRole('button', { name: '设定生成流程' }));
    expect(screen.getByRole('dialog', { name: '设定生成流程' })).toBeInTheDocument();
    expect(screen.getByText('世界基础')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('步骤名称'), { target: { value: '先生成世界观' } });
    fireEvent.click(screen.getByRole('button', { name: '保存流程' }));

    expect(readSettingGenerationFlow().steps[0].name).toBe('先生成世界观');
    expect(screen.getByText('已保存')).toBeInTheDocument();
  });
});
