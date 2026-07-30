import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CURRENT_FANTASY_FIELD_COUNT,
  FANTASY_REDUCTION_PLANS,
  FantasyTemplateFieldReductionTestPage,
} from '@/features/tests/pages/FantasyTemplateFieldReductionTestPage';
import { testGroups } from '@/features/tests/pages/testCollectionGroups';

describe('FantasyTemplateFieldReductionTestPage', () => {
  it('registers test 35 at the end of the UI group without replacing the formal template', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');

    expect(uiGroup?.items.at(-1)).toMatchObject({
      serial: 35,
      title: '玄幻仙侠字段精简方案',
      path: '/fantasy-template-field-reduction-test',
    });
    expect(CURRENT_FANTASY_FIELD_COUNT).toBe(155);
    expect(FANTASY_REDUCTION_PLANS).toHaveLength(5);
    expect(FANTASY_REDUCTION_PLANS.slice(0, 4).map((plan) => (
      plan.categories.reduce((total, category) => total + category.fields.length, 0)
    ))).toEqual([44, 72, 58, 66]);
    expect(FANTASY_REDUCTION_PLANS[4].categories.reduce((total, category) => total + category.fields.length, 0)).toBe(88);
    expect(FANTASY_REDUCTION_PLANS.every((plan) => (
      plan.categories.every((category) => category.count === category.fields.length)
    ))).toBe(true);
  });

  it('compares five read-only plans and switches their visible details', () => {
    render(<FantasyTemplateFieldReductionTestPage />);

    expect(screen.getByText('只读方案对比 · 不生成模板')).toBeInTheDocument();
    expect(screen.getByText('7类 · 19设定 · 155字段')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /B · 连载实用/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/保留影响连续剧情/)).toBeInTheDocument();
    expect(screen.getByText('主角·金手指规则')).toBeInTheDocument();
    expect(screen.queryByText('势力·内部问题与当前状态')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /E · 分阶段解锁/ }));

    expect(screen.getByRole('button', { name: /E · 分阶段解锁/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/明确列出建书时的38项/)).toBeInTheDocument();
    expect(screen.getByText('势力·内部问题与当前状态')).toBeInTheDocument();
    expect(screen.getByText(/不会修改玄幻仙侠模板/)).toBeInTheDocument();
  });
});
