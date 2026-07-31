import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DeferredTemplateFeatureTestPage } from './DeferredTemplateFeatureTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('DeferredTemplateFeatureTestPage', () => {
  it('keeps both advanced template features adjacent and ahead of later unfinished prototypes', () => {
    const undone = testGroups.find((group) => group.title === '未做');
    expect(undone?.items.slice(-3).map((item) => ({ serial: item.serial, path: item.path }))).toEqual([
      { serial: 40, path: '/custom-setting-template-idea-test' },
      { serial: 41, path: '/custom-generation-order-idea-test' },
      { serial: 42, path: '/story-analysis-fusion-test' },
    ]);
    const source = readTestCollectionSource();
    expect(source).toContain("case '/custom-setting-template-idea-test':");
    expect(source).toContain("case '/custom-generation-order-idea-test':");
  });

  it('explains that custom templates are deferred without deleting the future scope', () => {
    render(<DeferredTemplateFeatureTestPage kind="custom-template" />);
    expect(screen.getByRole('heading', { name: '自定义设定模板（未做）' })).toBeInTheDocument();
    expect(screen.getByText('自由编辑一级到五级设定结构')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '未来五级设定颜色' })).toHaveTextContent('五级');
  });

  it('keeps generation ordering out of the beginner flow', () => {
    render(<DeferredTemplateFeatureTestPage kind="generation-order" />);
    expect(screen.getByRole('heading', { name: '用户自定义生成顺序（未做）' })).toBeInTheDocument();
    expect(screen.getByText(/当前新手版：按照用户选中的模板/)).toBeInTheDocument();
    expect(screen.getByText('发现循环依赖和错误顺序时立即阻止保存')).toBeInTheDocument();
  });
});
