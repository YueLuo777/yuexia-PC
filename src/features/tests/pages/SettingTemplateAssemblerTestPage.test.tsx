import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SettingTemplateAssemblerTestPage } from './SettingTemplateAssemblerTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('SettingTemplateAssemblerTestPage', () => {
  it('keeps the assembler registered as test 30 in the UI group', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    expect(uiGroup?.items.find((item) => item.path === '/setting-template-assembler-test')).toMatchObject({
      serial: 30,
      title: '快速设定模板装配器方案',
      path: '/setting-template-assembler-test',
    });

    const source = readTestCollectionSource();
    expect(source).toContain("const SettingTemplateAssemblerTestPage = lazy(() =>");
    expect(source).toContain("case '/setting-template-assembler-test':");
  });

  it('starts from the recommended preset with explicit checkbox selection', () => {
    render(<SettingTemplateAssemblerTestPage />);
    const primaryNavigation = screen.getByRole('complementary', { name: '一级设定分类' });

    expect(screen.getByRole('button', { name: /标准模板/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(primaryNavigation).getByRole('button', { name: /^作品设定/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '核心设定' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('checkbox', { name: '小说类型' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '故事发生时代' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '一句话写清主线' })).not.toBeChecked();
    expect(screen.queryByTestId('mind-map-canvas')).not.toBeInTheDocument();
  });

  it('supports presets, field selection, global search, and live summary', () => {
    render(<SettingTemplateAssemblerTestPage />);
    const page = screen.getByTestId('setting-template-assembler-test');
    const standardCount = Number(page.getAttribute('data-selected-total'));

    fireEvent.click(screen.getByRole('button', { name: /精简模板/ }));
    const compactCount = Number(page.getAttribute('data-selected-total'));
    expect(compactCount).toBeLessThan(standardCount);

    fireEvent.click(screen.getByRole('button', { name: /完整模板/ }));
    const completeCount = Number(page.getAttribute('data-selected-total'));
    expect(completeCount).toBeGreaterThan(standardCount);

    const targetField = screen.getByRole('checkbox', { name: '小说类型' });
    fireEvent.click(targetField);
    expect(targetField).not.toBeChecked();
    expect(screen.getByRole('button', { name: /完整模板/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /标准模板/ })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.change(screen.getByRole('textbox', { name: '搜索全部设定' }), {
      target: { value: '金手指限制' },
    });
    expect(screen.getByText(/人物设定 ＞ 主角 ＞ 男主角 ＞ 金手指限制与代价/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '搜索结果：金手指限制与代价' })).toBeChecked();

    fireEvent.change(screen.getByRole('textbox', { name: '搜索全部设定' }), { target: { value: '' } });
    const primaryNavigation = screen.getByRole('complementary', { name: '一级设定分类' });
    fireEvent.click(within(primaryNavigation).getByRole('button', { name: /^人物设定/ }));
    const secondLevel = screen.getByRole('navigation', { name: '二级设定分类' });
    expect(within(secondLevel).getByRole('button', { name: '主角' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '清空全部' }));
    expect(page).toHaveAttribute('data-selected-total', '0');
    expect(screen.getByRole('button', { name: /精简模板/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /标准模板/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /完整模板/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '使用当前模板' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '恢复推荐' }));
    expect(page).toHaveAttribute('data-selected-total', String(standardCount));
    expect(screen.getByRole('button', { name: /标准模板/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
