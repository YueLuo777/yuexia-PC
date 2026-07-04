import { useEffect, useState, type CSSProperties } from 'react';

export type WorkbenchFieldSizeKey =
  | 'roleSearch'
  | 'roleCategoryName'
  | 'roleCreateName'
  | 'roleDetailName'
  | 'roleDetailCategory'
  | 'settingName'
  | 'settingModelSelect'
  | 'settingPromptSelect'
  | 'roleModelSelect'
  | 'rolePromptSelect'
  | 'brainstormModelSelect'
  | 'brainstormPromptSelect'
  | 'outlineSummaryModelSelect'
  | 'outlineSummaryPromptSelect'
  | 'detailOutlineModelSelect'
  | 'detailOutlinePromptSelect';

export type WorkbenchFieldSizeSpec = { width: number; height: number; fontSize: number };
export type WorkbenchFieldSizeProp = keyof WorkbenchFieldSizeSpec;

const WORKBENCH_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';

export const WORKBENCH_FIELD_SIZE_DEFAULTS: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> = {
  roleSearch: { width: 260, height: 44, fontSize: 13 },
  roleCategoryName: { width: 260, height: 44, fontSize: 13 },
  roleCreateName: { width: 260, height: 44, fontSize: 13 },
  roleDetailName: { width: 220, height: 44, fontSize: 13 },
  roleDetailCategory: { width: 220, height: 44, fontSize: 13 },
  settingName: { width: 220, height: 56, fontSize: 18 },
  settingModelSelect: { width: 250, height: 44, fontSize: 13 },
  settingPromptSelect: { width: 250, height: 44, fontSize: 13 },
  roleModelSelect: { width: 250, height: 44, fontSize: 13 },
  rolePromptSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormModelSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormPromptSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryModelSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryPromptSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlineModelSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlinePromptSelect: { width: 250, height: 44, fontSize: 13 },
};

export const WORKBENCH_FIELD_SIZE_SETTING_KEYS = (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).filter(
  (key) => key !== 'roleCategoryName' && key !== 'roleCreateName',
);

const WORKBENCH_FIELD_SIZE_LABELS: Partial<Record<WorkbenchFieldSizeKey, string>> = {
  roleSearch: '角色短字段',
  roleCategoryName: '分类名字',
  roleCreateName: '角色名字',
  roleDetailName: '角色名',
  settingName: '设定名',
  settingModelSelect: '设定模型框',
  settingPromptSelect: '设定提示词框',
  roleModelSelect: '角色模型框',
  rolePromptSelect: '角色提示词框',
  brainstormModelSelect: '脑洞模型框',
  brainstormPromptSelect: '脑洞提示词框',
  outlineSummaryModelSelect: '梗概模型框',
  outlineSummaryPromptSelect: '梗概提示词框',
  detailOutlineModelSelect: '章纲模型框',
  detailOutlinePromptSelect: '章纲提示词框',
};

const WORKBENCH_FIELD_SIZE_LIMITS: Record<WorkbenchFieldSizeProp, { min: number; max: number }> = {
  width: { min: 120, max: 520 },
  height: { min: 34, max: 90 },
  fontSize: { min: 11, max: 24 },
};

export function getWorkbenchFieldSizeLabel(key: WorkbenchFieldSizeKey) {
  return WORKBENCH_FIELD_SIZE_LABELS[key] ?? (key === 'roleDetailCategory' ? '分类' : key);
}

export function clampFieldSizeValue(prop: WorkbenchFieldSizeProp, value: number) {
  const limit = WORKBENCH_FIELD_SIZE_LIMITS[prop];
  if (!Number.isFinite(value)) return WORKBENCH_FIELD_SIZE_DEFAULTS.settingName[prop];
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

export function normalizeFieldSizeSpec(key: WorkbenchFieldSizeKey, value?: Partial<WorkbenchFieldSizeSpec>): WorkbenchFieldSizeSpec {
  const base = WORKBENCH_FIELD_SIZE_DEFAULTS[key];
  return {
    width: clampFieldSizeValue('width', Number(value?.width ?? base.width)),
    height: clampFieldSizeValue('height', Number(value?.height ?? base.height)),
    fontSize: clampFieldSizeValue('fontSize', Number(value?.fontSize ?? base.fontSize)),
  };
}

export function readWorkbenchFieldSizeSpecs(): Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> {
  try {
    const parsed = JSON.parse(localStorage.getItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY) || '{}') as Partial<Record<WorkbenchFieldSizeKey, Partial<WorkbenchFieldSizeSpec>>>;
    return (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).reduce((acc, key) => {
      acc[key] = normalizeFieldSizeSpec(key, parsed[key]);
      return acc;
    }, {} as Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>);
  } catch {
    return { ...WORKBENCH_FIELD_SIZE_DEFAULTS };
  }
}

export function writeWorkbenchFieldSizeSpecs(specs: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>) {
  localStorage.setItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY, JSON.stringify(specs));
}

export function getWorkbenchFieldSizeStyle(spec: WorkbenchFieldSizeSpec): CSSProperties {
  return {
    width: spec.width,
    minWidth: WORKBENCH_FIELD_SIZE_LIMITS.width.min,
    maxWidth: '100%',
    '--xy-field-width': `${spec.width}px`,
    '--xy-field-height': `${spec.height}px`,
    '--xy-field-font-size': `${spec.fontSize}px`,
  } as CSSProperties;
}

export function FieldSizeNumberInput({
  label,
  prop,
  value,
  onChange,
}: {
  label: string;
  prop: WorkbenchFieldSizeProp;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const commitValue = (nextValue: string) => {
    if (!nextValue.trim()) {
      setDraftValue(String(value));
      return;
    }
    const normalizedValue = clampFieldSizeValue(prop, Number(nextValue));
    setDraftValue(String(normalizedValue));
    onChange(normalizedValue);
  };

  return (
    <label className="block text-xs font-black text-slate-500">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^\d]/g, '');
          setDraftValue(nextValue);
        }}
        onBlur={() => commitValue(draftValue)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitValue(draftValue);
            event.currentTarget.blur();
          }
        }}
        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-800 outline-none focus:border-[#08AACE]"
      />
    </label>
  );
}
