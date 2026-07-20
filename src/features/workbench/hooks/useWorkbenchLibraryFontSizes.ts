import type { LibraryTabConfig } from '../components/workbenchLibraryDataState';
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
} from '../components/workbenchBrainstormState';

interface UseWorkbenchLibraryFontSizesOptions {
  activeTabConfig: LibraryTabConfig;
  updateActiveTabConfig: (patch: Partial<LibraryTabConfig>) => void;
}

const clampFontSize = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useWorkbenchLibraryFontSizes({
  activeTabConfig,
  updateActiveTabConfig,
}: UseWorkbenchLibraryFontSizesOptions) {
  const brainstormPreviewFontSize = clampFontSize(
    activeTabConfig.brainstormPreviewFontSize ?? 14,
    BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
    BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
  );
  const brainstormOutputFontSize = clampFontSize(
    activeTabConfig.brainstormOutputFontSize ?? 14,
    BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
    BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
  );
  const settingPreviewFontSize = clampFontSize(
    activeTabConfig.settingPreviewFontSize ?? 14,
    SETTING_PREVIEW_MIN_FONT_SIZE,
    SETTING_PREVIEW_MAX_FONT_SIZE,
  );
  const roleTextFontSize = clampFontSize(
    activeTabConfig.roleTextFontSize ?? 14,
    ROLE_TEXT_MIN_FONT_SIZE,
    ROLE_TEXT_MAX_FONT_SIZE,
  );
  const detailOutlineFontSize = clampFontSize(
    activeTabConfig.detailOutlineFontSize ?? 14,
    DETAIL_OUTLINE_MIN_FONT_SIZE,
    DETAIL_OUTLINE_MAX_FONT_SIZE,
  );

  return {
    brainstormPreviewFontSize,
    brainstormOutputFontSize,
    settingPreviewFontSize,
    roleTextFontSize,
    detailOutlineFontSize,
    setBrainstormPreviewFontSize: (value: number) =>
      updateActiveTabConfig({
        brainstormPreviewFontSize: clampFontSize(
          value,
          BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
          BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
        ),
      }),
    setBrainstormOutputFontSize: (value: number) =>
      updateActiveTabConfig({
        brainstormOutputFontSize: clampFontSize(
          value,
          BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
          BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
        ),
      }),
    setSettingPreviewFontSize: (value: number) =>
      updateActiveTabConfig({
        settingPreviewFontSize: clampFontSize(value, SETTING_PREVIEW_MIN_FONT_SIZE, SETTING_PREVIEW_MAX_FONT_SIZE),
      }),
    setRoleTextFontSize: (value: number) =>
      updateActiveTabConfig({
        roleTextFontSize: clampFontSize(value, ROLE_TEXT_MIN_FONT_SIZE, ROLE_TEXT_MAX_FONT_SIZE),
      }),
    setDetailOutlineFontSize: (value: number) =>
      updateActiveTabConfig({
        detailOutlineFontSize: clampFontSize(value, DETAIL_OUTLINE_MIN_FONT_SIZE, DETAIL_OUTLINE_MAX_FONT_SIZE),
      }),
  };
}
