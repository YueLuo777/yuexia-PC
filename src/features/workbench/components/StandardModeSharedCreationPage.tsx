import { lazy, Suspense } from 'react';

import type { StandardStageAction } from './StandardModeWorkbenchNavigation';

const SharedWorkbenchPage = lazy(() =>
  import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })),
);

type SharedCreationAction = Extract<
  StandardStageAction,
  'settingsList' | 'chapterOutline' | 'writing' | 'storyAudit' | 'statusUpdate' | 'summary'
>;

const FLOW_BY_ACTION = {
  settingsList: 'outline',
  chapterOutline: 'chapterOutline',
  writing: 'writing',
  storyAudit: 'audit',
  statusUpdate: 'status',
  summary: 'summary',
} as const;

export function StandardModeSharedCreationPage({ action }: { action: SharedCreationAction }) {
  return (
    <Suspense
      fallback={
        <div className="grid h-full place-items-center bg-[#f5f5f7] text-sm font-semibold text-[#7b8794]">
          正在加载创作页面…
        </div>
      }
    >
      <SharedWorkbenchPage
        experience="standard"
        contentExperience="professional"
        fixedFlow={FLOW_BY_ACTION[action]}
      />
    </Suspense>
  );
}
