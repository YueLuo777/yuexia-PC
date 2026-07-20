import type { WorkbenchNovel } from '../model/workbenchTypes';
import { WorkbenchModal } from './WorkbenchModal';

export function WorkbenchWorkInfoModal({
  open,
  novel,
  volumeCount,
  chapterCount,
  onClose,
}: {
  open: boolean;
  novel: WorkbenchNovel;
  volumeCount: number;
  chapterCount: number;
  onClose: () => void;
}) {
  const cards = [
    ['作品名', novel.title],
    ['类型', novel.type === 'script' ? '剧本' : '小说'],
    ['分类', novel.category ?? '未分类'],
    ['卷数', volumeCount],
    ['章节数', chapterCount],
    ['总字数', novel.wordCount ?? 0],
  ];
  return (
    <WorkbenchModal
      title="作品信息"
      isOpen={open}
      onClose={onClose}
      storageId="workbench_work_info"
      widthClass="w-[864px]"
      heightClass="h-[86vh] max-h-[92vh]"
    >
      <div className="flex-1 overflow-y-auto bg-white p-6">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-300 p-5">
            <h3 className="mb-4 text-lg font-bold text-gray-900">作品概览</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {cards.map(([label, value], index) => (
                <div key={String(label)} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-400">{label}</p>
                  <p className={`mt-1.5 text-base font-bold ${index === 5 ? 'text-brand' : 'text-gray-900'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-slate-300 p-5">
            <h3 className="mb-4 text-lg font-bold text-gray-900">作品简介</h3>
            <div className="min-h-[180px] whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-base leading-8 text-gray-700">
              {novel.synopsis?.trim() || '暂无简介'}
            </div>
          </section>
        </div>
      </div>
    </WorkbenchModal>
  );
}
