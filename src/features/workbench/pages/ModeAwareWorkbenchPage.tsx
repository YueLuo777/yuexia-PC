import { lazy, Suspense } from 'react';

import { readApplicationMode, useApplicationMode } from '@/shared/mode/applicationMode';

const loadProfessionalWorkbenchPage = () =>
  import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage }));
const loadStandardModeWorkbenchPage = () =>
  import('@/features/workbench/pages/StandardModeWorkbenchPage').then((module) => ({
    default: module.StandardModeWorkbenchPage,
  }));
const ProfessionalWorkbenchPage = lazy(loadProfessionalWorkbenchPage);
const StandardModeWorkbenchPage = lazy(loadStandardModeWorkbenchPage);

export function preloadModeAwareWorkbenchPage() {
  return readApplicationMode() === 'standard'
    ? loadStandardModeWorkbenchPage()
    : loadProfessionalWorkbenchPage();
}

export function ModeAwareWorkbenchPage() {
  const mode = useApplicationMode();
  const Page = mode === 'standard' ? StandardModeWorkbenchPage : ProfessionalWorkbenchPage;

  return (
    <Suspense fallback={<div className="grid h-full place-items-center bg-slate-50 text-sm text-slate-500">页面加载中...</div>}>
      <Page />
    </Suspense>
  );
}
