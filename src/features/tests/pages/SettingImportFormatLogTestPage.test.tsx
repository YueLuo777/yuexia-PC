import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingImportFormatLogTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SettingImportFormatLogTestPage', () => {
  it('previews the format tab inside the output log test page', async () => {
    const source = await readTestPageSource();

    expect(source).toContain("const logTabs = ['输出日志', '格式'] as const;");
    expect(source).toContain('智能导入会写入到');
    expect(source).toContain('可复制格式');
    expect(source).toContain('function buildImportFormat');
    expect(source).toContain("if (entry.tab === '人物设定')");
    expect(source).toContain('`<${entry.tab}>`');
    expect(source).toContain("'<人物设定>'");
    expect(source).toContain('基础设定');
    expect(source).toContain('故事类型');
    expect(source).toContain('核心创意');
    expect(source).toContain('男主角设定');
    expect(source).toContain('世界架构');
    expect(source).toContain('危险区域');
    expect(source).toContain('功法能力');
    expect(source).toContain('物品装备');
    expect(source).toContain('资源货币');
    expect(source).toContain('特殊资源');
    expect(source).toContain('怪物列表');
    expect(source).toContain('主线伏笔');
    expect(source).toContain('已回收伏笔');
    expect(source).not.toContain("bg-[#FFF7ED]");
  });

  it('adds the format log test page to the test collection', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SettingImportFormatLogTestPage');
    expect(source).toContain('/setting-import-format-log-test');
    expect(source).toContain('智能导入格式日志测试');
    expect(source).toContain('输出日志新增“格式”标签');
  });
});
