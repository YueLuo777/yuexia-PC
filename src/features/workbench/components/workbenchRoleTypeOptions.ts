import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  normalizeWorkbenchRoleType,
} from '@/features/workbench/model/workbenchRoleTypes';

import { parseRoleContent } from './workbenchRoleContent';
import { ROLE_TAB, UNCATEGORIZED_TYPE } from './workbenchLibraryTabs';

export function buildWorkbenchRoleTypeOptions({
  entries,
  customRoleTypes,
  hiddenRoleTypes,
}: {
  entries: WorkbenchLibraryEntry[];
  customRoleTypes: string[];
  hiddenRoleTypes: string[];
}) {
  const hidden = new Set(hiddenRoleTypes);
  const normalizeVisible = (type: string) => {
    const normalized = normalizeWorkbenchRoleType(type);
    return normalized !== UNCATEGORIZED_TYPE && !hidden.has(normalized) ? normalized : null;
  };
  const entryTypes = entries
    .filter((entry) => entry.tab === ROLE_TAB)
    .map((entry) => normalizeVisible(parseRoleContent(entry.content).type))
    .filter((type): type is string => Boolean(type));
  return Array.from(
    new Set(
      [...DEFAULT_WORKBENCH_ROLE_TYPES, ...customRoleTypes]
        .map(normalizeVisible)
        .filter((type): type is string => Boolean(type))
        .concat(entryTypes),
    ),
  );
}
