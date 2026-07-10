export const APP_EVENTS = {
  coversUpdated: 'xinyuexia_cover_library_updated',
  highFrequencyWordsUpdated: 'xinyuexia_high_freq_updated',
  materialsUpdated: 'xinyuexia_materials_updated',
  modelsUpdated: 'xinyuexia_models_updated',
  promptsUpdated: 'xinyuexia_prompts_updated',
  shortcutsUpdated: 'xinyuexia_shortcuts_updated',
  shortcutAction: 'xinyuexia_shortcut_action',
  smartFormatUpdated: 'xinyuexia_smart_format_updated',
  workspaceNovelSelected: 'xinyuexia:novel-selected',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export function emitAppEvent(eventName: AppEventName) {
  window.dispatchEvent(new CustomEvent(eventName));
}
