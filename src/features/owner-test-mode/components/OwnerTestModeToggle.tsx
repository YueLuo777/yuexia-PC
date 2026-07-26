import { useEffect } from 'react';

import { readOwnerTestMode, useOwnerTestMode, writeOwnerTestMode } from '@/features/owner-test-mode/model/ownerTestMode';
import { useApplicationMode, writeApplicationMode } from '@/shared/mode/applicationMode';

export function OwnerTestModeToggle() {
  const applicationMode = useApplicationMode();
  const storedEnabled = useOwnerTestMode();
  const enabled = applicationMode === 'standard' && storedEnabled;
  const label = enabled ? '退出测试模式' : '进入测试模式';

  useEffect(() => {
    if (applicationMode === 'professional' && readOwnerTestMode()) writeOwnerTestMode(false);
  }, [applicationMode]);

  return (
    <button
      type="button"
      onClick={() => {
        if (enabled) {
          writeOwnerTestMode(false);
          return;
        }
        writeApplicationMode('standard');
        writeOwnerTestMode(true);
      }}
      className={`h-8 shrink-0 rounded-md border px-3 text-sm font-semibold transition-colors ${
        enabled
          ? 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border-slate-300 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-800'
      }`}
      aria-pressed={enabled}
    >
      {label}
    </button>
  );
}
