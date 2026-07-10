import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (fileName: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8');

describe('NavigationContextMenuPrototypeTestPage', () => {
  it('captures navigation context-menu requirements in a test-only prototype', () => {
    const source = readSource('NavigationContextMenuPrototypeTestPage.tsx');
    const collectionSource = readSource('TestCollectionPage.tsx');

    expect(source).toContain('左侧导航右键菜单原型');
    expect(source).toContain('只在测试区预览，不写入正式导航配置');
    expect(source).toContain('重命名“{menuItem.label}”');
    expect(source).toContain('隐藏导航');
    expect(source).toContain('新增分割线');
    expect(source).toContain('恢复默认导航');
    expect(source).toContain('恢复隐藏导航');
    expect(source).toContain('<ChevronRight className="h-4 w-4" />');
    expect(source).toContain('hiddenItems.length > 0 ? hiddenItems.map');
    expect(source).toContain('删除分割线');
    expect(source).toContain('draggable');
    expect(source).toContain('reorderItems(current, draggingId, item.id)');
    expect(source).not.toContain('saveNavConfig');

    expect(collectionSource).toContain('NavigationContextMenuPrototypeTestPage');
    expect(collectionSource).toContain('导航右键菜单原型');
    expect(collectionSource).toContain('/navigation-context-menu-prototype-test');
  });
});
