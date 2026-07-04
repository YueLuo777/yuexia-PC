import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { loadDefaultErrorLogEntries, type ErrorLogEntry } from '@/features/tests/model/errorLogEntries';



const STORAGE_KEY = 'xinyuexia_test_error_logs';


function readSavedEntries(defaultEntries: ErrorLogEntry[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEntries;
    const saved = JSON.parse(raw) as ErrorLogEntry[];
    const savedIds = new Set(saved.map((entry) => entry.id));
    return [...defaultEntries.filter((entry) => !savedIds.has(entry.id)), ...saved];
  } catch {
    return defaultEntries;
  }
}

function saveEntries(entries: ErrorLogEntry[], defaultEntryIds: Set<string>) {
  const customEntries = entries.filter((entry) => !defaultEntryIds.has(entry.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customEntries));
}

export function ErrorLogPage() {
  const [defaultEntries, setDefaultEntries] = useState<ErrorLogEntry[]>([]);
  const [entries, setEntries] = useState<ErrorLogEntry[]>([]);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    area: '',
    symptom: '',
    cause: '',
    solution: '',
    prevention: '',
    keywords: '',
  });
  const defaultEntryIds = useMemo(() => new Set(defaultEntries.map((entry) => entry.id)), [defaultEntries]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDefaults(true);
    loadDefaultErrorLogEntries()
      .then((loadedDefaults) => {
        if (cancelled) return;
        setDefaultEntries(loadedDefaults);
        setEntries(readSavedEntries(loadedDefaults));
      })
      .catch(() => {
        if (cancelled) return;
        setDefaultEntries([]);
        setEntries(readSavedEntries([]));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDefaults(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return entries;
    return entries.filter((entry) => (
      [
        entry.title,
        entry.area,
        entry.symptom,
        entry.cause,
        entry.solution,
        entry.prevention,
        entry.keywords.join(' '),
      ].join(' ').toLowerCase().includes(keyword)
    ));
  }, [entries, search]);

  const addEntry = () => {
    if (!draft.title.trim() || !draft.solution.trim()) return;
    const nextEntry: ErrorLogEntry = {
      id: `custom-${Date.now()}`,
      title: draft.title.trim(),
      area: draft.area.trim() || '未分类',
      symptom: draft.symptom.trim() || '未记录',
      cause: draft.cause.trim() || '待排查',
      solution: draft.solution.trim(),
      prevention: draft.prevention.trim() || '后续补充',
      keywords: draft.keywords.split(/[,\s，、]+/).map((item) => item.trim()).filter(Boolean),
      updatedAt: new Date().toLocaleDateString('zh-CN'),
    };
    setEntries((current) => {
      const next = [nextEntry, ...current];
      saveEntries(next, defaultEntryIds);
      return next;
    });
    setDraft({ title: '', area: '', symptom: '', cause: '', solution: '', prevention: '', keywords: '' });
  };

  const deleteEntry = (id: string) => {
    if (defaultEntryIds.has(id)) return;
    setEntries((current) => {
      const next = current.filter((entry) => entry.id !== id);
      saveEntries(next, defaultEntryIds);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
        <div>
          <div className="text-sm font-black text-[#08AACE]">Error Log</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">错误日志</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">记录软件里出现过的问题、原因和修复办法，后续遇到同类问题先从这里查。</p>
        </div>
        <div className="relative w-[320px] max-w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索问题、位置、关键词"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
          />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="editor-scrollbar min-h-0 overflow-y-auto pr-1">
          <div className="grid gap-4">
            {isLoadingDefaults && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm font-bold text-slate-400 shadow-sm">
                正在加载错误日志...
              </div>
            )}
            {!isLoadingDefaults && filteredEntries.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm font-bold text-slate-400 shadow-sm">
                暂无匹配的错误日志。
              </div>
            )}
            {filteredEntries.map((entry) => {
              const isDefault = defaultEntryIds.has(entry.id);
              return (
                <article key={entry.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#08AACE]" />
                        <h2 className="truncate text-lg font-black text-slate-950">{entry.title}</h2>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{entry.area}</span>
                        <span>{entry.updatedAt}</span>
                        {isDefault && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[#08AACE]">内置</span>}
                      </div>
                    </div>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
                        title="删除记录"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 p-5 text-sm leading-6">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-1 text-xs font-black text-slate-400">现象</div>
                      <p className="text-slate-700">{entry.symptom}</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl bg-amber-50 p-3">
                        <div className="mb-1 text-xs font-black text-amber-600">原因</div>
                        <p className="text-slate-700">{entry.cause}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <div className="mb-1 text-xs font-black text-emerald-600">解决办法</div>
                        <p className="text-slate-700">{entry.solution}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                      <div className="mb-1 text-xs font-black text-slate-400">以后避免</div>
                      <p className="text-slate-700">{entry.prevention}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="min-h-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#08AACE]" />
            <h2 className="text-base font-black text-slate-950">新增记录</h2>
          </div>
          <div className="mt-4 space-y-3">
            {([
              ['title', '问题标题'],
              ['area', '出现位置'],
              ['symptom', '现象'],
              ['cause', '原因'],
              ['solution', '解决办法'],
              ['prevention', '以后避免'],
              ['keywords', '关键词，用逗号分隔'],
            ] as const).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-black text-slate-400">{label}</span>
                {key === 'title' || key === 'area' || key === 'keywords' ? (
                  <input
                    value={draft[key]}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-[#08AACE] focus:bg-white"
                  />
                ) : (
                  <textarea
                    value={draft[key]}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                    className="editor-scrollbar h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none focus:border-[#08AACE] focus:bg-white"
                  />
                )}
              </label>
            ))}
            <button
              type="button"
              onClick={addEntry}
              disabled={!draft.title.trim() || !draft.solution.trim()}
              className="h-11 w-full rounded-xl bg-[#08AACE] text-sm font-black text-white hover:bg-[#0695B5] disabled:bg-slate-300"
            >
              保存到错误日志
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ErrorLogPage;
