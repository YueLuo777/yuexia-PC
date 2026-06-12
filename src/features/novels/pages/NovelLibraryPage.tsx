import { AlertTriangle, Archive, Clock3, Image as ImageIcon, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ImportModal } from '@/features/novels/components/ImportModal';
import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';
import { NewNovelModal } from '@/features/novels/components/NewNovelModal';
import { NovelCard, type NovelCardSettings } from '@/features/novels/components/NovelCard';
import { RecycleBinModal } from '@/features/novels/components/RecycleBinModal';
import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';
import type { Novel, WorkType } from '@/features/novels/model/novelTypes';
import { readWritingSummary, WRITING_STATS_UPDATED_EVENT } from '@/shared/stats/writingStats';
import { useWorkspaceTabs } from '@/shared/tabs/WorkspaceTabsContext';

type BtnColor = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'amber' | 'pink' | 'teal' | 'indigo' | 'gray';

interface FullCardSettings extends NovelCardSettings {
  cardHeight: 'small' | 'medium' | 'large';
  statFontSize: 'small' | 'medium' | 'large';
  buttonFontSize: 'small' | 'medium' | 'large';
  buttonFontWeight: 'normal' | 'bold';
  btnPerRow: 2 | 3;
  btnRows: 1 | 2 | 3;
  btnOrder: string[];
  btnColors: Record<string, BtnColor>;
}

const CARD_SETTINGS_KEY = 'novel_card_settings';
const defaultBtnOrder = ['重命名', '封面', '导出', '删除'];
const defaultBtnColors: Record<string, BtnColor> = {
  重命名: 'blue',
  封面: 'blue',
  导出: 'blue',
  删除: 'red',
};

const defaultCardSettings: FullCardSettings = {
  cardWidth: 'small',
  coverHeight: 'medium',
  cardHeight: 'medium',
  statFontSize: 'large',
  buttonFontSize: 'large',
  buttonFontWeight: 'bold',
  btnPerRow: 2,
  btnRows: 2,
  btnOrder: [...defaultBtnOrder],
  btnColors: { ...defaultBtnColors },
};

let workbenchPagePreload: Promise<unknown> | null = null;
let scriptEditorPagePreload: Promise<unknown> | null = null;

function preloadEditorPage(workType: WorkType) {
  if (workType === 'script') {
    scriptEditorPagePreload ??= import('@/features/script-editor/pages/ScriptEditorPage');
    return scriptEditorPagePreload;
  }

  workbenchPagePreload ??= import('@/features/workbench/pages/WorkbenchPage');
  return workbenchPagePreload;
}

function formatWords(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function parseWorkDateValue(value?: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  if (!Number.isNaN(parsed)) return parsed;
  const normalized = raw.replace(/\./g, '/').replace(/-/g, '/');
  const normalizedTime = new Date(normalized).getTime();
  return Number.isNaN(normalizedTime) ? 0 : normalizedTime;
}

function formatWorkDate(value?: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return '--';
  const parts = raw.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (parts) return `${parts[1]}/${Number(parts[2])}/${Number(parts[3])}`;
  return raw;
}

const colorOptions: { value: BtnColor; label: string }[] = [
  { value: 'blue', label: '蓝色' },
  { value: 'red', label: '红色' },
  { value: 'gray', label: '灰色' },
];

function PillSegmentGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-0.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
      {children}
    </div>
  );
}

function PillSegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-[9px] text-sm font-semibold transition-colors ${
        active
          ? 'bg-white text-[#08AACE] shadow-sm'
          : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function loadCardSettings(): FullCardSettings {
  try {
    const saved = localStorage.getItem(CARD_SETTINGS_KEY);
    if (!saved) return { ...defaultCardSettings };
    const parsed = JSON.parse(saved);
    let savedOrder: string[] = [];
    if (Array.isArray(parsed.btnOrder) && parsed.btnOrder.length > 0) {
      savedOrder = parsed.btnOrder.filter(
        (label: string) => !!label && label !== '' && !label.startsWith('预留') && !label.startsWith('空'),
      );
    }
    if (savedOrder.length === 0) savedOrder = [...defaultBtnOrder];
    return {
      cardWidth: ['small', 'medium', 'large'].includes(parsed.cardWidth) ? parsed.cardWidth : defaultCardSettings.cardWidth,
      coverHeight: ['small', 'medium', 'large'].includes(parsed.coverHeight) ? parsed.coverHeight : defaultCardSettings.coverHeight,
      cardHeight: ['small', 'medium', 'large'].includes(parsed.cardHeight) ? parsed.cardHeight : defaultCardSettings.cardHeight,
      statFontSize: ['small', 'medium', 'large'].includes(parsed.statFontSize) ? parsed.statFontSize : defaultCardSettings.statFontSize,
      buttonFontSize: ['small', 'medium', 'large'].includes(parsed.buttonFontSize) ? parsed.buttonFontSize : defaultCardSettings.buttonFontSize,
      buttonFontWeight: ['normal', 'bold'].includes(parsed.buttonFontWeight) ? parsed.buttonFontWeight : defaultCardSettings.buttonFontWeight,
      btnPerRow: [2, 3].includes(parsed.btnPerRow) ? parsed.btnPerRow : defaultCardSettings.btnPerRow,
      btnRows: [1, 2, 3].includes(parsed.btnRows) ? parsed.btnRows : defaultCardSettings.btnRows,
      btnOrder: savedOrder,
      btnColors: parsed.btnColors && typeof parsed.btnColors === 'object' ? parsed.btnColors : { ...defaultBtnColors },
    };
  } catch {
    return { ...defaultCardSettings };
  }
}

function saveCardSettings(settings: FullCardSettings) {
  localStorage.setItem(CARD_SETTINGS_KEY, JSON.stringify(settings));
}

function CardSettingsModal({
  isOpen,
  settings,
  onClose,
  onChange,
}: {
  isOpen: boolean;
  settings: FullCardSettings;
  onClose: () => void;
  onChange: (next: FullCardSettings) => void;
}) {
  if (!isOpen) return null;

  const totalSlots = settings.btnPerRow * settings.btnRows;
  const slots = settings.btnOrder.slice(0, totalSlots);
  while (slots.length < totalSlots) slots.push('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[580px] w-[720px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">作品卡片设置</h2>
            <p className="mt-0.5 text-sm text-gray-400">调整尺寸、文字、按钮排列，实时预览效果</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto border-r border-gray-100 p-5">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">卡片尺寸</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">卡片宽度</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, cardWidth: value })}
                        active={settings.cardWidth === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">封面高度</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, coverHeight: value })}
                        active={settings.coverHeight === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">文字设置</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">统计文字</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton key={value} onClick={() => onChange({ ...settings, statFontSize: value })} active={settings.statFontSize === value}>
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮文字</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton key={value} onClick={() => onChange({ ...settings, buttonFontSize: value })} active={settings.buttonFontSize === value}>
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮字重</label>
                  <PillSegmentGroup>
                    {(['normal', 'bold'] as const).map((value, index) => (
                      <PillSegmentButton key={value} onClick={() => onChange({ ...settings, buttonFontWeight: value })} active={settings.buttonFontWeight === value}>
                        {['常规', '粗体'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">按钮设置</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">每行按钮</label>
                  <PillSegmentGroup>
                    {[2, 3].map((value) => (
                      <PillSegmentButton key={value} onClick={() => onChange({ ...settings, btnPerRow: value as 2 | 3 })} active={settings.btnPerRow === value}>
                        {value}个
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮行数</label>
                  <PillSegmentGroup>
                    {[1, 2, 3].map((value) => (
                      <PillSegmentButton key={value} onClick={() => onChange({ ...settings, btnRows: value as 1 | 2 | 3 })} active={settings.btnRows === value}>
                        {value}行
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-[280px] flex-col gap-3 overflow-y-auto bg-gray-50/50 p-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">拖拽填空（{settings.btnRows}行×{settings.btnPerRow}个）</label>
              <div className="mx-auto flex w-[240px] flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${settings.btnPerRow}, 1fr)`, gridAutoRows: '36px' }}>
                  {slots.map((label, index) => (
                    <div
                      key={index}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const dragLabel = event.dataTransfer.getData('text/plain');
                        if (!dragLabel) return;
                        const newOrder = [...settings.btnOrder];
                        while (newOrder.length < totalSlots) newOrder.push('');
                        const oldLabel = newOrder[index];
                        const dragIndex = newOrder.indexOf(dragLabel);
                        if (dragIndex >= 0) newOrder[dragIndex] = oldLabel;
                        newOrder[index] = dragLabel;
                        while (newOrder.length > 0 && newOrder[newOrder.length - 1] === '') newOrder.pop();
                        onChange({ ...settings, btnOrder: newOrder });
                      }}
                      className={`flex h-full items-center justify-center rounded text-center text-sm transition-all ${
                        label
                          ? `${label === '删除' ? 'bg-red-500 text-white' : 'bg-brand text-white'} cursor-move`
                          : 'border border-dashed border-gray-300 bg-gray-50 text-gray-300'
                      }`}
                      draggable={!!label}
                      onDragStart={(event) => {
                        if (label) event.dataTransfer.setData('text/plain', label);
                      }}
                    >
                      {label || '空'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮池（拖拽到上方）</label>
              <div className="grid grid-cols-3 gap-1">
                {defaultBtnOrder.map((label) => (
                  <div
                    key={label}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', label);
                      event.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={`cursor-grab select-none rounded py-2 text-center text-sm transition-opacity hover:opacity-80 active:cursor-grabbing ${label === '删除' ? 'bg-red-500 text-white' : 'bg-brand text-white'}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">颜色</label>
              <div className="space-y-1">
                {settings.btnOrder.slice(0, settings.btnPerRow * settings.btnRows).filter(Boolean).map((label) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="w-10 truncate text-xs text-gray-500">{label}</span>
                    <div className="flex flex-1 gap-0.5">
                      {colorOptions.map((option) => (
                        <button
                          key={`${label}-${option.value}`}
                          onClick={() => onChange({ ...settings, btnColors: { ...settings.btnColors, [label]: option.value } })}
                          className={`h-3.5 w-3.5 rounded-full border transition-all ${(settings.btnColors[label] || 'gray') === option.value ? 'scale-110 border-gray-800' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: option.value === 'blue' ? '#1E71EF' : option.value === 'red' ? '#EF4444' : '#9CA3AF' }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <button
            onClick={() => onChange({ ...defaultCardSettings, btnOrder: [...defaultBtnOrder], btnColors: { ...defaultBtnColors } })}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            恢复默认
          </button>
          <button onClick={onClose} className="rounded-lg bg-brand px-6 py-2 text-sm text-white hover:bg-brand-dark">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[420px] rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-gray-900">确认删除</h3>
        </div>
        <p className="mb-3 text-xs text-gray-400">{title}</p>
        <p className="mb-6 text-sm text-gray-500">删除后将进入回收站，30 天内可恢复；到期后自动删除。</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
          <button onClick={onConfirm} className="rounded-md bg-amber-500 px-5 py-2 text-sm text-white hover:bg-amber-600 transition-colors">移入回收站</button>
        </div>
      </div>
    </div>
  );
}

function CoverModal({
  isOpen,
  novel,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  novel: Novel | null;
  onClose: () => void;
  onSave: (cover?: string) => void;
}) {
  type CoverTab = 'upload' | 'library';
  const { items: coverItems } = useCoverLibrary();
  const [value, setValue] = useState('');
  const [activeTab, setActiveTab] = useState<CoverTab>('upload');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValue(novel?.cover ?? '');
    setMessage('');
  }, [novel]);

  if (!isOpen || !novel) return null;

  const relatedCovers = coverItems.filter((item) => item.workType === novel.type);

  const handleFileUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setValue(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="flex h-[720px] w-[860px] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">设置封面</h2>
          <p className="mt-0.5 text-xs text-gray-400">{novel.title}</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)] overflow-hidden">
          <aside className="border-r border-gray-100 bg-gray-50 p-5">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {value ? (
                <img src={value} alt="封面预览" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="mb-2 h-10 w-10" />
                  <span className="text-sm">暂无封面</span>
                </div>
              )}
            </div>
            {message && <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs leading-5 text-gray-500">{message}</div>}
          </aside>

          <main className="flex min-h-0 flex-col">
            <div className="flex shrink-0 gap-2 border-b border-gray-100 px-5 py-3">
              {([
                { id: 'upload', label: '上传封面' },
                { id: 'library', label: '封面库' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-brand text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 hover:border-brand hover:bg-brand-light/30">
                    <Upload className="mb-2 h-6 w-6 text-gray-300" />
                    点击选择本地图片
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFileUpload(event.target.files?.[0])} />
                  </label>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-600">封面地址</label>
                    <input
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder="输入图片 URL 或 data URL"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'library' && (
                relatedCovers.length === 0 ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
                    封面库暂无{novel.type === 'script' ? '剧本' : '小说'}封面
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                    {relatedCovers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setValue(item.image);
                          setMessage(`已选择封面：${item.title}`);
                        }}
                        className={`overflow-hidden rounded-xl border bg-white text-left transition-colors ${
                          value === item.image ? 'border-brand ring-1 ring-brand' : 'border-gray-100 hover:border-brand/50'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-gray-100">
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2">
                          <div className="truncate text-xs font-medium text-gray-700">{item.title}</div>
                          <div className="mt-0.5 truncate text-[10px] text-gray-400">{item.modelName ?? item.createdAt}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </main>
        </div>

        <div className="flex justify-between border-t border-gray-100 px-6 py-4">
          <button onClick={() => onSave(undefined)} className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-600 hover:bg-red-50">
            清空封面
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
              取消
            </button>
            <button onClick={() => onSave(value.trim() || undefined)} className="rounded-lg bg-brand px-5 py-2 text-xs text-white hover:bg-brand-dark">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NovelLibraryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openWorkTab } = useWorkspaceTabs();
  const workType: WorkType = location.pathname === '/scripts' ? 'script' : 'novel';
  const typeLabel = workType === 'novel' ? '小说' : '剧本';

  const {
    novels,
    categories,
    currentNovelId,
    recycledNovels,
    getNovelsByType,
    createNovel,
    renameNovel,
    moveToRecycle,
    restoreNovel,
    permanentDelete,
    selectNovel,
    updateCover,
    exportNovelAsText,
  } = useNovelLibrary();

  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: number; title: string } | null>(null);
  const [coverTargetId, setCoverTargetId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState<FullCardSettings>(loadCardSettings);
  const [notice, setNotice] = useState('');
  const [writingSummary, setWritingSummary] = useState(readWritingSummary);

  useEffect(() => {
    setIsNewOpen(false);
    setIsImportOpen(false);
    setIsRecycleOpen(false);
    setRenameTarget(null);
    setCoverTargetId(null);
    setDeleteTargetId(null);
    setNotice('');
  }, [workType]);

  useEffect(() => {
    void preloadEditorPage(workType);
  }, [workType]);

  const sourceNovels = getNovelsByType(workType);
  const totalWorkWords = sourceNovels.reduce((sum, novel) => sum + novel.wordCount, 0);
  const recentWorks = [...sourceNovels]
    .sort((a, b) => parseWorkDateValue(b.lastModifiedAt || b.createdAt) - parseWorkDateValue(a.lastModifiedAt || a.createdAt))
    .slice(0, 3);
  const filters = ['全部', ...categories];
  const filteredNovels = useMemo(() => sourceNovels.filter((novel) => {
    const matchFilter = activeFilter === '全部' || novel.category === activeFilter;
    const matchSearch = !searchQuery.trim() || novel.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchFilter && matchSearch;
  }), [activeFilter, searchQuery, sourceNovels]);

  const coverTarget = novels.find((novel) => novel.id === coverTargetId) ?? null;

  useEffect(() => {
    const updateWritingSummary = () => setWritingSummary(readWritingSummary());
    window.addEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
    window.addEventListener('storage', updateWritingSummary);
    return () => {
      window.removeEventListener(WRITING_STATS_UPDATED_EVENT, updateWritingSummary);
      window.removeEventListener('storage', updateWritingSummary);
    };
  }, []);

  const handlePrepareOpen = (id: number) => {
    const novel = novels.find((item) => item.id === id);
    if (!novel) return;
    void preloadEditorPage(novel.type);
  };

  const handleOpen = (id: number) => {
    const novel = novels.find((item) => item.id === id);
    if (!novel) return;
    void preloadEditorPage(novel.type);
    selectNovel(id);
    const path = novel.type === 'script' ? '/script-editor-v2' : '/workbench';
    openWorkTab({
      workId: novel.id,
      workType: novel.type,
      title: novel.title,
      path,
    });
    navigate(path);
  };

  const confirmRename = () => {
    if (!renameTarget?.title.trim()) return;
    renameNovel(renameTarget.id, renameTarget.title);
    setRenameTarget(null);
  };

  const handleExportNovel = (id: number) => {
    const exported = exportNovelAsText(id);
    if (!exported) return;
    const blob = new Blob([exported.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exported.fileName;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`已导出 ${exported.fileName}`);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section className="flex min-h-[154px] flex-col justify-center rounded-[8px] border border-[#dfe5ec] bg-[#f7faff] px-5 py-5">
            <div className="grid gap-2 text-[13px] font-medium text-[#586574]">
              <div className="flex items-center justify-between gap-3">
                <span>作品</span>
                <strong className="text-[#1f2933]">{sourceNovels.length} 本</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>昨日更新</span>
                <strong className="text-[#1f2933]">{formatWords(writingSummary.yesterdayWords)} 字</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>字数</span>
                <strong className="text-[#1f2933]">{formatWords(totalWorkWords)} 字</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>预留</span>
                <strong className="text-[#9aa3af]">--</strong>
              </div>
            </div>
          </section>

          <section className="flex min-h-[154px] flex-col rounded-[8px] border border-[#e6e8ec] bg-[#fbfbfc] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f2f5f8] text-[#586574]">
                  <Archive className="h-4 w-4" />
                </span>
                <h2 className="text-[16px] font-semibold text-[#1f2933]">作品整理</h2>
              </div>
              <span className="text-[13px] font-medium text-[#9aa3af]">{filteredNovels.length}/{sourceNovels.length}</span>
            </div>
            <div className="mt-3 grid flex-1 grid-cols-2 grid-rows-2 gap-2.5">
              {[
                { label: `新建${typeLabel}`, desc: '创建作品', icon: Plus, onClick: () => setIsNewOpen(true), tone: 'blue' },
                { label: '导入', desc: '本地导入', icon: Upload, onClick: () => setIsImportOpen(true), tone: 'green' },
                { label: '卡片设置', desc: '调整封面', icon: SlidersHorizontal, onClick: () => setShowCardSettings(true), tone: 'amber' },
                { label: '回收站', desc: `${recycledNovels.length} 项`, icon: Trash2, onClick: () => setIsRecycleOpen(true), tone: 'purple' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="flex h-full min-h-[52px] items-center gap-2.5 rounded-[8px] border border-[#e6e8ec] bg-white px-3 text-left transition-colors hover:border-[#b8caef] hover:bg-[#f6f9ff]"
                  >
                    <span className={[
                      'grid h-7 w-7 shrink-0 place-items-center rounded-[5px] text-white',
                      item.tone === 'green' ? 'bg-[#31a85f]' : item.tone === 'amber' ? 'bg-[#f3a400]' : item.tone === 'purple' ? 'bg-[#9b6cf0]' : 'bg-[#1e71ef]',
                    ].join(' ')}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#1f2933]">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#9aa3af]">{item.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-[154px] flex-col rounded-[8px] border border-[#e6e8ec] bg-white px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#6b7b8d]">快速进入</p>
                <h2 className="mt-2 truncate text-[24px] font-bold text-[#1f2933]">最近编辑：</h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#fff4e5] text-[#d97706]">
                <Clock3 className="h-5 w-5" />
              </span>
            </div>
            {recentWorks.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {recentWorks.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => handleOpen(work.id)}
                    onMouseEnter={() => handlePrepareOpen(work.id)}
                    onFocus={() => handlePrepareOpen(work.id)}
                    className="grid h-7 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] px-1 text-left transition-colors hover:bg-[#f6f9ff]"
                  >
                    <span className="min-w-0 truncate text-[14px] font-semibold text-[#1f2933]">{work.title}</span>
                    <span className="shrink-0 text-[13px] font-medium text-[#8d98a6]">{formatWorkDate(work.lastModifiedAt || work.createdAt)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[14px] font-medium text-[#9aa3af]">暂无最近编辑的{typeLabel}</p>
            )}
          </section>

          <section className="flex min-h-[154px] flex-col rounded-[8px] border border-dashed border-[#d7dce4] bg-[#fbfbfc] px-5 py-5">
            <p className="text-[13px] font-medium text-[#9aa3af]">预留</p>
            <h2 className="mt-2 truncate text-[24px] font-bold text-[#68727f]">扩展卡片</h2>
            <p className="mt-5 text-[14px] font-medium leading-6 text-[#9aa3af]">后续可以放灵感、待办、今日目标或资料提醒。</p>
          </section>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            {notice}
          </div>
        )}

        <div className="mb-7 mt-7 flex items-center justify-between gap-4">
          <div className="xy-category-capsules min-w-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`xy-category-capsule ${activeFilter === filter ? 'xy-active' : ''}`}
              >
                <span>{filter}</span>
                <span className="xy-category-capsule-count">
                  {filter === '全部' ? sourceNovels.length : sourceNovels.filter((novel) => novel.category === filter).length}
                </span>
              </button>
            ))}
          </div>

          <label className="xy-ui132-search xy-novel-search shrink-0">
            <Search />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`搜索${typeLabel}`}
            />
          </label>
        </div>

        {filteredNovels.length === 0 ? (
          <div className="flex h-[360px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d7dce4] bg-[#fbfbfc]">
            <p className="text-3xl text-gray-500">暂无{typeLabel}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-16 gap-y-14">
            {filteredNovels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                isSelected={currentNovelId === novel.id}
                settings={cardSettings}
                onPrepareOpen={handlePrepareOpen}
                onOpen={handleOpen}
                onRename={(id, currentTitle) => setRenameTarget({ id, title: currentTitle })}
                onCover={(id) => setCoverTargetId(id)}
                onExport={handleExportNovel}
                onDelete={(id) => setDeleteTargetId(id)}
              />
            ))}
          </div>
        )}
      </main>

      <NewNovelModal
        isOpen={isNewOpen}
        type={workType}
        categories={categories}
        onClose={() => setIsNewOpen(false)}
        onCreate={createNovel}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultType={workType}
      />

      <RecycleBinModal
        isOpen={isRecycleOpen}
        type={workType}
        items={recycledNovels}
        onClose={() => setIsRecycleOpen(false)}
        onRestore={restoreNovel}
        onPermanentDelete={permanentDelete}
      />

      <CardSettingsModal
        isOpen={showCardSettings}
        settings={cardSettings}
        onClose={() => setShowCardSettings(false)}
        onChange={(next) => {
          setCardSettings(next);
          saveCardSettings(next);
        }}
      />

      <CoverModal
        isOpen={coverTargetId !== null}
        novel={coverTarget}
        onClose={() => setCoverTargetId(null)}
        onSave={(cover) => {
          if (coverTargetId !== null) updateCover(coverTargetId, cover);
          setCoverTargetId(null);
          setNotice('封面已更新');
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title={novels.find((novel) => novel.id === deleteTargetId)?.title || ''}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) moveToRecycle(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setRenameTarget(null)}>
          <div className="w-[360px] rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-gray-900">修改作品名称</h3>
            <input
              value={renameTarget.title}
              onChange={(event) => setRenameTarget({ ...renameTarget, title: event.target.value })}
              onKeyDown={(event) => { if (event.key === 'Enter') confirmRename(); }}
              className="mb-5 w-full rounded-md border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-brand"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700">
                取消
              </button>
              <button onClick={confirmRename} className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-dark">
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
