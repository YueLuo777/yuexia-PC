import { CURRENT_ID_KEY } from '@/features/workbench/model/workbenchDataSupport';
import { readWorkbenchLibraryEntries } from '@/features/workbench/model/workbenchLibraryStorage';
import { isMaleProtagonistRoleType } from '@/features/workbench/model/workbenchRoleTypes';

import { readCustomRoleTypes, readHiddenRoleTypes } from './workbenchLibraryDataState';
import { buildWorkbenchRoleTypeOptions } from './workbenchRoleTypeOptions';

export function getRoleIdentityTypeOptions(roleTypeOptions: string[]) {
  return roleTypeOptions.filter((type) => !isMaleProtagonistRoleType(type));
}

export function readCurrentWorkbenchRoleIdentityOptions() {
  const currentNovelId = localStorage.getItem(CURRENT_ID_KEY);
  if (!currentNovelId) return getRoleIdentityTypeOptions(buildWorkbenchRoleTypeOptions({
    entries: [],
    customRoleTypes: [],
    hiddenRoleTypes: [],
  }));
  const storageKey = `xinyuexia_workbench_settings_${currentNovelId}`;
  return getRoleIdentityTypeOptions(buildWorkbenchRoleTypeOptions({
    entries: readWorkbenchLibraryEntries(storageKey),
    customRoleTypes: readCustomRoleTypes(storageKey),
    hiddenRoleTypes: readHiddenRoleTypes(storageKey),
  }));
}
