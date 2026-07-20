import { fireEvent, render, screen } from '@testing-library/react';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { IdentityPositionVariantsTestPage } from './IdentityPositionVariantsTestPage';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/IdentityPositionVariantsTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('IdentityPositionVariantsTestPage', () => {
  it('provides multiple identity positioning variants with a recommended outline option', async () => {
    const source = await readFile(pagePath, 'utf8');
    expect(source).toContain("type VariantId = 'outline' | 'segmented' | 'tag' | 'current'");
    expect(source).toContain('方案一：嵌入式浮动边框');
    expect(source).toContain('方案二：分组分段按钮');
    expect(source).toContain('方案三：分组标签组');
    expect(source).toContain('推荐');
  });

  it('uses real role group names without offering the male protagonist group', () => {
    render(<IdentityPositionVariantsTestPage />);
    fireEvent.click(screen.getByRole('button', { name: /方案二：分组分段按钮/ }));

    expect(screen.queryByRole('button', { name: '男主角' })).not.toBeInTheDocument();
    for (const group of ['女主角', '重要正派角色', '正派配角', '重要反派角色', '反派配角', '龙套角色']) {
      expect(screen.getByRole('button', { name: group })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: '正派配角' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '反派配角' }));
    expect(screen.getByRole('button', { name: '反派配角' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('segmented-role-header-row')).toHaveClass(
      'grid-cols-[232px_minmax(0,1fr)_112px]',
      'min-w-[900px]',
    );
    expect(screen.getByText(/正式人物编辑区约 900px 可用宽度模拟/)).toBeInTheDocument();
  });

  it('registers the page in the in-app test collection', async () => {
    const source = await readFile(collectionPath, 'utf8');
    expect(source).toContain("'/identity-position-variants-test'");
    expect(source).toContain('IdentityPositionVariantsTestPage');
  });
});
