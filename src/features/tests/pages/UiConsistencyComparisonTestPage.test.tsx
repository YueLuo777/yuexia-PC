import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { UiConsistencyComparisonTestPage } from './UiConsistencyComparisonTestPage';

describe('UiConsistencyComparisonTestPage', () => {
  it('is registered at the end of the UI group and exposes all five comparisons', () => {
    const collection = readFileSync(resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx'), 'utf8');
    expect(collection).toContain("path: '/ui-consistency-comparison-test'");
    expect(collection.indexOf("path: '/ai-thinking-shell-variants-test'")).toBeLessThan(
      collection.indexOf("path: '/ui-consistency-comparison-test'"),
    );

    render(<UiConsistencyComparisonTestPage />);
    expect(screen.getByText('空状态为什么看起来不一样')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /弹窗外壳/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /分段切换/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选中颜色/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /资料选择行/ })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /选中颜色/ }));
    expect(screen.getByText('#08AACE')).toBeInTheDocument();
    expect(screen.getByText('#08B3D9')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /资料选择行/ }));
    fireEvent.click(screen.getByRole('button', { name: '选择作品定位' }));
    expect(screen.getByText('已勾选 1 项')).toBeInTheDocument();
  });
});
