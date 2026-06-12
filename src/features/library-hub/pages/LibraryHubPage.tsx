import { useState } from 'react';

import { BrainstormLibraryPage } from '@/features/brainstorm-library/pages/BrainstormLibraryPage';
import { ConceptLibraryPage } from '@/features/concept-library/pages/ConceptLibraryPage';
import { CoverLibraryPage } from '@/features/covers/pages/CoverLibraryPage';

type LibraryTab = 'concept' | 'brainstorm' | 'covers';

const libraryTabs: Array<{ id: LibraryTab; label: string }> = [
  { id: 'concept', label: '构思库' },
  { id: 'brainstorm', label: '脑洞库' },
  { id: 'covers', label: '封面库' },
];

export function LibraryHubPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('concept');

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6">
        <div className="inline-flex rounded-[18px] bg-slate-100 p-1.5">
          {libraryTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 min-w-[86px] rounded-[15px] px-5 text-base font-bold transition-all ${
                  active ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-500 hover:bg-white/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div id="concept-library-toolbar-slot" className="flex shrink-0 items-center gap-2" />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {activeTab === 'concept' && <ConceptLibraryPage embedded />}
        {activeTab === 'brainstorm' && <BrainstormLibraryPage embedded />}
        {activeTab === 'covers' && <CoverLibraryPage embedded />}
      </main>
    </div>
  );
}
