import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('NovelLibraryPage search styling', () => {
  it('keeps the novel search input on the requested #F5F6F6 background', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');
    const styles = readSource('../../../shared/styles/index.css');

    expect(pageSource).toContainSource('className="xy-ui132-search xy-novel-search shrink-0"');
    expect(pageSource).toContainSource('placeholder={`搜索${typeLabel}`}');
    const normalizedStyles = styles.replace(/\r\n/g, '\n');
    expect(normalizedStyles).toContainSource(
      '.xy-ui132-search.xy-novel-search input,\n.xy-ui132-search.xy-novel-search input:focus,\n.xy-ui132-search.xy-novel-search input:hover {\n  background-color: #F5F6F6;\n}',
    );
  });
});

describe('NovelLibraryPage summary cards', () => {
  it('turns the library title card into a four-card data row', () => {
    const pageSource = readSource('NovelLibraryPage.tsx');

    expect(pageSource).toContainSource('className="flex-1 overflow-y-auto px-[21px] py-3.5"');
    expect(pageSource).not.toContainSource('className="flex-1 overflow-y-auto px-4 py-3.5"');
    expect(pageSource).not.toContainSource('className="flex-1 overflow-y-auto px-8 py-7"');
    expect(pageSource).toContainSource('NOVEL_LIBRARY_DASHBOARD_WIDTHS_KEY');
    expect(pageSource).toContainSource('DEFAULT_DASHBOARD_CARD_WIDTHS = [464, 434, 428, 424]');
    expect(pageSource).toContainSource('DASHBOARD_CARD_MIN_WEIGHT');
    expect(pageSource).toContainSource('dashboardGridTemplate');
    expect(pageSource).toContainSource('startDashboardCardResize(event, 0)');
    expect(pageSource).toContainSource('startDashboardCardResize(event, 1)');
    expect(pageSource).toContainSource('startDashboardCardResize(event, 2)');
    expect(pageSource).toContainSource('title="拖拽调整卡片宽度"');
    expect(pageSource).toContainSource('data-dashboard-resize-handle');
    expect(pageSource).not.toContainSource('grid gap-3 sm:grid-cols-2 xl:grid-cols-4');
    expect(pageSource).not.toContainSource('xl:grid-cols-4');
    expect(pageSource).not.toContainSource('{typeLabel}数据');
    expect(pageSource).not.toContainSource('const title = workType');
    expect(pageSource).not.toContainSource('text-[#16518f]">{title}</h1>');
    expect(pageSource).not.toContainSource('BookOpen');
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
    expect(pageSource).toContainSource('ref={dashboardRowRef}');
    expect(pageSource).toContainSource('looksLikeLegacyRatio');
    expect(pageSource).toContainSource('`minmax(0, ${Math.max(DASHBOARD_CARD_MIN_WEIGHT, dashboardCardWidths[3])}fr)`');
    expect(pageSource).toContainSource('weightPerPixel: totalWeight / availableCardWidth');
    expect(pageSource).toContainSource('className="grid w-full min-w-0"');
    expect(pageSource).not.toContainSource('min-w-[1780px]');
    expect(pageSource).toContainSource(
      'flex min-h-[126px] min-w-0 flex-col rounded-[8px] border border-[#dfe5ec] bg-[#f7faff] px-5 py-4',
    );
    expect(pageSource).not.toContainSource('mt-3 grid grid-cols-2 gap-x-5 gap-y-2');
    expect(pageSource).toContainSource('mt-3 grid flex-1 grid-cols-2 grid-rows-2 gap-2');
    expect(pageSource).toContainSource(
      'grid h-full min-h-[40px] grid-cols-[max-content_minmax(86px,1fr)] items-center gap-2',
    );
    expect(pageSource).toContainSource('block whitespace-nowrap text-[12px] font-semibold text-[#1f2933]');
    expect(pageSource).toContainSource(
      'min-w-[86px] shrink-0 text-right text-[clamp(15px,1.05vw,18px)] font-bold leading-none text-[#111827] tabular-nums',
    );
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
    expect(pageSource).toContainSource(
      'flex min-h-[126px] min-w-0 flex-col rounded-[8px] border border-[#e6e8ec] bg-[#fbfbfc] px-4 py-3.5',
    );
    expect(pageSource).toContainSource('mt-2 grid flex-1 grid-cols-2 grid-rows-2 gap-2');
    expect(pageSource).toContainSource('flex h-full min-h-[40px] items-center gap-2');
    expect(pageSource).toContainSource('作品整理');
    expect(pageSource).toContainSource('<h2 className="text-[15px] font-semibold text-[#1f2933]">作品整理</h2>');
    expect(pageSource).not.toContainSource('Archive');
    expect(pageSource).not.toContainSource('<Archive className="h-3.5 w-3.5" />');
    expect(pageSource).toContainSource('最近编辑');
    expect(pageSource).toContainSource(
      '<h2 className="truncate text-[15px] font-semibold leading-none text-[#1f2933]">最近编辑：</h2>',
    );
    expect(pageSource).not.toContainSource('text-[24px] font-bold leading-none text-[#1f2933]">最近编辑：');
    expect(pageSource).toContainSource('扩展卡片');
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
    expect(pageSource).toContainSource('rounded-[8px] border border-[#dfe5ec] bg-[#fbfdff] px-3 py-1.5');
    expect(pageSource).toContainSource('{work.title}');
    expect(pageSource).toContainSource('{formatWorkDate(work.lastModifiedAt || work.createdAt)}');
    expect(pageSource).not.toContainSource('Clock3');
    expect(pageSource).not.toContainSource('快速进入');
    expect(pageSource).not.toContainSource('if (latestWork) handleOpen(latestWork.id);');
    expect(pageSource).not.toContainSource('继续编辑');
    expect(pageSource).toContainSource('暂无最近编辑的{typeLabel}');
    expect(pageSource).toContainSource('WRITING_STATS_UPDATED_EVENT');
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
