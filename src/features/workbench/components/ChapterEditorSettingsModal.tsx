import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';
import { WorkbenchModal } from './WorkbenchModal';
import { ChapterAuditWorkflowSettings } from './ChapterAuditWorkflowSettings';
import { useChapterAuditWorkflowSettings } from '../hooks/useChapterAuditWorkflowSettings';

interface ChapterEditorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuditMode?: boolean;
}

export function ChapterEditorSettingsModal({
  isOpen,
  onClose,
  isAuditMode = false,
}: ChapterEditorSettingsModalProps) {
  const { textAuditCountdownSeconds, setTextAuditCountdownSeconds } = useChapterAuditWorkflowSettings();
  if (!isOpen) return null;

  return (
    <WorkbenchModal
      title={isAuditMode ? '剧情审核设置' : '作品编辑器设置'}
      subtitle={isAuditMode ? '调整剧情审核与文本审核的衔接方式。' : '调整作品编辑器导航宽度。'}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full max-w-3xl"
      heightClass="h-auto"
      storageId={isAuditMode ? 'chapter_audit_settings' : 'chapter_editor_settings'}
      zIndexClass="z-[340]"
    >
        <div className="space-y-4 p-5">
          {isAuditMode ? (
            <>
              <WorkbenchNavigationWidthToggle />
              <ChapterAuditWorkflowSettings
                seconds={textAuditCountdownSeconds}
                onChange={setTextAuditCountdownSeconds}
              />
            </>
          ) : (
            <WorkbenchNavigationWidthToggle />
          )}
        </div>
        <footer className="flex shrink-0 justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
    </WorkbenchModal>
  );
}
