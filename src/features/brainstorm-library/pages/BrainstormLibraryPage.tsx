import { WorkbenchLibraryPanel } from '@/features/workbench/components/WorkbenchLibraryPanel';
import { GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY } from '@/features/workbench/model/workbenchLibraryStorage';

interface BrainstormLibraryPageProps {
  embedded?: boolean;
}

export function BrainstormLibraryPage({ embedded = false }: BrainstormLibraryPageProps = {}) {
  return (
    <div className="flex h-full flex-col bg-gray-50">
      {!embedded && (
        <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">脑洞库</h1>
            <p className="mt-1 text-sm text-gray-400">所有作品通用</p>
          </div>
        </header>
      )}
      <main className="min-h-0 flex-1 p-5">
        <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <WorkbenchLibraryPanel
            storageKey={GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY}
            tabs={['脑洞']}
            emptyText="暂无脑洞内容"
            volumes={[]}
            scale={1}
            toolbarPortalId={embedded ? 'concept-library-toolbar-slot' : undefined}
          />
        </div>
      </main>
    </div>
  );
}
