import type { ProfessionalTemplateDiyController } from './useProfessionalTemplateDiyController';

export {
  DIY_LEVEL_META,
  DiyAddRow,
  DiyDeleteButton,
  DiyEmptyState,
  DiyLevelHeading,
  DiyLockButton,
} from '@/features/templates/components/TemplateDiyEditorPrimitives';

export function DiySurfaceFooter({ controller }: { controller: ProfessionalTemplateDiyController }) {
  const { summary } = controller;
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5">
      <div className="min-w-0">
        <div className="text-sm font-black">
          当前结构：{summary.domainCount} 个一级 · {summary.groupCount} 个二级 · {summary.entryCount} 个三级 ·{' '}
          {summary.fieldCount} 个四级
        </div>
        <div className="mt-1 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
          {controller.feedback}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={controller.resetStructure}
          className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]"
        >
          重置默认结构
        </button>
        <button
          type="button"
          onClick={() => controller.setFeedback('当前 DIY 模板结构已确认。')}
          className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#0798B8]"
        >
          确认DIY结构
        </button>
      </div>
    </footer>
  );
}
