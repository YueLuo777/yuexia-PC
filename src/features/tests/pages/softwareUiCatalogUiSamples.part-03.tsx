import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart3: UiSample[] = [
  {
    id: 'UI-51',
    group: '按钮',
    name: '底部固定操作条',
    usage: '弹窗或大页面底部固定按钮，滚动内容时操作不会跑掉。',
    preview: (
      <div className="flex w-[280px] items-center justify-end gap-2 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
        <button className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-500">取消</button>
        <button className="h-9 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white">保存</button>
      </div>
    ),
  },
  {
    id: 'UI-52',
    group: '输入',
    name: '短输入组合',
    usage: '只能输入几个字的场景，比如替换规则的小输入框、短分类名。',
    preview: (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <input
          className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold outline-none focus:border-brand"
          placeholder="原文"
        />
        <span className="text-xs font-black text-slate-300">→</span>
        <input
          className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold outline-none focus:border-brand"
          placeholder="替换"
        />
      </div>
    ),
  },
  {
    id: 'UI-53',
    group: '输入',
    name: '模型提示词配置行',
    usage: 'AI 区域顶部，模型、提示词、管理按钮、禁用按钮放同一行。',
    preview: (
      <div className="flex w-[300px] items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <select className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-600 outline-none">
          <option>模型</option>
        </select>
        <select className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-600 outline-none">
          <option>提示词</option>
        </select>
        <button className="h-9 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">管</button>
        <button className="h-9 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">禁用</button>
      </div>
    ),
  },
  {
    id: 'UI-54',
    group: '卡片',
    name: '紧凑设定卡片',
    usage: '分类下内容很多时使用，一屏显示更多设定或角色。',
    preview: (
      <div className="w-[260px] rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-black text-slate-900">阴阳阙</span>
          <span className="text-xs font-black text-[#08AACE]">320字</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">位于月落核心区域的特殊地标。</p>
      </div>
    ),
  },
  {
    id: 'UI-55',
    group: '卡片',
    name: '评分调用卡片',
    usage: '设定库方案里显示评分、调用次数、置顶状态。',
    preview: (
      <div className="w-[260px] rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-slate-900">月落现象</span>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-black text-orange-500">置顶</span>
        </div>
        <div className="mt-2 flex gap-2 text-xs font-black">
          <span className="text-[#08AACE]">评分 91</span>
          <span className="text-slate-400">调用 18 次</span>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-56',
    group: '调整模式',
    name: '蓝色对齐参考线',
    usage: '调整模式里两个按钮对齐时出现的辅助线，让你知道已经平齐。',
    preview: (
      <div className="relative h-28 w-[300px] rounded-xl border border-slate-200 bg-white">
        <div className="absolute left-5 right-5 top-12 h-px bg-[#08AACE]" />
        <div className="absolute left-24 top-2 bottom-2 w-px bg-[#08AACE]" />
        <button className="absolute left-8 top-8 h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
          按钮A
        </button>
        <button className="absolute left-40 top-8 h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600">
          按钮B
        </button>
        <span className="absolute left-[118px] top-14 rounded bg-[#08AACE] px-1.5 py-0.5 text-[10px] font-black text-white">
          对齐
        </span>
      </div>
    ),
  },
  {
    id: 'UI-57',
    group: '调整模式',
    name: '网格背景',
    usage: '调整模式编辑画布，可用于大致对齐和控制元素间距。',
    preview: (
      <div
        className="h-28 w-[300px] rounded-xl border border-slate-200 bg-white"
        style={{
          backgroundImage:
            'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="ml-8 mt-8 inline-flex rounded-lg bg-[#08AACE] px-4 py-2 text-xs font-black text-white shadow-sm">
          可拖动按钮
        </div>
      </div>
    ),
  },
  {
    id: 'UI-58',
    group: '调整模式',
    name: '元素选中框',
    usage: '调整模式选中某个按钮或输入框后，显示蓝色边框和拖拽点。',
    preview: (
      <div className="relative flex h-28 w-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <button className="h-10 rounded-lg bg-[#08AACE] px-5 text-sm font-black text-white">生成</button>
        <div className="pointer-events-none absolute left-[104px] top-[38px] h-12 w-[92px] rounded-xl border-2 border-[#08AACE]">
          {['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1'].map((pos) => (
            <span key={pos} className={`absolute h-2 w-2 rounded-full bg-[#08AACE] ${pos}`} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'UI-59',
    group: '调整模式',
    name: '属性小面板',
    usage: '调整模式右侧设置面板，用来改字号、颜色、圆角、宽高。',
    preview: (
      <div className="w-[260px] rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="mb-2 text-sm font-black text-slate-900">按钮属性</div>
        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
          <label>
            宽度
            <input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="96" />
          </label>
          <label>
            高度
            <input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="40" />
          </label>
          <label>
            字号
            <input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="14" />
          </label>
          <label>
            圆角
            <input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="8" />
          </label>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-60',
    group: 'AI',
    name: 'AI 链路测试面板',
    usage: '测试中心里逐个测试脑洞、续写、梗概、细纲等 AI 生成功能。',
    preview: (
      <div className="grid h-28 w-[300px] grid-cols-[86px_1fr] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="space-y-1 border-r border-slate-100 bg-slate-50 p-2">
          {['脑洞', '续写', '梗概'].map((item) => (
            <div
              key={item}
              className={`rounded-lg px-2 py-1.5 text-xs font-black ${item === '脑洞' ? 'bg-[#08AACE] text-white' : 'text-slate-500'}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex flex-col p-2">
          <div className="flex-1 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-500">
            选择模型和提示词后发送测试。
          </div>
          <button className="mt-2 h-8 self-end rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">
            发送测试
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-61',
    group: '工具栏',
    name: '紧凑顶部工具栏',
    usage: '页面顶部按钮很多时使用，按钮高度统一，适合作品编辑器功能区。',
    preview: (
      <div className="flex w-[320px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {['智能排版', '文字替换', '章节梗概'].map((item) => (
          <button
            key={item}
            className="h-8 rounded-lg bg-slate-50 px-3 text-xs font-black text-slate-600 hover:bg-brand-light hover:text-brand"
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-62',
    group: '工具栏',
    name: '主次分组工具栏',
    usage: '左侧放主要操作，右侧放设置、更多、管理。',
    preview: (
      <div className="flex w-[320px] items-center justify-between rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex gap-1.5">
          <button className="h-9 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white">生成</button>
          <button className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600">
            停止
          </button>
        </div>
        <button className="h-9 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">设置</button>
      </div>
    ),
  },
  {
    id: 'UI-63',
    group: '搜索',
    name: '搜索筛选组合',
    usage: '设定库、剧情素材、脑洞库顶部搜索栏。',
    preview: (
      <div className="flex w-[320px] items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <input
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs font-bold outline-none focus:border-brand"
          placeholder="搜索关键词..."
        />
        <button className="h-9 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white">搜索</button>
        <button className="h-9 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">筛选</button>
      </div>
    ),
  },
  {
    id: 'UI-64',
    group: '搜索',
    name: '搜索无结果状态',
    usage: '搜索没有命中时，不让页面空白，同时给出下一步入口。',
    preview: (
      <div className="flex h-28 w-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center">
        <div className="text-sm font-black text-slate-700">没有找到相关内容</div>
        <div className="mt-1 text-xs text-slate-400">可以扩大范围或新建一条</div>
        <button className="mt-3 h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">新建</button>
      </div>
    ),
  },
  {
    id: 'UI-65',
    group: '搜索',
    name: '筛选弹出面板',
    usage: '点击筛选后展开，分类、标签、状态可以集中设置。',
    preview: (
      <div className="w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
        <div className="mb-2 text-sm font-black text-slate-900">筛选</div>
        <div className="grid grid-cols-2 gap-2">
          {['分类', '状态', '标签', '来源'].map((item) => (
            <button
              key={item}
              className="h-9 rounded-lg bg-slate-50 text-xs font-black text-slate-500 hover:bg-brand-light hover:text-brand"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'UI-66',
    group: '导入',
    name: '上传导入卡',
    usage: '导入 txt、doc、docx、md 文件时的上传区域。',
    preview: (
      <div className="flex h-28 w-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#08AACE]/40 bg-brand-light/50 text-center">
        <div className="text-sm font-black text-[#08AACE]">上传文件</div>
        <div className="mt-1 text-xs text-slate-500">支持 txt / doc / docx / md</div>
        <button className="mt-3 h-8 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white">选择文件</button>
      </div>
    ),
  },
  {
    id: 'UI-67',
    group: '导入',
    name: '文件处理进度条',
    usage: '长文本导入、切片、AI 提取、生成向量时显示当前进度。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span className="text-slate-600">文本切片</span>
          <span className="text-[#08AACE]">42 / 390</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[46%] rounded-full bg-[#08AACE]" />
        </div>
      </div>
    ),
  },
  {
    id: 'UI-68',
    group: '导入',
    name: '步骤进度列表',
    usage: '导入小说大文件时，把读取、切章、切片、提取、入库逐步展示。',
    preview: (
      <div className="w-[300px] space-y-1.5 rounded-xl border border-slate-200 bg-white p-3">
        {[
          ['读取文件', '已完成', 'text-green-600'],
          ['章节切分', '已完成', 'text-green-600'],
          ['文本切片', '处理中', 'text-[#08AACE]'],
          ['AI 提取', '等待中', 'text-slate-400'],
        ].map(([name, state, color]) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-black"
          >
            <span className="text-slate-600">{name}</span>
            <span className={color}>{state}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-69',
    group: '审核',
    name: 'AI 结果审核行',
    usage: 'AI 提取设定后，用户逐条确认入库、删除或暂存。',
    preview: (
      <div className="w-[320px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-start gap-2">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#08AACE]" defaultChecked />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-black text-slate-900">龙夏国</span>
              <span className="text-xs font-black text-[#08AACE]">92%</span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">炎龙帝君建立的国家，受太极龙脉庇护。</p>
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-1.5">
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">暂存</button>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">入库</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-70',
    group: '审核',
    name: '批量操作条',
    usage: '选中多条设定、脑洞、剧情点后显示批量操作。',
    preview: (
      <div className="flex w-[320px] items-center justify-between rounded-xl border border-[#08AACE]/30 bg-brand-light px-3 py-2">
        <span className="text-xs font-black text-[#08AACE]">已选 6 条</span>
        <div className="flex gap-1.5">
          <button className="h-8 rounded-lg bg-white px-3 text-xs font-black text-slate-600">改分类</button>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">确认入库</button>
        </div>
      </div>
    ),
  },
];
