import { useState } from 'react';

import {
  clearStandardModeBookSettings,
  getNovelIdFromSettingsStorageKey,
} from '@/features/workbench/model/clearStandardModeBookSettings';
import { readStandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import { publishStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';
import { getStandardTemplateUpgradeOptions } from '@/features/workbench/model/standardModeTemplateUpgrade';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function StandardModeSettingSidebarActions({
  storageKey,
  canUpgradeTemplate = false,
  onUpgradeTemplate,
  onChangeTemplate,
}: {
  storageKey: string;
  canUpgradeTemplate?: boolean;
  onUpgradeTemplate?: () => void;
  onChangeTemplate?: () => void;
}) {
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const currentTemplate = readStandardSettingTemplateState(getNovelIdFromSettingsStorageKey(storageKey));
  const hasUpgradeTarget = currentTemplate
    ? getStandardTemplateUpgradeOptions(currentTemplate.templateId, currentTemplate.structure).length > 0
    : false;
  const effectiveCanUpgrade = canUpgradeTemplate || hasUpgradeTarget;

  return (
    <>
      <div
        role="group"
        aria-label="作品设定操作"
        data-standard-setting-sidebar-actions="true"
        className="mt-2 grid h-10 shrink-0 grid-cols-3 gap-2"
      >
        <button
          type="button"
          disabled={!effectiveCanUpgrade}
          title={effectiveCanUpgrade ? '保留已有内容并补充新字段' : '当前模板没有可升级版本'}
          onClick={() => {
            if (onUpgradeTemplate) onUpgradeTemplate();
            else publishStandardModeSettingNavigationAction({ action: 'upgrade-template', storageKey });
          }}
          className="rounded-md border border-[#8fd8e7] bg-white px-1 text-xs font-bold text-[#078FAB] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
        >
          升级模板
        </button>
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
        title="清空所有设定内容？"
        description="将清空当前书籍所有设定字段中已填写的内容，但会保留当前模板、设定分组、设定名和字段结构。关联脑洞、章纲、正文及其他书籍不会受到影响。清空后无法恢复。"
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
