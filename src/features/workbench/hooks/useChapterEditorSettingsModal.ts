import { useEffect, useRef, useState } from 'react';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';

const WORKBENCH_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';
const OBSOLETE_REVIEW_SIZE_KEYS = [
  'reviewActionGroup',
  'reviewModelSelect',
  'reviewAuditPromptSelect',
  'reviewCommentPromptSelect',
] as const;

export function removeObsoleteChapterEditorSizeSpecs() {
  try {
    const stored = localStorage.getItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    let changed = false;
    for (const key of OBSOLETE_REVIEW_SIZE_KEYS) {
      if (!(key in parsed)) continue;
      delete parsed[key];
      changed = true;
    }
    if (changed) localStorage.setItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Keep unrelated persisted workbench settings intact when legacy data is malformed.
  }
}

export function useChapterEditorSettingsModal(openSignal: number) {
  const [isOpen, setIsOpen] = useState(false);
  const lastSignalRef = useRef(openSignal);

  useTopModalEscape(isOpen, () => setIsOpen(false));

  useEffect(() => {
    removeObsoleteChapterEditorSizeSpecs();
  }, []);

  useEffect(() => {
    if (openSignal <= 0 || openSignal === lastSignalRef.current) return;
    lastSignalRef.current = openSignal;
    setIsOpen(true);
  }, [openSignal]);

  return { isOpen, setIsOpen };
}
