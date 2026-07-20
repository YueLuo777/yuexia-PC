import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import { getRoleReadableContent, type RoleContent } from './workbenchRoleContent';
import {
  getStructuredSettingWordCountSource,
  type SettingContent,
} from './workbenchStructuredSettings';

export function getWorkbenchSidebarWordCountSource(
  entry: WorkbenchLibraryEntry,
  parsedSetting: SettingContent | null,
  parsedRole: RoleContent | null,
) {
  if (parsedRole) return getRoleReadableContent(parsedRole);
  if (parsedSetting) return getStructuredSettingWordCountSource(entry, parsedSetting);
  return entry.content;
}
