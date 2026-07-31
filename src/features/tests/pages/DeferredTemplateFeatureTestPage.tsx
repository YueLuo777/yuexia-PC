type DeferredTemplateFeatureKind = 'custom-template' | 'generation-order';

const CONTENT = {
  'custom-template': {
    eyebrow: 'Deferred · Custom Template',
    title: '自定义设定模板（未做）',
    summary: '允许用户自由新增、删除和保存设定层级的高级能力，暂不进入新手版。',
    reason: '新用户需要先理解模板层级和字段职责，过早开放会增加学习成本，也容易保存出无法稳定生成的结构。',
    future: [
      '自由编辑一级到五级设定结构',
      '保存、复制、导入和导出个人模板',
      '检查空层级、重复名称和无效结构',
      '升级模板时保留用户已经填写的内容',
    ],
  },
  'generation-order': {
    eyebrow: 'Deferred · Generation Order',
    title: '用户自定义生成顺序（未做）',
    summary: '允许高级用户调整生成步骤、依赖关系和先后顺序，暂不进入新手版。',
    reason: '随意调整顺序可能让人物、世界和剧情失去依赖依据。新手版先由系统提供稳定的推荐顺序。',
    future: [
      '拖动调整生成步骤顺序',
      '指定某项设定必须先读取哪些内容',
      '发现循环依赖和错误顺序时立即阻止保存',
      '将生成计划跟随个人模板一起保存',
    ],
  },
} as const;

const LEVELS = [
  ['一级', 'border-[#D7A51C] bg-[#FFF7DA] text-[#7A5410]'],
  ['二级', 'border-[#B38AF2] bg-[#F5EDFF] text-[#6338A6]'],
  ['三级', 'border-[#7CB8F2] bg-[#EAF5FF] text-[#235C9A]'],
  ['四级', 'border-[#7EC99B] bg-[#ECFAF1] text-[#247446]'],
  ['五级', 'border-slate-300 bg-white text-slate-600'],
] as const;

export function DeferredTemplateFeatureTestPage({ kind }: { kind: DeferredTemplateFeatureKind }) {
  const content = CONTENT[kind];
  return (
    <main className="min-h-full bg-[#F5F8FA] p-6" data-deferred-template-feature={kind}>
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            未做 · 暂缓开发
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-cyan-600">{content.eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">{content.title}</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{content.summary}</p>
        </header>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-900">为什么先不做</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{content.reason}</p>
            <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold leading-6 text-cyan-800">
              当前新手版：按照用户选中的模板和已经填写的设定，由系统自动安排推荐顺序。
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-900">以后再补的能力</h2>
            <ol className="mt-3 space-y-2">
              {content.future.map((item, index) => (
                <li key={item} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs text-cyan-700 shadow-sm">{index + 1}</span>
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="未来五级设定颜色">
          <h2 className="text-base font-black text-slate-900">未来仍沿用五级颜色</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {LEVELS.map(([label, classes]) => (
              <div key={label} className={`rounded-lg border px-3 py-4 text-center text-sm font-black ${classes}`}>{label}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default DeferredTemplateFeatureTestPage;
