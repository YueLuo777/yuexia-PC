import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Copy,
  Folder,
  FileText,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import {
  buildGenreConceptPrompt,
  buildInspirationPrompt,
  createConceptSnapshot,
  createGenreConcept,
  createInspirationConcept,
  getConceptCloudObjectKey,
  parseConceptAiJson,
  readConceptCloudConfig,
  restoreConceptSnapshot,
  useConceptLibrary,
  writeConceptCloudConfig,
} from '@/features/concept-library/hooks/useConceptLibrary';
import type {
  ConceptCloudConfig,
  ConceptKind,
  InspirationConceptItem,
  ConceptLibraryItem,
  ConceptPlatform,
} from '@/features/concept-library/model/conceptLibraryTypes';
import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { WordCountText } from '@/shared/ui/WordCountText';

const conceptTabs: Array<{ id: ConceptKind; label: string }> = [
  { id: 'inspiration', label: '灵感' },
  { id: 'genreConcept', label: '题材' },
];

const platforms: ConceptPlatform[] = ['起点', '番茄', '通用'];

const genres = ['玄幻', '都市', '仙侠', '科幻'];
type InspirationSaveMode = 'normal' | 'association' | 'both';
type ConceptInspirationFieldKey = 'genre' | 'theme' | 'cheat' | 'idea' | 'requirement';
type ConceptInspirationDraft = Record<ConceptInspirationFieldKey, string>;

type ConceptAiRequestLog = {
  createdAt: string;
  action: string;
  modelName: string;
  systemPrompt: string;
  userContent: string;
};

const CONCEPT_INSPIRATION_FIELDS: Array<{
  key: ConceptInspirationFieldKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'genre', label: '题材', placeholder: '如都市、玄幻' },
  { key: 'theme', label: '故事主题', placeholder: '如系统流' },
  { key: 'cheat', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
  { key: 'idea', label: '你的构思', placeholder: '任何灵感都可以' },
  { key: 'requirement', label: '补充内容', placeholder: '主角名字、性格、女主设定等' },
];

const EMPTY_INSPIRATION_DRAFT: ConceptInspirationDraft = {
  genre: '',
  theme: '',
  cheat: '',
  idea: '',
  requirement: '',
};

interface ConceptLibraryPageProps {
  embedded?: boolean;
}

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString('zh-CN');
  } catch {
    return value;
  }
}

function buildGenreUserContent(platform: ConceptPlatform, genre: string, title: string, rawInput: string) {
  return [
    `平台：${platform}`,
    `类型：${genre}`,
    title.trim() ? `题材标题：${title.trim()}` : '',
    '',
    '题材设定：',
    rawInput.trim(),
  ].filter(Boolean).join('\n');
}

function buildInspirationUserContent(draft: ConceptInspirationDraft) {
  return CONCEPT_INSPIRATION_FIELDS
    .map((field) => {
      const value = draft[field.key].trim();
      return value ? `${field.label}：${value}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function getInspirationFieldRows(value: string) {
  const rows = value
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / 26)), 0);
  return Math.max(1, rows);
}

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

function getRequestLogMeta(content: string) {
  return `${countTextWords(content)} 字`;
}

function buildConceptLogGroups(log: ConceptAiRequestLog): AiRequestLogGroup[] {
  return [
    {
      id: 'prompt',
      title: '提示词',
      meta: getRequestLogMeta(log.systemPrompt),
      content: log.systemPrompt,
    },
    {
      id: 'user',
      title: '用户内容',
      meta: getRequestLogMeta(log.userContent),
      content: log.userContent,
      tone: 'amber',
    },
  ];
}

function getItemDirectory(item: ConceptLibraryItem) {
  return `${item.kind === 'inspiration' ? '灵感' : '题材'} / ${item.category || '待整理'}`;
}

function getKindLabel(kind: ConceptKind) {
  return kind === 'inspiration' ? '灵感' : '题材';
}

function stopFormEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function ConceptCard({
  item,
  onDelete,
}: {
  item: ConceptLibraryItem;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showAssociation, setShowAssociation] = useState(false);
  const association = item.kind === 'inspiration' ? item.association : undefined;
  const copyText = [
    `标题：${item.title}`,
    `目录：${getItemDirectory(item)}`,
    item.summary ? `梗概：${item.summary}` : '',
    item.kind === 'genreConcept' ? `平台：${item.platform} / 类型：${item.genre}` : '',
    '',
    item.content,
    association ? '\nAI 联想版本：' : '',
    association ? `标题：${association.title}` : '',
    association?.summary ? `梗概：${association.summary}` : '',
    association?.content ?? '',
  ].filter(Boolean).join('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.kind === 'inspiration' ? 'bg-cyan-50 text-cyan-700' : 'bg-violet-50 text-violet-700'}`}>
              {item.kind === 'inspiration' ? '灵感' : '题材'}
            </span>
            {item.status === 'pending' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">待整理</span>
            )}
            {item.cloudSyncedAt && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">已云备份</span>
            )}
          </div>
          <h2 className="mt-2 break-words text-base font-black leading-6 text-slate-950">{item.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
            <span className="inline-flex items-center gap-1"><Folder className="h-3.5 w-3.5" />{getItemDirectory(item)}</span>
            <span>{formatTime(item.updatedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-cyan-200 hover:text-cyan-600"
            title={copied ? '已复制' : '复制'}
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {item.summary && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-600">{item.summary}</p>}

      {item.kind === 'genreConcept' && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
          <div className="rounded-lg bg-slate-50 px-3 py-2">平台：{item.platform}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">类型：{item.genre}</div>
        </div>
      )}

      <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.content}</div>

      {association && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowAssociation((value) => !value)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 text-xs font-black text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showAssociation ? '收起 AI 联想' : '查看 AI 联想'}
          </button>
          {showAssociation && (
            <section className="mt-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-cyan-700">AI 联想版</span>
                <h3 className="break-words text-sm font-black text-slate-900">{association.title}</h3>
              </div>
              {association.summary && <p className="mt-2 text-sm font-bold leading-6 text-cyan-800">{association.summary}</p>}
              <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{association.content}</div>
              {association.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {association.tags.map((tag) => (
                    <span key = {tag} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-cyan-700">
                      <Tags className="h-3 w-3" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {item.kind === 'genreConcept' && (
        <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
          {item.sellingPoints.length > 0 && <div><span className="font-black text-slate-800">卖点：</span>{item.sellingPoints.join('；')}</div>}
          {item.audience && <div><span className="font-black text-slate-800">受众：</span>{item.audience}</div>}
          {item.conflict && <div><span className="font-black text-slate-800">核心冲突：</span>{item.conflict}</div>}
          {item.openingHook && <div><span className="font-black text-slate-800">开篇钩子：</span>{item.openingHook}</div>}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key = {tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
              <Tags className="h-3 w-3" />{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export function ConceptLibraryPage({ embedded = false }: ConceptLibraryPageProps = {}) {
  const navigate = useNavigate();
  const { items, stats, addItem, deleteItem, replaceAll } = useConceptLibrary();
  const { models, activeId, activeModel, setActiveId } = useModels();
  const [activeTab, setActiveTab] = useState<ConceptKind>('inspiration');
  const [inspirationDraft, setInspirationDraft] = useState<ConceptInspirationDraft>(EMPTY_INSPIRATION_DRAFT);
  const [platform, setPlatform] = useState<ConceptPlatform>('番茄');
  const [genre, setGenre] = useState('玄幻');
  const [genreTitle, setGenreTitle] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<ConceptCloudConfig>(() => readConceptCloudConfig());
  const [isCloudBusy, setIsCloudBusy] = useState(false);
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  const [pendingAssociationItem, setPendingAssociationItem] = useState<InspirationConceptItem | null>(null);
  const [isAiLogOpen, setIsAiLogOpen] = useState(false);
  const [lastAiRequestLog, setLastAiRequestLog] = useState<ConceptAiRequestLog | null>(null);
  const [inspirationGenerateCount, setInspirationGenerateCount] = useState('10');

  const activeItems = useMemo(() => items.filter((item) => item.kind === activeTab), [activeTab, items]);
  const categories = useMemo(() => ['全部', ...Array.from(new Set(activeItems.map((item) => item.category || '待整理')))], [activeItems]);
  const categoryGroups = useMemo(() => (
    categories
      .filter((category) => category !== '全部')
      .map((category) => ({
        category,
        items: activeItems.filter((item) => (item.category || '待整理') === category),
      }))
  ), [activeItems, categories]);
  const selectedItem = useMemo(() => (
    activeItems.find((item) => item.id === selectedItemId) ?? null
  ), [activeItems, selectedItemId]);
  const visibleItems = useMemo(() => {
    if (selectedItem) return [selectedItem];
    const keyword = search.trim().toLowerCase();
    return activeItems.filter((item) => {
      const categoryMatched = selectedCategory === '全部' || item.category === selectedCategory;
      if (!categoryMatched) return false;
      if (!keyword) return true;
      return [
        item.title,
        item.category,
        item.summary,
        item.content,
        item.rawInput,
        ...item.tags,
        item.kind === 'inspiration' ? item.association?.title : '',
        item.kind === 'inspiration' ? item.association?.summary : '',
        item.kind === 'inspiration' ? item.association?.content : '',
        ...(item.kind === 'inspiration' ? item.association?.tags ?? [] : []),
      ].join('\n').toLowerCase().includes(keyword);
    });
  }, [activeItems, search, selectedCategory, selectedItem]);

  const configuredCloud = Boolean(cloudConfig.bucket.trim() && cloudConfig.region.trim() && cloudConfig.secretId.trim() && cloudConfig.secretKey.trim());
  const cloudObjectKey = getConceptCloudObjectKey(cloudConfig);
  const inspirationUserContent = useMemo(() => buildInspirationUserContent(inspirationDraft), [inspirationDraft]);
  const previewAiRequestLog = useMemo<ConceptAiRequestLog>(() => {
    const mode: InspirationSaveMode = activeTab === 'inspiration' ? 'normal' : 'both';
    return {
      createdAt: '当前预览',
      action: activeTab === 'inspiration' ? '灵感整理保存' : '题材整理保存',
      modelName: activeModel?.name ?? '未选择模型',
      systemPrompt: activeTab === 'inspiration' ? buildInspirationPrompt(mode) : buildGenreConceptPrompt(platform, genre),
      userContent: activeTab === 'inspiration' ? inspirationUserContent : buildGenreUserContent(platform, genre, genreTitle, genreInput),
    };
  }, [activeModel?.name, activeTab, genre, genreInput, genreTitle, inspirationUserContent, platform]);
  const visibleAiRequestLog = lastAiRequestLog ?? previewAiRequestLog;
  const embeddedToolbarTarget = embedded && typeof document !== 'undefined'
    ? document.getElementById('concept-library-toolbar-slot')
    : null;
  const embeddedToolbar = useMemo(() => (
    <>
      <button
        type="button"
        onClick={() => navigate('/model-manage')}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition-colors hover:border-cyan-200 hover:text-cyan-700"
      >
        <Settings className="h-4 w-4" />
        设置
      </button>
      <button
        type="button"
        onClick={() => setIsAiLogOpen(true)}
        className="inline-flex h-10 items-center justify-center rounded-[20px] border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-cyan-200 hover:text-cyan-700"
      >
        日志
      </button>
    </>
  ), [navigate]);

  const deleteConceptItem = (id: string) => {
    const item = items.find((current) => current.id === id);
    if (!item) return;
    if (!window.confirm(`确定删除这条${getKindLabel(item.kind)}吗？`)) return;
    deleteItem(id);
    if (selectedItemId === id) setSelectedItemId(null);
    setNotice(`已删除：${item.title}`);
  };

  const clearActiveKind = () => {
    if (activeItems.length === 0) return;
    const label = getKindLabel(activeTab);
    if (!window.confirm(`确定清空全部${label}吗？这个操作不会影响${activeTab === 'inspiration' ? '题材' : '灵感'}。`)) return;
    replaceAll(items.filter((item) => item.kind !== activeTab));
    setSelectedCategory('全部');
    setSelectedItemId(null);
    setSearch('');
    setNotice(`已清空全部${label}。`);
  };

  const setInspirationField = (key: ConceptInspirationFieldKey, value: string) => {
    setInspirationDraft((current) => ({ ...current, [key]: value }));
  };

  const saveInspirationItem = (item: InspirationConceptItem, message: string) => {
    addItem(item);
    setActiveTab('inspiration');
    setSelectedItemId(item.id);
    setSelectedCategory(item.category);
    setInspirationDraft(EMPTY_INSPIRATION_DRAFT);
    setNotice(message);
  };

  const confirmAssociationSave = () => {
    if (!pendingAssociationItem) return;
    saveInspirationItem(pendingAssociationItem, '联想灵感已保存。');
    setPendingAssociationItem(null);
  };

  const submitInspiration = async (mode: InspirationSaveMode) => {
    const rawInput = inspirationUserContent.trim();
    if (!rawInput || isSubmitting) return;
    if (mode === 'association' && !activeModel) {
      setNotice('联想保存需要先选择可用模型。');
      return;
    }
    setIsSubmitting(true);
    setNotice(mode === 'association' ? '正在联想灵感...' : '正在整理灵感...');
    let result = null;
    try {
      if (activeModel) {
        const prompt = buildInspirationPrompt(mode);
        setLastAiRequestLog({
          createdAt: new Date().toLocaleString('zh-CN'),
          action: mode === 'normal' ? '灵感整理保存' : mode === 'association' ? '灵感联想保存' : '灵感同时保存',
          modelName: activeModel.name,
          systemPrompt: prompt,
          userContent: rawInput,
        });
        const response = await callModel({
          model: activeModel,
          prompt,
          userContent: rawInput,
          recordType: 'generate',
          timeoutMs: 90000,
        });
        result = parseConceptAiJson(response);
      }
      if (mode === 'association') {
        if (!result?.association) {
          setNotice('AI 没有返回可确认的联想内容，请重试。');
          return;
        }
        const item = createInspirationConcept(rawInput, result, { includeAssociation: false, useAssociationAsMain: true });
        setPendingAssociationItem(item);
        setNotice('AI 联想已生成，请确认后保存。');
        return;
      }
    } catch (error) {
      setNotice(`${mode === 'association' ? 'AI 联想失败' : 'AI 整理失败，已保存为待整理'}：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      if (mode !== 'association') {
        const item = createInspirationConcept(rawInput, result, { includeAssociation: mode === 'both' });
        saveInspirationItem(item, result
          ? (mode === 'both' ? '灵感整理版和 AI 联想版已保存。' : '灵感已整理并保存。')
          : (!activeModel ? '没有可用模型，已保存为待整理。' : 'AI 返回格式无法解析，已保存为待整理。'));
      }
      setIsSubmitting(false);
    }
  };

  const submitGenreConcept = async () => {
    const rawInput = genreInput.trim();
    if (!rawInput || isSubmitting) return;
    setIsSubmitting(true);
    setNotice('正在整理题材...');
    let result = null;
    try {
      if (activeModel) {
        const prompt = buildGenreConceptPrompt(platform, genre);
        const userContent = buildGenreUserContent(platform, genre, genreTitle, rawInput);
        setLastAiRequestLog({
          createdAt: new Date().toLocaleString('zh-CN'),
          action: '题材整理保存',
          modelName: activeModel.name,
          systemPrompt: prompt,
          userContent,
        });
        const response = await callModel({
          model: activeModel,
          prompt,
          userContent,
          recordType: 'generate',
          timeoutMs: 90000,
        });
        result = parseConceptAiJson(response);
      }
    } catch (error) {
      setNotice(`AI 整理失败，已保存为待整理：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      const item = createGenreConcept({ platform, genre, elements: '', rawInput }, result);
      const titledItem = genreTitle.trim() ? { ...item, title: genreTitle.trim() } : item;
      addItem(titledItem);
      setActiveTab('genreConcept');
      setSelectedItemId(titledItem.id);
      setSelectedCategory(titledItem.category);
      setGenreTitle('');
      setGenreInput('');
      if (result) setNotice('题材已整理并保存。');
      else if (!activeModel) setNotice('没有可用模型，已保存为待整理。');
      else setNotice('AI 返回格式无法解析，已保存为待整理。');
      setIsSubmitting(false);
    }
  };

  const saveCloudConfig = () => {
    const next = writeConceptCloudConfig(cloudConfig);
    setCloudConfig(next);
    setNotice('COS 配置已保存在本机。');
  };

  const uploadCloudSnapshot = async () => {
    if (!configuredCloud || !window.xinyuexiaCos) {
      setNotice('请先配置 COS，并在桌面端使用云同步。');
      return;
    }
    setIsCloudBusy(true);
    setNotice('正在上传构思库快照...');
    try {
      const snapshot = createConceptSnapshot(items);
      const result = await window.xinyuexiaCos.putObject({
        config: cloudConfig,
        key: cloudObjectKey,
        body: JSON.stringify(snapshot, null, 2),
        contentType: 'application/json; charset=utf-8',
      });
      if (!result.ok) throw new Error(result.message || '上传失败');
      const syncedAt = new Date().toISOString();
      replaceAll(items.map((item) => ({ ...item, cloudSyncedAt: syncedAt })));
      setNotice(`已上传到 COS：${cloudObjectKey}`);
    } catch (error) {
      setNotice(`上传失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsCloudBusy(false);
    }
  };

  const restoreCloudSnapshot = async () => {
    if (!configuredCloud || !window.xinyuexiaCos) {
      setNotice('请先配置 COS，并在桌面端使用云同步。');
      return;
    }
    setIsCloudBusy(true);
    setNotice('正在从 COS 读取构思库快照...');
    try {
      const result = await window.xinyuexiaCos.getObject({ config: cloudConfig, key: cloudObjectKey });
      if (!result.ok) throw new Error(result.message || '读取失败');
      const restored = restoreConceptSnapshot(JSON.parse(result.text ?? '{}'));
      setNotice(`已从 COS 恢复 ${restored.length} 条构思。`);
    } catch (error) {
      setNotice(`恢复失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsCloudBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      {embeddedToolbarTarget && createPortal(embeddedToolbar, embeddedToolbarTarget)}
      {!embedded && (
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-slate-950">
              <Sparkles className="h-5 w-5 text-cyan-600" />
              构思库
            </h1>
            <div className="mt-1 flex flex-wrap gap-3 text-xs font-bold text-slate-400">
              <span>全部 {stats.total}</span>
              <span>灵感 {stats.inspirations}</span>
              <span>题材 {stats.genreConcepts}</span>
              <span>待整理 {stats.pending}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeId ?? ''}
              onChange={(event) => setActiveId(event.target.value || null)}
              className="h-9 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
            >
              {models.length === 0 ? <option value="">暂无模型</option> : models.map((model) => (
                <option key = {model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAiLogOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition-colors hover:border-cyan-200 hover:text-cyan-700"
              title="查看输出给 AI 的内容"
            >
              <FileText className="h-4 w-4" />
              输出日志
            </button>
            <button
              type="button"
              onClick={() => setShowCloudSettings(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 text-sm font-black text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-100"
              title="COS 云同步"
            >
              <Cloud className="h-4 w-4" />
              云同步
            </button>
          </div>
        </div>
      </header>
      )}

      <AppModalShell
        title="COS 云同步"
        isOpen={showCloudSettings}
        onClose={() => setShowCloudSettings(false)}
        widthClass="w-[min(560px,94vw)]"
        heightClass=""
        zIndexClass="z-[360]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="p-5"
      >
            <div className="mt-4 grid gap-3">
              <input data-no-modal-drag="true" value={cloudConfig.bucket} onChange={(event) => setCloudConfig({ ...cloudConfig, bucket: event.target.value })} placeholder="Bucket，例如 writer-1250000000" className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white" />
              <input data-no-modal-drag="true" value={cloudConfig.region} onChange={(event) => setCloudConfig({ ...cloudConfig, region: event.target.value })} placeholder="Region，例如 ap-guangzhou" className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white" />
              <input data-no-modal-drag="true" value={cloudConfig.secretId} onChange={(event) => setCloudConfig({ ...cloudConfig, secretId: event.target.value })} placeholder="SecretId" className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white" />
              <input data-no-modal-drag="true" value={cloudConfig.secretKey} onChange={(event) => setCloudConfig({ ...cloudConfig, secretKey: event.target.value })} placeholder="SecretKey" type="password" className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white" />
              <input data-no-modal-drag="true" value={cloudConfig.prefix} onChange={(event) => setCloudConfig({ ...cloudConfig, prefix: event.target.value })} placeholder="云端目录，例如 xinyuexia" className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <ActionButton type="button" onClick={saveCloudConfig} variant="secondary">保存</ActionButton>
              <ActionButton type="button" onClick={() => void uploadCloudSnapshot()} disabled={isCloudBusy} variant="secondary">上传</ActionButton>
              <ActionButton type="button" onClick={() => void restoreCloudSnapshot()} disabled={isCloudBusy} variant="secondary">恢复</ActionButton>
            </div>
            <p className="mt-4 break-all text-xs font-bold leading-5 text-slate-400">云端文件：{cloudObjectKey}</p>
      </AppModalShell>

      <AppModalShell
        title="输出日志"
        isOpen={isAiLogOpen}
        onClose={() => setIsAiLogOpen(false)}
        widthClass="w-[min(960px,94vw)]"
        heightClass="h-[min(760px,88vh)]"
        zIndexClass="z-[365]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AiRequestLogModalLayout
          metaItems={[
            { id: 'action', label: '动作', value: visibleAiRequestLog.action },
            { id: 'model', label: '模型', value: visibleAiRequestLog.modelName },
            { id: 'time', label: '时间', value: visibleAiRequestLog.createdAt },
          ]}
          groups={buildConceptLogGroups(visibleAiRequestLog)}
          storageKey="concept_library_ai_request_log_groups"
        />
      </AppModalShell>

      <AppModalShell
        title="AI 联想预览"
        subtitle={pendingAssociationItem?.title}
        isOpen={Boolean(pendingAssociationItem)}
        onClose={() => setPendingAssociationItem(null)}
        widthClass="w-[min(680px,94vw)]"
        heightClass="max-h-[86vh]"
        zIndexClass="z-[370]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="flex min-h-0 flex-col overflow-hidden"
        panelClassName="border border-cyan-100"
      >
        {pendingAssociationItem ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {pendingAssociationItem.summary && (
                <p className="rounded-lg bg-cyan-50 px-3 py-2 text-sm font-bold leading-6 text-cyan-800">{pendingAssociationItem.summary}</p>
              )}
              <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{pendingAssociationItem.content}</div>
              {pendingAssociationItem.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {pendingAssociationItem.tags.map((tag) => (
                    <span key = {tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      <Tags className="h-3 w-3" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
              <ActionButton type="button" onClick={() => setPendingAssociationItem(null)} variant="secondary" className="w-full">
                取消
              </ActionButton>
              <ActionButton type="button" onClick={confirmAssociationSave} className="w-full">
                确认保存
              </ActionButton>
            </div>
          </>
        ) : null}
      </AppModalShell>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_minmax(340px,420px)] overflow-hidden">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {conceptTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key = {tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedCategory('全部');
                    setSelectedItemId(null);
                  }}
                  className={`h-10 rounded-md text-sm font-black transition-colors ${active ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs font-black text-slate-400">
            <span>目录树</span>
            <span>{activeItems.length} 条</span>
          </div>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('全部');
                setSelectedItemId(null);
              }}
              className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black transition-colors ${
                selectedCategory === '全部' && !selectedItem ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">全部{activeTab === 'inspiration' ? '灵感' : '题材'}</span>
              </span>
              <span className="text-xs text-slate-400">{activeItems.length}</span>
            </button>
            {categoryGroups.map((group) => (
              <div key = {group.category} className="rounded-lg border border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(group.category);
                    setSelectedItemId(null);
                  }}
                  className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black transition-colors ${
                    selectedCategory === group.category && !selectedItem ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="truncate">{group.category}</span>
                  </span>
                  <span className="text-xs text-slate-400">{group.items.length}</span>
                </button>
                <div className="pb-2">
                  {group.items.map((item) => (
                    <button
                      key = {item.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(item.category || '待整理');
                        setSelectedItemId(item.id);
                      }}
                      className={`ml-5 flex min-h-8 w-[calc(100%-1.25rem)] items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-bold leading-5 transition-colors ${
                        selectedItemId === item.id ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section
          className="relative z-10 col-start-3 row-start-1 min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-5"
          data-no-modal-drag="true"
          onMouseDown={stopFormEvent}
          onPointerDown={stopFormEvent}
          onKeyDown={stopFormEvent}
        >
          {activeTab === 'inspiration' && (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center gap-3">
                <h3 className="shrink-0 text-base font-bold text-gray-900">脑洞生成</h3>
              </div>
              <div className="mt-3 flex max-w-full items-start gap-2">
                <CombinedAiConfigSelect
                  className="w-full"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    '--xy-field-width': '100%',
                  } as CSSProperties}
                  modelValue={activeId ?? ''}
                  promptValue="brainstorm"
                  modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  promptOptions={[{ value: 'brainstorm', label: '脑洞' }]}
                  onModelChange={(value) => setActiveId(value || null)}
                  onPromptChange={() => undefined}
                  onModelManage={() => navigate('/model-manage')}
                  onPromptManage={() => setNotice('构思库当前使用固定脑洞提示词。')}
                />
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2">
                  <div className="flex min-h-full flex-col gap-4 pt-2">
                    <div className="grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700">
                      {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'genre' || field.key === 'theme').map((field) => {
                        const rows = getInspirationFieldRows(inspirationDraft[field.key]);
                        return (
                          <div
                            key = {field.key}
                            className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${inspirationDraft[field.key].trim() ? 'xy-has-value' : ''}`}
                          >
                            <textarea
                              data-no-modal-drag="true"
                              value={inspirationDraft[field.key]}
                              onChange={(event) => setInspirationField(field.key, event.target.value)}
                              placeholder={field.placeholder}
                              rows={1}
                              className="font-bold leading-5"
                              style={{
                                height: `${Math.max(52, rows * 20 + 32)}px`,
                                overflowY: 'hidden',
                              }}
                            />
                            <label>{field.label}</label>
                          </div>
                        );
                      })}
                    </div>
                    {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key !== 'genre' && field.key !== 'theme').map((field) => {
                      const rows = getInspirationFieldRows(inspirationDraft[field.key]);
                      const isLastField = field.key === 'requirement';
                      return (
                        <div key = {field.key} className="block shrink-0 text-sm font-bold text-gray-700">
                          <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${inspirationDraft[field.key].trim() ? 'xy-has-value' : ''}`}>
                            <textarea
                              data-no-modal-drag="true"
                              value={inspirationDraft[field.key]}
                              onChange={(event) => setInspirationField(field.key, event.target.value)}
                              placeholder={field.placeholder}
                              rows={1}
                              className={`font-bold leading-5 ${isLastField ? 'min-h-0 flex-1' : ''}`}
                              style={isLastField ? {
                                minHeight: `${Math.max(180, rows * 20 + 52)}px`,
                                height: '100%',
                                overflowY: 'hidden',
                              } : {
                                height: `${Math.max(52, rows * 20 + 32)}px`,
                                overflowY: 'hidden',
                              }}
                            />
                            <label>{field.label}</label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="shrink-0 text-sm font-black text-slate-950">生成个数：</span>
                    <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {['1', '3', '5', '10'].map((value) => {
                        const active = inspirationGenerateCount === value;
                        return (
                          <button
                            key = {value}
                            type="button"
                            onClick={() => setInspirationGenerateCount(value)}
                            className={`min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black leading-none transition-colors last:border-r-0 ${
                              active
                                ? 'bg-[#08AACE] text-white'
                                : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void submitInspiration('normal')}
                    disabled={!inspirationUserContent.trim() || isSubmitting}
                    className="h-10 w-16 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? '生成中...' : '生成'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'inspiration' ? (
            <section className="hidden">
              <div className="xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 overflow-y-auto overflow-x-hidden px-0 py-2">
                <div className="flex flex-col gap-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-700">
                    {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key === 'genre' || field.key === 'theme').map((field) => {
                      const rows = getInspirationFieldRows(inspirationDraft[field.key]);
                      return (
                        <div
                          key={field.key}
                          className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${inspirationDraft[field.key].trim() ? 'xy-has-value' : ''}`}
                        >
                          <textarea
                            data-no-modal-drag="true"
                            value={inspirationDraft[field.key]}
                            onChange={(event) => setInspirationField(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            rows={1}
                            className="font-bold leading-5"
                            style={{
                              height: `${Math.max(52, rows * 20 + 32)}px`,
                              overflowY: 'hidden',
                            }}
                          />
                          <label>{field.label}</label>
                        </div>
                      );
                    })}
                  </div>
                  {CONCEPT_INSPIRATION_FIELDS.filter((field) => field.key !== 'genre' && field.key !== 'theme').map((field) => {
                    const rows = getInspirationFieldRows(inspirationDraft[field.key]);
                    const isMainField = field.key === 'idea';
                    return (
                      <div key={field.key} className="block text-sm font-bold text-gray-700">
                        <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${inspirationDraft[field.key].trim() ? 'xy-has-value' : ''}`}>
                          <textarea
                            data-no-modal-drag="true"
                            value={inspirationDraft[field.key]}
                            onChange={(event) => setInspirationField(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            rows={1}
                            className="font-bold leading-5"
                            style={{
                              height: `${Math.max(isMainField ? 150 : 72, rows * 20 + 32)}px`,
                              overflowY: 'hidden',
                            }}
                          />
                          <label>{field.label}{isMainField && <span><WordCountText value={countTextWords(inspirationDraft[field.key])} /></span>}</label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => void submitInspiration('normal')}
                  disabled={!inspirationUserContent.trim() || isSubmitting}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-600 px-2 text-xs font-black text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : '整理保存'}
                </button>
                <button
                  type="button"
                  onClick={() => void submitInspiration('association')}
                  disabled={!inspirationUserContent.trim() || isSubmitting}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 px-2 text-xs font-black text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300"
                >
                  联想保存
                </button>
                <button
                  type="button"
                  onClick={() => void submitInspiration('both')}
                  disabled={!inspirationUserContent.trim() || isSubmitting}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  同时保存
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-black text-slate-800">
                  平台
                  <select
                    data-no-modal-drag="true"
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value as ConceptPlatform)}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
                  >
                    {platforms.map((item) => <option key = {item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-sm font-black text-slate-800">
                  类型
                  <select
                    data-no-modal-drag="true"
                    value={genre}
                    onChange={(event) => setGenre(event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
                  >
                    {genres.map((item) => <option key = {item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-black text-slate-800">
                题材标题
                <input
                  data-no-modal-drag="true"
                  value={genreTitle}
                  onChange={(event) => setGenreTitle(event.target.value)}
                  placeholder="例如：赛博修仙纪元"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="mt-3 block text-sm font-black text-slate-800">
                题材设定
                <textarea
                  data-no-modal-drag="true"
                  value={genreInput}
                  onChange={(event) => setGenreInput(event.target.value)}
                  placeholder="写下这个题材的核心设定、主角方向、世界规则、爽点或你想保留的感觉。"
                  className="mt-2 min-h-[180px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none focus:border-cyan-400 focus:bg-white"
                />
              </label>
              <button
                type="button"
                onClick={() => void submitGenreConcept()}
                disabled={!genreInput.trim() || isSubmitting}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-black text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                整理题材并保存
              </button>
            </section>
          )}

          {notice && (
            <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold leading-6 text-cyan-700">
              {notice}
            </div>
          )}
        </section>

        <section className="col-start-2 row-start-1 flex min-h-0 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSelectedItemId(null);
                  }}
                  placeholder="搜索标题、正文、标签"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold outline-none focus:border-cyan-400 focus:bg-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setSelectedItemId(null);
                }}
                className="h-10 min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
              >
                {categories.map((category) => <option key = {category} value={category}>{category}</option>)}
              </select>
              <button
                type="button"
                onClick={clearActiveKind}
                disabled={activeItems.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-sm font-black text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
              >
                清空{getKindLabel(activeTab)}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {visibleItems.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                {visibleItems.map((item) => (
                  <ConceptCard key = {item.id} item={item} onDelete={deleteConceptItem} />
                ))}
              </div>
            ) : (
              <div className="grid h-full min-h-[360px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
                <div>
                  <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-black text-slate-500">暂无{activeTab === 'inspiration' ? '灵感' : '题材'}构思</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">右侧发送给 AI 后会自动保存到这里。</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


