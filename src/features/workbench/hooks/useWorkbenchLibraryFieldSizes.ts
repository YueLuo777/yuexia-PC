import { useEffect, useRef, useState, type CSSProperties } from 'react';

import {
  WORKBENCH_FIELD_SIZE_DEFAULTS,
  WORKBENCH_FIELD_SIZE_SETTING_KEYS,
  clampFieldSizeValue,
  getWorkbenchFieldSizeStyle,
  readWorkbenchFieldSizeSpecs,
  writeWorkbenchFieldSizeSpecs,
  type WorkbenchFieldSizeKey,
  type WorkbenchFieldSizeProp,
  type WorkbenchFieldSizeSpec,
} from '../components/workbenchFieldSizeSettings';
import {
  BRAINSTORM_TAB,
  ROLE_TAB,
  WORKBENCH_FIELD_SIZE_KEYS_BY_TAB,
  getWorkbenchFieldSizeTabLabel,
} from '../components/workbenchLibraryTabs';
import { useWorkbenchLibraryVisibility } from '../components/workbenchLibraryVisibility';

interface UseWorkbenchLibraryFieldSizesOptions {
  activeTab: string;
  fieldSizeOpenSignal: number;
  showInlineFieldSizeButton: boolean;
}

export function useWorkbenchLibraryFieldSizes({
  activeTab,
  fieldSizeOpenSignal,
  showInlineFieldSizeButton,
}: UseWorkbenchLibraryFieldSizesOptions) {
  const { isActive } = useWorkbenchLibraryVisibility();
  const [isFieldSizeSettingsOpen, setIsFieldSizeSettingsOpen] = useState(false);
  const lastFieldSizeOpenSignalRef = useRef(fieldSizeOpenSignal);
  const wasActiveRef = useRef(isActive);
  const [fieldSizeSpecs, setFieldSizeSpecs] = useState<Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>>(() =>
    readWorkbenchFieldSizeSpecs(),
  );
  const visibleFieldSizeKeys = WORKBENCH_FIELD_SIZE_KEYS_BY_TAB[activeTab] ?? WORKBENCH_FIELD_SIZE_SETTING_KEYS;
  const fieldSizeTabLabel = getWorkbenchFieldSizeTabLabel(activeTab);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (!isActive) {
      lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
      setIsFieldSizeSettingsOpen(false);
      return;
    }
    if (!wasActive) {
      lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
      return;
    }
    if (fieldSizeOpenSignal <= 0 || fieldSizeOpenSignal === lastFieldSizeOpenSignalRef.current) return;
    lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
    setIsFieldSizeSettingsOpen(true);
  }, [fieldSizeOpenSignal, isActive]);

  const updateFieldSizeSpec = (key: WorkbenchFieldSizeKey, prop: WorkbenchFieldSizeProp, value: number) => {
    setFieldSizeSpecs((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [prop]: clampFieldSizeValue(prop, value) } };
      writeWorkbenchFieldSizeSpecs(next);
      return next;
    });
  };
  const resetFieldSizeSpecs = () => {
    const defaults = readWorkbenchFieldSizeSpecs();
    visibleFieldSizeKeys.forEach((key) => {
      defaults[key] = { ...WORKBENCH_FIELD_SIZE_DEFAULTS[key] };
    });
    writeWorkbenchFieldSizeSpecs(defaults);
    setFieldSizeSpecs(defaults);
  };
  const getFieldSizeStyle = (key: WorkbenchFieldSizeKey) =>
    getWorkbenchFieldSizeStyle(fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key]);
  const getEmbeddedConfigSelectStyle = (style: CSSProperties): CSSProperties =>
    showInlineFieldSizeButton
      ? style
      : ({ ...style, width: '100%', maxWidth: '100%', '--xy-field-width': '100%' } as CSSProperties);
  const getConfigFieldSizeKey = (tab: string, kind: 'model' | 'prompt'): WorkbenchFieldSizeKey => {
    if (tab === ROLE_TAB) return kind === 'model' ? 'roleModelSelect' : 'rolePromptSelect';
    if (tab === BRAINSTORM_TAB) return kind === 'model' ? 'brainstormModelSelect' : 'brainstormPromptSelect';
    return kind === 'model' ? 'settingModelSelect' : 'settingPromptSelect';
  };
  const getConfigFieldSizeStyle = (tab: string, kind: 'model' | 'prompt'): CSSProperties =>
    getFieldSizeStyle(getConfigFieldSizeKey(tab, kind));

  return {
    isFieldSizeSettingsOpen,
    setIsFieldSizeSettingsOpen,
    fieldSizeSpecs,
    visibleFieldSizeKeys,
    fieldSizeTabLabel,
    updateFieldSizeSpec,
    resetFieldSizeSpecs,
    getFieldSizeStyle,
    getEmbeddedConfigSelectStyle,
    getConfigFieldSizeStyle,
  };
}
