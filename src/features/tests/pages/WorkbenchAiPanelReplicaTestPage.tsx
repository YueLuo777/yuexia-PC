import { Plus, Send, Settings, Square } from 'lucide-react';
import { useMemo, useState } from 'react';

type ReplicaPageId = 'outline' | 'plot' | 'detail' | 'writing' | 'brainstorm' | 'audit' | 'comment' | 'status' | 'summary';

type ReplicaPage = {
  id: ReplicaPageId;
  label: string;
  model: string;
  prompt: string;
  outputTitle: string;
  outputEmpty: string;
  contextTabs: [string, string, string];
  inputPlaceholder: string;
  actions: [string, string, string, string];
  destructive: string;
  wordCount: number;
};

const t = {
  outline: '\u5927\u7eb2',
  plot: '\u5267\u60c5\u94fe',
  detail: '\u7ae0\u7eb2',
  writing: '\u6b63\u6587',
  brainstorm: '\u8111\u6d1e',
  audit: '\u5ba1\u6838',
  comment: '\u70b9\u8bc4',
  status: '\u72b6\u6001',
  summary: '\u6982\u8981',
  model: '\u6a21\u578b',
  prompt: '\u63d0\u793a\u8bcd',
  manage: '\u7ba1\u7406',
  gptPool: 'GPT\u514d\u8d39\u6c60',
  generate: '\u751f\u6210',
  chapterAudit: '\u7ae0\u8282\u5ba1\u6838',
  chapterComment: '\u7ae0\u8282\u70b9\u8bc4',
  statusUpdate: '\u72b6\u6001\u66f4\u65b0',
  output: '\u8f93\u51fa',
  result: '\u7ed3\u679c',
  empty: '\u6682\u65e0',
  content: '\u5185\u5bb9',
  dialog: '\u5bf9\u8bdd',
  point: '\u70b9',
  enter: '\u8bf7\u8f93\u5165',
  requirement: '\u8981\u6c42',
  save: '\u4fdd\u5b58',
  copy: '\u590d\u5236',
  import: '\u5bfc\u5165',
  putInto: '\u653e\u5165',
  continue: '\u7ee7\u7eed\u751f\u6210',
  replace: '\u66ff\u6362',
  undoReplace: '\u64a4\u56de\u66ff\u6362',
  apply: '\u5e94\u7528\u5efa\u8bae',
  redo: '\u91cd\u65b0',
  writeInto: '\u5199\u5165',
  clear: '\u6e05\u7a7a',
  clearContent: '\u6e05\u7a7a\u5185\u5bb9',
  copyContent: '\u590d\u5236\u5185\u5bb9',
  linked: '\u5173\u8054',
  setting: '\u8bbe\u5b9a',
  context: '\u4e0a\u4e0b\u6587',
  thisChapter: '\u672c\u7ae0',
  theme: '\u4e3b\u9898',
  subject: '\u9898\u6750',
  goldenFinger: '\u91d1\u624b\u6307',
  delete: '\u5220\u9664',
  word: '\u5b57',
};

const primaryPages: ReplicaPageId[] = ['outline', 'plot', 'detail', 'writing', 'brainstorm'];
const secondaryPages: ReplicaPageId[] = ['audit', 'comment', 'status', 'summary'];

function emptyText(label: string, noun = t.content) {
  return `${t.empty}${label}${noun}...`;
}

const pages: Record<ReplicaPageId, ReplicaPage> = {
  outline: {
    id: 'outline',
    label: t.outline,
    model: t.gptPool,
    prompt: `${t.generate}${t.outline}`,
    outputTitle: `${t.outline}${t.output}`,
    outputEmpty: emptyText(t.outline),
    contextTabs: [t.linked, t.brainstorm, t.setting],
    inputPlaceholder: `${t.enter}${t.outline}${t.requirement}`,
    actions: [`${t.save}${t.outline}`, `${t.copy}${t.outline}`, `${t.import}${t.outline}`, `${t.clear}${t.outline}`],
    destructive: `${t.clear}${t.outline}`,
    wordCount: 0,
  },
  plot: {
    id: 'plot',
    label: t.plot,
    model: t.gptPool,
    prompt: `${t.generate}${t.plot}`,
    outputTitle: t.plot,
    outputEmpty: emptyText(`${t.plot}${t.point}`),
    contextTabs: [t.linked, t.setting, t.detail],
    inputPlaceholder: `${t.enter}${t.plot}${t.point}${t.requirement}`,
    actions: [`${t.putInto}${t.detail}`, `${t.copy}${t.plot}`, t.continue, `${t.clear}${t.plot}`],
    destructive: `${t.clear}${t.plot}`,
    wordCount: 0,
  },
  detail: {
    id: 'detail',
    label: t.detail,
    model: t.gptPool,
    prompt: `${t.generate}\u7ec6\u7eb2`,
    outputTitle: `\u7b2c2\u7ae0${t.detail}\uff08\u7b2c1\u5377\uff09`,
    outputEmpty: emptyText(t.detail),
    contextTabs: [t.linked, t.setting, t.context],
    inputPlaceholder: `${t.enter}${t.detail}${t.requirement}`,
    actions: [`${t.save}${t.detail}`, `${t.copy}${t.detail}`, `${t.putInto}${t.writing}`, `${t.clear}${t.detail}`],
    destructive: `${t.clear}${t.detail}`,
    wordCount: 0,
  },
  writing: {
    id: 'writing',
    label: t.writing,
    model: t.gptPool,
    prompt: `${t.generate}\u7ec6\u7eb2`,
    outputTitle: '',
    outputEmpty: emptyText(t.dialog),
    contextTabs: [t.linked, t.thisChapter, t.context],
    inputPlaceholder: `${t.enter}${t.requirement}`,
    actions: [`${t.replace}${t.writing}`, t.undoReplace, t.copyContent, t.clearContent],
    destructive: t.clearContent,
    wordCount: 0,
  },
  brainstorm: {
    id: 'brainstorm',
    label: t.brainstorm,
    model: t.gptPool,
    prompt: `${t.generate}${t.brainstorm}`,
    outputTitle: `${t.brainstorm}${t.output}`,
    outputEmpty: emptyText(t.brainstorm),
    contextTabs: [t.subject, t.theme, t.goldenFinger],
    inputPlaceholder: `${t.enter}${t.brainstorm}${t.requirement}`,
    actions: [`${t.replace}${t.brainstorm}`, `${t.save}\u4e3a\u65b0`, `${t.copy}${t.brainstorm}`, `${t.clear}${t.brainstorm}`],
    destructive: `${t.clear}${t.brainstorm}`,
    wordCount: 0,
  },
  audit: {
    id: 'audit',
    label: t.audit,
    model: t.gptPool,
    prompt: t.chapterAudit,
    outputTitle: `${t.audit}${t.result}`,
    outputEmpty: emptyText(`${t.audit}${t.result}`, ''),
    contextTabs: [t.linked, t.writing, t.detail],
    inputPlaceholder: `${t.enter}${t.audit}${t.requirement}`,
    actions: [t.apply, `${t.copy}${t.audit}`, `${t.redo}${t.audit}`, `${t.clear}${t.audit}`],
    destructive: `${t.clear}${t.audit}`,
    wordCount: 0,
  },
  comment: {
    id: 'comment',
    label: t.comment,
    model: t.gptPool,
    prompt: t.chapterComment,
    outputTitle: `${t.comment}${t.result}`,
    outputEmpty: emptyText(`${t.comment}${t.result}`, ''),
    contextTabs: [t.linked, t.writing, t.detail],
    inputPlaceholder: `${t.enter}${t.comment}${t.requirement}`,
    actions: [`${t.save}${t.comment}`, `${t.copy}${t.comment}`, `${t.redo}${t.comment}`, `${t.clear}${t.comment}`],
    destructive: `${t.clear}${t.comment}`,
    wordCount: 0,
  },
  status: {
    id: 'status',
    label: t.status,
    model: t.gptPool,
    prompt: t.statusUpdate,
    outputTitle: `${t.status}${t.output}`,
    outputEmpty: emptyText(t.status),
    contextTabs: [t.linked, t.thisChapter, t.setting],
    inputPlaceholder: `${t.enter}${t.statusUpdate}${t.requirement}`,
    actions: [`${t.save}${t.status}`, `${t.copy}${t.status}`, `${t.writeInto}${t.setting}`, `${t.clear}${t.status}`],
    destructive: `${t.clear}${t.status}`,
    wordCount: 0,
  },
  summary: {
    id: 'summary',
    label: t.summary,
    model: t.gptPool,
    prompt: `${t.generate}${t.summary}`,
    outputTitle: `\u7b2c2\u7ae0${t.summary}\uff08\u7b2c1\u5377\uff09`,
    outputEmpty: emptyText(t.summary),
    contextTabs: [t.linked, t.thisChapter, t.context],
    inputPlaceholder: `${t.enter}${t.summary}${t.requirement}`,
    actions: [`${t.save}${t.summary}`, `${t.copy}${t.summary}`, `${t.writeInto}\u76ee\u5f55`, `${t.clear}${t.summary}`],
    destructive: `${t.clear}${t.summary}`,
    wordCount: 0,
  },
};

function FlowTabs({ activeId, ids, onChange }: { activeId: ReplicaPageId; ids: ReplicaPageId[]; onChange: (id: ReplicaPageId) => void }) {
  return (
    <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`h-full min-w-[58px] border-r border-slate-200 px-2 text-sm font-black leading-none last:border-r-0 ${
            activeId === id ? 'bg-[#E7FAFE] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {pages[id].label}
        </button>
      ))}
    </div>
  );
}

function CombinedConfigMock({ page }: { page: ReplicaPage }) {
  return (
    <div className="grid h-[42px] shrink-0 overflow-hidden rounded-xl border border-[#08AACE] bg-white shadow-sm" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {[
        [t.model, page.model],
        [t.prompt, page.prompt],
      ].map(([label, value], index) => (
        <div key={label} className={`relative min-w-0 ${index === 0 ? 'border-r border-slate-200' : ''}`}>
          <span className="absolute left-3 top-1 text-[10px] font-black leading-none text-[#08AACE]">{label}</span>
          <button className="flex h-full w-full items-end justify-between gap-1 px-3 pb-2 pt-4 text-left" title={value}>
            <span className="min-w-0 truncate text-sm font-black leading-none text-slate-950">{value}</span>
            <span className="shrink-0 text-base leading-none text-[#08AACE]">v</span>
          </button>
          <button className="absolute right-7 top-[18px] text-[#08AACE]" title={`${label}${t.manage}`}>
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function OutputBox({ page }: { page: ReplicaPage }) {
  const isChat = page.id === 'writing';

  return (
    <section className="relative h-full min-h-0 rounded-xl border border-slate-300 bg-white">
      {page.outputTitle ? (
        <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-black leading-4 text-slate-700">
          {page.outputTitle}
        </span>
      ) : null}
      {isChat ? (
        <div className="absolute left-3 top-0 z-10 flex h-7 -translate-y-1/2 items-center gap-1 rounded-md bg-white">
          <button className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-slate-700">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button className="grid h-6 min-w-6 place-items-center rounded-md border border-[#08AACE]/30 bg-[#EAF9FD] px-1.5 text-xs font-black text-[#08AACE]">
            1
          </button>
        </div>
      ) : null}
      <div className={`editor-scrollbar h-full overflow-y-auto whitespace-pre-wrap break-words px-3 pb-8 leading-7 ${isChat ? 'pt-5 text-xl font-bold text-slate-400' : 'pt-5 text-sm font-bold text-slate-500'}`}>
        {page.outputEmpty}
      </div>
      <div className={`absolute overflow-hidden rounded-md border border-slate-200 bg-white text-[11px] font-black shadow-sm ${
        isChat ? 'right-3 top-0 z-10 flex h-6 -translate-y-1/2' : 'right-3 top-2 flex h-6'
      }`}>
        {isChat ? <button className="px-2 text-red-500 hover:bg-red-50">{t.delete}</button> : null}
        <button className={`${isChat ? 'border-l border-slate-200' : ''} px-2 text-red-500 hover:bg-red-50`}>{t.clear}</button>
      </div>
      {isChat ? (
        <div className="absolute bottom-2 left-3 flex h-7 overflow-hidden rounded-md border border-slate-200 bg-white text-xs font-black shadow-sm">
          <button className="w-8 text-slate-500">-</button>
          <div className="grid w-9 place-items-center border-x border-slate-200 text-slate-950">20</div>
          <button className="w-8 text-slate-500">+</button>
        </div>
      ) : null}
      <span className="absolute bottom-2 right-3 bg-white px-1 text-xs font-bold leading-5">
        <span className="text-[#08AACE]">{page.wordCount}</span>
        <span className="ml-1 text-slate-400">{t.word}</span>
      </span>
    </section>
  );
}

function ContextTabs({ page }: { page: ReplicaPage }) {
  return (
    <div className="flex h-9 shrink-0 overflow-hidden rounded-xl border border-[#08AACE] bg-white">
      {page.contextTabs.map((tab, index) => (
        <button
          key={tab}
          className={`min-w-0 flex-1 border-r border-[#08AACE]/35 px-2 text-sm font-black last:border-r-0 ${
            index === 0 ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function InlineInputMock({ page }: { page: ReplicaPage }) {
  return (
    <div className="relative h-10 shrink-0 rounded-xl border border-slate-300 bg-white">
      <span className="absolute left-3 top-1 text-[10px] font-black leading-none text-slate-400">{page.inputPlaceholder}</span>
      <textarea
        rows={1}
        readOnly
        className="editor-scrollbar h-full w-full resize-none bg-transparent px-3 pb-1.5 pr-[78px] pt-4 text-sm font-bold text-slate-500 outline-none"
      />
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button type="button" className="grid h-7 w-7 place-items-center rounded-lg bg-[#08AACE] text-white">
          <Send className="h-4 w-4 stroke-[2]" />
        </button>
        <button type="button" className="grid h-7 w-7 place-items-center rounded-lg border border-red-100 bg-red-50 text-red-500">
          <Square className="h-3.5 w-3.5 fill-current stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}

function ActionButtons({ page }: { page: ReplicaPage }) {
  return (
    <div className="grid h-10 shrink-0 grid-cols-2 gap-2">
      <div className="flex h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {page.actions.slice(0, 2).map((action, index) => (
          <button
            key={action}
            className={`min-w-0 flex-1 border-r border-slate-200 px-1.5 text-xs font-black last:border-r-0 ${
              index === 0 ? 'bg-slate-300 text-white' : 'bg-white text-slate-400'
            }`}
          >
            {action}
          </button>
        ))}
      </div>
      <div className="flex h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {page.actions.slice(2).map((action) => (
          <button
            key={action}
            className={`min-w-0 flex-1 border-r border-slate-200 px-1.5 text-xs font-black last:border-r-0 ${
              action === page.destructive ? 'bg-red-600 text-white' : 'bg-slate-300 text-white'
            }`}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReplicaPanel({ page }: { page: ReplicaPage }) {
  return (
    <aside className="flex h-[614px] w-[356px] shrink-0 flex-col overflow-hidden bg-gray-50 px-4 pb-4 pt-2">
      <CombinedConfigMock page={page} />
      <div className="mt-5 min-h-0 flex-1">
        <OutputBox page={page} />
      </div>
      <div className="mt-2 flex shrink-0 flex-col gap-2">
        <ContextTabs page={page} />
        <InlineInputMock page={page} />
        <ActionButtons page={page} />
      </div>
    </aside>
  );
}

export function WorkbenchAiPanelReplicaTestPage() {
  const [activeId, setActiveId] = useState<ReplicaPageId>('writing');
  const activePage = useMemo(() => pages[activeId], [activeId]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <FlowTabs activeId={activeId} ids={primaryPages} onChange={setActiveId} />
          <FlowTabs activeId={activeId} ids={secondaryPages} onChange={setActiveId} />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mx-auto flex w-[356px] justify-center overflow-hidden bg-gray-50 shadow-[0_18px_55px_rgba(15,23,42,0.16)]">
          <ReplicaPanel page={activePage} />
        </div>
      </main>
    </div>
  );
}

