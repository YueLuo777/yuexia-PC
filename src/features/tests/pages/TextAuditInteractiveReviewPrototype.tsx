import { useMemo, useState } from 'react';

export type TextAuditDiffToken = {
  text: string;
  changed?: boolean;
  removed?: boolean;
};

export type TextAuditDiffParagraph = {
  id: string;
  label: string;
  original: string;
  originalDiff?: TextAuditDiffToken[];
  revised: TextAuditDiffToken[];
  note: string;
  category: string;
};

type ReviewDecision = 'pending' | 'accepted' | 'rejected' | 'edited';

function OriginalDiffText({ paragraph }: { paragraph: TextAuditDiffParagraph }) {
  const tokens = paragraph.originalDiff ?? [{ text: paragraph.original }];
  return (
    <>
      {tokens.map((token, index) => (
        <span
          key={`${paragraph.id}-original-${index}`}
          className={token.changed ? 'rounded bg-red-50 px-0.5 text-red-400 line-through decoration-2' : undefined}
        >
          {token.text}
        </span>
      ))}
    </>
  );
}

function RevisedDiffText({ paragraph }: { paragraph: TextAuditDiffParagraph }) {
  return (
    <>
      {paragraph.revised.map((token, index) => (
        <span key={`${paragraph.id}-${index}`} className={token.changed ? 'font-black text-red-500' : undefined}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function getRevisedText(paragraph: TextAuditDiffParagraph) {
  return paragraph.revised.map((token) => token.text).join('');
}

function hasParagraphChange(paragraph: TextAuditDiffParagraph) {
  return paragraph.original !== getRevisedText(paragraph);
}

const decisionMeta: Record<ReviewDecision, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  accepted: { label: '已接受', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  rejected: { label: '保留原文', className: 'border-slate-200 bg-slate-100 text-slate-500' },
  edited: { label: '编辑后采用', className: 'border-violet-200 bg-violet-50 text-violet-700' },
};

export function TextAuditInteractiveReviewPrototype({
  paragraphs,
  variant = 'standalone',
}: {
  paragraphs: TextAuditDiffParagraph[];
  variant?: 'standalone' | 'review-page';
}) {
  const changedParagraphs = useMemo(() => paragraphs.filter(hasParagraphChange), [paragraphs]);
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>(() =>
    Object.fromEntries(changedParagraphs.map((paragraph) => [paragraph.id, 'pending'])),
  );
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(changedParagraphs.map((paragraph) => [paragraph.id, getRevisedText(paragraph)])),
  );
  const [activeChangeIndex, setActiveChangeIndex] = useState(0);
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [showAppliedPreview, setShowAppliedPreview] = useState(false);
  const isReviewPage = variant === 'review-page';

  const acceptedCount = changedParagraphs.filter((paragraph) =>
    ['accepted', 'edited'].includes(decisions[paragraph.id] ?? 'pending'),
  ).length;
  const rejectedCount = changedParagraphs.filter((paragraph) => decisions[paragraph.id] === 'rejected').length;
  const pendingCount = changedParagraphs.length - acceptedCount - rejectedCount;
  const activeParagraphId = changedParagraphs[activeChangeIndex]?.id;
  const visibleParagraphs = showChangesOnly ? changedParagraphs : paragraphs;
  const finalParagraphs = paragraphs.map((paragraph) => {
    const decision = decisions[paragraph.id];
    if (decision === 'accepted') return getRevisedText(paragraph);
    if (decision === 'edited') return editedTexts[paragraph.id] ?? getRevisedText(paragraph);
    return paragraph.original;
  });

  const setDecision = (paragraphId: string, decision: ReviewDecision) => {
    setDecisions((current) => ({ ...current, [paragraphId]: decision }));
    setShowAppliedPreview(false);
    if (decision !== 'edited') setEditingParagraphId(null);
  };
  const moveChange = (direction: -1 | 1) => {
    if (!changedParagraphs.length) return;
    setActiveChangeIndex((current) => (current + direction + changedParagraphs.length) % changedParagraphs.length);
  };
  const resetReview = () => {
    setDecisions(Object.fromEntries(changedParagraphs.map((paragraph) => [paragraph.id, 'pending'])));
    setEditedTexts(Object.fromEntries(changedParagraphs.map((paragraph) => [paragraph.id, getRevisedText(paragraph)])));
    setActiveChangeIndex(0);
    setEditingParagraphId(null);
    setShowAppliedPreview(false);
  };

  return (
    <section
      className={
        isReviewPage
          ? 'flex h-full min-h-0 flex-col overflow-hidden bg-white'
          : 'overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-sm'
      }
    >
      {!isReviewPage ? (
        <div className="border-b border-cyan-100 bg-gradient-to-r from-[#F2FCFE] to-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  1 剧情审核 · 已通过
                </span>
                <span className="text-slate-300">→</span>
                <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-[#078fb0]">
                  2 文本审核 · 审阅中
                </span>
              </div>
              <h2 className="mt-3 text-lg font-black text-slate-950">逐段审阅原型</h2>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                先逐段确认，最后统一应用；本测试页只演示审阅交互，不会改动真实章节正文。
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
              共 {changedParagraphs.length} 处 · 已采用 {acceptedCount} · 保留 {rejectedCount} · 待处理 {pendingCount}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveChange(-1)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-cyan-300 hover:text-[#078fb0]"
          >
            上一处
          </button>
          <span className="min-w-16 text-center text-xs font-black text-slate-400">
            {changedParagraphs.length ? activeChangeIndex + 1 : 0} / {changedParagraphs.length}
          </span>
          <button
            type="button"
            onClick={() => moveChange(1)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-cyan-300 hover:text-[#078fb0]"
          >
            下一处
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChangesOnly((current) => !current)}
            className={`h-8 rounded-lg border px-3 text-xs font-black ${showChangesOnly ? 'border-cyan-200 bg-[#EAF9FD] text-[#078fb0]' : 'border-slate-200 bg-white text-slate-500'}`}
          >
            {showChangesOnly ? '显示全部段落' : '只看改动'}
          </button>
          <button
            type="button"
            onClick={resetReview}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 hover:text-slate-700"
          >
            重置选择
          </button>
        </div>
      </div>

      <div className={`${isReviewPage ? 'min-h-0 flex-1 overflow-y-auto' : ''} space-y-3 bg-slate-50/60 p-4`}>
        {visibleParagraphs.map((paragraph) => {
          const changed = hasParagraphChange(paragraph);
          const decision = changed ? (decisions[paragraph.id] ?? 'pending') : null;
          const selected = paragraph.id === activeParagraphId;
          const editing = editingParagraphId === paragraph.id;
          return (
            <article
              key={paragraph.id}
              onClick={() => {
                const index = changedParagraphs.findIndex((item) => item.id === paragraph.id);
                if (index >= 0) setActiveChangeIndex(index);
              }}
              className={`overflow-hidden rounded-xl border bg-white transition-shadow ${selected ? 'border-cyan-300 shadow-[0_0_0_2px_rgba(8,170,206,0.1)]' : 'border-slate-200'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="text-slate-500">{paragraph.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{paragraph.category}</span>
                </div>
                {decision ? (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${decisionMeta[decision].className}`}
                  >
                    {decisionMeta[decision].label}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">
                    未修改
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2">
                <div className="border-b border-slate-100 p-4 md:border-b-0 md:border-r">
                  <div className="mb-2 text-[11px] font-black text-slate-400">原文</div>
                  <p className="whitespace-pre-wrap text-sm font-bold leading-8 text-slate-600">
                    <OriginalDiffText paragraph={paragraph} />
                  </p>
                </div>
                <div className="border-b border-slate-100 bg-[#FCFEFF] p-4 md:border-b-0">
                  <div className="mb-2 text-[11px] font-black text-[#078fb0]">审核后</div>
                  {editing ? (
                    <textarea
                      autoFocus
                      value={editedTexts[paragraph.id] ?? getRevisedText(paragraph)}
                      onChange={(event) =>
                        setEditedTexts((current) => ({ ...current, [paragraph.id]: event.target.value }))
                      }
                      className="min-h-24 w-full resize-y rounded-lg border border-violet-200 bg-white p-3 text-sm font-bold leading-7 text-slate-700 outline-none focus:border-violet-400"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm font-bold leading-8 text-slate-700">
                      <RevisedDiffText paragraph={paragraph} />
                    </p>
                  )}
                </div>
              </div>

              {changed ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                  <p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-500">
                    修改原因：{paragraph.note}
                  </p>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDecision(paragraph.id, 'rejected');
                      }}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 hover:bg-slate-50"
                    >
                      保留原文
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingParagraphId(paragraph.id);
                        setDecision(paragraph.id, 'edited');
                      }}
                      className="h-8 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-black text-violet-700 hover:bg-violet-100"
                    >
                      编辑后采用
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDecision(paragraph.id, 'accepted');
                      }}
                      className="h-8 rounded-lg border border-cyan-500 bg-[#08AACE] px-3 text-xs font-black text-white hover:bg-[#078fb0]"
                    >
                      接受本段
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4">
        <p className="text-xs font-bold text-slate-400">待处理和“保留原文”的段落不会进入最终修改稿。</p>
        <button
          type="button"
          disabled={acceptedCount === 0}
          onClick={() => setShowAppliedPreview(true)}
          className="h-9 rounded-lg bg-slate-950 px-4 text-xs font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          应用已接受修改（{acceptedCount}）
        </button>
      </div>

      {showAppliedPreview ? (
        <div className="border-t border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-emerald-800">最终正文预览</div>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                真实页面中，此处确认后才会保存历史版本并写回正文。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAppliedPreview(false)}
              className="h-8 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-black text-emerald-700"
            >
              收起预览
            </button>
          </div>
          <div className="mt-3 space-y-3 rounded-xl border border-emerald-100 bg-white p-4 text-sm font-bold leading-7 text-slate-700">
            {finalParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 12)}`} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
