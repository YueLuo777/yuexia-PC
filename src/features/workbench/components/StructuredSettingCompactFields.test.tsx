import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StructuredSettingCompactFields } from './StructuredSettingCompactFields';
import type { StructuredSettingFieldSet } from './workbenchStructuredSettings';

const fieldSet: StructuredSettingFieldSet = {
  id: 'work-core-cheat-advantage',
  entryType: '基础设定',
  entryTitle: '主角金手指/优势',
  gridColumnsClassName: 'grid-cols-2',
  fields: [
    { key: 'abilitySource', title: '能力来源' },
    { key: 'coreFunction', title: '核心功能' },
    { key: 'remainingUses', title: '剩余次数' },
    { key: 'hiddenTruth', title: '隐藏真相' },
  ],
};

describe('StructuredSettingCompactFields layout', () => {
  it('fills rows with equal medium fields and keeps short and full layouts distinct', () => {
    render(
      <StructuredSettingCompactFields
        fieldSet={fieldSet}
        fieldKeys={fieldSet.fields.map((field) => field.key)}
        values={{}}
        onFieldChange={vi.fn()}
      />,
    );

    const abilitySource = screen.getByLabelText('能力来源');
    const coreFunction = screen.getByLabelText('核心功能');
    const remainingUses = screen.getByLabelText('剩余次数');
    const hiddenTruth = screen.getByLabelText('隐藏真相');

    expect(abilitySource.tagName).toBe('TEXTAREA');
    expect(coreFunction.tagName).toBe('TEXTAREA');
    expect(abilitySource.closest('label')).toHaveClass('sm:col-span-6');
    expect(coreFunction.closest('label')).toHaveClass('sm:col-span-6');
    expect(abilitySource.closest('label')).not.toHaveClass('xl:col-span-4');
    expect(remainingUses.tagName).toBe('INPUT');
    expect(remainingUses.closest('label')).toHaveClass('xl:col-span-3');
    expect(hiddenTruth.tagName).toBe('TEXTAREA');
    expect(hiddenTruth.closest('label')).toHaveClass('sm:col-span-12');
  });
});
