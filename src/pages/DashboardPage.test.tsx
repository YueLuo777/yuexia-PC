import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readDashboardPageSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DashboardPage.tsx'), 'utf8')
);

describe('DashboardPage compact cards', () => {
  it('renders a four-card dashboard row with novel data, organization, recent edit, and reserved slots', () => {
    const source = readDashboardPageSource();

    expect(source).toContain('xl:grid-cols-4');
    expect(source).toContain('我的小说');
    expect(source).toContain('作品整理');
    expect(source).toContain('最近编辑');
    expect(source).toContain('扩展卡片');
    expect(source).toContain('作品');
    expect(source).toContain('昨日更新');
    expect(source).toContain('字数');
    expect(source).toContain('预留');
  });

  it('uses existing novel library data and keeps recent edit as a quick entry', () => {
    const source = readDashboardPageSource();

    expect(source).toContain('const latestNovel = recentNovels[0] ?? null');
    expect(source).toContain("stats.novelCount");
    expect(source).toContain('writingSummary.yesterdayWords');
    expect(source).toContain('novelWordCount');
    expect(source).toContain("navigate('/novels')");
    expect(source).toContain('openNovel(latestNovel.id, latestNovel.type)');
  });
});
