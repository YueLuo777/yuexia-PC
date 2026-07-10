import { APP_EVENTS } from './appEvents';

export const WORKSPACE_NOVEL_SELECTED_EVENT = APP_EVENTS.workspaceNovelSelected;

export interface WorkspaceNovelSelectedDetail {
  novelId: number | null;
}

export function emitWorkspaceNovelSelected(novelId: number | null) {
  window.dispatchEvent(
    new CustomEvent<WorkspaceNovelSelectedDetail>(WORKSPACE_NOVEL_SELECTED_EVENT, {
      detail: { novelId },
    }),
  );
}
