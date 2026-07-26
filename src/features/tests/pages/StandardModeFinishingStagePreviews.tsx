function PreviewHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-slate-200 px-6 py-4">
      <h1 className="text-xl font-black text-slate-900">{title}</h1>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
    </header>
  );
}

export function AuditStagePreview() {
  return (
    <div data-testid="audit-workspace-preview">
      <PreviewHeader title="审核" description="同时对照章纲、正文和审核结果，问题确认后再修改正文。" />
      <div className="grid min-h-[430px] grid-cols-3 divide-x divide-slate-200">
        <section className="p-5">
          <h2 className="text-sm font-black text-slate-800">本章章纲</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            林刻发现入门功法第三道运行路线存在缺陷，修改后避开经脉反噬。
          </p>
        </section>
        <section className="p-5">
          <h2 className="text-sm font-black text-slate-800">正文原文</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            灵气沿着经脉缓慢前行。抵达第三处关窍时，林刻眼前再次浮现那行提示。
          </p>
        </section>
        <section className="bg-slate-50 p-5">
          <div className="flex gap-2">
            <button
              type="button"
              className="h-8 rounded-md border border-[#08AACE] bg-white px-3 text-xs font-black text-[#078FAB]"
            >
              剧情审核
            </button>
            <button
              type="button"
              className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-500"
            >
              文本审核
            </button>
          </div>
          <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 px-3 py-3 text-sm font-bold leading-6 text-amber-800">
            守碑执事突然阻止主角的动机还不够充分，建议补充一处前文铺垫。
          </div>
          <div className="mt-4 border-l-4 border-emerald-400 bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-700">
            其余剧情逻辑和人物状态一致。
          </div>
        </section>
      </div>
    </div>
  );
}

export function StatusStagePreview() {
  const rows = [
    ['林刻', '当前目标', '查明父亲与天门碑的关系'],
    ['残缺功法', '修炼状态', '第三道运行路线已修复'],
    ['守碑执事', '人物关系', '开始警惕林刻'],
  ];
  return (
    <div data-testid="status-workspace-preview">
      <PreviewHeader title="状态更新" description="AI检测最近正文中的变化，逐项确认后再写入正式设定。" />
      <div className="p-6">
        <div className="grid grid-cols-[40px_140px_140px_1fr] border-b border-slate-200 pb-3 text-xs font-black text-slate-400">
          <span>选择</span>
          <span>对象</span>
          <span>变化字段</span>
          <span>待更新内容</span>
        </div>
        {rows.map(([name, field, content]) => (
          <label
            key={name}
            className="grid min-h-16 grid-cols-[40px_140px_140px_1fr] items-center border-b border-slate-100 text-sm"
          >
            <input type="checkbox" defaultChecked aria-label={`选择${name}更新`} />
            <strong>{name}</strong>
            <span className="text-slate-500">{field}</span>
            <span className="text-slate-700">{content}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SummaryStagePreview() {
  const chapters = [
    ['第1章', '山门测试', '已有', '326字'],
    ['第2章', '残缺功法', '缺失', '0字'],
    ['第3章', '第一次修炼', '无正文', '-'],
  ];
  return (
    <div data-testid="summary-workspace-preview">
      <PreviewHeader title="章节梗概" description="查看每章梗概状态，并批量生成已有正文但缺少的梗概。" />
      <div className="p-6">
        <div className="grid grid-cols-[110px_1fr_120px_100px] border-b border-slate-200 pb-3 text-xs font-black text-slate-400">
          <span>章节</span>
          <span>章节名</span>
          <span>梗概状态</span>
          <span>字数</span>
        </div>
        {chapters.map(([chapter, title, status, words]) => (
          <div
            key={chapter}
            className="grid min-h-16 grid-cols-[110px_1fr_120px_100px] items-center border-b border-slate-100 text-sm"
          >
            <strong>{chapter}</strong>
            <span>{title}</span>
            <span className={status === '已有' ? 'text-emerald-600' : 'text-amber-600'}>{status}</span>
            <span className="text-slate-400">{words}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PolishStagePreview() {
  return (
    <div data-testid="polish-workspace-preview">
      <PreviewHeader title="风格润色" description="先选择内置行文风格，再对比原文和润色稿，不直接覆盖原文。" />
      <div className="grid min-h-[430px] grid-cols-[170px_1fr_1fr] divide-x divide-slate-200">
        <aside className="bg-slate-50 p-3">
          <div className="px-2 pb-2 text-xs font-black text-slate-400">内置风格</div>
          {['简洁爽快', '古典仙侠', '紧张悬疑'].map((style, index) => (
            <button
              key={style}
              type="button"
              className={`mb-2 h-10 w-full rounded-md border text-sm font-black ${index === 0 ? 'border-[#08AACE] bg-white text-[#078FAB]' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              {style}
            </button>
          ))}
        </aside>
        <section className="p-5">
          <h2 className="text-sm font-black">原文</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            林刻停下脚步，仔细观察石碑上的每一道裂纹。他很快发现，其中三道裂纹并非自然形成。
          </p>
        </section>
        <section className="bg-[#FBFCFD] p-5">
          <h2 className="text-sm font-black">润色稿</h2>
          <p className="mt-4 text-sm leading-8 text-slate-700">
            林刻骤然停步。石碑裂纹纵横，唯有三道逆着石纹生长，明显出自人为。
          </p>
        </section>
      </div>
    </div>
  );
}

export function ReviewStagePreview() {
  const reviews = [
    ['普通男频读者', '开篇能力展示清楚，但第一次爽点可以提前。'],
    ['通勤读者', '功法规则容易理解，守碑执事的动机解释稍长。'],
    ['网文编辑', '核心卖点明确，建议在章末强化父亲线索。'],
  ];
  return (
    <div data-testid="review-workspace-preview">
      <PreviewHeader title="综合点评" description="模拟不同读者和行业角色阅读正文，合并重复意见并排列优先级。" />
      <div className="p-6">
        <div className="flex gap-2">
          {reviews.map(([role], index) => (
            <button
              key={role}
              type="button"
              className={`h-9 rounded-md border px-4 text-sm font-black ${index === 0 ? 'border-[#08AACE] bg-white text-[#078FAB]' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {reviews.map(([role, content], index) => (
            <section
              key={role}
              className="grid grid-cols-[140px_1fr_70px] items-center border-b border-slate-100 py-4 text-sm"
            >
              <strong>{role}</strong>
              <span className="text-slate-600">{content}</span>
              <span className={index === 0 ? 'text-red-500' : 'text-amber-500'}>{index === 0 ? '优先' : '建议'}</span>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
