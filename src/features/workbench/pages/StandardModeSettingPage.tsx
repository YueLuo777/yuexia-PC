import { useEffect, useState } from 'react';

import { StandardModeSettingCheckPanel } from '@/features/workbench/components/StandardModeSettingCheckPanel';
import { StandardModeSettingEditor } from '@/features/workbench/components/StandardModeSettingEditor';
import { StandardModeSettingSidebarActions } from '@/features/workbench/components/StandardModeSettingSidebarActions';
import { StandardModeSettingSidebar } from '@/features/workbench/components/StandardModeSettingSidebar';
import { StandardModeSettingTemplateInitializer } from '@/features/workbench/components/StandardModeSettingTemplateInitializer';
import { StandardModeTemplateUpgradeDialog } from '@/features/workbench/components/StandardModeTemplateUpgradeDialog';
import { useStandardModeSettings } from '@/features/workbench/hooks/useStandardModeSettings';
import { clearStandardModeBrainstormLinkFromSettingsKey } from '@/features/workbench/model/standardModeBrainstormLink';
import { clearStandardSettingGenerationState } from '@/features/workbench/model/standardModeSettingGenerationFlow';
import type { BookChannel } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type { TemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';
import type {
  SettingGenerationPromptProfile,
  TemplateGenerationBlueprint,
} from '@/features/workbench/model/standardModeTemplateGenerationModel';
import { getCurrentSettingTemplateName } from '@/features/workbench/model/standardModeTemplateIdentity';
import { getStandardTemplateUpgradeOptions } from '@/features/workbench/model/standardModeTemplateUpgrade';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type StandardModeSettingPageProps = {
  novelId: string;
  novelTitle: string;
  novelCategory: string;
  novelChannel?: Extract<BookChannel, 'male' | 'female'>;
  novelTargetWordCount?: number;
  settingsStorageKey: string;
  forceTemplateSelection?: boolean;
  startInTemplateSelector?: boolean;
  onInitialized?: () => void;
  onNovelChannelChange?: (channel: Extract<BookChannel, 'male' | 'female'>) => void;
  onTemplateChangeCancelled?: () => void;
};

export function StandardModeSettingPage({
  novelId,
  novelTitle,
  novelCategory,
  novelChannel = 'male',
  novelTargetWordCount,
  settingsStorageKey,
  forceTemplateSelection = false,
  startInTemplateSelector = false,
  onInitialized,
  onNovelChannelChange = () => {},
  onTemplateChangeCancelled,
}: StandardModeSettingPageProps) {
  const settings = useStandardModeSettings(novelId, settingsStorageKey);
  const [reselectingTemplate, setReselectingTemplate] = useState(startInTemplateSelector);
  const [templateWarningOpen, setTemplateWarningOpen] = useState(false);
  const [templateUpgradeOpen, setTemplateUpgradeOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<{
    id: string;
    name: string;
    revision: number;
    structure: TemplateStructure;
    generationBlueprint: TemplateGenerationBlueprint;
    promptProfile: SettingGenerationPromptProfile;
  } | null>(null);

  useEffect(() => {
    if (forceTemplateSelection && settings.hasExistingSettings && !reselectingTemplate) {
      if (settings.hasSettingContent) setTemplateWarningOpen(true);
      else setReselectingTemplate(true);
    }
  }, [forceTemplateSelection, reselectingTemplate, settings.hasExistingSettings, settings.hasSettingContent]);

  const finishInitialization = (template: {
    id: string;
    name: string;
    revision: number;
    structure: TemplateStructure;
    generationBlueprint: TemplateGenerationBlueprint;
    promptProfile: SettingGenerationPromptProfile;
  }) => {
    if (settings.hasExistingSettings) {
      clearStandardSettingGenerationState(settingsStorageKey);
      clearStandardModeBrainstormLinkFromSettingsKey(settingsStorageKey);
    }
    settings.initializeTemplate(template);
    setReselectingTemplate(false);
    onInitialized?.();
  };

  if (!settings.template || reselectingTemplate) {
    return (
      <>
        <StandardModeSettingTemplateInitializer
          novelTitle={novelTitle}
          novelCategory={novelCategory}
          novelChannel={novelChannel}
          novelTargetWordCount={novelTargetWordCount}
          replacingExisting={settings.hasExistingSettings}
          onNovelChannelChange={onNovelChannelChange}
          onCancel={settings.hasExistingSettings ? () => {
            setReselectingTemplate(false);
            onTemplateChangeCancelled?.();
          } : undefined}
          onConfirm={(template) => {
            if (settings.hasExistingSettings && !reselectingTemplate) {
              setPendingTemplate(template);
              setTemplateWarningOpen(true);
            } else finishInitialization(template);
          }}
        />
        <TemplateReplacementWarning
          isOpen={templateWarningOpen}
          currentTemplateName={getCurrentSettingTemplateName(settings.template)}
          onClose={() => {
            setTemplateWarningOpen(false);
            setPendingTemplate(null);
            onTemplateChangeCancelled?.();
          }}
          onConfirm={() => {
            setTemplateWarningOpen(false);
            if (pendingTemplate) {
              const template = pendingTemplate;
              setPendingTemplate(null);
              finishInitialization(template);
            } else setReselectingTemplate(true);
          }}
        />
      </>
    );
  }

  const canUpgradeTemplate = getStandardTemplateUpgradeOptions(
    settings.template.templateId,
    settings.template.structure,
  ).length > 0;

  return (
    <>
      <div
        className="flex h-full min-h-0 min-w-[1240px] overflow-hidden bg-white xy-setting-workspace-typography"
        data-standard-mode-setting-page="true"
        data-template-mode={settings.template.templateId}
      >
        <StandardModeSettingSidebar
          entries={settings.entries}
          selectedEntryId={settings.selectedEntryId}
          onSelectEntry={settings.setSelectedEntryId}
          footerActions={(
            <StandardModeSettingSidebarActions
              storageKey={settingsStorageKey}
              canUpgradeTemplate={canUpgradeTemplate}
              onUpgradeTemplate={() => setTemplateUpgradeOpen(true)}
              onChangeTemplate={() => {
                if (settings.hasSettingContent) setTemplateWarningOpen(true);
                else setReselectingTemplate(true);
              }}
            />
          )}
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
      <TemplateReplacementWarning
        isOpen={templateWarningOpen}
        currentTemplateName={getCurrentSettingTemplateName(settings.template)}
        onClose={() => {
          setTemplateWarningOpen(false);
          onTemplateChangeCancelled?.();
        }}
        onConfirm={() => {
          setTemplateWarningOpen(false);
          setReselectingTemplate(true);
        }}
      />
      <StandardModeTemplateUpgradeDialog
        isOpen={templateUpgradeOpen}
        template={settings.template}
        onClose={() => setTemplateUpgradeOpen(false)}
        onConfirm={(option) => {
          settings.upgradeTemplate(option.id, option.name, option.structure);
          setTemplateUpgradeOpen(false);
        }}
      />
    </>
  );
}

export function TemplateReplacementWarning({
  isOpen,
  currentTemplateName,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  currentTemplateName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="更换设定模板？"
      description={`当前使用模板：${currentTemplateName}\n\n更换模板会清空全部设定，脑洞、章纲和正文则不会受到影响，是否继续？`}
      confirmText="继续更换模板"
      cancelText="取消"
      confirmVariant="danger"
      cancelVariant="primary"
      destructiveActionSecondary
      confirmFirst
      initialFocus="cancel"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
