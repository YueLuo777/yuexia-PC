import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { DEFAULT_WORKBENCH_ROLE_TYPES, isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';
import {
  getWorkbenchSettingTreeSelectedPathHeight,
  useWorkbenchSettingTreeStickyNavigation,
} from '@/features/workbench/hooks/useWorkbenchSettingTreeStickyNavigation';

import type { LibraryEntryDragState } from './workbenchLibraryDrag';
import { isLockedDefaultSettingEntry } from './workbenchLibraryDataState';
import { ROLE_TAB, SETTING_TAB, UNCATEGORIZED_TYPE } from './workbenchLibraryTabs';
import { parseRoleContent } from './workbenchRoleContent';
import { parseSettingContent } from './workbenchStructuredSettings';
import {
  CHAPTER_NAV_SELECTED_BORDER_CLASS,
  CHAPTER_NAV_SELECTED_LINE_CLASS,
} from './chapterNavigationStyles';

type SettingTreeDomain = {
  id: string;
  label: string;
  settingDomain: string | null;
};

type SettingTreeGroup = {
  type: string;
  label: string;
  entries: WorkbenchLibraryEntry[];
};

type WorkbenchSettingTreeSidebarProps = {
  locked?: boolean;
  domains: SettingTreeDomain[];
  activeDomainId: string;
  settingEntries: WorkbenchLibraryEntry[];
  roleEntries: WorkbenchLibraryEntry[];
  settingTypeOptions: string[];
  roleTypeOptions: string[];
  selectedEntryId?: string | null;
  expandedSettingTypes: Set<string>;
  expandedRoleTypes: Set<string>;
  setExpandedSettingTypes: (value: SetStateAction<Set<string>>) => void;
  setExpandedRoleTypes: (value: SetStateAction<Set<string>>) => void;
  getSettingTypeWorkspaceDomain: (type: string) => string | null;
  onSelectDomain: (id: string) => void;
  onSelectEntry: (tab: string, id: string) => void;
  onOpenCategoryMenu: (event: MouseEvent<HTMLButtonElement>, kind: 'role' | 'setting', type: string) => void;
  onOpenEntryMenu: (event: MouseEvent<HTMLElement>, entry: WorkbenchLibraryEntry) => void;
  onOpenCreateDialog: (mode: 'category' | 'setting') => void;
  onScroll: () => void;
  scrollActive: boolean;
  libraryDropTarget: { tab: string; type: string } | null;
  draggingLibraryEntry: LibraryEntryDragState;
  libraryPointerSuppressClickRef: MutableRefObject<boolean>;
  getPreviewedGroupEntries: (entries: WorkbenchLibraryEntry[], tab: string, type: string) => WorkbenchLibraryEntry[];
  onCategoryDragOver: (event: DragEvent<HTMLElement>, tab: string, type: string, previewEnd?: boolean) => void;
  onCategoryDragLeave: (event: DragEvent<HTMLElement>) => void;
  onCategoryDrop: (event: DragEvent<HTMLElement>, tab: string, type: string) => void;
  onEntryDragStart: (event: DragEvent<HTMLElement>, entry: WorkbenchLibraryEntry, type: string) => void;
  onEntryDragOver: (event: DragEvent<HTMLElement>, entry: WorkbenchLibraryEntry, type: string, previewIndex?: number) => void;
  onEntryDrop: (event: DragEvent<HTMLElement>, entry: WorkbenchLibraryEntry, type: string, previewIndex?: number) => void;
  onEntryDragEnd: () => void;
  onEntryPointerDown: (event: PointerEvent<HTMLElement>, entry: WorkbenchLibraryEntry, type: string) => void;
  onEntryPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onEntryPointerUp: (event: PointerEvent<HTMLElement>) => void;
  footerActions?: ReactNode;
};

type TreeDomain = SettingTreeDomain & {
  roleDomain: boolean;
  groups: SettingTreeGroup[];
};

const hasPendingStatus = (entry: WorkbenchLibraryEntry, role: boolean) =>
  role
    ? (parseRoleContent(entry.content).pendingStatusUpdates?.length ?? 0) > 0
    : (parseSettingContent(entry.content).pendingStatusUpdates?.length ?? 0) > 0;

const DOMAIN_ORDER: Record<string, number> = {
  work: 1,
  'setting:plot': 2,
  character: 3,
  'setting:location': 4,
  'setting:faction': 5,
  'setting:item': 6,
  'setting:foreshadow': 7,
  'setting:monster': 8,
};
const LOCKED_DEFAULT_SETTING_TOOLTIP = '内置设定，无法删除';

export function WorkbenchSettingTreeSidebar({
  locked = false,
  domains,
  activeDomainId,
  settingEntries,
  roleEntries,
  settingTypeOptions,
  roleTypeOptions,
  selectedEntryId,
  expandedSettingTypes,
  expandedRoleTypes,
  setExpandedSettingTypes,
  setExpandedRoleTypes,
  getSettingTypeWorkspaceDomain,
  onSelectDomain,
  onSelectEntry,
  onOpenCategoryMenu,
  onOpenEntryMenu,
  onOpenCreateDialog,
  onScroll,
  scrollActive,
  libraryDropTarget,
  draggingLibraryEntry,
  libraryPointerSuppressClickRef,
  getPreviewedGroupEntries,
  onCategoryDragOver,
  onCategoryDragLeave,
  onCategoryDrop,
  onEntryDragStart,
  onEntryDragOver,
  onEntryDrop,
  onEntryDragEnd,
  onEntryPointerDown,
  onEntryPointerMove,
  onEntryPointerUp,
  footerActions,
}: WorkbenchSettingTreeSidebarProps) {
  const [query, setQuery] = useState('');
  const [expandedDomainIds, setExpandedDomainIds] = useState(() => new Set([activeDomainId]));
  const userToggledDomainRef = useRef<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  useEffect(() => {
    if (userToggledDomainRef.current === activeDomainId) {
      userToggledDomainRef.current = null;
      return;
    }
    setExpandedDomainIds((current) => new Set(current).add(activeDomainId));
  }, [activeDomainId]);

  const tree = useMemo<TreeDomain[]>(
    () =>
      domains.map((domain) => {
        const roleDomain = domain.id === 'character';
        const types = roleDomain
          ? roleTypeOptions
          : settingTypeOptions.filter((type) => {
              const typeDomain = getSettingTypeWorkspaceDomain(type);
              return domain.settingDomain ? typeDomain === domain.settingDomain : !typeDomain;
            });
        const entries = roleDomain ? roleEntries : settingEntries;
        let groups: SettingTreeGroup[] = types.map((type) => ({
          type,
          label: type,
          entries: entries.filter((entry) =>
            roleDomain ? parseRoleContent(entry.content).type === type : parseSettingContent(entry.content).type === type,
          ),
        }));
        if (roleDomain) {
          const groupsByType = new Map(groups.map((group) => [group.type, group]));
          const neutralType = '中立角色';
          const usedTypes = new Set<string>();
          const makeRoleGroup = (label: string, groupedTypes: string[], fallbackType: string) => {
            const matched = groupedTypes.map((type) => groupsByType.get(type)).filter(Boolean) as SettingTreeGroup[];
            groupedTypes.forEach((type) => usedTypes.add(type));
            return { type: matched[0]?.type ?? fallbackType, label, entries: matched.flatMap((group) => group.entries) };
          };
          const defaults = DEFAULT_WORKBENCH_ROLE_TYPES;
          groups = [
            makeRoleGroup('男女主', defaults.slice(0, 2), defaults[0]),
            makeRoleGroup('重要配角', [defaults[2], defaults[3]], defaults[2]),
            makeRoleGroup('反派', [defaults[4], defaults[5]], defaults[4]),
            makeRoleGroup('其他角色', [neutralType, defaults[6]], defaults[6]),
            ...groups.filter((group) => !usedTypes.has(group.type)),
          ];
        }
        return { ...domain, roleDomain, groups };
      }),
    [domains, getSettingTypeWorkspaceDomain, roleEntries, roleTypeOptions, settingEntries, settingTypeOptions],
  );
  const orderedTree = useMemo(
    () =>
      [...tree].sort((left, right) => {
        return (DOMAIN_ORDER[left.id] ?? 99) - (DOMAIN_ORDER[right.id] ?? 99);
      }),
    [tree],
  );
  const allDomainsCollapsed =
    !normalizedQuery && orderedTree.every((domain) => !expandedDomainIds.has(domain.id));
  const hasExpandedSettingItems =
    Boolean(normalizedQuery) ||
    orderedTree.some(
      (domain) =>
        expandedDomainIds.has(domain.id) &&
        domain.groups.some((group) =>
          (domain.roleDomain ? expandedRoleTypes : expandedSettingTypes).has(group.type),
        ),
    );
  const navigationRef = useWorkbenchSettingTreeStickyNavigation(
    hasExpandedSettingItems,
    allDomainsCollapsed,
  );

  const toggleDomain = (id: string) => {
    if (id !== activeDomainId) userToggledDomainRef.current = id;
    onSelectDomain(id);
    setExpandedDomainIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (roleDomain: boolean, type: string) => {
    const setter = roleDomain ? setExpandedRoleTypes : setExpandedSettingTypes;
    setter((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const renderDomainGroups = (domain: TreeDomain, filteredGroups: SettingTreeGroup[], domainMatches: boolean) => {
    const selectedGroupIndex = filteredGroups.findIndex((group) =>
      group.entries.some((entry) => entry.id === selectedEntryId),
    );
    const domainSelected = activeDomainId === domain.id && selectedGroupIndex >= 0;
    return (
      <div className="relative space-y-1 pl-3 before:absolute before:bottom-2 before:left-1 before:top-0 before:w-px before:bg-[#7DCDDC] before:content-['']">
        {filteredGroups.length === 0 ? <p className="px-1 py-2 text-xs font-bold text-slate-400">暂无分组</p> : null}
        {filteredGroups.map((group, groupIndex) => {
        const groupOpen = Boolean(normalizedQuery) || (domain.roleDomain ? expandedRoleTypes : expandedSettingTypes).has(group.type);
        const groupHasUpdate = group.entries.some((entry) => hasPendingStatus(entry, domain.roleDomain));
        const tab = domain.roleDomain ? ROLE_TAB : SETTING_TAB;
        const previewEntries = getPreviewedGroupEntries(group.entries, tab, group.type);
        const visibleEntries =
          normalizedQuery && !domainMatches && !group.label.toLocaleLowerCase().includes(normalizedQuery)
            ? previewEntries.filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery))
            : previewEntries;
        const isDropTarget = libraryDropTarget?.tab === tab && libraryDropTarget.type === group.type;
        const groupSelected = domainSelected && visibleEntries.some((entry) => entry.id === selectedEntryId);
        const selectedItemIndex = visibleEntries.findIndex((entry) => entry.id === selectedEntryId);
        return (
          <div
            key={`${domain.id}:${group.type}`}
            data-setting-tree-group={`${domain.id}:${group.type}`}
            data-library-group-tab={tab}
            data-library-group-type={group.type}
            onDragOver={(event) => onCategoryDragOver(event, tab, group.type, group.entries.length === 0)}
            onDragLeave={onCategoryDragLeave}
            onDrop={(event) => onCategoryDrop(event, tab, group.type)}
            className={`relative ${isDropTarget ? 'rounded-lg ring-2 ring-brand/40' : ''}`}
          >
            {domainSelected && groupIndex <= selectedGroupIndex ? (
              <span
                aria-hidden="true"
                data-setting-tree-domain-selected-path="true"
                className={`pointer-events-none absolute -left-2 z-[1] w-px ${CHAPTER_NAV_SELECTED_LINE_CLASS} ${
                  groupSelected ? 'top-[-4px] h-7' : 'bottom-[-4px] top-[-4px]'
                }`}
              />
            ) : null}
            <span
              aria-hidden="true"
              data-setting-tree-group-connector="true"
              className={`pointer-events-none absolute -left-2 top-6 z-[1] h-px w-2 ${
                groupSelected ? CHAPTER_NAV_SELECTED_LINE_CLASS : 'bg-[#7DCDDC]'
              }`}
            />
            <div data-sticky-level="2" className="sticky top-10 z-20 bg-[#F7F9FB] py-1">
              <button
                type="button"
                aria-expanded={groupOpen}
                aria-label={`${group.label}${visibleEntries.length}`}
                onClick={() => {
                  onSelectDomain(domain.id);
                  toggleGroup(domain.roleDomain, group.type);
                }}
                onContextMenu={(event) => {
                  onSelectDomain(domain.id);
                  onOpenCategoryMenu(event, domain.roleDomain ? 'role' : 'setting', group.type);
                }}
                className="relative flex h-9 w-full items-center gap-2 rounded-lg border border-[#B7EAF3] bg-[#DDF5FA] px-2 text-left text-xs font-black text-[#155E75] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-[#D2F0F7]"
              >
                {groupOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#08AACE]" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                <span className="min-w-0 truncate">{group.label}</span>
                {groupHasUpdate ? <span className="rounded bg-[#FF8790] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">新</span> : null}
                <span className="flex-1" />
                <span className="text-[10px] text-slate-400">{visibleEntries.length}</span>
              </button>
            </div>
            {groupOpen ? (
              <div
                data-setting-tree-item-list="true"
                className="relative space-y-px pl-3 before:absolute before:bottom-[18px] before:left-0 before:top-[-4px] before:w-px before:bg-[#9ADFEA] before:content-['']"
              >
                {groupSelected && selectedItemIndex >= 0 ? (
                  <span
                    aria-hidden="true"
                    data-setting-tree-selected-path="true"
                    className={`pointer-events-none absolute left-0 top-[-4px] z-[1] w-px ${CHAPTER_NAV_SELECTED_LINE_CLASS}`}
                    style={{ height: getWorkbenchSettingTreeSelectedPathHeight(selectedItemIndex) }}
                  />
                ) : null}
                {visibleEntries.length === 0 ? (
                  <p className="px-3 py-2 text-xs font-bold text-slate-400">暂无{domain.roleDomain ? '角色' : '设定'}</p>
                ) : (
                  visibleEntries.map((entry, previewIndex) => {
                    const entryHasUpdate = hasPendingStatus(entry, domain.roleDomain);
                    const selected = activeDomainId === domain.id && selectedEntryId === entry.id;
                    const role = domain.roleDomain ? parseRoleContent(entry.content) : null;
                    const entryType = role ? role.type : group.type;
                    const lockedDefaultSetting = !domain.roleDomain && isLockedDefaultSettingEntry(entry);
                    const showMaleProtagonistBadge = role ? isMaleProtagonistRoleType(role.type) : false;
                    const entrySelectionClass = selected
                      ? `border-2 ${CHAPTER_NAV_SELECTED_BORDER_CLASS} bg-white text-slate-600`
                      : 'border-transparent bg-white/70 text-slate-600 hover:border-[#D9F3F8] hover:bg-white';
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        data-library-entry-id={entry.id}
                        data-library-entry-tab={tab}
                        data-library-entry-type={entryType}
                        data-library-entry-preview-index={previewIndex}
                        data-setting-tree-entry="true"
                        title={lockedDefaultSetting ? LOCKED_DEFAULT_SETTING_TOOLTIP : undefined}
                        onDragStart={(event) => onEntryDragStart(event, entry, entryType)}
                        onDragOver={(event) => onEntryDragOver(event, entry, entryType, previewIndex)}
                        onDrop={(event) => onEntryDrop(event, entry, entryType, previewIndex)}
                        onDragEnd={onEntryDragEnd}
                        onPointerDown={(event) => onEntryPointerDown(event, entry, entryType)}
                        onPointerMove={onEntryPointerMove}
                        onPointerUp={onEntryPointerUp}
                        onPointerCancel={onEntryPointerUp}
                        onContextMenu={(event) => onOpenEntryMenu(event, entry)}
                        onClick={(event) => {
                          if (libraryPointerSuppressClickRef.current) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }
                          onSelectDomain(domain.id);
                          onSelectEntry(tab, entry.id);
                        }}
                        className={`relative flex min-h-9 w-full items-center gap-1.5 rounded-md border px-3 py-2 text-left text-xs font-bold ${entrySelectionClass} ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                      >
                        <span
                          aria-hidden="true"
                          data-setting-tree-item-connector="true"
                          className={`pointer-events-none absolute left-[-12px] top-1/2 z-[1] h-px w-[11px] ${
                            selected ? CHAPTER_NAV_SELECTED_LINE_CLASS : 'bg-[#9ADFEA]'
                          }`}
                        />
                        <span className={showMaleProtagonistBadge ? 'w-[4em] shrink-0 truncate' : 'min-w-0 truncate'}>
                          {entry.title.trim() || (domain.roleDomain ? '暂无人物' : '暂无设定')}
                        </span>
                        {showMaleProtagonistBadge ? <span className="shrink-0 rounded-md border border-[#F6C453] bg-[#FFF4CC] px-1.5 py-0.5 text-[10px] font-black leading-none text-[#9A5B00]">男主</span> : null}
                        {entryHasUpdate ? <span className="ml-1.5 rounded border border-[#F05B67] px-1 py-0.5 text-[9px] font-black leading-none text-[#D93F4D]">新</span> : null}
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        );
        })}
      </div>
    );
  };

  return (
    <aside
      inert={locked ? true : undefined}
      aria-disabled={locked || undefined}
      data-setting-generation-locked={locked ? 'true' : undefined}
      className={`min-w-0 flex min-h-0 flex-col border-r border-slate-200 bg-[#F7F9FB] px-1 py-2 ${locked ? 'pointer-events-none' : ''}`}
      style={{ gridColumn: 1, gridRow: 1 }}
    >
      <label className="mx-1 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input aria-label="搜索设定资料" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资料..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
      </label>
      <nav ref={navigationRef} aria-label="设定资料树" onScroll={onScroll} className={`mt-3 xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-gutter:stable] ${scrollActive ? 'scrollbar-active' : ''}`}>
        {orderedTree.map((domain) => {
            const domainMatches = domain.label.toLocaleLowerCase().includes(normalizedQuery);
            const filteredGroups = domain.groups
              .map((group) => ({
                ...group,
                entries:
                  normalizedQuery && !domainMatches && !group.label.toLocaleLowerCase().includes(normalizedQuery)
                    ? group.entries.filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery))
                    : group.entries,
              }))
              .filter((group) => !normalizedQuery || domainMatches || group.label.toLocaleLowerCase().includes(normalizedQuery) || group.entries.length > 0);
            if (normalizedQuery && !domainMatches && filteredGroups.length === 0) return null;
            const domainOpen = Boolean(normalizedQuery) || expandedDomainIds.has(domain.id);
            const domainCount = domain.groups.reduce((count, group) => count + group.entries.length, 0);
            const domainHasUpdate = domain.groups.some((group) => group.entries.some((entry) => hasPendingStatus(entry, domain.roleDomain)));
            const fallbackType = domain.groups[0]?.type ?? UNCATEGORIZED_TYPE;
            const groups = domainOpen ? renderDomainGroups(domain, filteredGroups, domainMatches) : null;

            return (
              <section key={domain.id} data-setting-tree-domain={domain.id} className="relative pb-1">
                <div data-sticky-level="1" className="sticky top-0 z-30 bg-[#F7F9FB] pb-1">
                  <button
                    type="button"
                    aria-expanded={domainOpen}
                    aria-label={`${domain.label}${domainCount}`}
                    onClick={() => toggleDomain(domain.id)}
                    onContextMenu={(event) => {
                      onSelectDomain(domain.id);
                      onOpenCategoryMenu(event, domain.roleDomain ? 'role' : 'setting', fallbackType);
                    }}
                    className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#AEE7F1] bg-[#CDEFF6] px-2 text-left text-sm font-black text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors hover:bg-[#BFEAF3]"
                  >
                    {domainOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[#08AACE]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                    <span className="min-w-0 truncate">{domain.label}</span>
                    {domainHasUpdate ? <span className="rounded bg-[#F05B67] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">新</span> : null}
                    <span className="flex-1" />
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-400">{domainCount}</span>
                  </button>
                </div>
                {domainOpen ? groups : null}
              </section>
            );
          })}
        {hasExpandedSettingItems ? (
          <div
            aria-hidden="true"
            data-setting-tree-end-spacer="true"
            className="h-[var(--workbench-setting-tree-end-spacer-height)] shrink-0"
          />
        ) : null}
      </nav>
      <div className="mt-3 grid h-11 shrink-0 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-center border-r border-slate-200 bg-[#DFF7FC] px-2 text-sm font-black text-[#08AACE]">新建</div>
        <button type="button" onClick={() => onOpenCreateDialog('category')} className="border-r border-slate-200 px-2 text-sm font-black text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]">分组</button>
        <button type="button" onClick={() => onOpenCreateDialog('setting')} className="px-2 text-sm font-black text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]">{activeDomainId === 'character' ? '角色' : '设定'}</button>
      </div>
      {footerActions}
    </aside>
  );
}
