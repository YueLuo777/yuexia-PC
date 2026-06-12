import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readPageSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'SoftwareModalStyleTestPage.tsx'), 'utf8')
);

const readTestCollectionSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TestCollectionPage.tsx'), 'utf8')
);

describe('SoftwareModalStyleTestPage', () => {
  it('shows the reference popup style with current modal content scenarios', () => {
    const source = readPageSource();

    expect(source).toContain("type PopupVariant = 'work' | 'navigation' | 'system' | 'shortcut'");
    expect(source).toContain('章节右键菜单');
    expect(source).toContain('重命名');
    expect(source).toContain('修改章节');
    expect(source).toContain('发布章节');
    expect(source).toContain('移入分组');
    expect(source).toContain('暂留选项');
    expect(source).toContain('删除章节');
    expect(source).not.toContain('私密作品设置');
    expect(source).not.toContain('书封管理');
    expect(source).not.toContain('发布平台设置');
    expect(source).toContain('新增分割线');
    expect(source).toContain('拖拽分割线');
    expect(source).toContain('删除分割线');
    expect(source).toContain('记忆关联');
    expect(source).toContain('右键左划回首页');
    expect(source).toContain('rounded-[8px] border border-[#e5e7eb] bg-white');
    expect(source).toContain('shadow-[0_10px_28px_rgba(15,23,42,0.14)]');
    expect(source).toContain('text-[#ff3b30]');
    expect(source).toContain('当前章节操作');
  });

  it('is available from the test collection only', () => {
    const source = readTestCollectionSource();

    expect(source).toContain('SoftwareModalStyleTestPage');
    expect(source).toContain("path: '/software-modal-style-test'");
    expect(source).toContain("badge: 'Modal UI'");
    expect(source).toContain("case '/software-modal-style-test':");
  });
});
