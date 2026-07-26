import { useMemo, useState } from 'react';

import type { CreationView, StandardTestChapter } from './standardModeFourStageTestModel';

interface StandardModeCreationStageTestProps {
  view: CreationView;
  chapters: StandardTestChapter[];
  selectedChapterNumber: number;
  onSelectChapter: (number: number) => void;
  onGenerateOutlines: (start: number, count: number, versions: number, requirement: string) => void;
  onSelectVersion: (chapterNumber: number, version: number) => void;
  onGenerateBody: (chapterNumber: number) => void;
  onChangeBody: (chapterNumber: number, body: string) => void;
  onReviseBody: (chapterNumber: number, requirement: string) => void;
  onChangeView: (view: CreationView) => void;
  onEnterAudit: () => void;
}

function ChapterNumberSidebar({
  chapters,
  selectedChapterNumber,
  onSelectChapter,
}: Pick<StandardModeCreationStageTestProps, 'chapters' | 'selectedChapterNumber' | 'onSelectChapter'>) {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-3">
      <div className="px-2 pb-3 text-sm font-semibold text-[#26323f]">章节序号</div>
      <div className="grid grid-cols-3 gap-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.number}
            type="button"
            aria-current={chapter.number === selectedChapterNumber ? 'true' : undefined}
            onClick={() => onSelectChapter(chapter.number)}
            className={[
              'h-11 rounded-md border bg-white text-sm font-semibold',
              chapter.number === selectedChapterNumber
                ? 'border-[#08AACE] text-[#078FAB]'
                : 'border-[#dce1e8] text-[#657180] hover:border-[#9fdce8]',
            ].join(' ')}
          >
            {chapter.number}
          </button>
        ))}
      </div>
    </aside>
  );
}

function OutlineWorkspace(props: StandardModeCreationStageTestProps) {
  const [chapterCount, setChapterCount] = useState(1);
  const [versionCount, setVersionCount] = useState(2);
  const [requirement, setRequirement] = useState('节奏紧凑，章末留下明确钩子');
  const selected = props.chapters.find((chapter) => chapter.number === props.selectedChapterNumber) ?? props.chapters[0];
  const selectedOutline = selected.outlines[selected.selectedVersion] ?? '';

  return (
    <div className="grid h-full min-h-0 grid-cols-[190px_minmax(500px,1fr)_340px] bg-white" data-testid="standard-outline-stage">
      <ChapterNumberSidebar {...props} />

      <main className="min-h-0 overflow-y-auto px-6 py-5">
        <div className="flex items-center justify-between border-b border-[#e7eaee] pb-4">
          <div>
            <div className="text-xs font-medium text-[#078FAB]">第{selected.number}章</div>
            <h2 className="mt-1 text-lg font-semibold text-[#26323f]">{selected.title} · 章纲</h2>
          </div>
          {selected.outlines.length > 0 ? (
            <div className="flex items-center gap-2" aria-label="章纲版本">
              {selected.outlines.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={selected.selectedVersion === index}
                  onClick={() => props.onSelectVersion(selected.number, index)}
                  className={[
                    'h-8 rounded-md border bg-white px-3 text-xs font-medium',
                    selected.selectedVersion === index ? 'border-[#08AACE] text-[#078FAB]' : 'border-[#dce1e8] text-[#657180]',
                  ].join(' ')}
                >
                  版本{index + 1}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-md border border-[#cfd6dd] bg-white p-5">
          <div className="text-xs text-[#8a95a2]">连贯依据：上一章章纲、已确认设定和当前选择版本</div>
          {selectedOutline ? (
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-[#44515f]">{selectedOutline}</p>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-[#a4adb7]">尚未生成第{selected.number}章章纲</div>
          )}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <h2 className="text-base font-semibold text-[#26323f]">章纲操作台</h2>
        <p className="mt-1 text-xs leading-5 text-[#8a95a2]">可为连续章节生成多个连贯版本。</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#657180]">连续生成章节</span>
            <select
              aria-label="连续生成章节"
              value={chapterCount}
              onChange={(event) => setChapterCount(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-[#cfd6dd] bg-white px-3 text-sm text-[#44515f]"
            >
              {[1, 2, 3].map((number) => <option key={number} value={number}>{number}章</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#657180]">每章生成版本</span>
            <select
              aria-label="每章生成版本"
              value={versionCount}
              onChange={(event) => setVersionCount(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-[#cfd6dd] bg-white px-3 text-sm text-[#44515f]"
            >
              {[1, 2, 3].map((number) => <option key={number} value={number}>{number}个版本</option>)}
            </select>
          </label>
        </div>

        <textarea
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          placeholder="输入本次章纲要求"
          className="mt-4 h-28 resize-none rounded-md border border-[#cfd6dd] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
        />
        <button
          type="button"
          onClick={() => props.onGenerateOutlines(selected.number, chapterCount, versionCount, requirement)}
          className="mt-3 h-11 rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB]"
        >
          生成连贯章纲
        </button>

        <div className="mt-auto border-t border-[#dce1e8] pt-4">
          <button
            type="button"
            disabled={!selectedOutline}
            onClick={() => {
              props.onGenerateBody(selected.number);
              props.onChangeView('writing');
            }}
            className="h-11 w-full rounded-md border border-[#08AACE] bg-white text-sm font-semibold text-[#078FAB] disabled:border-[#dce1e8] disabled:text-[#a4adb7]"
          >
            使用此章纲生成正文
          </button>
        </div>
      </aside>
    </div>
  );
}

function WritingWorkspace(props: StandardModeCreationStageTestProps) {
  const [requirement, setRequirement] = useState('');
  const selected = props.chapters.find((chapter) => chapter.number === props.selectedChapterNumber) ?? props.chapters[0];
  const wordCount = useMemo(() => selected.body.replace(/\s/g, '').length, [selected.body]);

  return (
    <div className="grid h-full min-h-0 grid-cols-[230px_minmax(500px,1fr)_340px] bg-white" data-testid="standard-writing-stage">
      <aside className="min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-3">
        <div className="px-2 pb-3 text-sm font-semibold text-[#26323f]">正文目录</div>
        <div className="space-y-2">
          {props.chapters.map((chapter) => (
            <button
              key={chapter.number}
              type="button"
              aria-current={chapter.number === selected.number ? 'true' : undefined}
              onClick={() => props.onSelectChapter(chapter.number)}
              className={[
                'flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm',
                chapter.number === selected.number ? 'border-[#08AACE] text-[#078FAB]' : 'border-[#dce1e8] text-[#44515f]',
              ].join(' ')}
            >
              <span className="truncate">第{chapter.number}章 {chapter.title}</span>
              <span className="ml-2 shrink-0 text-xs text-[#8a95a2]">{chapter.body ? '已生成' : '未生成'}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col bg-white px-7 py-5">
        <div className="flex items-center justify-between border-b border-[#e7eaee] pb-4">
          <div>
            <div className="text-xs font-medium text-[#078FAB]">第{selected.number}章 正文</div>
            <h2 className="mt-1 text-lg font-semibold text-[#26323f]">{selected.title}</h2>
          </div>
          <span className="text-xs text-[#8a95a2]">{wordCount}字</span>
        </div>
        <textarea
          value={selected.body}
          onChange={(event) => props.onChangeBody(selected.number, event.target.value)}
          placeholder="生成后的正文会显示在这里，也可以直接编辑"
          className="min-h-0 flex-1 resize-none border-0 bg-white px-3 py-5 text-base leading-8 text-[#384552] outline-none"
        />
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <h2 className="text-base font-semibold text-[#26323f]">正文AI操作台</h2>
        <p className="mt-1 text-xs leading-5 text-[#8a95a2]">当前章纲和已确认设定会自动关联。</p>
        <textarea
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          placeholder="例如：加强对话冲突，减少环境描写"
          className="mt-4 h-32 resize-none rounded-md border border-[#cfd6dd] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
        />
        <button
          type="button"
          disabled={!requirement.trim() || !selected.body}
          onClick={() => {
            props.onReviseBody(selected.number, requirement);
            setRequirement('');
          }}
          className="mt-3 h-10 rounded-md border border-[#08AACE] bg-white text-sm font-semibold text-[#078FAB] disabled:border-[#dce1e8] disabled:text-[#a4adb7]"
        >
          按要求修改正文
        </button>
        <div className="mt-auto border-t border-[#dce1e8] pt-4">
          <button
            type="button"
            disabled={!selected.body}
            onClick={props.onEnterAudit}
            className="h-11 w-full rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB] disabled:bg-[#cbd3d9]"
          >
            进入审核阶段
          </button>
        </div>
      </aside>
    </div>
  );
}

export function StandardModeCreationStageTest(props: StandardModeCreationStageTestProps) {
  return props.view === 'outline' ? <OutlineWorkspace {...props} /> : <WritingWorkspace {...props} />;
}
