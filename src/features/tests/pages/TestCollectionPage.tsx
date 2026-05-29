import {
  ArrowLeft,
  Check,
  ChevronDown,
  EyeOff,
  Globe,
  Moon,
  Palette,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
}: {
  label: string;
  value: string;
  options: string[];
  disabled?: boolean;
  showDisable?: boolean;
  disablePlacement?: 'side' | 'label' | 'left' | 'both';
  disableVariant?: 'slash' | 'labelPill' | 'leftTab' | 'text';
  compact?: boolean;
  labelPosition?: 'default' | 'redFrame';
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [isDisabled, setIsDisabled] = useState(disabled);
  const visibleValue = isDisabled ? `${label || '提示词'}已禁用` : selected;
  const showSideDisable = showDisable && disablePlacement === 'side';
  const showLabelDisable = showDisable && (disablePlacement === 'label' || disablePlacement === 'both');
  const showLeftDisable = showDisable && (disablePlacement === 'left' || disablePlacement === 'both');
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
      <div className={`relative min-w-0 ${useRedFrameLabel ? 'pt-2' : ''}`}>
        {showLeftDisable && (
          <div className={`absolute top-[calc(50%+4px)] z-10 -translate-y-1/2 bg-white py-1 ${disableVariant === 'leftTab' ? '-left-1' : '-left-3'}`}>
            {disableIconButton(disableVariant === 'leftTab' ? '' : 'h-7 w-7')}
          </div>
        )}
        <div
          className={`relative min-w-0 overflow-hidden rounded-[24px] border-2 bg-white p-0 shadow-[0_8px_18px_rgba(8,170,206,0.08)] ${
            isDisabled ? 'border-slate-200 text-slate-400' : 'border-[#08AACE] text-slate-900'
          }`}
        >
          {label && (
            <div className={`${useRedFrameLabel ? 'absolute left-7 top-0 z-10 -translate-y-1/2 bg-white' : 'absolute left-10 top-0 z-10 -translate-y-1/2 bg-white'} max-w-[120px] px-1 text-sm font-black leading-none text-slate-800`}>
              <span className="inline-flex items-center gap-2">
                {label}
                {showLabelDisable && disableIconButton('-my-2')}
              </span>
            </div>
          )}
          <div className={`flex overflow-hidden ${compact ? 'h-10' : 'h-12'}`}>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setOpen((current) => !current)}
              className={`${useRedFrameLabel ? 'px-7' : 'px-10'} min-w-0 flex-1 text-left text-base font-black disabled:cursor-not-allowed`}
            >
              <span className="block truncate">{visibleValue}</span>
            </button>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => setOpen((current) => !current)}
              className="grid w-11 shrink-0 place-items-center bg-transparent text-slate-700 transition-colors hover:bg-transparent hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
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
        </div>
      </div>
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
    setActivePath(path);
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
      case '/ui-landing-scenarios-test':
        return <UiLandingScenariosTestPage />;
      case '/select-floating-label-test':
        return <SelectFloatingLabelTestPage />;
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
          <div className="min-w-0 flex-1 px-4 text-center text-sm font-black text-slate-700">
            {activeItem?.title ?? '测试内容'}
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
