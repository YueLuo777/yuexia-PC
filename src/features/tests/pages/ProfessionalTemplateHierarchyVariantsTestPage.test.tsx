import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProfessionalTemplateHierarchyVariantsTestPage } from './ProfessionalTemplateHierarchyVariantsTestPage';
import { professionalFieldPaths } from './professionalTemplateHierarchyModel';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('ProfessionalTemplateHierarchyVariantsTestPage', () => {
  it('registers professional hierarchy variants as test 31', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    expect(uiGroup?.items.find((item) => item.serial === 31)).toMatchObject({
      serial: 31,
      title: '专业模板四级层级多方案',
      path: '/professional-template-hierarchy-variants-test',
    });

    const source = readTestCollectionSource();
    expect(source).toContain('const ProfessionalTemplateHierarchyVariantsTestPage = lazy(() =>');
    expect(source).toContain("case '/professional-template-hierarchy-variants-test':");
  });

  it('shows all four levels and supports removal at each hierarchy level', () => {
    render(<ProfessionalTemplateHierarchyVariantsTestPage />);
    const page = screen.getByTestId('professional-template-hierarchy-variants-test');
    expect(page).toHaveAttribute('data-selected-total', String(professionalFieldPaths.length));
    expect(screen.getByText('一级', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByText('二级', { selector: 'span' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('三级', { selector: 'span' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('四级', { selector: 'span' }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('checkbox', { name: '保留三级设定：作品定位' }));
    expect(Number(page.getAttribute('data-removed-total'))).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('checkbox', { name: '保留四级设定：小说类型' }));
    expect(screen.getByRole('checkbox', { name: '保留四级设定：小说类型' })).toBeChecked();
  });

  it('keeps removals while switching between tree, columns, matrix, and cards', () => {
    render(<ProfessionalTemplateHierarchyVariantsTestPage />);
    const page = screen.getByTestId('professional-template-hierarchy-variants-test');
    fireEvent.click(screen.getByRole('checkbox', { name: '保留四级设定：小说类型' }));
    expect(page).toHaveAttribute('data-removed-total', '1');

    fireEvent.click(screen.getByRole('button', { name: /B · 四栏联动/ }));
    expect(page).toHaveAttribute('data-active-variant', 'columns');
    expect(screen.getByTestId('professional-hierarchy-columns')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /C · 路径矩阵/ }));
    expect(page).toHaveAttribute('data-active-variant', 'matrix');
    const matrix = screen.getByTestId('professional-hierarchy-matrix');
    fireEvent.change(within(matrix).getByRole('textbox', { name: '搜索完整设定路径' }), {
      target: { value: '小说类型' },
    });
    expect(within(matrix).getByRole('checkbox', { name: /保留路径：.*小说类型/ })).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /D · 结构卡片/ }));
    expect(page).toHaveAttribute('data-active-variant', 'cards');
    expect(screen.getByTestId('professional-hierarchy-cards')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '全部移除' }));
    expect(page).toHaveAttribute('data-selected-total', '0');
    expect(screen.getByRole('button', { name: '确认当前结构' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '恢复完整结构' }));
    expect(page).toHaveAttribute('data-selected-total', String(professionalFieldPaths.length));
  });
});
