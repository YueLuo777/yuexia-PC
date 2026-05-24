import { ChevronDown, ChevronRight, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import { readPromptSnapshot } from '@/features/prompts/hooks/usePrompts';
import {
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { Volume } from '@/features/workbench/model/workbenchTypes';

interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
}

interface RoleContent {
  type: string;
  personality: string;
  background: string;
  status: string;
}

const roleTypes = ['男女主', '正派配角', '重要反派', '反派配角', '龙套', '未分类'];
const ROLE_TAB = '角色';
const SETTING_TAB = '设定';
const SETTING_LIBRARY_TABS = new Set([ROLE_TAB, SETTING_TAB, '大纲', '细纲']);

function normalizeTabName(tab: string) {
  if (tab === '角色库') return ROLE_TAB;
  if (tab === '设定库') return SETTING_TAB;
  return tab;
}

function normalizeEntries(entries: WorkbenchLibraryEntry[]) {
  return entries.map((entry) => ({ ...entry, tab: normalizeTabName(entry.tab) }));
}

function readNormalizedEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(storageKey));
}

function parseRoleContent(content: string): RoleContent {
  try {
    const parsed = JSON.parse(content) as Partial<RoleContent>;
    return {
      type: parsed.type || '未分类',
      personality: parsed.personality || '',
      background: parsed.background || '',
      status: parsed.status || '',
    };
  } catch {
    return {
      type: '未分类',
      personality: '',
      background: content || '',
      status: '',
    };
  }
}

function stringifyRoleContent(value: RoleContent) {
  return JSON.stringify(value);
}

export function WorkbenchLibraryPanel({ storageKey, tabs, emptyText, volumes = [] }: WorkbenchLibraryPanelProps) {
  const normalizedTabs = useMemo(() => tabs.map(normalizeTabName), [tabs]);
  const [entries, setEntries] = useState<WorkbenchLibraryEntry[]>(() => readNormalizedEntries(storageKey));
  const [activeTab, setActiveTab] = useState(normalizedTabs[0] ?? '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [roleTypeDraft, setRoleTypeDraft] = useState('');
  const [libraryTypeDraft, setLibraryTypeDraft] = useState('');
  const [libraryTitleDraft, setLibraryTitleDraft] = useState('');
  const [outlineStart, setOutlineStart] = useState('1');
  const [outlineEnd, setOutlineEnd] = useState('50');
  const [selectedOutlineChapterId, setSelectedOutlineChapterId] = useState<number | null>(null);
  const [selectedOutlineVolumeId, setSelectedOutlineVolumeId] = useState<number | null>(null);
  const [outlineSelectionType, setOutlineSelectionType] = useState<'chapter' | 'volume'>('chapter');
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() => new Set());
  const [expandedRoleTypes, setExpandedRoleTypes] = useState<Set<string>>(() => new Set(['未分类']));
  const [aiInput, setAiInput] = useState('');
  const [tabPortalTarget, setTabPortalTarget] = useState<HTMLElement | null>(null);
  const outlinePreviewRefs = useRef<Record<number, HTMLElement | null>>({});
  const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);
  const prompts = useMemo(() => readPromptSnapshot().prompts, []);

  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;

  useEffect(() => {
    setEntries(readNormalizedEntries(storageKey));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey) return;
      setEntries(readNormalizedEntries(storageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncStorageEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncStorageEntries);
    };
  }, [storageKey]);

  useEffect(() => {
    if (normalizedTabs.includes(activeTab)) return;
    setActiveTab(normalizedTabs[0] ?? '');
  }, [activeTab, normalizedTabs]);

  useEffect(() => {
    if (!tabs.includes('章节概要') || !tabs.includes('卷概要')) return;
    setExpandedOutlineVolumeIds((prev) => {
      if (prev.size > 0 || volumes.length === 0) return prev;
      return new Set(volumes.map((volume) => volume.id));
    });
  }, [tabs, volumes]);

  useEffect(() => {
    setSelectedId(null);
  }, [activeTab]);

  useEffect(() => {
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => next.add(volume.id));
      return next;
    });
  }, [volumes]);

  useEffect(() => {
    const updateTarget = () => setTabPortalTarget(document.getElementById('workbench-modal-header-extra'));
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persist = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next);
    setEntries(normalized);
    writeWorkbenchLibraryEntries(storageKey, normalized);
  };

  const addEntry = () => {
    const entry = createWorkbenchLibraryEntry(activeTab, `新建${activeTab}`);
    persist([entry, ...entries]);
    setSelectedId(entry.id);
  };

  const addEntryToTab = (tab: string, title: string) => {
    const entry = createWorkbenchLibraryEntry(tab, title);
    persist([entry, ...entries]);
    setActiveTab(tab);
    setSelectedId(entry.id);
  };

  const addRole = (type = '未分类') => {
    const entry = createWorkbenchLibraryEntry(ROLE_TAB, '新建角色');
    const roleEntry = {
      ...entry,
      content: stringifyRoleContent({ type, personality: '', background: '', status: '' }),
    };
    persist([roleEntry, ...entries]);
    setActiveTab(ROLE_TAB);
    setSelectedId(roleEntry.id);
    setExpandedRoleTypes((prev) => new Set(prev).add(type));
  };

  const updateEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    persist(entries.map((entry) => (
      entry.id === id
        ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') }
        : entry
    )));
  };

  const updateRole = (updates: Partial<RoleContent>) => {
    if (!selectedEntry || !selectedRole) return;
    updateEntry(selectedEntry.id, {
      content: stringifyRoleContent({ ...selectedRole, ...updates }),
    });
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((entry) => entry.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [entries]);
  const searchedRoles = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase();
    if (!keyword) return roleEntries;
    return roleEntries.filter((entry) => entry.title.toLowerCase().includes(keyword));
  }, [roleEntries, roleSearch]);

  const groupedRoles = useMemo(() => roleTypes.map((type) => ({
    type,
    entries: searchedRoles.filter((entry) => parseRoleContent(entry.content).type === type),
  })), [searchedRoles]);

  const topTabs = (
    <div className="flex shrink-0 items-center gap-2">
      {normalizedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === tab ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderTopTabs = () => (
    tabPortalTarget
      ? createPortal(topTabs, tabPortalTarget)
      : <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">{topTabs}</div>
  );

  if (activeTab === ROLE_TAB) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        {renderTopTabs()}
        <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_330px] overflow-hidden bg-white">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={roleTypeDraft}
                onChange={(event) => setRoleTypeDraft(event.target.value)}
                placeholder="类型名字"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                onClick={() => roleTypeDraft.trim() && addRole(roleTypeDraft.trim())}
                className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
              >
                新建类型
              </button>
              <input
                value={roleSearch}
                onChange={(event) => setRoleSearch(event.target.value)}
                placeholder="角色名字"
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button onClick={() => addRole('未分类')} className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark">
                新建角色
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
              {groupedRoles.map((group) => {
                const expanded = expandedRoleTypes.has(group.type);
                return (
                  <div key={group.type}>
                    <button
                      onClick={() => {
                        setExpandedRoleTypes((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.type)) next.delete(group.type);
                          else next.add(group.type);
                          return next;
                        });
                      }}
                      className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left font-bold text-gray-800 hover:bg-gray-100"
                    >
                      <span className="flex-1">{group.type}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{group.entries.length}</span>
                      {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {expanded && (
                      <div className="mt-1 space-y-1">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            onClick={() => setSelectedId(entry.id)}
                            className={`w-full rounded-xl border px-4 py-2 text-left text-sm transition-colors ${
                              selectedEntry?.id === entry.id
                                ? 'border-brand bg-brand-light text-brand-dark'
                                : 'border-transparent text-gray-600 hover:bg-white'
                            }`}
                          >
                            {entry.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={roleSearch}
                onChange={(event) => setRoleSearch(event.target.value)}
                placeholder="搜索角色..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">搜索</button>
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto bg-white p-6">
            {selectedEntry && selectedRole ? (
              <div className="space-y-5">
                <div className="grid grid-cols-[80px_1fr_80px_220px] items-center gap-4">
                  <label className="text-sm font-bold text-gray-700">角色名</label>
                  <input
                    value={selectedEntry.title}
                    onChange={(event) => updateEntry(selectedEntry.id, { title: event.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                  />
                  <label className="text-sm font-bold text-gray-700">类型</label>
                  <select
                    value={selectedRole.type}
                    onChange={(event) => updateRole({ type: event.target.value })}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                  >
                    {roleTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-700">性格</span>
                  <input
                    value={selectedRole.personality}
                    onChange={(event) => updateRole({ personality: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">角色背景</span>
                    <span className="text-xs text-gray-400">{selectedRole.background.length} 字</span>
                  </div>
                  <textarea
                    value={selectedRole.background}
                    onChange={(event) => updateRole({ background: event.target.value })}
                    className="editor-scrollbar h-[260px] w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">角色状态</span>
                    <span className="text-xs text-gray-400">{selectedRole.status.length} 字</span>
                  </div>
                  <textarea
                    value={selectedRole.status}
                    onChange={(event) => updateRole({ status: event.target.value })}
                    placeholder="用于记录当前阶段的角色状态、心境、立场与关系变化"
                    className="editor-scrollbar h-[220px] w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
                  />
                </label>

                <div className="flex items-center justify-between">
                  <button className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white">历史版本</button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">最近保存 {selectedEntry.updatedAt}</span>
                    <button className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white">一键更新状态</button>
                    <button onClick={() => deleteEntry(selectedEntry.id)} className="rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white">删除</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                点击左侧“新建角色”开始创建角色
              </div>
            )}
          </main>

          <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 p-4">
            <h3 className="text-base font-bold text-gray-900">角色生成</h3>
            <div className="mt-4 space-y-3">
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>模型</span>
                <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand">
                  {models.length === 0 ? <option>暂无可用模型</option> : models.map((model) => <option key={model.id}>{model.name}</option>)}
                </select>
              </label>
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>智能体</span>
                <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand">
                  <option>设定大师</option>
                  {prompts.map((prompt) => <option key={prompt.id}>{prompt.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex-1 rounded-2xl border border-gray-200 bg-white" />
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="输入对话指令..."
                className="h-14 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">
                  <Send className="h-3.5 w-3.5" />
                  发送
                </button>
                <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">暂停</button>
                <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-400">复制</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)) && SETTING_LIBRARY_TABS.has(activeTab)) {
    const currentEntries = entries.filter((entry) => entry.tab === activeTab);
    const currentSelectedEntry = currentEntries.find((entry) => entry.id === selectedId) ?? currentEntries[0] ?? null;
    const panelTitle = activeTab === SETTING_TAB ? '设定生成' : `${activeTab}生成`;
    const agentName = activeTab === SETTING_TAB ? '设定大师' : activeTab === '大纲' ? '大纲助手' : '细纲助手';

    return (
      <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(360px,1fr)_350px] overflow-hidden bg-white">
        <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-[1fr_64px] gap-2">
            <input
              value={libraryTypeDraft}
              onChange={(event) => setLibraryTypeDraft(event.target.value)}
              placeholder="新增类型"
              className="h-11 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand"
            />
            <button
              onClick={() => setLibraryTypeDraft('')}
              className="h-11 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              创建
            </button>
            <input
              value={libraryTitleDraft}
              onChange={(event) => setLibraryTitleDraft(event.target.value)}
              placeholder={`新增${activeTab}`}
              className="h-11 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand"
            />
            <button
              onClick={() => {
                const title = libraryTitleDraft.trim() || `新建${activeTab}`;
                addEntryToTab(activeTab, title);
                setLibraryTitleDraft('');
              }}
              className="h-11 rounded-lg bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
            >
              创建
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button className="flex w-full items-center gap-2 bg-gray-100 px-4 py-3 text-left">
              <span className="min-w-0 flex-1 truncate text-base font-bold text-gray-900">未分类</span>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-500">{currentEntries.length}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <div className="max-h-[calc(78vh-230px)] overflow-y-auto p-2">
              {currentEntries.length === 0 ? (
                <p className="px-3 py-5 text-xs text-gray-400">该类型下暂无{activeTab}</p>
              ) : (
                <div className="space-y-1">
                  {currentEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedId(entry.id)}
                      className={`group w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        currentSelectedEntry?.id === entry.id ? 'border-brand bg-brand-light text-brand-dark' : 'border-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{entry.title}</span>
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                          className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{entry.content || `暂无${activeTab}内容`}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
          {currentSelectedEntry ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <input
                value={currentSelectedEntry.title}
                onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                className="mb-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
              />
              <textarea
                value={currentSelectedEntry.content}
                onChange={(event) => updateEntry(currentSelectedEntry.id, { content: event.target.value })}
                placeholder={`填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50/40 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand focus:bg-white"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">请选择左侧记录</div>
          )}
        </main>

        <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50">
          <div className="border-b border-gray-100 p-4">
            <h3 className="text-base font-bold text-gray-900">{panelTitle}</h3>
            <div className="mt-4 space-y-3">
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>模型</span>
                <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand">
                  {models.length === 0 ? <option>暂无可用模型</option> : models.map((model) => <option key={model.id}>{model.name}</option>)}
                </select>
              </label>
              <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
                <span>智能体</span>
                <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand">
                  <option>{agentName}</option>
                  {prompts.map((prompt) => <option key={prompt.id}>{prompt.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <div className="h-full rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-400">
              可以在这里生成{activeTab}，并继续通过对话细化。
            </div>
          </div>
          <div className="border-t border-gray-100 p-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="输入对话指令..."
                className="h-12 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white">发送</button>
                <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">暂停</button>
              </div>
              <button
                onClick={() => {
                  if (!currentSelectedEntry) {
                    addEntryToTab(activeTab, `新建${activeTab}`);
                    return;
                  }
                  updateEntry(currentSelectedEntry.id, { title: currentSelectedEntry.title || `新建${activeTab}` });
                }}
                className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
              >
                保存为新{activeTab}
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  if (tabs.includes('章节概要') && tabs.includes('卷概要')) {
    const chapterEntries = entries.filter((entry) => entry.tab === '章节概要');
    const volumeEntries = entries.filter((entry) => entry.tab === '卷概要');
    const outlineChapters = volumes.flatMap((volume) => (
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .map((chapter) => ({ volume, chapter }))
    ));
    const selectedOutlineChapter = outlineChapters.find((item) => item.chapter.id === selectedOutlineChapterId) ?? outlineChapters[0] ?? null;
    const selectedOutlineVolume = volumes.find((volume) => volume.id === selectedOutlineVolumeId) ?? volumes[0] ?? null;
    const getChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章概要`;
    const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
    const getChapterSummaryEntry = (serialNumber: number) => (
      chapterEntries.find((entry) => entry.title === getChapterSummaryTitle(serialNumber))
    );
    const getVolumeSummaryEntry = (volumeName: string) => (
      volumeEntries.find((entry) => entry.title === getVolumeSummaryTitle(volumeName))
    );
    const selectedOutlineEntry = selectedOutlineChapter
      ? getChapterSummaryEntry(selectedOutlineChapter.chapter.serialNumber)
      : null;
    const selectedVolumeEntry = selectedOutlineVolume
      ? getVolumeSummaryEntry(selectedOutlineVolume.name)
      : null;
    const updateChapterSummary = (serialNumber: number, content: string) => {
      const title = getChapterSummaryTitle(serialNumber);
      const existing = getChapterSummaryEntry(serialNumber);
      if (existing) {
        updateEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry('章节概要', title),
        content,
      };
      persist([entry, ...entries]);
      setSelectedId(entry.id);
    };
    const updateVolumeSummary = (volumeName: string, content: string) => {
      const title = getVolumeSummaryTitle(volumeName);
      const existing = getVolumeSummaryEntry(volumeName);
      if (existing) {
        updateEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry('卷概要', title),
        content,
      };
      persist([entry, ...entries]);
      setSelectedId(entry.id);
    };
    const selectOutlineChapter = (chapterId: number, serialNumber: number) => {
      setOutlineSelectionType('chapter');
      setSelectedOutlineChapterId(chapterId);
      const entry = getChapterSummaryEntry(serialNumber);
      setSelectedId(entry?.id ?? null);
      window.setTimeout(() => {
        outlinePreviewRefs.current[chapterId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    };
    const selectOutlineVolume = (volume: Volume) => {
      setOutlineSelectionType('volume');
      setSelectedOutlineVolumeId(volume.id);
      const entry = getVolumeSummaryEntry(volume.name);
      setSelectedId(entry?.id ?? null);
    };
    const toggleOutlineVolume = (volumeId: number) => {
      setExpandedOutlineVolumeIds((prev) => {
        const next = new Set(prev);
        if (next.has(volumeId)) next.delete(volumeId);
        else next.add(volumeId);
        return next;
      });
    };

    return (
      <div className="grid min-h-0 flex-1 grid-cols-[430px_minmax(0,1fr)_350px] overflow-hidden bg-white">
        <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 p-4">
          <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-base font-bold text-gray-900">章节概要</h3>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              {volumes.length === 0 ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无章节</p>
              ) : (
                <div className="space-y-3">
                  {volumes.map((volume) => (
                    <div key={volume.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleOutlineVolume(volume.id)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          toggleOutlineVolume(volume.id);
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-white transition-colors hover:brightness-95"
                        style={{ backgroundColor: '#08B3D9' }}
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-white"
                          title={expandedOutlineVolumeIds.has(volume.id) ? '收起' : '展开'}
                        >
                          {expandedOutlineVolumeIds.has(volume.id) ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{volume.name}</span>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            selectOutlineVolume(volume);
                          }}
                          className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                            outlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id
                              ? 'border-white bg-white text-[#08B3D9]'
                              : 'border-white/70 bg-white/15 text-white hover:bg-white hover:text-[#08B3D9]'
                          }`}
                        >
                          卷概要
                        </button>
                      </div>
                      {expandedOutlineVolumeIds.has(volume.id) && (
                        <div className="mt-1 grid grid-cols-10 gap-2 px-1.5 py-1.5">
                          {[...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber).map((chapter) => {
                            const selected = outlineSelectionType === 'chapter' && selectedOutlineChapterId === chapter.id;
                            const hasSummary = Boolean(getChapterSummaryEntry(chapter.serialNumber)?.content.trim());
                            return (
                              <button
                                key={chapter.id}
                                onClick={() => selectOutlineChapter(chapter.id, chapter.serialNumber)}
                                className={`relative h-9 rounded-lg border text-sm font-bold transition-colors ${
                                  hasSummary
                                    ? 'border-[#08B3D9] bg-[#08B3D9] text-white hover:border-[#067B96] hover:bg-[#067B96]'
                                    : 'border-slate-200 text-slate-500 hover:border-[#08B3D9]'
                                } ${selected ? 'ring-2 ring-[#08B3D9] ring-offset-2' : ''}`}
                                style={hasSummary ? undefined : {
                                  backgroundImage: 'repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 5px, #e2e8f0 5px, #e2e8f0 6px)',
                                }}
                              >
                                {chapter.serialNumber}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>

        <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white p-4">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">概要预览区</h3>
            </div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto">
            {outlineChapters.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">暂无章节可预览</div>
            ) : outlineSelectionType === 'volume' && selectedOutlineVolume ? (
              <section className="rounded-xl border border-brand bg-brand-light/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{selectedOutlineVolume.name}概要</h4>
                  <span className="shrink-0 text-xs text-gray-400">{selectedOutlineVolume.chapters.length}章</span>
                </div>
                <textarea
                  value={selectedVolumeEntry?.content ?? ''}
                  onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
                  placeholder="这一卷的概要会显示在这里，内容是该卷下所有章节内容的总结。"
                  className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                />
              </section>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {outlineChapters.map(({ volume, chapter }) => {
                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                  const selected = outlineSelectionType === 'chapter' && selectedOutlineChapter?.chapter.id === chapter.id;
                  return (
                    <section
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className={`rounded-xl border bg-gray-50/40 p-4 transition-colors ${
                        selected ? 'border-brand bg-brand-light/40' : 'border-gray-200'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">第{chapter.serialNumber}章概要</h4>
                        <span className="shrink-0 truncate text-xs text-gray-400">{volume.name}</span>
                      </div>
                      <textarea
                        value={entry?.content ?? ''}
                        onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                        onFocus={() => selectOutlineChapter(chapter.id, chapter.serialNumber)}
                        placeholder="该章概要会显示在这里，可由 AI 根据章节内容生成。"
                        className="editor-scrollbar h-36 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                      />
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <aside className="min-w-0 flex min-h-0 flex-col bg-gray-50 p-4">
          <h3 className="text-base font-bold text-gray-900">概要智能体</h3>
          <div className="mt-4 space-y-3">
            <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
              <span>模型</span>
              <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-700 outline-none focus:border-brand">
                {models.length === 0 ? <option>暂无可用模型</option> : models.map((model) => <option key={model.id}>{model.name}</option>)}
              </select>
            </label>
            <label className="grid grid-cols-[48px_1fr] items-center gap-2 text-sm text-gray-500">
              <span>智能体</span>
              <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand">
                <option>概要智能体</option>
                {prompts.map((prompt) => <option key={prompt.id}>{prompt.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex-1 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-400">
            {outlineSelectionType === 'volume' && selectedOutlineVolume ? (
              <div>
                <p className="font-bold text-gray-700">当前卷</p>
                <p className="mt-2">{selectedOutlineVolume.name}</p>
                <p className="mt-4 whitespace-pre-wrap text-gray-500">
                  {selectedVolumeEntry?.content || '暂无卷概要，可在预览区填写或由 AI 生成。'}
                </p>
              </div>
            ) : selectedOutlineChapter ? (
              <div>
                <p className="font-bold text-gray-700">当前章节</p>
                <p className="mt-2">第{selectedOutlineChapter.chapter.serialNumber}章</p>
                <p className="mt-4 whitespace-pre-wrap text-gray-500">
                  {selectedOutlineEntry?.content || '暂无概要，可在预览区填写或由 AI 生成。'}
                </p>
              </div>
            ) : (
              '请选择左侧章节后生成概要。'
            )}
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <textarea
              value={aiInput}
              onChange={(event) => setAiInput(event.target.value)}
              placeholder="输入对话指令..."
              className="h-12 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">复制内容</button>
              <button
                onClick={() => {
                  if (outlineSelectionType === 'volume' && selectedOutlineVolume) {
                    updateVolumeSummary(selectedOutlineVolume.name, '');
                    return;
                  }
                  if (selectedOutlineChapter) {
                    updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, '');
                  }
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100"
              >
                清空概要
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white">发送</button>
              <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">暂停</button>
            </div>
          </div>
        </aside>
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {renderTopTabs()}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] overflow-hidden bg-white">
        <aside className="flex min-h-0 flex-col border-r border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-bold text-gray-700">{activeTab}</span>
            <button onClick={addEntry} className="rounded-md p-1 text-brand hover:bg-brand-light" title="新增">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {visibleEntries.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs leading-5 text-gray-400">{emptyText}</p>
            ) : (
              <div className="space-y-1">
                {visibleEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`group w-full rounded-lg border px-2 py-2 text-left transition-colors ${
                      selectedEntry?.id === entry.id ? 'border-brand bg-brand-light/60' : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="truncate text-xs font-medium text-gray-800">{entry.title}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{entry.updatedAt}</span>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col p-4">
          {selectedEntry ? (
            <>
              <input
                value={selectedEntry.title}
                onChange={(event) => updateEntry(selectedEntry.id, { title: event.target.value })}
                className="mb-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
              />
              <textarea
                value={selectedEntry.content}
                onChange={(event) => updateEntry(selectedEntry.id, { content: event.target.value })}
                placeholder={`填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              点击左侧加号新增内容
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
