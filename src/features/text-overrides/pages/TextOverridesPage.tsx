import { Copy, Download, Edit3, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  formatShortcut,
  loadShortcutBindings,
  SHORTCUT_UPDATED_EVENT,
} from '@/shared/shortcuts/shortcutConfig';
import {
  readTextEditMode,
  readTextOverrides,
  removeTextOverride,
  saveTextOverrides,
  setTextEditMode,
  setTextOverrideEnabled,
  TEXT_EDIT_MODE_EVENT,
  TEXT_OVERRIDE_UPDATED_EVENT,
  type TextOverrideItem,
} from '@/shared/text-overrides/textOverrideStore';

export function TextOverridesPage() {
  const [items, setItems] = useState<TextOverrideItem[]>(readTextOverrides);
  const [search, setSearch] = useState('');
  const [editMode, setEditModeState] = useState(readTextEditMode);
  const [shortcutLabel, setShortcutLabel] = useState(() => formatShortcut(loadShortcutBindings().toggle_text_edit_mode));
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => setItems(readTextOverrides());

  useEffect(() => {
    const handleUpdated = () => refresh();
    const handleEditMode = () => setEditModeState(readTextEditMode());
    const handleShortcutUpdated = () => setShortcutLabel(formatShortcut(loadShortcutBindings().toggle_text_edit_mode));
    window.addEventListener(TEXT_OVERRIDE_UPDATED_EVENT, handleUpdated);
    window.addEventListener(TEXT_EDIT_MODE_EVENT, handleEditMode);
    window.addEventListener(SHORTCUT_UPDATED_EVENT, handleShortcutUpdated);
    return () => {
      window.removeEventListener(TEXT_OVERRIDE_UPDATED_EVENT, handleUpdated);
      window.removeEventListener(TEXT_EDIT_MODE_EVENT, handleEditMode);
      window.removeEventListener(SHORTCUT_UPDATED_EVENT, handleShortcutUpdated);
    };
  }, []);

  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => (
      item.original.toLowerCase().includes(keyword) ||
      item.replacement.toLowerCase().includes(keyword) ||
      item.path.toLowerCase().includes(keyword)
    ));
  }, [items, search]);

  const enabledCount = items.filter((item) => item.enabled).length;

  const toggleEditMode = () => {
    const next = !readTextEditMode();
    setTextEditMode(next);
    setEditModeState(next);
  };

  const updateReplacement = (id: string, replacement: string) => {
    const previous = items.find((item) => item.id === id);
    const next = items.map((item) => (
      item.id === id ? { ...item, replacement, updatedAt: new Date().toLocaleString('zh-CN') } : item
    ));
    setItems(next);
    saveTextOverrides(next, previous ? {
      changed: {
        original: previous.original,
        replacement,
        previousReplacement: previous.replacement,
      },
    } : undefined);
  };

  const exportTextOverrides = async () => {
    const text = JSON.stringify(items, null, 2);
    await navigator.clipboard?.writeText(text).catch(() => {});
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `文案修改-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copySyncList = async () => {
    const text = JSON.stringify(
      items.map((item) => ({
        original: item.original,
        replacement: item.replacement,
        enabled: item.enabled,
        path: item.path,
      })),
      null,
      2,
    );
    await navigator.clipboard?.writeText(text).catch(() => {});
  };

  const importTextOverrides = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as TextOverrideItem[];
    if (!Array.isArray(parsed)) throw new Error('文案文件格式不正确。');
    saveTextOverrides(parsed);
    setItems(readTextOverrides());
  };

  const clearAll = () => {
    if (!window.confirm('确认清空所有文案修改吗？')) return;
    saveTextOverrides([]);
    setItems([]);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">文案修改</h1>
          <p className="mt-0.5 text-xs text-slate-400">当前快捷键 {shortcutLabel}：点击页面文字后可修改显示文案，可在快捷键设置里更换。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEditMode}
            className={`h-9 rounded-xl px-4 text-sm font-bold ${
              editMode ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-brand text-white hover:bg-brand-dark'
            }`}
          >
            {editMode ? '退出点选修改' : '进入点选修改'}
          </button>
          <button onClick={exportTextOverrides} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            导出
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-6">
        <div className="grid h-full grid-cols-[280px_minmax(0,1fr)] gap-5">
          <aside className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="rounded-2xl bg-brand-light p-4">
              <div className="text-3xl font-black text-brand">{items.length}</div>
              <div className="mt-1 text-sm font-bold text-slate-700">已修改文案</div>
              <div className="mt-2 text-xs font-medium leading-5 text-slate-500">启用 {enabledCount} 条，停用 {items.length - enabledCount} 条。</div>
            </div>

            <div className="mt-4 space-y-2">
              <button onClick={copySyncList} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark">
                <Copy className="h-4 w-4" />
                复制同步清单
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                导入文案修改
              </button>
              <button onClick={clearAll} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 text-sm font-bold text-red-500 hover:bg-red-50">
                <RotateCcw className="h-4 w-4" />
                清空全部修改
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void importTextOverrides(file).catch((error) => window.alert(error instanceof Error ? error.message : '导入失败'));
                  event.target.value = '';
                }}
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
              说明：这里的修改只存在本地，不会直接改代码。你确认满意后，点“复制同步清单”，发给我，我可以把它同步进代码默认文案。
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">文案列表</h2>
                <p className="mt-1 text-xs text-slate-400">可以编辑、启用/停用、删除，也可以搜索原文案和新文案。</p>
              </div>
              <div className="relative w-[320px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索文案"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              {visibleItems.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                  <Edit3 className="h-10 w-10 text-slate-300" />
                  <div className="mt-3 text-base font-bold text-slate-500">还没有文案修改</div>
                  <div className="mt-1 text-sm text-slate-400">按 {shortcutLabel}，然后点击页面文字开始修改。</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleItems.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900">{item.original}</div>
                          <div className="mt-1 truncate text-xs text-slate-400">{item.path || '未记录页面'} · {item.updatedAt}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => {
                              setTextOverrideEnabled(item.id, !item.enabled);
                              refresh();
                            }}
                            className={`h-8 rounded-lg px-3 text-xs font-bold ${
                              item.enabled ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-500'
                            }`}
                          >
                            {item.enabled ? '启用' : '停用'}
                          </button>
                          <button
                            onClick={() => {
                              if (!window.confirm('确认删除这条文案修改吗？')) return;
                              removeTextOverride(item.id);
                              refresh();
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold text-slate-500">原文案</span>
                          <input readOnly value={item.original} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 outline-none" />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold text-slate-500">新文案</span>
                          <input
                            value={item.replacement}
                            onChange={(event) => updateReplacement(item.id, event.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-brand"
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
