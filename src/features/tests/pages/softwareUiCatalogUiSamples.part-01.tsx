import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart1: UiSample[] = [
  {
    id: 'UI-01',
    group: '按钮',
    name: '标准蓝色主按钮',
    usage: '发送、生成、确认、保存这类主操作。',
    preview: (
      <button className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark">
        发送
      </button>
    ),
  },
  {
    id: 'UI-02',
    group: '按钮',
    name: '白底普通按钮',
    usage: '取消、返回、次要操作、不会改变核心数据的按钮。',
    preview: (
      <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
        取消
      </button>
    ),
  },
  {
    id: 'UI-03',
    group: '按钮',
    name: '红色危险按钮',
    usage: '删除、清空、取消导入等需要谨慎点击的操作。',
    preview: (
      <button className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600">删除</button>
    ),
  },
  {
    id: 'UI-04',
    group: '按钮',
    name: '橙色状态按钮',
    usage: '置顶、覆盖、重新整理、重新生成等警告型操作。',
    preview: (
      <button className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
        置顶
      </button>
    ),
  },
  {
    id: 'UI-05',
    group: '按钮',
    name: '导航设置同款按钮',
    usage: '左下角设置区、弹窗里的稳定设置入口。',
    preview: (
      <button className="flex h-11 w-[148px] items-center justify-center rounded-lg bg-brand px-3 text-[13px] font-medium text-white hover:bg-brand-dark">
        导航设置
      </button>
    ),
  },
  {
    id: 'UI-06',
    group: '按钮',
    name: '图标方按钮',
    usage: '返回、设置、关闭、工具栏里的紧凑操作。',
    preview: (
      <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-brand/40 hover:bg-brand-light hover:text-brand">
        <Settings className="h-4 w-4" />
      </button>
    ),
  },
  {
    id: 'UI-07',
    group: '按钮',
    name: '蓝色字号步进器',
    usage: '需要强存在感的字号放大缩小，比如脑洞输出框右上角。',
    preview: (
      <div className="inline-flex items-center gap-4">
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#08AACE] text-white shadow-sm">
          <Minus className="h-5 w-5 stroke-[4]" />
        </button>
        <span className="min-w-10 text-center text-xl font-black text-slate-700">20</span>
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#08AACE] text-white shadow-sm">
          <Plus className="h-6 w-6 stroke-[4]" />
        </button>
      </div>
    ),
  },
  {
    id: 'UI-08',
    group: '按钮',
    name: '白底字号步进器',
    usage: '内容预览区的字号调节，存在感低，不抢正文。',
    preview: (
      <div className="inline-flex h-[46px] items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <button className="text-2xl font-black leading-none text-slate-600">-</button>
        <span className="min-w-7 text-center text-sm font-black text-slate-600">17</span>
        <button className="text-2xl font-black leading-none text-slate-600">+</button>
      </div>
    ),
  },
  {
    id: 'UI-09',
    group: '标签',
    name: '胶囊标签切换',
    usage: '大纲设定里的设定/角色/脑洞，月落设定库里的页面切换。',
    preview: (
      <div className="inline-flex rounded-[18px] bg-slate-100 p-1.5">
        {['设定', '角色', '脑洞'].map((item) => (
          <button
            key={item}
            className={`h-10 min-w-[72px] rounded-[15px] px-5 text-base font-bold ${item === '脑洞' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500'}`}
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-10',
    group: '标签',
    name: '小号页面标签',
    usage: '提炼剧情素材这种嵌入式页面切换。',
    preview: (
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button className="h-8 min-w-[78px] rounded-lg bg-brand px-3 text-xs font-bold text-white">提炼剧情</button>
        <button className="h-8 min-w-[78px] rounded-lg px-3 text-xs font-bold text-slate-500">剧情素材</button>
      </div>
    ),
  },
  {
    id: 'UI-11',
    group: '标签',
    name: '状态胶囊开关',
    usage: '存活/死亡、自动/手动、启用/禁用这类二选一状态。',
    preview: (
      <div className="inline-flex h-11 w-[168px] rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button className="flex-1 rounded-lg bg-[#08AACE] text-sm font-bold text-white shadow-sm">存活</button>
        <button className="flex-1 rounded-lg text-sm font-bold text-slate-500">死亡</button>
      </div>
    ),
  },
  {
    id: 'UI-12',
    group: '导航',
    name: '左侧分类胶囊',
    usage: '作品设定库、脑洞库、设定分类树的一级分类。',
    preview: (
      <div className="flex w-[260px] items-center gap-2 rounded-xl border border-[#08AACE] bg-[#08AACE] px-3 py-2.5 font-bold text-white">
        <span className="min-w-0 flex-1 truncate">脑洞库</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">4</span>
        <span className="text-white">⌄</span>
      </div>
    ),
  },
  {
    id: 'UI-13',
    group: '导航',
    name: '左侧子项卡片',
    usage: '角色卡片、设定卡片、脑洞条目，可选中、可右键、可拖拽。',
    preview: (
      <div className="flex w-[260px] items-center gap-2 rounded-xl border border-brand bg-[#FFF7ED] px-4 py-2 text-sm text-slate-900">
        <span className="min-w-0 flex-1 truncate">林刻</span>
        <button className="rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">取消</button>
      </div>
    ),
  },
  {
    id: 'UI-14',
    group: '输入',
    name: '单行输入框',
    usage: '角色名、分类名、模型名、短字段。',
    preview: (
      <input
        className="h-11 w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-brand"
        placeholder="角色名"
      />
    ),
  },
  {
    id: 'UI-15',
    group: '输入',
    name: '下拉选择框',
    usage: '模型选择、提示词选择、分类选择。',
    preview: (
      <select className="h-11 w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-brand">
        <option>默认模型</option>
        <option>备用模型</option>
      </select>
    ),
  },
  {
    id: 'UI-16',
    group: '输入',
    name: '正文输入框',
    usage: '设定预览、角色背景、角色状态、AI 输出文本。',
    preview: (
      <textarea
        className="editor-scrollbar h-24 w-[260px] resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-700 outline-none focus:border-brand"
        placeholder="这里输入正文内容..."
      />
    ),
  },
  {
    id: 'UI-17',
    group: '输入',
    name: '只读预览框',
    usage: '脑洞预览、读取脑洞弹窗预览、AI 结果查看。',
    preview: (
      <div className="h-24 w-[260px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-7 text-slate-500">
        这里显示预览内容，可以选中文字复制。
      </div>
    ),
  },
  {
    id: 'UI-18',
    group: '布局',
    name: '可拖拽分割线',
    usage: '左右区域需要手动调宽时使用，比如脑洞预览与输出框之间。',
    preview: (
      <div className="flex h-28 w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-400">左侧区域</div>
        <div className="group flex w-3 cursor-ew-resize items-stretch justify-center bg-white hover:bg-sky-50">
          <div className="my-3 w-1 rounded-full bg-slate-200 group-hover:bg-[#08AACE]" />
        </div>
        <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-400">右侧区域</div>
      </div>
    ),
  },
  {
    id: 'UI-19',
    group: '布局',
    name: '四栏工作台',
    usage: '脑洞标签：脑洞库、脑洞预览、脑洞输出框、AI 配置输入。',
    preview: (
      <div className="grid h-24 w-full grid-cols-[0.9fr_1fr_1.2fr_1fr] gap-2">
        {['1 库', '2 预览', '3 输出', '4 配置'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500"
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-20',
    group: '布局',
    name: '三栏资料库',
    usage: '分类树、卡片列表、详情预览。',
    preview: (
      <div className="grid h-24 w-full grid-cols-[0.8fr_1.2fr_1fr] gap-2">
        {['分类', '列表', '详情'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500"
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'UI-21',
    group: '卡片',
    name: '普通内容卡片',
    usage: '作品卡片、设定卡片、剧情点卡片。',
    preview: (
      <div className="w-[260px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-sm font-bold text-slate-900">月落现象</div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">月亮被邪气激活后，每到夜晚掉落月孽碎片。</p>
      </div>
    ),
  },
  {
    id: 'UI-22',
    group: '卡片',
    name: '空状态卡片',
    usage: '无设定、无搜索结果、无导入内容。',
    preview: (
      <div className="flex h-24 w-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <div className="text-sm font-bold text-slate-500">还没有设定资料</div>
        <div className="mt-1 text-xs text-slate-400">可以新建或从文本中提取</div>
      </div>
    ),
  },
  {
    id: 'UI-23',
    group: '弹窗',
    name: '标准确认弹窗',
    usage: '删除确认、清空确认、危险操作二次确认。',
    preview: (
      <div className="w-[300px] rounded-[24px] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">确认删除</div>
            <div className="mt-1 text-xs text-slate-400">删除后不可恢复。</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">
            取消
          </button>
          <button className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white">删除</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-24',
    group: '弹窗',
    name: '大弹窗页面',
    usage: '提示词管理、模型管理、系统设置、导入设置。',
    preview: (
      <div className="flex h-28 w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
          <span className="text-sm font-bold text-slate-900">提示词管理</span>
          <X className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex flex-1 items-center justify-center text-xs text-slate-400">弹窗内容区域</div>
      </div>
    ),
  },
  {
    id: 'UI-25',
    group: '弹窗',
    name: '可缩放弹窗边',
    usage: '弹窗四边和四角拖动缩放，右下角只影响右边与下边。',
    preview: (
      <div className="relative h-28 w-[260px] rounded-2xl border-2 border-dashed border-brand bg-white p-4 text-xs font-bold text-slate-500">
        拖动边缘调整大小
        <div className="absolute bottom-1 right-1 h-4 w-4 rounded-sm border-b-4 border-r-4 border-brand" />
      </div>
    ),
  },
  {
    id: 'UI-26',
    group: '导航',
    name: '顶部工作标签',
    usage: '首页标签、作品标签、可关闭的工作区标签。',
    preview: (
      <div className="flex h-11 items-end">
        <div className="workspace-tab workspace-tab-active flex h-10 items-center rounded-t-lg border border-slate-300 border-b-white bg-white px-3 text-[15px] font-semibold text-slate-950 shadow-[0_-1px_0_rgba(255,255,255,0.7)]">
          首页
        </div>
        <div className="workspace-tab flex h-10 items-center border border-transparent px-3 text-[15px] font-semibold text-slate-700">
          小说作品
        </div>
      </div>
    ),
  },
  {
    id: 'UI-27',
    group: '导航',
    name: '左侧三角导航',
    usage: '作品编辑器、剧本编辑器左侧呼出首页导航。',
    preview: (
      <button className="flex h-14 w-8 items-center justify-center rounded-r-xl bg-brand text-white shadow-sm">
        <LayoutPanelLeft className="h-5 w-5" />
      </button>
    ),
  },
  {
    id: 'UI-28',
    group: '状态',
    name: '状态标签',
    usage: '已整理、待确认、未生成向量、模型延迟等状态。',
    preview: (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">已整理</span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">未生成向量</span>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">失败</span>
      </div>
    ),
  },
];
