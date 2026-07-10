import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (fileName: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8');

describe('NavigationContextMenuPrototypeTestPage', () => {
  it('captures navigation context-menu requirements in a test-only prototype', () => {
    const source = readSource('NavigationContextMenuPrototypeTestPage.tsx');
    const collectionSource = readSource('TestCollectionPage.tsx');

    expect(source).toContainSource('左侧导航右键菜单原型');
    expect(source).toContainSource('只在测试区预览，不写入正式导航配置');
    expect(source).toContainSource('重命名“{menuItem.label}”');
    expect(source).toContainSource('隐藏导航');
    expect(source).toContainSource('新增分割线');
    expect(source).toContainSource('恢复默认导航');
    expect(source).toContainSource('恢复隐藏导航');
    expect(source).toContainSource('<ChevronRight className="h-4 w-4" />');
    expect(source).toContainSource('hiddenItems.length > 0 ? (');
    expect(source).toContainSource('hiddenItems.map((item) => (');
    expect(source).toContainSource('删除分割线');
    expect(source).toContainSource('draggable');
    expect(source).toContainSource('reorderItems(current, draggingId, item.id)');
    expect(source).not.toContainSource('saveNavConfig');

    expect(collectionSource).toContainSource('NavigationContextMenuPrototypeTestPage');
    expect(collectionSource).toContainSource('导航右键菜单原型');
    expect(collectionSource).toContainSource('/navigation-context-menu-prototype-test');
  });
});
