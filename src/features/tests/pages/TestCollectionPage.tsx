import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  EyeOff,
  Globe,
  Moon,
  Palette,
  Send,
  Sparkles,
  Search,
  Square,
  X,
} from 'lucide-react';
import { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { readChapterContent } from '@/features/workbench/hooks/useWorkbenchData';
import type { Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { readWorkbenchLibraryEntries, type WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

const BrainstormAiChainTestPage = lazy(() => import('@/features/tests/pages/BrainstormAiChainTestPage').then((module) => ({ default: module.BrainstormAiChainTestPage })));
const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));

const testGroups = [
  {
    title: 'AI 链路测试',
    items: [
      {
        title: 'AI 生成链路测试中心',
        description: '集中测试脑洞、大纲、细纲、概要、提炼、续写、审核、更新等 AI 生成链路。',
        path: '/brainstorm-ai-chain-test',
        icon: Sparkles,
        badge: 'AI',
      },
      {
        title: '隐藏页面',
        description: '集中检查没有展示在正式导航里的页面、旧入口和内嵌功能。',
        path: '/hidden-pages-test',
        icon: EyeOff,
        badge: 'Hidden',
      },
    ],
  },
  {
    title: 'UI 与主题',
    items: [
      {
        title: 'UI库',
        description: '查看软件内可复用 UI、手动上传 UI 和技术词典记录。',
        path: '/software-ui-catalog',
        icon: Palette,
        badge: 'UI',
      },
      {
        title: '下拉 A 落地场景',
        description: '把之前列出的 24 个下拉适用场景全部做成方案 A 白底胶囊弹层预览。',
        path: '/dropdown-a-scenarios-test',
        icon: Palette,
        badge: 'A-Select',
      },
      {
        title: 'UI 落地场景预览',
        description: '按编号预览按钮、输入框、下拉、标签页、胶囊标签、弹窗、卡片等适合套 UI 库代码的场景。',
        path: '/ui-landing-scenarios-test',
        icon: Palette,
        badge: 'Scene',
      },
      {
        title: '作品卡片按钮方案 B',
        description: '测试作品卡片底部 3 列 x 2 行固定按钮，最多显示 6 个，剩余按钮放进“更多”弹层。',
        path: '/novel-card-actions-b-test',
        icon: Palette,
        badge: 'Card-B',
      },
      {
        title: '主题颜色',
        description: '查看主题颜色、深色主题配色和页面色板测试。',
        path: '/theme-colors',
        icon: Moon,
        badge: 'Theme',
      },
      {
        title: 'AI 输入框图标按钮测试',
        description: '测试把发送和停止做成贴合输入框右侧的两个图标按钮，避免右边出现空缝。',
        path: '/ai-inline-icon-actions-test',
        icon: Palette,
        badge: 'AI-Input',
      },
      {
        title: 'UI132 搜索框统一预览',
        description: '把软件里可见的搜索框集中套成 UI132，先确认尺寸、位置和文字效果。',
        path: '/search-ui132-test',
        icon: Search,
        badge: 'UI-132',
      },
      {
        title: '关联上下文四列弹窗',
        description: '真实读取设定、角色、概要和正文列表，测试勾选后统计关联内容总字数。',
        path: '/context-linker-test',
        icon: BookOpen,
        badge: 'Context',
      },
    ],
  },
  {
    title: '工具测试',
    items: [
      {
        title: '内置浏览器',
        description: '测试网页打开、收藏和登录状态保留。',
        path: '/test-browser',
        icon: Globe,
        badge: 'Browser',
      },
    ],
  },
];

type TestCollectionPageProps = {
  embedded?: boolean;
  onClose?: () => void;
};

const dropdownOptions = ['男女主', '正派配角', '重要反派', '反派配角', '龙套', '未分类'];

function DropdownMock({
  title,
  desc,
  variant,
  recommended = false,
}: {
  title: string;
  desc: string;
  variant: 'native' | 'capsule' | 'compact';
  recommended?: boolean;
}) {
  const [value, setValue] = useState(dropdownOptions[0]);
  const [open, setOpen] = useState(true);

  return (
    <section className="relative min-h-[310px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{desc}</p>
        </div>
        {recommended && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-500">推荐</span>}
      </div>

      <div className="flex items-start gap-3">
        <span className="mt-3 shrink-0 text-sm font-black text-slate-600">分类</span>
        {variant === 'native' ? (
          <select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-12 w-[264px] rounded-2xl border border-[#08AACE] bg-white px-5 text-base font-black text-slate-900 outline-none"
          >
            {dropdownOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : (
          <div className="relative w-[264px]">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className={`flex h-12 w-full items-center justify-between gap-3 border bg-white px-5 text-left text-base font-black text-slate-900 transition-colors ${
                variant === 'capsule'
                  ? 'rounded-2xl border-[#08AACE] shadow-[0_8px_18px_rgba(8,170,206,0.08)]'
                  : 'rounded-xl border-slate-200 hover:border-[#08AACE]'
              }`}
            >
              <span>{value}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className={`absolute left-0 right-0 top-[calc(100%+4px)] z-10 overflow-hidden border bg-white shadow-xl ${
                variant === 'capsule' ? 'rounded-xl border-slate-200' : 'rounded-lg border-slate-100'
              }`}>
                {dropdownOptions.map((option) => {
                  const selected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setValue(option);
                        setOpen(false);
                      }}
                      className={`flex h-8 w-full items-center justify-between px-6 text-left text-base leading-none transition-colors ${
                        selected
                          ? 'bg-[#1f6ed4] font-black text-white'
                          : 'bg-white font-medium text-slate-900 hover:bg-sky-50 hover:text-[#08AACE]'
                      }`}
                    >
                      <span>{option}</span>
                      {selected && variant === 'capsule' && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-28 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
        当前选择：<span className="text-[#08AACE]">{value}</span>
      </div>
    </section>
  );
}

const dropdownScenarioSamples = [
  { id: 'D-01', page: '新增作品弹窗', location: '我的小说/我的剧本 -> 右上角“新建”按钮 -> 新增作品弹窗', field: '作品分类', options: ['未分类', '玄幻', '都市', '仙侠', '科幻', '历史'] },
  { id: 'D-07', page: '作品编辑器 > 角色生成', location: '打开小说 -> 作品编辑器 -> 大纲设定 -> 角色生成区域', field: '角色分类', options: ['男女主', '正派配角', '重要反派', '反派配角', '龙套', '未分类'] },
  { id: 'D-18', page: '编辑器工具弹窗', location: '打开小说/剧本 -> 编辑器右侧或工具栏 -> 替换正文相关弹窗', field: '替换范围', options: ['当前章节', '当前卷', '全书', '选中章节'] },
  { id: 'D-23', page: '提取设定', location: '创作专区 -> 提取设定 -> RAG/调用模板配置区', field: 'RAG 调用模板', options: ['续写模式', '战斗模式', '世界观解释模式', '人物塑造模式', '设定校验模式'] },
  { id: 'D-24', page: '提取设定', location: '创作专区 -> 提取设定 -> 设定分类/知识分类配置区', field: '设定分类', options: ['世界观', '地点区域', '势力组织', '人物角色', '功法能力', '待定/冲突'] },
];

type DropdownScenarioDecision = 'todo' | 'deprecated';

const DROPDOWN_A_DECISION_KEY = 'dropdown_a_scenario_decisions';

function loadDropdownADecisions(): Record<string, DropdownScenarioDecision> {
  try {
    const saved = localStorage.getItem(DROPDOWN_A_DECISION_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value === 'todo' || value === 'deprecated'),
    ) as Record<string, DropdownScenarioDecision>;
  } catch {
    return {};
  }
}

function CapsuleDropdownPreview({ id, label, options }: { id: string; label: string; options: string[] }) {
  const [value, setValue] = useState(options[0] ?? '未选择');
  const [open, setOpen] = useState(id === 'D-01');

  return (
    <div className="relative w-full max-w-[300px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#08AACE] bg-white px-5 text-left text-base font-black text-slate-900 shadow-[0_8px_18px_rgba(8,170,206,0.08)] transition-colors hover:bg-sky-50/40"
      >
        <span className="min-w-0 truncate">{value}</span>
        <ChevronDown className={
          'h-4 w-4 shrink-0 text-slate-800 transition-transform ' + (open ? 'rotate-180' : '')
        } />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[220px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl">
          {options.map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setValue(option);
                  setOpen(false);
                }}
                className={
                  'flex h-9 w-full items-center justify-between gap-3 px-5 text-left text-sm transition-colors ' +
                  (selected ? 'bg-[#1f6ed4] font-black text-white' : 'bg-white font-bold text-slate-800 hover:bg-sky-50 hover:text-[#08AACE]')
                }
              >
                <span className="min-w-0 truncate">{option}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-2 text-[11px] font-black text-slate-400">方案 A / {label}</div>
    </div>
  );
}

export function DropdownAScenariosTestPage() {
  const [decisions, setDecisions] = useState<Record<string, DropdownScenarioDecision>>(loadDropdownADecisions);
  const todoCount = Object.values(decisions).filter((value) => value === 'todo').length;
  const deprecatedCount = Object.values(decisions).filter((value) => value === 'deprecated').length;

  const toggleDecision = (id: string, nextValue: DropdownScenarioDecision) => {
    setDecisions((current) => {
      const updated = { ...current };
      if (updated[id] === nextValue) {
        delete updated[id];
      } else {
        updated[id] = nextValue;
      }
      localStorage.setItem(DROPDOWN_A_DECISION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">下拉 A 落地场景预览</h1>
            <p className="mt-2 text-sm font-bold text-slate-400">
              下面把 24 个可落地下拉场景都套成“方案 A：白底胶囊弹层”。勾选表示后续要做，废除表示后续删除。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            <span className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-[#08AACE]">已勾选 {todoCount}</span>
            <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-500">已废除 {deprecatedCount}</span>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {dropdownScenarioSamples.map((item) => {
            const decision = decisions[item.id];
            return (
              <article
                key={item.id}
                className={`min-h-[260px] rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
                  decision === 'todo'
                    ? 'border-[#08AACE]/50'
                    : decision === 'deprecated'
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-slate-100'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-2xl font-black leading-none text-[#08AACE]">{item.id}</div>
                    <h2 className="mt-2 truncate text-base font-black text-slate-900">{item.page}</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">字段：{item.field}</p>
                    <p className="mt-2 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                      位置：{item.location}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-[#08AACE]">方案 A</span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDecision(item.id, 'todo')}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl border text-xs font-black transition-colors ${
                      decision === 'todo'
                        ? 'border-[#08AACE] bg-[#08AACE] text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-[#08AACE]/50 hover:bg-sky-50 hover:text-[#08AACE]'
                    }`}
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-current">
                      {decision === 'todo' && <Check className="h-3 w-3" />}
                    </span>
                    勾选
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDecision(item.id, 'deprecated')}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl border text-xs font-black transition-colors ${
                      decision === 'deprecated'
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-current">
                      {decision === 'deprecated' && <X className="h-3 w-3" />}
                    </span>
                    废除
                  </button>
                </div>

                <div className="flex min-h-[118px] items-start justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <CapsuleDropdownPreview id={item.id} label={item.field} options={item.options} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const uiLandingScenarios = [
  {
    id: 'S-01',
    title: '按钮类',
    usedUi: 'UI-119 发送按钮 / UI-112 作品信息 / 黑色主题危险按钮',
    targets: '发送、停止、删除、导入、导出、替换正文、撤回、作品信息、关联小说、创建模型、创建提示词、打开检查、继续阅读',
    preview: (
      <div className="flex flex-wrap items-center gap-2">
        <button className="xy-ui119-send-button h-10 px-4">
          <span className="xy-ui119-send-icon">➤</span>
          <span>发送</span>
        </button>
        <button className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">停止</button>
        <button className="rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white">删除</button>
        <button className="xy-work-info-neon-button text-sm" data-text="作品信息">
          <span className="xy-work-info-neon-actual">作品信息</span>
          <span className="xy-work-info-neon-hover" aria-hidden="true">作品信息</span>
        </button>
      </div>
    ),
  },
  {
    id: 'S-02',
    title: '输入框类',
    usedUi: 'UI-130 浮动标签输入框 / UI-132 搜索框',
    targets: 'AI 输入框、搜索框、模型名称、模型 ID、接口地址、API Key、提示词名称、提示词说明、数据库名、主机、端口',
    preview: (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="xy-floating-field xy-has-value">
          <input defaultValue="DeepSeek" />
          <label>模型名称</label>
        </div>
        <label className="xy-ui132-search">
          <Search />
          <input placeholder="搜索 UI 编号" />
        </label>
      </div>
    ),
  },
  {
    id: 'S-03',
    title: '下拉菜单类',
    usedUi: '方案 A：白底胶囊弹层',
    targets: '模型选择、提示词选择、接口类型、分类选择、筛选条件',
    preview: <DropdownMock title="方案 A 预览" desc="后续下拉统一优先用这个白底胶囊弹层。" variant="capsule" recommended />,
  },
  {
    id: 'S-04',
    title: '标签页类',
    usedUi: 'UI-136 标签页分段 Radio',
    targets: '打开小说/剧本后的顶部标签、大纲设定里的标签、剧本编辑器模式标签、UI库分类标签',
    preview: (
      <div className="xy-radio-inputs w-full max-w-[420px]">
        {['小说正文', '大纲设定', '剧本编辑'].map((tab, index) => (
          <button key={tab} className={`xy-radio-option ${index === 1 ? 'xy-active' : ''}`}>{tab}</button>
        ))}
      </div>
    ),
  },
  {
    id: 'S-05',
    title: '胶囊标签类',
    usedUi: '多项胶囊分类标签',
    targets: '小说分类、剧本分类、提示词分类、角色类型、状态标签',
    preview: (
      <div className="flex flex-wrap gap-2">
        {['男女主', '正派配角', '重要反派', '未分类'].map((item, index) => (
          <span key={item} className={`rounded-full px-3 py-1.5 text-xs font-black ${index === 0 ? 'bg-[#08AACE] text-white' : 'bg-sky-50 text-[#08AACE]'}`}>{item}</span>
        ))}
      </div>
    ),
  },
  {
    id: 'S-06',
    title: '勾选/开关类',
    usedUi: 'UI-46 动效勾选框 / 开关 Switch',
    targets: '想流式输出、隐藏页面打钩、UI库收藏/不常用、筛选条件',
    preview: (
      <div className="flex flex-wrap items-center gap-4">
        <label className="xy-animated-checkbox">
          <input type="checkbox" defaultChecked />
          <span className="xy-animated-checkbox-box"><Check className="h-3 w-3" /></span>
          <span>想流式输出</span>
        </label>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">不常用</span>
      </div>
    ),
  },
  {
    id: 'S-07',
    title: '弹窗类',
    usedUi: '白底圆角弹窗 / 可拖拽弹窗框架',
    targets: '创建模型、创建提示词、作品信息、设置、删除确认、回收站、详情预览',
    preview: (
      <div className="w-full max-w-[360px] rounded-3xl border border-slate-100 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black text-slate-900">作品信息</div>
          <X className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">这里放作品字数、分类、创建时间和说明。</div>
      </div>
    ),
  },
  {
    id: 'S-08',
    title: '卡片类',
    usedUi: '作品卡片 / UI库卡片 / 紧凑信息卡',
    targets: '我的小说作品卡、我的剧本卡、提示词卡、角色卡、设定卡、脑洞卡、UI库卡',
    preview: (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-black text-slate-900">月落长歌</div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">作品卡片可放封面、字数和常用操作。</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <div className="text-sm font-black text-[#08AACE]">UI-130</div>
          <p className="mt-2 text-xs font-bold text-slate-500">输入框样式记录卡。</p>
        </div>
      </div>
    ),
  },
  {
    id: 'S-09',
    title: '导航/列表类',
    usedUi: '左侧编号导航 / 紧凑列表项',
    targets: '左侧导航、UI库左侧编号导航、测试页面列表、分类列表',
    preview: (
      <div className="w-full max-w-[300px] rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        {['UI-119 发送按钮', 'UI-130 输入框', 'UI-132 搜索框'].map((item, index) => (
          <div key={item} className={`rounded-xl px-3 py-2 text-xs font-black ${index === 1 ? 'bg-sky-50 text-[#08AACE]' : 'text-slate-500'}`}>{item}</div>
        ))}
      </div>
    ),
  },
  {
    id: 'S-10',
    title: '字号/数值调节类',
    usedUi: '字号步进器 / 规格配置弹窗',
    targets: '字号加减、滑块、步进器、规格配置',
    preview: (
      <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button className="h-10 w-10 text-lg font-black text-slate-500">-</button>
        <span className="flex h-10 min-w-12 items-center justify-center border-x border-slate-100 text-sm font-black text-[#08AACE]">18</span>
        <button className="h-10 w-10 text-lg font-black text-slate-500">+</button>
      </div>
    ),
  },
  {
    id: 'S-11',
    title: '状态提示类',
    usedUi: '状态胶囊 / 空状态提示',
    targets: '存活状态、已锁定、成功/失败、调用日志状态、空状态提示',
    preview: (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-600">存活</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">已锁定</span>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-500">失败</span>
      </div>
    ),
  },
  {
    id: 'S-12',
    title: '菜单类',
    usedUi: '白底弹层菜单 / 筛选弹层',
    targets: '右键菜单、更多菜单、下拉弹层、筛选弹层',
    preview: (
      <div className="w-[220px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        {['打开详情', '重命名', '导出 txt', '删除'].map((item, index) => (
          <button key={item} className={`flex h-10 w-full items-center px-4 text-left text-sm font-bold ${index === 3 ? 'text-red-500 hover:bg-red-50' : 'text-slate-700 hover:bg-sky-50'}`}>{item}</button>
        ))}
      </div>
    ),
  },
];

export function UiLandingScenariosTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-950">UI 落地场景预览</h1>
          <p className="mt-2 text-sm font-bold text-slate-400">
            下面按编号列出适合后续套 UI 库代码的场景，每张卡都标注建议使用的 UI。
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4">
          {uiLandingScenarios.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-2xl font-black leading-none text-[#08AACE]">{item.id}</div>
                  <h2 className="mt-2 text-base font-black text-slate-900">{item.title}</h2>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-[#08AACE]">{item.usedUi}</span>
              </div>
              <p className="mb-4 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-500">
                适用：{item.targets}
              </p>
              <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                {item.preview}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const primaryNovelActions = ['继续阅读', '作品信息', '打开检查', '重命名', '封面', '更多'];
const overflowNovelActions = ['导出 txt', '关联小说', '复制书名'];

function NovelActionButton({ label, active = false, danger = false, onClick }: { label: string; active?: boolean; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 min-w-0 rounded-xl px-2 text-xs font-black transition-all ${
        active
          ? 'bg-[#08AACE] text-white shadow-[0_8px_18px_rgba(8,170,206,0.25)]'
          : danger
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]'
      }`}
    >
      <span className="block truncate">{label}</span>
    </button>
  );
}

export function NovelCardActionsBTestPage() {
  const [moreOpen, setMoreOpen] = useState(true);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="text-sm font-black text-[#08AACE]">B-01 / 作品卡片按钮方案 B</div>
            <h1 className="mt-1 text-xl font-black text-slate-950">3 列 x 2 行固定按钮 + 更多弹层</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-400">
              适合作品卡片以后扩展到 9 个按钮。卡片底部只显示 6 个入口，剩余操作集中到“更多”弹层。
            </p>
          </div>

          <div className="rounded-[26px] border border-slate-100 bg-white p-3 shadow-xl">
            <div className="flex h-[250px] items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-50 via-white to-cyan-50">
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-[#08AACE] shadow-sm">书</div>
                <div className="mt-3 text-sm font-black text-slate-700">封面预览</div>
              </div>
            </div>
            <div className="px-1 pb-1 pt-3">
              <h2 className="truncate text-base font-black text-slate-900">月落长歌</h2>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>128000 字</span>
                <span>2026-05-27</span>
              </div>

              <div className="relative mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {primaryNovelActions.map((action, index) => (
                    <NovelActionButton
                      key={action}
                      label={action}
                      active={index === 0}
                      onClick={action === '更多' ? () => setMoreOpen((current) => !current) : undefined}
                    />
                  ))}
                </div>
                {moreOpen && (
                  <div className="absolute right-1.5 top-[calc(100%+8px)] z-20 w-[160px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl">
                    {overflowNovelActions.map((action) => (
                      <button key={action} className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]">
                        {action}
                      </button>
                    ))}
                    <button className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-red-500 hover:bg-red-50">删除</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 text-base font-black text-slate-900">编号说明</div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-sky-50 p-4">
              <div className="text-sm font-black text-[#08AACE]">B-01 固定区</div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">第一行：继续阅读 / 作品信息 / 打开检查。第二行：重命名 / 封面 / 更多。</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-900">B-02 更多弹层</div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">点击“更多”显示剩余按钮：导出 txt、关联小说、复制书名、删除。以后扩展到 9 个按钮也不会撑高卡片。</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-900">使用 UI</div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">底部按钮使用“胶囊按钮组”思路，更多菜单使用“白底弹层菜单”。如果你确认，我再把它落地到真实作品卡片。</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AiInlineIconActionsTestPage() {
  return (
    <div className="flex h-full min-h-0 overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="text-sm font-black text-[#08AACE]">AI-Input-01 / 图标发送框</div>
            <h1 className="mt-1 text-xl font-black text-slate-950">AI 输入框右侧图标按钮测试</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-400">
              输入框按图 1 做，不带前面的加号；发送是框内右侧纸飞机图标，停止是贴在框外右侧的图标按钮。
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6">
              <div className="flex max-w-[720px] items-stretch">
                <div className="relative h-[52px] min-w-0 flex-1 rounded-l-[16px] border-2 border-slate-900 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <input
                    placeholder="AI 输入框"
                    className="h-full w-full rounded-l-[14px] border-0 bg-transparent py-0 pl-5 pr-[58px] text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 top-0 grid w-[54px] place-items-center rounded-r-[14px] text-slate-950 transition-colors hover:bg-slate-50"
                    title="发送"
                    aria-label="发送"
                  >
                    <Send className="h-6 w-6 stroke-[1.9]" />
                  </button>
                </div>
                <button
                  type="button"
                  className="-ml-[2px] grid h-[52px] w-[52px] place-items-center rounded-r-[16px] border-2 border-l-0 border-slate-900 bg-white text-slate-950 transition-colors hover:bg-slate-50"
                  title="停止"
                  aria-label="停止"
                >
                  <Square className="h-[18px] w-[18px] fill-current stroke-[1.9]" />
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-black text-slate-900">结构</div>
              <div className="grid gap-2 text-xs font-bold text-slate-500">
                <div className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>输入框高度</span><span>52px</span></div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>发送按钮</span><span>框内图标</span></div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>停止按钮</span><span>框外对接</span></div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>前置加号</span><span>已删除</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 text-base font-black text-slate-900">紧凑尺寸预览</div>
          <div className="flex max-w-[520px] items-stretch">
            <div className="relative h-[46px] min-w-0 flex-1 rounded-l-[14px] border-2 border-slate-900 bg-white">
              <input
                placeholder="AI 输入框"
                className="h-full w-full rounded-l-[12px] border-0 bg-transparent pl-4 pr-[54px] text-sm font-medium outline-none placeholder:text-slate-400"
              />
              <button type="button" className="absolute bottom-0 right-0 top-0 grid w-[50px] place-items-center text-slate-950 hover:bg-slate-50" aria-label="发送">
                <Send className="h-6 w-6 stroke-[1.8]" />
              </button>
            </div>
            <button type="button" className="-ml-[2px] grid h-[46px] w-[46px] place-items-center rounded-r-[14px] border-2 border-l-0 border-slate-900 bg-white text-slate-950 hover:bg-slate-50" aria-label="停止">
              <Square className="h-4 w-4 fill-current" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const searchUi132Scenarios = [
  {
    id: 'Q-01',
    page: '我的小说',
    location: '创作专区 -> 我的小说 -> 分类胶囊右侧',
    placeholder: '搜索小说',
    width: '260px',
  },
  {
    id: 'Q-02',
    page: '我的剧本',
    location: '创作专区 -> 我的剧本 -> 分类胶囊右侧',
    placeholder: '搜索剧本',
    width: '260px',
  },
  {
    id: 'Q-03',
    page: '提示词管理',
    location: '数据专区 -> 提示词管理 -> 回收站按钮右侧',
    placeholder: '搜索提示词...',
    width: '260px',
  },
  {
    id: 'Q-04',
    page: '剧情库',
    location: '创作专区 -> 提炼剧情 -> 剧情库工具栏',
    placeholder: '搜索...',
    width: '220px',
  },
  {
    id: 'Q-05',
    page: '脑洞库',
    location: '功能专区 -> 脑洞库侧栏',
    placeholder: '搜索脑洞...',
    width: '260px',
  },
  {
    id: 'Q-06',
    page: '文案修改',
    location: '调整模式 -> 文案列表右上角',
    placeholder: '搜索文案',
    width: '320px',
  },
  {
    id: 'Q-07',
    page: 'UI库',
    location: '测试 -> UI库 -> 右上角',
    placeholder: '搜索编号、名称，例如 UI-138',
    width: '420px',
  },
  {
    id: 'Q-08',
    page: '隐藏页面',
    location: '测试 -> 隐藏页面 -> 右上角',
    placeholder: '搜索页面、路径或状态',
    width: '280px',
  },
  {
    id: 'Q-09',
    page: '测试',
    location: '右上角测试弹窗 -> 测试列表右上角',
    placeholder: '搜索测试内容',
    width: '280px',
  },
];

function SearchUi132Preview({ placeholder, width }: { placeholder: string; width: string }) {
  return (
    <label className="xy-ui132-search" style={{ width, maxWidth: '100%' }}>
      <Search />
      <input type="search" placeholder={placeholder} />
    </label>
  );
}

export function SearchUi132TestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5">
          <div className="text-sm font-black text-[#08AACE]">UI-132 / 搜索框</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">软件搜索框统一预览</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-400">
            这里先把软件里可见的搜索框都套成 UI132。确认后再替换正式页面。
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {searchUi132Scenarios.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xl font-black leading-none text-[#08AACE]">{item.id}</div>
                  <h2 className="mt-2 truncate text-base font-black text-slate-900">{item.page}</h2>
                  <p className="mt-2 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                    {item.location}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-[#08AACE]">UI132</span>
              </div>
              <div className="flex min-h-[96px] items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <SearchUi132Preview placeholder={item.placeholder} width={item.width} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-1">宽度 {item.width}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">白底 / 黑字 / 左侧搜索图标</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

type ContextSourceType = 'setting' | 'role' | 'summary' | 'chapter';

type ContextSourceItem = {
  id: string;
  type: ContextSourceType;
  group: string;
  title: string;
  content: string;
  meta?: string;
};

const CURRENT_NOVEL_ID_KEY = 'xinyuexia_current_novel_id';
const NOVELS_KEY = 'xinyuexia_novels_v1';
const VOLUMES_KEY = 'xinyuexia_volumes_v1';

function readTestJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function normalizeContextEntryTab(tab: string) {
  if (tab === '设定' || tab === '设定库') return '大纲';
  if (tab === '角色库') return '角色';
  if (tab === '概要库') return '概要';
  return tab;
}

function getContextEntryType(entry: WorkbenchLibraryEntry) {
  const normalizedTab = normalizeContextEntryTab(entry.tab);
  return entry.type?.trim() || normalizedTab || '未分类';
}

function getContextWordCount(text: string) {
  return text.replace(/\s/g, '').length;
}

function readContextLinkerData() {
  const currentNovelIdRaw = localStorage.getItem(CURRENT_NOVEL_ID_KEY);
  const currentNovelId = currentNovelIdRaw ? Number(currentNovelIdRaw) : null;
  const novels = readTestJson<WorkbenchNovel[]>(NOVELS_KEY, []);
  const currentNovel = currentNovelId ? novels.find((novel) => novel.id === currentNovelId) ?? null : null;

  if (!currentNovelId || !currentNovel) {
    return {
      currentNovel: null,
      settings: [] as ContextSourceItem[],
      roles: [] as ContextSourceItem[],
      summaries: [] as ContextSourceItem[],
      chapters: [] as ContextSourceItem[],
    };
  }

  const settingsStorageKey = `xinyuexia_workbench_settings_${currentNovelId}`;
  const outlineStorageKey = `xinyuexia_workbench_outline_${currentNovelId}`;
  const settingEntries = readWorkbenchLibraryEntries(settingsStorageKey);
  const outlineEntries = readWorkbenchLibraryEntries(outlineStorageKey);
  const volumesMap = readTestJson<Record<number, Volume[]>>(VOLUMES_KEY, {});
  const volumes = volumesMap[currentNovelId] ?? [];

  const settings = settingEntries
    .filter((entry) => normalizeContextEntryTab(entry.tab) === '大纲')
    .map((entry): ContextSourceItem => ({
      id: `setting:${entry.id}`,
      type: 'setting',
      group: getContextEntryType(entry),
      title: entry.title || '未命名设定',
      content: entry.content || '',
      meta: entry.updatedAt,
    }));

  const roles = settingEntries
    .filter((entry) => normalizeContextEntryTab(entry.tab) === '角色')
    .map((entry): ContextSourceItem => ({
      id: `role:${entry.id}`,
      type: 'role',
      group: getContextEntryType(entry),
      title: entry.title || '未命名角色',
      content: entry.content || '',
      meta: entry.updatedAt,
    }));

  const summaries = outlineEntries
    .filter((entry) => entry.tab === '章节概要' || entry.tab === '卷概要' || entry.tab === '概要')
    .map((entry): ContextSourceItem => ({
      id: `summary:${entry.id}`,
      type: 'summary',
      group: entry.tab || '概要',
      title: entry.title || '未命名概要',
      content: entry.content || '',
      meta: entry.updatedAt,
    }));

  const chapters = volumes.flatMap((volume) => (
    volume.chapters.map((chapter): ContextSourceItem => {
      const title = chapter.title || `第${chapter.serialNumber}章`;
      const content = readChapterContent(currentNovelId, chapter.id);
      return {
        id: `chapter:${chapter.id}`,
        type: 'chapter',
        group: volume.name,
        title,
        content,
        meta: `${volume.name} / ${chapter.wordCount ?? getContextWordCount(content)}字`,
      };
    })
  ));

  return { currentNovel, settings, roles, summaries, chapters };
}

function ContextLinkerColumn({
  title,
  subtitle,
  items,
  selectedIds,
  onToggle,
}: {
  title: string;
  subtitle: string;
  items: ContextSourceItem[];
  selectedIds: Set<string>;
  onToggle: (itemId: string) => void;
}) {
  const groupedItems = useMemo(() => {
    const groups = new Map<string, ContextSourceItem[]>();
    items.forEach((item) => {
      const group = item.group || '未分类';
      groups.set(group, [...(groups.get(group) ?? []), item]);
    });
    return Array.from(groups.entries());
  }, [items]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">{items.length}</span>
        </div>
        <p className="mt-1 text-xs font-bold text-slate-400">{subtitle}</p>
      </div>
      <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-bold text-slate-300">
            暂无可关联内容
          </div>
        ) : (
          <div className="space-y-3">
            {groupedItems.map(([group, groupItems]) => (
              <div key={group}>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">
                  <span className="truncate">{group}</span>
                  <span>{groupItems.length}</span>
                </div>
                <div className="space-y-2">
                  {groupItems.map((item) => {
                    const checked = selectedIds.has(item.id);
                    const wordCount = getContextWordCount(item.content);
                    return (
                      <label
                        key={item.id}
                        className={`block cursor-pointer rounded-xl border p-3 transition-colors ${
                          checked ? 'border-[#08AACE] bg-sky-50/60' : 'border-slate-100 bg-white hover:border-sky-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(item.id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black text-slate-900">{item.title}</div>
                            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs font-semibold leading-5 text-slate-500">
                              {item.content || '暂无内容'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-black text-slate-400">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5">{wordCount}字</span>
                              {item.meta && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.meta}</span>}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ContextLinkerTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const contextData = useMemo(() => readContextLinkerData(), [isOpen]);
  const allItems = useMemo(() => [
    ...contextData.settings,
    ...contextData.roles,
    ...contextData.summaries,
    ...contextData.chapters,
  ], [contextData]);
  const selectedItems = useMemo(() => allItems.filter((item) => selectedIds.has(item.id)), [allItems, selectedIds]);
  const selectedWordCount = selectedItems.reduce((sum, item) => sum + getContextWordCount(item.content), 0);

  const toggleItem = (itemId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-black text-[#08AACE]">Context-01 / 真实读取</div>
              <h1 className="mt-1 text-2xl font-black text-slate-950">关联上下文四列弹窗</h1>
              <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-400">
                读取当前作品的大纲设定、角色、概要库和正文列表。勾选后统计关联总字数，用于后续续写时控制上下文长度。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="h-11 rounded-2xl bg-[#08AACE] px-5 text-sm font-black text-white shadow-sm hover:bg-[#0799ba]"
            >
              关联上下文{selectedWordCount > 0 ? ` · ${selectedWordCount}字` : ''}
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400">当前作品</div>
              <div className="mt-1 truncate text-sm font-black text-slate-900">{contextData.currentNovel?.title ?? '未打开作品'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400">设定 / 角色</div>
              <div className="mt-1 text-sm font-black text-slate-900">{contextData.settings.length} / {contextData.roles.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400">概要 / 正文</div>
              <div className="mt-1 text-sm font-black text-slate-900">{contextData.summaries.length} / {contextData.chapters.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400">已关联</div>
              <div className="mt-1 text-sm font-black text-slate-900">{selectedItems.length} 项 · {selectedWordCount}字</div>
            </div>
          </div>
        </section>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/35 p-5" onClick={() => setIsOpen(false)}>
          <div
            className="flex h-[86vh] w-[min(1500px,96vw)] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-950">关联上下文</h2>
                <p className="mt-0.5 text-xs font-bold text-slate-400">
                  {contextData.currentNovel?.title ?? '未打开作品'} · 已选 {selectedItems.length} 项 · {selectedWordCount} 字
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:bg-slate-50"
                >
                  清空选择
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-9 rounded-xl bg-[#08AACE] px-4 text-xs font-black text-white hover:bg-[#0799ba]"
                >
                  确认关联
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <main className="grid min-h-0 flex-1 grid-cols-4 gap-4 p-4">
              <ContextLinkerColumn title="设定" subtitle="读取大纲设定里的设定分类和卡片" items={contextData.settings} selectedIds={selectedIds} onToggle={toggleItem} />
              <ContextLinkerColumn title="角色" subtitle="读取大纲设定里的角色分类和卡片" items={contextData.roles} selectedIds={selectedIds} onToggle={toggleItem} />
              <ContextLinkerColumn title="概要" subtitle="读取概要库里的章节概要和卷概要" items={contextData.summaries} selectedIds={selectedIds} onToggle={toggleItem} />
              <ContextLinkerColumn title="正文列表" subtitle="读取当前作品卷和章节正文" items={contextData.chapters} selectedIds={selectedIds} onToggle={toggleItem} />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestCollectionPage({ embedded = false, onClose }: TestCollectionPageProps = {}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activePath, setActivePath] = useState<string | null>(null);

  const activeItem = useMemo(() => (
    testGroups.flatMap((group) => group.items).find((item) => item.path === activePath) ?? null
  ), [activePath]);

  const handleBack = () => {
    if (embedded && activePath) {
      setActivePath(null);
      return;
    }
    if (embedded) {
      onClose?.();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  const openTestPage = (path: string) => {
    if (embedded) {
      setActivePath(path);
      return;
    }
    navigate(path);
  };

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return testGroups;
    return testGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.badge.toLowerCase().includes(keyword)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = testGroups.reduce((sum, group) => sum + group.items.length, 0);

  const renderActiveTest = () => {
    switch (activePath) {
      case '/brainstorm-ai-chain-test':
        return <BrainstormAiChainTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/dropdown-a-scenarios-test':
        return <DropdownAScenariosTestPage />;
      case '/ui-landing-scenarios-test':
        return <UiLandingScenariosTestPage />;
      case '/novel-card-actions-b-test':
        return <NovelCardActionsBTestPage />;
      case '/ai-inline-icon-actions-test':
        return <AiInlineIconActionsTestPage />;
      case '/search-ui132-test':
        return <SearchUi132TestPage />;
      case '/context-linker-test':
        return <ContextLinkerTestPage />;
      case '/theme-colors':
        return <DarkThemeColorPage variant="modal" onClose={() => setActivePath(null)} />;
      case '/test-browser':
        return <TestBrowserPage />;
      default:
        return null;
    }
  };

  if (embedded && activePath) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-slate-50">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
          <button
            onClick={() => setActivePath(null)}
            className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            返回测试
          </button>
          <div className="min-w-0 flex-1 px-4 text-center text-sm font-black text-slate-700">
            {activeItem?.title ?? '测试内容'}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">正在打开测试内容...</div>}>
            {renderActiveTest()}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">测试</h1>
            <p className="mt-0.5 text-xs text-slate-400">已收纳 {totalCount} 个测试内容</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
              title={embedded ? '关闭' : '返回'}
            >
              {embedded ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </button>
            <div className="relative w-[280px] max-w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索测试内容"
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition-colors focus:border-brand focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="space-y-7">
          {visibleGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-700">{group.title}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => openTestPage(item.path)}
                      className="group flex min-h-[128px] flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:bg-brand-light group-hover:text-brand">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{item.title}</div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
              没有找到匹配的测试内容
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
