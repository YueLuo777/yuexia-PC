import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const directory = dirname(fileURLToPath(import.meta.url));

describe('standard mode shared chapter creation pages', () => {
  it('reuses the professional workbench instead of copying outline and writing implementations', () => {
    const adapter = readFileSync(join(directory, 'StandardModeSharedCreationPage.tsx'), 'utf8');
    const standardPage = readFileSync(join(directory, '../pages/StandardModeWorkbenchPage.tsx'), 'utf8');
    const workbenchPage = readFileSync(join(directory, '../pages/WorkbenchPage.tsx'), 'utf8');
    const outlineView = readFileSync(join(directory, 'OutlineWorkspaceView.tsx'), 'utf8');
    const writingSurface = readFileSync(join(directory, 'ChapterWritingSurface.tsx'), 'utf8');

    expect(adapter).toContain("import('@/features/workbench/pages/WorkbenchPage')");
    expect(adapter).toContain('contentExperience="professional"');
    expect(adapter).toContain("settingsList: 'outline'");
    expect(adapter).toContain("storyAudit: 'audit'");
    expect(adapter).toContain("statusUpdate: 'status'");
    expect(standardPage).toContain("activeAction === 'chapterOutline'");
    expect(standardPage).toContain("activeAction === 'settingsList'");
    expect(standardPage).toContain('<StandardModeSharedCreationPage action={activeAction} aiLogOpenSignal={aiLogOpenSignal} />');
    expect(workbenchPage).toContain("experience?: 'professional' | 'standard'");
    expect(workbenchPage).toContain("'outline' | 'chapterOutline' | 'writing'");
    expect(workbenchPage).toContain("experience === 'professional' ? (");
    expect(workbenchPage).toContain('<WorkbenchHeader');
    expect(workbenchPage).toContain("experience === 'standard' ? 280 : chapterSidebarWidth");
    expect(workbenchPage).toContain("experience === 'standard' ? 390 : aiPanelWidth");
    expect(outlineView).toContain('data-detail-outline-layout={standardMode ? \'collapsible\' : \'fill-to-bottom\'}');
    expect(outlineView).toContain('data-detail-outline-state-frame="true"');
    expect(outlineView).toContain('状态变化 {countTextWords(detailOutlineParts.stateExpectation)}字');
    expect(writingSurface).toContain('standardMode ? (');
    expect(writingSurface).toContain('更多');
  });

  it('keeps status updating as a tool and removes the redundant setting-page switch in standard mode', () => {
    const adapter = readFileSync(join(directory, 'StandardModeSharedCreationPage.tsx'), 'utf8');
    const workbenchPage = readFileSync(join(directory, '../pages/WorkbenchPage.tsx'), 'utf8');
    const creationFlow = readFileSync(join(directory, 'WorkbenchCreationFlowContent.tsx'), 'utf8');
    const settingView = readFileSync(join(directory, 'workbenchSettingLibraryView.tsx'), 'utf8');
    const settingWorkspace = readFileSync(join(directory, 'workbenchSettingLibraryWorkspaceView.tsx'), 'utf8');

    expect(adapter).toContain("statusUpdate: 'status'");
    expect(workbenchPage).toContain("standardSettingMode={experience === 'standard'}");
    expect(creationFlow).toContain('standardMode={standardSettingMode}');
    expect(settingView).toContain('const showSettingStatusTabs = !standardMode');
    expect(settingView).toContain("showSettingStatusTabs && activeTabConfig.settingPanelMode === 'status'");
    expect(settingWorkspace).toContain('showFormalSettingTree && !standardMode');
    expect(settingWorkspace).toContain("!standardMode && activeTabConfig.settingPanelMode === 'status'");
    expect(settingWorkspace).toContain('<WorkbenchSettingPanelTabs');
    expect(settingWorkspace).toContain(
      'footerActions={standardMode ? <StandardModeSettingSidebarActions storageKey={storageKey} /> : null}',
    );
  });

  it('replaces only the standard setting AI selectors with the five-step generation panel', () => {
    const settingView = readFileSync(join(directory, 'workbenchSettingLibraryView.tsx'), 'utf8');
    const settingWorkspace = readFileSync(join(directory, 'workbenchSettingLibraryWorkspaceView.tsx'), 'utf8');
    const settingBranch = readFileSync(join(directory, 'workbenchSettingLibraryBranch.tsx'), 'utf8');
    const generationPanel = readFileSync(join(directory, 'StandardModeSettingGenerationPanel.tsx'), 'utf8');
    const libraryPanel = readFileSync(join(directory, 'WorkbenchLibraryPanel.tsx'), 'utf8');
    const controllerPhase = readFileSync(join(directory, '../hooks/useWorkbenchLibraryControllerPhase3.tsx'), 'utf8');

    expect(settingView).toContain('standardMode && activeTab === SETTING_TAB');
    expect(settingView).toContain('<StandardModeSettingGenerationPanel');
    expect(settingView).toContain('silentDuringRun: true');
    expect(settingView).toContain('standardGenerationStepId,');
    expect(settingView).toContain('renderSettingLibraryAiConfigHeader(scope)');
    expect(generationPanel).toContain('STANDARD_SETTING_GENERATION_STEPS.map');
    expect(generationPanel).toContain('onClick={() => runStep(index, false)}');
    expect(generationPanel).toContain('slice(0, index)');
    expect(generationPanel).toContain('completedStep.id');
    expect(generationPanel).not.toContain('lastStreamImportAtRef');
    expect(settingView).toContain('standardGenerationStepId,');
    expect(controllerPhase).toContain("options.standardGenerationStepId === 'main-characters'");
    expect(controllerPhase).toContain('matchesStandardGeneratedProtagonistSlot');
    expect(controllerPhase).toContain('if (allowedEntryIds && !importsGeneratedCharacters) return;');
    expect(controllerPhase).toContain('standardGenerationStepId: options.standardGenerationStepId');
    expect(controllerPhase).toContain('hasRequiredStandardGeneratedRoleTypes(importedRoleTypes)');
    expect(settingBranch).toContain(
      'getLatestUsefulAiText(activeIsBrainstorm ? aiResult || aiOutput : aiOutput)',
    );
    expect(settingBranch).toContain('activeIsBrainstorm || showStandardSettingPageLog');
    expect(settingBranch).toContain('readWorkbenchPageAiRequestLog(scope.storageKey, activeTab)');
    expect(generationPanel).not.toContain('publishStandardSettingGenerationLock(isGenerating)');
    expect(generationPanel).not.toContain('<CombinedAiConfigSelect');
    expect(settingWorkspace).toContain(
      'const settingWorkspaceLocked = showFormalSettingTree && standardMode && isLibraryAiLoading',
    );
    expect(settingWorkspace).toContain("data-setting-generation-locked={settingWorkspaceLocked ? 'true' : undefined}");
    expect(settingWorkspace).toContain("settingWorkspaceLocked ? 'pointer-events-none' : ''");
    expect(settingWorkspace).not.toContain('<WorkbenchSettingTreeSidebar\n          inert=');
    expect(settingWorkspace).toContain('data-setting-generation-lock-indicator');
    expect(settingWorkspace).toContain('AI正在生成，设定编辑区已锁定');
    expect(libraryPanel).toContain('renderSettingLibraryBranch({\n    storageKey,');
  });
});
