import { CheckCircle, Edit3, Plus, Tag, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface TagItem {
  id: string;
  name: string;
  category: string;
  color: string;
  count: number;
  description?: string;
}

const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#94A3B8', '#64748B',
];

const STORAGE_KEY = 'tag_zone_v1';

function loadTags(): TagItem[] {
  try {
    const raw = localStorage.getItem('material_tags_v3') ?? localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TagItem[];
      return parsed.map((tag) => ({ ...tag, category: tag.category ?? '默认分类' }));
    }
  } catch {
    // ignore
  }
  return [
    { id: '1', name: '热血', category: '默认分类', color: '#EF4444', count: 12 },
    { id: '2', name: '战斗', category: '默认分类', color: '#F97316', count: 8 },
    { id: '3', name: '成长', category: '默认分类', color: '#10B981', count: 15 },
    { id: '4', name: '悬疑', category: '默认分类', color: '#8B5CF6', count: 6 },
    { id: '5', name: '爱情', category: '默认分类', color: '#EC4899', count: 10 },
    { id: '6', name: '科幻', category: '默认分类', color: '#3B82F6', count: 4 },
  ];
}

function countTagUsage(name: string) {
  try {
    const materials = JSON.parse(localStorage.getItem('xinyuexia_materials_v1') ?? '[]') as Array<{ tags?: string[] }>;
    const plots = JSON.parse(localStorage.getItem('xinyuexia_plot_library_v1') ?? '[]') as Array<{ tags?: string[] }>;
    return [...materials, ...plots].filter((item) => item.tags?.includes(name)).length;
  } catch {
    return 0;
  }
}

export default function TagZonePage() {
  const [tags, setTags] = useState<TagItem[]>(loadTags);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('默认分类');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TagItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const categories = useMemo(() => Array.from(new Set(tags.map((tag) => tag.category || '默认分类'))), [tags]);
  const displayedTags = useMemo(() => tags.map((tag) => ({ ...tag, count: countTagUsage(tag.name) || tag.count || 0 })), [tags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    localStorage.setItem('material_tags_v3', JSON.stringify(tags));
  }, [tags]);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2000);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    setTags((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        category: newCategory.trim() || '默认分类',
        color: newColor,
        count: 0,
      },
    ]);
    setNewName('');
    setIsAdding(false);
    showToast('标签已创建');
  };

  const handleDelete = (id: string) => {
    const target = tags.find((item) => item.id === id);
    if (!target) return;
    setDeleteTarget(target);
  };

  const handleEditStart = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const handleEditSave = (id: string) => {
    if (!editName.trim()) return;
    setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, name: editName.trim() } : tag)));
    setEditingId(null);
    showToast('标签已更新');
  };

  const importTags = () => {
    const imported: TagItem[] = [];
    let currentCategory = newCategory.trim() || '默认分类';
    importText.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => {
      const categoryMatch = line.match(/\*([^*：:]+)[：:][^*]*\*/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1].trim();
        return;
      }
      const tagMatch = line.match(/【([^【】：:]+)(?:[：:]([^】]+))?】/) ?? line.match(/^#?([^：:,，、\s]+)(?:[：:](.+))?/);
      if (!tagMatch) return;
      const name = tagMatch[1].trim();
      if (!name || tags.some((tag) => tag.name === name) || imported.some((tag) => tag.name === name)) return;
      imported.push({
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        category: currentCategory,
        color: TAG_COLORS[(tags.length + imported.length) % TAG_COLORS.length],
        count: 0,
        description: tagMatch[2]?.trim(),
      });
    });
    setTags((prev) => [...prev, ...imported]);
    setShowImport(false);
    setImportText('');
    showToast(`已导入 ${imported.length} 个标签`);
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">标签专区</h1>
          <span className="rounded-md bg-violet-500 px-2 py-0.5 text-xs text-white">{tags.length} 个标签</span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600"
        >
          <Plus className="h-3.5 w-3.5" />
          新建标签
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="ml-2 flex items-center gap-1.5 rounded-md border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50"
        >
          <Upload className="h-3.5 w-3.5" />
          批量导入
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isAdding && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="标签名称"
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
                autoFocus
              />
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="分类"
                className="w-32 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
              />
              <div className="flex gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`h-6 w-6 rounded-full border-2 transition-all ${newColor === color ? 'scale-110 border-gray-800' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button onClick={handleAdd} className="rounded-md bg-violet-500 px-4 py-2 text-sm text-white hover:bg-violet-600">
                确认
              </button>
              <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {displayedTags.map((tag) => (
            <div key={tag.id} className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${tag.color}20` }}>
                  <Tag className="h-5 w-5" style={{ color: tag.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  {editingId === tag.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-violet-300"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleEditSave(tag.id);
                        }}
                      />
                      <button onClick={() => handleEditSave(tag.id)} className="text-xs text-emerald-600 hover:text-emerald-700">
                        保存
                      </button>
                    </div>
                  ) : (
                    <div className="truncate text-sm font-bold text-gray-800">{tag.name}</div>
                  )}
                  <div className="mt-0.5 text-xs text-gray-400">{tag.count} 个资源</div>
                  <div className="mt-1 w-fit rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{tag.category}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => handleEditStart(tag)} className="rounded-md p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Tag className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">暂无标签</p>
            <p className="mt-1 text-xs">点击右上角新建标签</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除"
        description={`确定删除标签“${deleteTarget?.name ?? ''}”吗？删除后将无法恢复。`}
        confirmText="确认删除"
        confirmVariant="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setTags((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            showToast('标签已删除');
          }
          setDeleteTarget(null);
        }}
      />

      {showImport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40" onClick={() => setShowImport(false)}>
          <div className="flex h-[520px] w-[620px] max-w-[92vw] flex-col rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">批量导入标签</h3>
                <p className="mt-1 text-xs text-gray-400">支持 *分类：说明* 和 【标签：说明】格式。</p>
              </div>
              <button onClick={() => setShowImport(false)} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="m-5 min-h-0 flex-1 resize-none rounded-lg border border-gray-200 p-3 text-sm leading-7 outline-none focus:border-violet-300"
              placeholder={'*剧情推进：推动情节变化的标签*\n【反转：信息或立场突然变化】\n【冲突升级：矛盾强度上升】'}
            />
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button onClick={() => setShowImport(false)} className="rounded-md border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={importTags} className="rounded-md bg-violet-500 px-4 py-1.5 text-sm text-white hover:bg-violet-600">导入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
