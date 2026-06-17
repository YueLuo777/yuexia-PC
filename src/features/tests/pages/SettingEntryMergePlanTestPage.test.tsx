import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingEntryMergePlanTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingEntryMergePlanTestPage', () => {
  it('shows three setting entry merge plans with clear before and after counts', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('const mergePlans');
    expect(source).toContain('const tagSchemeOptions');
    expect(source).toContain("id: 'seven-tabs'");
    expect(source).toContain("id: 'four-tabs'");
    expect(source).toContain("id: 'three-tabs'");
    expect(source).toContain("id: 'two-layer'");
    expect(source).toContain('当前七标签');
    expect(source).toContain('四标签');
    expect(source).toContain('三标签');
    expect(source).toContain('双层标签');
    expect(source).toContain('世界资料');
    expect(source).toContain('追踪规则');
    expect(source).toContain("id: 'light'");
    expect(source).toContain("id: 'balanced'");
    expect(source).toContain("id: 'compact'");
    expect(source).toContain('轻合并');
    expect(source).toContain('中合并');
    expect(source).toContain('重合并');
    expect(source).toContain('合并前');
    expect(source).toContain('合并后');
    expect(source).toContain('推荐先试');
    expect(source).toContain('作品设定');
    expect(source).toContain('道具资源');
    expect(source).toContain('地点场景');
    expect(source).toContain('伏笔线索');
    expect(source).toContain('书写规则');
    expect(source).toContain('const entryPurposeNotes');
    expect(source).toContain('设定条目作用');
    expect(source).toContain('给 AI 判断题材、卖点、读者期待和不能偏离的方向');
    expect(source).toContain('给 AI 生成细纲和正文时检查能力上限、升级条件和代价');
    expect(source).toContain('用来记录章节推进后发生变化的资料');
  });

  it('adds the merge plan prototype to the software test collection navigation', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingEntryMergePlanTestPage');
    expect(source).toContain('/setting-entry-merge-plan-test');
    expect(source).toContain('设定条目合并方案测试');
    expect(source).toContain('测试作品设定、道具资源、地点场景、伏笔线索和书写规则的条目合并粒度。');
  });
});
