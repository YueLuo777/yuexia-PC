import {
  ArrowLeft,
  BookOpenText,
  Check,
  ChevronDown,
  Database,
  EyeOff,
  Globe,
  ListChecks,
  NotebookText,
  Moon,
  Palette,
  SendHorizontal,
  Sparkles,
  Search,
  Square,
  Tags,
  X,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';

const BrainstormAiChainTestPage = lazy(() => import('@/features/tests/pages/BrainstormAiChainTestPage').then((module) => ({ default: module.BrainstormAiChainTestPage })));
const HiddenPagesTestPage = lazy(() => import('@/features/tests/pages/HiddenPagesTestPage').then((module) => ({ default: module.HiddenPagesTestPage })));
const SoftwareUiCatalogPage = lazy(() => import('@/features/tests/pages/SoftwareUiCatalogPage').then((module) => ({ default: module.SoftwareUiCatalogPage })));
const DarkThemeColorPage = lazy(() => import('@/features/tests/pages/DarkThemeColorPage').then((module) => ({ default: module.DarkThemeColorPage })));
const ErrorLogPage = lazy(() => import('@/features/tests/pages/ErrorLogPage').then((module) => ({ default: module.ErrorLogPage })));
const PromptTaxonomyTestPage = lazy(() => import('@/features/tests/pages/PromptTaxonomyTestPage').then((module) => ({ default: module.PromptTaxonomyTestPage })));
const CreationFlowPageTestPage = lazy(() => import('@/features/tests/pages/CreationFlowPageTestPage').then((module) => ({ default: module.CreationFlowPageTestPage })));
const NovelDetailOverviewTestPage = lazy(() => import('@/features/tests/pages/NovelDetailOverviewTestPage').then((module) => ({ default: module.NovelDetailOverviewTestPage })));
const PlotChainPreviewDesignTestPage = lazy(() => import('@/features/tests/pages/PlotChainPreviewDesignTestPage').then((module) => ({ default: module.PlotChainPreviewDesignTestPage })));
const ManagementDrawerTestPage = lazy(() => import('@/features/tests/pages/ManagementDrawerTestPage').then((module) => ({ default: module.ManagementDrawerTestPage })));
const TestBrowserPage = lazy(() => import('@/features/browser/pages/TestBrowserPage').then((module) => ({ default: module.TestBrowserPage })));

const testGroups = [
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
        title: 'UI 落地场景预览',
        description: '按编号预览按钮、输入框、下拉、标签页、胶囊标签、弹窗、卡片等适合套 UI 库代码的场景。',
        path: '/ui-landing-scenarios-test',
        icon: Palette,
        badge: 'Scene',
      },
      {
        title: '主题颜色',
        description: '查看主题颜色、深色主题配色和页面色板测试。',
        path: '/theme-colors',
        icon: Moon,
        badge: 'Theme',
      },
      {
        title: '选择框边框标签测试',
        description: '测试把“模型”“提示词”嵌入到选择框上边框里，像设定名那种边框标签。',
        path: '/select-floating-label-test',
        icon: Palette,
        badge: 'Label',
      },
      {
        title: '右侧滑出管理页测试',
        description: '测试模型管理和提示词管理从工作区右侧滑出，覆盖脑洞列表、脑洞预览和脑洞输出框。',
        path: '/management-drawer-test',
        icon: Database,
        badge: 'Drawer',
      },
      {
        title: '提示词分类优化测试',
        description: '测试提示词少分类、多标签、页面自动筛选，以及使用页下拉框只显示相关提示词。',
        path: '/prompt-taxonomy-test',
        icon: Tags,
        badge: 'Prompt',
      },
    ],
  },
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
        title: '创作流程页面化测试',
        description: '测试把脑洞、大纲、剧情链、章纲、正文续写做成独立页面，并在左上角高亮当前流程。',
        path: '/creation-flow-page-test',
        icon: BookOpenText,
        badge: 'Flow',
      },
      {
        title: '作品详情总览页测试',
        description: '测试点击作品后先进入作品详情页，集中展示书名、简介、主线、大纲、剧情链、章纲和正文进度。',
        path: '/novel-detail-overview-test',
        icon: NotebookText,
        badge: 'Novel',
      },
      {
        title: '剧情链旧版架构备份',
        description: '保留剧情链弹窗改版前的三栏架构，方便以后对照或恢复旧版左链、中预览、右生成布局。',
        path: '/plot-point-workbench-test',
        icon: ListChecks,
        badge: 'Legacy',
      },
      {
        title: '剧情链卡片方案测试',
        description: '对比剧情点预览的摘要、承接、评分和密集列表方案，快速判断内容、潜力和能否接上已选剧情。',
        path: '/plot-chain-preview-design-test',
        icon: ListChecks,
        badge: 'Design',
      },
      {
        title: '输出日志折叠分组测试',
        description: '测试输出日志右侧区域按提示词、关联内容、用户要求分组折叠，只隐藏显示不影响发送给 AI。',
        path: '/ai-log-folding-test',
        icon: NotebookText,
        badge: 'Log UI',
      },
      {
        title: '隐藏页面',
        description: '集中检查没有展示在正式导航里的页面、旧入口和内嵌功能。',
        path: '/hidden-pages-test',
        icon: EyeOff,
        badge: 'Hidden',
      },
      {
        title: '错误日志',
        description: '记录软件里出现过的问题、原因、修复办法和后续防复发规则。',
        path: '/error-log',
        icon: NotebookText,
        badge: 'Log',
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

const testNumberByPath = new Map(
  testGroups
    .flatMap((group) => group.items)
    .map((item, index) => [item.path, index + 1] as const),
);
const TEST_COLLECTION_COMPLETED_KEY = 'xinyuexia_test_collection_completed_v1';

function readCompletedTestPaths() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COLLECTION_COMPLETED_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function formatTestNumber(path: string) {
  return String(testNumberByPath.get(path) ?? 0).padStart(2, '0');
}

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
                          ? 'bg-[#EAF9FD] font-black text-slate-900 hover:bg-[#EAF9FD]'
                          : 'bg-white font-medium text-slate-900 hover:bg-sky-50 hover:text-[#08AACE]'
                      }`}
                    >
                      <span>{option}</span>
                      {selected && variant === 'capsule' && <Check className="h-4 w-4 text-[#08AACE]" />}
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

function FloatingLabelSelectMock({
  label,
  value,
  options,
  disabled = false,
  showDisable = false,
  disablePlacement = 'side',
  disableVariant = 'text',
  compact = false,
  labelPosition = 'default',
  labelTextClassName = 'text-slate-800',
  valueTextClassName = 'text-slate-900',
}: {
  label: string;
  value: string;
  options: string[];
  disabled?: boolean;
  showDisable?: boolean;
  disablePlacement?: 'side' | 'label' | 'left' | 'both' | 'inside';
  disableVariant?: 'slash' | 'labelPill' | 'leftTab' | 'text';
  compact?: boolean;
  labelPosition?: 'default' | 'redFrame';
  labelTextClassName?: string;
  valueTextClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [isDisabled, setIsDisabled] = useState(disabled);
  const visibleValue = isDisabled ? `${label || '提示词'}已禁用` : selected;
  const showSideDisable = showDisable && disablePlacement === 'side';
  const showLabelDisable = showDisable && (disablePlacement === 'label' || disablePlacement === 'both');
  const showLeftDisable = showDisable && (disablePlacement === 'left' || disablePlacement === 'both');
  const showInsideDisable = showDisable && disablePlacement === 'inside';
  const disableButtonTitle = isDisabled ? '启用提示词' : '禁用提示词';
  const disableIconButton = (className = '') => {
    if (disableVariant === 'labelPill') {
      return (
        <button
          type="button"
          onClick={() => setIsDisabled((current) => !current)}
          className={`rounded-full border px-2 py-0.5 text-[11px] font-black leading-none transition-colors ${
            isDisabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          } ${className}`}
          title={disableButtonTitle}
          aria-label={disableButtonTitle}
          aria-pressed={isDisabled}
        >
          {isDisabled ? '启用' : '禁用'}
        </button>
      );
    }

    if (disableVariant === 'leftTab') {
      return (
        <button
          type="button"
          onClick={() => setIsDisabled((current) => !current)}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-l-[18px] border-y-2 border-l-2 transition-colors ${
            isDisabled
              ? 'border-red-500 bg-red-50 text-red-600'
              : 'border-red-300 bg-white text-red-500 hover:bg-red-50'
          } ${className}`}
          title={disableButtonTitle}
          aria-label={disableButtonTitle}
          aria-pressed={isDisabled}
        >
          <span className="relative h-4 w-4 rounded-full border-2 border-current">
            <span className="absolute left-1/2 top-1/2 h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-full bg-current" />
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setIsDisabled((current) => !current)}
        className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          isDisabled
            ? 'border-red-500 bg-red-50 text-red-600 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
            : 'border-red-300 bg-white text-red-500 hover:bg-red-50'
        } ${className}`}
        title={disableButtonTitle}
        aria-label={disableButtonTitle}
        aria-pressed={isDisabled}
      >
        <span className="absolute h-[2px] w-4 rotate-[-45deg] rounded-full bg-current" />
      </button>
    );
  };

  const useRedFrameLabel = labelPosition === 'redFrame' && Boolean(label);

  return (
    <div className={`grid ${showSideDisable ? 'grid-cols-[minmax(0,1fr)_52px]' : 'grid-cols-1'} items-center gap-2`}>
      <div className={`relative min-w-0 ${useRedFrameLabel ? 'pt-3' : ''}`}>
        {showLeftDisable && (
          <div className={`absolute top-[calc(50%+4px)] z-10 -translate-y-1/2 bg-white py-1 ${disableVariant === 'leftTab' ? '-left-1' : '-left-3'}`}>
            {disableIconButton(disableVariant === 'leftTab' ? '' : 'h-7 w-7')}
          </div>
        )}
        <div
          className={`relative min-w-0 overflow-visible rounded-[24px] border-2 bg-white p-0 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${
            isDisabled ? 'border-slate-200 text-slate-400' : 'border-[#08AACE] text-slate-900'
          }`}
        >
          {showInsideDisable && (
            <div className="absolute left-3.5 top-1/2 z-20 -translate-y-1/2 bg-white">
              {disableIconButton('h-[22px] w-[22px] border-[2.4px] [&>span]:w-[13px] [&>span]:h-[1.6px]')}
            </div>
          )}
          {label && (
            <div className={`${useRedFrameLabel ? 'absolute left-7 top-0 z-10 -translate-y-1/2 bg-white' : 'absolute left-10 top-0 z-10 -translate-y-1/2 bg-white'} max-w-[120px] px-1 text-sm font-black leading-none ${labelTextClassName}`}>
              <span className="inline-flex items-center gap-2">
                {label}
                {showLabelDisable && disableIconButton('-my-2')}
              </span>
            </div>
          )}
          <div className={`flex overflow-hidden rounded-[22px] ${compact ? 'h-10' : 'h-12'}`}>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setOpen((current) => !current)}
              className={`${showInsideDisable ? '!pl-12 !pr-7' : useRedFrameLabel ? 'px-7' : 'px-10'} min-w-0 flex-1 text-left text-base font-black disabled:cursor-not-allowed`}
            >
              <span className={`block truncate ${valueTextClassName}`}>{visibleValue}</span>
            </button>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setOpen((current) => !current)}
              className="grid w-6 shrink-0 place-items-center bg-transparent text-slate-700 transition-colors hover:bg-transparent hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              className="w-11 shrink-0 bg-[#EAF9FD] text-[13px] font-black text-[#078fb0] transition-colors hover:bg-[#08AACE] hover:text-white"
            >
              管理
            </button>
          </div>
        </div>
        {open && !isDisabled && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
            {options.map((option) => {
              const selectedOption = option === selected;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelected(option);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-between gap-3 px-4 text-left text-sm font-black ${
                    selectedOption ? 'bg-[#EAF9FD] text-slate-900 hover:bg-[#EAF9FD]' : 'text-slate-700 hover:bg-sky-50 hover:text-[#08AACE]'
                  }`}
                >
                  <span className="min-w-0 truncate">{option}</span>
                  {selectedOption && <Check className="h-4 w-4 shrink-0 text-[#08AACE]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {showSideDisable && disableVariant === 'text' && (
        <button
          type="button"
          onClick={() => setIsDisabled((current) => !current)}
          className={`mt-2 h-11 rounded-xl border px-2 text-xs font-black transition-colors ${
            isDisabled
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {isDisabled ? '启用' : '禁用'}
        </button>
      )}
      {showSideDisable && disableVariant !== 'text' && (
        <div className="mt-2 flex h-11 items-center justify-center">
          {disableIconButton()}
        </div>
      )}
    </div>
  );
}

export function SelectFloatingLabelTestPage() {
  const models = ['DS-v4-flash', 'DeepSeek V3', 'GPT-5.5', 'Claude Sonnet'];
  const prompts = ['设定-测试', '脑洞-测试版', '正文续写默认', '细纲默认'];
  const colorVariants = [
    {
      name: '灰色稳重',
      labelClass: 'text-slate-500',
      valueClass: 'text-slate-700',
      desc: '标签弱化，选中内容仍清楚。',
    },
    {
      name: '浅灰蓝',
      labelClass: 'text-slate-400',
      valueClass: 'text-slate-600',
      desc: '更轻，适合减少视觉重量。',
    },
    {
      name: '青蓝一体',
      labelClass: 'text-[#078FB0]',
      valueClass: 'text-slate-800',
      desc: '标签呼应边框，内容保持深色。',
    },
    {
      name: '墨蓝内容',
      labelClass: 'text-slate-500',
      valueClass: 'text-[#1E3A5F]',
      desc: '内容更沉稳，和正文区区分明显。',
    },
    {
      name: '暖灰',
      labelClass: 'text-stone-500',
      valueClass: 'text-stone-700',
      desc: '灰色偏暖，视觉更柔和。',
    },
    {
      name: '全浅灰',
      labelClass: 'text-zinc-500',
      valueClass: 'text-zinc-600',
      desc: '整体更安静，但识别度最低。',
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-slate-50 p-7">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <div className="text-sm font-black text-[#08AACE]">Select / Floating Label</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">选择框边框标签测试</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-400">
            测试把“模型”“提示词”放进选择框上边框缺口里，减少左侧文字占位，保留管理和禁用按钮。
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-black text-slate-900">方案 A：只嵌入模型</h2>
            <div className="space-y-4">
              <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} />
              <div className="grid grid-cols-[56px_minmax(0,1fr)_52px] items-center gap-2">
                <span className="text-sm font-bold text-slate-500">提示词</span>
                <FloatingLabelSelectMock label="" value="设定-测试" options={prompts} compact />
                <button className="h-11 rounded-xl border border-red-200 bg-red-50 text-xs font-black text-red-600">禁用</button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-black text-slate-900">方案 B：模型和提示词都嵌入</h2>
            <div className="space-y-4">
              <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} />
              <FloatingLabelSelectMock label="提示词" value="设定-测试" options={prompts} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-black text-slate-900">方案 C：禁用按钮多版本</h2>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">脑洞生成</h3>
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                  输出日志
                </button>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400">标签右侧小圆</div>
                  <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact />
                  <FloatingLabelSelectMock label="提示词" value="脑洞-测试版" options={prompts} showDisable disablePlacement="label" disableVariant="slash" compact />
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400">标签右侧文字</div>
                  <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact />
                  <FloatingLabelSelectMock label="提示词" value="脑洞-测试版" options={prompts} showDisable disablePlacement="label" disableVariant="labelPill" compact />
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400">左侧贴片</div>
                  <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact />
                  <FloatingLabelSelectMock label="提示词" value="脑洞-测试版" options={prompts} showDisable disablePlacement="left" disableVariant="leftTab" compact />
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400">右侧文字按钮</div>
                  <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact />
                  <FloatingLabelSelectMock label="提示词" value="脑洞-测试版" options={prompts} showDisable disablePlacement="side" disableVariant="text" compact />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-black text-slate-900">方案 D：无禁用窄栏</h2>
            <div className="w-[360px] max-w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">脑洞生成</h3>
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                  输出日志
                </button>
              </div>
              <div className="space-y-4">
                <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact />
                <FloatingLabelSelectMock label="提示词" value="脑洞-测试版" options={prompts} compact />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-5 text-base font-black text-slate-900">方案 E：标签左移到红框位置</h2>
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">大纲生成</h3>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                    输出日志
                  </button>
                </div>
                <div className="space-y-4">
                  <FloatingLabelSelectMock label="模型" value="GPT5.5" options={models} labelPosition="redFrame" />
                  <FloatingLabelSelectMock label="提示词" value="生成细纲" options={prompts} labelPosition="redFrame" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">脑洞生成</h3>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                    输出日志
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_52px] items-start gap-2">
                    <FloatingLabelSelectMock label="模型" value="DS-v4-flash" options={models} compact labelPosition="redFrame" />
                    <div aria-hidden="true" className="mt-2 h-11 w-[52px]" />
                  </div>
                  <FloatingLabelSelectMock
                    label="提示词"
                    value="脑洞-测试版"
                    options={prompts}
                    showDisable
                    disablePlacement="side"
                    disableVariant="text"
                    compact
                    labelPosition="redFrame"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">方案 F：模型/提示词字体颜色测试</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">只测试标签和选中内容的字体颜色，边框、管理按钮和布局保持不变。</p>
              </div>
              <div className="text-xs font-black text-slate-400">推荐先看：灰色稳重 / 青蓝一体</div>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {colorVariants.map((variant) => (
                <div key={variant.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{variant.name}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{variant.desc}</div>
                    </div>
                    <div className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-400 shadow-sm">
                      Test
                    </div>
                  </div>
                  <div className="space-y-4">
                    <FloatingLabelSelectMock
                      label="模型"
                      value="GPT5.5"
                      options={models}
                      labelPosition="redFrame"
                      labelTextClassName={variant.labelClass}
                      valueTextClassName={variant.valueClass}
                    />
                    <FloatingLabelSelectMock
                      label="提示词"
                      value="生成细纲"
                      options={prompts}
                      labelPosition="redFrame"
                      labelTextClassName={variant.labelClass}
                      valueTextClassName={variant.valueClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">方案 G：禁用图标嵌入选中内容左侧</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">点击左侧红色禁用图标可以切换启用/禁用，右侧不再额外占一个禁用按钮。</p>
              </div>
              <div className="text-xs font-black text-slate-400">提示词专用测试</div>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 text-sm font-black text-slate-900">默认可用</div>
                <FloatingLabelSelectMock
                  label="提示词"
                  value="设定-测试"
                  options={prompts}
                  showDisable
                  disablePlacement="inside"
                  disableVariant="slash"
                  labelPosition="redFrame"
                />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 text-sm font-black text-slate-900">默认禁用</div>
                <FloatingLabelSelectMock
                  label="提示词"
                  value="设定-测试"
                  options={prompts}
                  disabled
                  showDisable
                  disablePlacement="inside"
                  disableVariant="slash"
                  labelPosition="redFrame"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LogFoldSection({
  id,
  title,
  meta,
  content,
  collapsed,
  onToggle,
  tone = 'slate',
}: {
  id: string;
  title: string;
  meta: string;
  content: string;
  collapsed: boolean;
  onToggle: (id: string) => void;
  tone?: 'slate' | 'cyan' | 'amber';
}) {
  const toneClass = tone === 'cyan'
    ? 'border-cyan-100 bg-cyan-50/70 text-cyan-700'
    : tone === 'amber'
      ? 'border-amber-100 bg-amber-50/80 text-amber-700'
      : 'border-slate-100 bg-slate-50 text-slate-700';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-950">{title}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${toneClass}`}>{meta}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-400">折叠只影响当前查看，仍会完整发送给 AI。</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      {!collapsed && (
        <div className="ai-request-log-text whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-slate-700">
          {content}
        </div>
      )}
    </section>
  );
}

export function AiLogFoldingTestPage() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    prompt: false,
    context: false,
    user: false,
  });
  const toggleSection = (id: string) => {
    setCollapsedSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const promptText = [
    '你是番茄小说男频细纲编辑。',
    '',
    '用户会提供【小说大纲】和【前文章节细纲】。',
    '你的任务是根据这些内容，继续生成当前章节的“单章剧情细纲”。',
    '',
    '要求：',
    '1. 只生成当前这一章，不要生成后续章节。',
    '2. 细纲控制在300-500字。',
    '3. 必须承接前文章节细纲，尤其是上一章的结尾钩子。',
    '4. 不要写正文，不要写对白，只输出细纲结果。',
  ].join('\n');
  const contextText = [
    '【关联脑洞】',
    '主角修水管时发现小区地下水路连着旧城灵脉，水压异常其实是灵气潮汐。',
    '',
    '【读取设定 / 剧情大纲】',
    '第一卷围绕主角从普通维修工误入高武世界展开，核心冲突是旧城灵脉被商业势力暗中抽取。',
    '',
    '【前文细纲】',
    '第1章：主角接到深夜维修单，发现水表倒转。',
    '第2章：主角被神秘住户提醒不要碰地下阀门，但仍因责任心进入地下管廊。',
  ].join('\n');
  const userText = '根据当前设定，生成第3章细纲。要求主角发现第一个可利用的能力，但不要让他立刻变强。';
  const fullPayload = [
    '【System Prompt】',
    promptText,
    '',
    '【Context】',
    contextText,
    '',
    '【User Request】',
    userText,
  ].join('\n');

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <h1 className="text-xl font-black text-slate-950">输出日志折叠分组测试</h1>
        <p className="mt-1 text-xs font-bold text-slate-400">以大纲设定输出日志为原型：右侧内容分组折叠，但底层发送内容保持完整。</p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden bg-white">
        <aside className="border-r border-slate-100 bg-slate-50 p-5 text-sm">
          <div className="space-y-3">
            {[
              ['链路', '生成细纲'],
              ['模型', 'GPT5.5'],
              ['提示词', collapsedSections.prompt ? '已折叠 · 仍发送' : '展开显示'],
              ['关联内容', collapsedSections.context ? '已折叠 · 仍发送' : '脑洞 + 读取设定'],
              ['用户要求', collapsedSections.user ? '已折叠 · 仍发送' : '展开显示'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">{label}</div>
                <div className="mt-1 break-words font-black text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </aside>
        <main className="min-h-0 overflow-y-auto p-6">
          <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">
            这里测试的是“查看层折叠”：折叠某一组后只是不显示，下面完整发送预览仍然保留全部内容。
          </div>
          <div className="space-y-3">
            <LogFoldSection
              id="prompt"
              title="提示词"
              meta={`${promptText.length} 字符`}
              content={promptText}
              collapsed={Boolean(collapsedSections.prompt)}
              onToggle={toggleSection}
              tone="slate"
            />
            <LogFoldSection
              id="context"
              title="关联内容"
              meta="脑洞 / 读取设定 / 前文细纲"
              content={contextText}
              collapsed={Boolean(collapsedSections.context)}
              onToggle={toggleSection}
              tone="cyan"
            />
            <LogFoldSection
              id="user"
              title="用户要求"
              meta={`${userText.length} 字符`}
              content={userText}
              collapsed={Boolean(collapsedSections.user)}
              onToggle={toggleSection}
              tone="amber"
            />
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-black text-slate-950">完整发送预览</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">用于确认折叠没有改变实际发送给 AI 的内容。</p>
              </div>
              <div className="ai-request-log-text whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-slate-700">
                {fullPayload}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

type PlotPointSourceMode = 'library' | 'ai' | 'mixed';

type PlotPointCandidate = {
  id: string;
  title: string;
  source: '剧情库' | 'AI生成';
  originalGenre: string;
  original: string;
  adapted: string;
  variable: string;
};

const plotPointSourceModeMeta: Record<PlotPointSourceMode, { label: string; description: string }> = {
  library: {
    label: '剧情库',
    description: '让 AI 从剧情库里挑选，优先使用已有剧情骨架。',
  },
  ai: {
    label: 'AI生成',
    description: '让 AI 自由发挥，直接生成新的开头或衔接剧情。',
  },
  mixed: {
    label: '混合',
    description: '既可以从剧情库里选，也可以自由发挥，还能改写剧情库里不完美的点。',
  },
};

const openingPlotPointSeeds: PlotPointCandidate[] = [
  { id: 'opening-divorce', title: '开局被女主退婚', source: '剧情库', originalGenre: '玄幻', original: '主角开局被女主当众退婚，家族长辈也默认他没有未来。', adapted: '主角在祖祠前被女主当众退婚，婚书被灵火焚毁，族人认定他灵根已废。', variable: '退婚 / 家族羞辱 / 废灵根 -> 祖祠退婚 / 灵火焚书 / 灵根已废' },
  { id: 'opening-root-test', title: '测灵根被判废材', source: '剧情库', originalGenre: '玄幻', original: '主角在入门测试中被判资质极差，所有资源被转给弟弟。', adapted: '测灵台只亮一寸灰光，主角被逐出内院，原本属于他的筑基丹被转给堂弟。', variable: '入门测试 / 资源转移 -> 测灵台 / 筑基丹 / 堂弟' },
  { id: 'opening-relic-wakes', title: '旧物苏醒', source: 'AI生成', originalGenre: '玄幻', original: '主角被逐出家门后，母亲留下的旧物突然回应他的血。', adapted: '主角跌入后山寒潭，母亲留下的残玉吸收血迹，显出一门失传的炼体法。', variable: '旧物 / 血脉回应 -> 残玉 / 寒潭 / 炼体法' },
  { id: 'opening-missing-master', title: '师父失踪', source: '剧情库', originalGenre: '仙侠', original: '主角唯一的靠山师父失踪，他被迫独自面对宗门清算。', adapted: '师父闭关洞府只剩一盏将灭魂灯，执法堂当天就来收走主角的内门令牌。', variable: '靠山失踪 / 清算 -> 魂灯 / 执法堂 / 内门令牌' },
  { id: 'opening-beast-tide', title: '兽潮提前爆发', source: 'AI生成', originalGenre: '玄幻', original: '边城兽潮提前爆发，主角发现兽潮背后有人故意驱赶妖兽。', adapted: '黑雾妖潮提前三日撞城，主角在城墙下看到驱兽符燃尽后的灰烬。', variable: '兽潮 / 阴谋 -> 黑雾妖潮 / 驱兽符 / 城墙' },
  { id: 'opening-wrong-scripture', title: '拿到错误功法', source: '剧情库', originalGenre: '玄幻', original: '主角被分到一卷无人能练的残缺功法，却发现残缺处能和自身缺陷对应。', adapted: '藏经阁杂役丢给主角一卷残篇，他发现断掉的经脉反而能走残篇里的逆脉路线。', variable: '错误功法 / 缺陷对应 -> 残篇 / 断经脉 / 逆脉路线' },
  { id: 'opening-prison-mine', title: '被发配灵矿', source: '剧情库', originalGenre: '玄幻', original: '主角被污蔑偷盗，被罚去灵矿服役，却在矿脉深处听见古老呼吸。', adapted: '主角背上偷丹罪名，被押去黑石灵矿，夜里听见矿心传来像巨兽沉睡的呼吸。', variable: '偷盗 / 服役 / 古老呼吸 -> 偷丹 / 黑石灵矿 / 矿心巨兽' },
  { id: 'opening-wedding-ambush', title: '婚宴变杀局', source: 'AI生成', originalGenre: '武侠', original: '婚宴上所有宾客突然翻脸，主角意识到这场婚事从头到尾都是局。', adapted: '订亲宴上灵酒被下噬脉散，宾客同时亮出法器，主角才知婚约只是引他入局。', variable: '婚宴 / 毒酒 / 杀局 -> 订亲宴 / 噬脉散 / 法器围杀' },
  { id: 'opening-forbidden-name', title: '喊出禁忌真名', source: '剧情库', originalGenre: '悬疑', original: '主角无意喊出一个被抹去的名字，所有人突然对他露出杀意。', adapted: '主角在祖谱缺页处念出一位先祖真名，祠堂牌位同时裂开，族老当场封门。', variable: '禁忌名字 / 群体杀意 -> 祖谱缺页 / 牌位裂开 / 族老封门' },
  { id: 'opening-ordinary-job', title: '普通差事撞见秘辛', source: 'AI生成', originalGenre: '都市', original: '主角只是去送一封信，却撞见城主府正在秘密替换某位大人物。', adapted: '主角只是替药铺送药，却在城主府偏院看见一具和城主一模一样的傀儡身。', variable: '送信 / 替换人物 -> 送药 / 城主府 / 傀儡身' },
];

const followupPlotPointSeeds: PlotPointCandidate[] = [
  { id: 'follow-witness', title: '退婚现场出现见证者', source: 'AI生成', originalGenre: '玄幻', original: '退婚后，一位沉默旁观者突然指出婚书被人提前动过手脚。', adapted: '退婚后，守祠老仆捡起婚书灰烬，发现灵火里藏着夺运阵的残痕。', variable: '旁观者 / 手脚 -> 守祠老仆 / 婚书灰烬 / 夺运阵' },
  { id: 'follow-first-proof', title: '第一次证明自己', source: '剧情库', originalGenre: '玄幻', original: '主角不急着反击，而是用一个小事件证明自己并非彻底废掉。', adapted: '主角当晚修复祖祠熄灭多年的护族阵灯，证明自己的废灵根能感应古阵。', variable: '小事件证明 -> 护族阵灯 / 古阵感应' },
  { id: 'follow-hidden-curse', title: '发现退婚血咒', source: 'AI生成', originalGenre: '玄幻', original: '退婚不是结束，婚书燃尽后反而激活了压制主角的血咒。', adapted: '婚书灰烬钻入主角掌心，形成退婚血咒，每到子时就吞噬一缕灵气。', variable: '退婚后遗症 -> 掌心血咒 / 子时吞灵' },
  { id: 'follow-family-split', title: '家族内部站队', source: '剧情库', originalGenre: '家族流', original: '退婚事件逼迫家族内部表态，有人落井下石，也有人暗中递来资源。', adapted: '族会要剥夺主角月俸，小姑却偷偷塞给他一枚破损聚灵佩。', variable: '家族站队 -> 族会 / 月俸 / 聚灵佩' },
  { id: 'follow-heroine-note', title: '女主留下暗线', source: 'AI生成', originalGenre: '感情线', original: '女主退婚后留下似羞辱又似提醒的一句话，成为下一步线索。', adapted: '女主离开前说“别去后山”，主角偏偏在后山发现她被迫退婚的证据。', variable: '提醒话语 -> 后山禁地 / 被迫退婚证据' },
  { id: 'follow-rival-provokes', title: '情敌当众挑衅', source: '剧情库', originalGenre: '爽文', original: '新的追求者借退婚羞辱主角，反而给了主角公开反击的舞台。', adapted: '女主新靠山在演武场逼主角下跪，主角用废灵根引动破阵石，当众让对方灵剑失控。', variable: '情敌羞辱 -> 演武场 / 破阵石 / 灵剑失控' },
  { id: 'follow-old-debt', title: '退婚牵出旧债', source: 'AI生成', originalGenre: '玄幻', original: '主角发现退婚背后关联父辈旧债，事情不只是感情羞辱。', adapted: '主角在婚约玉册背面看见父亲血印，得知女主家当年欠下救命因果。', variable: '父辈旧债 -> 婚约玉册 / 血印 / 救命因果' },
  { id: 'follow-secret-master', title: '秘密师父观察', source: '剧情库', originalGenre: '师徒', original: '主角被羞辱时，有强者暗中观察，想确认他会不会彻底崩掉。', adapted: '祖祠梁上有一缕残魂看完退婚全程，决定用三夜时间考验主角心性。', variable: '强者观察 -> 残魂 / 三夜考验' },
  { id: 'follow-small-win', title: '先赢一场小胜', source: 'AI生成', originalGenre: '节奏点', original: '退婚后不立刻大爆发，而是安排一次小胜，让读者看到希望。', adapted: '主角不争婚约，只在族中药圃救活一株将死灵草，换来第一次修炼资源。', variable: '小胜 / 希望 -> 药圃 / 灵草 / 修炼资源' },
  { id: 'follow-forced-departure', title: '被迫离开家族', source: '剧情库', originalGenre: '流浪成长', original: '主角退婚后被赶出舒适区，进入更大的地图。', adapted: '族会宣布主角守矿三年，主角带着退婚血咒和残玉踏上黑石灵矿。', variable: '离家 / 新地图 -> 守矿 / 黑石灵矿 / 残玉' },
];

function expandPlotPointCandidates(seeds: PlotPointCandidate[]) {
  return seeds.flatMap((item) => [
    item,
    {
      ...item,
      id: `${item.id}-alt`,
      title: `${item.title}·延展`,
      original: `${item.original} 这个版本会把节奏稍微拉长一点。`,
      adapted: `${item.adapted} 这个版本再补一个小转折，让剧情更完整。`,
      variable: `${item.variable} / 延展`,
    },
  ]);
}

const openingPlotPointCandidates = expandPlotPointCandidates(openingPlotPointSeeds);
const followupPlotPointCandidates = expandPlotPointCandidates(followupPlotPointSeeds);

function getPlotPointText(item: PlotPointCandidate, length: 'short' | 'medium' | 'long') {
  if (length === 'short') return item.adapted;
  if (length === 'medium') return `${item.adapted} 这个点会占用一个完整场景，重点写主角被逼到台前后的反应和第一次选择。`;
  return `${item.adapted} 这个点可以扩展成一段较长剧情：先写羞辱或异常发生，再写主角发现细节，接着出现外部压力，最后用一个反转或钩子把读者引到下一场。`;
}

function getPlotPointReview(item: PlotPointCandidate, isFollowup: boolean) {
  if (item.id === 'opening-divorce') return 'AI评价：强情绪和强冲突都足，适合做开头；建议别马上翻盘，把羞辱、误会和女主隐藏压力留到后面慢慢揭开。';
  if (isFollowup) return 'AI评价：适合作为衔接点，能承接上一剧情的后果；建议补一个明确的小目标，让读者知道下一章要看主角解决什么。';
  return `AI评价：这个开头能快速建立${item.originalGenre}感和主角处境；建议再加一个钩子，把主角短期目标和隐藏危机绑在一起。`;
}

type PlotPointChainSlot = 1 | 2 | 3;

const plotPointChainSlots: PlotPointChainSlot[] = [1, 2, 3];

const plotPointSettingLinkOptions = [
  { id: 'plot-outline', label: '剧情大纲', group: '核心设定', preview: '主线目标、阶段矛盾、关键转折。' },
  { id: 'worldview', label: '世界观', group: '核心设定', preview: '修炼体系、势力格局、地图规则。' },
  { id: 'protagonist-cheat', label: '主角金手指', group: '角色设定', preview: '能力来源、限制、成长节奏。' },
  { id: 'character-relations', label: '角色关系', group: '角色设定', preview: '女主、家族、敌人与盟友关系。' },
  { id: 'genre', label: '题材', group: '基础信息', preview: '玄幻、仙侠、都市高武等题材约束。' },
  { id: 'theme', label: '故事主题', group: '基础信息', preview: '系统流、凡人流、复仇成长等方向。' },
];

function PlotPointWorkbenchTestPage() {
  const [sourceMode, setSourceMode] = useState<PlotPointSourceMode>('library');
  const [generateCount, setGenerateCount] = useState<10 | 20 | 30>(10);
  const [pointLength, setPointLength] = useState<'short' | 'medium' | 'long'>('short');
  const [activeChainSlot, setActiveChainSlot] = useState<PlotPointChainSlot>(1);
  const [chainSelections, setChainSelections] = useState<Record<PlotPointChainSlot, string[]>>({
    1: [],
    2: [],
    3: [],
  });
  const [chainRefreshStates, setChainRefreshStates] = useState<Record<PlotPointChainSlot, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<string[]>([]);
  const openingRequirement = '开局要有压迫感，主角暂时不能立刻翻身。';
  const [openingElements, setOpeningElements] = useState<string[]>(['强情绪', '强冲突']);
  const [isSettingLinkModalOpen, setIsSettingLinkModalOpen] = useState(false);
  const [isOutputLogOpen, setIsOutputLogOpen] = useState(false);
  const [linkedSettingIds, setLinkedSettingIds] = useState<string[]>([
    'plot-outline',
    'worldview',
    'protagonist-cheat',
    'character-relations',
  ]);

  const selectedIds = chainSelections[activeChainSlot];
  const followupRefreshed = chainRefreshStates[activeChainSlot];
  const hasChain = selectedIds.length > 0;
  const isFollowupStage = hasChain && followupRefreshed;
  const candidatePool = isFollowupStage ? followupPlotPointCandidates : openingPlotPointCandidates;
  const visibleCandidates = candidatePool.slice(0, generateCount);
  const selectedItems = selectedIds
    .map((id) => [...openingPlotPointCandidates, ...followupPlotPointCandidates].find((item) => item.id === id))
    .filter((item): item is PlotPointCandidate => Boolean(item));
  const firstChainTitle = selectedItems[0]?.title ?? '还没有第1号剧情';
  const firstChainContent = selectedItems[0] ? getPlotPointText(selectedItems[0], pointLength) : '';
  const linkedSettingLabels = plotPointSettingLinkOptions
    .filter((item) => linkedSettingIds.includes(item.id))
    .map((item) => item.label);
  const linkedSettingSummary = linkedSettingLabels.length > 0 ? linkedSettingLabels.join('、') : '未关联设定';

  const togglePlotPoint = (id: string) => {
    setChainSelections((current) => {
      const currentChain = current[activeChainSlot];
      return {
        ...current,
        [activeChainSlot]: currentChain.includes(id)
          ? currentChain.filter((itemId) => itemId !== id)
          : [...currentChain, id],
      };
    });
    setChainRefreshStates((current) => ({ ...current, [activeChainSlot]: false }));
  };

  const toggleOpeningElement = (element: string) => {
    setOpeningElements((current) => (
      current.includes(element)
        ? current.filter((item) => item !== element)
        : [...current, element]
    ));
  };

  const toggleLinkedSetting = (settingId: string) => {
    setLinkedSettingIds((current) => (
      current.includes(settingId)
        ? current.filter((item) => item !== settingId)
        : [...current, settingId]
    ));
  };

  const togglePreviewExpanded = (candidateId: string) => {
    setExpandedPreviewIds((current) => (
      current.includes(candidateId)
        ? current.filter((item) => item !== candidateId)
        : [...current, candidateId]
    ));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f8fb]">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black text-[#08AACE]">06号测试</div>
            <h1 className="mt-1 text-xl font-black text-slate-950">剧情链旧版架构备份</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">保留正式剧情链弹窗改版前的三栏结构，方便以后对照或恢复旧版布局。</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative flex h-[58px] w-[350px] items-center rounded-[28px] border-2 border-[#08AACE] bg-white pl-9 pr-2">
              <span className="absolute -top-3 left-7 bg-white px-1 text-sm font-black text-slate-950">模型</span>
              <span className="min-w-0 flex-1 truncate text-lg font-black text-slate-950">DS-v4-flash</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-900" />
              <span className="mx-3 h-8 w-px bg-slate-200" />
              <button type="button" className="h-9 shrink-0 rounded-xl px-2 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]">
                管理
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOutputLogOpen(true)}
              className="h-[58px] rounded-[24px] border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]"
            >
              输出日志
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_370px] gap-4 overflow-hidden p-5">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              {plotPointChainSlots.map((slot) => {
                const active = activeChainSlot === slot;
                const hasContent = chainSelections[slot].length > 0;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setActiveChainSlot(slot)}
                    title={`剧情链 ${slot}`}
                    className={`relative grid h-7 w-7 place-items-center rounded-lg text-xs font-black transition-colors ${
                      active
                        ? 'bg-[#08AACE] text-white'
                        : hasContent
                        ? 'border border-[#bdeef7] bg-[#EAF9FD] text-[#08AACE] hover:border-[#08AACE]'
                        : 'border border-slate-200 bg-white text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]'
                    }`}
                  >
                    {slot}
                    {hasContent && !active && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#08AACE]" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-950">剧情链</h2>
                <p className="text-xs font-bold text-slate-400">选中的剧情点会按顺序拼接</p>
              </div>
              <span className="rounded-full bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#08AACE]">{selectedItems.length} 点</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {selectedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold leading-7 text-slate-500">
                小说正文还是空的。先在 AI 对话框输入区上方点击“关联”，选择大纲设定，再选择用户要求元素。
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-[#bdeef7] bg-[#EAF9FD] p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#08AACE] text-xs font-black text-white">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-950">{item.title}</span>
                      <button type="button" onClick={() => togglePlotPoint(item.id)} className="text-xs font-black text-red-500">移除</button>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{getPlotPointText(item, pointLength)}</p>
                    <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                      {getPlotPointReview(item, isFollowupStage)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <section className="mt-4 rounded-2xl border border-[#bdeef7] bg-white p-4">
              <div className="text-sm font-black text-slate-950">AI 组链思路</div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                {isFollowupStage
                  ? `下一批剧情点应围绕「${firstChainTitle}」继续：先承接后果，再给主角一个小目标，最后埋下更大敌人的线索。`
                  : hasChain
                  ? `已选第1号「${firstChainTitle}」。现在需要手动点“刷新剧情点”，让 AI 读取第1号内容后再生成衔接剧情。`
                  : '第一批剧情点只负责开局：要快速建立主角处境、冲突、金手指或短期目标，不要急着进入中后期地图。'}
              </p>
            </section>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <div>
              <h2 className="text-sm font-black text-slate-950">剧情点预览</h2>
              <p className="text-xs font-bold text-slate-400">
                {isFollowupStage ? `正在生成衔接「${firstChainTitle}」的剧情点` : hasChain ? '仍显示当前剧情点，等待手动刷新' : '正在生成剧情点'} · {generateCount} 个
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (hasChain) setChainRefreshStates((current) => ({ ...current, [activeChainSlot]: true }));
              }}
              disabled={!hasChain}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-[#08AACE] hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Database className="h-4 w-4" />
              刷新剧情点
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {visibleCandidates.map((item, index) => {
                const selected = selectedIds.includes(item.id);
                const expanded = expandedPreviewIds.includes(item.id);
                return (
                  <div key={item.id} className={`rounded-xl border px-3 py-2.5 ${selected ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-[11px] font-black text-white">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0 truncate text-sm font-black text-slate-950">{item.title}</span>
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]">{item.source}</span>
                        </div>
                        <p className={`mt-1 text-xs font-bold leading-5 ${selected ? 'text-slate-800' : 'text-slate-600'}`}>{getPlotPointText(item, pointLength)}</p>
                        {expanded && (
                          <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                            <p className="text-xs font-bold leading-5 text-slate-400">原剧情点：{item.original}</p>
                            <div className="rounded-xl bg-[#FFF7ED] px-3 py-2 text-xs font-bold leading-5 text-amber-700">变量替换：{item.variable}</div>
                            <div className="rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                              {getPlotPointReview(item, isFollowupStage)}
                            </div>
                            <div className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500">原型：{item.originalGenre}</div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePreviewExpanded(item.id)}
                        className="h-8 w-12 shrink-0 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]"
                      >
                        {expanded ? '收起' : '展开'}
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePlotPoint(item.id)}
                        className={`h-8 w-14 shrink-0 rounded-lg text-xs font-black ${selected ? 'bg-slate-900 text-white' : 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'}`}
                      >
                        {selected ? '已选' : '选择'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="flex h-14 shrink-0 items-center border-b border-slate-100 px-4">
            <div>
              <h2 className="text-sm font-black text-slate-950">AI 配置与生成</h2>
              <p className="text-xs font-bold text-slate-400">来源、数量、长度、用户要求常驻显示</p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点来源：</span>
                  <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {(['library', 'ai', 'mixed'] as PlotPointSourceMode[]).map((mode, index, list) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSourceMode(mode)}
                        className={`h-9 min-w-0 flex-1 border-r text-xs font-black last:border-r-0 ${
                          sourceMode === mode
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                            : index === list.length - 1
                            ? 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {plotPointSourceModeMeta[mode].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">生成配置：</span>
                  <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {([10, 20, 30] as const).map((count, index, list) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setGenerateCount(count)}
                        className={`h-9 min-w-0 flex-1 border-r text-xs font-black last:border-r-0 ${
                          generateCount === count
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                            : index === list.length - 1
                            ? 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {count}个
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点长度：</span>
                  <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {([
                      ['short', '短'],
                      ['medium', '中'],
                      ['long', '长'],
                    ] as const).map(([key, label], index, list) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPointLength(key)}
                        className={`h-9 min-w-0 flex-1 border-r text-xs font-black last:border-r-0 ${
                          pointLength === key
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                            : index === list.length - 1
                            ? 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">用户要求：</span>
                  <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {(['强情绪', '强冲突', '强悬念'] as const).map((element, index, list) => (
                      <button
                        key={element}
                        type="button"
                        onClick={() => toggleOpeningElement(element)}
                        className={`h-9 min-w-0 flex-1 border-r text-xs font-black last:border-r-0 ${
                          openingElements.includes(element)
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                            : index === list.length - 1
                            ? 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {element}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-[96px] shrink-0" />
                  <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {(['强期待', '强爽点', '强压迫'] as const).map((element, index, list) => (
                      <button
                        key={element}
                        type="button"
                        onClick={() => toggleOpeningElement(element)}
                        className={`h-9 min-w-0 flex-1 border-r text-xs font-black last:border-r-0 ${
                          openingElements.includes(element)
                            ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                            : index === list.length - 1
                            ? 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {element}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="relative mt-4 rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-5">
              <div className="absolute -top-2 left-4 bg-white px-1 text-sm font-black text-slate-950">AI对话框</div>
              <button type="button" className="absolute -top-2 right-4 bg-white px-1 text-xs font-black text-red-500">清空</button>
              <div className="min-h-[170px] whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-600">
                <div className="mb-2 inline-flex rounded-full bg-[#EAF9FD] px-2 py-1 text-[11px] font-black text-[#078fb0]">已思考（用时 16 秒）</div>
                <div>
                  {isFollowupStage
                    ? `刷新时 AI 已读取第1号剧情：${firstChainContent}\n\nAI评价：第1号已经有情绪和冲突，下一轮不要重复退婚羞辱，要写“后果”和“选择”。推荐生成：退婚后的反应、第一场小胜、女主隐藏压力、幕后黑手线索。`
                    : hasChain
                    ? `已选第1号「${firstChainTitle}」，但还没有刷新衔接剧情点。AI评价：这个点适合开头，但单独存在还不够，需要下一批剧情把羞辱变成目标、线索或代价。点击“刷新剧情点”后，AI 会读取第1号内容再生成下一批。`
                    : `当前小说没有正文，只有设定。用户要求：${openingRequirement}\n已选元素：${openingElements.join('、') || '未选择'}。\n\nAI评价：生成开头时优先挑能同时满足“情绪冲击、明确矛盾、下一章期待”的剧情点，避免只有设定展示，没有主角压力。`}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#bdeef7] bg-[#EAF9FD] px-2 py-2">
                <button
                  type="button"
                  onClick={() => setIsSettingLinkModalOpen(true)}
                  className="h-8 shrink-0 rounded-lg bg-white px-3 text-xs font-black text-[#08AACE] shadow-sm"
                >
                  关联
                </button>
                <div className="min-w-0 flex-1 truncate text-xs font-bold text-[#078fb0]">
                  {linkedSettingIds.length > 0 ? `已关联：${linkedSettingSummary}` : '未关联大纲设定'}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 focus-within:border-[#08AACE]">
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300"
                  placeholder="请输入要求"
                />
                <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#08AACE] text-[#08AACE]" title="发送">
                  <SendHorizontal className="h-4 w-4" />
                </button>
                <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-red-200 bg-red-500 text-white" title="停止">
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </section>
          </div>
        </aside>
      </main>
      {isOutputLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-6">
          <div className="flex max-h-[78vh] w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div>
                <div className="text-sm font-black text-slate-950">输出日志</div>
                <div className="text-xs font-bold text-slate-400">查看本次剧情点请求会发送给 AI 的内容</div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutputLogOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-black text-slate-950">AI配置</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">模型：DS-v4-flash</div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">来源：{plotPointSourceModeMeta[sourceMode].label}</div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">数量：{generateCount}个</div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">长度：{pointLength === 'short' ? '短' : pointLength === 'medium' ? '中' : '长'}</div>
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-black text-slate-950">关联设定</div>
                  <div className="mt-2 rounded-lg bg-[#EAF9FD] px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                    {linkedSettingIds.length > 0 ? linkedSettingSummary : '未关联大纲设定'}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-black text-slate-950">用户要求</div>
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                    {openingElements.length > 0 ? openingElements.join('、') : '未选择'}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-sm font-black text-slate-950">剧情链上下文</div>
                  <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                    {selectedItems.length > 0
                      ? selectedItems.map((item, index) => `${index + 1}. ${item.title}：${getPlotPointText(item, pointLength)}`).join('\n')
                      : '当前剧情链为空，将按关联设定生成候选剧情点。'}
                  </div>
                </section>
              </div>
            </div>
            <div className="flex h-14 shrink-0 items-center justify-end border-t border-slate-100 px-4">
              <button
                type="button"
                onClick={() => setIsOutputLogOpen(false)}
                className="h-9 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {isSettingLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-6">
          <div className="flex max-h-[78vh] w-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div>
                <div className="text-sm font-black text-slate-950">关联大纲设定</div>
                <div className="text-xs font-bold text-slate-400">选择要发送给 AI 的设定内容</div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingLinkModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {plotPointSettingLinkOptions.map((item) => {
                  const selected = linkedSettingIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleLinkedSetting(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${selected ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white hover:border-[#08AACE]'}`}
                    >
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${selected ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 text-transparent'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-950">{item.label}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500">{item.group}</span>
                        </span>
                        <span className="mt-1 block text-xs font-bold text-slate-400">{item.preview}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex h-14 shrink-0 items-center justify-between border-t border-slate-100 px-4">
              <div className="min-w-0 truncate text-xs font-bold text-slate-500">
                {linkedSettingIds.length > 0 ? `已关联 ${linkedSettingIds.length} 项：${linkedSettingSummary}` : '当前没有关联设定'}
              </div>
              <button
                type="button"
                onClick={() => setIsSettingLinkModalOpen(false)}
                className="h-9 shrink-0 rounded-lg bg-[#08AACE] px-4 text-xs font-black text-white"
              >
                确认关联
              </button>
            </div>
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
  const [completedTestPaths, setCompletedTestPaths] = useState<Set<string>>(() => new Set(readCompletedTestPaths()));

  useEffect(() => {
    const showIndex = () => setActivePath(null);
    window.addEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
    return () => window.removeEventListener(TEST_COLLECTION_SHOW_INDEX_EVENT, showIndex);
  }, []);

  const activeItem = useMemo(() => (
    testGroups.flatMap((group) => group.items).find((item) => item.path === activePath) ?? null
  ), [activePath]);
  const activeNumber = activePath ? formatTestNumber(activePath) : null;

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
    setActivePath(path);
  };

  const toggleCompletedTest = (path: string) => {
    setCompletedTestPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      localStorage.setItem(TEST_COLLECTION_COMPLETED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const visibleGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return testGroups;
    return testGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (
          formatTestNumber(item.path).includes(keyword) ||
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.badge.toLowerCase().includes(keyword)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  const totalCount = testGroups.reduce((sum, group) => sum + group.items.length, 0);
  const completedCount = completedTestPaths.size;

  const renderActiveTest = () => {
    switch (activePath) {
      case '/brainstorm-ai-chain-test':
        return <BrainstormAiChainTestPage />;
      case '/creation-flow-page-test':
        return <CreationFlowPageTestPage />;
      case '/novel-detail-overview-test':
        return <NovelDetailOverviewTestPage />;
      case '/plot-point-workbench-test':
        return <PlotPointWorkbenchTestPage />;
      case '/plot-chain-preview-design-test':
        return <PlotChainPreviewDesignTestPage />;
      case '/ai-log-folding-test':
        return <AiLogFoldingTestPage />;
      case '/hidden-pages-test':
        return <HiddenPagesTestPage />;
      case '/error-log':
        return <ErrorLogPage />;
      case '/software-ui-catalog':
        return <SoftwareUiCatalogPage embedded onClose={() => setActivePath(null)} />;
      case '/ui-landing-scenarios-test':
        return <UiLandingScenariosTestPage />;
      case '/select-floating-label-test':
        return <SelectFloatingLabelTestPage />;
      case '/management-drawer-test':
        return <ManagementDrawerTestPage />;
      case '/prompt-taxonomy-test':
        return <PromptTaxonomyTestPage />;
      case '/theme-colors':
        return <DarkThemeColorPage variant="modal" onClose={() => setActivePath(null)} />;
      case '/test-browser':
        return <TestBrowserPage />;
      default:
        return null;
    }
  };

  if (activePath) {
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
          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 px-4 text-sm font-black text-slate-700">
            <span className="min-w-0 truncate">{activeItem ? `${activeNumber}号测试：${activeItem.title}` : '测试内容'}</span>
            {activePath && (
              <button
                type="button"
                onClick={() => toggleCompletedTest(activePath)}
                className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs font-black transition-colors ${
                  completedTestPaths.has(activePath)
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#08AACE] hover:text-[#078fb0]'
                }`}
              >
                <span className={`grid h-4 w-4 place-items-center rounded border ${completedTestPaths.has(activePath) ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 text-transparent'}`}>
                  <Check className="h-3 w-3" />
                </span>
                完成测试
              </button>
            )}
          </div>
          <button
            onClick={() => setActivePath(null)}
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
            <p className="mt-0.5 text-xs text-slate-400">已收纳 {totalCount} 个测试内容 · 已勾选 {completedCount} 个</p>
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
                  const completed = completedTestPaths.has(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => openTestPage(item.path)}
                      className="group flex min-h-[128px] flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
                            {formatTestNumber(item.path)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            role="checkbox"
                            aria-checked={completed}
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleCompletedTest(item.path);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              event.preventDefault();
                              event.stopPropagation();
                              toggleCompletedTest(item.path);
                            }}
                            className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors ${
                              completed
                                ? 'border-[#08AACE] bg-[#08AACE] text-white'
                                : 'border-slate-200 bg-white text-slate-300 hover:border-[#08AACE] hover:text-[#078fb0]'
                            }`}
                            title={completed ? '取消完成勾选' : '勾选为完成测试'}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:bg-brand-light group-hover:text-brand">
                            {item.badge}
                          </span>
                        </div>
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
