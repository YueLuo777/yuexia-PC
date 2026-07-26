import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StandardModeFourStageWorkbenchTestPage } from './StandardModeFourStageWorkbenchTestPage';
import { STANDARD_FOUR_STAGE_STORAGE_KEY } from './standardModeFourStageTestModel';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

function createBook() {
  fireEvent.change(screen.getByPlaceholderText('请输入小说名字'), { target: { value: '测试仙途' } });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '仙侠' } });
  fireEvent.click(screen.getByRole('button', { name: '创建书籍并进入准备阶段' }));
}

describe('StandardModeFourStageWorkbenchTestPage', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STANDARD_FOUR_STAGE_STORAGE_KEY);
    vi.useRealTimers();
  });

  it('keeps test 13 and places the four-stage workflow after it as test 14', () => {
    const collection = readTestCollectionSource();
    const baselineIndex = collection.indexOf("path: '/professional-workbench-baseline-test'");
    const fourStageIndex = collection.indexOf("path: '/standard-mode-four-stage-workbench-test'");

    expect(baselineIndex).toBeGreaterThan(-1);
    expect(fourStageIndex).toBeGreaterThan(baselineIndex);
  });

  it('requires a book name and genre before entering the four stages', () => {
    const view = render(<StandardModeFourStageWorkbenchTestPage />);
    const createButton = screen.getByRole('button', { name: '创建书籍并进入准备阶段' });
    expect(createButton).toBeDisabled();

    createBook();
    expect(screen.getByTestId('standard-four-stage-workbench')).toBeInTheDocument();
    expect(screen.getByText('测试仙途')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '第1步 准备阶段' })).toHaveAttribute('aria-current', 'step');
    expect(window.localStorage.getItem(STANDARD_FOUR_STAGE_STORAGE_KEY)).toContain('测试仙途');

    view.unmount();
    render(<StandardModeFourStageWorkbenchTestPage />);
    expect(screen.queryByTestId('standard-book-setup')).not.toBeInTheDocument();
    expect(screen.getByTestId('standard-four-stage-workbench')).toBeInTheDocument();
    expect(screen.getByText('测试仙途')).toBeInTheDocument();
  });

  it('generates a brainstorm, saves it to the library, and carries it into settings', () => {
    render(<StandardModeFourStageWorkbenchTestPage />);
    createBook();

    fireEvent.click(screen.getByRole('button', { name: '生成脑洞并保存' }));
    expect(screen.getByRole('button', { name: '脑洞库' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('测试仙途', { selector: 'h2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '根据这个脑洞生成设定' }));
    expect(screen.getByRole('button', { name: '第2步 设定阶段' })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('已自动关联脑洞')).toBeInTheDocument();
  });

  it('streams settings, checks completeness, and reaches outline, body, and audit', async () => {
    vi.useFakeTimers();
    render(<StandardModeFourStageWorkbenchTestPage />);
    createBook();
    fireEvent.click(screen.getByRole('button', { name: '第2步 设定阶段' }));
    fireEvent.click(screen.getByRole('button', { name: '开始生成设定' }));

    for (let index = 0; index < 320 && !screen.queryByText('所有设定已生成'); index += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(40);
      });
    }
    expect(screen.getByText('所有设定已生成')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '一键检查' }));
    expect(screen.getByText('全部设定都已填写，可以进入创作阶段。')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '进入创作阶段' }));

    expect(screen.getByTestId('standard-outline-stage')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '生成连贯章纲' }));
    fireEvent.click(screen.getByRole('button', { name: '使用此章纲生成正文' }));
    expect(screen.getByTestId('standard-writing-stage')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '进入审核阶段' }));
    expect(screen.getByTestId('standard-audit-stage')).toBeInTheDocument();
    expect(screen.getAllByRole('button').filter((button) => button.hasAttribute('aria-current'))).toHaveLength(2);
    expect(screen.getByRole('button', { name: '第4步 审核阶段' })).toHaveAttribute('aria-current', 'step');
    fireEvent.click(screen.getByRole('button', { name: '开始剧情审核' }));
    expect(screen.getByText(/正文主线与当前章纲一致/)).toBeInTheDocument();
  });
});
