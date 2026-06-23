import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingClearContextMenuTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('SettingClearContextMenuTestPage', () => {
  it('previews domain-specific clear actions inside context menus with two confirmations', () => {
    const source = readFileSync(testPagePath, 'utf8');
    const collectionSource = readFileSync(collectionPagePath, 'utf8');

    expect(source).toContain('右键清空菜单测试');
    expect(source).toContain("itemLabel: '角色'");
    expect(source).toContain("itemLabel: '势力'");
    expect(source).toContain("itemLabel: '道具资源'");
    expect(source).toContain("itemLabel: '怪物'");
    expect(source).toContain("itemLabel: '伏笔'");
    expect(source).toContain("return target === 'groups' ? `清空${domain.itemLabel}分组` : `清空${domain.itemLabel}`;");
    expect(source).toContain("setConfirmState({ ...confirmState, step: 2 });");
    expect(source).toContain("confirmState.step === 1 ? '确认，继续' : getClearLabel(confirmState.domain, confirmState.target)");
    expect(source).toContain('这个测试页只模拟，不会写入正式数据。');

    expect(collectionSource).toContain('SettingClearContextMenuTestPage');
    expect(collectionSource).toContain('设定清空右键菜单测试');
    expect(collectionSource).toContain('/setting-clear-context-menu-test');
  });
});
