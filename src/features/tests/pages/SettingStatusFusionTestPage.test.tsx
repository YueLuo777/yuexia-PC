import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SettingStatusFusionTestPage } from './SettingStatusFusionTestPage';

describe('SettingStatusFusionTestPage', () => {
  it('keeps the current setting visible beside the status timeline', () => {
    render(<SettingStatusFusionTestPage />);

    expect(screen.getByTestId('setting-status-fusion-workbench')).toHaveClass(
      'grid-cols-[220px_minmax(520px,1fr)_340px]',
    );
    expect(screen.getAllByText('林月').length).toBeGreaterThan(0);
    expect(screen.getByText(/当前设定始终显示，不再切换基础\/状态页面/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '设定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态 · 2' })).toBeInTheDocument();
    expect(screen.getByText('待确认更新')).toBeInTheDocument();
    expect(screen.getByText('历史状态')).toBeInTheDocument();
    expect(screen.getByText('更新依据')).toBeInTheDocument();
  });

  it('filters field history and shows the source evidence inline', () => {
    render(<SettingStatusFusionTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '查看字段：外貌' }));
    expect(screen.getByText('待确认 1')).toBeInTheDocument();
    expect(screen.getByText('历史变化 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('第12章第4段 · 查看依据'));
    expect(screen.getByText(/换过的白色劲装很快又被右肩渗出的血染红/)).toBeInTheDocument();
    expect(screen.getByText(/外貌属于可变化字段/)).toBeInTheDocument();
  });

  it('writes a confirmed update into the current value and field history', () => {
    render(<SettingStatusFusionTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '查看字段：外貌' }));
    fireEvent.click(screen.getByTitle('确认外貌'));
    expect(screen.getByText('换上白色劲装，右肩缠着已经渗血的绷带。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '状态 · 1' })).toBeInTheDocument();
    expect(screen.getAllByText(/第12章 · 外貌/).length).toBeGreaterThan(0);
    expect(screen.getByText('当前范围没有待确认更新')).toBeInTheDocument();
  });

  it('uses the same workspace for items and foreshadow settings', () => {
    render(<SettingStatusFusionTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '打开设定：赤霄剑' }));
    expect(screen.getAllByText('赤霄剑').length).toBeGreaterThan(0);
    expect(screen.getAllByText('当前持有者').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '状态 · 1' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '打开设定：夜行客身份' }));
    expect(screen.getByText('伏笔内容')).toBeInTheDocument();
    expect(screen.getAllByText('当前阶段').length).toBeGreaterThan(0);
  });

  it('keeps automatic matching in the setting assistant instead of requiring manual linking', () => {
    render(<SettingStatusFusionTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '设定' }));
    expect(screen.getByText('设定助手')).toBeInTheDocument();
    expect(screen.getByText(/已自动匹配：人物设定 \/ 林月/)).toBeInTheDocument();
    expect(screen.getByText(/不需要手动关联/)).toBeInTheDocument();
  });

  it('is registered after the status flow test at the end of the AI group', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx'), 'utf8');
    const statusPath = source.indexOf("path: '/post-audit-status-update-test'");
    const fusionPath = source.indexOf("path: '/setting-status-fusion-test'");
    const toolsGroup = source.indexOf("title: '工具测试'");

    expect(source).toContain("import('@/features/tests/pages/SettingStatusFusionTestPage')");
    expect(source).toContain("case '/setting-status-fusion-test':");
    expect(fusionPath).toBeGreaterThan(statusPath);
    expect(fusionPath).toBeLessThan(toolsGroup);
  });
});
