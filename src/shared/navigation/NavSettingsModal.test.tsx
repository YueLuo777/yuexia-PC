import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('NavSettingsModal flat navigation editing', () => {
  it('removes zone management from the navigation settings UI', () => {
    const source = readSource('NavSettingsModal.tsx');

    expect(source).toContain("title: '导航'");
    expect(source).toContain('支持双击改名、隐藏显示、拖拽排序和分割线位置。');
    expect(source).toContain('config.flatMap((group) => (');
    expect(source).toContain('const draftItems = draft[0]?.items ?? [];');
    expect(source).toContain("dividerAfterItemTo: '/novels'");
    expect(source).toContain('导航分割线位置');
    expect(source).toContain('updateDividerAfterItem');
    expect(source).toContain('不显示分割线');
    expect(source).toContain('在「{item.label}」后面');
    expect(source).not.toContain('新增专区');
    expect(source).not.toContain('隐藏专区');
    expect(source).not.toContain('恢复专区');
    expect(source).not.toContain('空专区');
    expect(source).not.toContain('跨专区');
    expect(source).not.toContain('handleAddGroup');
    expect(source).not.toContain('toggleGroupHidden');
    expect(source).not.toContain('editingGroup');
  });
});
