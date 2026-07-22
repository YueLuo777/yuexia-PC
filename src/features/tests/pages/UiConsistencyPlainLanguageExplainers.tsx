type PlainLanguageGroupNumber = 3 | 4 | 5 | 6;

type DifferenceItem = {
  title: string;
  difference: string;
  good: string;
  bad: string;
};

type PlainLanguageConfig = {
  title: string;
  summary: string;
  definition?: string;
  differences: DifferenceItem[];
  unify: string[];
  keep: string[];
  recommendation: string;
};

const CONFIGS: Record<PlainLanguageGroupNumber, PlainLanguageConfig> = {
  3: {
    title: '第3类大白话：里面差不多，外面的窗口不一样',
    summary: '综合点评、文笔润色和更新状态都是“左边选章节、中间看内容、右边设置AI”。现在主要差别不是功能，而是弹窗能不能移动和调整大小。',
    differences: [
      {
        title: '点评／润色窗口',
        difference: '默认约1180×720，可以拖到别处，也可以从边缘拉大或缩小。',
        good: '不会一直挡住固定位置，屏幕大小不同也能自己调整。',
        bad: '实现稍复杂，需要处理最小尺寸、记忆位置和防止拖出屏幕。',
      },
      {
        title: '更新状态窗口',
        difference: '默认更大，位置固定，不能拖动，也不能缩放。',
        good: '打开后大小稳定，开发和使用都比较直接。',
        bad: '容易挡住后面的正文，小屏幕上也不能自行调整。',
      },
    ],
    unify: ['默认窗口大小', '标题栏高度和关闭按钮', '拖动窗口', '四边和四角缩放', '最小尺寸', '记忆上次尺寸与位置'],
    keep: ['点评仍显示点评结果', '润色仍显示润色稿', '更新状态仍显示状态目标和写入操作'],
    recommendation: '建议用点评／润色的可拖动、可缩放外壳作为基础，三种功能只替换中间业务内容。',
  },
  4: {
    title: '第4类大白话：同样是弹窗，有些像一家人，有些像临时拼出来的',
    summary: '现在有一部分弹窗共用标准外壳，另一部分功能自己画标题、关闭按钮、背景和圆角，所以打开不同功能时大小、位置和操作习惯会变化。',
    definition: '“遮罩”就是弹窗后面那层半透明灰黑背景：它把主页面压暗，并挡住鼠标，防止弹窗没关时误点后面的内容。',
    differences: [
      {
        title: '统一弹窗版本',
        difference: '新建作品、导入作品等共用同一套弹窗外壳。',
        good: '关闭按钮、Esc关闭、居中、层级和拖动行为一致，修一次能同时修多个弹窗。',
        bad: '接入时需要按照公共外壳的结构整理旧页面，不能随意摆放。',
      },
      {
        title: '手写弹窗版本',
        difference: '小说封面、角色历史、回收站等功能各自实现完整弹窗。',
        good: '单个功能最初开发快，想怎么排就怎么排。',
        bad: '遮罩深浅、圆角、标题字号、关闭方式和窗口层级容易各不相同，也更容易出现弹窗被标题栏挡住。',
      },
    ],
    unify: ['遮罩深浅和点击规则', '弹窗居中与层级', '圆角和阴影', '标题栏高度', '关闭按钮位置', 'Esc关闭', '拖动与缩放规则', '内部滚动区域'],
    keep: ['不同弹窗可以有不同宽高', '封面弹窗继续显示封面', '角色历史继续显示历史记录', '危险删除继续使用红色警告和确认文案'],
    recommendation: '普通弹窗用AppModalShell，工作台大型弹窗用WorkbenchModal，删除等危险操作用ConfirmDialog。',
  },
  5: {
    title: '第5类大白话：都是软件设置，但三个页面的“房子”尺寸不同',
    summary: '系统设置、快捷键设置和导航设置内容不同是正常的；问题在于它们的标题区、内容宽度、返回方式和滚动区域也各做了一套。',
    differences: [
      {
        title: '系统设置',
        difference: '整体较紧凑，标题以文字为主，内容宽度偏窄。',
        good: '简单直接，常用设置容易扫读。',
        bad: '复杂设置放进去后空间不足，与另外两个设置页切换时宽度会跳。',
      },
      {
        title: '快捷键／导航设置',
        difference: '宽度、标题图标、说明文字和顶部操作各不一样，导航设置弹窗尤其偏窄。',
        good: '可以突出各页面的特殊操作，例如恢复默认、拖拽排序。',
        bad: '用户感觉像进入了不同模块，切换时窗口和内容位置会明显变化。',
      },
    ],
    unify: ['设置弹窗默认尺寸', '标题和说明的位置', '返回与关闭按钮', '左侧分类宽度', '正文最大宽度', '上下留白和卡片间距', '滚动条只放在内容区'],
    keep: ['快捷键页保留恢复默认', '导航页保留拖拽和隐藏操作', '系统设置保留窗口、备份和启动选项'],
    recommendation: '建立一个共享“设置页面外壳”，三个页面只向外壳提供标题、分类和自己的设置内容。',
  },
  6: {
    title: '第6类大白话：这三项不是三个版本，不能三选一',
    summary: '新建表单、删除确认和空状态是三种完全不同的用途。它们都需要统一，但必须分别统一，不能选了“新建表单”就不要删除确认和空状态。',
    differences: [
      {
        title: '小型表单',
        difference: '新增分类、新建角色、重命名作品的标题、输入框和按钮位置不同。',
        good: '各功能可以针对自己的字段自由排版。',
        bad: '同样是输入一个名字，用户却要适应不同尺寸和按钮顺序。',
      },
      {
        title: '删除确认框',
        difference: '有的只是普通白框，有的带警告图标，有的危险按钮位置不同。',
        good: '重要删除可以单独加强警告。',
        bad: '危险程度表达不统一，用户容易误点或不知道能否恢复。',
      },
      {
        title: '空状态',
        difference: '没有内容时，有纯文字、虚线框、灰底、白底和不同圆角。',
        good: '可以根据页面空间做轻重变化。',
        bad: '同一种“暂无内容”看起来像不同状态，有时也不知道下一步该做什么。',
      },
    ],
    unify: ['小型表单统一标题、输入框、取消和确认按钮', '删除确认统一警告等级、说明、取消和危险按钮', '空状态统一图标、标题、说明和可选操作按钮'],
    keep: ['不同表单可以有不同字段数量', '不可恢复的删除可以使用更强警告', '窄侧栏和大页面可使用不同尺寸的同一空状态组件'],
    recommendation: '分别建立FormDialog、ConfirmDialog和EmptyState三套公共组件；三项全部完成，不做三选一。',
  },
};

export function UiConsistencyPlainLanguageExplainer({ groupNumber }: { groupNumber: PlainLanguageGroupNumber }) {
  const config = CONFIGS[groupNumber];
  return (
    <div data-testid={`plain-language-explainer-${groupNumber}`} className="rounded-2xl border border-[#9BEFFC] bg-[#F8FDFF] p-4">
      <h3 className="text-base font-black text-slate-950">{config.title}</h3>
      <p className="mt-2 text-sm font-bold leading-7 text-slate-600">{config.summary}</p>
      {config.definition ? (
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black leading-7 text-blue-800">
          {config.definition}
        </div>
      ) : null}

      <div className={`mt-4 grid gap-3 ${config.differences.length >= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
        {config.differences.map((item) => (
          <section key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-black text-slate-950">{item.title}</h4>
            <p className="mt-2 text-xs font-bold leading-6 text-slate-600"><strong>现在的区别：</strong>{item.difference}</p>
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800"><strong>优点：</strong>{item.good}</p>
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900"><strong>缺点：</strong>{item.bad}</p>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="text-sm font-black text-emerald-900">最后具体统一这些地方</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {config.unify.map((item) => <li key={item} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-emerald-800">✓ {item}</li>)}
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-black text-slate-800">这些业务内容不会强行统一</h4>
          <ul className="mt-2 space-y-2">
            {config.keep.map((item) => <li key={item} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600">• {item}</li>)}
          </ul>
        </section>
      </div>
      <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black leading-7 text-white">建议：{config.recommendation}</div>
    </div>
  );
}
