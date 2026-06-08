import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlotChainTabbedLayoutTestPage } from './PlotChainTabbedLayoutTestPage';

const readPlotChainTabbedLayoutTestPageSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PlotChainTabbedLayoutTestPage.tsx'), 'utf8');
};

describe('PlotChainTabbedLayoutTestPage', () => {
  it('splits plot chain generation and preview into two working tabs', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    expect(screen.getByText('剧情链双标签布局测试')).toBeInTheDocument();
    expect(screen.getByText('生成第6号剧情点')).toBeInTheDocument();
    expect(screen.getByText('链尾剧情点')).toBeInTheDocument();
    expect(screen.getByText('AI 判断')).toBeInTheDocument();
    expect(screen.getByText('候选A：住户留下旧钥匙')).toBeInTheDocument();
    expect(screen.getByText('未写剧情')).toBeInTheDocument();
    expect(screen.getByText('已写剧情')).toBeInTheDocument();
    expect(screen.queryByText(/备选/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /剧情链预览/ }));

    expect(screen.getByText('剧情链衔接预览')).toBeInTheDocument();
    expect(screen.getByText('剧情链总览')).toBeInTheDocument();
    expect(screen.getByText('链尾 5')).toBeInTheDocument();
    expect(screen.getByText('主线可写度 92')).toBeInTheDocument();
    expect(screen.queryByText(/衔接到/)).not.toBeInTheDocument();
    expect(screen.getByText(/下一步推荐方向/)).toBeInTheDocument();
  });

  it('keeps the chain sidebar active across tabs and lets numeric entries select plot points', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    const sidebar = screen.getByText('未写剧情').closest('section');
    expect(sidebar).toBeTruthy();

    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: '4' }));
    expect(screen.getByText(/当前剧情点 4/)).toBeInTheDocument();
    expect(screen.queryByText('当前承接')).not.toBeInTheDocument();
    expect(screen.getByText('链尾剧情点')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /剧情链预览/ }));

    expect(screen.queryByText(/当前选中 4/)).not.toBeInTheDocument();
    expect(screen.getAllByText('物业公司掩盖灵脉事故').length).toBeGreaterThan(0);
  });

  it('appends generated candidates as the next chain tail and switches to total preview', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    fireEvent.click(screen.getAllByRole('button', { name: '加入为6号' })[0]);

    expect(screen.getByText('剧情链总览')).toBeInTheDocument();
    expect(screen.getByText('链尾 6')).toBeInTheDocument();
    expect(screen.getAllByText(/住户留下旧钥匙/).length).toBeGreaterThan(0);
    expect(screen.getByText('接下来建议')).toBeInTheDocument();

    const unwrittenSection = screen.getByText('未写剧情').closest('section');
    expect(unwrittenSection).toBeTruthy();
    expect(within(unwrittenSection as HTMLElement).getByRole('button', { name: '6' })).toBeInTheDocument();
  });

  it('only shows AI next-step suggestions on the largest plot point number at the chain tail', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    expect(screen.queryByText('接下来建议')).not.toBeInTheDocument();

    const sidebar = screen.getByText('未写剧情').closest('section');
    expect(sidebar).toBeTruthy();
    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: '5' }));

    expect(screen.getByText('接下来建议')).toBeInTheDocument();
    expect(screen.getAllByText(/主角发现维修铭牌能控水/).length).toBeGreaterThan(0);
  });

  it('keeps AI next-step suggestions on the chain tail even after the tail is marked written', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    const sidebar = screen.getByText('未写剧情').closest('section');
    expect(sidebar).toBeTruthy();
    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: /剧情链预览/ }));
    fireEvent.click(screen.getAllByRole('button', { name: '标为已写' }).find((button) => (
      button.closest('section')?.textContent?.includes('主角发现维修铭牌能控水')
    )) as HTMLElement);

    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: '4' }));

    expect(screen.queryByText('接下来建议')).not.toBeInTheDocument();
    expect(screen.queryByText(/衔接到 5/)).not.toBeInTheDocument();

    const writtenSection = screen.getByText('已写剧情').closest('section');
    expect(writtenSection).toBeTruthy();
    fireEvent.click(within(writtenSection as HTMLElement).getByRole('button', { name: '5' }));

    expect(screen.getByText('接下来建议')).toBeInTheDocument();
    expect(screen.getAllByText(/主角发现维修铭牌能控水/).length).toBeGreaterThan(0);
  });

  it('moves plot points between unwritten and written groups from the preview tab', () => {
    render(<PlotChainTabbedLayoutTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /剧情链预览/ }));
    expect(screen.getAllByRole('button', { name: '标为已写' }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: '标为已写' })[0]);

    const unwrittenSection = screen.getByText('未写剧情').closest('section');
    const writtenSection = screen.getByText('已写剧情').closest('section');
    expect(unwrittenSection).toBeTruthy();
    expect(writtenSection).toBeTruthy();
    expect(within(unwrittenSection as HTMLElement).queryByRole('button', { name: '3' })).not.toBeInTheDocument();
    expect(within(writtenSection as HTMLElement).getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '移回未写' }).length).toBeGreaterThan(0);
  });

  it('keeps preview card status actions on the content row instead of an empty top row', async () => {
    const source = await readPlotChainTabbedLayoutTestPageSource();

    expect(source).toContain('border-2 bg-white shadow-sm');
    expect(source).toContain('bg-[#DDF7FC] text-[#078fb0]');
    expect(source).toContain('剧情链总览');
    expect(source).toContain('加入为{nextPointId}号');
    expect(source).not.toContain('mb-3 flex items-center justify-end');
    expect(source).toContain('className="flex w-full items-start gap-3 text-left"');
    expect(source).toContain('className="flex shrink-0 flex-col items-end gap-3"');
  });
});
