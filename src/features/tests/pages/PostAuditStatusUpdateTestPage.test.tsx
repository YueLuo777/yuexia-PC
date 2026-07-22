import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PostAuditStatusUpdateTestPage } from './PostAuditStatusUpdateTestPage';

describe('PostAuditStatusUpdateTestPage', () => {
  it('uses chapter, original, status result and AI columns in that order', () => {
    render(<PostAuditStatusUpdateTestPage />);

    const workbench = screen.getByTestId('status-four-column-workbench');
    expect(workbench).toHaveClass('grid-cols-[170px_300px_minmax(350px,1fr)_280px]');
    expect(screen.getByText('当前章节原文')).toBeInTheDocument();
    expect(screen.getByText('状态更新栏')).toBeInTheDocument();
    expect(screen.getByText('AI状态更新')).toBeInTheDocument();
    expect(screen.getByText('等待AI分析本章状态')).toBeInTheDocument();
    expect(screen.getByTitle('待更新 第12章 黑石镇')).toHaveClass('xy-detail-outline-number-selected');
    expect(screen.getByText('第一卷 · 黑石风云')).toBeInTheDocument();
    expect(screen.queryByText('原状态')).not.toBeInTheDocument();
  });

  it('discovers正文 objects, groups matched settings and keeps unmatched candidates visible', () => {
    render(<PostAuditStatusUpdateTestPage />);

    expect(screen.getByText(/AI自动扫描正文，再查询设定库/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始智能分析/ }));

    expect(screen.getByRole('button', { name: '设定 · 6' })).toHaveClass('bg-white');
    expect(screen.getByText('已匹配 4')).toBeInTheDocument();
    expect(screen.getByText('未匹配 2')).toBeInTheDocument();
    expect(screen.getAllByText('人物设定').length).toBeGreaterThan(0);
    expect(screen.getAllByText('物品装备').length).toBeGreaterThan(0);
    expect(screen.getAllByText('地点设定').length).toBeGreaterThan(0);
    expect(screen.getByText('未匹配对象 · 2')).toBeInTheDocument();
    expect(screen.getByText('待新建设定 · 0')).toBeInTheDocument();
    expect(screen.getByText(/人物 · 黑袍老人/)).toBeInTheDocument();
    expect(screen.getByText(/称号 · 夜行客/)).toBeInTheDocument();
    expect(screen.getByText(/原状态：青云城；轻伤；持有赤霄剑/)).toBeInTheDocument();
  });

  it('shows matched changes with paragraph evidence after intelligent analysis', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    render(<PostAuditStatusUpdateTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /开始智能分析/ }));

    expect(screen.getByText(/分析完成：发现 5 项明确状态变化/)).toBeInTheDocument();
    expect(screen.getByText('待确认 5')).toBeInTheDocument();
    expect(screen.getAllByText('原状态')).toHaveLength(5);
    expect(screen.getAllByText('更新后')).toHaveLength(5);
    expect(screen.getByText('右肩箭伤加重，右臂活动受限')).toBeInTheDocument();
    expect(screen.getByText('更新依据 · 第4段')).toBeInTheDocument();

    fireEvent.click(screen.getByText('更新依据 · 第4段').closest('button')!);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(screen.getByText(/箭头擦着肩骨穿过/).closest('p')).toHaveClass('border-[#08AACE]', 'bg-[#F3FCFE]');
  });

  it('groups status changes by category and shows the count for every group', () => {
    render(<PostAuditStatusUpdateTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /开始智能分析/ }));
    expect(screen.getByRole('button', { name: '全部 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '人物 3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '道具 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '地点 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '伏笔 0' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '道具 1' }));
    expect(screen.getAllByText('赤霄剑').length).toBeGreaterThan(0);
    expect(screen.queryByText('身体状态')).not.toBeInTheDocument();
  });

  it('lets the user confirm state changes and decide whether unmatched objects become new settings', () => {
    render(<PostAuditStatusUpdateTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /开始智能分析/ }));
    fireEvent.click(screen.getAllByRole('button', { name: '确认更新' })[0]);
    expect(screen.getAllByText('已确认 1').length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: '新建设定' })[0]);
    expect(screen.getByText('待新建设定 · 1')).toBeInTheDocument();
    expect(screen.getByText('等待创建')).toBeInTheDocument();
    expect(screen.getByText(/建议分类：人物设定/)).toBeInTheDocument();
  });

  it('writes the accepted AI status changes back to setting state', () => {
    render(<PostAuditStatusUpdateTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /开始智能分析/ }));
    fireEvent.click(screen.getByRole('button', { name: '确认全部状态' }));
    fireEvent.click(screen.getByRole('button', { name: '写入已确认状态' }));
    expect(screen.getAllByText('已写入设定')).toHaveLength(5);
    expect(screen.getByText('3 写入设定')).toHaveClass('bg-emerald-500');
  });

  it('is registered at the end of the AI workflow test group', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx'), 'utf8');
    const previousPath = source.indexOf("path: '/text-audit-review-workbench-test'");
    const statusPath = source.indexOf("path: '/post-audit-status-update-test'");
    const toolsGroup = source.indexOf("title: '工具测试'");

    expect(source).toContain("import('@/features/tests/pages/PostAuditStatusUpdateTestPage')");
    expect(source).toContain("case '/post-audit-status-update-test':");
    expect(statusPath).toBeGreaterThan(previousPath);
    expect(statusPath).toBeLessThan(toolsGroup);
  });
});
