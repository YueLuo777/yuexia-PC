import {
  BookOpenText,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  Link2,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { getChapterContentKey, readChapterContent } from '@/features/workbench/hooks/useWorkbenchData';
import {
  clearWorkbenchLinkedContextItems,
  readWorkbenchLinkedContextItems,
  writeWorkbenchLinkedContextItems,
  type StoredWorkbenchLinkedContextItem,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import {
  BRAINSTORM_TAB,
  CHAPTER_SUMMARY_TAB,
  DETAIL_OUTLINE_TAB,
  SETTING_TAB,
  normalizeTabName,
} from '@/features/workbench/components/workbenchLibraryTabs';

const NOVELS_KEY = 'xinyuexia_novels_v1';
const VOLUMES_KEY = 'xinyuexia_volumes_v1';
const TEST_WORK_ID = 970701001;
const TEST_VOLUME_ID = 970701101;
const TEST_CHAPTER_ID = 970701201;
const TEST_ID_PREFIX = 'workbench-creation-chain-test';
const TEST_SETTINGS_KEY = `xinyuexia_workbench_settings_${TEST_WORK_ID}`;
const TEST_OUTLINE_KEY = `xinyuexia_workbench_outline_${TEST_WORK_ID}`;
const TEST_MARKER = 'WORKBENCH_CREATION_CHAIN_TEST_MARKER';

type ChainCheck = {
  id: string;
  title: string;
  path: string;
  detail: string;
  passed: boolean;
};

type ChainInspection = {
  checks: ChainCheck[];
  passedCount: number;
  totalCount: number;
  createdAt: string | null;
};

const testNovel: WorkbenchNovel = {
  id: TEST_WORK_ID,
  title: '链路测试作品',
  type: 'novel',
  category: '链路自检',
  synopsis: `${TEST_MARKER} 用来检查脑洞、设定、章纲、梗概、正文和 AI 关联资料能否串起来。`,
  wordCount: 35,
  createdAt: '2026/7/1',
  lastModifiedAt: '2026/7/1',
};

const testVolumes: Volume[] = [
  {
    id: TEST_VOLUME_ID,
    name: '第一卷',
    isExpanded: true,
    chapters: [
      {
        id: TEST_CHAPTER_ID,
        title: '链路自检章节',
        serialNumber: 1,
        wordCount: 35,
        isSelected: true,
        isPublished: false,
      },
    ],
  },
];

const testBrainstormEntry: WorkbenchLibraryEntry = {
  id: `${TEST_ID_PREFIX}-brainstorm`,
  tab: BRAINSTORM_TAB,
  title: '链路自检脑洞',
  type: '脑洞库',
  content: `${TEST_MARKER}\n脑洞：主角在月下发现一份会改写命运的旧章纲。`,
  updatedAt: '2026/7/1 00:00:00',
};

const testSettingEntry: WorkbenchLibraryEntry = {
  id: `${TEST_ID_PREFIX}-setting`,
  tab: SETTING_TAB,
  title: '链路自检设定',
  type: '核心设定',
  content: `${TEST_MARKER}\n类型：核心设定\n正文：月下旧章纲会把错误伏笔投射到现实。`,
  updatedAt: '2026/7/1 00:00:00',
};

const testOutlineEntry: WorkbenchLibraryEntry = {
  id: `${TEST_ID_PREFIX}-outline`,
  tab: DETAIL_OUTLINE_TAB,
  title: '第1章章纲',
  type: '章节章纲',
  content: `${TEST_MARKER}\n章纲：主角打开旧章纲，确认第一处矛盾来自全局脑洞。`,
  updatedAt: '2026/7/1 00:00:00',
};

const testSummaryEntry: WorkbenchLibraryEntry = {
  id: `${TEST_ID_PREFIX}-summary`,
  tab: CHAPTER_SUMMARY_TAB,
  title: '第1章梗概',
  type: '章节梗概',
  content: `${TEST_MARKER}\n梗概：主角发现章纲、设定和正文之间存在一条可追踪链路。`,
  updatedAt: '2026/7/1 00:00:00',
};

const testChapterContent = `${TEST_MARKER}\n第一章正文：主角把脑洞、核心设定和章纲放在一起核对，找到了第一个断点。`;

const testLinkedContextItems: StoredWorkbenchLinkedContextItem[] = [
  {
    id: `outline:${testOutlineEntry.id}`,
    source: 'outline',
    group: '章节章纲',
    title: testOutlineEntry.title,
    content: testOutlineEntry.content,
  },
  {
    id: `setting:${testSettingEntry.id}`,
    source: 'setting',
    group: '核心设定',
    title: testSettingEntry.title,
    content: testSettingEntry.content,
  },
  {
    id: `chapter:${TEST_CHAPTER_ID}`,
    source: 'chapter',
    group: '第一卷',
    title: '第1章 链路自检章节',
    content: testChapterContent,
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isTestEntry(entry: WorkbenchLibraryEntry) {
  return entry.id.startsWith(TEST_ID_PREFIX);
}

function withoutTestEntries(entries: WorkbenchLibraryEntry[]) {
  return entries.filter((entry) => !isTestEntry(entry));
}

function cleanupWorkbenchCreationChainTestData() {
  const novels = readJson<WorkbenchNovel[]>(NOVELS_KEY, []);
  writeJson(NOVELS_KEY, novels.filter((novel) => novel.id !== TEST_WORK_ID));

  const volumesMap = readJson<Record<string, Volume[]>>(VOLUMES_KEY, {});
  const nextVolumesMap = { ...volumesMap };
  delete nextVolumesMap[String(TEST_WORK_ID)];
  writeJson(VOLUMES_KEY, nextVolumesMap);

  writeWorkbenchLibraryEntries(
    GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
    withoutTestEntries(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY)),
  );
  localStorage.removeItem(TEST_SETTINGS_KEY);
  localStorage.removeItem(TEST_OUTLINE_KEY);
  localStorage.removeItem(getChapterContentKey(TEST_WORK_ID, TEST_CHAPTER_ID));
  clearWorkbenchLinkedContextItems(TEST_WORK_ID);
}

function createWorkbenchCreationChainTestData() {
  cleanupWorkbenchCreationChainTestData();

  const novels = readJson<WorkbenchNovel[]>(NOVELS_KEY, []);
  writeJson(NOVELS_KEY, [testNovel, ...novels.filter((novel) => novel.id !== TEST_WORK_ID)]);

  const volumesMap = readJson<Record<string, Volume[]>>(VOLUMES_KEY, {});
  writeJson(VOLUMES_KEY, {
    ...volumesMap,
    [TEST_WORK_ID]: testVolumes,
  });

  writeWorkbenchLibraryEntries(
    GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
    [testBrainstormEntry, ...withoutTestEntries(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY))],
  );
  writeWorkbenchLibraryEntries(TEST_SETTINGS_KEY, [testSettingEntry]);
  writeWorkbenchLibraryEntries(TEST_OUTLINE_KEY, [testOutlineEntry, testSummaryEntry]);
  localStorage.setItem(getChapterContentKey(TEST_WORK_ID, TEST_CHAPTER_ID), testChapterContent);
  writeWorkbenchLinkedContextItems(TEST_WORK_ID, testLinkedContextItems);
}

function hasMarker(value: string | undefined) {
  return Boolean(value?.includes(TEST_MARKER));
}

function inspectWorkbenchCreationChain(): ChainInspection {
  const novels = readJson<WorkbenchNovel[]>(NOVELS_KEY, []);
  const volumesMap = readJson<Record<string, Volume[]>>(VOLUMES_KEY, {});
  const volumes = volumesMap[String(TEST_WORK_ID)] ?? [];
  const globalBrainstormEntries = readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY);
  const settingsEntries = readWorkbenchLibraryEntriesWithGlobalBrainstorm(TEST_SETTINGS_KEY);
  const localSettingEntries = readWorkbenchLibraryEntries(TEST_SETTINGS_KEY);
  const outlineEntries = readWorkbenchLibraryEntries(TEST_OUTLINE_KEY);
  const chapterContent = readChapterContent(TEST_WORK_ID, TEST_CHAPTER_ID);
  const linkedContextItems = readWorkbenchLinkedContextItems(TEST_WORK_ID);

  const checks: ChainCheck[] = [
    {
      id: 'work',
      title: '测试作品',
      path: `${NOVELS_KEY} / ${VOLUMES_KEY}`,
      detail: '作品列表和卷章结构能同时读到测试作品与第 1 章。',
      passed: novels.some((novel) => novel.id === TEST_WORK_ID)
        && volumes.some((volume) => volume.chapters.some((chapter) => chapter.id === TEST_CHAPTER_ID)),
    },
    {
      id: 'brainstorm',
      title: '脑洞',
      path: `${GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY} -> ${TEST_SETTINGS_KEY}`,
      detail: '脑洞写入全局库后，工作台设定库读取入口能合并读到它。',
      passed: globalBrainstormEntries.some((entry) => entry.id === testBrainstormEntry.id && hasMarker(entry.content))
        && settingsEntries.some((entry) => entry.id === testBrainstormEntry.id && normalizeTabName(entry.tab) === BRAINSTORM_TAB),
    },
    {
      id: 'setting',
      title: '设定',
      path: TEST_SETTINGS_KEY,
      detail: '当前作品设定库能读到核心设定卡片。',
      passed: localSettingEntries.some((entry) => entry.id === testSettingEntry.id && normalizeTabName(entry.tab) === SETTING_TAB && hasMarker(entry.content)),
    },
    {
      id: 'outline',
      title: '章纲',
      path: TEST_OUTLINE_KEY,
      detail: '当前作品章纲库能读到第 1 章章纲。',
      passed: outlineEntries.some((entry) => entry.id === testOutlineEntry.id && entry.tab === DETAIL_OUTLINE_TAB && hasMarker(entry.content)),
    },
    {
      id: 'summary',
      title: '梗概',
      path: TEST_OUTLINE_KEY,
      detail: '当前作品章纲库也能读到第 1 章梗概。',
      passed: outlineEntries.some((entry) => entry.id === testSummaryEntry.id && entry.tab === CHAPTER_SUMMARY_TAB && hasMarker(entry.content)),
    },
    {
      id: 'body',
      title: '正文',
      path: getChapterContentKey(TEST_WORK_ID, TEST_CHAPTER_ID),
      detail: '章节正文能通过 novelId + chapterId 的正文键读回。',
      passed: hasMarker(chapterContent),
    },
    {
      id: 'ai-context',
      title: 'AI 关联资料',
      path: `xinyuexia_workbench_linked_context_${TEST_WORK_ID}`,
      detail: 'AI 关联资料能同时带上章纲、设定和正文。',
      passed: ['outline', 'setting', 'chapter'].every((source) => (
        linkedContextItems.some((item) => item.source === source && hasMarker(item.content))
      )),
    },
  ];

  return {
    checks,
    passedCount: checks.filter((check) => check.passed).length,
    totalCount: checks.length,
    createdAt: new Date().toLocaleString('zh-CN'),
  };
}

function getCheckTone(passed: boolean) {
  return passed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-rose-200 bg-rose-50 text-rose-800';
}

export function WorkbenchCreationChainTestPage() {
  const [inspection, setInspection] = useState<ChainInspection | null>(null);

  const handleCreateAndInspect = () => {
    createWorkbenchCreationChainTestData();
    setInspection(inspectWorkbenchCreationChain());
  };

  const handleInspect = () => {
    setInspection(inspectWorkbenchCreationChain());
  };

  const handleCleanup = () => {
    cleanupWorkbenchCreationChainTestData();
    setInspection(inspectWorkbenchCreationChain());
  };

  const allPassed = inspection ? inspection.passedCount === inspection.totalCount : false;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5 text-slate-950">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                <Link2 className="h-4 w-4" />
                Workbench Creation Chain
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950">脑洞 / 设定 / 章纲 / 正文链路自检</h1>
              <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-slate-500">
                生成一套临时作品数据，按工作台真实 localStorage 键检查创作链路和 AI 关联资料是否能读通。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCreateAndInspect}
                className="h-9 rounded-lg bg-[#08AACE] px-4 text-sm font-black text-white transition-colors hover:bg-[#078FAE]"
              >
                生成测试作品并检查链路
              </button>
              <button
                type="button"
                onClick={handleInspect}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition-colors hover:border-[#08AACE]/50 hover:text-[#078FAE]"
              >
                重新检查
              </button>
              <button
                type="button"
                onClick={handleCleanup}
                className="h-9 rounded-lg border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition-colors hover:bg-rose-50"
              >
                清理测试数据
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-500">
              <Database className="h-4 w-4 text-[#08AACE]" />
              测试作品
            </div>
            <div className="mt-2 text-xl font-black text-slate-950">{TEST_WORK_ID}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-500">
              <BookOpenText className="h-4 w-4 text-[#08AACE]" />
              链路节点
            </div>
            <div className="mt-2 text-xl font-black text-slate-950">{inspection?.totalCount ?? 7}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              通过
            </div>
            <div className="mt-2 text-xl font-black text-slate-950">{inspection?.passedCount ?? 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-500">
              <RotateCcw className="h-4 w-4 text-[#08AACE]" />
              最近检查
            </div>
            <div className="mt-2 truncate text-sm font-black text-slate-950">{inspection?.createdAt ?? '尚未检查'}</div>
          </div>
        </section>

        <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-slate-900">检查结果</h2>
              {inspection && (
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${getCheckTone(allPassed)}`}>
                  {allPassed ? '链路通过' : '存在断点'}
                </span>
              )}
            </div>

            {inspection ? (
              <div className="grid gap-3">
                {inspection.checks.map((check) => {
                  const StatusIcon = check.passed ? CheckCircle2 : XCircle;
                  return (
                    <article key={check.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${check.passed ? 'text-emerald-600' : 'text-rose-600'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-slate-950">{check.title}</h3>
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${getCheckTone(check.passed)}`}>
                              {check.passed ? '通过' : '失败'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{check.detail}</p>
                          <div className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-500">
                            {check.path}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                <div>
                  <Brain className="mx-auto h-8 w-8 text-slate-300" />
                  <div className="mt-3 text-sm font-black text-slate-500">尚未生成测试链路</div>
                </div>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#08AACE]" />
                <h2 className="text-sm font-black text-slate-900">写入键</h2>
              </div>
              <div className="space-y-2 font-mono text-xs font-bold text-slate-500">
                <div className="rounded-md bg-slate-50 px-3 py-2">{GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY}</div>
                <div className="rounded-md bg-slate-50 px-3 py-2">{TEST_SETTINGS_KEY}</div>
                <div className="rounded-md bg-slate-50 px-3 py-2">{TEST_OUTLINE_KEY}</div>
                <div className="rounded-md bg-slate-50 px-3 py-2">{getChapterContentKey(TEST_WORK_ID, TEST_CHAPTER_ID)}</div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-600" />
                <h2 className="text-sm font-black text-slate-900">清理范围</h2>
              </div>
              <p className="text-sm font-medium leading-6 text-slate-500">
                清理只删除固定测试作品、固定测试条目、测试章节正文和测试 AI 关联资料；不会删除真实作品和真实资料库条目。
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default WorkbenchCreationChainTestPage;
