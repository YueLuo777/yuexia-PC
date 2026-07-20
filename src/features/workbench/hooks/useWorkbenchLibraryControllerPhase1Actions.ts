import { useCallback, type Dispatch, type SetStateAction } from 'react';

type TabConfigPatch = Record<string, unknown>;
type BrainstormSessionPatch = Partial<{ input: string; output: string; result: string }>;

type Phase1ActionsOptions = {
  activeTab: string;
  brainstormTab: string;
  customSettingTypeDomains: Record<string, string>;
  defaultSettingTypeDomains: Readonly<Record<string, string>>;
  outlineSettingDomain: string;
  roleTab: string;
  settingWorkspaceDomainGroups: Readonly<Record<string, readonly string[]>>;
  setOutlinePreviewDraftState: Dispatch<SetStateAction<string>>;
  updateActiveBrainstormAiSession: (patch: BrainstormSessionPatch) => void;
  updateActiveTabConfig: (patch: TabConfigPatch) => void;
  updateTabConfig: (tab: string, patch: TabConfigPatch) => void;
};

export function useWorkbenchLibraryControllerPhase1Actions({
  activeTab,
  brainstormTab,
  customSettingTypeDomains,
  defaultSettingTypeDomains,
  outlineSettingDomain,
  roleTab,
  settingWorkspaceDomainGroups,
  setOutlinePreviewDraftState,
  updateActiveBrainstormAiSession,
  updateActiveTabConfig,
  updateTabConfig,
}: Phase1ActionsOptions) {
  const setOutlinePreviewDraft = useCallback(
    (value: SetStateAction<string>) => setOutlinePreviewDraftState(value),
    [setOutlinePreviewDraftState],
  );

  const setSelectedId = (id: string | null) => updateActiveTabConfig({ selectedId: id });
  const setSelectedIdForTab = (tab: string, id: string | null) => updateTabConfig(tab, { selectedId: id });
  const setRoleTypeDraft = (value: string) => updateTabConfig(roleTab, { roleTypeDraft: value, typeDraft: value });
  const setRoleNameDraft = (value: string) => updateTabConfig(roleTab, { roleNameDraft: value, titleDraft: value });
  const setSettingTypeDraft = (value: string) => updateActiveTabConfig({ typeDraft: value });
  const setSettingTitleDraft = (value: string) => updateActiveTabConfig({ titleDraft: value });

  const getSelectedSettingWorkspaceDomain = useCallback(
    () =>
      Object.prototype.hasOwnProperty.call(settingWorkspaceDomainGroups, outlineSettingDomain)
        ? outlineSettingDomain
        : null,
    [outlineSettingDomain, settingWorkspaceDomainGroups],
  );

  const getSelectedSettingWorkspaceType = useCallback(() => {
    const domain = getSelectedSettingWorkspaceDomain();
    return domain ? (settingWorkspaceDomainGroups[domain]?.[0] ?? null) : null;
  }, [getSelectedSettingWorkspaceDomain, settingWorkspaceDomainGroups]);

  const getSettingTypeWorkspaceDomain = useCallback(
    (type: string) => {
      const customDomain = customSettingTypeDomains[type];
      return (
        defaultSettingTypeDomains[type] ??
        (customDomain && Object.prototype.hasOwnProperty.call(settingWorkspaceDomainGroups, customDomain)
          ? customDomain
          : null) ??
        null
      );
    },
    [customSettingTypeDomains, defaultSettingTypeDomains, settingWorkspaceDomainGroups],
  );

  const setAiValue = (key: 'input' | 'output' | 'result', value: string) => {
    if (activeTab === brainstormTab) {
      updateActiveBrainstormAiSession({ [key]: value });
      return;
    }
    const configKey = key === 'input' ? 'aiInput' : key === 'output' ? 'aiOutput' : 'aiResult';
    updateActiveTabConfig({ [configKey]: value });
  };

  return {
    getSelectedSettingWorkspaceDomain,
    getSelectedSettingWorkspaceType,
    getSettingTypeWorkspaceDomain,
    setAiInput: (value: string) => setAiValue('input', value),
    setAiOutput: (value: string) => setAiValue('output', value),
    setAiResult: (value: string) => setAiValue('result', value),
    setOutlinePreviewDraft,
    setRoleNameDraft,
    setRoleTypeDraft,
    setSelectedId,
    setSelectedIdForTab,
    setSettingTitleDraft,
    setSettingTypeDraft,
  };
}
