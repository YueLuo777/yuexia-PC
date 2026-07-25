import { useCallback, useState } from 'react';

import {
  readTextAuditCountdownSeconds,
  writeTextAuditCountdownSeconds,
} from '@/features/workbench/model/chapterAuditWorkflow';

export function useChapterAuditWorkflowSettings() {
  const [textAuditCountdownSeconds, setTextAuditCountdownSecondsState] = useState(readTextAuditCountdownSeconds);
  const setTextAuditCountdownSeconds = useCallback((value: number) => {
    const normalized = writeTextAuditCountdownSeconds(value);
    setTextAuditCountdownSecondsState(normalized);
  }, []);

  return { textAuditCountdownSeconds, setTextAuditCountdownSeconds };
}
