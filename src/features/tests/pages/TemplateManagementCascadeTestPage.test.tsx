import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TemplateManagementCascadeTestPage } from './TemplateManagementCascadeTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('TemplateManagementCascadeTestPage', () => {
  it('registers the cascade prototype at the end of the UI group', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    const item = uiGroup?.items.at(-1);

    expect(item).toMatchObject({
      serial: 36,
      title: '模板管理逐级选择方案',
      path: '/template-management-cascade-test',
    });
    const collectionSource = readTestCollectionSource();
    expect(collectionSource).toContain('const TemplateManagementCascadeTestPage = lazy(() =>');
    expect(collectionSource).toContain("case '/template-management-cascade-test':");
  });

  it('orders the xianxia cards and keeps metadata below the description', () => {
    render(<TemplateManagementCascadeTestPage />);

    const light = screen.getByRole('button', { name: '测试选择模板：玄幻仙侠（轻量版）' });
    const standard = screen.getByRole('button', { name: '测试选择模板：玄幻仙侠（标准版）' });
    const full = screen.getByRole('button', { name: '测试选择模板：玄幻仙侠（完整版）' });

    expect(light.compareDocumentPosition(standard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(standard.compareDocumentPosition(full) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(light).getByText('男频 · 玄幻仙侠')).toBeInTheDocument();
    expect(within(light).getByText(/只保留开书和前期创作/)).toBeInTheDocument();
  });

  it('moves through the first three levels and shows the selected fourth-level fields', () => {
    render(<TemplateManagementCascadeTestPage />);

    const firstLevel = screen.getByRole('navigation', { name: '测试一级设定' });
    const secondLevel = screen.getByRole('navigation', { name: '测试二级设定' });
    const thirdLevel = screen.getByRole('navigation', { name: '测试三级设定' });
    expect(within(firstLevel).getByRole('button', { name: /作品设定/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(secondLevel).getByRole('button', { name: /核心设定/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(thirdLevel).getByRole('button', { name: /作品定位/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('小说类型')).toBeInTheDocument();

    fireEvent.click(within(thirdLevel).getByRole('button', { name: /核心脑洞/ }));
    expect(screen.getByRole('heading', { name: '核心脑洞' })).toBeInTheDocument();
    expect(screen.getByText('核心创意')).toBeInTheDocument();

    fireEvent.click(within(firstLevel).getByRole('button', { name: /人物设定/ }));
    expect(within(secondLevel).getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/第四级设定 · 共/)).toBeInTheDocument();
  });

  it('keeps the three source tabs available', () => {
    render(<TemplateManagementCascadeTestPage />);

    expect(screen.getByRole('tab', { name: '男频' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: '女频' }));
    expect(screen.getByRole('tab', { name: '女频' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: '测试选择模板：现代总裁' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '我的模板' }));
    expect(screen.getByText(/暂无“我的模板”/)).toBeInTheDocument();
  });
});
