import { ChevronDown, FileText, Folder } from 'lucide-react';
import type { ConceptKind, ConceptLibraryItem } from '../model/conceptLibraryTypes';
import { conceptTabs } from './ConceptLibraryParts';

export function ConceptLibraryDirectory({
  activeTab,
  activeItems,
  groups,
  selectedCategory,
  selectedItemId,
  onTabChange,
  onCategoryChange,
  onItemChange,
}: {
  activeTab: ConceptKind;
  activeItems: ConceptLibraryItem[];
  groups: Array<{ category: string; items: ConceptLibraryItem[] }>;
  selectedCategory: string;
  selectedItemId: string | null;
  onTabChange: (tab: ConceptKind) => void;
  onCategoryChange: (category: string) => void;
  onItemChange: (item: ConceptLibraryItem) => void;
}) {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        {conceptTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`h-10 rounded-md text-sm font-black transition-colors ${activeTab === tab.id ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:bg-white/70'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs font-black text-slate-400">
        <span>目录树</span>
        <span>{activeItems.length} 条</span>
      </div>
      <div className="mt-2 space-y-2">
        <button
          onClick={() => onCategoryChange('全部')}
          className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black ${selectedCategory === '全部' && !selectedItemId ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Folder className="h-4 w-4" />
            <span className="truncate">全部{activeTab === 'inspiration' ? '灵感' : '题材'}</span>
          </span>
          <span className="text-xs text-slate-400">{activeItems.length}</span>
        </button>
        {groups.map((group) => (
          <div key={group.category} className="rounded-lg border border-slate-100 bg-white">
            <button
              onClick={() => onCategoryChange(group.category)}
              className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-black ${selectedCategory === group.category && !selectedItemId ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <ChevronDown className="h-4 w-4 text-slate-400" />
                <Folder className="h-4 w-4" />
                <span className="truncate">{group.category}</span>
              </span>
              <span className="text-xs text-slate-400">{group.items.length}</span>
            </button>
            <div className="pb-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemChange(item)}
                  className={`ml-5 flex min-h-8 w-[calc(100%-1.25rem)] items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-bold leading-5 ${selectedItemId === item.id ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
