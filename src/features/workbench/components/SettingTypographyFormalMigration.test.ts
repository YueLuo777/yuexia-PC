import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('formal setting typography migration', () => {
  it('uses Microsoft YaHei UI across the complete formal setting workspace', () => {
    const view = read('src/features/workbench/components/workbenchSettingLibraryView.tsx');
    const styles = read('src/shared/styles/parts/part-10.css');

    expect(view).toContain('xy-setting-workspace-typography');
    expect(view).toContain("activeTab === SETTING_TAB && !activeIsBrainstorm ? 'xy-setting-workspace-typography' : ''");
    expect(styles).toContain('.xy-setting-workspace-typography button');
    expect(styles).toContain('.xy-setting-workspace-typography input');
    expect(styles).toContain('.xy-setting-workspace-typography textarea');
    expect(styles).toContain('.xy-setting-workspace-typography select');
    expect(styles).toContain('font-family: "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;');
    expect(styles).toContain('font-synthesis: none;');
  });

  it('removes the temporary comparison page, collection entry and route', () => {
    const collection = read('src/features/tests/pages/TestCollectionPage.tsx');

    expect(collection).not.toContain('SettingTypographyComparisonTestPage');
    expect(collection).not.toContain('/setting-typography-comparison-test');
    expect(collection).not.toContain('设定页面字体统一对比');
  });
});
