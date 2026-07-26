import { useState } from 'react';

import type { StandardTestChapter } from './standardModeFourStageTestModel';

interface StandardModeAuditStageTestProps {
  chapters: StandardTestChapter[];
  selectedChapterNumber: number;
  onSelectChapter: (number: number) => void;
  onRunAudit: (number: number, requirement: string) => void;
}

export function StandardModeAuditStageTest({
  chapters,
  selectedChapterNumber,
  onSelectChapter,
  onRunAudit,
}: StandardModeAuditStageTestProps) {
  const [requirement, setRequirement] = useState('重点检查正文是否偏离章纲，以及人物行为是否符合设定');
  const selected = chapters.find((chapter) => chapter.number === selectedChapterNumber) ?? chapters[0];
  const outline = selected.outlines[selected.selectedVersion] ?? '';

  return (
    <div className="grid h-full min-h-0 grid-cols-[190px_minmax(660px,1fr)_320px] bg-white" data-testid="standard-audit-stage">
      <aside className="min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-3">
        <div className="px-2 pb-3 text-sm font-semibold text-[#26323f]">章节序号</div>
        <div className="grid grid-cols-3 gap-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.number}
              type="button"
              aria-current={chapter.number === selected.number ? 'true' : undefined}
              onClick={() => onSelectChapter(chapter.number)}
              className={[
                'h-11 rounded-md border bg-white text-sm font-semibold',
                chapter.number === selected.number
                  ? 'border-[#08AACE] text-[#078FAB]'
                  : 'border-[#dce1e8] text-[#657180]',
              ].join(' ')}
            >
              {chapter.number}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col px-5 py-5">
        <div className="flex items-center justify-between border-b border-[#e7eaee] pb-4">
          <div>
            <div className="text-xs font-medium text-[#078FAB]">剧情审核</div>
            <h2 className="mt-1 text-lg font-semibold text-[#26323f]">第{selected.number}章 {selected.title}</h2>
          </div>
          <span className="text-xs text-[#8a95a2]">章纲、原文和结果同时对照</span>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-3 divide-x divide-[#dce1e8] overflow-hidden rounded-md border border-[#cfd6dd] bg-white">
          <section className="min-h-0 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-[#44515f]">章纲</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#657180]">{outline || '本章还没有章纲。'}</p>
          </section>
          <section className="min-h-0 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-[#44515f]">原文</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#657180]">{selected.body || '本章还没有正文。'}</p>
          </section>
          <section className="min-h-0 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-[#44515f]">审核结果</h3>
            {selected.auditResult ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#44515f]">{selected.auditResult}</p>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center text-sm text-[#a4adb7]">等待开始审核</div>
            )}
          </section>
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <h2 className="text-base font-semibold text-[#26323f]">审核操作台</h2>
        <p className="mt-1 text-xs leading-5 text-[#8a95a2]">自动读取本章章纲、正文和已经确认的设定。</p>
        <textarea
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          className="mt-4 h-36 resize-none rounded-md border border-[#cfd6dd] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
        />
        <div className="mt-4 space-y-2 text-sm text-[#657180]">
          <div className="flex items-center justify-between border-b border-[#e1e5e9] py-2"><span>剧情与章纲一致性</span><span>自动</span></div>
          <div className="flex items-center justify-between border-b border-[#e1e5e9] py-2"><span>人物设定一致性</span><span>自动</span></div>
          <div className="flex items-center justify-between border-b border-[#e1e5e9] py-2"><span>前后逻辑连贯性</span><span>自动</span></div>
        </div>
        <button
          type="button"
          disabled={!selected.body}
          onClick={() => onRunAudit(selected.number, requirement)}
          className="mt-auto h-11 rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB] disabled:bg-[#cbd3d9]"
        >
          开始剧情审核
        </button>
      </aside>
    </div>
  );
}
