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
import { useMemo, useState } from 'react';
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
import { WordCountText } from '@/shared/ui/WordCountText';
import {
  buildInspirationGenerationUserContent,
  ConceptInspirationForm,
  normalizeInspirationGenerateCount,
} from '../components/ConceptInspirationForm';
import { ConceptLibraryModals } from '../components/ConceptLibraryModals';
import { ConceptLibraryDirectory } from '../components/ConceptLibraryDirectory';
import { ConceptLibraryHeader } from '../components/ConceptLibraryHeader';

import {
  conceptTabs,
  platforms,
  genres,
  type InspirationSaveMode,
  type ConceptInspirationFieldKey,
  type ConceptInspirationDraft,
  type ConceptAiRequestLog,
  EMPTY_INSPIRATION_DRAFT,
  type ConceptLibraryPageProps,
  formatTime,
  buildGenreUserContent,
  buildInspirationUserContent,
  countTextWords,
  getRequestLogMeta,
  buildConceptLogGroups,
  getItemDirectory,
  getKindLabel,
  stopFormEvent,
  ConceptCard,
} from '@/features/concept-library/components/ConceptLibraryParts';

export function ConceptLibraryPage({ embedded = false }: ConceptLibraryPageProps = {}) {
  const navigate = useNavigate();
  const { items, stats, addItem, addItems, deleteItem, replaceAll } = useConceptLibrary();
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
  const [pendingAssociationItems, setPendingAssociationItems] = useState<InspirationConceptItem[]>([]);
  const [isAiLogOpen, setIsAiLogOpen] = useState(false);
  const [lastAiRequestLog, setLastAiRequestLog] = useState<ConceptAiRequestLog | null>(null);
  const [inspirationGenerateCount, setInspirationGenerateCount] = useState('10');

  const activeItems = useMemo(() => items.filter((item) => item.kind === activeTab), [activeTab, items]);
  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(activeItems.map((item) => item.category || '待整理')))],
    [activeItems],
  );
  const categoryGroups = useMemo(
    () =>
      categories
        .filter((category) => category !== '全部')
        .map((category) => ({
          category,
          items: activeItems.filter((item) => (item.category || '待整理') === category),
        })),
    [activeItems, categories],
  );
  const selectedItem = useMemo(
    () => activeItems.find((item) => item.id === selectedItemId) ?? null,
    [activeItems, selectedItemId],
  );
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
        ...(item.kind === 'inspiration' ? (item.association?.tags ?? []) : []),
      ]
        .join('\n')
        .toLowerCase()
        .includes(keyword);
    });
  }, [activeItems, search, selectedCategory, selectedItem]);

  const configuredCloud = Boolean(
    cloudConfig.bucket.trim() &&
    cloudConfig.region.trim() &&
    cloudConfig.secretId.trim() &&
    cloudConfig.secretKey.trim(),
  );
  const cloudObjectKey = getConceptCloudObjectKey(cloudConfig);
  const inspirationUserContent = useMemo(() => buildInspirationUserContent(inspirationDraft), [inspirationDraft]);
  const previewAiRequestLog = useMemo<ConceptAiRequestLog>(() => {
    const mode: InspirationSaveMode = activeTab === 'inspiration' ? 'normal' : 'both';
    return {
      createdAt: '当前预览',
      action: activeTab === 'inspiration' ? '灵感整理保存' : '题材整理保存',
      modelName: activeModel?.name ?? '未选择模型',
      systemPrompt:
        activeTab === 'inspiration' ? buildInspirationPrompt(mode) : buildGenreConceptPrompt(platform, genre),
      userContent:
        activeTab === 'inspiration'
          ? inspirationUserContent
          : buildGenreUserContent(platform, genre, genreTitle, genreInput),
    };
  }, [activeModel?.name, activeTab, genre, genreInput, genreTitle, inspirationUserContent, platform]);
  const visibleAiRequestLog = lastAiRequestLog ?? previewAiRequestLog;
  const embeddedToolbarTarget =
    embedded && typeof document !== 'undefined' ? document.getElementById('concept-library-toolbar-slot') : null;
  const embeddedToolbar = useMemo(
    () => (
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
    ),
    [navigate],
  );

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
    if (!window.confirm(`确定清空全部${label}吗？这个操作不会影响${activeTab === 'inspiration' ? '题材' : '灵感'}。`))
      return;
    replaceAll(items.filter((item) => item.kind !== activeTab));
    setSelectedCategory('全部');
    setSelectedItemId(null);
    setSearch('');
    setNotice(`已清空全部${label}。`);
  };

  const setInspirationField = (key: ConceptInspirationFieldKey, value: string) => {
    setInspirationDraft((current) => ({ ...current, [key]: value }));
  };

  const saveInspirationItems = (newItems: InspirationConceptItem[], message: string) => {
    const firstItem = newItems[0];
    if (!firstItem) return;
    addItems(newItems);
    setActiveTab('inspiration');
    setSelectedItemId(firstItem.id);
    setSelectedCategory(firstItem.category);
    setInspirationDraft(EMPTY_INSPIRATION_DRAFT);
    setNotice(message);
  };

  const confirmAssociationSave = () => {
    if (pendingAssociationItems.length === 0) return;
    saveInspirationItems(pendingAssociationItems, `已保存 ${pendingAssociationItems.length} 条联想灵感。`);
    setPendingAssociationItems([]);
  };

  const submitInspiration = async (mode: InspirationSaveMode) => {
    const rawInput = inspirationUserContent.trim();
    if (!rawInput || isSubmitting) return;
    if (mode === 'association' && !activeModel) {
      setNotice('联想保存需要先选择可用模型。');
      return;
    }
    const requestedCount = normalizeInspirationGenerateCount(inspirationGenerateCount);
    const generationCount = activeModel ? requestedCount : 1;
    const generatedItems: InspirationConceptItem[] = [];
    let failureMessage = '';
    setIsSubmitting(true);
    try {
      if (!activeModel) {
        generatedItems.push(createInspirationConcept(rawInput, null));
      } else {
        const prompt = buildInspirationPrompt(mode);
        for (let index = 0; index < generationCount; index += 1) {
          const userContent = buildInspirationGenerationUserContent(rawInput, index, generationCount);
          setNotice(`正在生成 ${index + 1}/${generationCount}...`);
          setLastAiRequestLog({
            createdAt: new Date().toLocaleString('zh-CN'),
            action: `${mode === 'normal' ? '灵感整理保存' : mode === 'association' ? '灵感联想保存' : '灵感同时保存'} ${index + 1}/${generationCount}`,
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
          const result = parseConceptAiJson(response);
          if (!result) {
            failureMessage = `第 ${index + 1} 条返回格式无法解析。`;
            break;
          }
          if (mode === 'association' && !result?.association) {
            failureMessage = `第 ${index + 1} 条没有返回可确认的联想内容。`;
            break;
          }
          generatedItems.push(
            createInspirationConcept(rawInput, result, {
              includeAssociation: mode === 'both',
              useAssociationAsMain: mode === 'association',
            }),
          );
        }
      }
    } catch (error) {
      failureMessage = error instanceof Error ? error.message : '未知错误';
    } finally {
      if (mode !== 'association' && generatedItems.length === 0 && failureMessage) {
        generatedItems.push(createInspirationConcept(rawInput, null));
      }
      if (mode === 'association') {
        if (generatedItems.length > 0) {
          setPendingAssociationItems(generatedItems);
          setNotice(
            failureMessage
              ? `已生成 ${generatedItems.length} 条，后续生成停止：${failureMessage}`
              : `已生成 ${generatedItems.length} 条联想，请确认后保存。`,
          );
        } else {
          setNotice(`AI 联想失败：${failureMessage || '没有可确认内容'}`);
        }
      } else if (generatedItems.length > 0) {
        saveInspirationItems(
          generatedItems,
          failureMessage
            ? `已保存 ${generatedItems.length} 条，后续生成停止：${failureMessage}`
            : !activeModel
              ? '没有可用模型，已保存为待整理。'
              : `已生成并保存 ${generatedItems.length} 条灵感。`,
        );
      } else {
        setNotice(`AI 生成失败：${failureMessage || '没有可保存内容'}`);
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
        <ConceptLibraryHeader
          stats={stats}
          models={models}
          activeModelId={activeId}
          onModelChange={setActiveId}
          onOpenLog={() => setIsAiLogOpen(true)}
          onOpenCloud={() => setShowCloudSettings(true)}
        />
      )}

      <ConceptLibraryModals
        cloudOpen={showCloudSettings}
        cloudConfig={cloudConfig}
        cloudObjectKey={cloudObjectKey}
        cloudBusy={isCloudBusy}
        logOpen={isAiLogOpen}
        log={visibleAiRequestLog}
        associations={pendingAssociationItems}
        onCloudClose={() => setShowCloudSettings(false)}
        onCloudChange={setCloudConfig}
        onCloudSave={saveCloudConfig}
        onCloudUpload={() => void uploadCloudSnapshot()}
        onCloudRestore={() => void restoreCloudSnapshot()}
        onLogClose={() => setIsAiLogOpen(false)}
        onAssociationClose={() => setPendingAssociationItems([])}
        onAssociationConfirm={confirmAssociationSave}
      />

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_minmax(340px,420px)] overflow-hidden">
        <ConceptLibraryDirectory
          activeTab={activeTab}
          activeItems={activeItems}
          groups={categoryGroups}
          selectedCategory={selectedCategory}
          selectedItemId={selectedItemId}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedCategory('全部');
            setSelectedItemId(null);
          }}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setSelectedItemId(null);
          }}
          onItemChange={(item) => {
            setSelectedCategory(item.category || '待整理');
            setSelectedItemId(item.id);
          }}
        />

        <section
          className="relative z-10 col-start-3 row-start-1 min-h-0 overflow-y-auto border-l border-slate-200 bg-white p-5"
          data-no-modal-drag="true"
          onMouseDown={stopFormEvent}
          onPointerDown={stopFormEvent}
          onKeyDown={stopFormEvent}
        >
          {activeTab === 'inspiration' && (
            <ConceptInspirationForm
              models={models}
              activeModelId={activeId}
              draft={inspirationDraft}
              generateCount={inspirationGenerateCount}
              isSubmitting={isSubmitting}
              canSubmit={Boolean(inspirationUserContent.trim())}
              onModelChange={setActiveId}
              onManageModels={() => navigate('/model-manage')}
              onManagePrompts={() => setNotice('构思库当前使用固定脑洞提示词。')}
              onFieldChange={setInspirationField}
              onGenerateCountChange={setInspirationGenerateCount}
              onSubmit={(mode) => void submitInspiration(mode)}
            />
          )}
          {activeTab === 'genreConcept' && (
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
                    {platforms.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
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
                    {genres.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
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
                  <ConceptCard key={item.id} item={item} onDelete={deleteConceptItem} />
                ))}
              </div>
            ) : (
              <div className="grid h-full min-h-[360px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
                <div>
                  <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-black text-slate-500">
                    暂无{activeTab === 'inspiration' ? '灵感' : '题材'}构思
                  </p>
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
