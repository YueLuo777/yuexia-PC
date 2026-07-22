import { cleanupWorkbenchAssociationsOnClose } from './workbenchAssociationCleanup';
import { cleanupWorkbenchTransientAiDraftsOnClose } from './workbenchTransientAiCleanup';

export function prepareWorkbenchForAppClose() {
  cleanupWorkbenchAssociationsOnClose();
  cleanupWorkbenchTransientAiDraftsOnClose();
}
