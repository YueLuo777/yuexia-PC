import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart2: UiSample[] = [
  {
    id: 'UI-29',
    group: '状态',
    name: '模型延迟状态',
    usage: '模型管理按钮后显示正常延迟；失败显示红色 X。',
    preview: (
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <span className="text-sm font-bold text-slate-700">管理</span>
        <span className="text-xs font-black text-[#08AACE]">128ms</span>
        <X className="h-4 w-4 text-red-500" />
      </div>
    ),
  },
  {
    id: 'UI-30',
    group: 'AI',
    name: 'AI 对话气泡',
    usage: '右侧为用户输入，左侧为 AI 输出，不显示“用户：/AI：”。',
    preview: (
      <div className="w-[280px] space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl bg-brand px-4 py-2 text-xs leading-5 text-white">
            生成都市高武脑洞
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs leading-5 text-slate-700">
            可以，从灵气复苏切入...
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-31',
    group: 'AI',
    name: '正在生成省略号',
    usage: 'AI 生成时固定宽度显示，不让页面随着点数变化抖动。',
    preview: (
      <div className="w-[120px] rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">
        正在生成<span className="inline-block w-6">...</span>
      </div>
    ),
  },
  {
    id: 'UI-32',
    group: '滚动条',
    name: '蓝色隐藏滚动条',
    usage: '默认隐藏轨道，只在滚动或 hover 时露出 #08AACE 滑块。',
    preview: (
      <div className="editor-scrollbar h-24 w-[260px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-500">
        滚动内容一
        <br />
        滚动内容二
        <br />
        滚动内容三
        <br />
        滚动内容四
        <br />
        滚动内容五
        <br />
        滚动内容六
      </div>
    ),
  },
  {
    id: 'UI-33',
    group: '菜单',
    name: '右键菜单',
    usage: '会话数字、分类内容、角色卡片右键操作。',
    preview: (
      <div className="w-[132px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
        <button className="block w-full px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-brand-light hover:text-brand">
          置顶
        </button>
        <button className="block w-full border-t border-slate-100 px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50">
          删除
        </button>
      </div>
    ),
  },
  {
    id: 'UI-34',
    group: '表单',
    name: '问题生成表单',
    usage: '脑洞生成里的题材、故事主题、金手指、构思、补充内容。',
    preview: (
      <div className="w-[280px] space-y-2 rounded-xl border border-slate-200 bg-white p-3">
        <label className="block text-xs font-bold text-slate-600">
          1.题材
          <input
            className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand"
            placeholder="如都市高武"
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          2.故事主题
          <input
            className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand"
            placeholder="升级流、系统流"
          />
        </label>
      </div>
    ),
  },
  {
    id: 'UI-35',
    group: '数据',
    name: '统计条',
    usage: '字数、评分、调用次数、当前章节信息。',
    preview: (
      <div className="flex gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-[#08AACE]">1280字</div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">调用 12 次</div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-orange-500">评分 86</div>
      </div>
    ),
  },
  {
    id: 'UI-36',
    group: '数据',
    name: '数据库设置卡',
    usage: '本地数据库、内置 PostgreSQL、备份恢复入口。',
    preview: (
      <div className="w-[280px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Database className="h-4 w-4 text-brand" />
          内置 PostgreSQL
        </div>
        <div className="mt-2 text-xs leading-5 text-slate-500">随软件启动，适合开箱即用。</div>
      </div>
    ),
  },
  {
    id: 'UI-37',
    group: '字号',
    name: '紧凑字号步进器',
    usage: '空间很窄的标题栏或预览栏右侧，适合只放 -、数值、+。',
    preview: (
      <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button className="flex h-full w-9 items-center justify-center text-lg font-black text-slate-500 hover:bg-brand-light hover:text-brand">
          -
        </button>
        <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-100 text-xs font-black text-[#08AACE]">
          18
        </span>
        <button className="flex h-full w-9 items-center justify-center text-lg font-black text-slate-500 hover:bg-brand-light hover:text-brand">
          +
        </button>
      </div>
    ),
  },
  {
    id: 'UI-38',
    group: '字号',
    name: '分段字号选择',
    usage: '给不想反复点加减的页面，一次选择小、中、大、超大。',
    preview: (
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {['小', '中', '大', '超大'].map((item) => (
          <button
            key={item}
            className={`h-8 min-w-10 rounded-lg px-2 text-xs font-black ${item === '大' ? 'bg-white text-brand shadow-sm' : 'text-slate-500'}`}
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-39',
    group: '字号',
    name: '滑块字号调节',
    usage: '适合设置页或调整模式，用户可以连续拖动字号大小。',
    preview: (
      <div className="w-[240px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span className="text-slate-500">字号</span>
          <span className="text-brand">19px</span>
        </div>
        <div className="relative h-2 rounded-full bg-slate-100">
          <div className="h-2 w-[62%] rounded-full bg-[#08AACE]" />
          <div className="absolute left-[62%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#08AACE] shadow" />
        </div>
      </div>
    ),
  },
  {
    id: 'UI-40',
    group: '字号',
    name: '工具栏字号按钮',
    usage: '编辑器工具栏里使用，按钮更像工具按钮，不占主操作位置。',
    preview: (
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button className="flex h-9 w-10 items-center justify-center rounded-lg text-sm font-black text-slate-500 hover:bg-slate-50">
          A-
        </button>
        <div className="h-5 w-px bg-slate-100" />
        <button className="flex h-9 w-10 items-center justify-center rounded-lg text-base font-black text-slate-700 hover:bg-brand-light hover:text-brand">
          A+
        </button>
      </div>
    ),
  },
  {
    id: 'UI-41',
    group: '字号',
    name: '竖向字号控制',
    usage: '适合放在文本框右侧边缘，横向空间少但高度足够的地方。',
    preview: (
      <div className="inline-flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <button className="flex h-8 w-9 items-center justify-center rounded-xl bg-[#08AACE] text-lg font-black text-white">
          +
        </button>
        <span className="py-1 text-xs font-black text-slate-600">18</span>
        <button className="flex h-8 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-600">
          -
        </button>
      </div>
    ),
  },
  {
    id: 'UI-42',
    group: '字号',
    name: '迷你悬浮字号',
    usage: '悬浮在预览框右上角，平时轻量，鼠标靠近再操作。',
    preview: (
      <div className="relative h-24 w-[260px] rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-500">
        预览文本内容
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[11px] font-black text-white shadow">
          <button>-</button>
          <span className="min-w-5 text-center">16</span>
          <button>+</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-43',
    group: '字号',
    name: '标题行字号控制',
    usage: '适合脑洞预览、设定预览这类区域标题右侧，和字数统计放一行。',
    preview: (
      <div className="w-[280px] rounded-xl border border-slate-200 bg-white">
        <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-900">脑洞预览</span>
            <span className="text-xs font-black text-[#08AACE]">820字</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-black text-[#08AACE]">
            <button>-</button>
            <span className="text-xs text-slate-400">字号</span>
            <button>+</button>
          </div>
        </div>
        <div className="p-3 text-xs leading-6 text-slate-500">这里是正文预览区域。</div>
      </div>
    ),
  },
  {
    id: 'UI-44',
    group: '字号',
    name: '百分比缩放控制',
    usage: '适合整块页面缩放，比如设定库页面放大 10% 这类需求。',
    preview: (
      <div className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-black text-slate-500 hover:bg-slate-50">
          -
        </button>
        <span className="mx-2 min-w-14 text-center text-sm font-black text-[#08AACE]">110%</span>
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-black text-slate-500 hover:bg-slate-50">
          +
        </button>
      </div>
    ),
  },
  {
    id: 'UI-45',
    group: '字号',
    name: '字号弹出面板',
    usage: '点击一个小按钮后弹出详细设置，适合不想常驻占位置的页面。',
    preview: (
      <div className="w-[240px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900">文字显示</span>
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-black text-brand">18px</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {['14', '16', '18', '20'].map((item) => (
            <button
              key={item}
              className={`h-8 rounded-lg text-xs font-black ${item === '18' ? 'bg-[#08AACE] text-white' : 'bg-slate-50 text-slate-500'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'UI-46',
    group: '字号',
    name: '输入数值字号',
    usage: '调整模式里精确输入字号，适合你要固定到某个 px 数值。',
    preview: (
      <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <span className="text-xs font-black text-slate-500">字号</span>
        <input
          className="h-7 w-12 rounded-lg border border-slate-200 text-center text-xs font-black text-[#08AACE] outline-none"
          defaultValue="18"
        />
        <span className="text-xs font-bold text-slate-400">px</span>
      </div>
    ),
  },
  {
    id: 'UI-47',
    group: '字号',
    name: '阅读密度切换',
    usage: '不是只改字号，也能一起控制行距，适合正文、脑洞、设定预览。',
    preview: (
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {['紧凑', '标准', '宽松'].map((item) => (
          <button
            key={item}
            className={`h-8 rounded-lg px-3 text-xs font-black ${item === '标准' ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-48',
    group: '字号',
    name: '正文预览字号条',
    usage: '适合放在文本框上方，左侧显示标题，右侧集中控制显示。',
    preview: (
      <div className="w-[280px] rounded-xl border border-slate-200 bg-white">
        <div className="flex h-10 items-center justify-between border-b border-slate-100 px-3">
          <span className="text-sm font-black text-slate-900">设定预览</span>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 rounded-lg bg-slate-100 text-base font-black text-slate-600">-</button>
            <button className="h-7 w-7 rounded-lg bg-[#08AACE] text-base font-black text-white">+</button>
          </div>
        </div>
        <div className="p-3 text-xs leading-6 text-slate-500">字号调节和内容区域自然绑定。</div>
      </div>
    ),
  },
  {
    id: 'UI-49',
    group: '按钮',
    name: '蓝色描边按钮',
    usage: '比白底按钮更醒目，但比实心蓝按钮更轻，适合读取、预览、打开设置。',
    preview: (
      <button className="h-10 rounded-xl border border-[#08AACE] bg-white px-5 text-sm font-black text-[#08AACE] hover:bg-brand-light">
        读取脑洞
      </button>
    ),
  },
  {
    id: 'UI-50',
    group: '按钮',
    name: '轻量文字按钮',
    usage: '页面内不重要但常用的操作，比如展开、更多、查看日志。',
    preview: (
      <button className="h-9 rounded-lg px-3 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-700">
        查看日志
      </button>
    ),
  },
];
