import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GitBranch,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PostProcessId = 'audit' | 'comment' | 'polish' | 'status' | 'summary';

type FlowStep = {
  id: PostProcessId;
  title: string;
  meta: string;
  icon: LucideIcon;
  purpose: string;
  inputs: string[];
  outputs: string[];
  confirm: string;
  writeBack: string;
  suggestion: string;
};

const postProcessSteps: FlowStep[] = [
  {
    id: 'audit',
    title: '审核',
    meta: '查错与规则检查',
    icon: ClipboardCheck,
    purpose: '先判断正文有没有硬伤：错别字、语病、逻辑断裂、章纲偏离、设定冲突。',
    inputs: ['本章正文', '本章章纲', '关联设定', '审核要求'],
    outputs: ['问题清单', '修改建议', '可选修复稿'],
    confirm: '审核结果默认不直接改正文，只进入输出区；需要修改时再转入润色或对比确认。',
    writeBack: '写入审核记录，正文保持不变。',
    suggestion: '保留为必经检查，但不要抢占正文编辑区；入口和点评、润色共用同一套后处理面板。',
  },
  {
    id: 'comment',
    title: '点评',
    meta: '读者体验判断',
    icon: MessageSquareText,
    purpose: '判断章节是否好看：钩子、节奏、冲突、情绪张力、爽点和下一章期待感。',
    inputs: ['最终或接近最终正文', '本章章纲', '点评维度'],
    outputs: ['优点', '问题', '优先级建议', '下一章提醒'],
    confirm: '点评只做参考，不自动改正文；可把某条建议发送到润色要求。',
    writeBack: '写入点评记录，不写入设定、不写入梗概。',
    suggestion: '作为可选步骤，适合在审核之后、润色之前或发布前做一次读感判断。',
  },
  {
    id: 'polish',
    title: '润色',
    meta: '正文表达优化',
    icon: Sparkles,
    purpose: '在不改剧情事实的前提下优化表达、画面感、节奏和句子顺滑度。',
    inputs: ['本章正文', '审核问题', '润色要求', '可选风格规范'],
    outputs: ['修改后全文', '段落差异', '修改说明'],
    confirm: '必须走段落对比或全文对比，确认后才替换正文。',
    writeBack: '确认后覆盖正文；未确认稿只留在输出区。',
    suggestion: '和审核共用对比组件最合适；核心按钮只保留“生成对比”“确认全部”“确认替换”。',
  },
  {
    id: 'status',
    title: '状态',
    meta: '更新动态设定',
    icon: RefreshCcw,
    purpose: '从最终正文里提取人物、道具、势力、特殊资源等会变化的状态。',
    inputs: ['截至本章的正文', '已有状态设定', '选中的更新目标', '状态更新要求'],
    outputs: ['未确认更新', '更新前/更新后对照', '目标卡片建议'],
    confirm: '先进入未确认区；手动确认或自动确认后才写入状态设定。',
    writeBack: '只写入状态设定，不改基础设定。',
    suggestion: '放在润色之后，因为状态应读取最终正文；确认区要继续保留更新前/更新后双栏。',
  },
  {
    id: 'summary',
    title: '梗概',
    meta: '沉淀章节摘要',
    icon: FileText,
    purpose: '把最终正文压缩成后续写作可读取的章节梗概，降低长期上下文压力。',
    inputs: ['最终正文', '本章章纲', '可选状态变化'],
    outputs: ['章节梗概', '关键事件', '角色变化摘要', '伏笔记录'],
    confirm: '可一键生成，但确认后才覆盖当前章节梗概。',
    writeBack: '写入梗概库，并作为后续正文的优先关联资料。',
    suggestion: '建议从“资料库式页面”调整成和审核/状态一致的章节后处理页面，左侧选章，中间预览，右侧生成。',
  },
];

const chapterRows = [
  { volume: '第一卷', chapter: '第1章', title: '码头黑令', state: '已梗概', active: false },
  { volume: '第一卷', chapter: '第2章', title: '掌柜试探', state: '待后处理', active: true },
  { volume: '第一卷', chapter: '第3章', title: '禁地邀约', state: '未发布', active: false },
];

const operationFlow = [
  '写完正文',
  '审核查硬伤',
  '润色确认替换',
  '点评看读感',
  '更新状态',
  '生成梗概',
  '发布章节',
];

const principleCards = [
  {
    title: '输入隔离',
    icon: ShieldCheck,
    text: '每个功能都明确区分正文、章纲、设定和用户要求，避免 AI 把参考资料写进正文。',
  },
  {
    title: '结果待确认',
    icon: CheckCircle2,
    text: '凡是会改正文、状态或梗概的结果，都先进入确认层；确认后才写回正式数据。',
  },
  {
    title: '同章流转',
    icon: GitBranch,
    text: '五个后处理入口共享同一个选章状态，切换标签时不跳位置，不让用户重新找章节。',
  },
];

function MiniWorkbenchHeader() {
  const mainTabs = [
    ['脑洞', '4个脑洞'],
    ['设定', '31个设定'],
    ['章纲', '2章'],
    ['正文', '2章'],
  ];
  const reviewTabs = [
    ['审核', '1章待审'],
    ['点评', '1章待点评'],
    ['润色', ''],
    ['状态', '1章未更新'],
    ['梗概', '1章缺失'],
  ];

  return (
    <div className="flex h-14 shrink-0 items-center gap-5 border-b border-slate-100 bg-white px-5">
      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex min-w-[112px] items-center justify-center border-r border-slate-200 px-4 text-sm font-black text-slate-900">
          默认小说1
        </div>
        <div className="flex min-w-[112px] items-center justify-center bg-[#EAF9FD] px-4 text-sm font-black text-[#08AACE]">
          作品信息
        </div>
      </div>

      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {mainTabs.map(([title, meta], index) => (
          <div
            key={title}
            className={`flex min-w-[106px] flex-col items-center justify-center px-4 ${
              title === '正文' ? 'bg-[#EAF9FD] text-[#08AACE]' : 'text-slate-900'
            } ${index === 0 ? '' : 'border-l border-slate-200'}`}
          >
            <span className="text-base font-black leading-4">{title}</span>
            <span className="mt-0.5 text-[11px] font-black leading-3 text-slate-500">{meta}</span>
          </div>
        ))}
      </div>

      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {reviewTabs.map(([title, meta], index) => (
          <div
            key={title}
            className={`flex min-w-[98px] flex-col items-center justify-center px-3 ${
              title === '审核' ? 'bg-[#EAF9FD] text-[#08AACE]' : 'text-slate-900'
            } ${index === 0 ? '' : 'border-l border-slate-200'}`}
          >
            <span className="text-base font-black leading-4">{title}</span>
            {meta ? <span className="mt-0.5 text-[11px] font-black leading-3 text-orange-600">{meta}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SegmentedTabs({
  activeId,
  onChange,
}: {
  activeId: PostProcessId;
  onChange: (id: PostProcessId) => void;
}) {
  return (
    <div className="flex h-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {postProcessSteps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onChange(step.id)}
          className={`min-w-[108px] px-4 text-sm font-black transition-colors ${
            index === 0 ? '' : 'border-l border-slate-200'
          } ${
            activeId === step.id
              ? 'bg-[#EAF9FD] text-[#08AACE]'
              : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
          }`}
        >
          {step.title}
        </button>
      ))}
    </div>
  );
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="relative min-h-[168px] rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-8">
      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-600">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function PrincipleCard({ card }: { card: (typeof principleCards)[number] }) {
  const Icon = card.icon;
  return (
    <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#08AACE]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-black text-slate-900">{card.title}</h3>
      </div>
      <p className="mt-3 text-sm font-bold leading-7 text-slate-600">{card.text}</p>
    </article>
  );
}

export function PostWritingWorkflowPlanTestPage() {
  const [activeId, setActiveId] = useState<PostProcessId>('audit');
  const activeStep = useMemo(
    () => postProcessSteps.find((step) => step.id === activeId) ?? postProcessSteps[0],
    [activeId],
  );
  const ActiveIcon = activeStep.icon;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <MiniWorkbenchHeader />

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-100 bg-slate-50 px-4 py-4">
          <div className="text-sm font-black text-[#08AACE]">Post Writing Flow</div>
          <h1 className="mt-1 text-xl font-black">正文后处理流程方案</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            审核、点评、润色、状态、梗概都围绕同一章正文运转，核心是先生成结果，再确认写回。
          </p>

          <div className="mt-5 space-y-3">
            <button className="flex h-11 w-full items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-left text-sm font-black text-slate-900">
              <FileText className="h-4 w-4 text-[#08AACE]" />
              <span className="min-w-0 flex-1 truncate">第一卷</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">3章</span>
            </button>
            <div className="space-y-2 pl-2">
              {chapterRows.map((row) => (
                <button
                  key={row.chapter}
                  type="button"
                  className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
                    row.active
                      ? 'bg-[#FFF6E8] text-slate-950'
                      : 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black">{row.chapter}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">{row.state}</span>
                  </div>
                  <div className="mt-1 truncate text-xs font-bold text-slate-500">{row.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-black text-slate-900">建议顺序</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {operationFlow.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {item}
                  </span>
                  {index < operationFlow.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-slate-300" /> : null}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="editor-scrollbar min-w-0 flex-1 overflow-y-auto px-7 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-[#08AACE]">
                第2章后处理
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-950">把五个入口合成一套章节后处理面板</h2>
              <p className="mt-2 max-w-4xl text-sm font-bold leading-7 text-slate-500">
                顶部仍保留审核、点评、润色、状态、梗概的流程入口；进入后共享同一组选章、正文预览、AI配置、输出日志和确认写回逻辑。
              </p>
            </div>
            <SegmentedTabs activeId={activeId} onChange={setActiveId} />
          </div>

          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#EAF9FD] text-[#08AACE]">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-slate-950">{activeStep.title}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{activeStep.meta}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold leading-7 text-slate-600">{activeStep.purpose}</p>
                  </div>
                </div>
              </article>

              <div className="grid gap-5 lg:grid-cols-2">
                <InfoBox title="输入内容" items={activeStep.inputs} />
                <InfoBox title="AI输出" items={activeStep.outputs} />
                <InfoBox title="确认方式" items={[activeStep.confirm]} />
                <InfoBox title="写回位置" items={[activeStep.writeBack]} />
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                <h3 className="text-base font-black text-slate-950">优化建议</h3>
                <p className="mt-3 text-sm font-bold leading-7 text-slate-600">{activeStep.suggestion}</p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-black text-slate-950">按钮区建议</h3>
                <div className="mt-4 grid gap-2">
                  <button className="h-10 rounded-xl bg-[#08AACE] text-sm font-black text-white">生成{activeStep.title}</button>
                  <button className="h-10 rounded-xl border border-cyan-200 bg-white text-sm font-black text-[#08AACE]">查看输出日志</button>
                  <button className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600">清空本次输出</button>
                </div>
              </section>
            </aside>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            {principleCards.map((card) => (
              <PrincipleCard key={card.title} card={card} />
            ))}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-black text-slate-950">我建议正式页这样调整</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {[
                '审核、点评、润色继续复用同一个面板，但顶部加五段组合按钮，能在同一章内直接切换。',
                '状态更新继续独立三栏，但作为后处理面板的一个标签，不再像一个完全不同的弹窗。',
                '梗概从资料库式入口升级为章节后处理入口：左侧选章，中间正文预览，右侧生成并确认写入梗概。',
                '发布前显示后处理完成度：未审、未点评、未更新、缺梗概，让流程有没有跑完一眼可见。',
              ].map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default PostWritingWorkflowPlanTestPage;
