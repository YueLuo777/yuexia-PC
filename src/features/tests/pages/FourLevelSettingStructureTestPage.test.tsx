import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FourLevelSettingStructureTestPage } from './FourLevelSettingStructureTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('FourLevelSettingStructureTestPage', () => {
  it('keeps the four-level prototype registered in the UI test group', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');

    expect(uiGroup?.items.find((item) => item.path === '/four-level-setting-structure-test')).toMatchObject({
      serial: 29,
      title: '设定模板四级完整展示方案',
      path: '/four-level-setting-structure-test',
    });
    const collectionSource = readTestCollectionSource();
    expect(collectionSource).toContain("const FourLevelSettingStructureTestPage = lazy(() =>");
    expect(collectionSource).toContain("case '/four-level-setting-structure-test':");
  });

  it('shows core settings as four entry and field pairs without a canvas', () => {
    render(<FourLevelSettingStructureTestPage />);

    expect(screen.getByRole('button', { name: '作品设定' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '核心设定' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelectorAll('[data-four-level-display-row]')).toHaveLength(8);
    expect(screen.getByText('4 个三级设定 · 21 个四级设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作品定位' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '小说类型' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '世界排列与连接' })).toBeInTheDocument();
    expect(screen.queryByTestId('mind-map-canvas')).not.toBeInTheDocument();
  });

  it('switches second-level groups and keeps all fourth-level fields selectable', () => {
    render(<FourLevelSettingStructureTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '剧情规划' }));
    expect(document.querySelectorAll('[data-four-level-display-row]')).toHaveLength(6);
    expect(screen.getByText('3 个三级设定 · 13 个四级设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '整体剧情' })).toBeInTheDocument();

    const field = screen.getByRole('button', { name: '开局事件' });
    fireEvent.click(field);
    expect(field).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/当前选中：作品设定 ＞ 剧情规划 ＞ 整体剧情 ＞ 开局事件/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '人物设定' }));
    const secondLevelNavigation = screen.getByRole('navigation', { name: '设定二级分类' });
    expect(within(secondLevelNavigation).getByRole('button', { name: '主角' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '男主角' })).toBeInTheDocument();
  });
});
