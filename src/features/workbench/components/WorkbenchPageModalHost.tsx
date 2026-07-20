import type { ComponentProps, Dispatch, SetStateAction } from 'react';

import { ChapterExportPanel } from './ChapterExportPanel';
import { ChapterRecycleModal } from './ChapterRecycleModal';
import { WorkbenchContextLibraryModal } from './WorkbenchContextLibraryModal';
import { WorkbenchEditorSettingsModal } from './WorkbenchEditorSettingsModal';
import { WorkbenchFindReplaceModal } from './WorkbenchFindReplaceModal';
import { WorkbenchLibraryPanel } from './WorkbenchLibraryPanel';
import { WorkbenchManagementModal } from './WorkbenchManagementModal';
import { WorkbenchModal } from './WorkbenchModal';
import { WorkbenchNotesModal } from './WorkbenchNotesModal';
import { WorkbenchWorkInfoModal } from './WorkbenchWorkInfoModal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ExportPanelProps = ComponentProps<typeof ChapterExportPanel>;
type LibraryProps = ComponentProps<typeof WorkbenchLibraryPanel>;

export interface WorkbenchPageModalHostProps {
  exportPanel: ExportPanelProps & { open: boolean };
  recycle: ComponentProps<typeof ChapterRecycleModal>;
  managementType: ComponentProps<typeof WorkbenchManagementModal>['type'] | null;
  contextLibrary: ComponentProps<typeof WorkbenchContextLibraryModal>;
  findReplace: (ComponentProps<typeof WorkbenchFindReplaceModal> & { open: boolean }) | null;
  editorSettings: {
    open: boolean;
    publishConfirm: boolean;
    onChangePublishConfirm: Dispatch<SetStateAction<boolean>>;
    onClose: () => void;
  };
  publish: { item: { chapterId: number; title: string } | null; onClose: () => void; onConfirm: () => void };
  workInfo: ComponentProps<typeof WorkbenchWorkInfoModal>;
  settingLibrary: LibraryProps & { open: boolean; initialTab: '脑洞' | '大纲'; onClose: () => void };
  detailOutlineLibrary: LibraryProps & { open: boolean; onClose: () => void };
  notes: ComponentProps<typeof WorkbenchNotesModal>;
  onCloseManagement: () => void;
}

export function WorkbenchPageModalHost(props: WorkbenchPageModalHostProps) {
  const {
    exportPanel,
    recycle,
    managementType,
    contextLibrary,
    findReplace,
    editorSettings,
    publish,
    workInfo,
    settingLibrary,
    detailOutlineLibrary,
    notes,
    onCloseManagement,
  } = props;
  return (
    <>
      <WorkbenchModal
        title="导出章节"
        isOpen={exportPanel.open}
        onClose={exportPanel.onClose}
        storageId="workbench_export_chapters"
        widthClass="w-[820px]"
        heightClass="h-[78vh] max-h-[88vh]"
      >
        <ChapterExportPanel {...exportPanel} />
      </WorkbenchModal>
      <ChapterRecycleModal {...recycle} />
      {managementType && <WorkbenchManagementModal type={managementType} onClose={onCloseManagement} />}
      <WorkbenchContextLibraryModal {...contextLibrary} />
      {findReplace?.open && <WorkbenchFindReplaceModal {...findReplace} />}
      {editorSettings.open && <WorkbenchEditorSettingsModal {...editorSettings} />}
      <ConfirmDialog
        isOpen={Boolean(publish.item)}
        title="确认发布"
        description={publish.item ? `确定要发布「${publish.item.title}」吗？发布后章节会移动到已发布。` : ''}
        confirmText="确认发布"
        onClose={publish.onClose}
        onConfirm={publish.onConfirm}
      />
      <WorkbenchWorkInfoModal {...workInfo} />
      <WorkbenchModal
        title={settingLibrary.initialTab === '脑洞' ? '生成脑洞' : '生成大纲'}
        isOpen={settingLibrary.open}
        onClose={settingLibrary.onClose}
        storageId="workbench_setting_library"
        widthClass="w-[1452px]"
        heightClass="h-[86vh] max-h-[95vh]"
        titleClassName="text-3xl"
        closeOnBackdrop={false}
      >
        <WorkbenchLibraryPanel {...settingLibrary} />
      </WorkbenchModal>
      <WorkbenchModal
        title="章纲"
        isOpen={detailOutlineLibrary.open}
        onClose={detailOutlineLibrary.onClose}
        storageId="workbench_detail_outline_library"
        widthClass="w-[1452px]"
        heightClass="h-[86vh] max-h-[95vh]"
        titleClassName="text-3xl"
        closeOnBackdrop={false}
      >
        <WorkbenchLibraryPanel {...detailOutlineLibrary} />
      </WorkbenchModal>
      <WorkbenchNotesModal {...notes} />
    </>
  );
}
