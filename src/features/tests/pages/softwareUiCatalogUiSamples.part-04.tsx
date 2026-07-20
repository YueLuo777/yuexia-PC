import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart4: UiSample[] = [
  {
    id: 'UI-71',
    group: '表格',
    name: '冻结表头表格',
    usage: '一键替换规则、数据列表、导出记录，需要表头固定不动。',
    preview: (
      <div className="h-28 w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
          <span>原文</span>
          <span>替换为</span>
          <span>状态</span>
        </div>
        {['—— / …… / 自动', '错字 / 正字 / 手动'].map((row) => (
          <div key={row} className="grid grid-cols-3 px-3 py-2 text-xs font-bold text-slate-600">
            {row.split(' / ').map((cell) => (
              <span key={cell}>{cell}</span>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-72',
    group: '表格',
    name: '列表选中行',
    usage: '章节、梗概、细纲点击选中时，用边框和浅橙背景增强反馈。',
    preview: (
      <div className="w-[300px] space-y-1.5 rounded-xl border border-slate-200 bg-white p-2">
        <div className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500">第21章 雨夜来客</div>
        <div className="rounded-lg border border-[#08AACE] bg-[#FFF7ED] px-3 py-2 text-xs font-black text-slate-900">
          第22章 慌什么，完全不关你的事
        </div>
      </div>
    ),
  },
  {
    id: 'UI-73',
    group: '设置',
    name: '设置项卡片',
    usage: '系统设置、数据库设置、RAG 设置里一项一项配置。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-slate-900">自动保存</div>
            <div className="mt-1 text-xs text-slate-400">修改内容后立即写入本地</div>
          </div>
          <div className="flex h-6 w-11 items-center rounded-full bg-[#08AACE] p-0.5">
            <div className="h-5 w-5 rounded-full bg-white shadow" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-74',
    group: '设置',
    name: '配置分组标题',
    usage: '复杂设置页用来分块，不靠大面积卡片堆叠。',
    preview: (
      <div className="w-[300px]">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-[#08AACE]" />
          <div className="text-sm font-black text-slate-900">AI 模型配置</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">
          这里放模型、提示词、温度等设置。
        </div>
      </div>
    ),
  },
  {
    id: 'UI-75',
    group: '设置',
    name: '单选方案卡',
    usage: '多个方案中选一个，比如本地数据库/内置数据库/云同步。',
    preview: (
      <div className="grid w-[320px] grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-[#08AACE] bg-brand-light p-3">
          <div className="text-sm font-black text-[#08AACE]">内置数据库</div>
          <div className="mt-1 text-xs text-slate-500">开箱即用</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-black text-slate-700">本地数据库</div>
          <div className="mt-1 text-xs text-slate-400">手动连接</div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-76',
    group: '设置',
    name: '多选标签组',
    usage: '选择分类、提取范围、RAG 优先分类等多选项。',
    preview: (
      <div className="flex w-[300px] flex-wrap gap-2">
        {['人物', '世界观', '功法', '剧情'].map((item, index) => (
          <button
            key={item}
            className={`rounded-full px-3 py-1.5 text-xs font-black ${index < 2 ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-77',
    group: '提示',
    name: '成功轻提示',
    usage: '保存成功、导入完成、复制成功这类短反馈。',
    preview: (
      <div className="flex w-[280px] items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm font-black text-green-700">
        <Check className="h-4 w-4" />
        已保存
      </div>
    ),
  },
  {
    id: 'UI-78',
    group: '提示',
    name: '错误轻提示',
    usage: 'AI 失败、JSON 解析失败、数据库连接失败。',
    preview: (
      <div className="flex w-[280px] items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-600">
        <X className="h-4 w-4" />
        解析失败，可重试
      </div>
    ),
  },
  {
    id: 'UI-79',
    group: '提示',
    name: '顶部信息条',
    usage: '合并数据、后台任务、同步状态这类不应挤压布局的提示。',
    preview: (
      <div className="w-[320px] rounded-xl border border-[#08AACE]/20 bg-brand-light px-3 py-2 text-xs font-black text-[#08AACE]">
        已合并本地和数据库数据。
      </div>
    ),
  },
  {
    id: 'UI-80',
    group: '空状态',
    name: '引导式空状态',
    usage: '页面第一次打开没有内容时，给用户明确入口。',
    preview: (
      <div className="flex h-32 w-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
        <div className="text-base font-black text-slate-800">还没有内容</div>
        <div className="mt-1 text-xs text-slate-400">可以导入文本或新建一条</div>
        <div className="mt-3 flex gap-2">
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">导入</button>
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">新建</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-81',
    group: '加载',
    name: '列表骨架屏',
    usage: '数据加载时先显示结构，减少白屏感。',
    preview: (
      <div className="w-[300px] space-y-2 rounded-xl border border-slate-200 bg-white p-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-2 rounded-lg bg-slate-50 p-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-2 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-82',
    group: '加载',
    name: '按钮加载态',
    usage: '点击发送、生成、保存后，按钮显示处理中且固定宽度不抖。',
    preview: (
      <button className="h-10 w-[108px] rounded-xl bg-[#08AACE] text-sm font-black text-white">生成中...</button>
    ),
  },
  {
    id: 'UI-83',
    group: '详情',
    name: '右侧详情标题',
    usage: '设定、角色、脑洞详情右侧面板顶部。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-base font-black text-slate-900">月落现象</div>
            <div className="mt-1 text-xs font-black text-[#08AACE]">世界观 · 1280字</div>
          </div>
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">编辑</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-84',
    group: '详情',
    name: '详情页内标签',
    usage: '整理内容、原文、关联设定、向量信息这类详情页内部切换。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {['整理', '原文', '关联', '向量'].map((item) => (
            <button
              key={item}
              className={`h-8 flex-1 rounded-md text-xs font-black ${item === '整理' ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-500'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'UI-85',
    group: '详情',
    name: '关联设定列表',
    usage: '显示人物、地点、势力、功法之间的关联。',
    preview: (
      <div className="w-[300px] space-y-1.5 rounded-xl border border-slate-200 bg-white p-3">
        {['阴阳阙', '邪龙内丹', '太阴星君'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-black"
          >
            <span className="text-slate-700">{item}</span>
            <span className="text-[#08AACE]">related</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-86',
    group: '详情',
    name: '向量信息卡',
    usage: '设定库里展示 embedding 模型、向量状态、最后生成时间。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-3">
        <div className="text-sm font-black text-slate-900">向量信息</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
          <span className="text-slate-400">模型</span>
          <span className="text-slate-700">text-embedding</span>
          <span className="text-slate-400">状态</span>
          <span className="text-[#08AACE]">已生成</span>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-87',
    group: '拖拽',
    name: '可拖拽列表项',
    usage: '角色、设定、脑洞在分类之间拖动时使用。',
    preview: (
      <div className="flex w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <GripVertical className="h-4 w-4 text-slate-300" />
        <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">林刻</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">拖拽</span>
      </div>
    ),
  },
  {
    id: 'UI-88',
    group: '拖拽',
    name: '拖拽目标高亮',
    usage: '拖到某个分类上方时，该分类给出可放置反馈。',
    preview: (
      <div className="w-[280px] rounded-xl border-2 border-dashed border-[#08AACE] bg-brand-light px-4 py-3 text-sm font-black text-[#08AACE]">
        放到：重要角色
      </div>
    ),
  },
  {
    id: 'UI-89',
    group: '右键菜单',
    name: '紧凑右键菜单',
    usage: '右键会话数字、角色、设定条目，菜单不挡太多内容。',
    preview: (
      <div className="w-[112px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
        {['置顶', '重命名'].map((item) => (
          <button
            key={item}
            className="block h-8 w-full px-3 text-left text-xs font-black text-slate-600 hover:bg-brand-light hover:text-brand"
          >
            {item}
          </button>
        ))}
        <button className="block h-8 w-full px-3 text-left text-xs font-black text-red-500 hover:bg-red-50">
          删除
        </button>
      </div>
    ),
  },
  {
    id: 'UI-90',
    group: '快捷键',
    name: '快捷键录入框',
    usage: '快捷键设置里点击后等待用户按键。',
    preview: (
      <div className="flex w-[280px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
        <span className="text-sm font-black text-slate-700">关闭作品标签页</span>
        <kbd className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">Ctrl + W</kbd>
      </div>
    ),
  },
  {
    id: 'UI-91',
    group: '快捷键',
    name: '鼠标手势轨迹',
    usage: '右键左滑/右滑时显示真实轨迹，误触时可显示无效手势。',
    preview: (
      <div className="relative h-28 w-[300px] rounded-xl border border-slate-200 bg-white">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 112">
          <path
            d="M230 54 C190 48 155 55 118 45 C88 37 65 44 42 34"
            fill="none"
            stroke="#08AACE"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute left-10 top-14 rounded-full bg-[#08AACE] px-3 py-1 text-xs font-black text-white">
          回到首页
        </span>
      </div>
    ),
  },
];
