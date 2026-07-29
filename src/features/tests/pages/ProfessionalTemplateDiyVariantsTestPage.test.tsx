import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProfessionalTemplateDiyVariantsTestPage } from './ProfessionalTemplateDiyVariantsTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('ProfessionalTemplateDiyVariantsTestPage', () => {
  it('registers the DIY comparison as test 32 at the end of the UI group', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    expect(uiGroup?.items.at(-1)).toMatchObject({
      serial: 32,
      title: '专业模板DIY编辑多方案',
      path: '/professional-template-diy-variants-test',
    });

    const source = readTestCollectionSource();
    expect(source).toContain('const ProfessionalTemplateDiyVariantsTestPage = lazy(() =>');
    expect(source).toContain("case '/professional-template-diy-variants-test':");
  });

  it('protects every level by default and requires an explicit unlock before deletion', () => {
    render(<ProfessionalTemplateDiyVariantsTestPage />);
    const page = screen.getByTestId('professional-template-diy-variants-test');
    expect(page).toHaveAttribute('data-active-variant', 'columns');
    expect(page).toHaveAttribute('data-domain-count', '7');

    const monsterDelete = screen.getByRole('button', { name: '删除一级分类：怪物图鉴' });
    expect(monsterDelete).toBeDisabled();
    expect(screen.getByRole('button', { name: '一级删除已锁定，点击解锁' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '一级删除已锁定，点击解锁' }));
    expect(monsterDelete).toBeEnabled();
    fireEvent.click(monsterDelete);
    expect(page).toHaveAttribute('data-domain-count', '6');
  });

  it('builds and removes a complete path, then keeps it while comparing all four designs', () => {
    render(<ProfessionalTemplateDiyVariantsTestPage />);
    const page = screen.getByTestId('professional-template-diy-variants-test');
    const domainColumn = screen.getByRole('region', { name: 'DIY一级分类' });
    fireEvent.change(within(domainColumn).getByRole('textbox', { name: '输入一级分类名称' }), {
      target: { value: 'A' },
    });
    fireEvent.click(within(domainColumn).getByRole('button', { name: '新增' }));

    const groupColumn = screen.getByRole('region', { name: 'DIY二级分组' });
    fireEvent.change(within(groupColumn).getByRole('textbox', { name: '输入二级分组名称' }), {
      target: { value: 'A分组' },
    });
    fireEvent.click(within(groupColumn).getByRole('button', { name: '新增' }));

    const entryColumn = screen.getByRole('region', { name: 'DIY三级设定' });
    fireEvent.change(within(entryColumn).getByRole('textbox', { name: '输入三级设定名称' }), {
      target: { value: 'A设定' },
    });
    fireEvent.click(within(entryColumn).getByRole('button', { name: '新增' }));

    const fieldColumn = screen.getByRole('region', { name: 'DIY四级设定' });
    fireEvent.change(within(fieldColumn).getByRole('textbox', { name: '输入四级设定名称' }), {
      target: { value: 'A字段' },
    });
    fireEvent.click(within(fieldColumn).getByRole('button', { name: '新增' }));
    expect(page).toHaveAttribute('data-domain-count', '8');

    fireEvent.click(screen.getByRole('button', { name: /F · 层级树/ }));
    expect(page).toHaveAttribute('data-active-variant', 'tree');
    expect(screen.getByRole('region', { name: '可折叠结构树' })).toHaveTextContent('A字段');

    fireEvent.click(screen.getByRole('button', { name: /G · 分层卡片/ }));
    expect(page).toHaveAttribute('data-active-variant', 'cards');
    expect(screen.getByRole('region', { name: 'DIY分层卡片' })).toHaveTextContent('A字段');

    fireEvent.click(screen.getByRole('button', { name: /H · 路径工作台/ }));
    expect(page).toHaveAttribute('data-active-variant', 'path');
    const pathList = screen.getByRole('region', { name: 'DIY完整路径清单' });
    expect(pathList).toHaveTextContent('A字段');
    expect(within(pathList).getAllByRole('button')[0]).toHaveTextContent('AA分组A设定A字段');

    fireEvent.click(screen.getByRole('button', { name: /E · 四栏联动/ }));
    fireEvent.click(screen.getByRole('button', { name: '一级删除已锁定，点击解锁' }));
    fireEvent.click(screen.getByRole('button', { name: '二级删除已锁定，点击解锁' }));
    fireEvent.click(screen.getByRole('button', { name: '三级删除已锁定，点击解锁' }));
    fireEvent.click(screen.getByRole('button', { name: '四级删除已锁定，点击解锁' }));
    fireEvent.click(screen.getByRole('button', { name: '删除四级设定：A字段' }));
    fireEvent.click(screen.getByRole('button', { name: '删除三级设定：A设定' }));
    fireEvent.click(screen.getByRole('button', { name: '删除二级分组：A分组' }));
    fireEvent.click(screen.getByRole('button', { name: '删除一级分类：A' }));
    expect(page).toHaveAttribute('data-domain-count', '7');
  });
});
