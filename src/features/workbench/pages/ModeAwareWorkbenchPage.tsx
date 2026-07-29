import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

import {
  readApplicationMode,
  useApplicationMode,
  type ApplicationMode,
} from '@/shared/mode/applicationMode';

const loadProfessionalWorkbenchPage = () =>
  import('@/features/workbench/pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage }));
const loadStandardModeWorkbenchPage = () =>
  import('@/features/workbench/pages/StandardModeWorkbenchPage').then((module) => ({
    default: module.StandardModeWorkbenchPage,
  }));
const ProfessionalWorkbenchPage = lazy(loadProfessionalWorkbenchPage);
const StandardModeWorkbenchPage = lazy(loadStandardModeWorkbenchPage);

export function resolveWorkbenchExperience(search: string, fallback: ApplicationMode): ApplicationMode {
  const requested = new URLSearchParams(search).get('experience');
  return requested === 'standard' || requested === 'professional' ? requested : fallback;
}

export function preloadModeAwareWorkbenchPage(experience: ApplicationMode = readApplicationMode()) {
  return experience === 'standard'
    ? loadStandardModeWorkbenchPage()
    : loadProfessionalWorkbenchPage();
}

export function ModeAwareWorkbenchPage() {
  const mode = useApplicationMode();
  const location = useLocation();
  const experience = resolveWorkbenchExperience(location.search, mode);
  const Page = experience === 'standard' ? StandardModeWorkbenchPage : ProfessionalWorkbenchPage;

  return (
    <Suspense fallback={<div className="grid h-full place-items-center bg-slate-50 text-sm text-slate-500">页面加载中...</div>}>
      <Page />
    </Suspense>
  );
}
