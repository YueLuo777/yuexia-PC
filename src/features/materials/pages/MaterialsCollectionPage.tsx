import { Database, Image, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';
import { useMaterials } from '@/features/materials/hooks/useMaterials';

const materialSections = [
  {
    title: '设定库',
    description: '管理作品设定、概要、备忘录等文本资料。',
    path: '/materials/settings',
    icon: Database,
    getCountLabel: (count: number) => `${count} 条资料`,
    key: 'settings',
  },
  {
    title: '封面库',
    description: '集中查看和管理小说、剧本封面素材。',
    path: '/cover-library',
    icon: Image,
    getCountLabel: (count: number) => `${count} 张封面`,
    key: 'covers',
  },
] as const;

export function MaterialsCollectionPage() {
  const navigate = useNavigate();
  const { stats } = useMaterials();
  const { items: covers } = useCoverLibrary();

  const counts: Record<(typeof materialSections)[number]['key'], number> = {
    settings: stats.count,
    covers: covers.length,
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white px-6">
        <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">资料库</h1>
            <p className="mt-0.5 text-xs text-slate-400">设定、封面等资料统一收纳在这里</p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {materialSections.map((section) => {
            const Icon = section.icon;
            const count = counts[section.key];
            return (
              <button
                key={section.path}
                onClick={() => navigate(section.path)}
                className="group flex min-h-[150px] flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 transition-colors group-hover:bg-brand-light group-hover:text-brand">
                    {section.getCountLabel(count)}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900">{section.title}</div>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{section.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
