import { useState } from 'react';

import { clearStandardModeBookSettings } from '@/features/workbench/model/clearStandardModeBookSettings';
import { publishStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function StandardModeSettingSidebarActions({
  storageKey,
  onChangeTemplate,
}: {
  storageKey: string;
  onChangeTemplate?: () => void;
}) {
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  return (
    <>
      <div
        role="group"
        aria-label="作品设定操作"
        data-standard-setting-sidebar-actions="true"
        className="mt-2 grid h-10 shrink-0 grid-cols-2 gap-2"
      >
        <button
          type="button"
          onClick={() => {
            if (onChangeTemplate) onChangeTemplate();
            else publishStandardModeSettingNavigationAction({ action: 'change-template', storageKey });
          }}
          className="rounded-md border border-[#8fd8e7] bg-white px-2 text-xs font-bold text-[#078FAB] hover:bg-[#EAF9FD]"
        >
          更换模板
        </button>
        <button
          type="button"
          onClick={() => setClearConfirmOpen(true)}
          className="rounded-md border border-red-300 bg-white px-2 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          清空设定
        </button>
      </div>
      <ConfirmDialog
        isOpen={clearConfirmOpen}
        title="清空全部设定？"
        description="将清空当前书籍的作品设定、人物设定、地点、势力、道具、伏笔和怪物内容。脑洞、章纲、正文及其他书籍不会受到影响。清空后无法恢复。"
        confirmText="确认清空"
        cancelText="取消"
        confirmVariant="danger"
        cancelVariant="primary"
        destructiveActionSecondary
        confirmFirst
        initialFocus="cancel"
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          if (!clearStandardModeBookSettings(storageKey)) return;
          setClearConfirmOpen(false);
          publishStandardModeSettingNavigationAction({ action: 'settings-cleared', storageKey });
        }}
      />
    </>
  );
}
