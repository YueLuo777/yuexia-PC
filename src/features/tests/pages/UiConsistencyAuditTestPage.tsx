import { AlertTriangle, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

import {
  UiConsistencyAuditPreview,
  type UiAuditPreviewKind,
} from '@/features/tests/pages/UiConsistencyAuditPreviews';
import { usePersistentState } from '@/shared/hooks/usePersistentState';

const UI_AUDIT_SELECTIONS_KEY = 'xinyuexia_ui_consistency_audit_selections_v1';

type AuditVariant = {
  name: string;
  entry: string;
  source: string;
  difference: string;
  preview: UiAuditPreviewKind;
};

type AuditGroup = {
  number: number;
  title: string;
  priority: '优先统一' | '随后统一';
  sharedPurpose: string;
  preferred: string;
  variants: AuditVariant[];
};

const AUDIT_GROUPS: AuditGroup[] = [
  {
    number: 1,
    title: '工作台素材库侧栏和条目',
    priority: '优先统一',
    sharedPurpose: '都在工作台中负责“按分类找素材、选择条目、编辑内容”，但切换大类后整套侧栏会变样。',
    preferred: '统一为一套素材库骨架，只让角色状态、设定字段等业务内容不同。',
    variants: [
      {
        name: '角色资料库版本',
        entry: '我的小说 → 打开作品 → 创作工坊 → 人物设定',
        source: 'workbenchRoleSidebar.tsx / workbenchRoleLibraryView.tsx',
        difference: '左栏留白较宽，搜索和新建区域独立，条目是大圆角卡片，并带人物状态和置顶操作。',
        preview: 'role-library',
      },
      {
        name: '设定资料库版本',
        entry: '我的小说 → 打开作品 → 创作工坊 → 大纲设定',
        source: 'workbenchLibrarySidebar.tsx / workbenchSettingLibraryWorkspaceView.tsx',
        difference: '分类和条目更紧凑，使用文件夹式目录，工具区、选中态和角色版本不同。',
        preview: 'setting-library',
      },
      {
        name: '简单资料库回退版本',
        entry: '创作工坊中进入未使用角色/设定专用页面的其他资料标签',
        source: 'workbenchSimpleLibraryView.tsx',
        difference: '固定 220px 左栏、小号卡片、顶部加号新建，编辑区和空状态又是一套样式。',
        preview: 'simple-library',
      },
    ],
  },
  {
    number: 2,
    title: '关联资料阅读器',
    priority: '优先统一',
    sharedPurpose: '都用于浏览候选资料、预览内容并确认关联，属于同一种选择器。',
    preferred: '统一标题栏、分类栏、预览、复选框和底部确认区；单选、多选、第三栏作为配置项。',
    variants: [
      {
        name: '关联脑洞',
        entry: '创作工坊 → 大纲设定 → 选中设定 → 关联脑洞',
        source: 'BrainstormReaderModal.tsx',
        difference: '两栏大卡片布局，点击候选卡片即选中，关联按钮放在预览卡片内部。',
        preview: 'brainstorm-reader',
      },
      {
        name: '关联其他设定',
        entry: '创作工坊 → 大纲设定 → 选中设定 → 其他设定',
        source: 'workbenchOtherSettingReaderModal.tsx',
        difference: '两栏目录布局，预览和复选框分离，顶部有分类、全选和搜索。',
        preview: 'setting-reader',
      },
      {
        name: '章纲关联资料',
        entry: '创作工坊 → 章纲 → 选择章节 → 关联资料',
        source: 'workbenchDetailOutlineReaderModal.tsx',
        difference: '三栏布局，同时放章纲、设定、角色；外观接近“其他设定”，但仍是独立实现。',
        preview: 'outline-reader',
      },
    ],
  },
  {
    number: 3,
    title: '点评、润色、状态三栏工作流',
    priority: '优先统一',
    sharedPurpose: '都采用“章节目录 → 内容预览 → AI 参数”的三栏工作流程。',
    preferred: '共用一个章节工作流外壳，统一窗口尺寸、标题栏、三栏宽度和拖动缩放能力。',
    variants: [
      {
        name: '综合点评 / 文笔润色',
        entry: '创作工坊 → 正文 → 顶部流程按钮“综合点评”或“文笔润色”',
        source: 'ChapterReviewPanel.tsx',
        difference: '约 1180×720，使用 Portal，窗口可拖动并可从四边调整大小。',
        preview: 'review-workflow',
      },
      {
        name: '更新状态',
        entry: '创作工坊 → 正文 → 顶部流程按钮“更新状态”',
        source: 'ChapterStatusPanel.tsx',
        difference: '约 1280×78vh，三栏内部相似，但外层窗口不能像点评窗口那样拖动和缩放。',
        preview: 'status-workflow',
      },
    ],
  },
  {
    number: 4,
    title: '全局弹窗外壳',
    priority: '优先统一',
    sharedPurpose: '都是应用内浮层窗口，但标题栏、遮罩、圆角和关闭行为随功能各自实现。',
    preferred: '普通弹窗使用 AppModalShell，工作台弹窗使用 WorkbenchModal，危险确认使用 ConfirmDialog。',
    variants: [
      {
        name: '统一弹窗版本',
        entry: '我的小说 → 新建作品 / 导入作品；创作工坊 → 作品信息等',
        source: 'AppModalShell.tsx / WorkbenchModal.tsx',
        difference: '统一 Portal、Esc、拖动、缩放、标题栏、关闭按钮和遮罩。',
        preview: 'standard-modal',
      },
      {
        name: '手写弹窗版本',
        entry: '小说封面、角色历史、脑洞提示词、章节回收站等多个入口',
        source: 'NovelCoverModal.tsx 等约 32 个手写遮罩文件',
        difference: '遮罩深浅、圆角、标题字号、关闭按钮和能否拖动缩放均不一致。',
        preview: 'handmade-modal',
      },
    ],
  },
  {
    number: 5,
    title: '软件设置页面壳',
    priority: '随后统一',
    sharedPurpose: '系统、快捷键和导航都属于“软件设置”，但各自维护页面和弹窗外壳。',
    preferred: '统一设置页标题、返回按钮、内容宽度、辅助操作和滚动区域。',
    variants: [
      {
        name: '系统设置',
        entry: '设置 → 用户设置 → 系统设置',
        source: 'SystemSettingsModal.tsx',
        difference: '页面最大宽度约 1040，弹窗约 936，标题以纯文字为主。',
        preview: 'system-settings',
      },
      {
        name: '快捷键设置',
        entry: '设置 → 用户设置 → 快捷键设置',
        source: 'ShortcutSettingsModal.tsx',
        difference: '页面最大宽度约 1180，带图标和说明文字，并有独立恢复默认操作。',
        preview: 'shortcut-settings',
      },
      {
        name: '导航设置',
        entry: '设置 → 用户设置 → 导航设置',
        source: 'NavSettingsModal.tsx',
        difference: '页面最大宽度约 1120，弹窗只有约 640，标题和说明字号明显更大。',
        preview: 'navigation-settings',
      },
    ],
  },
  {
    number: 6,
    title: '小型表单、确认框和空状态',
    priority: '随后统一',
    sharedPurpose: '都是高频基础反馈，但目前会因所在功能不同而出现不同按钮、边框和留白。',
    preferred: '新建/重命名使用统一 FormDialog，删除使用 ConfirmDialog，空内容使用统一 EmptyState。',
    variants: [
      {
        name: '新建与重命名',
        entry: '提示词管理 → 新增分类；人物设定 → 新建角色；我的小说 → 重命名',
        source: 'PromptCategoryCreateModal.tsx / RoleCreateDialog.tsx / NovelLibraryPage.tsx',
        difference: '标题栏、输入框高度、底部按钮区和取消按钮外观各不相同。',
        preview: 'compact-dialogs',
      },
      {
        name: '删除确认',
        entry: '我的小说 → 删除作品；提示词、章节和工作台资料删除入口',
        source: 'NovelDeleteConfirmModal.tsx / ConfirmDialog.tsx',
        difference: '项目已有标准确认框，但小说删除仍使用另一套尺寸、图标和按钮。',
        preview: 'delete-dialogs',
      },
      {
        name: '空状态',
        entry: '脑洞、角色库、章纲目录、回收站和简单资料库没有内容时',
        source: 'BrainstormReaderModal.tsx / OutlineWorkspaceView.tsx / workbenchSimpleLibraryView.tsx 等',
        difference: '有纯文字、虚线框、灰底和白底等版本，圆角、字号、字重也不一致。',
        preview: 'empty-states',
      },
    ],
  },
];

export function UiConsistencyAuditTestPage() {
  const [selections, setSelections] = usePersistentState<Record<string, number>>(UI_AUDIT_SELECTIONS_KEY, {});
  const selectedCount = AUDIT_GROUPS.filter((group) => selections[String(group.number)] !== undefined).length;

  const selectVariant = (groupNumber: number, variantIndex: number) => {
    setSelections((current) => ({ ...current, [String(groupNumber)]: variantIndex }));
  };

  return (
    <main className="min-h-full bg-slate-50 px-5 py-6 text-slate-800">
      <div className="mx-auto max-w-[1380px]">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#08AACE]">UI consistency audit</p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">同类 UI 差异与实际位置</h1>
              <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-slate-500">
                下面不是要求全部变成完全相同的内容，而是让同一业务大类共用同一套外壳；业务必须不同的部分再单独保留。
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              已选择 {selectedCount} / {AUDIT_GROUPS.length} 类
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-2xl border border-[#9BEFFC] bg-[#F8FDFF] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">你的统一选择</h2>
              <p className="mt-1 text-sm text-slate-500">在下方每一类中点击“选择此版本”，这里会自动汇总并保存。</p>
            </div>
            <button
              type="button"
              onClick={() => setSelections({})}
              disabled={selectedCount === 0}
              className="h-8 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078FAE] disabled:cursor-not-allowed disabled:text-slate-300"
            >
              清空全部选择
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {AUDIT_GROUPS.map((group) => {
              const selectedIndex = selections[String(group.number)];
              const selectedVariant = selectedIndex === undefined ? null : group.variants[selectedIndex];
              return (
                <div
                  key={group.number}
                  data-testid={`audit-summary-${group.number}`}
                  className={`rounded-xl border px-3 py-3 ${selectedVariant ? 'border-[#08AACE] bg-white' : 'border-dashed border-slate-300 bg-white/70'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-md text-xs font-black ${selectedVariant ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {group.number}
                    </span>
                    <strong className="min-w-0 truncate text-sm text-slate-800">{group.title}</strong>
                  </div>
                  <p className={`mt-2 text-xs font-bold ${selectedVariant ? 'text-[#078FAE]' : 'text-slate-400'}`}>
                    {selectedVariant ? `已选：版本 ${selectedIndex + 1} · ${selectedVariant.name}` : '还未选择，请在下方选择一个版本'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-5 space-y-5">
          {AUDIT_GROUPS.map((group) => (
            <section key={group.number} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
                    {group.number}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-950">{group.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${group.priority === '优先统一' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {group.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{group.sharedPurpose}</p>
                  </div>
                </div>
                <div className="flex max-w-xl items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>统一方向：{group.preferred}</span>
                </div>
              </div>

              <div className={`grid gap-4 p-5 ${group.variants.length >= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
                {group.variants.map((variant, index) => {
                  const selected = selections[String(group.number)] === index;
                  return (
                  <article
                    key={variant.name}
                    className={`rounded-xl border p-4 transition-colors ${selected ? 'border-[#08AACE] bg-[#F8FDFF] ring-2 ring-[#08AACE]/20' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-slate-900">版本 {index + 1}：{variant.name}</h3>
                      {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#08AACE]" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
                    </div>
                    <div className="mt-3" aria-label={`${variant.name}现有界面粗略还原`}>
                      <UiConsistencyAuditPreview kind={variant.preview} />
                    </div>
                    <div className="mt-3 space-y-2 text-xs leading-5">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#08AACE]" />
                        <span><strong className="text-slate-800">软件位置：</strong>{variant.entry}</span>
                      </div>
                      <div className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-[11px] text-slate-200">{variant.source}</div>
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 font-bold text-amber-900">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{variant.difference}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectVariant(group.number, index)}
                      aria-label={`选择第${group.number}类版本${index + 1}：${variant.name}`}
                      aria-pressed={selected}
                      className={`mt-3 h-9 w-full rounded-md text-sm font-black transition-colors ${
                        selected
                          ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                          : 'bg-[#08AACE] text-white hover:bg-[#0798b8]'
                      }`}
                    >
                      {selected ? '已选择此版本' : '选择此版本'}
                    </button>
                  </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
