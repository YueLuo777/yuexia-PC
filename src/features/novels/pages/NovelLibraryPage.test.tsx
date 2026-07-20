import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
  if (relativePath !== 'NovelLibraryPage.tsx') return source;
  return `${source}\n${readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/NovelLibraryParts.tsx'), 'utf8')}`;
};

describe('NovelLibraryPage search styling', () => {
  it('keeps the novel search input on the requested #F5F6F6 background', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');
    const styles = Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(pageSource).toContainSource('className="xy-ui132-search xy-novel-search shrink-0"');
    expect(pageSource).toContainSource('placeholder={`搜索${typeLabel}`}');
    const normalizedStyles = styles.replace(/\r\n/g, '\n');
    expect(normalizedStyles).toContainSource(
      '.xy-ui132-search.xy-novel-search input,\n.xy-ui132-search.xy-novel-search input:focus,\n.xy-ui132-search.xy-novel-search input:hover {\n  background-color: #F5F6F6;\n}',
    );
  });
});

describe('NovelLibraryPage summary cards', () => {
  it('keeps check-in, overview, and recent edits in three equal-width columns', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContainSource('className="flex-1 overflow-y-auto px-[21px] py-3.5"');
    expect(pageSource).not.toContainSource('className="flex-1 overflow-y-auto px-4 py-3.5"');
    expect(pageSource).not.toContainSource('className="flex-1 overflow-y-auto px-8 py-7"');
    expect(pageSource).toContainSource("import('@/features/workbench/components/WorkbenchLibraryPanel')");
    expect(pageSource).toContainSource('className="grid w-full min-w-0 grid-cols-3 gap-3"');
    expect(pageSource).not.toContainSource('grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_minmax(0,3fr)]');
    expect(pageSource).not.toContainSource('NOVEL_LIBRARY_DASHBOARD_WIDTHS_KEY');
    expect(pageSource).not.toContainSource('dashboardGridTemplate');
    expect(pageSource).not.toContainSource('startDashboardCardResize');
    expect(pageSource).not.toContainSource('data-dashboard-resize-handle');
    expect(pageSource).not.toContainSource('grid gap-3 sm:grid-cols-2 xl:grid-cols-4');
    expect(pageSource).not.toContainSource('xl:grid-cols-4');
    expect(pageSource).not.toContainSource('{typeLabel}数据');
    expect(pageSource).not.toContainSource('const title = workType');
    expect(pageSource).not.toContainSource('text-[#16518f]">{title}</h1>');
    expect(pageSource).not.toContainSource('BookOpen');
    expect(pageSource).toContainSource('data-user-check-in-card');
    expect(pageSource).toContainSource('用户签到');
    expect(pageSource).toContainSource('连续签到');
    expect(pageSource).toContainSource('-- 天');
    expect(pageSource).toContainSource('用户系统接入后开放');
    expect(pageSource.indexOf('data-user-check-in-card')).toBeLessThan(pageSource.indexOf('作品概览'));
    expect(pageSource).toContainSource('作品概览');
    expect(pageSource).not.toContainSource('当前{typeLabel}库统计');
    expect(pageSource).toContainSource("{ label: '作品', value: `${sourceNovels.length} 本`");
    expect(pageSource).toContainSource(
      "{ label: '昨日更新', value: `${formatWords(writingSummary.yesterdayWords)} 字`",
    );
    expect(pageSource).toContainSource('writingSummary.yesterdayWords');
    expect(pageSource).toContainSource("{ label: '字数', value: `${formatWords(totalWorkWords)} 字`");
    expect(pageSource).toContainSource('formatWords(totalWorkWords)');
    expect(pageSource).toContainSource('averageWorkWords');
    expect(pageSource).toContainSource("{ label: '平均字数', value: `${formatWords(averageWorkWords)} 字`");
    expect(pageSource).toContainSource('预留 --');
    expect(pageSource).toContainSource('min-w-0 space-y-3 overflow-x-hidden');
    expect(pageSource).not.toContainSource('space-y-3 overflow-x-auto pb-1');
    expect(pageSource).not.toContainSource('min-w-[1780px]');
    expect(pageSource).toContainSource(
      'flex min-h-[126px] min-w-0 flex-col rounded-xl border border-slate-200 bg-[#f7faff] px-5 py-4',
    );
    expect(pageSource).not.toContainSource('mt-3 grid grid-cols-2 gap-x-5 gap-y-2');
    expect(pageSource).toContainSource('mt-3 grid flex-1 grid-cols-2 grid-rows-2 gap-2');
    expect(pageSource).toContainSource(
      'grid h-full min-h-[40px] min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-1.5 overflow-hidden',
    );
    expect(pageSource).toContainSource('block whitespace-nowrap text-[12px] font-semibold text-[#1f2933]');
    expect(pageSource).toContainSource("import { AutoFitText } from '@/shared/ui/AutoFitText';");
    expect(pageSource).toContainSource('data-overview-stat');
    expect(pageSource).toContainSource(
      '<AutoFitText className="font-bold text-[#111827]" minFontSize={11} maxFontSize={18}>',
    );
    expect(pageSource).not.toContainSource('min-w-[86px]');
    expect(pageSource).not.toContainSource('grid-cols-[minmax(42px,1fr)_minmax(72px,auto)]');
    expect(pageSource).toContainSource('<span className="min-w-0 shrink-0">');
    expect(pageSource).toContainSource(
      '<span className="block whitespace-nowrap text-[12px] font-semibold text-[#1f2933]">{item.label}</span>',
    );
    expect(pageSource).not.toContainSource(
      'grid h-full min-h-[40px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2',
    );
    expect(pageSource).not.toContainSource('text-right text-[18px] font-bold leading-none text-[#111827]');
    expect(pageSource).not.toContainSource('text-right text-[19px] font-bold leading-none text-[#111827]');
    expect(pageSource).not.toContainSource('当前${typeLabel}库');
    expect(pageSource).not.toContainSource('昨日新增字数');
    expect(pageSource).not.toContainSource('累计作品字数');
    expect(pageSource).not.toContainSource('单本平均字数');
    expect(pageSource).not.toContainSource('作品整理');
    expect(pageSource).not.toContainSource('Archive');
    expect(pageSource).not.toContainSource('<Archive className="h-3.5 w-3.5" />');
    expect(pageSource).toContainSource('最近编辑');
    expect(pageSource).toContainSource(
      '<h2 className="truncate text-[15px] font-semibold leading-none text-[#1f2933]">最近编辑：</h2>',
    );
    expect(pageSource).not.toContainSource('text-[24px] font-bold leading-none text-[#1f2933]">最近编辑：');
    expect(pageSource).not.toContainSource('扩展卡片');
    expect(pageSource).not.toContainSource('保持专注写作和资料管理');
  });

  it('renders recent edits as a compact quick-entry list', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContainSource('const recentWorks = [...sourceNovels]');
    expect(pageSource).toContainSource('parseWorkDateValue(b.lastModifiedAt || b.createdAt)');
    expect(pageSource).toContainSource('.slice(0, 3);');
    expect(pageSource).toContainSource('最近编辑：');
    expect(pageSource).toContainSource('recentWorks.map((work) => (');
    expect(pageSource).toContainSource('onClick={() => handleOpen(work.id)}');
    expect(pageSource).toContainSource('mt-3 grid flex-1 grid-cols-3 gap-2');
    expect(pageSource).toContainSource('rounded-[10px] border border-slate-200 bg-[#fbfdff] px-3 py-2.5');
    expect(pageSource).toContainSource('{work.title}');
    expect(pageSource).toContainSource('{formatWorkDate(work.lastModifiedAt || work.createdAt)}');
    expect(pageSource).not.toContainSource('Clock3');
    expect(pageSource).not.toContainSource('快速进入');
    expect(pageSource).not.toContainSource('if (latestWork) handleOpen(latestWork.id);');
    expect(pageSource).not.toContainSource('继续编辑');
    expect(pageSource).toContainSource('暂无最近编辑的{typeLabel}');
    expect(pageSource).toContainSource('WRITING_STATS_UPDATED_EVENT');
  });

  it('places all work-management actions beside the compact search field', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContainSource('style={{ width: 156, maxWidth: 156 }}');
    expect(pageSource).toContainSource('style={{ height: 40 }}');
    expect(pageSource).toContainSource('回收站（{recycledNovels.length}）');
    expect(pageSource).toContainSource('卡片设置');
    expect(pageSource).toContainSource('导入{typeLabel}');
    expect(pageSource).toContainSource('新建{typeLabel}');
    expect(pageSource).toContainSource('border border-red-300 bg-red-50 px-4 text-sm font-bold text-red-600');

    const searchIndex = pageSource.indexOf('placeholder={`搜索${typeLabel}`}');
    const recycleIndex = pageSource.indexOf('回收站（{recycledNovels.length}）', searchIndex);
    const settingsIndex = pageSource.indexOf('卡片设置', recycleIndex);
    const importIndex = pageSource.indexOf('导入{typeLabel}', settingsIndex);
    const createIndex = pageSource.indexOf('新建{typeLabel}', importIndex);
    expect([searchIndex, recycleIndex, settingsIndex, importIndex, createIndex]).toEqual(
      [...[searchIndex, recycleIndex, settingsIndex, importIndex, createIndex]].sort((left, right) => left - right),
    );
  });
});

describe('NovelLibraryPage import flow', () => {
  it('uses the shared modal shell for create, import, and recycle dialogs', () => {
    const newNovelModalSource = readSource('../components/NewNovelModal.tsx');
    const importModalSource = readSource('../components/ImportModal.tsx');
    const recycleModalSource = readSource('../components/RecycleBinModal.tsx');
    const combinedSource = `${newNovelModalSource}\n${importModalSource}\n${recycleModalSource}`;

    expect(newNovelModalSource).toContainSource("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(importModalSource).toContainSource("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(recycleModalSource).toContainSource("import { AppModalShell } from '@/shared/ui/AppModalShell';");
    expect(combinedSource).toContainSource("import { ActionButton } from '@/shared/ui/ActionButton';");
    expect(combinedSource).not.toContainSource('fixed inset-0 z-50 flex items-center justify-center');
  });

  it('uses the page library state when importing so the new work appears immediately', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');
    const modalSource = readSource('../components/ImportModal.tsx');

    expect(pageSource).toContainSource('importNovelWithChapters');
    expect(pageSource).toContainSource('onImport={importNovelWithChapters}');
    expect(modalSource).toContainSource(
      'onImport: (input: NewNovelInput, chapters: ImportedChapterInput[]) => number;',
    );
    expect(modalSource).toContainSource('export function ImportModal({ isOpen, onClose, onImport, defaultType = ');
    expect(modalSource).toContainSource('onImport(');
    expect(modalSource).not.toContainSource('useNovelLibrary()');
  });

  it('lets smart import use a manually entered title before falling back to recognition or file name', () => {
    const modalSource = readSource('../components/ImportModal.tsx');

    expect(modalSource).toContainSource("const [manualTitle, setManualTitle] = useState('');");
    expect(modalSource).toContainSource("setManualTitle(file.name.replace(/\\.[^.]+$/, ''));");
    expect(modalSource).toContainSource(
      "setManualTitle(result.bookName?.trim() || file.name.replace(/\\.[^.]+$/, ''));",
    );
    expect(modalSource).toContainSource(
      "? manualTitle.trim() || parsedResult.bookName?.trim() || selectedFile.name.replace(/\\.[^.]+$/, '')",
    );
    expect(modalSource).toContainSource('value={manualTitle}');
    expect(modalSource).toContainSource('onChange={(event) => setManualTitle(event.target.value)}');
    expect(modalSource).toContainSource(
      "placeholder={parsedResult?.bookName || selectedFile?.name.replace(/\\.[^.]+$/, '') || '输入书名'}",
    );
  });
});
