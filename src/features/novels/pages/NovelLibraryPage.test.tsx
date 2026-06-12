import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8')
);

describe('NovelLibraryPage search styling', () => {
  it('keeps the novel search input on the requested #F5F6F6 background', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');
    const styles = readSource('../../../shared/styles/index.css');

    expect(pageSource).toContain('className="xy-ui132-search xy-novel-search shrink-0"');
    expect(pageSource).toContain('placeholder={`搜索${typeLabel}`}');
    expect(styles).toContain('.xy-ui132-search.xy-novel-search input,\n.xy-ui132-search.xy-novel-search input:focus,\n.xy-ui132-search.xy-novel-search input:hover {\n  background-color: #F5F6F6;\n}');
  });
});

describe('NovelLibraryPage summary cards', () => {
  it('turns the library title card into a four-card data row', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContain('className="flex-1 overflow-y-auto px-[21px] py-3.5"');
    expect(pageSource).not.toContain('className="flex-1 overflow-y-auto px-4 py-3.5"');
    expect(pageSource).not.toContain('className="flex-1 overflow-y-auto px-8 py-7"');
    expect(pageSource).toContain('xl:grid-cols-4');
    expect(pageSource).not.toContain('{typeLabel}数据');
    expect(pageSource).not.toContain('const title = workType');
    expect(pageSource).not.toContain('text-[#16518f]">{title}</h1>');
    expect(pageSource).not.toContain('BookOpen');
    expect(pageSource).toContain('作品概览');
    expect(pageSource).not.toContain('当前{typeLabel}库统计');
    expect(pageSource).toContain('<span>作品</span>');
    expect(pageSource).toContain('{sourceNovels.length} 本');
    expect(pageSource).toContain('<span>昨日更新</span>');
    expect(pageSource).toContain('writingSummary.yesterdayWords');
    expect(pageSource).toContain('<span>字数</span>');
    expect(pageSource).toContain('formatWords(totalWorkWords)');
    expect(pageSource).toContain('averageWorkWords');
    expect(pageSource).toContain('<span>平均字数</span>');
    expect(pageSource).toContain('预留 --');
    expect(pageSource).toContain('grid gap-3 sm:grid-cols-2 xl:grid-cols-4');
    expect(pageSource).toContain('flex min-h-[126px] flex-col rounded-[8px]');
    expect(pageSource).toContain('mt-3 grid grid-cols-2 gap-x-5 gap-y-2');
    expect(pageSource).toContain('flex min-h-[126px] flex-col rounded-[8px] border border-[#e6e8ec] bg-[#fbfbfc] px-4 py-3.5');
    expect(pageSource).toContain('mt-2 grid flex-1 grid-cols-2 grid-rows-2 gap-2');
    expect(pageSource).toContain('flex h-full min-h-[40px] items-center gap-2');
    expect(pageSource).toContain('作品整理');
    expect(pageSource).toContain('<h2 className="text-[15px] font-semibold text-[#1f2933]">作品整理</h2>');
    expect(pageSource).not.toContain('Archive');
    expect(pageSource).not.toContain('<Archive className="h-3.5 w-3.5" />');
    expect(pageSource).toContain('最近编辑');
    expect(pageSource).toContain('<h2 className="truncate text-[15px] font-semibold leading-none text-[#1f2933]">最近编辑：</h2>');
    expect(pageSource).not.toContain('text-[24px] font-bold leading-none text-[#1f2933]">最近编辑：');
    expect(pageSource).toContain('扩展卡片');
    expect(pageSource).not.toContain('保持专注写作和资料管理');
  });

  it('renders recent edits as a compact quick-entry list', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContain('const recentWorks = [...sourceNovels]');
    expect(pageSource).toContain('parseWorkDateValue(b.lastModifiedAt || b.createdAt)');
    expect(pageSource).toContain('.slice(0, 3);');
    expect(pageSource).toContain('最近编辑：');
    expect(pageSource).toContain('recentWorks.map((work) => (');
    expect(pageSource).toContain('onClick={() => handleOpen(work.id)}');
    expect(pageSource).toContain('rounded-[8px] border border-[#dfe5ec] bg-[#fbfdff] px-3 py-1.5');
    expect(pageSource).toContain('{work.title}');
    expect(pageSource).toContain('{formatWorkDate(work.lastModifiedAt || work.createdAt)}');
    expect(pageSource).not.toContain('Clock3');
    expect(pageSource).not.toContain('快速进入');
    expect(pageSource).not.toContain('if (latestWork) handleOpen(latestWork.id);');
    expect(pageSource).not.toContain('继续编辑');
    expect(pageSource).toContain('暂无最近编辑的{typeLabel}');
    expect(pageSource).toContain('WRITING_STATS_UPDATED_EVENT');
  });
});
