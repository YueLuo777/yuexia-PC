import type { ChangeEvent, CSSProperties, KeyboardEventHandler, ReactNode, RefObject } from 'react';

import type { ModelItem } from '@/features/models/model/modelTypes';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { WordCountText } from '@/shared/ui/WordCountText';

import type { RoleContent } from './workbenchRoleContent';
import { RoleBaseStateEditor } from './workbenchRoleEditor';
import type { LibraryTabConfig } from './workbenchLibraryDataState';

type WorkbenchRoleLibraryViewProps = {
  scaleStyle?: CSSProperties;
  topTabs: ReactNode;
  overlays: ReactNode;
  settingLibraryMode: string;
  settingLibraryLeftWidth: number;
  settingLibraryRightWidth: number;
  sidebar: ReactNode;
  leftResizeHandle: ReactNode;
  rightResizeHandle: ReactNode;
  selectedEntry: WorkbenchLibraryEntry | null;
  selectedRole: RoleContent | null;
  roleEntries: WorkbenchLibraryEntry[];
  roleTypeOptions: string[];
  roleTextFontSize: number;
  currentOutlineChapterNumber?: number | null;
  selectedRoleLifeStatus: '存活' | '死亡' | undefined;
  onTitleChange: (title: string) => void;
  onRoleChange: (updates: Partial<RoleContent>) => void;
  fieldSizeButton: ReactNode;
  aiLogButton: ReactNode;
  configStyle: CSSProperties;
  activeTabConfig: LibraryTabConfig;
  models: ModelItem[];
  rolePromptOptions: PromptItem[];
  onModelChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onModelManage: () => void;
  onPromptManage: () => void;
  onPromptContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  aiOutput: string;
  onAiOutputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onClearAi: () => void;
  hasLibraryAiContent: boolean;
  isLibraryAiLoading: boolean;
  aiInputRef: RefObject<HTMLTextAreaElement | null>;
  aiInput: string;
  onAiInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onAiInputKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  onSendAi: () => void;
  onStopAi: () => void;
  canSendLibraryAiMessage: boolean;
};

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

export function WorkbenchRoleLibraryView({
  scaleStyle,
  topTabs,
  overlays,
  settingLibraryMode,
  settingLibraryLeftWidth,
  settingLibraryRightWidth,
  sidebar,
  leftResizeHandle,
  rightResizeHandle,
  selectedEntry,
  selectedRole,
  roleEntries,
  roleTypeOptions,
  roleTextFontSize,
  currentOutlineChapterNumber,
  selectedRoleLifeStatus,
  onTitleChange,
  onRoleChange,
  fieldSizeButton,
  aiLogButton,
  configStyle,
  activeTabConfig,
  models,
  rolePromptOptions,
  onModelChange,
  onPromptChange,
  onModelManage,
  onPromptManage,
  onPromptContextMenu,
  aiOutput,
  onAiOutputChange,
  onClearAi,
  hasLibraryAiContent,
  isLibraryAiLoading,
  aiInputRef,
  aiInput,
  onAiInputChange,
  onAiInputKeyDown,
  onSendAi,
  onStopAi,
  canSendLibraryAiMessage,
}: WorkbenchRoleLibraryViewProps) {
  const advanced = settingLibraryMode === 'advanced';

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
      {topTabs}
      {overlays}
      <div
        className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
        style={{
          gridTemplateColumns: advanced
            ? `${settingLibraryLeftWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
            : `${settingLibraryLeftWidth}px 0px minmax(0,1fr)`,
        }}
      >
        {sidebar}
        {leftResizeHandle}
        <main
          className={`min-w-0 flex min-h-0 flex-col overflow-hidden bg-white ${advanced ? 'border-r border-gray-100' : ''}`}
        >
          {selectedEntry && selectedRole ? (
            <RoleBaseStateEditor
              entry={selectedEntry}
              role={selectedRole}
              roleEntries={roleEntries}
              roleTypeOptions={roleTypeOptions}
              roleTextFontSize={roleTextFontSize}
              currentChapterNumber={currentOutlineChapterNumber}
              roleLifeStatus={selectedRoleLifeStatus}
              onTitleChange={onTitleChange}
              onRoleChange={onRoleChange}
            />
          ) : (
            <div className="m-5 flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              点击左侧“新建角色”开始创建角色
            </div>
          )}
        </main>

        {advanced && (
          <>
            {rightResizeHandle}
            <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
              <div className="flex shrink-0 items-center justify-between gap-3">
                <h3 className="shrink-0 text-base font-bold text-gray-900">角色生成</h3>
                <div className="flex shrink-0 items-center gap-2">
                  {fieldSizeButton}
                  {aiLogButton}
                </div>
              </div>
              <div className="mt-3 shrink-0 space-y-3">
                <CombinedAiConfigSelect
                  style={configStyle}
                  modelValue={activeTabConfig.modelId ?? ''}
                  promptValue={activeTabConfig.promptId ?? ''}
                  modelOptions={
                    models.length === 0
                      ? [{ value: '', label: '暂无可用模型', disabled: true }]
                      : models.map((model) => ({ value: model.id, label: model.name }))
                  }
                  promptOptions={
                    rolePromptOptions.length === 0
                      ? [{ value: '', label: '暂无设定提示词', disabled: true }]
                      : rolePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))
                  }
                  onModelChange={onModelChange}
                  onPromptChange={onPromptChange}
                  onModelManage={onModelManage}
                  onPromptManage={onPromptManage}
                  promptDisabled={Boolean(activeTabConfig.promptDisabled)}
                  onPromptContextMenu={onPromptContextMenu}
                />
              </div>
              <div className="relative mt-5 min-h-0 flex-1">
                <button
                  type="button"
                  onClick={onClearAi}
                  disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                  className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1 text-xs font-black text-red-500 hover:text-red-600 disabled:text-red-300"
                >
                  清空
                </button>
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full ${aiOutput.trim() ? 'xy-has-value' : ''}`}
                >
                  <textarea
                    value={aiOutput}
                    onChange={onAiOutputChange}
                    placeholder="AI输出框"
                    className="editor-scrollbar"
                  />
                  <span className="xy-floating-count">
                    <WordCountText value={countTextWords(aiOutput)} />
                  </span>
                </div>
              </div>
              <div className="mt-2 shrink-0">
                <AiInlineInput
                  ref={aiInputRef}
                  value={aiInput}
                  onChange={onAiInputChange}
                  onKeyDown={onAiInputKeyDown}
                  onSend={onSendAi}
                  onStop={onStopAi}
                  sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                  stopDisabled={!isLibraryAiLoading}
                  placeholder="输入对话指令..."
                />
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
