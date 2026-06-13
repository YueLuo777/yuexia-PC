import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  GripVertical,
  Heart,
  LayoutPanelLeft,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

type CatalogTab = 'ui' | 'manual' | 'tech' | 'collection';

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
  specs?: Partial<UiSpecs>;
};

type UiSpecs = {
  width: number;
  height: number;
  fontSize: number;
  radius: number;
  paddingX: number;
  gap: number;
  iconSize: number;
  plusMinusSize: number;
};

type TechItem = {
  id: string;
  name: string;
  plain: string;
  tech: string;
};

type CatalogMark = 'rare';

const CATALOG_MARKS_STORAGE_KEY = 'xinyuexia_software_ui_catalog_marks_v1';
const CATALOG_COLLECTION_STORAGE_KEY = 'xinyuexia_software_ui_catalog_collection_v1';
const CATALOG_NAV_COLLAPSED_STORAGE_KEY = 'xinyuexia_software_ui_catalog_nav_collapsed_v1';
const CATALOG_CONTENT_COLLAPSED_STORAGE_KEY = 'xinyuexia_software_ui_catalog_content_collapsed_v1';
const DEFAULT_CATALOG_COLLECTION_IDS = ['UI-140', 'UI-141', 'UI-142', 'UI-143'];
const LANDING_PREVIEW_SELECTED_IDS = ['UI-119', 'UI-112', 'UI-102', 'UI-109', 'UI-115', 'UI-125', 'UI-132'];

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
    usage: '脑洞预览、设定预览、章节梗概这类区域标题。',
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
  {
    id: 'UI-37',
    group: '字号',
    name: '紧凑字号步进器',
    usage: '空间很窄的标题栏或预览栏右侧，适合只放 -、数值、+。',
    preview: (
      <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button className="flex h-full w-9 items-center justify-center text-lg font-black text-slate-500 hover:bg-brand-light hover:text-brand">-</button>
        <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-100 text-xs font-black text-[#08AACE]">18</span>
        <button className="flex h-full w-9 items-center justify-center text-lg font-black text-slate-500 hover:bg-brand-light hover:text-brand">+</button>
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
          <button key={item} className={`h-8 min-w-10 rounded-lg px-2 text-xs font-black ${item === '大' ? 'bg-white text-brand shadow-sm' : 'text-slate-500'}`}>
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
        <button className="flex h-9 w-10 items-center justify-center rounded-lg text-sm font-black text-slate-500 hover:bg-slate-50">A-</button>
        <div className="h-5 w-px bg-slate-100" />
        <button className="flex h-9 w-10 items-center justify-center rounded-lg text-base font-black text-slate-700 hover:bg-brand-light hover:text-brand">A+</button>
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
        <button className="flex h-8 w-9 items-center justify-center rounded-xl bg-[#08AACE] text-lg font-black text-white">+</button>
        <span className="py-1 text-xs font-black text-slate-600">18</span>
        <button className="flex h-8 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-600">-</button>
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
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-black text-slate-500 hover:bg-slate-50">-</button>
        <span className="mx-2 min-w-14 text-center text-sm font-black text-[#08AACE]">110%</span>
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-black text-slate-500 hover:bg-slate-50">+</button>
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
            <button key={item} className={`h-8 rounded-lg text-xs font-black ${item === '18' ? 'bg-[#08AACE] text-white' : 'bg-slate-50 text-slate-500'}`}>{item}</button>
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
        <input className="h-7 w-12 rounded-lg border border-slate-200 text-center text-xs font-black text-[#08AACE] outline-none" defaultValue="18" />
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
          <button key={item} className={`h-8 rounded-lg px-3 text-xs font-black ${item === '标准' ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
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
    preview: <button className="h-10 rounded-xl border border-[#08AACE] bg-white px-5 text-sm font-black text-[#08AACE] hover:bg-brand-light">读取脑洞</button>,
  },
  {
    id: 'UI-50',
    group: '按钮',
    name: '轻量文字按钮',
    usage: '页面内不重要但常用的操作，比如展开、更多、查看日志。',
    preview: <button className="h-9 rounded-lg px-3 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-700">查看日志</button>,
  },
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
        <input className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold outline-none focus:border-brand" placeholder="原文" />
        <span className="text-xs font-black text-slate-300">→</span>
        <input className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold outline-none focus:border-brand" placeholder="替换" />
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
        <button className="absolute left-8 top-8 h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">按钮A</button>
        <button className="absolute left-40 top-8 h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600">按钮B</button>
        <span className="absolute left-[118px] top-14 rounded bg-[#08AACE] px-1.5 py-0.5 text-[10px] font-black text-white">对齐</span>
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
          backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="ml-8 mt-8 inline-flex rounded-lg bg-[#08AACE] px-4 py-2 text-xs font-black text-white shadow-sm">可拖动按钮</div>
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
          <label>宽度<input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="96" /></label>
          <label>高度<input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="40" /></label>
          <label>字号<input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="14" /></label>
          <label>圆角<input className="mt-1 h-8 w-full rounded-lg border border-slate-200 px-2 outline-none" defaultValue="8" /></label>
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
            <div key={item} className={`rounded-lg px-2 py-1.5 text-xs font-black ${item === '脑洞' ? 'bg-[#08AACE] text-white' : 'text-slate-500'}`}>{item}</div>
          ))}
        </div>
        <div className="flex flex-col p-2">
          <div className="flex-1 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-500">选择模型和提示词后发送测试。</div>
          <button className="mt-2 h-8 self-end rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">发送测试</button>
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
        {['智能排版', '一键替换', '章节梗概'].map((item) => (
          <button key={item} className="h-8 rounded-lg bg-slate-50 px-3 text-xs font-black text-slate-600 hover:bg-brand-light hover:text-brand">
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
          <button className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600">停止</button>
        </div>
        <button className="h-9 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">设置</button>
      </div>
    ),
  },
  {
    id: 'UI-63',
    group: '搜索',
    name: '搜索筛选组合',
    usage: '设定库、剧情库、脑洞库顶部搜索栏。',
    preview: (
      <div className="flex w-[320px] items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <input className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs font-bold outline-none focus:border-brand" placeholder="搜索关键词..." />
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
            <button key={item} className="h-9 rounded-lg bg-slate-50 text-xs font-black text-slate-500 hover:bg-brand-light hover:text-brand">{item}</button>
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
          <div key={name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-black">
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
  {
    id: 'UI-71',
    group: '表格',
    name: '冻结表头表格',
    usage: '一键替换规则、数据列表、导出记录，需要表头固定不动。',
    preview: (
      <div className="h-28 w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
          <span>原文</span><span>替换为</span><span>状态</span>
        </div>
        {['—— / …… / 自动', '错字 / 正字 / 手动'].map((row) => (
          <div key={row} className="grid grid-cols-3 px-3 py-2 text-xs font-bold text-slate-600">
            {row.split(' / ').map((cell) => <span key={cell}>{cell}</span>)}
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
        <div className="rounded-lg border border-[#08AACE] bg-[#FFF7ED] px-3 py-2 text-xs font-black text-slate-900">第22章 慌什么，完全不关你的事</div>
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
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">这里放模型、提示词、温度等设置。</div>
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
          <button key={item} className={`rounded-full px-3 py-1.5 text-xs font-black ${index < 2 ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-500'}`}>{item}</button>
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
    preview: <button className="h-10 w-[108px] rounded-xl bg-[#08AACE] text-sm font-black text-white">生成中...</button>,
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
            <button key={item} className={`h-8 flex-1 rounded-md text-xs font-black ${item === '整理' ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-500'}`}>{item}</button>
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
          <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-black">
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
          <span className="text-slate-400">模型</span><span className="text-slate-700">text-embedding</span>
          <span className="text-slate-400">状态</span><span className="text-[#08AACE]">已生成</span>
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
          <button key={item} className="block h-8 w-full px-3 text-left text-xs font-black text-slate-600 hover:bg-brand-light hover:text-brand">{item}</button>
        ))}
        <button className="block h-8 w-full px-3 text-left text-xs font-black text-red-500 hover:bg-red-50">删除</button>
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
        <span className="text-sm font-black text-slate-700">文案修改</span>
        <kbd className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">Ctrl + Alt + E</kbd>
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
          <path d="M230 54 C190 48 155 55 118 45 C88 37 65 44 42 34" fill="none" stroke="#08AACE" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="absolute left-10 top-14 rounded-full bg-[#08AACE] px-3 py-1 text-xs font-black text-white">回到首页</span>
      </div>
    ),
  },
  {
    id: 'UI-92',
    group: '文案修改',
    name: '文案编辑浮层',
    usage: '调整模式或文案修改模式里点击文字后，局部修改文案。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
        <div className="mb-2 text-sm font-black text-slate-900">修改文案</div>
        <input className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-brand" defaultValue="生成梗概" />
        <div className="mt-2 flex justify-end gap-2">
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">取消</button>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">应用</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-93',
    group: '文案修改',
    name: '调整模式启动卡',
    usage: '启动器页面里进入调整模式，显示能调整哪些内容。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-base font-black text-slate-900">调整模式</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">修改文案、按钮大小、颜色、间距，并导出改动。</div>
        <button className="mt-3 h-9 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white">进入调整</button>
      </div>
    ),
  },
  {
    id: 'UI-94',
    group: '颜色',
    name: '颜色网格',
    usage: '主题颜色页面里选择颜色，按颜色本身排列。',
    preview: (
      <div className="grid w-[240px] grid-cols-8 gap-1.5 rounded-xl border border-slate-200 bg-white p-3">
        {['#08AACE', '#22C55E', '#F97316', '#EF4444', '#8B5CF6', '#111827', '#EAB308', '#14B8A6', '#0EA5E9', '#F43F5E', '#84CC16', '#64748B'].map((color) => (
          <span key={color} className="h-6 w-6 rounded-lg border border-white shadow-sm" style={{ backgroundColor: color }} />
        ))}
      </div>
    ),
  },
  {
    id: 'UI-95',
    group: '颜色',
    name: '颜色绑定状态',
    usage: '先选填色位置，再选颜色，橙色框表示当前正在绑定。',
    preview: (
      <div className="flex w-[300px] items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="rounded-xl border-2 border-orange-500 px-3 py-2 text-xs font-black text-slate-700">按钮背景</div>
        <span className="text-xs font-black text-slate-300">→</span>
        <div className="h-9 w-9 rounded-xl bg-[#08AACE] shadow-sm" />
      </div>
    ),
  },
  {
    id: 'UI-96',
    group: '封面库',
    name: '封面缩略卡',
    usage: '封面库列表里展示封面、标题、状态。',
    preview: (
      <div className="w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-br from-slate-800 via-[#08AACE] to-slate-100" />
        <div className="p-3">
          <div className="truncate text-sm font-black text-slate-900">月落之后</div>
          <div className="mt-1 text-xs font-bold text-slate-400">默认封面</div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-97',
    group: '作品',
    name: '小说作品卡',
    usage: '首页作品列表，显示小说名、简介、字数和进入按钮。',
    preview: (
      <div className="w-[280px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-base font-black text-slate-900">小说名：月落之后</div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">一部围绕月落灾变展开的长篇小说。</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-black text-[#08AACE]">正文：32万字</span>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">进入</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-98',
    group: '作品',
    name: '章节目录行',
    usage: '编辑器章节列表、梗概章节列表、细纲章节列表。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-2">
        <div className="rounded-lg border border-[#08AACE] bg-[#FFF7ED] px-3 py-2">
          <div className="text-sm font-black text-slate-900">第22章 慌什么，完全不关你的事</div>
          <div className="mt-1 text-xs font-black text-slate-600">正文：3376字</div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-99',
    group: 'AI',
    name: '自动增高发送框',
    usage: 'AI 对话输入，回车发送，内容变多时框自动变高。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-200 bg-white p-2">
        <textarea className="h-14 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-brand" placeholder="输入内容，回车发送..." />
        <div className="mt-2 flex justify-end gap-2">
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">清空</button>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">发送</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-100',
    group: 'AI',
    name: 'AI 输出结果框',
    usage: '脑洞输出框、梗概预览、细纲预览，右上角带复制/清空。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-200 bg-white">
        <div className="flex h-10 items-center justify-between border-b border-slate-100 px-3">
          <span className="text-sm font-black text-slate-900">脑洞输出框</span>
          <div className="flex gap-1">
            <button className="h-7 rounded-lg bg-slate-100 px-2 text-[11px] font-black text-slate-500">复制</button>
            <button className="h-7 rounded-lg bg-slate-100 px-2 text-[11px] font-black text-slate-500">清空</button>
          </div>
        </div>
        <div className="h-20 p-3 text-xs leading-6 text-slate-500">这里显示 AI 生成结果，可以编辑、复制或保存。</div>
      </div>
    ),
  },
  {
    id: 'UI-101',
    group: '按钮',
    name: '标题胶囊管理按钮',
    usage: '放在页面标题右侧，把模型管理和提示词管理合并成一个胶囊双按钮。',
    preview: (
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <span className="text-sm font-black text-slate-900">大纲生成</span>
        <div className="flex h-8 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
          <button className="h-full px-3 text-xs font-black text-slate-600 hover:bg-[#08AACE] hover:text-white">模型管理</button>
          <button className="h-full border-l border-slate-200 px-3 text-xs font-black text-slate-600 hover:bg-[#08AACE] hover:text-white">提示词管理</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-102',
    group: '标签',
    name: '内嵌分段选择器',
    usage: '来自用户提供的 radio-inputs 代码。用于卡片宽度、封面高度、字号、小中大、多选一配置项；外层浅灰底，选中项白底浮起。',
    preview: (
      <div className="space-y-3">
        <div className="inline-flex w-[300px] flex-wrap rounded-lg bg-[#EEE] p-1 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          {['HTML', 'React', 'Vue'].map((item) => (
            <label key={item} className="flex-1 cursor-pointer text-center">
              <input type="radio" name="ui-102-radio" defaultChecked={item === 'HTML'} className="peer hidden" />
              <span className="flex items-center justify-center rounded-lg px-3 py-2 text-slate-700 transition-all duration-150 ease-in-out peer-checked:bg-white peer-checked:font-semibold">
                {item}
              </span>
            </label>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          .radio-inputs: flex + #EEE + p-1; input hidden; input:checked + .name = white + font-weight 600
        </code>
        <div className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-6 text-slate-600">
          <b className="text-sky-600">大白话：</b>
          HTML 是骨架，CSS 是皮肤，React 代码就是把骨架和皮肤打包成一个可复用的小零件。以后从 UI 网站拿这种组件，优先拿 React 版本。
        </div>
      </div>
    ),
  },
  {
    id: 'UI-103',
    group: '手动上传',
    name: '心形收藏 Checkbox',
    usage: '来自用户上传的 React + styled-components 代码。适合收藏、喜欢、常用、置顶这类轻量状态；点击后心形填充并播放庆祝线条动画。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-103-heart {
            --heart-color: rgb(255, 91, 137);
            position: relative;
            width: 50px;
            height: 50px;
            transition: .3s;
          }
          .ui-103-heart .ui-103-checkbox {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            z-index: 20;
            cursor: pointer;
          }
          .ui-103-heart .ui-103-svg-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .ui-103-heart .ui-103-svg-outline,
          .ui-103-heart .ui-103-svg-filled {
            fill: var(--heart-color);
            position: absolute;
          }
          .ui-103-heart .ui-103-svg-filled {
            animation: ui-103-svg-filled 1s;
            display: none;
          }
          .ui-103-heart .ui-103-svg-celebrate {
            position: absolute;
            animation: ui-103-svg-celebrate .5s;
            animation-fill-mode: forwards;
            display: none;
            stroke: var(--heart-color);
            fill: var(--heart-color);
            stroke-width: 2px;
          }
          .ui-103-heart .ui-103-checkbox:checked ~ .ui-103-svg-container .ui-103-svg-filled,
          .ui-103-heart .ui-103-checkbox:checked ~ .ui-103-svg-container .ui-103-svg-celebrate {
            display: block;
          }
          @keyframes ui-103-svg-filled {
            0% { transform: scale(0); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); filter: brightness(1.5); }
          }
          @keyframes ui-103-svg-celebrate {
            0% { transform: scale(0); }
            50% { opacity: 1; filter: brightness(1.5); }
            100% { transform: scale(1.4); opacity: 0; display: none; }
          }
        `}</style>
        <div className="ui-103-heart" title="Like">
          <input type="checkbox" className="ui-103-checkbox" aria-label="Like" />
          <div className="ui-103-svg-container">
            <svg viewBox="0 0 24 24" className="ui-103-svg-outline" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
            </svg>
            <svg viewBox="0 0 24 24" className="ui-103-svg-filled" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
            </svg>
            <svg className="ui-103-svg-celebrate" width={100} height={100} xmlns="http://www.w3.org/2000/svg">
              <polygon points="10,10 20,20" />
              <polygon points="10,50 20,50" />
              <polygon points="20,80 30,70" />
              <polygon points="90,10 80,20" />
              <polygon points="90,50 80,50" />
              <polygon points="80,80 70,70" />
            </svg>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked ~ svg-container shows filled heart + celebrate animation
        </code>
      </div>
    ),
  },
  {
    id: 'UI-104',
    group: '手动上传',
    name: '弹性滑动开关 Switch',
    usage: '来自用户上传的 React + styled-components 代码。适合启用/禁用、自动/手动、开关设置这类二选一状态；选中后变蓝，按住时滑块会被拉长。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-104-switch {
            --button-width: 3.5em;
            --button-height: 2em;
            --toggle-diameter: 1.5em;
            --button-toggle-offset: calc((var(--button-height) - var(--toggle-diameter)) / 2);
            --toggle-shadow-offset: 10px;
            --toggle-wider: 3em;
            --color-grey: #cccccc;
            --color-green: #4296f4;
            display: inline-flex;
            cursor: pointer;
          }
          .ui-104-slider {
            display: inline-block;
            width: var(--button-width);
            height: var(--button-height);
            background-color: var(--color-grey);
            border-radius: calc(var(--button-height) / 2);
            position: relative;
            transition: 0.3s all ease-in-out;
          }
          .ui-104-slider::after {
            content: "";
            display: inline-block;
            width: var(--toggle-diameter);
            height: var(--toggle-diameter);
            background-color: #fff;
            border-radius: calc(var(--toggle-diameter) / 2);
            position: absolute;
            top: var(--button-toggle-offset);
            transform: translateX(var(--button-toggle-offset));
            box-shadow: var(--toggle-shadow-offset) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
            transition: 0.3s all ease-in-out;
          }
          .ui-104-checkbox {
            display: none;
          }
          .ui-104-checkbox:checked + .ui-104-slider {
            background-color: var(--color-green);
          }
          .ui-104-checkbox:checked + .ui-104-slider::after {
            transform: translateX(calc(var(--button-width) - var(--toggle-diameter) - var(--button-toggle-offset)));
            box-shadow: calc(var(--toggle-shadow-offset) * -1) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
          }
          .ui-104-checkbox:active + .ui-104-slider::after {
            width: var(--toggle-wider);
          }
          .ui-104-checkbox:checked:active + .ui-104-slider::after {
            transform: translateX(calc(var(--button-width) - var(--toggle-wider) - var(--button-toggle-offset)));
          }
        `}</style>
        <label className="ui-104-switch">
          <input type="checkbox" className="ui-104-checkbox" aria-label="Switch" />
          <span className="ui-104-slider" />
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked + slider = blue background + knob translate right; active stretches knob
        </code>
      </div>
    ),
  },
  {
    id: 'UI-105',
    group: '手动上传',
    name: '波浪上浮输入框 Input',
    usage: '来自用户上传的 React + styled-components 代码。适合登录名、标题、短文本输入；聚焦或输入后，label 里的每个字母会按延迟依次上浮。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900 px-6 py-7">
        <style>{`
          .ui-105-form-control {
            position: relative;
            margin: 20px 0 40px;
            width: 190px;
          }
          .ui-105-form-control input {
            background-color: transparent;
            border: 0;
            border-bottom: 2px #fff solid;
            display: block;
            width: 100%;
            padding: 15px 0;
            font-size: 18px;
            color: #fff;
          }
          .ui-105-form-control input:focus,
          .ui-105-form-control input:valid {
            outline: 0;
            border-bottom-color: lightblue;
          }
          .ui-105-form-control label {
            position: absolute;
            top: 15px;
            left: 0;
            pointer-events: none;
          }
          .ui-105-form-control label span {
            display: inline-block;
            font-size: 18px;
            min-width: 5px;
            color: #fff;
            transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .ui-105-form-control input:focus + label span,
          .ui-105-form-control input:valid + label span {
            color: lightblue;
            transform: translateY(-30px);
          }
        `}</style>
        <div className="ui-105-form-control">
          <input type="text" required aria-label="Username" />
          <label>
            {'Username'.split('').map((char, index) => (
              <span key={`${char}-${index}`} style={{ transitionDelay: `${index * 50}ms` }}>
                {char}
              </span>
            ))}
          </label>
        </div>
        <code className="block rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-5 text-slate-300">
          input:focus + label span = lightblue + translateY(-30px), each span has 50ms delay
        </code>
      </div>
    ),
  },
  {
    id: 'UI-106',
    group: '手动上传',
    name: '书签收藏 Checkbox',
    usage: '来自用户上传的 React + styled-components 代码。适合收藏、加入书架、标记常用等状态；点击后书签变金色，并播放圆圈扩散和小点爆开动画。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-106-bookmark-label {
            --icon-size: 24px;
            --icon-secondary-color: rgb(77, 77, 77);
            --icon-hover-color: rgb(97, 97, 97);
            --icon-primary-color: gold;
            --icon-circle-border: 1px solid var(--icon-primary-color);
            --icon-circle-size: 35px;
            --icon-anmt-duration: 0.3s;
            display: inline-flex;
            cursor: pointer;
          }
          .ui-106-bookmark-label input {
            appearance: none;
            display: none;
          }
          .ui-106-bookmark {
            width: var(--icon-size);
            height: auto;
            fill: var(--icon-secondary-color);
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            transform-origin: top;
          }
          .ui-106-bookmark::after {
            content: "";
            position: absolute;
            width: 10px;
            height: 10px;
            box-shadow:
              0 30px 0 -4px var(--icon-primary-color),
              30px 0 0 -4px var(--icon-primary-color),
              0 -30px 0 -4px var(--icon-primary-color),
              -30px 0 0 -4px var(--icon-primary-color),
              -22px 22px 0 -4px var(--icon-primary-color),
              -22px -22px 0 -4px var(--icon-primary-color),
              22px -22px 0 -4px var(--icon-primary-color),
              22px 22px 0 -4px var(--icon-primary-color);
            border-radius: 50%;
            transform: scale(0);
          }
          .ui-106-bookmark::before {
            content: "";
            position: absolute;
            border-radius: 50%;
            border: var(--icon-circle-border);
            opacity: 0;
          }
          .ui-106-bookmark-label:hover .ui-106-bookmark {
            fill: var(--icon-hover-color);
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark {
            fill: var(--icon-primary-color);
            animation: ui-106-bookmark var(--icon-anmt-duration) forwards;
            transition-delay: 0.3s;
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark::before {
            animation: ui-106-circle var(--icon-anmt-duration) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: var(--icon-anmt-duration);
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark::after {
            animation: ui-106-circles var(--icon-anmt-duration) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: var(--icon-anmt-duration);
          }
          @keyframes ui-106-bookmark {
            50% { transform: scaleY(0.6); }
            100% { transform: scaleY(1); }
          }
          @keyframes ui-106-circle {
            from {
              width: 0;
              height: 0;
              opacity: 0;
            }
            90% {
              width: var(--icon-circle-size);
              height: var(--icon-circle-size);
              opacity: 1;
            }
            to { opacity: 0; }
          }
          @keyframes ui-106-circles {
            from { transform: scale(0); }
            40% { opacity: 1; }
            to {
              transform: scale(0.8);
              opacity: 0;
            }
          }
        `}</style>
        <label className="ui-106-bookmark-label">
          <input type="checkbox" aria-label="Bookmark" />
          <div className="ui-106-bookmark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <g>
                <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z" />
              </g>
            </svg>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:checked + bookmark = gold fill + bookmark squash + circle burst animation
        </code>
      </div>
    ),
  },
  {
    id: 'UI-107',
    group: '手动上传',
    name: '滑入填充复选框 Checkbox',
    usage: '来自用户上传的 React + styled-components 代码。适合开关确认、批量选择、完成状态；点击后白色斜块从左上角滑入填满方框。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900 px-6 py-7">
        <style>{`
          .ui-107-checkbox {
            display: block;
            cursor: pointer;
            width: 30px;
            height: 30px;
            border: 3px solid rgba(255, 255, 255, 0);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            box-shadow: 0px 0px 0px 2px #fff;
          }
          .ui-107-checkbox div {
            width: 60px;
            height: 60px;
            background-color: #fff;
            top: -52px;
            left: -52px;
            position: absolute;
            transform: rotateZ(45deg);
            z-index: 100;
          }
          .ui-107-checkbox input[type="checkbox"]:checked + div {
            left: -10px;
            top: -10px;
          }
          .ui-107-checkbox input[type="checkbox"] {
            position: absolute;
            left: 50px;
            visibility: hidden;
          }
          .ui-107-transition {
            transition: 300ms ease;
          }
        `}</style>
        <label className="ui-107-checkbox">
          <input type="checkbox" aria-label="Checked" />
          <div className="ui-107-transition" />
        </label>
        <code className="block rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-5 text-slate-300">
          input:checked + div moves from top-left to fill the rounded square
        </code>
      </div>
    ),
  },
  {
    id: 'UI-108',
    group: '手动上传',
    name: '滑块胶囊标签 Radio',
    usage: '来自用户上传的 React + styled-components 代码。适合顶部标签、分类切换、状态筛选；选中项文字变蓝，浅蓝滑块会跟随移动，首个标签可带数字角标。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-108-tabs {
            display: flex;
            position: relative;
            background-color: #fff;
            box-shadow: 0 0 1px 0 rgba(24, 94, 224, 0.15), 0 6px 12px 0 rgba(24, 94, 224, 0.15);
            padding: 0.75rem;
            border-radius: 99px;
          }
          .ui-108-tabs * {
            z-index: 2;
          }
          .ui-108-container input[type="radio"] {
            display: none;
          }
          .ui-108-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 30px;
            width: 50px;
            font-size: .8rem;
            color: black;
            font-weight: 500;
            border-radius: 99px;
            cursor: pointer;
            transition: color 0.15s ease-in;
            position: relative;
          }
          .ui-108-notification {
            display: flex;
            align-items: center;
            justify-content: center;
            width: .8rem;
            height: .8rem;
            position: absolute;
            top: -2px;
            right: 3px;
            font-size: 10px;
            border-radius: 50%;
            margin: 0px;
            background-color: #e6eef9;
            transition: 0.15s ease-in;
          }
          .ui-108-container input[type="radio"]:checked + label {
            color: #185ee0;
          }
          .ui-108-container input[type="radio"]:checked + label > .ui-108-notification {
            background-color: #185ee0;
            color: #fff;
            margin: 0px;
          }
          .ui-108-container input[id="ui-108-radio-1"]:checked ~ .ui-108-glider {
            transform: translateX(0);
          }
          .ui-108-container input[id="ui-108-radio-2"]:checked ~ .ui-108-glider {
            transform: translateX(100%);
          }
          .ui-108-container input[id="ui-108-radio-3"]:checked ~ .ui-108-glider {
            transform: translateX(200%);
          }
          .ui-108-glider {
            position: absolute;
            display: flex;
            height: 30px;
            width: 50px;
            background-color: #e6eef9;
            z-index: 1;
            border-radius: 99px;
            transition: 0.25s ease-out;
          }
        `}</style>
        <div className="ui-108-container">
          <div className="ui-108-tabs">
            <input type="radio" id="ui-108-radio-1" name="ui-108-tabs" defaultChecked />
            <label className="ui-108-tab" htmlFor="ui-108-radio-1">
              Hello
              <span className="ui-108-notification">2</span>
            </label>
            <input type="radio" id="ui-108-radio-2" name="ui-108-tabs" />
            <label className="ui-108-tab" htmlFor="ui-108-radio-2">UI</label>
            <input type="radio" id="ui-108-radio-3" name="ui-108-tabs" />
            <label className="ui-108-tab" htmlFor="ui-108-radio-3">World</label>
            <span className="ui-108-glider" />
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          radio:checked + label changes color; checked radio moves the glider by 0 / 100% / 200%
        </code>
      </div>
    ),
  },
  {
    id: 'UI-109',
    group: '手动上传',
    name: '彩色 SVG 加载动画 Loader',
    usage: '来自用户上传的 React + styled-components 代码。适合 AI 思考、生成中、导入中等等待状态；三段 SVG 线条循环描边，中间圆形会旋转并切换渐变。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-109-absolute {
            position: absolute;
          }
          .ui-109-inline-block {
            display: inline-block;
          }
          .ui-109-loader {
            display: flex;
            margin: 0.25em 0;
          }
          .ui-109-w-2 {
            width: 0.5em;
          }
          .ui-109-dash {
            animation: ui-109-dash-array 2s ease-in-out infinite,
              ui-109-dash-offset 2s linear infinite;
          }
          .ui-109-spin {
            animation: ui-109-spin-dash-array 2s ease-in-out infinite,
              ui-109-spin 8s ease-in-out infinite,
              ui-109-dash-offset 2s linear infinite;
            transform-origin: center;
          }
          @keyframes ui-109-dash-array {
            0% { stroke-dasharray: 0 1 359 0; }
            50% { stroke-dasharray: 0 359 1 0; }
            100% { stroke-dasharray: 359 1 0 0; }
          }
          @keyframes ui-109-spin-dash-array {
            0% { stroke-dasharray: 270 90; }
            50% { stroke-dasharray: 0 360; }
            100% { stroke-dasharray: 270 90; }
          }
          @keyframes ui-109-dash-offset {
            0% { stroke-dashoffset: 365; }
            100% { stroke-dashoffset: 5; }
          }
          @keyframes ui-109-spin {
            0% { rotate: 0deg; }
            12.5%, 25% { rotate: 270deg; }
            37.5%, 50% { rotate: 540deg; }
            62.5%, 75% { rotate: 810deg; }
            87.5%, 100% { rotate: 1080deg; }
          }
        `}</style>
        <div className="ui-109-loader">
          <svg height={0} width={0} viewBox="0 0 64 64" className="ui-109-absolute" aria-hidden="true">
            <defs xmlns="http://www.w3.org/2000/svg">
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="ui-109-b">
                <stop stopColor="#973BED" />
                <stop stopColor="#007CFF" offset={1} />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={0} y1={64} x1={0} id="ui-109-c">
                <stop stopColor="#FFC800" />
                <stop stopColor="#F0F" offset={1} />
                <animateTransform
                  repeatCount="indefinite"
                  keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                  keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                  dur="8s"
                  values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                  type="rotate"
                  attributeName="gradientTransform"
                />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="ui-109-d">
                <stop stopColor="#00E0ED" />
                <stop stopColor="#00DA72" offset={1} />
              </linearGradient>
            </defs>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height={64} width={64} className="ui-109-inline-block">
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={8}
              stroke="url(#ui-109-b)"
              d="M 54.722656,3.9726563 A 2.0002,2.0002 0 0 0 54.941406,4 h 5.007813 C 58.955121,17.046124 49.099667,27.677057 36.121094,29.580078 a 2.0002,2.0002 0 0 0 -1.708985,1.978516 V 60 H 29.587891 V 31.558594 A 2.0002,2.0002 0 0 0 27.878906,29.580078 C 14.900333,27.677057 5.0448787,17.046124 4.0507812,4 H 9.28125 c 1.231666,11.63657 10.984383,20.554048 22.6875,20.734375 a 2.0002,2.0002 0 0 0 0.02344,0 c 11.806958,0.04283 21.70649,-9.003371 22.730469,-20.7617187 z"
              className="ui-109-dash"
              pathLength={360}
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height={64} width={64} className="ui-109-inline-block">
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={10}
              stroke="url(#ui-109-c)"
              d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54"
              className="ui-109-spin"
              pathLength={360}
            />
          </svg>
          <div className="ui-109-w-2" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height={64} width={64} className="ui-109-inline-block">
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={8}
              stroke="url(#ui-109-d)"
              d="M 4,4 h 4.6230469 v 25.919922 c -0.00276,11.916203 9.8364941,21.550422 21.7500001,21.296875 11.616666,-0.240651 21.014356,-9.63894 21.253906,-21.25586 a 2.0002,2.0002 0 0 0 0,-0.04102 V 4 H 56.25 v 25.919922 c 0,14.33873 -11.581192,25.919922 -25.919922,25.919922 a 2.0002,2.0002 0 0 0 -0.0293,0 C 15.812309,56.052941 3.998433,44.409961 4,29.919922 Z"
              className="ui-109-dash"
              pathLength={360}
            />
          </svg>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          SVG paths animate stroke-dasharray + stroke-dashoffset; center circle also rotates
        </code>
      </div>
    ),
  },
  {
    id: 'UI-110',
    group: '手动上传',
    name: '浮动标签输入框 Input',
    usage: '来自用户上传的 React + styled-components 代码。适合姓名、标题、搜索词等短文本输入；聚焦或已有内容时，标签缩小并浮到边框上方。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-6 py-8">
        <style>{`
          .ui-110-input-group {
            position: relative;
          }
          .ui-110-input {
            border: solid 1.5px #9e9e9e;
            border-radius: 1rem;
            background: #ffffff;
            padding: 1rem;
            font-size: 1rem;
            color: #111827;
            transition: border 150ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ui-110-user-label {
            position: absolute;
            left: 15px;
            color: #111827;
            pointer-events: none;
            transform: translateY(1rem);
            transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ui-110-input:focus,
          .ui-110-input:valid {
            outline: none;
            border: 1.5px solid #111827;
          }
          .ui-110-input:focus ~ .ui-110-user-label,
          .ui-110-input:valid ~ .ui-110-user-label {
            transform: translateY(-50%) scale(0.8);
            background-color: #ffffff;
            padding: 0 .2em;
            color: #111827;
          }
        `}</style>
        <div className="ui-110-input-group">
          <input required type="text" name="ui-110-text" autoComplete="off" className="ui-110-input" aria-label="First Name" />
          <label className="ui-110-user-label">First Name</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:focus or input:valid keeps the white field and dark label visible
        </code>
      </div>
    ),
  },
  {
    id: 'UI-111',
    group: '手动上传',
    name: '立体拨动开关 Switch',
    usage: '来自用户上传的 React + styled-components 代码。适合黑白主题、开关设置、启用状态；hover 时开关会有 3D 倾斜，选中后圆形拨片滑到右侧。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-111-label {
            height: 60px;
            width: 120px;
            background-color: #ffffff;
            border-radius: 30px;
            box-shadow:
              inset 0 0 5px 4px rgba(255, 255, 255, 1),
              inset 0 0 20px 1px rgba(0, 0, 0, 0.488),
              10px 20px 30px rgba(0, 0, 0, 0.096),
              inset 0 0 0 3px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;
            transition: transform 0.4s;
          }
          .ui-111-label:hover {
            transform: perspective(100px) rotateX(5deg) rotateY(-5deg);
          }
          .ui-111-checkbox:checked ~ .ui-111-label:hover {
            transform: perspective(100px) rotateX(-5deg) rotateY(5deg);
          }
          .ui-111-checkbox {
            display: none;
          }
          .ui-111-checkbox:checked ~ .ui-111-label::before {
            left: 70px;
            background-color: #000000;
            background-image: linear-gradient(315deg, #000000 0%, #414141 70%);
            transition: 0.4s;
          }
          .ui-111-label::before {
            position: absolute;
            content: "";
            height: 40px;
            width: 40px;
            border-radius: 50%;
            background-color: #000000;
            background-image: linear-gradient(130deg, #757272 10%, #ffffff 11%, #726f6f 62%);
            left: 10px;
            box-shadow: 0 2px 1px rgba(0, 0, 0, 0.3), 10px 10px 10px rgba(0, 0, 0, 0.3);
            transition: 0.4s;
          }
        `}</style>
        <div>
          <input type="checkbox" name="ui-111-checkbox" id="ui-111-checkbox" className="ui-111-checkbox" />
          <label htmlFor="ui-111-checkbox" className="ui-111-label" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked ~ label moves the knob right; label:hover applies a perspective tilt
        </code>
      </div>
    ),
  },
  {
    id: 'UI-112',
    group: '手动上传',
    name: '展开箭头按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合“了解更多”“下一步”“查看详情”这类强调操作；hover 时左侧圆形背景展开为整条按钮，箭头右移，文字变白。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-112-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
            outline: none;
            border: 0;
            vertical-align: middle;
            text-decoration: none;
            background: transparent;
            padding: 0 1.25rem 0 4rem;
            font-size: inherit;
            font-family: inherit;
            width: 12rem;
            height: 3rem;
            border-radius: 999px;
            color: #282936;
          }
          .ui-112-button::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            z-index: 0;
            width: 3rem;
            height: 3rem;
            border-radius: 999px;
            background: #282936;
            transform: translateY(-50%);
            transition: width 0.45s cubic-bezier(0.65, 0, 0.076, 1);
          }
          .ui-112-circle {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            display: block;
            margin: 0;
            width: 3rem;
            height: 3rem;
            border-radius: 1.625rem;
          }
          .ui-112-icon {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
            background: #fff;
          }
          .ui-112-arrow {
            left: 0.625rem;
            width: 1.125rem;
            height: 0.125rem;
            background: none;
          }
          .ui-112-arrow::before {
            position: absolute;
            content: "";
            top: -0.29rem;
            right: 0.0625rem;
            width: 0.625rem;
            height: 0.625rem;
            border-top: 0.125rem solid #fff;
            border-right: 0.125rem solid #fff;
            transform: rotate(45deg);
          }
          .ui-112-button-text {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: relative;
            z-index: 1;
            padding: 0;
            margin: 0;
            color: currentColor;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            text-transform: uppercase;
          }
          .ui-112-button:hover::before {
            width: 100%;
          }
          .ui-112-button:hover .ui-112-arrow {
            background: #fff;
            transform: translate(0.375rem, 0);
          }
          .ui-112-button:hover .ui-112-button-text {
            color: #fff;
          }
        `}</style>
        <button className="ui-112-button" type="button">
          <span className="ui-112-circle" aria-hidden="true">
            <span className="ui-112-icon ui-112-arrow" />
          </span>
          <span className="ui-112-button-text">Learn More</span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands the circle to 100%, moves the arrow, and turns the label white
        </code>
      </div>
    ),
  },
  {
    id: 'UI-113',
    group: '手动上传',
    name: '星标收藏 Checkbox',
    usage: '来自用户上传的 React + styled-components 代码。适合收藏、评分、标记重点、常用项目；hover 时星星放大，选中后变成黄色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-113-star input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }
          .ui-113-star {
            display: block;
            position: relative;
            cursor: pointer;
            user-select: none;
          }
          .ui-113-star svg {
            position: relative;
            top: 0;
            left: 0;
            height: 50px;
            width: 50px;
            transition: all 0.3s;
            fill: #666;
          }
          .ui-113-star svg:hover {
            transform: scale(1.1);
          }
          .ui-113-star input:checked ~ svg {
            fill: #ffeb49;
          }
        `}</style>
        <label className="ui-113-star">
          <input type="checkbox" aria-label="Star" />
          <svg height="24px" viewBox="0 0 24 24" width="24px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g>
              <g>
                <path d="M9.362,9.158c0,0-3.16,0.35-5.268,0.584c-0.19,0.023-0.358,0.15-0.421,0.343s0,0.394,0.14,0.521 c1.566,1.429,3.919,3.569,3.919,3.569c-0.002,0-0.646,3.113-1.074,5.19c-0.036,0.188,0.032,0.387,0.196,0.506 c0.163,0.119,0.373,0.121,0.538,0.028c1.844-1.048,4.606-2.624,4.606-2.624s2.763,1.576,4.604,2.625 c0.168,0.092,0.378,0.09,0.541-0.029c0.164-0.119,0.232-0.318,0.195-0.505c-0.428-2.078-1.071-5.191-1.071-5.191 s2.353-2.14,3.919-3.566c0.14-0.131,0.202-0.332,0.14-0.524s-0.23-0.319-0.42-0.341c-2.108-0.236-5.269-0.586-5.269-0.586 s-1.31-2.898-2.183-4.83c-0.082-0.173-0.254-0.294-0.456-0.294s-0.375,0.122-0.453,0.294C10.671,6.26,9.362,9.158,9.362,9.158z" />
              </g>
            </g>
          </svg>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:checked ~ svg turns the star yellow; svg:hover scales it up
        </code>
      </div>
    ),
  },
  {
    id: 'UI-114',
    group: '手动上传',
    name: '深色指示灯开关 Switch',
    usage: '来自用户上传的 React + styled-components 代码。适合启用状态、电源状态、自动化开关；深色外壳带内阴影，选中后拨片右移，指示环由红色变绿色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-114-switch-button {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
            height: 55px;
          }
          .ui-114-switch-outer {
            height: 100%;
            background: #252532;
            width: 115px;
            border-radius: 165px;
            box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
            border: 1px solid #32303e;
            padding: 6px;
            box-sizing: border-box;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          .ui-114-switch-outer input[type="checkbox"] {
            opacity: 0;
            appearance: none;
            position: absolute;
          }
          .ui-114-button {
            width: 100%;
            height: 100%;
            display: flex;
            position: relative;
            justify-content: space-between;
          }
          .ui-114-button-toggle {
            height: 42px;
            width: 42px;
            background: linear-gradient(#3b3a4e, #272733);
            border-radius: 100%;
            box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
            position: relative;
            z-index: 2;
            transition: left 0.3s ease-in;
            left: 0;
          }
          .ui-114-switch-outer input[type="checkbox"]:checked + .ui-114-button .ui-114-button-toggle {
            left: 58%;
          }
          .ui-114-switch-outer input[type="checkbox"]:checked + .ui-114-button .ui-114-button-indicator {
            animation: ui-114-indicator 1s forwards;
          }
          .ui-114-button-indicator {
            height: 25px;
            width: 25px;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 50%;
            border: 3px solid #ef565f;
            box-sizing: border-box;
            right: 10px;
            position: relative;
          }
          @keyframes ui-114-indicator {
            0% {
              opacity: 1;
            }
            30% {
              opacity: 0;
            }
            100% {
              opacity: 1;
              border: 3px solid #60d480;
              left: -68%;
            }
          }
        `}</style>
        <label className="ui-114-switch-button" htmlFor="ui-114-switch">
          <div className="ui-114-switch-outer">
            <input id="ui-114-switch" type="checkbox" />
            <div className="ui-114-button">
              <span className="ui-114-button-toggle" />
              <span className="ui-114-button-indicator" />
            </div>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked moves the toggle right and animates the indicator from red to green
        </code>
      </div>
    ),
  },
  {
    id: 'UI-115',
    group: '手动上传',
    name: '月亮主题切换 Switch',
    usage: '来自用户上传的 React + styled-components 代码。现在落到软件顶部的“黑色主题”按钮；打开黑色主题时显示深色轨道和月亮圆点。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-115-toggle-switch {
            position: relative;
            width: 100px;
            height: 50px;
            --light: #d8dbe0;
            --dark: #28292c;
            --link: rgb(27, 129, 112);
            --link-hover: rgb(24, 94, 82);
          }
          .ui-115-switch-label {
            position: absolute;
            width: 100%;
            height: 50px;
            background-color: var(--dark);
            border-radius: 25px;
            cursor: pointer;
            border: 3px solid var(--dark);
          }
          .ui-115-checkbox {
            position: absolute;
            display: none;
          }
          .ui-115-slider {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 25px;
            transition: 0.3s;
          }
          .ui-115-checkbox:checked ~ .ui-115-slider {
            background-color: var(--light);
          }
          .ui-115-slider::before {
            content: "";
            position: absolute;
            top: 10px;
            left: 10px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            box-shadow: inset 12px -4px 0px 0px var(--light);
            background-color: var(--dark);
            transition: 0.3s;
          }
          .ui-115-checkbox:checked ~ .ui-115-slider::before {
            transform: translateX(50px);
            background-color: var(--dark);
            box-shadow: none;
          }
        `}</style>
        <div className="ui-115-toggle-switch">
          <label className="ui-115-switch-label">
            <input type="checkbox" className="ui-115-checkbox" aria-label="Theme switch" />
            <span className="ui-115-slider" />
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked changes the track to light and moves the moon knob to the right
        </code>
      </div>
    ),
  },
  {
    id: 'UI-116',
    group: '手动上传',
    name: '星光能量开关 Switch',
    usage: '来自用户上传的 React + styled-components 代码。适合高级模式、AI 增强、启动引擎等强调型开关；深色胶囊轨道内有星光粒子，选中后按钮滑到右侧并变成蓝色能量态。',
    preview: (
      <div className="flex flex-col items-center gap-5 py-5">
        <style>{`
          .ui-116-toggle-cont {
            --primary: #54a8fc;
            --light: #d9d9d9;
            --dark: #121212;
            --gray: #414344;
            --second: rgba(84, 168, 252, 0.22);
            position: relative;
            z-index: 10;
            width: fit-content;
            height: 50px;
            border-radius: 9999px;
          }
          .ui-116-toggle-input {
            display: none;
          }
          .ui-116-toggle-label {
            --gap: 5px;
            --knob-width: 50px;
            cursor: pointer;
            position: relative;
            display: inline-block;
            padding: 0.5rem;
            width: calc((var(--knob-width) + var(--gap)) * 2);
            height: 100%;
            background-color: var(--dark);
            border: 1px solid #777777;
            border-bottom: 0;
            border-radius: 9999px;
            box-sizing: content-box;
            transition: all 0.3s ease-in-out;
          }
          .ui-116-toggle-label::before {
            content: "";
            position: absolute;
            z-index: -10;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% + 1.5rem);
            height: calc(100% + 1.5rem);
            background-color: var(--gray);
            border: 1px solid #777777;
            border-bottom: 0;
            border-radius: 9999px;
            transition: all 0.3s ease-in-out;
          }
          .ui-116-toggle-label::after {
            content: "";
            position: absolute;
            z-index: -10;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle at 50% -100%, rgb(58, 155, 252) 0%, rgba(12, 12, 12, 1) 80%);
            border-radius: 9999px;
          }
          .ui-116-cont-icon {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: var(--knob-width);
            height: 50px;
            overflow: clip;
            background-image: radial-gradient(circle at 50% 0%, #666666 0%, var(--gray) 100%);
            border: 1px solid #aaaaaa;
            border-bottom: 0;
            border-radius: 9999px;
            box-shadow: inset 0 -0.15rem 0.15rem var(--primary), inset 0 0 0.5rem 0.75rem var(--second);
            transition: transform 0.3s ease-in-out, background-image 0.3s ease-in-out, border 0.3s ease-in-out;
          }
          .ui-116-sparkle {
            position: absolute;
            top: 50%;
            left: 50%;
            display: block;
            width: calc(var(--sparkle-width) * 1px);
            aspect-ratio: 1;
            background-color: var(--light);
            border-radius: 50%;
            transform-origin: 50% 50%;
            rotate: calc(1deg * var(--sparkle-deg));
            transform: translate(-50%, -50%);
            animation: ui-116-sparkle calc(100s / var(--sparkle-duration)) linear infinite;
          }
          .ui-116-s1 { --sparkle-width: 2; --sparkle-deg: 25; --sparkle-duration: 11; }
          .ui-116-s2 { --sparkle-width: 1; --sparkle-deg: 100; --sparkle-duration: 18; }
          .ui-116-s3 { --sparkle-width: 1; --sparkle-deg: 280; --sparkle-duration: 5; }
          .ui-116-s4 { --sparkle-width: 2; --sparkle-deg: 200; --sparkle-duration: 3; }
          .ui-116-s5 { --sparkle-width: 2; --sparkle-deg: 30; --sparkle-duration: 20; }
          .ui-116-s6 { --sparkle-width: 2; --sparkle-deg: 300; --sparkle-duration: 9; }
          .ui-116-s7 { --sparkle-width: 1; --sparkle-deg: 250; --sparkle-duration: 4; }
          .ui-116-s8 { --sparkle-width: 2; --sparkle-deg: 210; --sparkle-duration: 8; }
          .ui-116-s9 { --sparkle-width: 2; --sparkle-deg: 100; --sparkle-duration: 9; }
          .ui-116-s10 { --sparkle-width: 1; --sparkle-deg: 15; --sparkle-duration: 13; }
          .ui-116-s11 { --sparkle-width: 1; --sparkle-deg: 75; --sparkle-duration: 18; }
          .ui-116-s12 { --sparkle-width: 2; --sparkle-deg: 65; --sparkle-duration: 6; }
          .ui-116-s13 { --sparkle-width: 2; --sparkle-deg: 50; --sparkle-duration: 7; }
          .ui-116-s14 { --sparkle-width: 1; --sparkle-deg: 320; --sparkle-duration: 5; }
          .ui-116-s15 { --sparkle-width: 1; --sparkle-deg: 220; --sparkle-duration: 5; }
          .ui-116-s16 { --sparkle-width: 1; --sparkle-deg: 215; --sparkle-duration: 2; }
          .ui-116-s17 { --sparkle-width: 2; --sparkle-deg: 135; --sparkle-duration: 9; }
          .ui-116-s18 { --sparkle-width: 2; --sparkle-deg: 45; --sparkle-duration: 4; }
          .ui-116-s19 { --sparkle-width: 1; --sparkle-deg: 78; --sparkle-duration: 16; }
          .ui-116-s20 { --sparkle-width: 1; --sparkle-deg: 89; --sparkle-duration: 19; }
          .ui-116-s21 { --sparkle-width: 2; --sparkle-deg: 65; --sparkle-duration: 14; }
          .ui-116-s22 { --sparkle-width: 2; --sparkle-deg: 97; --sparkle-duration: 1; }
          .ui-116-s23 { --sparkle-width: 1; --sparkle-deg: 174; --sparkle-duration: 10; }
          .ui-116-s24 { --sparkle-width: 1; --sparkle-deg: 236; --sparkle-duration: 5; }
          .ui-116-icon {
            width: 1.1rem;
            fill: var(--light);
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label {
            background-color: #41434400;
            border: 1px solid #3d6970;
            border-bottom: 0;
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label::before {
            box-shadow: 0 1rem 2.5rem -2rem #0080ff;
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label .ui-116-cont-icon {
            overflow: visible;
            background-image: radial-gradient(circle at 50% 0%, #045ab1 0%, var(--primary) 100%);
            border: 1px solid var(--primary);
            border-bottom: 0;
            transform: translateX(calc((var(--gap) * 2) + 100%)) rotate(-225deg);
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label .ui-116-sparkle {
            z-index: -10;
            width: calc(var(--sparkle-width) * 1.5px);
            background-color: #acacac;
          }
          @keyframes ui-116-sparkle {
            to {
              width: calc(var(--sparkle-width) * 0.5px);
              transform: translate(2000%, -50%);
            }
          }
        `}</style>
        <div className="ui-116-toggle-cont">
          <input className="ui-116-toggle-input" id="ui-116-toggle" name="ui-116-toggle" type="checkbox" />
          <label className="ui-116-toggle-label" htmlFor="ui-116-toggle">
            <div className="ui-116-cont-icon">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={index} className={`ui-116-sparkle ui-116-s${index + 1}`} />
              ))}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="ui-116-icon" aria-hidden="true">
                <path d="M0.96233 28.61C1.36043 29.0081 1.96007 29.1255 2.47555 28.8971L10.4256 25.3552C13.2236 24.11 16.4254 24.1425 19.2107 25.4401L27.4152 29.2747C27.476 29.3044 27.5418 29.3023 27.6047 29.32C27.6563 29.3348 27.7079 29.3497 27.761 29.3574C27.843 29.3687 27.9194 29.3758 28 29.3688C28.1273 29.3617 28.2531 29.3405 28.3726 29.2945C28.4447 29.262 28.5162 29.2287 28.5749 29.1842C28.6399 29.1446 28.6993 29.0994 28.7509 29.0477L28.9008 28.8582C28.9468 28.7995 28.9793 28.7274 29.0112 28.656C29.0599 28.5322 29.0811 28.4036 29.0882 28.2734C29.0939 28.1957 29.0868 28.1207 29.0769 28.0415C29.0705 27.9955 29.0585 27.9524 29.0472 27.9072C29.0295 27.8343 29.0302 27.7601 28.9984 27.6901L25.1638 19.4855C23.8592 16.7073 23.8273 13.5048 25.0726 10.7068L28.6145 2.75679C28.8429 2.24131 28.7318 1.63531 28.3337 1.2372C27.9165 0.820011 27.271 0.721743 26.7491 0.9961L19.8357 4.59596C16.8418 6.15442 13.2879 6.18696 10.2615 4.70062L1.80308 0.520214C1.7055 0.474959 1.60722 0.441742 1.50964 0.421943C1.44459 0.409215 1.37882 0.395769 1.3074 0.402133C1.14406 0.395769 0.981436 0.428275 0.818095 0.499692C0.77284 0.519491 0.719805 0.545671 0.67455 0.578198C0.596061 0.617088 0.524653 0.675786 0.4596 0.74084C0.394546 0.805894 0.335843 0.877306 0.296245 0.956502C0.263718 1.00176 0.237561 1.05477 0.217762 1.10003C0.152708 1.24286 0.126545 1.40058 0.120181 1.54978C0.120181 1.61483 0.126527 1.6735 0.132891 1.73219C0.15269 1.85664 0.178881 1.97332 0.237571 2.08434L4.41798 10.5427C5.91139 13.5621 5.8725 17.1238 4.3204 20.1099L0.720514 27.0233C0.440499 27.5536 0.545137 28.1928 0.96233 28.61Z" />
              </svg>
            </div>
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked moves the glowing icon right and changes it from gray to blue
        </code>
      </div>
    ),
  },
  {
    id: 'UI-117',
    group: '手动上传',
    name: '左滑填充按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合普通确认、提交、继续等按钮；hover 时黑色背景从左向右填满，文字从深色变浅色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-117-button {
            padding: 15px 25px;
            border: unset;
            border-radius: 15px;
            color: #212121;
            z-index: 1;
            background: #e8e8e8;
            position: relative;
            font-weight: 1000;
            font-size: 17px;
            box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
            transition: all 250ms;
            overflow: hidden;
            cursor: pointer;
          }
          .ui-117-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0;
            border-radius: 15px;
            background-color: #212121;
            z-index: -1;
            box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
            transition: all 250ms;
          }
          .ui-117-button:hover {
            color: #e8e8e8;
          }
          .ui-117-button:hover::before {
            width: 100%;
          }
        `}</style>
        <button className="ui-117-button" type="button">Click me!</button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands ::before from width 0 to 100% and flips the text color
        </code>
      </div>
    ),
  },
  {
    id: 'UI-118',
    group: '手动上传',
    name: '社交图标九宫格 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合社交分享、外链入口、平台选择；初始显示渐变背景和 HOVER 文案，hover 后九宫格卡片散开并显示各平台图标。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-4">
        <style>{`
          .ui-118-main {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            width: 14em;
            align-items: center;
            justify-content: center;
          }
          .ui-118-main-back {
            position: absolute;
            border-radius: 10px;
            transform: rotate(90deg);
            width: 11em;
            height: 11em;
            background: linear-gradient(270deg, #03a9f4, #cc39a4, #ffb5d2);
            z-index: -2;
            box-shadow: inset 0px 0px 180px 5px #ffffff;
            transition: opacity 0.4s ease-in-out;
          }
          .ui-118-card {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.596);
            backdrop-filter: blur(5px);
            border: 1px solid transparent;
            color: transparent;
            font-size: 12px;
            font-weight: 900;
            transition: 0.4s ease-in-out, 0.2s background-color ease-in-out;
          }
          .ui-118-card:nth-child(1) { border-top-left-radius: 10px; }
          .ui-118-card:nth-child(3) { border-top-right-radius: 10px; }
          .ui-118-card:nth-child(7) { border-bottom-left-radius: 10px; }
          .ui-118-card:nth-child(9) { border-bottom-right-radius: 10px; }
          .ui-118-text {
            position: absolute;
            font-size: 0.7em;
            transition: 0.4s ease-in-out;
            color: black;
            text-align: center;
            font-weight: bold;
            letter-spacing: 0.33em;
            z-index: 3;
          }
          .ui-118-main:hover {
            cursor: pointer;
          }
          .ui-118-main:hover .ui-118-main-back {
            opacity: 0;
          }
          .ui-118-main:hover .ui-118-card {
            margin: 0.2em;
            border-radius: 10px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.2);
            color: #111827;
          }
          .ui-118-main:hover .ui-118-text {
            opacity: 0;
            z-index: -3;
          }
          .ui-118-card:nth-child(1):hover { background-color: #cc39a4; color: white; }
          .ui-118-card:nth-child(2):hover { background-color: #03a9f4; color: white; }
          .ui-118-card:nth-child(3):hover { background-color: #ffb5d2; color: white; }
          .ui-118-card:nth-child(4):hover { background-color: #1e1f26; color: white; }
          .ui-118-card:nth-child(5):hover {
            background-image: linear-gradient(#bf66ff, #6248ff, #00ddeb);
            color: white;
          }
          .ui-118-card:nth-child(6):hover { background-color: #8c9eff; color: white; }
          .ui-118-card:nth-child(7):hover { background-color: black; color: white; }
          .ui-118-card:nth-child(8):hover { background-color: #29b6f6; color: white; }
          .ui-118-card:nth-child(9):hover { background-color: rgb(255, 69, 0); color: white; }
        `}</style>
        <div className="ui-118-main">
          {['IG', 'X', 'DR', 'CP', 'UI', 'DC', 'GH', 'TG', 'RD'].map((item) => (
            <div key={item} className="ui-118-card">{item}</div>
          ))}
          <p className="ui-118-text">HOVER<br /><br />FOR<br /><br />SOCIAL</p>
          <div className="ui-118-main-back" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          main:hover reveals the 3x3 social cards; each card has its own hover color
        </code>
      </div>
    ),
  },
  {
    id: 'UI-119',
    group: '手动上传',
    name: '纸飞机发送按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合发送、提交、发布等操作；hover 时纸飞机向右飞并轻微上下浮动，文字滑出，按下时按钮缩小。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-119-button {
            font-family: inherit;
            font-size: 20px;
            background: royalblue;
            color: white;
            padding: 0.7em 1em;
            padding-left: 0.9em;
            display: flex;
            align-items: center;
            border: none;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.2s;
            cursor: pointer;
          }
          .ui-119-button span {
            display: block;
            margin-left: 0.3em;
            transition: all 0.3s ease-in-out;
          }
          .ui-119-button svg {
            display: block;
            transform-origin: center center;
            transition: transform 0.3s ease-in-out;
          }
          .ui-119-button:hover .ui-119-svg-wrapper {
            animation: ui-119-fly 0.6s ease-in-out infinite alternate;
          }
          .ui-119-button:hover svg {
            transform: translateX(1.2em) rotate(45deg) scale(1.1);
          }
          .ui-119-button:hover span {
            transform: translateX(5em);
          }
          .ui-119-button:active {
            transform: scale(0.95);
          }
          @keyframes ui-119-fly {
            from { transform: translateY(0.1em); }
            to { transform: translateY(-0.1em); }
          }
        `}</style>
        <button className="ui-119-button" type="button">
          <div className="ui-119-svg-wrapper-1">
            <div className="ui-119-svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} aria-hidden="true">
                <path fill="none" d="M0 0h24v24H0z" />
                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            </div>
          </div>
          <span>Send</span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover animates the plane wrapper, rotates the SVG, and slides the text away
        </code>
      </div>
    ),
  },
  {
    id: 'UI-120',
    group: '手动上传',
    name: '四宫格社交按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合社交入口、平台跳转、快捷外链；四个卡片组成异形圆角四宫格，hover 时单个卡片放大并切换品牌底色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-120-main {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
          }
          .ui-120-row {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
          }
          .ui-120-card {
            width: 90px;
            height: 90px;
            outline: none;
            border: none;
            background: white;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
            transition: .2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
          }
          .ui-120-card1 {
            border-radius: 90px 5px 5px 5px;
            color: #cc39a4;
          }
          .ui-120-card2 {
            border-radius: 5px 90px 5px 5px;
            color: #03a9f4;
          }
          .ui-120-card3 {
            border-radius: 5px 5px 5px 90px;
            color: #111111;
          }
          .ui-120-card4 {
            border-radius: 5px 5px 90px 5px;
            color: #8c9eff;
          }
          .ui-120-card:hover {
            cursor: pointer;
            scale: 1.1;
            color: white;
          }
          .ui-120-card1:hover {
            background-color: #cc39a4;
          }
          .ui-120-card2:hover {
            background-color: #03a9f4;
          }
          .ui-120-card3:hover {
            background-color: black;
          }
          .ui-120-card4:hover {
            background-color: #8c9eff;
          }
        `}</style>
        <div className="ui-120-main">
          <div className="ui-120-row">
            <button className="ui-120-card ui-120-card1" type="button">IG</button>
            <button className="ui-120-card ui-120-card2" type="button">X</button>
          </div>
          <div className="ui-120-row">
            <button className="ui-120-card ui-120-card3" type="button">GH</button>
            <button className="ui-120-card ui-120-card4" type="button">DC</button>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          each corner card has a different radius and brand hover color; hover scales the active card
        </code>
      </div>
    ),
  },
  {
    id: 'UI-121',
    group: '手动上传',
    name: '展开删除按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合删除、移除、清空等危险操作；hover 时文字变透明，右侧 X 图标区域展开成整颗按钮，按下时图标缩小。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-121-button {
            width: 150px;
            height: 50px;
            cursor: pointer;
            display: flex;
            align-items: center;
            background: #e62222;
            border: none;
            border-radius: 5px;
            box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
            position: relative;
          }
          .ui-121-button,
          .ui-121-button span {
            transition: 200ms;
          }
          .ui-121-text {
            transform: translateX(35px);
            color: white;
            font-weight: bold;
          }
          .ui-121-icon {
            position: absolute;
            border-left: 1px solid #c41b1b;
            transform: translateX(110px);
            height: 40px;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ui-121-button svg {
            width: 15px;
            fill: #eee;
          }
          .ui-121-button:hover {
            background: #ff3636;
          }
          .ui-121-button:hover .ui-121-text {
            color: transparent;
          }
          .ui-121-button:hover .ui-121-icon {
            width: 150px;
            border-left: none;
            transform: translateX(0);
          }
          .ui-121-button:focus {
            outline: none;
          }
          .ui-121-button:active .ui-121-icon svg {
            transform: scale(0.8);
          }
        `}</style>
        <button className="ui-121-button" type="button">
          <span className="ui-121-text">Delete</span>
          <span className="ui-121-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
            </svg>
          </span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover hides the text and expands the icon segment to full width
        </code>
      </div>
    ),
  },
  {
    id: 'UI-122',
    group: '手动上传',
    name: '展开导航菜单 Radio',
    usage: '来自用户上传的 React + styled-components 代码。适合底部导航、顶部工具菜单、模块切换；默认只显示图标，hover 或 focus 时菜单项变宽，标题从右侧滑入。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-122-menu {
            padding: 0.5rem;
            background-color: #fff;
            position: relative;
            display: flex;
            justify-content: center;
            border-radius: 15px;
            box-shadow: 0 10px 25px 0 rgba(0, 0, 0, 0.075);
          }
          .ui-122-link {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 70px;
            height: 50px;
            border-radius: 8px;
            position: relative;
            z-index: 1;
            overflow: hidden;
            transform-origin: center left;
            transition: width 0.2s ease-in;
            text-decoration: none;
            color: inherit;
            border: 0;
            background: transparent;
            cursor: pointer;
            font: inherit;
          }
          .ui-122-link::before {
            position: absolute;
            z-index: -1;
            content: "";
            display: block;
            border-radius: 8px;
            width: 100%;
            height: 100%;
            top: 0;
            transform: translateX(100%);
            transition: transform 0.2s ease-in;
            transform-origin: center right;
            background-color: #eee;
          }
          .ui-122-link:hover,
          .ui-122-link:focus {
            outline: 0;
            width: 130px;
          }
          .ui-122-link:hover::before,
          .ui-122-link:focus::before,
          .ui-122-link:hover .ui-122-link-title,
          .ui-122-link:focus .ui-122-link-title {
            transform: translateX(0);
            opacity: 1;
          }
          .ui-122-link-icon {
            width: 28px;
            height: 28px;
            display: block;
            flex-shrink: 0;
            left: 18px;
            position: absolute;
          }
          .ui-122-link-icon svg {
            width: 28px;
            height: 28px;
          }
          .ui-122-link-title {
            transform: translateX(100%);
            transition: transform 0.2s ease-in, opacity 0.2s ease-in;
            transform-origin: center right;
            display: block;
            text-align: center;
            text-indent: 28px;
            width: 100%;
            opacity: 0;
          }
        `}</style>
        <div className="ui-122-menu">
          {[
            { title: 'Home', path: 'M4 12L12 5l8 7v8H6v-8z' },
            { title: 'Games', path: 'M7 15l8-8h4v4l-8 8-4-4z' },
            { title: 'Chat', path: 'M5 6h14v10H9l-4 4V6z' },
            { title: 'Search', path: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-1 4 4' },
            { title: 'Profile', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0' },
          ].map((item) => (
            <button key={item.title} className="ui-122-link" type="button">
              <span className="ui-122-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={item.path} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </span>
              <span className="ui-122-link-title">{item.title}</span>
            </button>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          link:hover expands width from 70px to 130px and slides the title into view
        </code>
      </div>
    ),
  },
  {
    id: 'UI-123',
    group: '手动上传',
    name: '霓虹描边文字按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合品牌标题、强调入口、炫酷操作按钮；默认是透明描边文字，hover 时绿色文字从左到右展开并产生发光效果。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-950 px-6 py-7">
        <style>{`
          .ui-123-button {
            margin: 0;
            height: auto;
            background: transparent;
            padding: 0;
            border: none;
            cursor: pointer;
            --border-right: 6px;
            --text-stroke-color: rgba(255, 255, 255, 0.6);
            --animation-color: #37ff8b;
            --fs-size: 2em;
            letter-spacing: 3px;
            text-decoration: none;
            font-size: var(--fs-size);
            font-family: Arial, sans-serif;
            position: relative;
            text-transform: uppercase;
            color: transparent;
            -webkit-text-stroke: 1px var(--text-stroke-color);
          }
          .ui-123-hover-text {
            position: absolute;
            box-sizing: border-box;
            color: var(--animation-color);
            width: 0%;
            inset: 0;
            border-right: var(--border-right) solid var(--animation-color);
            overflow: hidden;
            transition: 0.5s;
            -webkit-text-stroke: 1px var(--animation-color);
          }
          .ui-123-button:hover .ui-123-hover-text {
            width: 100%;
            filter: drop-shadow(0 0 23px var(--animation-color));
          }
        `}</style>
        <button className="ui-123-button" data-text="Awesome" type="button">
          <span className="ui-123-actual-text">&nbsp;uiverse&nbsp;</span>
          <span aria-hidden="true" className="ui-123-hover-text">&nbsp;uiverse&nbsp;</span>
        </button>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          hover text starts at width 0, then expands to 100% with a neon drop-shadow
        </code>
      </div>
    ),
  },
  {
    id: 'UI-124',
    group: '手动上传',
    name: '图标状态切换 Switch',
    usage: '来自用户上传的 React + styled-components 代码。适合启用/禁用、通过/不通过、开启/关闭状态；拨片内置叉号和勾号，选中后轨道变绿、拨片右移、勾号放大显示。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-124-switch {
            --switch-width: 46px;
            --switch-height: 24px;
            --switch-bg: rgb(131, 131, 131);
            --switch-checked-bg: rgb(0, 218, 80);
            --switch-offset: calc((var(--switch-height) - var(--circle-diameter)) / 2);
            --switch-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
            --circle-diameter: 18px;
            --circle-bg: #fff;
            --circle-shadow: 1px 1px 2px rgba(146, 146, 146, 0.45);
            --circle-checked-shadow: -1px 1px 2px rgba(163, 163, 163, 0.45);
            --circle-transition: var(--switch-transition);
            --icon-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
            --icon-cross-color: var(--switch-bg);
            --icon-cross-size: 6px;
            --icon-checkmark-color: var(--switch-checked-bg);
            --icon-checkmark-size: 10px;
            --effect-width: calc(var(--circle-diameter) / 2);
            --effect-height: calc(var(--effect-width) / 2 - 1px);
            --effect-bg: var(--circle-bg);
            --effect-border-radius: 1px;
            --effect-transition: all .2s ease-in-out;
            display: inline-block;
          }
          .ui-124-switch input {
            display: none;
          }
          .ui-124-switch svg {
            transition: var(--icon-transition);
            position: absolute;
            height: auto;
          }
          .ui-124-checkmark {
            width: var(--icon-checkmark-size);
            color: var(--icon-checkmark-color);
            transform: scale(0);
          }
          .ui-124-cross {
            width: var(--icon-cross-size);
            color: var(--icon-cross-color);
          }
          .ui-124-slider {
            box-sizing: border-box;
            width: var(--switch-width);
            height: var(--switch-height);
            background: var(--switch-bg);
            border-radius: 999px;
            display: flex;
            align-items: center;
            position: relative;
            transition: var(--switch-transition);
            cursor: pointer;
          }
          .ui-124-circle {
            width: var(--circle-diameter);
            height: var(--circle-diameter);
            background: var(--circle-bg);
            border-radius: inherit;
            box-shadow: var(--circle-shadow);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--circle-transition);
            z-index: 1;
            position: absolute;
            left: var(--switch-offset);
          }
          .ui-124-slider::before {
            content: "";
            position: absolute;
            width: var(--effect-width);
            height: var(--effect-height);
            left: calc(var(--switch-offset) + (var(--effect-width) / 2));
            background: var(--effect-bg);
            border-radius: var(--effect-border-radius);
            transition: var(--effect-transition);
          }
          .ui-124-switch input:checked + .ui-124-slider {
            background: var(--switch-checked-bg);
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-checkmark {
            transform: scale(1);
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-cross {
            transform: scale(0);
          }
          .ui-124-switch input:checked + .ui-124-slider::before {
            left: calc(100% - var(--effect-width) - (var(--effect-width) / 2) - var(--switch-offset));
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-circle {
            left: calc(100% - var(--circle-diameter) - var(--switch-offset));
            box-shadow: var(--circle-checked-shadow);
          }
        `}</style>
        <label className="ui-124-switch">
          <input defaultChecked type="checkbox" aria-label="Icon switch" />
          <div className="ui-124-slider">
            <div className="ui-124-circle">
              <svg className="ui-124-cross" xmlSpace="preserve" viewBox="0 0 365.696 365.696" height={6} width={6} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g>
                  <path fill="currentColor" d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0" />
                </g>
              </svg>
              <svg className="ui-124-checkmark" xmlSpace="preserve" viewBox="0 0 24 24" height={10} width={10} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g>
                  <path fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                </g>
              </svg>
            </div>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checked state turns the track green, moves the circle right, hides cross, and shows checkmark
        </code>
      </div>
    ),
  },
  {
    id: 'UI-125',
    group: '手动上传',
    name: '旋转加号按钮 Button',
    usage: '来自用户上传的 React + Tailwind class 代码。适合新增、创建、添加按钮；hover 时整颗圆形加号旋转 90 度并填充深色，active 时描边和填充进一步变浅/变深。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-125-button {
            cursor: pointer;
            outline: none;
            border: 0;
            background: transparent;
            padding: 0;
            transition: transform 300ms ease, color 300ms ease;
          }
          .ui-125-button:hover {
            transform: rotate(90deg);
          }
          .ui-125-icon {
            width: 50px;
            height: 50px;
            stroke: #a1a1aa;
            fill: none;
            transition: fill 300ms ease, stroke 300ms ease;
          }
          .ui-125-button:hover .ui-125-icon {
            fill: #27272a;
          }
          .ui-125-button:active .ui-125-icon {
            stroke: #e4e4e7;
            fill: #52525b;
            transition-duration: 0ms;
          }
        `}</style>
        <button title="Add New" className="ui-125-button" type="button" aria-label="Add New">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="ui-125-icon" aria-hidden="true">
            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" strokeWidth="1.5" />
            <path d="M8 12H16" strokeWidth="1.5" />
            <path d="M12 16V8" strokeWidth="1.5" />
          </svg>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          hover rotates the button 90deg and fills the circle; active changes stroke and fill instantly
        </code>
      </div>
    ),
  },
  {
    id: 'UI-126',
    group: '手动上传',
    name: '渐变纸飞机发送按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合发送、提交、发布等主操作；蓝色渐变胶囊按钮，hover 时整体上浮、阴影加深，纸飞机图标旋转。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-126-button {
            font-family: inherit;
            font-size: 18px;
            background: linear-gradient(to bottom, #4dc7d9 0%, #66a6ff 100%);
            color: white;
            padding: 0.8em 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 25px;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
            cursor: pointer;
          }
          .ui-126-button:hover {
            transform: translateY(-3px);
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
          }
          .ui-126-button:active {
            transform: scale(0.95);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
          }
          .ui-126-button span {
            display: block;
            margin-left: 0.4em;
            transition: all 0.3s;
          }
          .ui-126-button svg {
            width: 18px;
            height: 18px;
            fill: white;
            transition: all 0.3s;
          }
          .ui-126-svg-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            margin-right: 0.5em;
            transition: all 0.3s;
          }
          .ui-126-button:hover .ui-126-svg-wrapper {
            background-color: rgba(255, 255, 255, 0.5);
          }
          .ui-126-button:hover svg {
            transform: rotate(45deg);
          }
        `}</style>
        <button className="ui-126-button" type="button">
          <div className="ui-126-svg-wrapper-1">
            <div className="ui-126-svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} aria-hidden="true">
                <path fill="none" d="M0 0h24v24H0z" />
                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            </div>
          </div>
          <span>Send</span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover lifts up, brightens the icon circle, and rotates the plane 45deg
        </code>
      </div>
    ),
  },
  {
    id: 'UI-127',
    group: '手动上传',
    name: '交互色板卡片 Card',
    usage: '来自用户上传的 React + styled-components 代码。适合配色方案展示、主题色收藏、色卡预览；hover 某个色块时该色块变宽并显示色号。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-127-container {
            height: 200px;
            width: 350px;
            border-radius: 1em;
            overflow: hidden;
            box-shadow: 0 10px 20px #dbdbdb;
            font-family: sans-serif;
          }
          .ui-127-palette {
            display: flex;
            height: 86%;
            width: 100%;
          }
          .ui-127-color {
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            letter-spacing: 1px;
            transition: flex 0.1s linear;
          }
          .ui-127-color span {
            opacity: 0;
            transition: opacity 0.1s linear;
          }
          .ui-127-color:nth-child(1) {
            background: #264653;
          }
          .ui-127-color:nth-child(2) {
            background: #2a9d8f;
          }
          .ui-127-color:nth-child(3) {
            background: #e9c46a;
          }
          .ui-127-color:nth-child(4) {
            background: #f4a261;
          }
          .ui-127-color:nth-child(5) {
            background: #e76f51;
          }
          .ui-127-color:hover {
            flex: 2;
            box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
          }
          .ui-127-color:hover span {
            opacity: 1;
          }
          .ui-127-stats {
            height: 14%;
            width: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5em;
            box-sizing: border-box;
            color: #bebebe;
          }
          .ui-127-stats svg {
            fill: #bebebe;
            transform: scale(1.2);
          }
        `}</style>
        <div className="ui-127-container">
          <div className="ui-127-palette">
            {['264653', '2A9D8F', 'E9C46A', 'F4A261', 'E76F51'].map((color) => (
              <div key={color} className="ui-127-color"><span>{color}</span></div>
            ))}
          </div>
          <div className="ui-127-stats">
            <span>53421 saves</span>
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4 7.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S5.5 9.83 5.5 9 4.83 7.5 4 7.5zm10 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5z" />
            </svg>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          color:hover doubles its flex size and reveals the color code
        </code>
      </div>
    ),
  },
  {
    id: 'UI-128',
    group: '手动上传',
    name: '圆形展开删除按钮 Button',
    usage: '来自用户上传的 React + styled-components 代码。适合删除、清空、移除等危险操作；默认是黑色圆形垃圾桶，hover 后展开为红色胶囊并显示 Delete 文案。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-128-button {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgb(20, 20, 20);
            border: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.164);
            cursor: pointer;
            transition-duration: .3s;
            overflow: hidden;
            position: relative;
          }
          .ui-128-svg-icon {
            width: 12px;
            transition-duration: .3s;
          }
          .ui-128-svg-icon path {
            fill: white;
          }
          .ui-128-button:hover {
            width: 140px;
            border-radius: 50px;
            transition-duration: .3s;
            background-color: rgb(255, 69, 69);
            align-items: center;
          }
          .ui-128-button:hover .ui-128-svg-icon {
            width: 50px;
            transition-duration: .3s;
            transform: translateY(60%);
          }
          .ui-128-button::before {
            position: absolute;
            top: -20px;
            content: "Delete";
            color: white;
            transition-duration: .3s;
            font-size: 2px;
          }
          .ui-128-button:hover::before {
            font-size: 13px;
            opacity: 1;
            transform: translateY(30px);
            transition-duration: .3s;
          }
        `}</style>
        <button className="ui-128-button" type="button" aria-label="Delete">
          <svg viewBox="0 0 448 512" className="ui-128-svg-icon" aria-hidden="true">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands from a 50px circle to a 140px red pill and reveals Delete text
        </code>
      </div>
    ),
  },
  {
    id: 'UI-129',
    group: '手动上传',
    name: '波浪标签输入框 Input',
    usage: '来自用户上传的 React + styled-components 代码。适合名称、标题、短文本输入；聚焦或输入后标签逐字上浮，底部蓝色线条从中间向两侧展开。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-129-wave-group {
            position: relative;
          }
          .ui-129-input {
            font-size: 16px;
            padding: 10px 10px 10px 5px;
            display: block;
            width: 200px;
            border: none;
            border-bottom: 1px solid #515151;
            background: transparent;
          }
          .ui-129-input:focus {
            outline: none;
          }
          .ui-129-label {
            color: #999;
            font-size: 18px;
            font-weight: normal;
            position: absolute;
            pointer-events: none;
            left: 5px;
            top: 10px;
            display: flex;
          }
          .ui-129-label-char {
            transition: 0.2s ease all;
            transition-delay: calc(var(--index) * .05s);
          }
          .ui-129-input:focus ~ .ui-129-label .ui-129-label-char,
          .ui-129-input:valid ~ .ui-129-label .ui-129-label-char {
            transform: translateY(-20px);
            font-size: 14px;
            color: #5264ae;
          }
          .ui-129-bar {
            position: relative;
            display: block;
            width: 200px;
          }
          .ui-129-bar::before,
          .ui-129-bar::after {
            content: '';
            height: 2px;
            width: 0;
            bottom: 1px;
            position: absolute;
            background: #5264ae;
            transition: 0.2s ease all;
          }
          .ui-129-bar::before {
            left: 50%;
          }
          .ui-129-bar::after {
            right: 50%;
          }
          .ui-129-input:focus ~ .ui-129-bar::before,
          .ui-129-input:focus ~ .ui-129-bar::after {
            width: 50%;
          }
        `}</style>
        <div className="ui-129-wave-group">
          <input required type="text" className="ui-129-input" aria-label="Name" />
          <span className="ui-129-bar" />
          <label className="ui-129-label">
            {'Name'.split('').map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="ui-129-label-char"
                style={{ '--index': index } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          focus moves label chars upward with staggered delay and expands the underline from center
        </code>
      </div>
    ),
  },
  {
    id: 'UI-130',
    group: '手动上传',
    name: '深色浮动标签输入框 Input',
    usage: '来自用户本次上传的 React + styled-components 代码。用于作品编辑器 AI 输入框、大纲设定 AI 输入框、脑洞字段、剧本编辑器 AI 输入框、新增模型和创建提示词表单。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-130-input-group {
            position: relative;
            background: #ffffff;
            border-radius: 1rem;
            padding: 1.25rem;
          }
          .ui-130-input {
            width: 220px;
            border: solid 1.5px #9e9e9e;
            border-radius: 1rem;
            background: #ffffff;
            padding: 1rem;
            font-size: 1rem;
            color: #111827;
            transition: border 150ms cubic-bezier(0.4,0,0.2,1);
          }
          .ui-130-user-label {
            position: absolute;
            left: 35px;
            top: 20px;
            color: #111827;
            pointer-events: none;
            transform: translateY(1rem);
            transition: 150ms cubic-bezier(0.4,0,0.2,1);
          }
          .ui-130-input:focus,
          .ui-130-input:valid {
            outline: none;
            border: 1.5px solid #111827;
          }
          .ui-130-input:focus ~ .ui-130-user-label,
          .ui-130-input:valid ~ .ui-130-user-label {
            transform: translateY(-50%) scale(0.8);
            background-color: #ffffff;
            padding: 0 .2em;
            color: #111827;
          }
        `}</style>
        <div className="ui-130-input-group">
          <input required type="text" name="ui-130-text" autoComplete="off" className="ui-130-input" aria-label="AI 输入内容" />
          <label className="ui-130-user-label">AI 输入内容</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:focus or input:valid keeps the white field and dark label visible
        </code>
      </div>
    ),
  },
  {
    id: 'UI-131',
    group: '手动上传',
    name: '消息发送输入框 Input',
    usage: '来自用户本次上传的 React + styled-components 代码。适合 AI 对话输入区、作品编辑器右下角助手输入栏、需要图片或附件入口的消息发送栏。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-131-message-box {
            width: fit-content;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            padding: 0 15px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
          }
          .ui-131-message-box:focus-within {
            border: 1px solid #111827;
          }
          .ui-131-upload,
          .ui-131-send {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            color: #111827;
            cursor: pointer;
            outline: none;
          }
          .ui-131-upload {
            position: relative;
          }
          .ui-131-upload svg,
          .ui-131-send svg {
            height: 18px;
            transition: all 0.3s;
          }
          .ui-131-upload:hover,
          .ui-131-send:hover,
          .ui-131-message-input:focus ~ .ui-131-send,
          .ui-131-message-input:valid ~ .ui-131-send {
            color: #000000;
          }
          .ui-131-tooltip {
            position: absolute;
            top: -40px;
            display: none;
            opacity: 0;
            color: #111827;
            font-size: 10px;
            white-space: nowrap;
            background-color: #ffffff;
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.596);
            transition: all 0.3s;
          }
          .ui-131-upload:hover .ui-131-tooltip {
            display: block;
            opacity: 1;
          }
          .ui-131-message-input {
            width: 200px;
            height: 100%;
            background-color: transparent;
            outline: none;
            border: none;
            padding-left: 10px;
            color: #000000;
          }
        `}</style>
        <div className="ui-131-message-box">
          <button className="ui-131-upload" type="button" aria-label="Add an image">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
              <circle strokeWidth={20} stroke="currentColor" fill="none" r="158.5" cy="168.5" cx="168.5" />
              <path strokeLinecap="round" strokeWidth={25} stroke="currentColor" d="M167.759 79V259" />
              <path strokeLinecap="round" strokeWidth={25} stroke="currentColor" d="M79 167.138H259" />
            </svg>
            <span className="ui-131-tooltip">Add an image</span>
          </button>
          <input required placeholder="Message..." type="text" className="ui-131-message-input" aria-label="Message" />
          <button className="ui-131-send" type="button" aria-label="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
              <path fill="none" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888" />
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="33.67" stroke="currentColor" d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888" />
            </svg>
          </button>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          messageBox: file upload icon + text input + send icon, focus-within highlights the border
        </code>
      </div>
    ),
  },
  {
    id: 'UI-132',
    group: '鎵嬪姩涓婁紶',
    name: '搜索输入框 Input',
    usage: '来自用户本次上传的 React + styled-components 代码。适合作品库、剧本库、提示词管理、UI 记录等列表页顶部搜索入口。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-132-group {
            display: flex;
            line-height: 28px;
            align-items: center;
            position: relative;
            max-width: 190px;
          }
          .ui-132-input {
            width: 100%;
            height: 40px;
            line-height: 28px;
            padding: 0 1rem;
            padding-left: 2.5rem;
            border: 2px solid transparent;
            border-radius: 8px;
            outline: none;
            background-color: #f3f3f4;
            color: #0d0c22;
            transition: .3s ease;
          }
          .ui-132-input::placeholder {
            color: #9e9ea7;
          }
          .ui-132-input:focus,
          .ui-132-input:hover {
            outline: none;
            border-color: rgba(234,76,137,0.4);
            background-color: #fff;
            box-shadow: 0 0 0 4px rgb(234 76 137 / 10%);
          }
          .ui-132-icon {
            position: absolute;
            left: 1rem;
            fill: #9e9ea7;
            width: 1rem;
            height: 1rem;
            pointer-events: none;
          }
        `}</style>
        <div className="ui-132-group">
          <svg className="ui-132-icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
          <input placeholder="Search" type="search" className="ui-132-input" aria-label="Search" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          search input: leading icon, soft gray field, pink focus ring
        </code>
      </div>
    ),
  },
  {
    id: 'UI-133',
    group: '手动上传',
    name: '白色设置菜单 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 纵向菜单。已改成白色背景黑色文字，适合模型选择框、提示词选择框、接口类型选择框；hover 时其它选项保持清晰，不做虚化。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-133-menu {
            display: flex;
            width: 240px;
            flex-direction: column;
            gap: 6px;
            overflow: hidden;
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            background: #ffffff;
            padding: 8px;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
          }
          .ui-133-value {
            position: relative;
            display: flex;
            width: 100%;
            align-items: center;
            gap: 10px;
            border: 0;
            border-radius: 11px;
            background: transparent;
            padding: 10px;
            color: #111827;
            text-align: left;
            cursor: pointer;
            transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
          }
          .ui-133-value:hover,
          .ui-133-value:focus,
          .ui-133-value.is-active {
            outline: 0;
            background: #eefaff;
            color: #07a1c4;
          }
          .ui-133-value.is-active {
            transform: translateX(6px);
          }
          .ui-133-value::before {
            content: "";
            position: absolute;
            left: -7px;
            top: 9px;
            width: 4px;
            height: calc(100% - 18px);
            border-radius: 999px;
            background: #07a1c4;
            opacity: 0;
            transition: opacity 180ms ease;
          }
          .ui-133-value:focus::before,
          .ui-133-value.is-active::before {
            opacity: 1;
          }
          .ui-133-icon {
            display: grid;
            width: 30px;
            height: 30px;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 10px;
            background: #f1f5f9;
            color: #64748b;
            font-size: 11px;
            font-weight: 950;
          }
          .ui-133-value:hover .ui-133-icon,
          .ui-133-value:focus .ui-133-icon,
          .ui-133-value.is-active .ui-133-icon {
            background: #dff7fd;
            color: #07a1c4;
          }
          .ui-133-text {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 2px;
          }
          .ui-133-text b {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            line-height: 1.2;
          }
          .ui-133-text em {
            color: #64748b;
            font-size: 11px;
            font-style: normal;
            line-height: 1.2;
          }
          .ui-133-value:hover .ui-133-text em,
          .ui-133-value:focus .ui-133-text em,
          .ui-133-value.is-active .ui-133-text em {
            color: #3b7180;
          }
        `}</style>
        <div className="ui-133-menu">
          {[
            ['GPT5.5', '通用创作', 'M'],
            ['DeepSeek 写作模型', '大纲/正文', 'AI'],
            ['OpenAI Compatible', '标准接口', 'API'],
            ['Ollama', '本地模型', 'L'],
          ].map(([label, desc, icon]) => (
            <button
              key={label}
              type="button"
              className={`ui-133-value ${label === 'DeepSeek 写作模型' ? 'is-active' : ''}`}
            >
              <span className="ui-133-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="ui-133-text">
                <b>{label}</b>
                <em>{desc}</em>
              </span>
            </button>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          white menu radio: model select / interface type select, no sibling blur on hover
        </code>
      </div>
    ),
  },
  {
    id: 'UI-134',
    group: '手动上传',
    name: '字号数量步进器 Input',
    usage:
      '来自用户上传的 React/Tailwind 数量输入步进器。适合所有字号大小设置：AI 输出字号、脑洞预览/输出字号、设定预览字号、剧本编辑器字号、调整模式字号等。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <div className="grid w-full max-w-[420px] gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {[
            ['AI 输出字号', 20],
            ['脑洞预览字号', 14],
            ['剧本编辑器字号', 16],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm">
              <span className="text-sm font-black text-slate-700">{label}</span>
              <FontSizeStepper value={Number(value)} min={12} max={32} onChange={() => undefined} ariaLabel={String(label)} />
            </div>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          quantity stepper: minus / centered value / plus, used for font size controls
        </code>
      </div>
    ),
  },
  {
    id: 'UI-135',
    group: '手动上传',
    name: '玻璃滑块单选 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 代码。适合计划等级、模式切换、三段式状态筛选这类需要更强视觉反馈的单选控件。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-950 px-6 py-8">
        <style>{`
          .ui-135-glass-radio-group {
            --bg: rgba(255, 255, 255, 0.06);
            --text: #e5e5e5;
            display: flex;
            position: relative;
            overflow: hidden;
            width: fit-content;
            border-radius: 1rem;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.2),
              inset -1px -1px 6px rgba(0, 0, 0, 0.3),
              0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .ui-135-glass-radio-group input {
            display: none;
          }
          .ui-135-glass-radio-group label {
            position: relative;
            z-index: 2;
            display: flex;
            min-width: 80px;
            flex: 1;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            padding: 0.8rem 1.6rem;
            color: var(--text);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out;
          }
          .ui-135-glass-radio-group label:hover,
          .ui-135-glass-radio-group input:checked + label {
            color: #ffffff;
          }
          .ui-135-glass-glider {
            position: absolute;
            top: 0;
            bottom: 0;
            z-index: 1;
            width: calc(100% / 3);
            border-radius: 1rem;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-135-silver:checked ~ .ui-135-glass-glider {
            transform: translateX(0%);
            background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
            box-shadow:
              0 0 18px rgba(192, 192, 192, 0.5),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
          #ui-135-gold:checked ~ .ui-135-glass-glider {
            transform: translateX(100%);
            background: linear-gradient(135deg, #ffd70055, #ffcc00);
            box-shadow:
              0 0 18px rgba(255, 215, 0, 0.5),
              0 0 10px rgba(255, 235, 150, 0.4) inset;
          }
          #ui-135-platinum:checked ~ .ui-135-glass-glider {
            transform: translateX(200%);
            background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
            box-shadow:
              0 0 18px rgba(160, 216, 255, 0.5),
              0 0 10px rgba(200, 240, 255, 0.4) inset;
          }
        `}</style>
        <div className="ui-135-glass-radio-group">
          <input type="radio" name="ui-135-plan" id="ui-135-silver" defaultChecked />
          <label htmlFor="ui-135-silver">Silver</label>
          <input type="radio" name="ui-135-plan" id="ui-135-gold" />
          <label htmlFor="ui-135-gold">Gold</label>
          <input type="radio" name="ui-135-plan" id="ui-135-platinum" />
          <label htmlFor="ui-135-platinum">Platinum</label>
          <div className="ui-135-glass-glider" />
        </div>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          glass radio: hidden inputs + labels + animated glider for three-option selection
        </code>
      </div>
    ),
  },
  {
    id: 'UI-136',
    group: '手动上传',
    name: '软件标签页分段 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 代码。这里先套成软件顶部工作区标签页测试：外层浅灰底，当前标签白底突出。',
    preview: (
      <div className="flex w-full flex-col items-center gap-4 py-5">
        <style>{`
          .ui-136-radio-inputs {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            width: min(100%, 520px);
            box-sizing: border-box;
            border-radius: 0.5rem;
            background-color: #eeeeee;
            padding: 0.25rem;
            font-size: 14px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
          }
          .ui-136-radio {
            min-width: 0;
            flex: 1 1 0;
            text-align: center;
          }
          .ui-136-radio input {
            display: none;
          }
          .ui-136-name {
            display: flex;
            min-width: 0;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            border: 0;
            border-radius: 0.5rem;
            padding: 0.5rem 0.7rem;
            color: rgba(51, 65, 85, 1);
            transition: all 0.15s ease-in-out;
          }
          .ui-136-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .ui-136-close {
            display: grid;
            width: 1.25rem;
            height: 1.25rem;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 0.375rem;
            color: #64748b;
          }
          .ui-136-radio input:checked + .ui-136-name {
            background-color: #ffffff;
            font-weight: 600;
            color: #0f172a;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          }
          .ui-136-radio input:checked + .ui-136-name .ui-136-close,
          .ui-136-name:hover .ui-136-close {
            background: #f1f5f9;
            color: #334155;
          }
        `}</style>
        <div className="ui-136-radio-inputs">
          {['首页', '作品编辑器', '提炼剧情', '提示词管理'].map((tab, index) => (
            <label key={tab} className="ui-136-radio">
              <input type="radio" name="ui-136-tabs" defaultChecked={index === 1} />
              <span className="ui-136-name">
                <span className="ui-136-title">{tab}</span>
                {tab !== '首页' && (
                  <span className="ui-136-close" aria-hidden="true">
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          software tab test: same radio-inputs structure, adapted for workspace tabs with optional close icon
        </code>
      </div>
    ),
  },
  {
    id: 'UI-137',
    group: '手动上传',
    name: '玻璃特效作品操作矩阵',
    usage:
      '把 UI-135 的玻璃滑块特效融入作品卡片的 2x2 操作按钮里。用于测试“重命名 / 封面 / 导出 / 删除”这种四宫格胶囊操作区。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-137-action-glass {
            --bg: rgba(255, 255, 255, 0.72);
            --text: #08aace;
            position: relative;
            display: grid;
            width: 282px;
            height: 112px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            overflow: hidden;
            border: 1px solid rgba(226, 232, 240, 0.95);
            border-radius: 22px;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.75),
              inset -1px -1px 6px rgba(15, 23, 42, 0.08),
              0 8px 20px rgba(15, 23, 42, 0.08);
          }
          .ui-137-action-glass input {
            display: none;
          }
          .ui-137-action-glass label {
            position: relative;
            z-index: 2;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-right: 1px solid rgba(226, 232, 240, 0.9);
            border-bottom: 1px solid rgba(226, 232, 240, 0.9);
            color: var(--text);
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
          }
          .ui-137-action-glass label:nth-of-type(2),
          .ui-137-action-glass label:nth-of-type(4) {
            border-right: 0;
          }
          .ui-137-action-glass label:nth-of-type(3),
          .ui-137-action-glass label:nth-of-type(4) {
            border-bottom: 0;
          }
          .ui-137-action-glass label:hover,
          .ui-137-action-glass input:checked + label {
            color: #ffffff;
            text-shadow: 0 1px 8px rgba(15, 23, 42, 0.18);
          }
          .ui-137-action-glass label.ui-137-danger {
            color: #ff3b3b;
          }
          .ui-137-action-glass input:checked + label.ui-137-danger,
          .ui-137-action-glass label.ui-137-danger:hover {
            color: #ffffff;
          }
          .ui-137-glider {
            position: absolute;
            z-index: 1;
            width: 50%;
            height: 50%;
            border-radius: 18px;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-137-rename:checked ~ .ui-137-glider {
            transform: translate(0%, 0%);
            background: linear-gradient(135deg, rgba(8, 170, 206, 0.35), #08aace);
            box-shadow:
              0 0 18px rgba(8, 170, 206, 0.38),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-cover:checked ~ .ui-137-glider {
            transform: translate(100%, 0%);
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), #38bdf8);
            box-shadow:
              0 0 18px rgba(56, 189, 248, 0.38),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-export:checked ~ .ui-137-glider {
            transform: translate(0%, 100%);
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.28), #22c55e);
            box-shadow:
              0 0 18px rgba(34, 197, 94, 0.34),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-delete:checked ~ .ui-137-glider {
            transform: translate(100%, 100%);
            background: linear-gradient(135deg, rgba(255, 59, 59, 0.32), #ff4545);
            box-shadow:
              0 0 18px rgba(255, 69, 69, 0.42),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
        `}</style>
        <div className="ui-137-action-glass">
          <input type="radio" name="ui-137-actions" id="ui-137-rename" defaultChecked />
          <label htmlFor="ui-137-rename">重命名</label>
          <input type="radio" name="ui-137-actions" id="ui-137-cover" />
          <label htmlFor="ui-137-cover">封面</label>
          <input type="radio" name="ui-137-actions" id="ui-137-export" />
          <label htmlFor="ui-137-export">导出</label>
          <input type="radio" name="ui-137-actions" id="ui-137-delete" />
          <label htmlFor="ui-137-delete" className="ui-137-danger">删除</label>
          <div className="ui-137-glider" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          2x2 glass matrix: radio inputs + labels + glider, delete keeps red text until selected
        </code>
      </div>
    ),
  },
  {
    id: 'UI-138',
    group: '手动上传',
    name: '原色玻璃作品操作矩阵',
    usage:
      'UI-137 的原始配色版本。滑块使用用户原代码里的银色、黄金、铂金配色，第四项沿用银白玻璃色，方便对比是否更接近原 UI。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-950 px-6 py-8">
        <style>{`
          .ui-138-action-glass {
            --bg: rgba(255, 255, 255, 0.06);
            --text: #e5e5e5;
            position: relative;
            display: grid;
            width: 282px;
            height: 112px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            overflow: hidden;
            border-radius: 1rem;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.2),
              inset -1px -1px 6px rgba(0, 0, 0, 0.3),
              0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .ui-138-action-glass input {
            display: none;
          }
          .ui-138-action-glass label {
            position: relative;
            z-index: 2;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-right: 1px solid rgba(255, 255, 255, 0.16);
            border-bottom: 1px solid rgba(255, 255, 255, 0.16);
            color: var(--text);
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out;
          }
          .ui-138-action-glass label:nth-of-type(2),
          .ui-138-action-glass label:nth-of-type(4) {
            border-right: 0;
          }
          .ui-138-action-glass label:nth-of-type(3),
          .ui-138-action-glass label:nth-of-type(4) {
            border-bottom: 0;
          }
          .ui-138-action-glass label:hover,
          .ui-138-action-glass input:checked + label {
            color: #ffffff;
          }
          .ui-138-glider {
            position: absolute;
            z-index: 1;
            width: 50%;
            height: 50%;
            border-radius: 1rem;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-138-rename:checked ~ .ui-138-glider {
            transform: translate(0%, 0%);
            background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
            box-shadow:
              0 0 18px rgba(192, 192, 192, 0.5),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
          #ui-138-cover:checked ~ .ui-138-glider {
            transform: translate(100%, 0%);
            background: linear-gradient(135deg, #ffd70055, #ffcc00);
            box-shadow:
              0 0 18px rgba(255, 215, 0, 0.5),
              0 0 10px rgba(255, 235, 150, 0.4) inset;
          }
          #ui-138-export:checked ~ .ui-138-glider {
            transform: translate(0%, 100%);
            background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
            box-shadow:
              0 0 18px rgba(160, 216, 255, 0.5),
              0 0 10px rgba(200, 240, 255, 0.4) inset;
          }
          #ui-138-delete:checked ~ .ui-138-glider {
            transform: translate(100%, 100%);
            background: linear-gradient(135deg, #ffffff44, #f5f5f5);
            box-shadow:
              0 0 18px rgba(255, 255, 255, 0.35),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
        `}</style>
        <div className="ui-138-action-glass">
          <input type="radio" name="ui-138-actions" id="ui-138-rename" defaultChecked />
          <label htmlFor="ui-138-rename">重命名</label>
          <input type="radio" name="ui-138-actions" id="ui-138-cover" />
          <label htmlFor="ui-138-cover">封面</label>
          <input type="radio" name="ui-138-actions" id="ui-138-export" />
          <label htmlFor="ui-138-export">导出</label>
          <input type="radio" name="ui-138-actions" id="ui-138-delete" />
          <label htmlFor="ui-138-delete">删除</label>
          <div className="ui-138-glider" />
        </div>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          original color test: silver / gold / platinum / white glass
        </code>
      </div>
    ),
  },
  {
    id: 'UI-139',
    group: '作品',
    name: '作品卡片按钮方案 B',
    usage: '作品卡片底部 3 列 x 2 行固定按钮，最多显示 6 个常用入口；剩余操作集中到“更多”白底弹层，适合以后扩展到 9 个按钮。',
    preview: (
      <div className="w-[320px] rounded-[28px] border border-slate-100 bg-white p-4 shadow-xl">
        <div className="flex h-[190px] items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-50 via-white to-cyan-50">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-[#08AACE] shadow-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="mt-3 text-sm font-black text-slate-700">封面预览</div>
          </div>
        </div>
        <div className="px-1 pb-1 pt-4">
          <h3 className="truncate text-base font-black text-slate-900">月落长歌</h3>
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>128000 字</span>
            <span>2026-05-27</span>
          </div>
          <div className="relative mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {['继续阅读', '作品信息', '打开检查', '重命名', '封面', '更多'].map((action, index) => (
                <button
                  key={action}
                  type="button"
                  className={`h-9 min-w-0 rounded-xl px-2 text-xs font-black transition-all ${
                    index === 0
                      ? 'bg-[#08AACE] text-white shadow-[0_8px_18px_rgba(8,170,206,0.25)]'
                      : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]'
                  }`}
                >
                  <span className="block truncate">{action}</span>
                </button>
              ))}
            </div>
            <div className="absolute right-1.5 top-[calc(100%+8px)] z-20 w-[150px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl">
              {['导出 txt', '关联小说', '复制书名'].map((action) => (
                <button key={action} type="button" className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]">
                  {action}
                </button>
              ))}
              <button type="button" className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-red-500 hover:bg-red-50">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-140',
    group: '输入框',
    name: '固定顶标圆角输入框',
    usage: '设定名、角色名、模块名等短字段。标签固定压在上边框并用白底切出缺口，输入区保持干净。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-6">
        <style>{`
          .ui-140-field {
            position: relative;
            width: 220px;
            height: 74px;
          }
          .ui-140-field input {
            width: 100%;
            height: 66px;
            box-sizing: border-box;
            border: 2px solid #111827;
            border-radius: 23px;
            background: #ffffff;
            padding: 0 1.25rem;
            font-size: 16px;
            color: #111827;
            outline: none;
          }
          .ui-140-field label {
            position: absolute;
            left: 22px;
            top: -1px;
            transform: translateY(-50%);
            background: #ffffff;
            padding: 0 0.35rem;
            color: #111827;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
            pointer-events: none;
          }
        `}</style>
        <div className="ui-140-field">
          <input readOnly aria-label="设定名" />
          <label>设定名</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          fixed label cuts a small white gap into the dark rounded border
        </code>
      </div>
    ),
  },
  {
    id: 'UI-141',
    group: '输入框',
    name: '边框内嵌工具文本框',
    usage: '设定预览、角色背景、角色状态、脑洞预览、脑洞输出框。左上角固定标签，左下角放字号，右下角放字数统计。',
    preview: (
      <div className="flex w-full justify-center py-6">
        <style>{`
          .ui-141-field-wrap {
            position: relative;
            width: min(560px, 100%);
            height: 260px;
          }
          .ui-141-field {
            position: relative;
            width: 100%;
            height: 100%;
          }
          .ui-141-field textarea {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            resize: none;
            border: 2px solid #111827;
            border-radius: 23px;
            background: #ffffff;
            padding: 1.35rem 1.25rem 3rem;
            font-size: 16px;
            line-height: 1.75;
            color: #111827;
            outline: none;
          }
          .ui-141-field label {
            position: absolute;
            left: 22px;
            top: 0;
            transform: translateY(-50%);
            background: #ffffff;
            padding: 0 0.35rem;
            color: #111827;
            font-size: 16px;
            font-weight: 500;
            line-height: 20px;
            pointer-events: none;
          }
          .ui-141-tool {
            position: absolute;
            left: 38px;
            bottom: 0;
            z-index: 2;
            transform: translateY(50%);
            background: #ffffff;
          }
          .ui-141-count {
            position: absolute;
            right: 20px;
            bottom: 0;
            z-index: 2;
            transform: translateY(50%);
            background: #ffffff;
            padding: 0 7px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 800;
            line-height: 20px;
          }
        `}</style>
        <div className="ui-141-field-wrap">
          <div className="ui-141-field">
            <textarea readOnly value="这里是带边框工具槽的长文本区域。字号放在左下角，字数统计放在右下角，主内容区域保持干净。" />
            <label>设定预览</label>
            <span className="ui-141-count">46 字</span>
          </div>
          <div className="ui-141-tool">
            <FontSizeStepper value={16} min={12} max={28} onChange={() => undefined} ariaLabel="边框内嵌字号" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-142',
    group: '选择框',
    name: '下拉内嵌管理选择框',
    usage: '模型选择、提示词选择等需要在同一行保留“管理”入口的下拉框。右侧管理按钮嵌入边框内部，减少额外按钮挤占空间。',
    preview: (
      <div className="flex justify-center py-6">
        <div className="w-[320px]">
          <div className="relative pt-2">
            <span className="xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 text-sm font-black leading-none text-slate-700">模型</span>
            <div className="flex h-14 overflow-hidden rounded-[24px] border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
              <button type="button" className="min-w-0 flex-1 px-5 pt-1 text-left text-lg font-black text-slate-950">
                <span className="block truncate">DS-v4-flash</span>
              </button>
              <button type="button" className="grid w-11 shrink-0 place-items-center text-slate-700">⌄</button>
              <button type="button" className="w-14 shrink-0 border-l border-[#08AACE]/40 bg-[#EAF9FD] text-sm font-black text-[#078fb0]">管理</button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-143',
    group: '输入框',
    name: 'AI 输入框右侧图标按钮',
    usage: 'AI 用户输入框的发送、停止等贴边动作按钮。图标按钮并入输入框右侧，按钮之间用细分割线区分，避免输入框右边另起一组按钮。',
    preview: (
      <div className="flex justify-center py-6">
        <div className="flex h-14 w-[420px] max-w-full overflow-hidden rounded-2xl border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
          <div className="flex min-w-0 flex-1 items-center px-4 text-sm font-bold text-slate-400">请输入要求</div>
          <button type="button" className="grid w-12 shrink-0 place-items-center border-l border-[#08AACE]/40 text-[#08AACE]">
            <span className="text-lg leading-none">↑</span>
          </button>
          <button type="button" className="grid w-12 shrink-0 place-items-center border-l border-red-200 bg-red-500 text-white">
            <span className="h-3 w-3 rounded-sm bg-current" />
          </button>
        </div>
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
    plain: '梗概、细纲、设定和某一章绑定，点章节时显示对应内容。',
    tech: 'Chapter-linked state / selected chapter id',
  },
  {
    id: 'T-19',
    name: '分裂按钮',
    plain: '一个按钮分成两个可点击区域：左边执行主操作，右边放锁定、下拉或更多设置，适合防止误触重要功能。',
    tech: 'Split button / compound button / adjacent action',
  },
  {
    id: 'T-20',
    name: '边框嵌入式透明背板',
    plain: '文字、字数、清空、章节信息这些内容压在边框线上时，不要加白底块，用透明背板和文字描边把边框线自然遮住。',
    tech: 'xy-border-embedded-transparent-backplate / transparent border-embedded label / text stroke mask',
  },
];

function TechPreview({ item }: { item: TechItem }) {
  const previewShell = 'min-h-[86px] rounded-2xl border border-slate-100 bg-white p-3';

  if (item.id === 'T-01') {
    return (
      <div className={`${previewShell} grid grid-cols-[1fr_12px_1fr] items-stretch gap-2 bg-slate-50`}>
        <div className="rounded-xl bg-white p-2 text-xs font-black text-slate-500">左侧栏</div>
        <div className="flex items-center justify-center rounded-full bg-[#E6F7FB] text-[#08AACE]">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="rounded-xl bg-white p-2 text-xs font-black text-slate-500">正文区</div>
      </div>
    );
  }

  if (item.id === 'T-02') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        <div className="absolute left-4 top-4 h-12 w-24 rounded-xl border-2 border-[#08AACE] bg-white shadow-sm" />
        <div className="absolute bottom-4 right-4 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-[#08AACE]" />
      </div>
    );
  }

  if (item.id === 'T-03') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="absolute h-11 w-28 rounded-xl border border-slate-200 bg-white shadow-sm"
            style={{ left: 18 + index * 18, top: 18 + index * 10, zIndex: index }}
          />
        ))}
        <span className="absolute bottom-3 right-3 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black text-white">Esc</span>
      </div>
    );
  }

  if (item.id === 'T-04') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-900/10`}>
        <div className="h-12 w-28 rounded-xl bg-white p-2 text-center text-xs font-black text-slate-700 shadow-sm">弹窗</div>
      </div>
    );
  }

  if (item.id === 'T-05') {
    return (
      <div className={`${previewShell} overflow-hidden bg-slate-50 p-0`}>
        <div className="grid grid-cols-2 bg-[#E6F7FB] px-3 py-2 text-[11px] font-black text-[#078fb0]">
          <span>原文</span><span>替换为</span>
        </div>
        {[1, 2, 3].map((row) => <div key={row} className="mx-3 border-b border-slate-100 py-1.5 text-xs text-slate-400">滚动内容 {row}</div>)}
      </div>
    );
  }

  if (item.id === 'T-06') {
    return (
      <div className={`${previewShell} bg-slate-50`}>
        <div className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 py-2 text-xs font-bold text-slate-500">输入一行</div>
        <div className="mt-2 h-12 rounded-xl border border-[#08AACE] bg-white px-3 py-2 text-xs font-bold text-slate-500">内容变多后自动变高</div>
      </div>
    );
  }

  if (item.id === 'T-07') {
    return (
      <div className={`${previewShell} bg-slate-50`}>
        <div className="h-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">
          只读内容，可以选中复制
        </div>
      </div>
    );
  }

  if (item.id === 'T-08') {
    return (
      <div className={`${previewShell} flex items-center justify-center gap-3 bg-slate-50`}>
        <Settings className="h-5 w-5 text-[#08AACE]" />
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">已记住</span>
      </div>
    );
  }

  if (item.id === 'T-09') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {['设定', '角色', '脑洞'].map((tab) => (
            <span key={tab} className={`rounded-lg px-3 py-1.5 text-xs font-black ${tab === '角色' ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-400'}`}>{tab}</span>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'T-10') {
    return (
      <div className={`${previewShell} flex items-center gap-2 bg-slate-50`}>
        <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">角色A</div>
        <span className="text-[#08AACE]">→</span>
        <div className="rounded-xl border border-dashed border-[#08AACE] px-3 py-2 text-xs font-black text-[#08AACE]">新分类</div>
      </div>
    );
  }

  if (item.id === 'T-11') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">右键章节</div>
        <div className="absolute bottom-3 right-3 w-24 overflow-hidden rounded-xl border border-slate-100 bg-white text-xs font-black text-slate-600 shadow-lg">
          <div className="px-3 py-1.5">修改</div>
          <div className="px-3 py-1.5 text-red-500">删除</div>
        </div>
      </div>
    );
  }

  if (item.id === 'T-12') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
        <div className="relative h-12 w-36">
          <div className="absolute left-2 top-6 h-1 w-28 rounded-full bg-[#08AACE]" />
          <div className="absolute left-1 top-4 h-5 w-5 rounded-full bg-[#08AACE]" />
          <span className="absolute right-0 top-2 text-xl font-black text-[#08AACE]">←</span>
        </div>
      </div>
    );
  }

  if (item.id === 'T-13') {
    return (
      <div className={`${previewShell} grid grid-cols-3 items-center gap-2 bg-slate-50 text-center text-[11px] font-black text-slate-600`}>
        <div className="rounded-xl bg-white py-2 shadow-sm">输入</div>
        <div className="rounded-xl bg-[#E6F7FB] py-2 text-[#08AACE]">AI</div>
        <div className="rounded-xl bg-white py-2 shadow-sm">结果</div>
      </div>
    );
  }

  if (item.id === 'T-14') {
    return (
      <div className={`${previewShell} grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-slate-50 text-[11px] font-black`}>
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">设定库</div>
        <Search className="h-4 w-4 text-[#08AACE]" />
        <div className="rounded-xl bg-[#E6F7FB] p-2 text-[#078fb0]">相关上下文</div>
      </div>
    );
  }

  if (item.id === 'T-15') {
    return (
      <div className={`${previewShell} flex items-center justify-center gap-3 bg-slate-50`}>
        <Database className="h-7 w-7 text-[#08AACE]" />
        <div className="text-xs font-black text-slate-600">本地 PostgreSQL</div>
      </div>
    );
  }

  if (item.id === 'T-16') {
    return (
      <div className={`${previewShell} flex items-center justify-center gap-2 bg-slate-50 text-xs font-black text-slate-600`}>
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">App</div>
        <span>+</span>
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">资源</div>
      </div>
    );
  }

  if (item.id === 'T-17') {
    return (
      <div className={`${previewShell} flex justify-end bg-slate-50 pr-4`}>
        <div className="h-full w-2 rounded-full bg-transparent">
          <div className="mt-4 h-9 w-2 rounded-full bg-[#08AACE]" />
        </div>
      </div>
    );
  }

  if (item.id === 'T-18') {
    return (
      <div className={`${previewShell} grid grid-cols-[70px_1fr] gap-2 bg-slate-50 text-xs font-black`}>
        <div className="rounded-xl bg-[#08AACE] p-2 text-white">第3章</div>
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">对应梗概 / 细纲</div>
      </div>
    );
  }

  if (item.id === 'T-20') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50 px-5`}>
        <div className="relative h-20 w-full rounded-[22px] border-2 border-slate-900 bg-white">
          <span className="xy-border-embedded-transparent-backplate absolute left-6 top-0 -translate-y-1/2 text-xs font-black leading-5 text-slate-950">
            第1章 我只是想修个水管 正文：<span className="text-[#08AACE]">3056</span><span className="text-slate-400"> 字</span>
          </span>
          <span className="xy-border-embedded-transparent-backplate absolute bottom-0 right-5 translate-y-1/2 text-[11px] font-black text-[#08AACE]">
            89 字
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
      <div className="inline-flex overflow-hidden rounded-xl border border-[#08AACE] bg-white text-xs font-black">
        <button className="px-3 py-2 text-[#08AACE]">复制</button>
        <button className="border-l border-[#08AACE] bg-[#08AACE] px-3 py-2 text-white">优化</button>
      </div>
    </div>
  );
}

function TechDictionaryCard({ item, action, tone = 'soft' }: { item: TechItem; action: ReactNode; tone?: 'soft' | 'white' }) {
  const articleBg = tone === 'white' ? 'bg-white' : 'bg-slate-50';
  const codeBg = tone === 'white' ? 'bg-slate-50' : 'bg-white';

  return (
    <article id={`catalog-${item.id}`} className={`scroll-mt-7 rounded-xl border border-slate-100 ${articleBg} p-4`}>
      <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)_320px_auto] xl:items-start">
        <NumberPill id={item.id} />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900">
            {item.id === 'T-01' ? <GripVertical className="h-4 w-4 shrink-0 text-slate-400" /> : <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />}
            <span className="truncate">{item.name}</span>
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{item.plain}</div>
        </div>
        <div className="min-w-0">
          <TechPreview item={item} />
        </div>
        <div className="flex justify-end xl:pt-0.5">{action}</div>
      </div>
      <code className={`mt-3 block rounded-lg ${codeBg} px-3 py-2 text-xs font-bold leading-5 text-slate-500`}>{item.tech}</code>
    </article>
  );
}

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

const DEFAULT_UI_SPECS: UiSpecs = {
  width: 120,
  height: 40,
  fontSize: 14,
  radius: 12,
  paddingX: 20,
  gap: 8,
  iconSize: 16,
  plusMinusSize: 22,
};

const UI_SPEC_DEFAULTS_STORAGE_KEY = 'xinyuexia_software_ui_catalog_spec_defaults_v1';

function readUiSpecDefaults() {
  try {
    const raw = localStorage.getItem(UI_SPEC_DEFAULTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Record<string, Partial<UiSpecs>> : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeUiSpecDefaults(value: Record<string, Partial<UiSpecs>>) {
  localStorage.setItem(UI_SPEC_DEFAULTS_STORAGE_KEY, JSON.stringify(value));
}

function readCatalogMarks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CATALOG_MARKS_STORAGE_KEY) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, CatalogMark>>((acc, [key, value]) => {
      if (value === 'rare') acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function writeCatalogMarks(value: Record<string, CatalogMark>) {
  localStorage.setItem(CATALOG_MARKS_STORAGE_KEY, JSON.stringify(value));
}

function readCatalogCollection() {
  const defaults = DEFAULT_CATALOG_COLLECTION_IDS.reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
  try {
    const parsed = JSON.parse(localStorage.getItem(CATALOG_COLLECTION_STORAGE_KEY) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return defaults;
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>((acc, [key, value]) => {
      if (typeof value === 'boolean') acc[key] = value;
      return acc;
    }, { ...defaults });
  } catch {
    return defaults;
  }
}

function writeCatalogCollection(value: Record<string, boolean>) {
  localStorage.setItem(CATALOG_COLLECTION_STORAGE_KEY, JSON.stringify(value));
}

function readCollapsedRecord(storageKey: string, fallback: Record<string, boolean> = {}) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as unknown;
    if (!parsed || typeof parsed !== 'object') return fallback;
    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>((acc, [key, value]) => {
      if (typeof value === 'boolean') acc[key] = value;
      return acc;
    }, { ...fallback });
  } catch {
    return fallback;
  }
}

function writeCollapsedRecord(storageKey: string, value: Record<string, boolean>) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function getBaseSpecs(item: UiSample): UiSpecs {
  const groupDefaults: Partial<Record<string, Partial<UiSpecs>>> = {
    按钮: { width: 120, height: 40, fontSize: 14, radius: 12, paddingX: 20, iconSize: 16 },
    字号: { width: 184, height: 46, fontSize: 14, radius: 16, paddingX: 16, gap: 18, plusMinusSize: 24 },
    标签: { width: 220, height: 40, fontSize: 16, radius: 15, paddingX: 20, gap: 6 },
    导航: { width: 260, height: 44, fontSize: 14, radius: 12, paddingX: 12, gap: 8, iconSize: 14 },
    AI: { width: 300, height: 44, fontSize: 14, radius: 12, paddingX: 12, gap: 8 },
  };
  return {
    ...DEFAULT_UI_SPECS,
    ...(groupDefaults[item.group] ?? {}),
    ...(item.specs ?? {}),
  };
}

function NumberSpecInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);
  const helpText = SPEC_HELP_TEXT[label] ?? '这个数值会影响当前 UI 样式预览和以后复用时的规格。';

  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [isEditing, value]);

  return (
    <label className="min-w-0 text-[11px] font-bold text-slate-400" title={helpText}>
      <span className="cursor-help border-b border-dotted border-slate-300">{label}</span>
      <input
        inputMode="numeric"
        value={draft}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (next.trim() === '') return;
          const numeric = Number(next);
          if (!Number.isFinite(numeric)) return;
          onChange(Math.min(max, Math.max(min, numeric)));
        }}
        onBlur={() => {
          setIsEditing(false);
          if (draft.trim() === '') setDraft(String(value));
        }}
        className="mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 outline-none focus:border-brand"
      />
    </label>
  );
}

const SPEC_HELP_TEXT: Record<string, string> = {
  宽: '控制这个 UI 的整体宽度。比如按钮、输入框、字号调节器会变宽或变窄。',
  高: '控制这个 UI 的整体高度。数值越大，按钮或输入框越高。',
  字号: '控制文字大小。只影响这个 UI 里显示文字的大小，不会改变功能逻辑。',
  圆角: '控制边角圆润程度。0 是直角，数值越大越圆。',
  左右距: '控制文字或图标到左右边缘的距离。数值越大，内容离边缘越远。',
  间隔: '控制内部元素之间的距离。比如 -、数字、+ 之间的空隙。',
  图标: '控制图标大小。只影响图标显示尺寸。',
  '+/-': '控制加号和减号的大小，常用于字号放大缩小按钮。',
};

function SpecPill({ label, value }: { label: string; value: string }) {
  const helpText = SPEC_HELP_TEXT[label] ?? '这个数值会影响当前 UI 样式预览和以后复用时的规格。';
  return (
    <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500" title={helpText}>
      <span className="cursor-help border-b border-dotted border-slate-300">{label}</span> <b className="text-[#08AACE]">{value}</b>
    </span>
  );
}

function RenderSpecPreview({ item, specs }: { item: UiSample; specs: UiSpecs }) {
  const commonStyle = {
    width: specs.width,
    height: specs.height,
    boxSizing: 'content-box' as const,
    borderRadius: specs.radius,
    paddingLeft: specs.paddingX,
    paddingRight: specs.paddingX,
    fontSize: specs.fontSize,
    gap: specs.gap,
  };

  if (item.group === '字号' || item.name.includes('字号')) {
    return (
      <div
        className="inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm"
        style={commonStyle}
      >
        <span style={{ fontSize: specs.plusMinusSize, lineHeight: 1, fontWeight: 900 }}>-</span>
        <span className="min-w-8 text-center font-black text-[#08AACE]" style={{ fontSize: specs.fontSize }}>17</span>
        <span style={{ fontSize: specs.plusMinusSize, lineHeight: 1, fontWeight: 900 }}>+</span>
      </div>
    );
  }

  return (
    <button
      className="inline-flex items-center justify-center bg-[#08AACE] font-bold text-white shadow-sm"
      style={commonStyle}
    >
      {item.group === '按钮' && item.id.includes('06') ? <Settings style={{ width: specs.iconSize, height: specs.iconSize }} /> : item.name.slice(0, 4)}
    </button>
  );
}

const MANUAL_UI_TYPE_ORDER = ['Button', 'Switch', 'Checkbox', 'Input', 'Radio', 'Card', 'Loader', '其他'] as const;

function getManualUiType(item: UiSample) {
  if (item.id === 'UI-102') return 'Radio';
  const matchedType = MANUAL_UI_TYPE_ORDER.find((type) => type !== '其他' && item.name.includes(type));
  return matchedType ?? '其他';
}

type SoftwareUiCatalogPageProps = {
  embedded?: boolean;
  onClose?: () => void;
};

export function SoftwareUiCatalogPage({ embedded = false, onClose }: SoftwareUiCatalogPageProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CatalogTab>('ui');
  const [collapsedCatalogNavGroups, setCollapsedCatalogNavGroups] = useState<Record<string, boolean>>(() => readCollapsedRecord(CATALOG_NAV_COLLAPSED_STORAGE_KEY));
  const [collapsedCatalogContentGroups, setCollapsedCatalogContentGroups] = useState<Record<string, boolean>>(() => (
    readCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, { manual: true })
  ));
  const [catalogSearch, setCatalogSearch] = useState('');
  const [uiSpecDefaults, setUiSpecDefaults] = useState<Record<string, Partial<UiSpecs>>>(() => readUiSpecDefaults());
  const [uiSpecOverrides, setUiSpecOverrides] = useState<Record<string, Partial<UiSpecs>>>({});
  const [activeSpecItemId, setActiveSpecItemId] = useState<string | null>(null);
  const [catalogMarks, setCatalogMarks] = useState<Record<string, CatalogMark>>(() => readCatalogMarks());
  const [catalogCollection, setCatalogCollection] = useState<Record<string, boolean>>(() => readCatalogCollection());
  const normalizedSearch = catalogSearch.trim().toLowerCase();
  const matchesCatalogSearch = (parts: Array<string | undefined>) => {
    if (!normalizedSearch) return true;
    return parts.some((part) => part?.toLowerCase().includes(normalizedSearch));
  };
  const filteredFontSamples = fontSamples.filter((item) => matchesCatalogSearch([item.id, item.name, item.usage, item.sample]));
  const filteredColorSamples = colorSamples.filter((item) => matchesCatalogSearch([item.id, item.name, item.usage, item.value]));
  const manualUiSamples = uiSamples.filter((item) => item.id === 'UI-102' || item.group === '手动上传');
  const landingPreviewSamples = LANDING_PREVIEW_SELECTED_IDS
    .map((id) => manualUiSamples.find((item) => item.id === id))
    .filter((item): item is UiSample => Boolean(item));
  const filteredManualUiSamples = manualUiSamples.filter((item) => matchesCatalogSearch([item.id, item.name, item.group, item.usage]));
  const filteredLandingPreviewSamples = landingPreviewSamples.filter((item) => matchesCatalogSearch([item.id, item.name, item.group, item.usage, 'UI 落地预览 已勾选']));
  const manualUiGroups = MANUAL_UI_TYPE_ORDER
    .map((type) => ({
      type,
      items: filteredManualUiSamples.filter((item) => getManualUiType(item) === type),
    }))
    .filter((group) => group.items.length > 0);
  const standardUiSamples = uiSamples.filter((item) => item.id !== 'UI-102' && item.group !== '手动上传');
  const filteredStandardUiSamples = standardUiSamples.filter((item) => matchesCatalogSearch([item.id, item.name, item.group, item.usage]));
  const filteredTechItems = techItems.filter((item) => matchesCatalogSearch([item.id, item.name, item.plain, item.tech]));
  const collectedFontSamples = fontSamples.filter((item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.usage, item.sample]));
  const collectedColorSamples = colorSamples.filter((item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.usage, item.value]));
  const collectedStandardUiSamples = standardUiSamples.filter((item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.group, item.usage]));
  const collectedManualUiSamples = manualUiSamples.filter((item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.group, item.usage]));
  const collectedTechItems = techItems.filter((item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.plain, item.tech]));
  const collectedCatalogItems = useMemo(() => {
    const matchesCollectionSearch = (parts: Array<string | undefined>) => {
      if (!normalizedSearch) return true;
      return parts.some((part) => part?.toLowerCase().includes(normalizedSearch));
    };
    const collectedStandardSamples = uiSamples.filter((item) => (
      item.id !== 'UI-102' &&
      item.group !== '手动上传' &&
      catalogCollection[item.id] &&
      matchesCollectionSearch([item.id, item.name, item.group, item.usage])
    ));
    const collectedManualSamples = uiSamples.filter((item) => (
      (item.id === 'UI-102' || item.group === '手动上传') &&
      catalogCollection[item.id] &&
      matchesCollectionSearch([item.id, item.name, item.group, item.usage])
    ));

    return [
      ...fontSamples.filter((item) => catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.usage, item.sample]))
        .map((item) => ({ id: item.id, label: item.name, group: '字体设置', tab: 'collection' as CatalogTab })),
      ...colorSamples.filter((item) => catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.usage, item.value]))
        .map((item) => ({ id: item.id, label: item.name, group: '颜色记录', tab: 'collection' as CatalogTab })),
      ...collectedStandardSamples.map((item) => ({ id: item.id, label: item.name, group: item.group, tab: 'collection' as CatalogTab })),
      ...collectedManualSamples.map((item) => ({ id: item.id, label: item.name, group: getManualUiType(item), tab: 'collection' as CatalogTab })),
      ...techItems.filter((item) => catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.plain, item.tech]))
        .map((item) => ({ id: item.id, label: item.name, group: '技术词典', tab: 'collection' as CatalogTab })),
    ];
  }, [catalogCollection, normalizedSearch]);
  const collectedTotalCount = collectedCatalogItems.length;
  const groups = Array.from(new Set(filteredStandardUiSamples.map((item) => item.group)));
  const catalogNavItems = useMemo(() => {
    if (normalizedSearch) {
      return [
        ...filteredFontSamples.map((item) => ({ id: item.id, label: item.name, group: '字体设置', tab: 'ui' as CatalogTab })),
        ...filteredColorSamples.map((item) => ({ id: item.id, label: item.name, group: '颜色记录', tab: 'ui' as CatalogTab })),
        ...filteredStandardUiSamples.map((item) => ({ id: item.id, label: item.name, group: item.group, tab: 'ui' as CatalogTab })),
        ...filteredManualUiSamples.map((item) => ({ id: item.id, label: item.name, group: getManualUiType(item), tab: 'ui' as CatalogTab })),
        ...filteredTechItems.map((item) => ({ id: item.id, label: item.name, group: '技术词典', tab: 'tech' as CatalogTab })),
      ];
    }
    if (activeTab === 'tech') {
      return filteredTechItems.map((item) => ({ id: item.id, label: item.name, group: '技术词典', tab: 'tech' as CatalogTab }));
    }
    if (activeTab === 'collection') {
      return collectedCatalogItems;
    }
    return [
      ...filteredFontSamples.map((item) => ({ id: item.id, label: item.name, group: '字体设置', tab: 'ui' as CatalogTab })),
      ...filteredColorSamples.map((item) => ({ id: item.id, label: item.name, group: '颜色记录', tab: 'ui' as CatalogTab })),
      ...filteredStandardUiSamples.map((item) => ({ id: item.id, label: item.name, group: item.group, tab: 'ui' as CatalogTab })),
      ...filteredManualUiSamples.map((item) => ({ id: item.id, label: item.name, group: getManualUiType(item), tab: 'ui' as CatalogTab })),
    ];
  }, [activeTab, collectedCatalogItems, filteredColorSamples, filteredFontSamples, filteredManualUiSamples, filteredStandardUiSamples, filteredTechItems, normalizedSearch]);

  const catalogNavGroups = useMemo(() => {
    const groupMap = new Map<string, typeof catalogNavItems>();
    catalogNavItems.forEach((item) => {
      const groupLabel = item.group === '按钮' ? '按钮样式' : item.group;
      groupMap.set(groupLabel, [...(groupMap.get(groupLabel) ?? []), item]);
    });
    return Array.from(groupMap.entries()).map(([title, items]) => ({ title, items }));
  }, [catalogNavItems]);

  const toggleCatalogNavGroup = (title: string) => {
    setCollapsedCatalogNavGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      writeCollapsedRecord(CATALOG_NAV_COLLAPSED_STORAGE_KEY, next);
      return next;
    });
  };

  const toggleCatalogContentGroup = (key: string) => {
    setCollapsedCatalogContentGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
      return next;
    });
  };

  const scrollToCatalogItem = (id: string, tab: CatalogTab) => {
    let shouldDeferScroll = false;
    if (manualUiSamples.some((item) => item.id === id)) {
      setCollapsedCatalogContentGroups((prev) => {
        if (prev.manual === false) return prev;
        shouldDeferScroll = true;
        const next = { ...prev, manual: false };
        writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
        return next;
      });
    }
    const standardItem = standardUiSamples.find((item) => item.id === id);
    if (standardItem && collapsedCatalogContentGroups[standardItem.group]) {
      shouldDeferScroll = true;
      setCollapsedCatalogContentGroups((prev) => {
        const next = { ...prev, [standardItem.group]: false };
        writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
        return next;
      });
    }
    const scroll = () => document.getElementById(`catalog-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (activeTab !== tab) {
      setActiveTab(tab);
      window.setTimeout(scroll, 0);
      return;
    }
    if (shouldDeferScroll) {
      window.setTimeout(scroll, 0);
      return;
    }
    scroll();
  };

  const updateUiSpec = (id: string, key: keyof UiSpecs, value: number) => {
    setUiSpecOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const restoreUiSpecDefault = (id: string) => {
    setUiSpecOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveUiSpecDefault = (id: string, specs: UiSpecs) => {
    const next = { ...uiSpecDefaults, [id]: specs };
    setUiSpecDefaults(next);
    writeUiSpecDefaults(next);
    restoreUiSpecDefault(id);
  };

  const setCatalogMark = (id: string, mark: CatalogMark) => {
    setCatalogMarks((prev) => {
      const next = { ...prev };
      if (next[id] === mark) delete next[id];
      else next[id] = mark;
      writeCatalogMarks(next);
      return next;
    });
  };

  const toggleCatalogCollection = (id: string) => {
    setCatalogCollection((prev) => {
      const next = { ...prev };
      if (next[id]) {
        if (DEFAULT_CATALOG_COLLECTION_IDS.includes(id)) next[id] = false;
        else delete next[id];
      }
      else next[id] = true;
      writeCatalogCollection(next);
      return next;
    });
  };

  const renderCollectionButton = (id: string) => {
    const isCollected = Boolean(catalogCollection[id]);
    return (
      <button
        type="button"
        onClick={() => toggleCatalogCollection(id)}
        className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-black transition-colors ${
          isCollected ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:text-rose-500'
        }`}
        title={isCollected ? '取消收藏' : '收藏'}
      >
        <Heart className={`h-3 w-3 ${isCollected ? 'fill-current' : ''}`} />
        收藏
      </button>
    );
  };

  const renderMarkControls = (id: string) => {
    const mark = catalogMarks[id];
    return (
      <div className="flex shrink-0 items-center gap-1">
        {renderCollectionButton(id)}
        <button
          type="button"
          onClick={() => setCatalogMark(id, 'rare')}
          className={`h-7 rounded-full border px-2 text-[11px] font-black transition-colors ${
            mark === 'rare' ? 'border-slate-300 bg-slate-100 text-slate-600' : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
          }`}
          title="标记为不常用"
        >
          不常用
        </button>
      </div>
    );
  };

  const activeSpecItem = activeSpecItemId ? standardUiSamples.find((item) => item.id === activeSpecItemId) : undefined;
  const activeSpecs = activeSpecItem
    ? { ...getBaseSpecs(activeSpecItem), ...(uiSpecDefaults[activeSpecItem.id] ?? {}), ...(uiSpecOverrides[activeSpecItem.id] ?? {}) }
    : null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">UI库</h1>
          <p className="mt-0.5 text-xs text-slate-400">以后可以直接说编号，例如“用 UI-18 的分割线”或“用 T-01 那个技术”。</p>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 pl-6">
          <label className="xy-ui132-search w-[min(560px,52vw)] max-w-[560px]">
            <Search />
            <input
              type="search"
              value={catalogSearch}
              onChange={(event) => setCatalogSearch(event.target.value)}
              placeholder="搜索编号、名称，例如 UI-138"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="清空搜索"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <button
            onClick={() => {
              if (embedded) {
                onClose?.();
                return;
              }
              navigate('/test-collection');
            }}
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          >
            {embedded ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {embedded ? '关闭' : '返回测试'}
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-7">
        <div className="grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-5">
          <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="mb-3 grid grid-cols-3 rounded-[18px] bg-slate-100 p-1.5">
              <button
                onClick={() => setActiveTab('ui')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'ui' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                UI
              </button>
              <button
                onClick={() => setActiveTab('tech')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'tech' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                技术词典
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`h-10 rounded-[15px] text-sm font-bold ${activeTab === 'collection' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
              >
                收藏
              </button>
            </div>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <div className="text-sm font-black text-slate-900">编号导航</div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">{catalogNavItems.length}</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto pb-8 pr-1">
              {catalogNavItems.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-4 text-xs font-bold leading-5 text-slate-400">没有匹配的编号。</div>
              ) : (
                catalogNavGroups.map((group) => {
                  const isCollapsed = collapsedCatalogNavGroups[group.title] ?? false;
                  return (
                    <div key={group.title} className="rounded-xl border border-slate-100 bg-slate-50/70 p-1">
                      <button
                        type="button"
                        onClick={() => toggleCatalogNavGroup(group.title)}
                        className="flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-xs font-black text-slate-700 transition-colors hover:bg-white hover:text-[#08AACE]"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                          <span className="truncate">{group.title}</span>
                        </span>
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-400">{group.items.length}</span>
                      </button>
                      {!isCollapsed && (
                        <div className="mt-1 space-y-0.5">
                          {group.items.map((item) => (
                            <button
                              key={`${group.title}-${item.id}`}
                              type="button"
                              onClick={() => scrollToCatalogItem(item.id, item.tab)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sky-50 hover:text-[#08AACE]"
                            >
                              <span className="w-12 shrink-0 text-xs font-black text-[#08AACE]">{item.id}</span>
                              <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-600">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <div className="editor-scrollbar min-w-0 overflow-y-auto pr-1">
        {activeTab === 'ui' ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <SectionTitle icon={<Type className="h-5 w-5 text-brand" />} title="字体设置" desc="全软件常用字号和字重，之后按 F 编号复用。" />
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                {filteredFontSamples.map((item) => (
                  <div id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <NumberPill id={item.id} />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">{item.name}</span>
                        {renderCollectionButton(item.id)}
                      </div>
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
                {filteredColorSamples.map((item) => (
                  <div id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <div className={`flex h-16 items-center justify-center ${item.textClass ?? 'text-white'}`} style={{ backgroundColor: item.value }}>
                      <span className="text-xl font-black drop-shadow-sm">{item.id}</span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-bold text-slate-400">{item.value}</code>
                          {renderCollectionButton(item.id)}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {groups.map((group) => {
              const isContentCollapsed = collapsedCatalogContentGroups[group] ?? false;
              return (
              <section key={group} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <SectionTitle
                    icon={group === 'AI' ? <MessageSquare className="h-5 w-5 text-brand" /> : <Sparkles className="h-5 w-5 text-brand" />}
                    title={`${group}样式`}
                    desc={`全软件${group}相关的常用 UI 编号。`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleCatalogContentGroup(group)}
                    className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 hover:border-brand/40 hover:text-brand"
                  >
                    {isContentCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {filteredStandardUiSamples.filter((item) => item.group === group).length}
                  </button>
                </div>
                {!isContentCollapsed && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {filteredStandardUiSamples.filter((item) => item.group === group).map((item) => {
                    const specs = { ...getBaseSpecs(item), ...(uiSpecDefaults[item.id] ?? {}), ...(uiSpecOverrides[item.id] ?? {}) };
                    return (
                      <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <NumberPill id={item.id} />
                            <h3 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h3>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400">{item.group}</span>
                            {renderMarkControls(item.id)}
                          </div>
                        </div>
                        <div className="flex min-h-[112px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                          {item.preview}
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.usage}</p>

                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                            <SpecPill label="宽" value={`${specs.width}px`} />
                            <SpecPill label="高" value={`${specs.height}px`} />
                            <SpecPill label="字号" value={`${specs.fontSize}px`} />
                            <SpecPill label="圆角" value={`${specs.radius}px`} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSpecItemId(item.id)}
                            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#08AACE] px-3 text-xs font-black text-white shadow-sm hover:bg-brand-dark"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            展开规格
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                )}
              </section>
              );
            })}

            {(() => {
              const isManualCollapsed = collapsedCatalogContentGroups.manual ?? true;
              return (
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <SectionTitle icon={<Sparkles className="h-5 w-5 text-brand" />} title="手动上传" desc="收纳你手动发来的 UI 网站代码、样式片段和可复用组件，已合并到 UI 分类里。" />
                <button
                  type="button"
                  onClick={() => toggleCatalogContentGroup('manual')}
                  className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 hover:border-brand/40 hover:text-brand"
                >
                  {isManualCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {filteredManualUiSamples.length}
                </button>
              </div>
              {!isManualCollapsed && (
              <div className="space-y-5">
                {filteredLandingPreviewSamples.length > 0 && (
                  <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">UI 落地预览已勾选</h3>
                        <p className="mt-1 text-xs font-bold text-slate-400">从落地预览勾选同步过来的 UI，后续优先核对是否已实际落地。</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-sky-500 shadow-sm">
                        {filteredLandingPreviewSamples.length} 个
                      </span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                      {filteredLandingPreviewSamples.map((item) => (
                        <article id={`catalog-${item.id}`} key={`landing-${item.id}`} className="scroll-mt-7 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <NumberPill id={item.id} />
                              <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                              <p className="mt-1 text-[11px] font-black text-sky-500">落地预览勾选项 / {getManualUiType(item)}</p>
                            </div>
                            {renderMarkControls(item.id)}
                          </div>
                          <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-3">
                            {item.preview}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {manualUiGroups.map((group) => (
                  <section key={group.type} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-900">{group.type}</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-400 shadow-sm">
                        {group.items.length} 个
                      </span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                      {group.items.map((item) => (
                        <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <NumberPill id={item.id} />
                              <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">{group.type}</span>
                              {renderMarkControls(item.id)}
                            </div>
                          </div>
                          <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                            {item.preview}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              )}
            </section>
              );
            })()}
          </div>
        ) : activeTab === 'manual' ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle icon={<Sparkles className="h-5 w-5 text-brand" />} title="手动上传" desc="收纳你手动发来的 UI 网站代码、样式片段和可复用组件。" />
            <div className="space-y-5">
              {filteredLandingPreviewSamples.length > 0 && (
                <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">UI 落地预览已勾选</h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">从落地预览勾选同步过来的 UI，后续优先核对是否已实际落地。</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-sky-500 shadow-sm">
                      {filteredLandingPreviewSamples.length} 个
                    </span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                    {filteredLandingPreviewSamples.map((item) => (
                      <article id={`catalog-${item.id}`} key={`landing-${item.id}`} className="scroll-mt-7 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <NumberPill id={item.id} />
                            <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                            <p className="mt-1 text-[11px] font-black text-sky-500">落地预览勾选项 / {getManualUiType(item)}</p>
                          </div>
                          {renderMarkControls(item.id)}
                        </div>
                        <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-3">
                          {item.preview}
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {manualUiGroups.map((group) => (
                <section key={group.type} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-slate-900">{group.type}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-400 shadow-sm">
                      {group.items.length} 个
                    </span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                    {group.items.map((item) => (
                      <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <NumberPill id={item.id} />
                            <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">{group.type}</span>
                            {renderMarkControls(item.id)}
                          </div>
                        </div>
                        <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                          {item.preview}
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : activeTab === 'collection' ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle icon={<Heart className="h-5 w-5 text-rose-500" />} title="收藏" desc="你收藏过的 UI、字体、颜色和技术词典会集中显示在这里。" />
            {collectedTotalCount === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                还没有收藏内容。点击任意卡片右上角的“收藏”即可加入这里。
              </div>
            ) : (
              <div className="space-y-5">
                {collectedFontSamples.length > 0 && (
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">字体</div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                      {collectedFontSamples.map((item) => (
                        <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-xl border border-slate-100 bg-white p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <NumberPill id={item.id} />
                            {renderCollectionButton(item.id)}
                          </div>
                          <div className={item.className}>{item.sample}</div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">{item.usage}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {collectedColorSamples.length > 0 && (
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">颜色</div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                      {collectedColorSamples.map((item) => (
                        <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 overflow-hidden rounded-xl border border-slate-100 bg-white">
                          <div className={`flex h-16 items-center justify-center ${item.textClass ?? 'text-white'}`} style={{ backgroundColor: item.value }}>
                            <span className="text-xl font-black drop-shadow-sm">{item.id}</span>
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-slate-900">{item.name}</div>
                              {renderCollectionButton(item.id)}
                            </div>
                            <code className="mt-1 block text-[11px] font-bold text-slate-400">{item.value}</code>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{item.usage}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {(collectedStandardUiSamples.length > 0 || collectedManualUiSamples.length > 0) && (
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">UI</div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                      {[...collectedStandardUiSamples, ...collectedManualUiSamples].map((item) => (
                        <article id={`catalog-${item.id}`} key={item.id} className="scroll-mt-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <NumberPill id={item.id} />
                              <h4 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-500">{item.group}</span>
                              {renderMarkControls(item.id)}
                            </div>
                          </div>
                          <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                            {item.preview}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-slate-500">{item.usage}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {collectedTechItems.length > 0 && (
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">技术词典</div>
                    <div className="space-y-3">
                      {collectedTechItems.map((item) => (
                        <TechDictionaryCard key={item.id} item={item} action={renderCollectionButton(item.id)} tone="white" />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle icon={<Code2 className="h-5 w-5 text-brand" />} title="技术词典" desc="把你常用的大白话说法，翻译成我后续能直接定位的技术名称。" />
            <div className="space-y-3">
              {filteredTechItems.map((item) => (
                <TechDictionaryCard key={item.id} item={item} action={renderCollectionButton(item.id)} />
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
              <Check className="h-5 w-5" />
              以后你可以直接说“按 UI-13 做角色卡片”或“这里加 T-03 弹窗栈规则”，我会按这个页面的记录去实现。
            </div>
          </section>
        )}
          </div>
        </div>
      </main>
      {activeSpecItem && activeSpecs && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveSpecItemId(null);
          }}
        >
          <section className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <div className="text-2xl font-black leading-none text-[#08AACE]">{activeSpecItem.id}</div>
                <h2 className="mt-1 truncate text-base font-black text-slate-900">{activeSpecItem.name}</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">单独配置展示规格，列表里只保留简洁梗概。</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSpecItemId(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label="关闭规格配置"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-black text-slate-900">当前规格</div>
                    <div className="flex flex-wrap gap-1.5">
                      <SpecPill label="宽" value={`${activeSpecs.width}px`} />
                      <SpecPill label="高" value={`${activeSpecs.height}px`} />
                      <SpecPill label="字号" value={`${activeSpecs.fontSize}px`} />
                      <SpecPill label="圆角" value={`${activeSpecs.radius}px`} />
                      <SpecPill label="左右距" value={`${activeSpecs.paddingX}px`} />
                      <SpecPill label="间隔" value={`${activeSpecs.gap}px`} />
                      <SpecPill label="图标" value={`${activeSpecs.iconSize}px`} />
                      <SpecPill label="+/-" value={`${activeSpecs.plusMinusSize}px`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-4">
                    <NumberSpecInput label="宽" value={activeSpecs.width} min={24} max={520} onChange={(value) => updateUiSpec(activeSpecItem.id, 'width', value)} />
                    <NumberSpecInput label="高" value={activeSpecs.height} min={20} max={160} onChange={(value) => updateUiSpec(activeSpecItem.id, 'height', value)} />
                    <NumberSpecInput label="字号" value={activeSpecs.fontSize} min={8} max={48} onChange={(value) => updateUiSpec(activeSpecItem.id, 'fontSize', value)} />
                    <NumberSpecInput label="圆角" value={activeSpecs.radius} min={0} max={48} onChange={(value) => updateUiSpec(activeSpecItem.id, 'radius', value)} />
                    <NumberSpecInput label="左右距" value={activeSpecs.paddingX} min={0} max={80} onChange={(value) => updateUiSpec(activeSpecItem.id, 'paddingX', value)} />
                    <NumberSpecInput label="间隔" value={activeSpecs.gap} min={0} max={48} onChange={(value) => updateUiSpec(activeSpecItem.id, 'gap', value)} />
                    <NumberSpecInput label="图标" value={activeSpecs.iconSize} min={8} max={64} onChange={(value) => updateUiSpec(activeSpecItem.id, 'iconSize', value)} />
                    <NumberSpecInput label="+/-" value={activeSpecs.plusMinusSize} min={8} max={72} onChange={(value) => updateUiSpec(activeSpecItem.id, 'plusMinusSize', value)} />
                  </div>
                </div>

                <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-black text-slate-900">规格预览</div>
                  <div className="flex min-h-[180px] items-center justify-center rounded-xl bg-white p-3">
                    <RenderSpecPreview item={activeSpecItem} specs={activeSpecs} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{activeSpecItem.usage}</p>
                </aside>
              </div>
            </div>
            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => restoreUiSpecDefault(activeSpecItem.id)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              >
                恢复默认
              </button>
              <button
                type="button"
                onClick={() => saveUiSpecDefault(activeSpecItem.id, activeSpecs)}
                className="h-9 rounded-xl bg-[#08AACE] px-4 text-xs font-black text-white hover:bg-brand-dark"
              >
                设为默认
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
