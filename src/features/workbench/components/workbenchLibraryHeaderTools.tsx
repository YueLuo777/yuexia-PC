import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';

import {
  BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
  BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
  BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
  BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
  DETAIL_OUTLINE_MAX_FONT_SIZE,
  DETAIL_OUTLINE_MIN_FONT_SIZE,
  ROLE_TEXT_MAX_FONT_SIZE,
  ROLE_TEXT_MIN_FONT_SIZE,
  SETTING_PREVIEW_MAX_FONT_SIZE,
  SETTING_PREVIEW_MIN_FONT_SIZE,
} from './workbenchBrainstormState';
import type { LibraryFontTarget } from './workbenchLibraryDataState';
import {
  BRAINSTORM_TAB,
  DETAIL_OUTLINE_TAB,
  ROLE_TAB,
  SETTING_TAB,
  getWorkbenchTabDisplayLabel,
} from './workbenchLibraryTabs';

type FontChangeHandler = (value: number) => void;

type WorkbenchLibraryFontConfig = {
  value: number;
  min: number;
  max: number;
  onChange: FontChangeHandler;
  ariaLabel: string;
};

export type WorkbenchLibraryActiveFontConfigOptions = {
  activeTab: string;
  activeLibraryFontTarget: LibraryFontTarget;
  outlineSettingScope: string;
  plotPointStandalone: boolean;
  brainstormPreviewFontSize: number;
  brainstormOutputFontSize: number;
  settingPreviewFontSize: number;
  roleTextFontSize: number;
  detailOutlineFontSize: number;
  setBrainstormPreviewFontSize: FontChangeHandler;
  setBrainstormOutputFontSize: FontChangeHandler;
  setSettingPreviewFontSize: FontChangeHandler;
  setRoleTextFontSize: FontChangeHandler;
  setDetailOutlineFontSize: FontChangeHandler;
};

export function getWorkbenchLibraryActiveFontConfig({
  activeTab,
  activeLibraryFontTarget,
  outlineSettingScope,
  plotPointStandalone,
  brainstormPreviewFontSize,
  brainstormOutputFontSize,
  settingPreviewFontSize,
  roleTextFontSize,
  detailOutlineFontSize,
  setBrainstormPreviewFontSize,
  setBrainstormOutputFontSize,
  setSettingPreviewFontSize,
  setRoleTextFontSize,
  setDetailOutlineFontSize,
}: WorkbenchLibraryActiveFontConfigOptions): WorkbenchLibraryFontConfig | null {
  if (activeTab === BRAINSTORM_TAB) {
    if (activeLibraryFontTarget === 'brainstormPreview') {
      return {
        value: brainstormPreviewFontSize,
        min: BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
        max: BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
        onChange: setBrainstormPreviewFontSize,
        ariaLabel: '脑洞预览字号',
      };
    }
    return {
      value: brainstormOutputFontSize,
      min: BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
      max: BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
      onChange: setBrainstormOutputFontSize,
      ariaLabel: '脑洞输出字号',
    };
  }

  if (activeTab === SETTING_TAB) {
    if (outlineSettingScope === 'character') {
      return {
        value: roleTextFontSize,
        min: ROLE_TEXT_MIN_FONT_SIZE,
        max: ROLE_TEXT_MAX_FONT_SIZE,
        onChange: setRoleTextFontSize,
        ariaLabel: '人物设定字号',
      };
    }
    return {
      value: settingPreviewFontSize,
      min: SETTING_PREVIEW_MIN_FONT_SIZE,
      max: SETTING_PREVIEW_MAX_FONT_SIZE,
      onChange: setSettingPreviewFontSize,
      ariaLabel: '设定预览字号',
    };
  }

  if (activeTab === ROLE_TAB) {
    return {
      value: roleTextFontSize,
      min: ROLE_TEXT_MIN_FONT_SIZE,
      max: ROLE_TEXT_MAX_FONT_SIZE,
      onChange: setRoleTextFontSize,
      ariaLabel: '人物设定字号',
    };
  }

  if (activeTab === DETAIL_OUTLINE_TAB && !plotPointStandalone) {
    return {
      value: detailOutlineFontSize,
      min: DETAIL_OUTLINE_MIN_FONT_SIZE,
      max: DETAIL_OUTLINE_MAX_FONT_SIZE,
      onChange: setDetailOutlineFontSize,
      ariaLabel: '章纲字号',
    };
  }

  return null;
}

export function WorkbenchLibraryFontSizeTool({ config }: { config: WorkbenchLibraryFontConfig | null }) {
  if (!config) return null;
  return (
    <FontSizeStepper
      value={config.value}
      min={config.min}
      max={config.max}
      onChange={config.onChange}
      ariaLabel={config.ariaLabel}
      className="shrink-0"
    />
  );
}

export function WorkbenchLibraryHeaderFontSizeTool({
  activeTab,
  brainstormStreamEnabled,
  fontSizeTool,
  onBrainstormStreamEnabledChange,
}: {
  activeTab: string;
  brainstormStreamEnabled: boolean;
  fontSizeTool: ReactNode;
  onBrainstormStreamEnabledChange: (enabled: boolean) => void;
}) {
  if (!fontSizeTool) return null;
  if (activeTab !== BRAINSTORM_TAB) return <>{fontSizeTool}</>;
  return (
    <div className="inline-flex shrink-0 items-center gap-2">
      <label
        className="xy-header-stream-tool"
        title={brainstormStreamEnabled ? '关闭流式输出' : '开启流式输出'}
        aria-label={brainstormStreamEnabled ? '关闭流式输出' : '开启流式输出'}
      >
        <span className="xy-stream-toggle-text">流式输出</span>
        <input
          type="checkbox"
          checked={brainstormStreamEnabled}
          onChange={(event) => onBrainstormStreamEnabledChange(event.target.checked)}
        />
        <span className="xy-stream-toggle-track">
          <span className="xy-stream-toggle-thumb" />
        </span>
      </label>
      {fontSizeTool}
    </div>
  );
}

export function WorkbenchLibraryFieldSizeButton({
  visible,
  tabLabel,
  onClick,
}: {
  visible: boolean;
  tabLabel: string;
  onClick: () => void;
}) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]"
      aria-label={`${tabLabel}设置`}
    >
      <Settings className="h-4 w-4" />
      设置
    </button>
  );
}

export function WorkbenchLibraryAiLogButton({
  visible,
  scope,
  className,
  onOpen,
}: {
  visible: boolean;
  scope: 'library' | 'outline';
  className: string;
  onOpen: (scope: 'library' | 'outline') => void;
}) {
  if (!visible) return null;
  return (
    <button type="button" onClick={() => onOpen(scope)} className={className}>
      日志
    </button>
  );
}

export function WorkbenchLibraryTopTabs({
  isSettingLibraryPanel,
  normalizedTabs,
  activeTab,
  onTabChange,
}: {
  isSettingLibraryPanel: boolean;
  normalizedTabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  if (isSettingLibraryPanel) return null;
  return (
    <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2">
      {normalizedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === tab
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          {getWorkbenchTabDisplayLabel(tab)}
        </button>
      ))}
    </div>
  );
}
