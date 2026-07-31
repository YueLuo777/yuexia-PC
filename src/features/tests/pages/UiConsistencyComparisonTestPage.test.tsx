import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UiConsistencyComparisonTestPage } from './UiConsistencyComparisonTestPage';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('UiConsistencyComparisonTestPage', () => {
  beforeEach(() => localStorage.clear());

  it('stays registered and exposes all five comparisons', () => {
    const collection = readTestCollectionSource();
    expect(collection).toContain("path: '/ui-consistency-comparison-test'");

    render(<UiConsistencyComparisonTestPage />);
    expect(screen.getByText('空状态为什么看起来不一样')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看分类：弹窗外壳' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看分类：分段切换' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看分类：选中颜色' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看分类：资料选择行' })).toBeInTheDocument();
  });

  it('keeps the four current empty states and places the recommended standard last', () => {
    render(<UiConsistencyComparisonTestPage />);

    expect(screen.getByText('共享标准版')).toBeInTheDocument();
    expect(screen.getByText('小号纯文字版')).toBeInTheDocument();
    expect(screen.getByText('大号纯文字版')).toBeInTheDocument();
    expect(screen.getByText('弹窗列表版')).toBeInTheDocument();

    const recommendation = screen.getByTestId('recommended-empty-state');
    expect(recommendation).toHaveTextContent('推荐统一版');
    expect(recommendation).toHaveTextContent('暂无内容');
    expect(recommendation).toHaveTextContent('创建第一项内容后，将在这里显示。');
    expect(screen.getByRole('button', { name: '新建内容' })).toBeInTheDocument();
    expect(recommendation).toHaveTextContent('可以统一');
    expect(recommendation).toHaveTextContent('必须保留');

    const examples = screen.getAllByRole('heading', { level: 3 });
    expect(examples).toHaveLength(5);
    expect(examples.at(-1)).toHaveTextContent('推荐统一版');
  });

  it('lets the user inspect color and material-row differences', () => {
    render(<UiConsistencyComparisonTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '查看分类：选中颜色' }));
    expect(screen.getAllByText('#08AACE')).toHaveLength(3);
    expect(screen.getAllByText('#08B3D9')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '查看分类：资料选择行' }));
    fireEvent.click(screen.getByRole('button', { name: '选择作品定位' }));
    expect(screen.getByText('已勾选 1 项')).toBeInTheDocument();
  });

  it('lets the owner choose one option per comparison and review the summary', () => {
    render(<UiConsistencyComparisonTestPage />);

    const recommended = screen.getByRole('checkbox', { name: '选择方案：推荐统一版' });
    expect(recommended).toBeChecked();
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('已选择 3/5');
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('空状态推荐统一版');

    fireEvent.click(screen.getByRole('button', { name: '查看分类：弹窗外壳' }));
    const settingsModal = screen.getByRole('checkbox', { name: '选择方案：设置类自绘弹窗' });
    const standardModal = screen.getByRole('checkbox', { name: '选择方案：统一弹窗' });
    expect(standardModal).toBeChecked();
    fireEvent.click(settingsModal);
    expect(settingsModal).toBeChecked();
    fireEvent.click(standardModal);
    expect(standardModal).toBeChecked();
    expect(settingsModal).not.toBeChecked();
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('已选择 3/5');
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('弹窗外壳统一弹窗');

    fireEvent.click(screen.getByRole('button', { name: '清空' }));
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('已选择 0/5');
  });

  it('copies the grouped result through the fallback when clipboard access is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('document is not focused')) },
    });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });

    render(<UiConsistencyComparisonTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '复制选择结果' }));

    expect(await screen.findByText('已复制选择结果')).toBeInTheDocument();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('keeps the formalized choices after the comparison page is reopened', () => {
    const { unmount } = render(<UiConsistencyComparisonTestPage />);
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('已选择 3/5');
    unmount();

    render(<UiConsistencyComparisonTestPage />);
    expect(screen.getByRole('checkbox', { name: '选择方案：推荐统一版' })).toBeChecked();
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('分段切换未选择');
    expect(screen.getByTestId('comparison-selection-summary')).toHaveTextContent('资料选择行未选择');
  });
});
