import { ArrowLeft, BookOpen, Download, Edit3, Library, Plus, Search, Tag, Trash2, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMaterials } from '@/features/materials/hooks/useMaterials';
import type { MaterialItem, MaterialType } from '@/features/materials/model/materialTypes';
import { useNovelLibrary } from '@/features/novels/hooks/useNovelLibrary';

type SortMode = 'time' | 'title';

const TYPE_LABELS: Record<MaterialType, string> = {
  novel: '小说',
  script: '剧本',
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseTags(text: string) {
  return text.split(/[,，、#\s]+/).map((item) => item.trim()).filter(Boolean);
}

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

interface MaterialsPageProps {
  embedded?: boolean;
}

export function MaterialsPage({ embedded = false }: MaterialsPageProps = {}) {
  const navigate = useNavigate();
  const { novels } = useNovelLibrary();
  const { items, addMaterial, updateMaterial, deleteMaterial, clearAll, stats } = useMaterials();
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const [activeNovelId, setActiveNovelId] = useState<number | null>(novels[0]?.id ?? null);
  const [activeType, setActiveType] = useState<MaterialType | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    novelId: novels[0]?.id ?? 0,
    novelTitle: novels[0]?.title ?? '',
    type: 'novel' as MaterialType,
    title: '',
    content: '',
    chapterName: '',
    chapterSerial: '',
    tags: '',
    rating: '',
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/materials');
  };

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchKeyword = !keyword
        || item.title.toLowerCase().includes(keyword)
        || item.novelTitle.toLowerCase().includes(keyword)
        || item.content.toLowerCase().includes(keyword)
        || (item.chapterName?.toLowerCase().includes(keyword) ?? false)
        || (item.tags?.some((tag) => tag.toLowerCase().includes(keyword)) ?? false);
      const matchNovel = !activeNovelId || item.novelId === activeNovelId;
      const matchType = activeType === 'all' || item.type === activeType;
      return matchKeyword && matchNovel && matchType;
    });

    result.sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title, 'zh-CN');
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [activeNovelId, activeType, items, search, sortMode]);

  const selectedItem = items.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

  const syncDraftFromItem = (item: MaterialItem) => {
    setDraft({
      novelId: item.novelId,
      novelTitle: item.novelTitle,
      type: item.type,
      title: item.title,
      content: item.content,
      chapterName: item.chapterName ?? '',
      chapterSerial: item.chapterSerial ? String(item.chapterSerial) : '',
      tags: (item.tags ?? []).join('，'),
      rating: item.rating ? String(item.rating) : '',
    });
    setEditingId(item.id);
    setSelectedId(item.id);
    setActiveNovelId(item.novelId);
    setActiveType(item.type);
  };

  const startNew = () => {
    const novel = novels.find((item) => item.id === activeNovelId) ?? novels[0];
    setDraft({
      novelId: novel?.id ?? 0,
      novelTitle: novel?.title ?? '',
      type: activeType === 'all' ? 'novel' : activeType,
      title: '',
      content: '',
      chapterName: '',
      chapterSerial: '',
      tags: '',
      rating: '',
    });
    setEditingId(null);
    setSelectedId(null);
  };

  const saveCurrent = () => {
    if (!draft.title.trim()) return;
    const targetNovel = novels.find((item) => item.id === draft.novelId);
    const payload = {
      novelId: draft.novelId,
      novelTitle: draft.novelTitle || targetNovel?.title || '',
      type: draft.type,
      title: draft.title.trim(),
      content: draft.content,
      chapterName: draft.chapterName.trim() || undefined,
      chapterSerial: draft.chapterSerial ? Number(draft.chapterSerial) : undefined,
      tags: parseTags(draft.tags),
      rating: draft.rating ? Number(draft.rating) : undefined,
    };

    if (editingId) {
      updateMaterial(editingId, payload);
    } else {
      const created = addMaterial(payload);
      setSelectedId(created.id);
      setEditingId(created.id);
    }
  };

  const clearDraft = () => {
    startNew();
  };

  const importMaterialsFromText = () => {
    const targetNovel = novels.find((item) => item.id === draft.novelId) ?? novels[0];
    if (!targetNovel || !importText.trim()) return;
    const blocks = importText.split(/\n-{3,}\n|\n#{2,}\s*/).map((block) => block.trim()).filter(Boolean);
    blocks.forEach((block, index) => {
      const lines = block.split('\n');
      const title = lines[0]?.replace(/^【(.+)】$/, '$1').trim() || `导入资料 ${index + 1}`;
      const content = lines.slice(1).join('\n').trim() || block;
      addMaterial({
        novelId: targetNovel.id,
        novelTitle: targetNovel.title,
        type: targetNovel.type,
        title,
        content,
        tags: parseTags(content.match(/【标签】(.+)/)?.[1] ?? ''),
        rating: Number(content.match(/【评分】\s*(\d+)/)?.[1] ?? '') || undefined,
      });
    });
    setShowImport(false);
    setImportText('');
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!embedded && (
              <button
                onClick={handleBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
                title="返回资料库"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Library className="h-5 w-5 text-brand" />
            <div>
              <h1 className="text-base font-bold text-gray-900">设定库</h1>
              <p className="text-[10px] text-gray-400">
                共 {stats.count} 条资料，关联 {stats.novelCount} 个作品
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative w-48">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索资料..."
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-7 text-xs outline-none focus:border-brand"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand"
            >
              <option value="time">最新</option>
              <option value="title">标题</option>
            </select>
            <button onClick={startNew} className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-dark">
              <Plus className="h-3.5 w-3.5" />
              新建
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-1 rounded-lg border border-brand/30 px-3 py-1.5 text-xs text-brand hover:bg-brand-light">
              <Upload className="h-3.5 w-3.5" />
              智能导入
            </button>
            <button
              onClick={() => downloadText('设定库导出.txt', filteredItems.map((item) => `# ${item.title}\n作品：${item.novelTitle}\n标签：${(item.tags ?? []).join('，')}\n评分：${item.rating ?? ''}\n\n${item.content}`).join('\n\n---\n\n'))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              <Download className="h-3.5 w-3.5" />
              导出
            </button>
            {items.length > 0 && (
              <button onClick={() => setShowClearConfirm(true)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[210px] shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-3 py-2.5">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
              <BookOpen className="h-3.5 w-3.5 text-gray-500" />
              作品筛选
            </div>
            <button
              onClick={() => setActiveNovelId(null)}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                activeNovelId === null ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>全部作品</span>
              <span>{items.length}</span>
            </button>
            {novels.map((novel) => (
              <button
                key={novel.id}
                onClick={() => {
                  setActiveNovelId(novel.id);
                  setDraft((prev) => ({ ...prev, novelId: novel.id, novelTitle: novel.title }));
                }}
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  activeNovelId === novel.id ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{novel.title}</span>
                <span>{items.filter((item) => item.novelId === novel.id).length}</span>
              </button>
            ))}
          </div>
          <div className="border-b border-gray-100 px-3 py-2">
            <div className="mb-2 text-xs font-bold text-gray-700">类型</div>
            <div className="flex gap-2">
              {(['all', 'novel', 'script'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    activeType === type ? 'bg-brand-light text-brand' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? '全部' : TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs leading-5 text-gray-400">
                {items.length === 0 ? '暂无资料' : '没有匹配的资料'}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      syncDraftFromItem(item);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedId === item.id ? 'border-brand bg-brand-light/50' : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-gray-800">{item.title}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{item.novelTitle} · {TYPE_LABELS[item.type]}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-400">{formatTime(item.updatedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{editingId ? '编辑资料' : '新建资料'}</h2>
                <p className="mt-1 text-xs text-gray-400">资料会保存到本地，后续我们可以继续接同步和导出。</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearDraft} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  重置
                </button>
                <button onClick={saveCurrent} className="rounded-md bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-dark">
                  {editingId ? '保存修改' : '保存资料'}
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">作品</span>
                <select
                  value={draft.novelId}
                  onChange={(event) => {
                    const novelId = Number(event.target.value);
                    const novel = novels.find((item) => item.id === novelId);
                    setDraft((prev) => ({
                      ...prev,
                      novelId,
                      novelTitle: novel?.title ?? '',
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {novels.map((novel) => (
                    <option key={novel.id} value={novel.id}>{novel.title}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">类型</span>
                <select
                  value={draft.type}
                  onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as MaterialType }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  <option value="novel">小说</option>
                  <option value="script">剧本</option>
                </select>
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-medium text-gray-500">标题</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">标签</span>
                <input
                  value={draft.tags}
                  onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="用逗号或空格分隔"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">评分</span>
                <input
                  value={draft.rating}
                  onChange={(event) => setDraft((prev) => ({ ...prev, rating: event.target.value }))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">章节名</span>
                <input
                  value={draft.chapterName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, chapterName: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500">章节序号</span>
                <input
                  value={draft.chapterSerial}
                  onChange={(event) => setDraft((prev) => ({ ...prev, chapterSerial: event.target.value }))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand"
                />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-medium text-gray-500">内容</span>
                <textarea
                  value={draft.content}
                  onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                  className="editor-scrollbar h-[280px] w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                />
              </label>
            </div>
          </section>

          {selectedItem && (
            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">当前条目预览</h2>
                  <p className="mt-1 text-xs text-gray-400">{selectedItem.novelTitle} · {TYPE_LABELS[selectedItem.type]} · {formatTime(selectedItem.updatedAt)}</p>
                  {(selectedItem.tags?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedItem.tags?.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[10px] text-brand">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteMaterial(selectedItem.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    删除
                  </button>
                  <button
                    onClick={() => syncDraftFromItem(selectedItem)}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <Edit3 className="mr-1 inline h-3.5 w-3.5" />
                    载入编辑
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{selectedItem.content}</pre>
            </section>
          )}
        </main>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowClearConfirm(false)}>
          <div className="w-[360px] rounded-xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900">确认清空</h3>
            <p className="mt-2 text-sm text-gray-500">清空后当前设定库内容无法恢复。</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                }}
                className="rounded-md bg-red-500 px-4 py-1.5 text-sm text-white hover:bg-red-600"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowImport(false)}>
          <div className="flex h-[560px] w-[680px] max-w-[92vw] flex-col rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">智能导入资料</h3>
                <p className="mt-1 text-xs text-gray-400">用 --- 或 ## 分隔多条资料，可识别【标签】和【评分】。</p>
              </div>
              <button onClick={() => setShowImport(false)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="m-5 min-h-0 flex-1 resize-none rounded-lg border border-gray-200 p-3 text-sm leading-7 outline-none focus:border-brand"
              placeholder={'资料标题\n资料内容...\n【标签】人物，伏笔\n【评分】4\n\n---\n\n下一条资料'}
            />
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button onClick={() => setShowImport(false)} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={importMaterialsFromText} className="rounded-md bg-brand px-4 py-1.5 text-sm text-white hover:bg-brand-dark">导入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
