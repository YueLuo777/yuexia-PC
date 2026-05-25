import {
  ArrowLeft,
  BookOpen,
  Check,
  Code2,
  Database,
  GripVertical,
  LayoutPanelLeft,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CatalogTab = 'ui' | 'tech';

type FontSample = {
  id: string;
  name: string;
  usage: string;
  className: string;
  sample: string;
};

type ColorSample = {
  id: string;
  name: string;
  usage: string;
  value: string;
  textClass?: string;
};

type UiSample = {
  id: string;
  group: string;
  name: string;
  usage: string;
  preview: ReactNode;
};

type TechItem = {
  id: string;
  name: string;
  plain: string;
  tech: string;
};

const fontSamples: FontSample[] = [
  {
    id: 'F-01',
    name: '页面主标题',
    usage: '页面左上角主标题、重要弹窗标题。',
    className: 'text-3xl font-black text-slate-950',
    sample: '大纲设定',
  },
  {
    id: 'F-02',
    name: '模块标题',
    usage: '脑洞预览、设定预览、章节概要这类区域标题。',
    className: 'text-xl font-black text-slate-900',
    sample: '脑洞预览',
  },
  {
    id: 'F-03',
    name: '区块标题',
    usage: '卡片标题、设置分组标题、表单小标题。',
    className: 'text-base font-bold text-slate-900',
    sample: '模型配置',
  },
  {
    id: 'F-04',
    name: '按钮文字',
    usage: '主按钮、普通按钮、弹窗底部操作按钮。',
    className: 'text-sm font-bold text-slate-800',
    sample: '发送',
  },
  {
    id: 'F-05',
    name: '正文输入',
    usage: '编辑器、预览框、AI 输出框里的长文本。',
    className: 'text-sm font-normal leading-7 text-slate-700',
    sample: '这里是正文内容，用于阅读、编辑和生成。',
  },
  {
    id: 'F-06',
    name: '辅助说明',
    usage: '空状态、提示说明、弱提示文字。',
    className: 'text-xs font-medium text-slate-400',
    sample: '用于提示当前状态或辅助说明',
  },
  {
    id: 'F-07',
    name: '编号强调',
    usage: 'UI 记录编号、统计数字、需要快速扫到的标识。',
    className: 'text-2xl font-black text-brand',
    sample: 'UI-18',
  },
  {
    id: 'F-08',
    name: '章节统计',
    usage: '章节数量、字数、当前脑洞字数等统计。',
    className: 'text-lg font-black text-slate-950',
    sample: '正文：3376字',
  },
];

const colorSamples: ColorSample[] = [
  { id: 'C-01', name: '品牌蓝', value: '#08B3D9', usage: '主按钮、选中态、重要强调。' },
  { id: 'C-02', name: '浅品牌蓝', value: '#E6F7FB', usage: '蓝色 hover、浅选中背景、图标底色。' },
  { id: 'C-03', name: '深品牌蓝', value: '#0695B5', usage: '主按钮 hover。' },
  { id: 'C-04', name: '用户指定蓝', value: '#08AACE', usage: '滚动条滑块、分类文字、字号控制强调。' },
  { id: 'C-05', name: '选中暖底', value: '#FFF7ED', usage: '作品设定库选中内容背景。' },
  { id: 'C-06', name: '浅青分类', value: '#E6F8FB', usage: '男女主、正派配角等浅色分类底。' },
  { id: 'C-07', name: '危险红', value: '#EF4444', usage: '删除、错误、冲突。' },
  { id: 'C-08', name: '警告橙', value: '#F97316', usage: '置顶、覆盖、重新生成。' },
  { id: 'C-09', name: '成功绿', value: '#22C55E', usage: '成功状态、正常通过。' },
  { id: 'C-10', name: '面板白', value: '#FFFFFF', usage: '弹窗、卡片、输入框背景。', textClass: 'text-slate-700' },
  { id: 'C-11', name: '页面浅灰', value: '#F8FAFC', usage: '测试页、列表背景、弱分区。', textClass: 'text-slate-700' },
  { id: 'C-12', name: '边框灰', value: '#E5E7EB', usage: '输入框、卡片、分割边线。', textClass: 'text-slate-700' },
];

const uiSamples: UiSample[] = [
  {
    id: 'UI-01',
    group: '按钮',
    name: '标准蓝色主按钮',
    usage: '发送、生成、确认、保存这类主操作。',
    preview: <button className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark">发送</button>,
  },
  {
    id: 'UI-02',
    group: '按钮',
    name: '白底普通按钮',
    usage: '取消、返回、次要操作、不会改变核心数据的按钮。',
    preview: <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">取消</button>,
  },
  {
    id: 'UI-03',
    group: '按钮',
    name: '红色危险按钮',
    usage: '删除、清空、取消导入等需要谨慎点击的操作。',
    preview: <button className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600">删除</button>,
  },
  {
    id: 'UI-04',
    group: '按钮',
    name: '橙色状态按钮',
    usage: '置顶、覆盖、重新整理、重新生成等警告型操作。',
    preview: <button className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600">置顶</button>,
  },
  {
    id: 'UI-05',
    group: '按钮',
    name: '导航设置同款按钮',
    usage: '左下角设置区、弹窗里的稳定设置入口。',
    preview: <button className="flex h-11 w-[148px] items-center justify-center rounded-lg bg-brand px-3 text-[13px] font-medium text-white hover:bg-brand-dark">导航设置</button>,
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
    usage: '提炼剧情/剧情库这种嵌入式页面切换。',
    preview: (
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button className="h-8 min-w-[78px] rounded-lg bg-brand px-3 text-xs font-bold text-white">提炼剧情</button>
        <button className="h-8 min-w-[78px] rounded-lg px-3 text-xs font-bold text-slate-500">剧情库</button>
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
    preview: <input className="h-11 w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-brand" placeholder="角色名" />,
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
    preview: <textarea className="editor-scrollbar h-24 w-[260px] resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7 text-slate-700 outline-none focus:border-brand" placeholder="这里输入正文内容..." />,
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
        <div className="group flex w-3 cursor-col-resize items-stretch justify-center bg-white hover:bg-sky-50">
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
          <div key={item} className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500">{item}</div>
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
          <div key={item} className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500">{item}</div>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"><X className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-bold text-slate-900">确认删除</div>
            <div className="mt-1 text-xs text-slate-400">删除后不可恢复。</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">取消</button>
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
        <div className="workspace-tab workspace-tab-active flex h-10 items-center rounded-t-lg border border-slate-300 border-b-white bg-white px-3 text-[15px] font-semibold text-slate-950 shadow-[0_-1px_0_rgba(255,255,255,0.7)]">首页</div>
        <div className="workspace-tab flex h-10 items-center border border-transparent px-3 text-[15px] font-semibold text-slate-700">小说作品</div>
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
        <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl bg-brand px-4 py-2 text-xs leading-5 text-white">生成都市高武脑洞</div></div>
        <div className="flex justify-start"><div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs leading-5 text-slate-700">可以，从灵气复苏切入...</div></div>
      </div>
    ),
  },
  {
    id: 'UI-31',
    group: 'AI',
    name: '正在生成省略号',
    usage: 'AI 生成时固定宽度显示，不让页面随着点数变化抖动。',
    preview: <div className="w-[120px] rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">正在生成<span className="inline-block w-6">...</span></div>,
  },
  {
    id: 'UI-32',
    group: '滚动条',
    name: '蓝色隐藏滚动条',
    usage: '默认隐藏轨道，只在滚动或 hover 时露出 #08AACE 滑块。',
    preview: (
      <div className="editor-scrollbar h-24 w-[260px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-500">
        滚动内容一<br />滚动内容二<br />滚动内容三<br />滚动内容四<br />滚动内容五<br />滚动内容六
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
        <button className="block w-full px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-brand-light hover:text-brand">置顶</button>
        <button className="block w-full border-t border-slate-100 px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50">删除</button>
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
          <input className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand" placeholder="如都市高武" />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          2.故事主题
          <input className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-brand" placeholder="升级流、系统流" />
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
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Database className="h-4 w-4 text-brand" />内置 PostgreSQL</div>
        <div className="mt-2 text-xs leading-5 text-slate-500">随软件启动，适合开箱即用。</div>
      </div>
    ),
  },
];

const techItems: TechItem[] = [
  {
    id: 'T-01',
    name: '可拖拽分割线',
    plain: '就是你经常说的“红线位置”。鼠标放上去变成左右箭头，按住可以调整两边宽度。',
    tech: 'Resizable split pane / pointer events / CSS grid columns',
  },
  {
    id: 'T-02',
    name: '弹窗自由缩放',
    plain: '拖弹窗的边或角改变大小。拖右下角时，只动右边和下边，左上角不乱跑。',
    tech: 'Resizable modal / fixed origin geometry',
  },
  {
    id: 'T-03',
    name: '弹窗栈',
    plain: '多个弹窗一起打开时，Esc 只关闭最后打开的那个，不会一下全关。',
    tech: 'Modal stack / top modal escape handler',
  },
  {
    id: 'T-04',
    name: '点击外部关闭',
    plain: '有些设置页可以点空白关闭，有些编辑弹窗必须点 X 或 Esc。这个叫遮罩关闭规则。',
    tech: 'Backdrop click / modal close policy',
  },
  {
    id: 'T-05',
    name: '冻结表头',
    plain: '列表很多时，最上面的“原文 / 替换为”固定不动，下面内容滚动。',
    tech: 'Sticky header / position: sticky',
  },
  {
    id: 'T-06',
    name: '自动增高输入框',
    plain: '输入内容变多，框会跟着变高；超过限制后才出现滚动条。',
    tech: 'Auto-growing textarea',
  },
  {
    id: 'T-07',
    name: '只读可复制输入框',
    plain: '内容不能直接改，但可以选中、复制、滚动查看。',
    tech: 'Readonly textarea / selectable preview',
  },
  {
    id: 'T-08',
    name: '实时保存',
    plain: '改了分类、字号、宽度、当前标签后，不用点保存，下次打开还在。',
    tech: 'Local persistence / localStorage state',
  },
  {
    id: 'T-09',
    name: '标签记忆',
    plain: '上次停在角色、设定、脑洞哪个标签，下次打开还停在那里。',
    tech: 'Persisted active tab',
  },
  {
    id: 'T-10',
    name: '拖拽换分类',
    plain: '把角色、设定、细纲条目拖到另一个分类下面，就会移动分类。',
    tech: 'HTML drag and drop / drag state',
  },
  {
    id: 'T-11',
    name: '右键菜单',
    plain: '右键某个条目，弹出删除、置顶、清空等操作菜单。',
    tech: 'Context menu / portal overlay',
  },
  {
    id: 'T-12',
    name: '鼠标手势',
    plain: '按住右键向左滑回首页，向右滑前进；中途乱滑会判定无效。',
    tech: 'Mouse gesture recognizer / pointer trail',
  },
  {
    id: 'T-13',
    name: 'AI 生成链路',
    plain: '选择模型和提示词，把用户输入加上下文一起发给 AI，再显示结果。',
    tech: 'Model adapter / prompt composition / abort controller',
  },
  {
    id: 'T-14',
    name: 'RAG 召回',
    plain: '写作前先从设定库里找相关设定，再塞给 AI，避免写偏。',
    tech: 'Vector retrieval / pgvector / context injection',
  },
  {
    id: 'T-15',
    name: '内置数据库',
    plain: '软件自带 PostgreSQL 程序，用户不单独安装也能启动本地数据库。',
    tech: 'Embedded PostgreSQL runtime / child process',
  },
  {
    id: 'T-16',
    name: '打包资源',
    plain: '软件图标、数据库程序、运行时文件一起随安装包带过去。',
    tech: 'Electron builder extraResources / packaged runtime',
  },
  {
    id: 'T-17',
    name: '蓝色隐藏滚动条',
    plain: '平时看不到滚动条轨道，滚动或鼠标靠近时只显示蓝色滑块。',
    tech: 'Custom scrollbar / transparent track / hover reveal',
  },
  {
    id: 'T-18',
    name: '章节绑定内容',
    plain: '概要、细纲、设定和某一章绑定，点章节时显示对应内容。',
    tech: 'Chapter-linked state / selected chapter id',
  },
];

function SectionTitle({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function NumberPill({ id }: { id: string }) {
  return <div className="text-2xl font-black leading-none text-brand">{id}</div>;
}

export function SoftwareUiCatalogPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CatalogTab>('ui');
  const groups = Array.from(new Set(uiSamples.map((item) => item.group)));

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">软件 UI 记录</h1>
          <p className="mt-0.5 text-xs text-slate-400">以后可以直接说编号，例如“用 UI-18 的分割线”或“用 T-01 那个技术”。</p>
        </div>
        <button
          onClick={() => navigate('/test-collection')}
          className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:border-brand/40 hover:bg-brand-light hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          返回其他测试
        </button>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-[18px] bg-slate-100 p-1.5">
            <button
              onClick={() => setActiveTab('ui')}
              className={`h-10 rounded-[15px] px-5 text-sm font-bold ${activeTab === 'ui' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
            >
              软件 UI
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`h-10 rounded-[15px] px-5 text-sm font-bold ${activeTab === 'tech' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
            >
              技术词典
            </button>
          </div>
          <div className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-400 shadow-sm">
            已记录 {fontSamples.length + colorSamples.length + uiSamples.length} 个 UI 样式，{techItems.length} 个技术词
          </div>
        </div>

        {activeTab === 'ui' ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <SectionTitle icon={<Type className="h-5 w-5 text-brand" />} title="字体设置" desc="全软件常用字号和字重，之后按 F 编号复用。" />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                {fontSamples.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <NumberPill id={item.id} />
                      <span className="text-xs font-bold text-slate-400">{item.name}</span>
                    </div>
                    <div className={item.className}>{item.sample}</div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <SectionTitle icon={<Palette className="h-5 w-5 text-brand" />} title="颜色记录" desc="全软件主要颜色，包含用户指定色和品牌色。" />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                {colorSamples.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <div className={`flex h-16 items-center justify-center ${item.textClass ?? 'text-white'}`} style={{ backgroundColor: item.value }}>
                      <span className="text-xl font-black drop-shadow-sm">{item.id}</span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                        <code className="text-[11px] font-bold text-slate-400">{item.value}</code>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {groups.map((group) => (
              <section key={group} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <SectionTitle
                  icon={group === 'AI' ? <MessageSquare className="h-5 w-5 text-brand" /> : <Sparkles className="h-5 w-5 text-brand" />}
                  title={`${group}样式`}
                  desc={`全软件${group}相关的常用 UI 编号。`}
                />
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {uiSamples.filter((item) => item.group === group).map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <NumberPill id={item.id} />
                          <h3 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400">{item.group}</span>
                      </div>
                      <div className="flex min-h-[112px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                        {item.preview}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle icon={<Code2 className="h-5 w-5 text-brand" />} title="技术词典" desc="把你常用的大白话说法，翻译成我后续能直接定位的技术名称。" />
            <div className="space-y-3">
              {techItems.map((item) => (
                <article key={item.id} className="grid grid-cols-[96px_190px_minmax(0,1fr)_300px] items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <NumberPill id={item.id} />
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    {item.id === 'T-01' ? <GripVertical className="h-4 w-4 text-slate-400" /> : <BookOpen className="h-4 w-4 text-slate-400" />}
                    {item.name}
                  </div>
                  <div className="text-sm leading-6 text-slate-500">{item.plain}</div>
                  <code className="rounded-lg bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">{item.tech}</code>
                </article>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
              <Check className="h-5 w-5" />
              以后你可以直接说“按 UI-13 做角色卡片”或“这里加 T-03 弹窗栈规则”，我会按这个页面的记录去实现。
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
