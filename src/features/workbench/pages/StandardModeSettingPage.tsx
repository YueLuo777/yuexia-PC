import { useState } from 'react';

import { StandardModeSettingCheckPanel } from '@/features/workbench/components/StandardModeSettingCheckPanel';
import { StandardModeSettingEditor } from '@/features/workbench/components/StandardModeSettingEditor';
import { StandardModeSettingSidebar } from '@/features/workbench/components/StandardModeSettingSidebar';
import { StandardModeSettingTemplateInitializer } from '@/features/workbench/components/StandardModeSettingTemplateInitializer';
import { useStandardModeSettings } from '@/features/workbench/hooks/useStandardModeSettings';
import type { TemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type StandardModeSettingPageProps = {
  novelId: string;
  novelTitle: string;
  novelCategory: string;
  settingsStorageKey: string;
  forceTemplateSelection?: boolean;
  onInitialized?: () => void;
};

export function StandardModeSettingPage({
  novelId,
  novelTitle,
  novelCategory,
  settingsStorageKey,
  forceTemplateSelection = false,
  onInitialized,
}: StandardModeSettingPageProps) {
  const settings = useStandardModeSettings(novelId, settingsStorageKey);
  const [pendingTemplate, setPendingTemplate] = useState<{
    id: string;
    name: string;
    structure: TemplateStructure;
  } | null>(null);

  const finishInitialization = (template: { id: string; name: string; structure: TemplateStructure }) => {
    settings.initializeTemplate(template.id, template.name, template.structure);
    onInitialized?.();
  };

  if (!settings.template || forceTemplateSelection) {
    return (
      <>
        <StandardModeSettingTemplateInitializer
          novelTitle={novelTitle}
          novelCategory={novelCategory}
          replacingExisting={settings.hasExistingSettings}
          onConfirm={(template) => {
            if (settings.hasExistingSettings) setPendingTemplate(template);
            else finishInitialization(template);
          }}
        />
        <ConfirmDialog
          isOpen={pendingTemplate !== null}
          title="重新创建设定？"
          description="选择新模板会删除这本书现有的全部设定内容，并按新模板重新创建。此操作不会影响脑洞、章纲和正文。"
          confirmText="删除并重新创建"
          cancelText="保留现有设定"
          confirmVariant="danger"
          onClose={() => setPendingTemplate(null)}
          onConfirm={() => {
            const template = pendingTemplate;
            setPendingTemplate(null);
            if (template) finishInitialization(template);
          }}
        />
      </>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 min-w-[1240px] overflow-hidden bg-white xy-setting-workspace-typography"
      data-standard-mode-setting-page="true"
      data-template-mode={settings.template.templateId}
    >
      <StandardModeSettingSidebar
        entries={settings.entries}
        selectedEntryId={settings.selectedEntryId}
        onSelectEntry={settings.setSelectedEntryId}
      />
      <StandardModeSettingEditor
        entry={settings.selectedEntry}
        focusTarget={settings.focusTarget}
        onFieldChange={settings.updateField}
      />
      <StandardModeSettingCheckPanel
        results={settings.checkResults}
        onCheck={settings.runCheck}
        onJump={settings.jumpToEmptyField}
      />
    </div>
  );
}
