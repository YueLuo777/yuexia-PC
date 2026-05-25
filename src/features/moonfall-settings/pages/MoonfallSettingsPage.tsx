import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JSZip from 'jszip';

import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import {
  MOONFALL_CATEGORIES,
  MOONFALL_IMPORT_SCOPES,
  MOONFALL_VECTOR_DIMENSION,
  type MoonfallCategory,
  type MoonfallConfig,
  type MoonfallRagBundle,
  type MoonfallReviewItem,
  type MoonfallSettingItem,
  type MoonfallSourceType,
  type MoonfallState,
} from '@/features/moonfall-settings/model/moonfallSettingTypes';
import {
  buildMoonfallRagBundle,
  buildEmbeddingText,
  createChunks,
  createMoonfallId,
  createSettingFromReview,
  createSource,
  hashEmbedding,
  makeImportLog,
  normalizeAiReviewItems,
  normalizeCategory,
  parseAiJsonCards,
  readMoonfallState,
} from '@/features/moonfall-settings/model/moonfallSettingStore';
import { hydrateMoonfallStateFromDatabase, persistMoonfallState } from '@/features/moonfall-settings/model/moonfallSettingPersistence';

type PageMode = '设定提取' | '总设定库';
type DetailTab = '整理内容' | '原始内容' | '关联设定' | '向量信息' | '修改记录';
type CategoryFilter = '全部设定' | MoonfallCategory;

const DETAIL_TABS: DetailTab[] = ['整理内容', '原始内容', '关联设定', '向量信息', '修改记录'];

const BADGE_STYLES: Record<string, string> = {
  待确认: 'border-amber-200 bg-amber-50 text-amber-600',
  已整理: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  待完善: 'border-yellow-200 bg-yellow-50 text-yellow-600',
  有冲突: 'border-red-200 bg-red-50 text-red-600',
  废案: 'border-slate-200 bg-slate-100 text-slate-500',
  未分类: 'border-slate-200 bg-slate-50 text-slate-500',
  未生成向量: 'border-orange-200 bg-orange-50 text-orange-600',
  已生成向量: 'border-sky-200 bg-sky-50 text-sky-600',
  生成失败: 'border-red-200 bg-red-50 text-red-600',
};

const AI_EXTRACT_PROMPT = `你是一个小说设定提取引擎。请从用户文本中提取多条结构化资料卡。
只输出合法 JSON，不要 Markdown，不要解释。不要编造原文没有的信息。
可选分类：世界观、地点区域、势力组织、人物角色、等级体系、功法能力、道具装备、怪物敌人、科技系统、社会职业、剧情线索、待定/冲突。
如果内容暂时无法分类、名称冲突或逻辑矛盾，category 使用“待定/冲突”。
输出格式：
[
  {
    "title": "设定标题",
    "category": "分类",
    "subcategory": "子分类，可为空",
    "tags": ["标签1"],
    "keywords": ["关键词1"],
    "summary": "一句话概括",
    "originalText": "原文依据",
    "organizedText": "整理后的设定内容",
    "relatedItems": ["相关设定标题"],
    "status": "已整理",
    "confidence": 0.8
  }
]`;

function splitInputList(value: string) {
  return value.split(/[、，,\n]/).map((item) => item.trim()).filter(Boolean);
}

function joinList(value: string[]) {
  return value.join('、');
}

function copyText(text: string) {
  if (text.trim()) void navigator.clipboard?.writeText(text);
}

function stripControlText(text: string) {
  return text
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]+/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeDocxXml(xml: string) {
  try {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const paragraphs = Array.from(doc.getElementsByTagName('w:p'))
      .map((paragraph) => Array.from(paragraph.getElementsByTagName('w:t')).map((node) => node.textContent ?? '').join(''))
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length > 0) return paragraphs.join('\n');
  } catch {
    // Fall back to regex extraction below.
  }

  return Array.from(xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g))
    .map((match) => match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'"))
    .join('');
}

async function readDocxFile(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')?.async('string');
  if (!documentXml) throw new Error('没有在 docx 中找到正文内容。');
  const footnotesXml = await zip.file('word/footnotes.xml')?.async('string');
  const endnotesXml = await zip.file('word/endnotes.xml')?.async('string');
  const parts = [documentXml, footnotesXml, endnotesXml].filter((item): item is string => Boolean(item));
  return stripControlText(parts.map(decodeDocxXml).filter(Boolean).join('\n'));
}

async function readLegacyDocFile(file: File) {
  const buffer = await file.arrayBuffer();
  const utf8 = stripControlText(new TextDecoder('utf-8', { fatal: false }).decode(buffer));
  const utf16 = stripControlText(new TextDecoder('utf-16le', { fatal: false }).decode(buffer));
  const best = utf16.length > utf8.length * 1.2 ? utf16 : utf8;
  const readable = best
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /[\u4e00-\u9fa5A-Za-z0-9]/.test(line))
    .join('\n');
  if (readable.length < 20) {
    throw new Error('旧版 .doc 文档无法稳定解析，请先另存为 .docx 或 .txt 后再导入。');
  }
  return readable;
}

async function readImportFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'docx') return readDocxFile(file);
  if (ext === 'doc') return readLegacyDocFile(file);
  return stripControlText(await file.text());
}

function withLocalEmbedding(item: MoonfallSettingItem, modelName = 'local-hash-pgvector') {
  const embeddingText = buildEmbeddingText(item);
  return {
    ...item,
    embeddingText,
    embeddingVector: hashEmbedding(embeddingText, MOONFALL_VECTOR_DIMENSION),
    embeddingDimension: MOONFALL_VECTOR_DIMENSION,
    embeddingModel: modelName,
    embeddingCreatedAt: new Date().toLocaleString('zh-CN'),
    vectorStatus: '已生成向量' as const,
  };
}

function isMoonfallRagBundle(value: unknown): value is MoonfallRagBundle {
  return Boolean(value && typeof value === 'object' && 'contextText' in value && 'log' in value);
}

function Badge({ label }: { label: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${BADGE_STYLES[label] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}>
      {label}
    </span>
  );
}

function TextButton({
  children,
  onClick,
  tone = 'plain',
  disabled = false,
}: {
  children: string;
  onClick?: () => void;
  tone?: 'primary' | 'plain' | 'danger' | 'soft' | 'warning';
  disabled?: boolean;
}) {
  const styles = {
    primary: 'border-brand bg-brand text-white hover:bg-brand-dark',
    plain: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border-red-500 bg-red-500 text-white hover:bg-red-600',
    soft: 'border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100',
    warning: 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100',
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`h-9 rounded-xl border px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[tone]}`}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose, width = 'w-[760px]' }: { title: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  const modalId = `moonfall-${title}`;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 px-5 py-10" data-modal-id={modalId}>
      <section className={`${width} max-h-[calc(100vh-96px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`} data-modal-id={modalId}>
        <header className="flex h-12 items-center justify-between border-b border-slate-100 px-4" data-modal-drag-handle="true">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="h-8 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-500 hover:bg-slate-50">关闭</button>
        </header>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">{children}</div>
      </section>
    </div>,
    document.body,
  );
}

function EmptyState({ title, actions }: { title: string; actions: string[] }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
      <div className="text-base font-bold text-slate-700">{title}</div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {actions.map((action) => <span key={action} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{action}</span>)}
      </div>
    </div>
  );
}

function CategoryTree({
  value,
  counts,
  onChange,
}: {
  value: CategoryFilter;
  counts: Map<MoonfallCategory, number>;
  onChange: (category: CategoryFilter) => void;
}) {
  return (
    <aside className="min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
      <h2 className="mb-3 text-sm font-bold text-slate-800">分类树</h2>
      <button
        onClick={() => onChange('全部设定')}
        className={`mb-1.5 flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold ${value === '全部设定' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'}`}
      >
        <span>全部设定</span>
        <span className="text-xs opacity-75">{Array.from(counts.values()).reduce((sum, count) => sum + count, 0)}</span>
      </button>
      {MOONFALL_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`mb-1.5 flex h-9 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold ${value === category ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <span className="truncate">{category}</span>
          <span className="ml-2 text-xs opacity-75">{counts.get(category) ?? 0}</span>
        </button>
      ))}
    </aside>
  );
}

export function MoonfallSettingsPage() {
  const [state, setState] = useState(readMoonfallState);
  const { models } = useModels();
  const [pageMode, setPageMode] = useState<PageMode>('设定提取');
  const [reviewCategory, setReviewCategory] = useState<CategoryFilter>('全部设定');
  const [libraryCategory, setLibraryCategory] = useState<CategoryFilter>('全部设定');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [detailTab, setDetailTab] = useState<DetailTab>('整理内容');
  const [reviewItems, setReviewItems] = useState<MoonfallReviewItem[]>([]);
  const [draftText, setDraftText] = useState('');
  const [message, setMessage] = useState('');
  const [retrievalPreview, setRetrievalPreview] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<MoonfallSettingItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoonfallSettingItem | null>(null);
  const [sourceType, setSourceType] = useState<MoonfallSourceType>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void hydrateMoonfallStateFromDatabase().then((result) => {
      if (cancelled) return;
      setState(result.state);
      if (result.source === 'database' || result.source === 'merged' || result.backedUp) {
        setMessage(result.message);
      }
    }).catch(() => {
      if (cancelled) return;
      setMessage('月落设定库同步失败，已继续使用当前本地数据。');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProject = state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
  const projectSettings = state.settings.filter((item) => item.projectId === activeProject.id);
  const projectSources = state.sources.filter((source) => source.projectId === activeProject.id);
  const enabledModels = models.filter((model) => model.enabled);
  const selectedAiModel = enabledModels.find((model) => model.id === state.config.aiModelId) ?? enabledModels[0] ?? null;
  const selectedSource = detailItem?.sourceId ? projectSources.find((source) => source.id === detailItem.sourceId) : null;

  const libraryCounts = useMemo(() => {
    const map = new Map<MoonfallCategory, number>();
    MOONFALL_CATEGORIES.forEach((category) => map.set(category, 0));
    projectSettings.forEach((item) => map.set(item.category, (map.get(item.category) ?? 0) + 1));
    return map;
  }, [projectSettings]);

  const reviewCounts = useMemo(() => {
    const map = new Map<MoonfallCategory, number>();
    MOONFALL_CATEGORIES.forEach((category) => map.set(category, 0));
    reviewItems.forEach((item) => map.set(item.category, (map.get(item.category) ?? 0) + 1));
    return map;
  }, [reviewItems]);

  const visibleReviewItems = useMemo(() => (
    reviewItems.filter((item) => reviewCategory === '全部设定' || item.category === reviewCategory)
  ), [reviewCategory, reviewItems]);

  const visibleSettings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const tags = splitInputList(tagFilter);
    return projectSettings.filter((item) => {
      if (libraryCategory !== '全部设定' && item.category !== libraryCategory) return false;
      if (tags.length > 0 && !tags.every((tag) => item.tags.includes(tag) || item.keywords.includes(tag))) return false;
      if (!keyword) return true;
      const haystack = [item.title, item.category, item.subcategory, item.summary, item.organizedText, item.originalText, ...item.tags, ...item.keywords, ...item.aliases].join(' ').toLowerCase();
      return haystack.includes(keyword);
    });
  }, [libraryCategory, projectSettings, search, tagFilter]);

  const persist = (updater: (prev: MoonfallState) => MoonfallState) => {
    setState((prev) => {
      const next = updater(prev);
      void persistMoonfallState(next).catch((error) => {
        setMessage(error instanceof Error ? `设定库保存到数据库失败：${error.message}` : '设定库保存到数据库失败。');
      });
      return next;
    });
  };

  const updateConfig = (patch: Partial<MoonfallConfig>) => persist((prev) => ({ ...prev, config: { ...prev.config, ...patch } }));

  const updateItem = (id: string, patch: Partial<MoonfallSettingItem>, action = '用户编辑') => {
    persist((prev) => ({
      ...prev,
      settings: prev.settings.map((item) => {
        if (item.id !== id) return item;
        const patchKeys = Object.keys(patch);
        const shouldRefreshVector = patchKeys.some((key) => ['title', 'category', 'subcategory', 'tags', 'keywords', 'summary', 'organizedText', 'relatedItems'].includes(key))
          && !('embeddingVector' in patch);
        const next = { ...item, ...patch, updatedAt: new Date().toLocaleString('zh-CN') };
        next.embeddingText = buildEmbeddingText(next);
        if (shouldRefreshVector) {
          next.embeddingVector = undefined;
          next.embeddingDimension = undefined;
          next.embeddingCreatedAt = undefined;
          next.vectorStatus = '未生成向量';
        }
        next.changeLogs = [{ id: createMoonfallId('log'), action, detail: Object.keys(patch).join('、') || '资料更新', createdAt: new Date().toLocaleString('zh-CN') }, ...item.changeLogs];
        if (detailItem?.id === id) setDetailItem(next);
        return next;
      }),
    }));
  };

  const runAiExtractForText = async (content: string, sourceId?: string, sourceChunkId?: string) => {
    if (!selectedAiModel) throw new Error('请先选择 AI 模型。');
    const text = await callModel({
      model: selectedAiModel,
      prompt: AI_EXTRACT_PROMPT,
      userContent: `现在请从以下文本中提取设定资料卡：\n\n${content}`,
      recordType: 'generate',
    });
    return normalizeAiReviewItems(parseAiJsonCards(text), sourceId, sourceChunkId);
  };

  const startOrganize = async () => {
    const text = draftText.trim();
    if (!text) {
      setMessage('请先粘贴灵感或上传文本。');
      return;
    }
    setMessage('AI 正在整理设定...');
    const source = createSource({ projectId: activeProject.id, title: '灵感导入', sourceType });
    const chunks = createChunks(activeProject.id, source.id, text);
    const drafts: MoonfallReviewItem[] = [];
    const failedIds: string[] = [];

    for (const chunk of chunks) {
      try {
        drafts.push(...await runAiExtractForText(chunk.content, source.id, chunk.id));
      } catch (error) {
        failedIds.push(chunk.id);
        setMessage(error instanceof Error ? error.message : 'AI 整理失败。');
      }
    }

    persist((prev) => ({
      ...prev,
      sources: [source, ...prev.sources],
      sourceChunks: [...chunks, ...prev.sourceChunks],
      importTasks: [{
        id: createMoonfallId('import-task'),
        projectId: activeProject.id,
        sourceId: source.id,
        title: source.title,
        status: failedIds.length === chunks.length ? 'failed' : 'finished',
        step: failedIds.length ? '完成，含失败项' : '待确认',
        totalChunks: chunks.length,
        processedChunks: chunks.length,
        failedChunkIds: failedIds,
        logs: [makeImportLog(failedIds.length ? 'warning' : 'success', `AI 已提取 ${drafts.length} 条设定`)],
        createdAt: new Date().toLocaleString('zh-CN'),
        updatedAt: new Date().toLocaleString('zh-CN'),
      }, ...prev.importTasks],
    }));
    setReviewItems((prev) => [...drafts, ...prev]);
    setReviewCategory('全部设定');
    setMessage(drafts.length ? `AI 已整理出 ${drafts.length} 条待确认设定。` : '没有提取到可确认设定。');
  };

  const saveReviews = (mode: 'verified' | 'reserve', ids?: Set<string>) => {
    const targets = reviewItems.filter((item) => (ids ? ids.has(item.id) : item.selected));
    const created = targets.map((draft) => {
      const item = createSettingFromReview(activeProject.id, draft);
      if (mode === 'verified') return withLocalEmbedding({ ...item, status: '已整理' as const, isVerified: true, allowRag: true }, state.config.embeddingModel || 'local-hash-pgvector');
      return { ...item, status: '待确认' as const, isVerified: false, allowRag: false, importance: '素材' as const };
    });
    persist((prev) => ({ ...prev, settings: [...created, ...prev.settings] }));
    setReviewItems((prev) => prev.filter((item) => !(ids ? ids.has(item.id) : item.selected)));
    setPageMode('总设定库');
    setLibraryCategory('全部设定');
    if (created[0]) setDetailItem(created[0]);
    setMessage(mode === 'verified' ? `已确认入库 ${created.length} 条。` : `已暂时保留 ${created.length} 条。`);
  };

  const generateEmbeddingForItem = (item: MoonfallSettingItem) => {
    updateItem(item.id, withLocalEmbedding(item, state.config.embeddingModel || 'local-hash-pgvector'), '重新生成向量');
  };

  const buildRagPreview = async () => {
    const query = search.trim() || detailItem?.organizedText || detailItem?.summary || '';
    if (!query.trim()) {
      setRetrievalPreview('请先输入搜索内容，或打开一条设定后再预览召回。');
      return;
    }
    if (window.xinyuexiaDatabase?.retrieveMoonfallRag) {
      try {
        const result = await window.xinyuexiaDatabase.retrieveMoonfallRag<MoonfallRagBundle>({
          projectId: activeProject.id,
          userId: activeProject.userId,
          query,
          limit: state.config.retrievalLimit,
          purpose: 'debug',
          includeUnverified: true,
          similarityThreshold: state.config.similarityThreshold,
        });
        const bundle = result.data.find(isMoonfallRagBundle);
        if (result.ok && bundle) {
          persist((prev) => ({ ...prev, retrievalLogs: [bundle.log, ...prev.retrievalLogs].slice(0, 200) }));
          setRetrievalPreview(bundle.contextText || '没有召回到相关设定。');
          setMessage('已通过 PostgreSQL + pgvector 完成召回预览。');
          return;
        }
        if (result.message) setMessage(`pgvector 召回失败，已改用本地召回：${result.message}`);
      } catch (error) {
        setMessage(error instanceof Error ? `pgvector 召回失败，已改用本地召回：${error.message}` : 'pgvector 召回失败，已改用本地召回。');
      }
    }
    const bundle = buildMoonfallRagBundle(state, {
      projectId: activeProject.id,
      userId: activeProject.userId,
      query,
      limit: state.config.retrievalLimit,
      purpose: 'debug',
      includeUnverified: true,
      similarityThreshold: state.config.similarityThreshold,
    });
    persist((prev) => ({ ...prev, retrievalLogs: [bundle.log, ...prev.retrievalLogs].slice(0, 200) }));
    setRetrievalPreview(bundle.contextText || '没有召回到相关设定。');
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0 || !window.confirm(`确认删除 ${selectedIds.size} 条设定？`)) return;
    persist((prev) => ({ ...prev, settings: prev.settings.filter((item) => !selectedIds.has(item.id)) }));
    setSelectedIds(new Set());
  };

  const readFileToDraft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const nextType = ext === 'md' || ext === 'markdown' ? 'markdown' : ext === 'txt' ? 'txt' : ext === 'doc' || ext === 'docx' ? ext : 'other';
    setSourceType(nextType);
    setMessage(`正在读取 ${file.name}...`);
    void readImportFile(file)
      .then((text) => {
        setDraftText(text);
        setMessage(`已读取 ${file.name}，共 ${text.length} 字。`);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : '文件读取失败。');
      })
      .finally(() => {
        input.value = '';
      });
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">月落设定库</h1>
          <div className="flex h-12 items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
            {(['设定提取', '总设定库'] as PageMode[]).map((mode) => {
              const active = pageMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setPageMode(mode)}
                  className={`h-9 rounded-xl px-5 text-base font-bold transition-all ${
                    active
                      ? 'bg-white text-sky-500 shadow-sm'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 flex-1 px-4">
          {message && (
            <div className="mx-auto flex h-9 max-w-[640px] items-center rounded-xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-sky-600">
              <span className="truncate">{message}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-bold text-slate-500">模型</span>
          <select value={state.config.aiModelId || selectedAiModel?.id || ''} onChange={(event) => updateConfig({ aiModelId: event.target.value })} className="h-9 w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand">
            {enabledModels.length === 0 && <option value="">暂无模型</option>}
            {enabledModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
          </select>
          <TextButton onClick={() => setIsSettingsOpen(true)}>设置</TextButton>
        </div>
      </header>

      {pageMode === '设定提取' ? renderExtractPage() : renderLibraryPage()}

      {retrievalPreview && (
        <Modal title="召回预览" onClose={() => setRetrievalPreview('')} width="w-[760px]">
          <pre className="max-h-[520px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{retrievalPreview}</pre>
          <div className="mt-3 flex justify-end"><TextButton onClick={() => copyText(retrievalPreview)}>复制上下文</TextButton></div>
        </Modal>
      )}
      {detailItem && renderDetailModal(detailItem)}
      {isSettingsOpen && renderSettingsModal()}
      {deleteTarget && renderDeleteModal()}
    </div>
  );

  function renderExtractPage() {
    return (
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(520px,1fr)_minmax(360px,0.62fr)] gap-4 overflow-hidden p-4">
        <section className="grid min-h-0 grid-cols-[210px_minmax(0,1fr)] gap-4 overflow-hidden">
          <CategoryTree value={reviewCategory} counts={reviewCounts} onChange={setReviewCategory} />
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">待确认设定</h2>
                <p className="mt-0.5 text-xs text-slate-400">AI 整理出的设定先在这里确认，再进入总设定库。</p>
              </div>
              <TextButton onClick={() => saveReviews('verified')} tone="primary" disabled={visibleReviewItems.every((item) => !item.selected)}>批量确认</TextButton>
            </header>
            {renderReviewList()}
          </section>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <header className="flex h-14 shrink-0 items-center border-b border-slate-100 px-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">导入灵感</h2>
              <p className="mt-0.5 text-xs text-slate-400">粘贴灵感、设定或正文片段。</p>
            </div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} className="min-h-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-8 outline-none focus:border-brand focus:bg-white" placeholder="把杂乱灵感、世界观设定、正文片段复制到这里。" />
            <div className="flex items-center justify-between gap-2">
              <TextButton onClick={() => fileInputRef.current?.click()}>上传文件</TextButton>
              <TextButton onClick={() => void startOrganize()} tone="primary">开始整理</TextButton>
            </div>
            <input ref={fileInputRef} type="file" accept=".txt,.md,.markdown,.doc,.docx" className="hidden" onChange={readFileToDraft} />
          </div>
        </section>
      </main>
    );
  }

  function renderReviewList() {
    if (visibleReviewItems.length === 0) return <div className="p-4"><EmptyState title="当前分类暂无待确认设定" actions={['右侧导入灵感', '点击开始整理']} /></div>;
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" checked={visibleReviewItems.every((item) => item.selected)} onChange={(event) => {
              const ids = new Set(visibleReviewItems.map((item) => item.id));
              setReviewItems((prev) => prev.map((item) => ids.has(item.id) ? { ...item, selected: event.target.checked } : item));
            }} className="h-4 w-4 accent-brand" />
            全选当前分类
          </label>
          <div className="flex gap-2"><TextButton onClick={() => saveReviews('reserve')}>暂时保留</TextButton><TextButton onClick={() => setReviewItems((prev) => prev.filter((item) => !item.selected))} tone="danger">删除选中</TextButton></div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {visibleReviewItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <input checked={item.selected} onChange={(event) => setReviewItems((prev) => prev.map((draft) => draft.id === item.id ? { ...draft, selected: event.target.checked } : draft))} type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <input value={item.title} onChange={(event) => setReviewItems((prev) => prev.map((draft) => draft.id === item.id ? { ...draft, title: event.target.value } : draft))} className="min-w-0 flex-1 rounded border border-transparent px-1 text-sm font-black text-slate-900 outline-none focus:border-brand" />
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{Math.round(item.confidence * 100)}%</span>
                  </div>
                  <select value={item.category} onChange={(event) => setReviewItems((prev) => prev.map((draft) => draft.id === item.id ? { ...draft, category: normalizeCategory(event.target.value) } : draft))} className="mt-2 h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-brand">
                    {MOONFALL_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary || item.organizedText}</p>
                  <div className="mt-3 flex justify-end"><TextButton onClick={() => saveReviews('verified', new Set([item.id]))} tone="primary">确认</TextButton></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderLibraryPage() {
    return (
      <main className="grid min-h-0 flex-1 grid-cols-[230px_minmax(0,1fr)] gap-4 overflow-hidden p-4">
        <CategoryTree value={libraryCategory} counts={libraryCounts} onChange={setLibraryCategory} />
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">总设定库</h2>
              <p className="mt-0.5 text-xs text-slate-400">已确认和保留的设定资料集中管理。</p>
            </div>
            <div className="flex gap-2"><TextButton onClick={buildRagPreview} tone="soft">召回预览</TextButton></div>
          </header>
          {renderLibraryList()}
        </section>
      </main>
    );
  }

  function renderLibraryList() {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_160px] gap-2">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索设定、人物、势力、功法、剧情线索..." className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand" />
          <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} placeholder="标签筛选" className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand" />
        </div>
        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-sm font-bold text-slate-500">已选 {selectedIds.size} 条</span>
            <div className="flex gap-2"><TextButton onClick={() => selectedIds.forEach((id) => { const item = projectSettings.find((candidate) => candidate.id === id); if (item) generateEmbeddingForItem(item); })} tone="warning">生成向量</TextButton><TextButton onClick={deleteSelected} tone="danger">批量删除</TextButton></div>
          </div>
        )}
        {visibleSettings.length === 0 ? (
          <EmptyState title={search ? '没有找到相关设定' : '当前分类暂无设定'} actions={search ? ['扩大搜索范围', '切换分类'] : ['切到设定提取', '整理灵感', '确认入库']} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {visibleSettings.map((item) => (
              <article key={item.id} onClick={() => { setDetailItem(item); setDetailTab('整理内容'); }} className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 transition-colors hover:border-brand/40">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selectedIds.has(item.id)} onClick={(event) => event.stopPropagation()} onChange={(event) => setSelectedIds((prev) => { const next = new Set(prev); if (event.target.checked) next.add(item.id); else next.delete(item.id); return next; })} className="mt-1 h-4 w-4 accent-brand" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-slate-900">{item.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5"><Badge label={item.category} /><Badge label={item.status} /><Badge label={item.vectorStatus} /></div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary || item.organizedText || '暂无摘要'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-400"><span>权重 {item.ragWeight}</span><span>{item.allowRag ? '允许RAG' : '禁止RAG'}</span></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderDetailModal(item: MoonfallSettingItem) {
    const selectedSource = item.sourceId ? projectSources.find((source) => source.id === item.sourceId) : null;
    return (
      <Modal title="设定详情" onClose={() => setDetailItem(null)} width="w-[820px]">
        <input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value, canonicalName: event.target.value })} className="w-full rounded-lg border border-transparent px-1 text-xl font-bold text-slate-900 outline-none focus:border-brand" />
        <div className="mt-2 flex flex-wrap gap-2"><Badge label={item.category} /><Badge label={item.status} /><Badge label={item.vectorStatus} /><Badge label={item.isVerified ? '已整理' : '待确认'} /></div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <TextButton onClick={() => updateItem(item.id, { isVerified: true, allowRag: true, status: '已整理' }, '确认入库')} tone="primary">确认入库</TextButton>
          <TextButton onClick={() => updateItem(item.id, { allowRag: !item.allowRag }, item.allowRag ? '禁止参与RAG' : '允许参与RAG')} tone="soft">{item.allowRag ? '禁止RAG' : '允许RAG'}</TextButton>
          <TextButton onClick={() => generateEmbeddingForItem(item)} tone="warning">生成向量</TextButton>
          <TextButton onClick={() => setDeleteTarget(item)} tone="danger">删除</TextButton>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">{DETAIL_TABS.map((tab) => <button key={tab} onClick={() => setDetailTab(tab)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${detailTab === tab ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>{tab}</button>)}</div>
        {detailTab === '整理内容' && <OrganizedTab item={item} onUpdate={updateItem} onBuildRag={buildRagPreview} />}
        {detailTab === '原始内容' && <OriginalTab item={item} sourceTitle={selectedSource?.title ?? '手动'} onUpdate={updateItem} />}
        {detailTab === '关联设定' && <RelationTab item={item} onUpdate={updateItem} />}
        {detailTab === '向量信息' && <VectorTab item={item} />}
        {detailTab === '修改记录' && <LogTab item={item} />}
      </Modal>
    );
  }

  function renderSettingsModal() {
    return (
      <Modal title="月落设定库设置" onClose={() => setIsSettingsOpen(false)}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="自动调用设定库"><label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600"><input type="checkbox" checked={state.config.autoRag} onChange={(event) => updateConfig({ autoRag: event.target.checked })} className="h-4 w-4 accent-brand" />写作时自动带入相关设定</label></Field>
          <Field label="AI模型配置"><select value={state.config.aiModelId || selectedAiModel?.id || ''} onChange={(event) => updateConfig({ aiModelId: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand">{enabledModels.length === 0 && <option value="">暂无模型</option>}{enabledModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></Field>
          <Field label="Embedding模型名称"><input value={state.config.embeddingModel} onChange={(event) => updateConfig({ embeddingModel: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand" /></Field>
          <Field label="向量维度"><input type="number" value={MOONFALL_VECTOR_DIMENSION} readOnly className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none" /></Field>
          <Field label="召回数量"><input type="number" value={state.config.retrievalLimit} onChange={(event) => updateConfig({ retrievalLimit: Number(event.target.value) || 10 })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand" /></Field>
          <Field label="RAG调用模板"><select value={state.config.ragTemplate} onChange={(event) => updateConfig({ ragTemplate: event.target.value as MoonfallConfig['ragTemplate'] })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand">{['续写模式', '战斗模式', '世界观解释模式', '人物塑造模式', '设定校验模式', '文风模仿模式'].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
          <Field label="提取范围"><div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-2">{MOONFALL_IMPORT_SCOPES.map((scope) => <div key={scope} className="mb-1 text-xs font-bold text-slate-500">{scope}</div>)}</div></Field>
        </div>
      </Modal>
    );
  }

  function renderDeleteModal() {
    if (!deleteTarget) return null;
    return (
      <Modal title="删除确认" onClose={() => setDeleteTarget(null)} width="w-[420px]">
        <p className="text-sm leading-6 text-slate-600">确认删除《{deleteTarget.title}》？这个操作不会自动恢复。</p>
        <div className="mt-4 flex justify-end gap-2"><TextButton onClick={() => setDeleteTarget(null)}>取消</TextButton><TextButton onClick={() => { persist((prev) => ({ ...prev, settings: prev.settings.filter((item) => item.id !== deleteTarget.id) })); setDeleteTarget(null); setDetailItem(null); }} tone="danger">删除</TextButton></div>
      </Modal>
    );
  }
}

function OrganizedTab({ item, onUpdate, onBuildRag }: { item: MoonfallSettingItem; onUpdate: (id: string, patch: Partial<MoonfallSettingItem>, action?: string) => void; onBuildRag: () => void }) {
  return <div className="mt-4 space-y-3"><Field label="分类"><select value={item.category} onChange={(event) => onUpdate(item.id, { category: normalizeCategory(event.target.value) })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand">{MOONFALL_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field><Field label="摘要"><textarea value={item.summary} onChange={(event) => onUpdate(item.id, { summary: event.target.value })} className="h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-brand" /></Field><Field label="整理内容"><textarea value={item.organizedText} onChange={(event) => onUpdate(item.id, { organizedText: event.target.value })} className="h-52 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-brand" /></Field><div className="grid grid-cols-2 gap-2"><TextButton onClick={() => copyText(item.organizedText)}>复制内容</TextButton><TextButton onClick={onBuildRag} tone="primary">加入上下文</TextButton></div></div>;
}

function OriginalTab({ item, sourceTitle, onUpdate }: { item: MoonfallSettingItem; sourceTitle: string; onUpdate: (id: string, patch: Partial<MoonfallSettingItem>, action?: string) => void }) {
  return <div className="mt-4 space-y-3"><Field label="来源"><input value={sourceTitle} readOnly className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" /></Field><Field label="原文依据"><textarea value={item.originalText} onChange={(event) => onUpdate(item.id, { originalText: event.target.value, evidenceText: event.target.value })} className="h-64 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-brand" /></Field><TextButton onClick={() => copyText(item.originalText)}>复制原文</TextButton></div>;
}

function RelationTab({ item, onUpdate }: { item: MoonfallSettingItem; onUpdate: (id: string, patch: Partial<MoonfallSettingItem>, action?: string) => void }) {
  return <div className="mt-4 space-y-3"><Field label="标准名"><input value={item.canonicalName} onChange={(event) => onUpdate(item.id, { canonicalName: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand" /></Field><Field label="别名"><input value={joinList(item.aliases)} onChange={(event) => onUpdate(item.id, { aliases: splitInputList(event.target.value) })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand" /></Field><Field label="关联设定"><textarea value={joinList(item.relatedItems)} onChange={(event) => onUpdate(item.id, { relatedItems: splitInputList(event.target.value) })} className="h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-brand" /></Field></div>;
}

function VectorTab({ item }: { item: MoonfallSettingItem }) {
  return <div className="mt-4 space-y-3 text-sm text-slate-600"><div>Embedding 模型：{item.embeddingModel || '未生成'}</div><div>最后生成：{item.embeddingCreatedAt || '-'}</div><div>维度：{item.embeddingDimension ?? '-'}</div><Field label="embedding_text 预览"><textarea value={item.embeddingText || buildEmbeddingText(item)} readOnly className="h-40 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 outline-none" /></Field></div>;
}

function LogTab({ item }: { item: MoonfallSettingItem }) {
  return <div className="mt-4 space-y-2">{item.changeLogs.length === 0 ? <p className="text-sm text-slate-400">暂无修改记录</p> : item.changeLogs.map((log) => <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="text-sm font-bold text-slate-800">{log.action}</div><div className="mt-1 text-xs text-slate-400">{log.createdAt}</div><div className="mt-1 text-xs text-slate-500">{log.detail}</div></div>)}</div>;
}
