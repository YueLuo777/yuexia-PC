import { useEffect, useRef, useState } from 'react';

import { useDefaultNovelCover } from '@/features/novels/hooks/useDefaultNovelCover';
import { DEFAULT_NOVEL_COVERS } from '@/features/novels/model/defaultNovelCover';
import {
  DEFAULT_COVER_UPLOAD_ACCEPT,
  prepareDefaultNovelCover,
} from '@/features/novels/model/defaultNovelCoverUpload';
import { hasStandardModeSettingEntries } from '@/features/workbench/model/standardModeDefaultSettingAdapter';
import { readStandardModeBrainstormLink } from '@/features/workbench/model/standardModeBrainstormLink';
import {
  BOOK_GENRE_OPTIONS,
  type BookChannel,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import { readStandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import type { StandardModeWorkbenchStats } from '@/features/workbench/model/standardModeWorkbenchStats';
import {
  readStandardModeWorkCoverHistory,
  rememberPreviousStandardModeWorkCover,
} from '@/features/workbench/model/standardModeWorkCoverHistory';
import type { WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { CapsuleSelect, type CapsuleSelectOption } from '@/shared/ui/CapsuleSelect';

import { STANDARD_MODE_ACTION_SELECTED_CLASS } from './StandardModeWorkbenchNavigation';
import { StandardModeCreationGuidePanel } from './StandardModeCreationGuidePanel';
import { StandardModeWorkProfileAiModal } from './StandardModeWorkProfileAiModal';

export type StandardModeWorkDetailsUpdate = Pick<
  WorkbenchNovel,
  'title' | 'category' | 'channel' | 'synopsis' | 'cover' | 'creationStatus' | 'targetWordCount'
>;

type StandardModeWorkDetailsPageProps = {
  novel: WorkbenchNovel;
  stats: StandardModeWorkbenchStats;
  settingsStorageKey: string;
  externalAiOptimizerTarget?: 'title' | 'synopsis' | 'both' | null;
  onExternalAiOptimizerClose?: () => void;
  onSave: (details: StandardModeWorkDetailsUpdate) => void;
  onOpenBrainstorm: () => void;
  onOpenBrainstormLibrary: () => void;
  onOpenSettings: () => void;
  onOpenOutline: () => void;
  onOpenWriting: () => void;
  onOpenAudit: () => void;
};

const CHANNEL_OPTIONS = [
  { value: 'male', label: '男频' },
  { value: 'female', label: '女频' },
] as const;

const STATUS_OPTIONS = [
  { value: 'serializing', label: '连载中' },
  { value: 'completed', label: '已完结' },
] as const;

const CONTROL_BORDER = '#BFC8D2';
const FIELD_CLASS =
  'h-11 w-full rounded-md border bg-white px-4 text-[15px] font-semibold text-[#1f2933] outline-none transition-colors placeholder:text-[#9aa3af] focus:border-[#08AACE]';
const FIELD_LABEL_CLASS = 'mb-2 block text-sm font-bold text-[#657180]';
const SEGMENT_BUTTON_CLASS =
  'h-11 min-w-0 rounded-md border text-[15px] font-bold transition-colors focus-visible:outline-none';

function createDraft(novel: WorkbenchNovel): StandardModeWorkDetailsUpdate {
  return {
    title: novel.title,
    category: novel.category ?? '',
    channel: novel.channel ?? 'male',
    synopsis: novel.synopsis ?? '',
    cover: novel.cover,
    creationStatus: novel.creationStatus === 'completed' ? 'completed' : 'serializing',
    targetWordCount: novel.targetWordCount ?? 0,
  };
}

function getGenreChannel(channel: StandardModeWorkDetailsUpdate['channel']): Extract<BookChannel, 'male' | 'female'> {
  return channel === 'female' ? 'female' : 'male';
}

function buildGenreSelectOptions(channel: Extract<BookChannel, 'male' | 'female'>, currentGenre: string) {
  const options = BOOK_GENRE_OPTIONS[channel];
  const result: CapsuleSelectOption[] = currentGenre
    ? []
    : [{ value: '', label: '请选择题材', disabled: true }];
  if (currentGenre && !options.some((option) => option.label === currentGenre)) {
    result.push(
      { value: '__current_group__', label: '当前题材', disabled: true, variant: 'group', count: 1 },
      { value: currentGenre, label: currentGenre, variant: 'groupedOption' },
    );
  }
  const hotOptions = options.filter((option) => option.group === 'hot');
  const nicheOptions = options.filter((option) => option.group === 'niche');
  result.push(
    { value: '__hot_group__', label: '热门题材', disabled: true, variant: 'group', count: hotOptions.length },
    ...hotOptions.map((option) => ({ value: option.label, label: option.label, variant: 'groupedOption' as const })),
    { value: '__niche_group__', label: '其他题材', disabled: true, variant: 'group', count: nicheOptions.length },
    ...nicheOptions.map((option) => ({ value: option.label, label: option.label, variant: 'groupedOption' as const })),
  );
  return result;
}

export function StandardModeWorkDetailsPage({
  novel,
  stats,
  settingsStorageKey,
  externalAiOptimizerTarget = null,
  onExternalAiOptimizerClose,
  onSave,
  onOpenBrainstorm,
  onOpenBrainstormLibrary,
  onOpenSettings,
  onOpenOutline,
  onOpenWriting,
  onOpenAudit,
}: StandardModeWorkDetailsPageProps) {
  const { selectedCover } = useDefaultNovelCover();
  const [draft, setDraft] = useState(() => createDraft(novel));
  const [coverHistory, setCoverHistory] = useState(() => readStandardModeWorkCoverHistory(novel.id));
  const [notice, setNotice] = useState('');
  const [coverError, setCoverError] = useState('');
  const [aiOptimizerTarget, setAiOptimizerTarget] = useState<'title' | 'synopsis' | 'both' | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const synopsisRef = useRef<HTMLTextAreaElement>(null);
  const targetWordCountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalAiOptimizerTarget) setAiOptimizerTarget(externalAiOptimizerTarget);
  }, [externalAiOptimizerTarget]);

  const updateDraft = <Key extends keyof StandardModeWorkDetailsUpdate>(
    key: Key,
    value: StandardModeWorkDetailsUpdate[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const updateChannel = (channel: 'male' | 'female') => {
    setDraft((current) => {
      const nextGenres = BOOK_GENRE_OPTIONS[channel];
      const category = current.category && nextGenres.some((option) => option.label === current.category)
        ? current.category
        : nextGenres[0]?.label ?? '';
      return { ...current, channel, category };
    });
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;
    setCoverError('');
    try {
      updateDraft('cover', await prepareDefaultNovelCover(file));
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : '封面处理失败');
    }
  };

  const coverSrc = draft.cover || selectedCover.src;
  const genreChannel = getGenreChannel(draft.channel);
  const genreOptions = buildGenreSelectOptions(genreChannel, draft.category ?? '');
  const hasBrainstorm = Boolean(readStandardModeBrainstormLink(String(novel.id)));
  const hasSettings = Boolean(readStandardSettingTemplateState(String(novel.id)))
    || hasStandardModeSettingEntries(settingsStorageKey);
  const statItems = [
    { label: '总字数', value: stats.wordCount.toLocaleString('zh-CN'), unit: '字' },
    { label: '章纲', value: stats.outlineCount.toLocaleString('zh-CN'), unit: '章' },
    { label: '正文', value: stats.draftCount.toLocaleString('zh-CN'), unit: '章' },
    { label: '已审核', value: stats.reviewedChapterCount.toLocaleString('zh-CN'), unit: '章' },
  ];

  return (
    <>
      <StandardModeWorkProfileAiModal
        isOpen={aiOptimizerTarget !== null}
        novel={{ ...novel, ...draft }}
        title={draft.title}
        synopsis={draft.synopsis ?? ''}
        initialTarget={aiOptimizerTarget ?? 'both'}
        onClose={() => {
          setAiOptimizerTarget(null);
          if (externalAiOptimizerTarget) onExternalAiOptimizerClose?.();
        }}
        onApply={(value) => {
          setDraft((current) => ({ ...current, ...value }));
          setNotice('');
        }}
      />
      <main
        className="grid min-h-0 min-w-[1230px] flex-1 grid-cols-[250px_minmax(720px,1fr)_360px] overflow-hidden bg-[#f7f8fa]"
        data-standard-work-details-page="true"
        data-standard-work-details-layout="three-column-guide"
      >
      <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-white p-4">
        <div className="aspect-[3/4] overflow-hidden rounded-md border bg-white" style={{ borderColor: CONTROL_BORDER }}>
          <img src={coverSrc} alt={`${draft.title || novel.title}封面`} className="h-full w-full object-cover" />
        </div>
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="mt-3 h-9 w-full rounded-md border border-[#8fd8e7] bg-white text-sm font-bold text-[#078FAB] hover:bg-[#EAF9FD] focus-visible:outline-none"
        >
          上传新封面
        </button>
        <input
          ref={coverInputRef}
          aria-label="上传作品封面"
          type="file"
          accept={DEFAULT_COVER_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(event) => void handleCoverUpload(event.target.files?.[0])}
        />
        {coverError ? <p role="alert" className="mt-2 text-xs font-semibold text-red-500">{coverError}</p> : null}

        <section className="mt-5 border-t border-[#dce1e8] pt-4">
          <div className="mb-2 text-xs font-bold text-[#657180]">历史封面</div>
          {coverHistory.length ? (
            <div className="grid grid-cols-4 gap-2" data-work-cover-history="true">
              {coverHistory.map((cover, index) => (
                <button
                  key={`${cover.savedAt}:${cover.src}`}
                  type="button"
                  aria-label={`使用历史封面${index + 1}`}
                  aria-pressed={coverSrc === cover.src}
                  onClick={() => updateDraft('cover', cover.src)}
                  className={`aspect-[3/4] overflow-hidden rounded border-2 bg-white ${
                    coverSrc === cover.src ? 'border-[#08AACE]' : 'border-[#dce1e8]'
                  }`}
                >
                  <img src={cover.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-4 border-t border-[#dce1e8] pt-4">
          <div className="mb-2 text-xs font-bold text-[#657180]">软件默认封面</div>
          <div className="grid grid-cols-4 gap-2" data-software-default-covers="true">
            {DEFAULT_NOVEL_COVERS.map((cover) => (
              <button
                key={cover.id}
                type="button"
                aria-label={`使用软件默认封面：${cover.label}`}
                aria-pressed={coverSrc === cover.src}
                onClick={() => updateDraft('cover', cover.src)}
                className={`aspect-[3/4] overflow-hidden rounded border-2 bg-white ${
                  coverSrc === cover.src ? 'border-[#08AACE]' : 'border-[#dce1e8]'
                }`}
              >
                <img src={cover.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden p-5">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#dce1e8] pb-3">
          <h1 className="text-lg font-bold text-[#1f2933]">作品资料</h1>
          <section aria-label="创作进度" className="flex items-center divide-x divide-[#dce1e8]">
            {statItems.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1 px-2.5 text-xs">
                <span className="font-semibold text-[#657180]">{item.label}</span>
                <strong className="text-[#078FAB]">{item.value}</strong>
                <span className="font-semibold text-[#8a95a2]">{item.unit}</span>
              </div>
            ))}
          </section>
        </header>

        <div className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 pt-5 [scrollbar-gutter:stable]">
          <div
            className="grid w-full grid-cols-2 gap-x-8 gap-y-5"
            data-work-details-aligned-grid="true"
          >
            <div>
              <span className={FIELD_LABEL_CLASS}>
                作品名称<span aria-hidden="true" className="ml-0.5 text-red-500">*</span>
              </span>
              <span className="flex gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">作品名称 *</span>
                  <input
                    ref={titleRef}
                    aria-label="作品名称"
                    value={draft.title}
                    maxLength={20}
                    onChange={(event) => updateDraft('title', event.target.value)}
                    className={FIELD_CLASS}
                    style={{ borderColor: CONTROL_BORDER }}
                  />
                </label>
                <button
                  type="button"
                  aria-label="AI取名"
                  onClick={() => setAiOptimizerTarget('both')}
                  className="h-11 shrink-0 rounded-md border border-[#8fd8e7] bg-white px-4 text-sm font-bold text-[#078FAB] hover:bg-[#EAF9FD] focus-visible:outline-none"
                >
                  AI取名
                </button>
              </span>
            </div>
            <label>
              <span className={FIELD_LABEL_CLASS}>预计篇幅</span>
              <span className="flex h-11 w-full overflow-hidden rounded-md border bg-white focus-within:border-[#08AACE]" style={{ borderColor: CONTROL_BORDER }}>
                <input
                  ref={targetWordCountRef}
                  aria-label="预计篇幅"
                  type="number"
                  min="0"
                  max="999999"
                  step="10"
                  value={draft.targetWordCount ? draft.targetWordCount / 10_000 : ''}
                  placeholder="例如 100"
                  onChange={(event) => {
                    const value = Math.min(999999, Math.max(0, Math.trunc(Number(event.target.value) || 0)));
                    updateDraft('targetWordCount', value * 10_000);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-semibold text-[#1f2933] outline-none placeholder:text-[#9aa3af]"
                />
                <span className="grid w-12 place-items-center border-l border-[#dce1e8] text-xs font-semibold text-[#657180]">万字</span>
              </span>
            </label>
            <fieldset>
              <legend className={FIELD_LABEL_CLASS}>
                作品频道<span aria-hidden="true" className="ml-0.5 text-red-500">*</span>
              </legend>
              <div className="grid w-full grid-cols-2 gap-2">
                {CHANNEL_OPTIONS.map((option) => {
                  const selected = draft.channel === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateChannel(option.value)}
                      className={`${SEGMENT_BUTTON_CLASS} ${selected ? STANDARD_MODE_ACTION_SELECTED_CLASS : 'border-[#BFC8D2] bg-white text-[#657180]'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <legend className={FIELD_LABEL_CLASS}>
                作品题材<span aria-hidden="true" className="ml-0.5 text-red-500">*</span>
              </legend>
              <CapsuleSelect
                ariaLabel="作品题材"
                value={draft.category ?? ''}
                options={genreOptions}
                preserveOptionOrder
                onChange={(value) => updateDraft('category', value)}
                className="w-full"
                buttonClassName="!h-11 !rounded-md !border-[#BFC8D2] !bg-white !px-4 !text-[15px] !font-semibold !text-[#1f2933] !shadow-none focus-visible:!outline-none"
                dropdownClassName="!max-h-[360px]"
              />
            </fieldset>
            <fieldset>
              <legend className={FIELD_LABEL_CLASS}>创作状态</legend>
              <div className="grid w-full grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const selected = draft.creationStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateDraft('creationStatus', option.value)}
                      className={`${SEGMENT_BUTTON_CLASS} ${selected ? STANDARD_MODE_ACTION_SELECTED_CLASS : 'border-[#BFC8D2] bg-white text-[#657180]'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div>
              <span className={FIELD_LABEL_CLASS}>作品时间</span>
              <div aria-label="作品时间" className="flex h-11 w-full items-center rounded-md border bg-white px-4 text-sm font-semibold text-[#657180]" style={{ borderColor: CONTROL_BORDER }}>
                创建 {novel.createdAt || '暂无记录'}　最近编辑 {novel.lastModifiedAt || '暂无记录'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex min-h-[260px] flex-1 flex-col">
            <span className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[#657180]">作品简介</span>
              <button
                type="button"
                aria-label="AI优化作品简介"
                onClick={() => setAiOptimizerTarget('synopsis')}
                className="h-8 rounded-md border border-[#8fd8e7] bg-white px-3 text-xs font-bold text-[#078FAB] hover:bg-[#EAF9FD] focus-visible:outline-none"
              >
                AI优化
              </button>
            </span>
            <label className="flex min-h-[260px] flex-1 flex-col">
              <span className="sr-only">作品简介</span>
              <textarea
                ref={synopsisRef}
                aria-label="作品简介"
                value={draft.synopsis ?? ''}
                maxLength={1000}
                onChange={(event) => updateDraft('synopsis', event.target.value)}
                placeholder="简要说明故事背景、主角和主要冲突"
                className="editor-scrollbar min-h-[240px] w-full flex-1 resize-none rounded-md border bg-white p-4 text-[15px] font-medium leading-7 text-[#1f2933] outline-none placeholder:text-[#9aa3af] focus:border-[#08AACE]"
                style={{ borderColor: CONTROL_BORDER }}
              />
            </label>
          </div>
          <div className="mt-4 flex w-full items-center justify-end gap-3 pb-1">
            {notice ? <span role="status" className="text-sm font-semibold text-[#078FAB]">{notice}</span> : null}
            <button
              type="button"
              onClick={() => {
                const nextHistory = rememberPreviousStandardModeWorkCover(
                  novel.id,
                  novel.cover,
                  draft.cover,
                  coverHistory,
                );
                setCoverHistory(nextHistory);
                onSave(draft);
                setNotice('作品资料已保存');
              }}
              className="h-10 rounded-md bg-[#08AACE] px-7 text-sm font-bold text-white hover:bg-[#0797b8]"
            >
              保存修改
            </button>
          </div>
        </div>
      </section>

      <StandardModeCreationGuidePanel
        hasBrainstorm={hasBrainstorm}
        hasSettings={hasSettings}
        stats={stats}
        onOpenBrainstorm={onOpenBrainstorm}
        onOpenBrainstormLibrary={onOpenBrainstormLibrary}
        onOpenSettings={onOpenSettings}
        onOpenOutline={onOpenOutline}
        onOpenWriting={onOpenWriting}
        onOpenAudit={onOpenAudit}
      />
      </main>
    </>
  );
}
