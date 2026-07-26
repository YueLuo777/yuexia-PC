import { Check, ChevronRight, Settings, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { AssociationReaderItemRow } from '@/features/workbench/components/AssociationReaderItemRow';
import { AssociationSegmentedControl } from '@/shared/ui/AssociationSegmentedControl';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs';

type ComparisonId = 'empty' | 'modal' | 'segment' | 'color' | 'reader';
type ComparisonChoiceProps = {
  selectedChoice: string;
  onSelectChoice: (choice: string) => void;
};

const UI_CONSISTENCY_SELECTIONS_KEY = 'xinyuexia_ui_consistency_selections_v1';
const FORMALIZED_SELECTIONS: Partial<Record<ComparisonId, string>> = {
  empty: '推荐统一版',
  modal: '统一弹窗',
  color: '#08AACE',
};

function readSavedSelections() {
  try {
    const stored = JSON.parse(localStorage.getItem(UI_CONSISTENCY_SELECTIONS_KEY) ?? 'null');
    return stored && typeof stored === 'object'
      ? (stored as Partial<Record<ComparisonId, string>>)
      : FORMALIZED_SELECTIONS;
  } catch {
    return FORMALIZED_SELECTIONS;
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

const comparisons: Array<{ id: ComparisonId; title: string; meta: string }> = [
  { id: 'empty', title: '空状态', meta: '4种现状 + 1推荐' },
  { id: 'modal', title: '弹窗外壳', meta: '3种现状' },
  { id: 'segment', title: '分段切换', meta: '3种现状' },
  { id: 'color', title: '选中颜色', meta: '2个色值' },
  { id: 'reader', title: '资料选择行', meta: '3种现状' },
];

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Example({
  title,
  locations,
  children,
  selected,
  onSelect,
}: {
  title: string;
  locations: string;
  children: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <section
      className={`min-w-0 rounded-lg border p-4 ${selected ? 'border-[#08AACE] bg-[#F7FCFD] shadow-[0_0_0_1px_#08AACE]' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            aria-label={`选择方案：${title}`}
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 shrink-0 accent-[#08AACE]"
          />
          <h3 className="min-w-0 text-sm font-black text-slate-800">{title}</h3>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{locations}</span>
      </div>
      {children}
    </section>
  );
}

function EmptyStateComparison({ selectedChoice, onSelectChoice }: ComparisonChoiceProps) {
  return (
    <div className="space-y-5">
      <SectionHeading
        title="空状态为什么看起来不一样"
        description="先保留四种正式页面现状用于对照，最后一项是建议全项目统一采用的方案。"
      />
      <div className="grid grid-cols-2 gap-4">
        <Example
          title="共享标准版"
          locations="人物设定"
          selected={selectedChoice === '共享标准版'}
          onSelect={() => onSelectChoice('共享标准版')}
        >
          <div className="h-40">
            <EmptyState title="暂无角色" description="点击左侧“新建角色”开始创建角色" />
          </div>
        </Example>
        <Example
          title="小号纯文字版"
          locations="章纲、已发布目录"
          selected={selectedChoice === '小号纯文字版'}
          onSelect={() => onSelectChoice('小号纯文字版')}
        >
          <div className="flex h-40 items-start justify-center bg-white pt-10 text-xs text-slate-400">
            暂无已发布章纲
          </div>
        </Example>
        <Example
          title="大号纯文字版"
          locations="作品库"
          selected={selectedChoice === '大号纯文字版'}
          onSelect={() => onSelectChoice('大号纯文字版')}
        >
          <div className="flex h-40 items-center justify-center bg-white text-3xl font-medium text-slate-500">
            暂无小说
          </div>
        </Example>
        <Example
          title="弹窗列表版"
          locations="历史记录、回收站"
          selected={selectedChoice === '弹窗列表版'}
          onSelect={() => onSelectChoice('弹窗列表版')}
        >
          <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400">
            暂无历史快照
          </div>
        </Example>
        <div className="col-span-2 pt-5" data-testid="recommended-empty-state">
          <Example
            title="推荐统一版"
            locations="建议作为全项目标准"
            selected={selectedChoice === '推荐统一版'}
            onSelect={() => onSelectChoice('推荐统一版')}
          >
            <div className="h-44">
              <EmptyState
                title="暂无内容"
                description="创建第一项内容后，将在这里显示。"
                action={
                  <button
                    type="button"
                    className="h-9 rounded-lg bg-[#08AACE] px-4 text-sm font-bold text-white transition-colors hover:bg-[#078FAB]"
                  >
                    新建内容
                  </button>
                }
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 border-l-4 border-[#08AACE] bg-[#F2FBFD] px-4 py-3 text-xs leading-5">
              <div>
                <b className="text-slate-700">可以统一</b>
                <p className="mt-1 text-slate-500">字号、边框、留白、标题说明层级和操作区位置。</p>
              </div>
              <div>
                <b className="text-slate-700">必须保留</b>
                <p className="mt-1 text-slate-500">各页面真实文案、创建动作、权限判断和业务数据。</p>
              </div>
            </div>
          </Example>
        </div>
      </div>
    </div>
  );
}

function MiniModal({ variant }: { variant: 'standard' | 'settings' | 'panel' }) {
  const title = variant === 'standard' ? '创建提示词' : variant === 'settings' ? '系统设置' : '剧情审核';
  return (
    <div className="flex h-52 items-center justify-center rounded-lg bg-slate-200/70 p-4">
      <div
        className={`flex h-full flex-col overflow-hidden bg-white shadow-lg ${
          variant === 'panel' ? 'w-full rounded-md border border-slate-300' : 'w-[82%] rounded-xl'
        }`}
      >
        <header
          className={`flex shrink-0 items-center justify-between border-b px-4 ${
            variant === 'settings' ? 'h-12 bg-slate-50' : variant === 'panel' ? 'h-9 bg-[#EAF9FD]' : 'h-14 bg-white'
          }`}
        >
          <span className={variant === 'panel' ? 'text-xs font-black' : 'text-sm font-black'}>{title}</span>
          {variant === 'settings' ? (
            <Settings className="h-4 w-4 text-slate-500" />
          ) : (
            <X className="h-4 w-4 text-slate-400" />
          )}
        </header>
        <div className={`flex-1 ${variant === 'panel' ? 'p-2' : 'p-4'}`}>
          <div className="h-8 rounded-lg border border-slate-200 bg-slate-50" />
          <div className="mt-3 h-12 rounded-lg border border-slate-200 bg-white" />
        </div>
        {variant !== 'panel' ? (
          <footer className="flex h-12 items-center justify-end gap-2 border-t px-4">
            <div className="h-7 w-14 rounded-lg border border-slate-200" />
            <div className="h-7 w-16 rounded-lg bg-[#08AACE]" />
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function ModalComparison({ selectedChoice, onSelectChoice }: ComparisonChoiceProps) {
  return (
    <div className="space-y-5">
      <SectionHeading title="弹窗外壳为什么有分叉" description="标题栏高度、圆角、底部按钮区和内容留白不是同一套。" />
      <div className="grid grid-cols-3 gap-4">
        <Example
          title="统一弹窗"
          locations="提示词、模型、工作台弹窗"
          selected={selectedChoice === '统一弹窗'}
          onSelect={() => onSelectChoice('统一弹窗')}
        >
          <MiniModal variant="standard" />
        </Example>
        <Example
          title="设置类自绘弹窗"
          locations="导航、快捷键、系统设置"
          selected={selectedChoice === '设置类自绘弹窗'}
          onSelect={() => onSelectChoice('设置类自绘弹窗')}
        >
          <MiniModal variant="settings" />
        </Example>
        <Example
          title="工作面板式弹窗"
          locations="剧情审核、更新状态"
          selected={selectedChoice === '工作面板式弹窗'}
          onSelect={() => onSelectChoice('工作面板式弹窗')}
        >
          <MiniModal variant="panel" />
        </Example>
      </div>
    </div>
  );
}

function SegmentComparison({ selectedChoice, onSelectChoice }: ComparisonChoiceProps) {
  const [standardTab, setStandardTab] = useState<'历史记录' | '操作轨迹'>('历史记录');
  const [linked, setLinked] = useState(true);
  const [pill, setPill] = useState('全部');
  return (
    <div className="space-y-5">
      <SectionHeading
        title="分段切换按钮为什么像三套软件"
        description="点击方式相同，但外框、内部竖线、圆角和选中填充不同。"
      />
      <div className="space-y-6 pt-2">
        <Example
          title="浅色边框选中"
          locations="历史记录、操作轨迹"
          selected={selectedChoice === '浅色边框选中'}
          onSelect={() => onSelectChoice('浅色边框选中')}
        >
          <SegmentedTabs tabs={['历史记录', '操作轨迹'] as const} activeTab={standardTab} onChange={setStandardTab} />
        </Example>
        <Example
          title="整段蓝色填充"
          locations="正文、章纲关联"
          selected={selectedChoice === '整段蓝色填充'}
          onSelect={() => onSelectChoice('整段蓝色填充')}
        >
          <AssociationSegmentedControl
            segments={[
              {
                id: 'chapter',
                label: linked ? '已关联本章' : '本章',
                active: linked,
                onClick: () => setLinked((value) => !value),
                minWidthClassName: 'w-24',
              },
              {
                id: 'material',
                label: '资料',
                active: false,
                onClick: () => setLinked(false),
                minWidthClassName: 'w-28',
              },
            ]}
            meta={linked ? '关联 3868 字' : undefined}
          />
        </Example>
        <Example
          title="分离胶囊按钮"
          locations="关联资料弹窗、筛选栏"
          selected={selectedChoice === '分离胶囊按钮'}
          onSelect={() => onSelectChoice('分离胶囊按钮')}
        >
          <div className="flex gap-2">
            {['全部', '章纲', '设定'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPill(item)}
                className={`h-9 rounded-xl border px-4 text-sm font-black ${pill === item ? 'border-[#8EDFEB] bg-[#EAF9FD] text-[#078fb0]' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </Example>
      </div>
    </div>
  );
}

function ColorExample({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div
        className="h-12 w-40 rounded-lg px-4 text-center text-sm font-black leading-[48px] text-white"
        style={{ backgroundColor: color }}
      >
        当前设定
      </div>
      <div>
        <div className="font-mono text-base font-black text-slate-800">{color}</div>
        <div className="mt-1 text-xs font-bold text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function ColorComparison({ selectedChoice, onSelectChoice }: ComparisonChoiceProps) {
  return (
    <div className="space-y-5">
      <SectionHeading
        title="选中颜色为什么容易再次出现色差"
        description="两个颜色很接近，但并不是同一个值；换主题或取消覆盖后会直接显出差别。"
      />
      <div className="grid grid-cols-2 gap-5 pt-3">
        <Example
          title="#08AACE"
          locations="多数正式页面"
          selected={selectedChoice === '#08AACE'}
          onSelect={() => onSelectChoice('#08AACE')}
        >
          <ColorExample color="#08AACE" label="多数工作台按钮、资料选择、设置页" />
        </Example>
        <Example
          title="#08B3D9"
          locations="少量旧入口"
          selected={selectedChoice === '#08B3D9'}
          onSelect={() => onSelectChoice('#08B3D9')}
        >
          <ColorExample color="#08B3D9" label="正文关联、部分设定关联源码" />
        </Example>
      </div>
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
        当前主题会把部分颜色覆盖成近似效果，所以平时不一定明显；源码仍保留两套值。
      </div>
    </div>
  );
}

function ReaderComparison({ selectedChoice, onSelectChoice }: ComparisonChoiceProps) {
  const [preview, setPreview] = useState('作品定位');
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (name: string) =>
    setChecked((items) => (items.includes(name) ? items.filter((item) => item !== name) : [...items, name]));
  return (
    <div className="space-y-5">
      <SectionHeading
        title="资料选择行为什么操作感不同"
        description="下面都能预览和勾选，但信息密度、勾选位置和一行包含的内容不同。可以直接点击体验。"
      />
      <div className="grid grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="space-y-5">
          <Example
            title="单条资料行"
            locations="章纲关联设定"
            selected={selectedChoice === '单条资料行'}
            onSelect={() => onSelectChoice('单条资料行')}
          >
            <AssociationReaderItemRow
              title="作品定位"
              selected={preview === '作品定位'}
              checked={checked.includes('作品定位')}
              meta="180字"
              onPreview={() => setPreview('作品定位')}
              onToggle={() => toggle('作品定位')}
            />
          </Example>
          <Example
            title="一行三个来源"
            locations="正文关联资料"
            selected={selectedChoice === '一行三个来源'}
            onSelect={() => onSelectChoice('一行三个来源')}
          >
            <div className="flex min-h-12 items-center rounded-lg border border-slate-200 bg-white px-3">
              <button
                type="button"
                onClick={() => setPreview('第1章')}
                className="min-w-0 flex-1 truncate text-left text-sm font-black text-slate-700"
              >
                第1章 初入九重天
              </button>
              {['正文', '章纲', '梗概'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  className={`ml-2 h-8 min-w-16 rounded-md border px-2 text-xs font-black ${checked.includes(item) ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-200 bg-white text-slate-500'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Example>
          <Example
            title="路径加资料行"
            locations="其他设定关联"
            selected={selectedChoice === '路径加资料行'}
            onSelect={() => onSelectChoice('路径加资料行')}
          >
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-bold text-slate-400">作品设定 / 核心设定</div>
              <AssociationReaderItemRow
                title="世界背景"
                selected={preview === '世界背景'}
                checked={checked.includes('世界背景')}
                meta="315字"
                onPreview={() => setPreview('世界背景')}
                onToggle={() => toggle('世界背景')}
              />
            </div>
          </Example>
        </div>
        <aside className="rounded-lg border border-[#BDEEF7] bg-[#ECFBFE] p-4">
          <div className="text-sm font-black text-[#078fb0]">当前预览</div>
          <div className="mt-3 rounded-lg border border-dashed border-[#8EDFEB] bg-white p-3 text-sm font-bold text-slate-700">
            {preview}
          </div>
          <div className="mt-5 text-xs font-black text-slate-500">已勾选 {checked.length} 项</div>
          <div className="mt-2 space-y-1 text-xs font-bold text-slate-400">
            {checked.length ? checked.map((item) => <div key={item}>· {item}</div>) : <div>尚未勾选资料</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function UiConsistencyComparisonTestPage() {
  const [activeId, setActiveId] = useState<ComparisonId>('empty');
  const [selectedChoices, setSelectedChoices] = useState<Partial<Record<ComparisonId, string>>>(readSavedSelections);
  const [copyStatus, setCopyStatus] = useState('');
  const selectedCount = comparisons.filter((item) => selectedChoices[item.id]).length;
  const selectionSummary = [
    '同功能样式选择结果：',
    ...comparisons.map((item) => `${item.title}：${selectedChoices[item.id] || '未选择'}`),
  ].join('\n');

  useEffect(() => {
    localStorage.setItem(UI_CONSISTENCY_SELECTIONS_KEY, JSON.stringify(selectedChoices));
  }, [selectedChoices]);

  const selectChoice = (comparisonId: ComparisonId, choice: string) => {
    setSelectedChoices((current) => ({
      ...current,
      [comparisonId]: current[comparisonId] === choice ? undefined : choice,
    }));
    setCopyStatus('');
  };

  const copySelectionSummary = async () => {
    const copied = await copyText(selectionSummary);
    setCopyStatus(copied ? '已复制选择结果' : '复制失败，请直接查看下方结果');
  };

  return (
    <div className="flex h-full min-h-0 bg-slate-100">
      <aside className="editor-scrollbar flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-3">
        <div className="px-2 pb-3 pt-1 text-sm font-black text-slate-900">同功能样式对比</div>
        <nav className="space-y-1">
          {comparisons.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`查看分类：${item.title}`}
              onClick={() => setActiveId(item.id)}
              className={`flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors ${activeId === item.id ? 'border border-[#8EDFEB] bg-[#EAF9FD] text-[#078fb0]' : 'border border-transparent text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center text-xs font-black">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{item.title}</b>
                <small className="block text-xs font-bold text-slate-400">{item.meta}</small>
              </span>
              {selectedChoices[item.id] ? (
                <Check className="h-4 w-4 shrink-0 text-[#08AACE]" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
          <Check className="mb-2 h-4 w-4 text-[#08AACE]" />
          这里只展示正式页面现状，不会修改正式样式和业务数据。
        </div>
        <div
          className="mt-4 rounded-lg border border-[#BDEEF7] bg-[#F7FCFD] p-3"
          data-testid="comparison-selection-summary"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-black text-slate-800">已选择 {selectedCount}/5</span>
            {selectedCount ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedChoices({});
                  setCopyStatus('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500"
              >
                清空
              </button>
            ) : null}
          </div>
          <div className="mt-3 space-y-2 text-xs font-bold leading-5">
            {comparisons.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`查看选择结果：${item.title}`}
                onClick={() => setActiveId(item.id)}
                className="flex w-full items-start gap-2 text-left"
              >
                <span className="w-16 shrink-0 text-slate-500">{item.title}</span>
                <span className={selectedChoices[item.id] ? 'text-[#078fb0]' : 'text-slate-300'}>
                  {selectedChoices[item.id] || '未选择'}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedCount}
            onClick={() => void copySelectionSummary()}
            className="mt-3 h-9 w-full rounded-md bg-[#08AACE] text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            复制选择结果
          </button>
          {copyStatus ? <div className="mt-2 text-center text-xs font-bold text-slate-500">{copyStatus}</div> : null}
        </div>
      </aside>
      <main className="editor-scrollbar min-w-0 flex-1 overflow-y-auto bg-white p-6">
        {activeId === 'empty' ? (
          <EmptyStateComparison
            selectedChoice={selectedChoices.empty ?? ''}
            onSelectChoice={(choice) => selectChoice('empty', choice)}
          />
        ) : null}
        {activeId === 'modal' ? (
          <ModalComparison
            selectedChoice={selectedChoices.modal ?? ''}
            onSelectChoice={(choice) => selectChoice('modal', choice)}
          />
        ) : null}
        {activeId === 'segment' ? (
          <SegmentComparison
            selectedChoice={selectedChoices.segment ?? ''}
            onSelectChoice={(choice) => selectChoice('segment', choice)}
          />
        ) : null}
        {activeId === 'color' ? (
          <ColorComparison
            selectedChoice={selectedChoices.color ?? ''}
            onSelectChoice={(choice) => selectChoice('color', choice)}
          />
        ) : null}
        {activeId === 'reader' ? (
          <ReaderComparison
            selectedChoice={selectedChoices.reader ?? ''}
            onSelectChoice={(choice) => selectChoice('reader', choice)}
          />
        ) : null}
      </main>
    </div>
  );
}

export default UiConsistencyComparisonTestPage;
