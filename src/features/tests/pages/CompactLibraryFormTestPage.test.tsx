import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/CompactLibraryFormTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('CompactLibraryFormTestPage', () => {
  it('renders a focused normal-size compact library form', async () => {
    const source = await readFile(pagePath, 'utf8');
    expect(source).toContainSource('资料库紧凑行式表单');
    expect(source).toContainSource('短字段不铺满');
    expect(source).toContainSource('w-[180px]');
    expect(source).toContainSource('w-[260px]');
    expect(source).toContainSource('h-20 min-w-0 flex-1');
    expect(source).toContainSource('此测试只验证资料库表单密度');
  });

  it('replaces the old unified preview in the UI test group', async () => {
    const source = await readFile(collectionPath, 'utf8');
    const navigationPrototype = source.indexOf("path: '/navigation-context-menu-prototype-test'");
    const compactForm = source.indexOf("path: '/compact-library-form-test'");
    expect(source).toContainSource('CompactLibraryFormTestPage');
    expect(compactForm).toBeGreaterThan(navigationPrototype);
    expect(source).not.toContainSource('UnifiedUiSystemPreviewTestPage');
    expect(source).not.toContainSource('/unified-ui-system-preview-test');
  });
});
