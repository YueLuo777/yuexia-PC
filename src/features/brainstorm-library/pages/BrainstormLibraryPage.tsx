import { Link } from 'react-router-dom';

import { WorkbenchLibraryPanel } from '@/features/workbench/components/WorkbenchLibraryPanel';
import type { WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

const CURRENT_ID_KEY = 'xinyuexia_current_novel_id';
const NOVELS_KEY = 'xinyuexia_novels_v1';

function readCurrentNovel() {
  try {
    const id = Number(localStorage.getItem(CURRENT_ID_KEY));
    const novels = JSON.parse(localStorage.getItem(NOVELS_KEY) ?? '[]') as WorkbenchNovel[];
    return novels.find((novel) => novel.id === id) ?? null;
  } catch {
    return null;
  }
}

export function BrainstormLibraryPage() {
  const currentNovel = readCurrentNovel();

  if (!currentNovel) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">脑洞库</h1>
          <p className="mt-2 text-sm text-gray-500">请先选择一个作品，再打开脑洞库。</p>
          <Link to="/novels" className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark">
            去选择作品
          </Link>
        </div>
      </div>
    );
  }

  const storageKey = `xinyuexia_workbench_settings_${currentNovel.id}`;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">脑洞库</h1>
          <p className="mt-1 text-sm text-gray-400">当前作品：{currentNovel.title}</p>
        </div>
      </header>
      <main className="min-h-0 flex-1 p-5">
        <div className="flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <WorkbenchLibraryPanel
            storageKey={storageKey}
            tabs={['脑洞']}
            emptyText="暂无脑洞内容"
            volumes={[]}
            scale={1}
          />
        </div>
      </main>
    </div>
  );
}
