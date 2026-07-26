import { lazy, Suspense } from 'react';

import type { StandardStageAction } from './StandardModeWorkbenchNavigation';

const SharedWorkbenchPage = lazy(() =>
  import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })),
);

type SharedCreationAction = Extract<StandardStageAction, 'chapterOutline' | 'writing'>;

export function StandardModeSharedCreationPage({ action }: { action: SharedCreationAction }) {
  return (
    <Suspense
      fallback={
        <div className="grid h-full place-items-center bg-[#f5f5f7] text-sm font-semibold text-[#7b8794]">
          正在加载创作页面…
        </div>
      }
    >
      <SharedWorkbenchPage experience="standard" fixedFlow={action} />
    </Suspense>
  );
}
