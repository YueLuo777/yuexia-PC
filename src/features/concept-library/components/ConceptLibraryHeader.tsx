import { Cloud, FileText, Sparkles } from 'lucide-react';
import type { ModelItem } from '@/features/models/model/modelTypes';

export function ConceptLibraryHeader({
  stats,
  models,
  activeModelId,
  onModelChange,
  onOpenLog,
  onOpenCloud,
}: {
  stats: { total: number; inspirations: number; genreConcepts: number; pending: number };
  models: ModelItem[];
  activeModelId: string | null;
  onModelChange: (id: string | null) => void;
  onOpenLog: () => void;
  onOpenCloud: () => void;
}) {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-950">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            构思库
          </h1>
          <div className="mt-1 flex flex-wrap gap-3 text-xs font-bold text-slate-400">
            <span>全部 {stats.total}</span>
            <span>灵感 {stats.inspirations}</span>
            <span>题材 {stats.genreConcepts}</span>
            <span>待整理 {stats.pending}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeModelId ?? ''}
            onChange={(e) => onModelChange(e.target.value || null)}
            className="h-9 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
          >
            {models.length === 0 ? (
              <option value="">暂无模型</option>
            ) : (
              models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={onOpenLog}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600"
          >
            <FileText className="h-4 w-4" />
            输出日志
          </button>
          <button
            onClick={onOpenCloud}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 text-sm font-black text-cyan-700"
          >
            <Cloud className="h-4 w-4" />
            云同步
          </button>
        </div>
      </div>
    </header>
  );
}
