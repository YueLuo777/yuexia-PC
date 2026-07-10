import { Check, FileText, Highlighter, ListChecks, SplitSquareHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type DiffToken = {
  text: string;
  changed?: boolean;
  removed?: boolean;
};

type DiffParagraph = {
  id: string;
  label: string;
  original: string;
  revised: DiffToken[];
  note: string;
};

type DisplayScheme = {
  id: string;
  title: string;
  summary: string;
  recommended?: boolean;
};

const sampleParagraphs: DiffParagraph[] = [
  {
    id: 'p1',
    label: '第 1 段',
    original: '林啸站在门口，心里非常复杂。他知道今天一定会出事。',
    revised: [
      { text: '林啸站在门口，' },
      { text: '指节无声收紧', changed: true },
      { text: '。他知道今天' },
      { text: '多半', changed: true },
      { text: '会出事。' },
    ],
    note: '把笼统心理改成可见动作，并把绝对判断改成更自然的预感。',
  },
  {
    id: 'p2',
    label: '第 2 段',
    original: '屋里很安静，安静得让人感觉特别安静。',
    revised: [{ text: '屋里很安静，' }, { text: '连灯芯爆开的轻响都显得刺耳', changed: true }, { text: '。' }],
    note: '删除重复表达，补成更具体的氛围描写。',
  },
];

const schemes: DisplayScheme[] = [
  {
    id: 'inline-red',
    title: '方案 A：审核后正文红字标改动',
    summary: '只显示审核后的正文，凡是 AI 改过的字句用红色。阅读最顺，最接近你说的“改了就红字显示”。',
  },
  {
    id: 'side-by-side',
    title: '方案 B：原文 / 审核后左右对照',
    summary: '左边保留原文，右边显示审核后；新增或改写内容用红色，删除内容用灰色删除线。',
    recommended: true,
  },
  {
    id: 'paragraph-cards',
    title: '方案 C：按段落卡片展示',
    summary: '每段先显示审核后正文，再显示本段修改原因。适合长章节定位问题，但正文阅读感稍弱。',
  },
  {
    id: 'change-list',
    title: '方案 D：只列改动清单',
    summary: '不展示全文，只列第几段改了哪里和原因。最省空间，但不方便直接检查最终正文。',
  },
];

function RevisedText({ paragraph }: { paragraph: DiffParagraph }) {
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

function SchemeHeader({ scheme, icon: Icon }: { scheme: DisplayScheme; icon: LucideIcon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#08AACE]" />
          <h2 className="text-base font-black text-slate-950">{scheme.title}</h2>
          {scheme.recommended ? (
            <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-black text-[#078fb0]">推荐</span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{scheme.summary}</p>
      </div>
    </div>
  );
}

function SchemeCard({ scheme, icon, children }: { scheme: DisplayScheme; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SchemeHeader scheme={scheme} icon={icon} />
      {children}
    </section>
  );
}

function InlineRedScheme() {
  return (
    <SchemeCard scheme={schemes[0]} icon={Highlighter}>
      <div className="rounded-lg border border-cyan-100 bg-[#fbfdff] p-4">
        <div className="mb-3 flex h-8 items-center justify-between border-b border-slate-100 text-xs font-black text-slate-400">
          <span>第1章 审核后</span>
          <span>红字为 AI 修改</span>
        </div>
        <div className="space-y-4 text-sm font-bold leading-8 text-slate-700">
          {sampleParagraphs.map((paragraph) => (
            <p key={paragraph.id} className="whitespace-pre-wrap">
              <RevisedText paragraph={paragraph} />
            </p>
          ))}
        </div>
      </div>
    </SchemeCard>
  );
}

function SideBySideScheme() {
  return (
    <SchemeCard scheme={schemes[1]} icon={SplitSquareHorizontal}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-xs font-black text-slate-400">原文</div>
          <div className="space-y-4 text-sm font-bold leading-7 text-slate-500">
            {sampleParagraphs.map((paragraph) => (
              <p key={paragraph.id}>{paragraph.original}</p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-cyan-100 bg-white p-4">
          <div className="mb-3 text-xs font-black text-[#078fb0]">审核后</div>
          <div className="space-y-4 text-sm font-bold leading-7 text-slate-700">
            {sampleParagraphs.map((paragraph) => (
              <p key={paragraph.id}>
                <RevisedText paragraph={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </SchemeCard>
  );
}

function ParagraphCardsScheme() {
  return (
    <SchemeCard scheme={schemes[2]} icon={FileText}>
      <div className="space-y-3">
        {sampleParagraphs.map((paragraph) => (
          <article key={paragraph.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-black">
              <span className="text-slate-400">{paragraph.label}</span>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-500">有修改</span>
            </div>
            <p className="text-sm font-bold leading-7 text-slate-700">
              <RevisedText paragraph={paragraph} />
            </p>
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
              {paragraph.note}
            </p>
          </article>
        ))}
      </div>
    </SchemeCard>
  );
}

function ChangeListScheme() {
  return (
    <SchemeCard scheme={schemes[3]} icon={ListChecks}>
      <div className="space-y-2">
        {sampleParagraphs.map((paragraph) => (
          <div key={paragraph.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#08AACE]" />
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900">{paragraph.label}</div>
              <div className="mt-1 text-xs font-bold leading-5 text-slate-500">{paragraph.note}</div>
              <div className="mt-2 text-sm font-bold leading-7 text-slate-700">
                <RevisedText paragraph={paragraph} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SchemeCard>
  );
}

export function TextAuditDiffDisplayTestPage() {
  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-black text-[#08AACE]">文本审核差异显示测试</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">原文 / 审核后左右对照方案</h1>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-500">
            先在测试区比较几种显示方式。正式页可以把“第 N 章 审核结果”改成“第 N 章 审核后”，并在文本审核模式下对 AI
            修改过的字句做红色标记。
          </p>
        </header>
        <InlineRedScheme />
        <SideBySideScheme />
        <ParagraphCardsScheme />
        <ChangeListScheme />
      </div>
    </div>
  );
}
