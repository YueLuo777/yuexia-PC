import type { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { WorkbenchNavigationWidthToggle } from './WorkbenchNavigationWidthToggle';
import { WorkbenchModal } from './WorkbenchModal';
import {
  FieldSizeNumberInput,
  WORKBENCH_FIELD_SIZE_DEFAULTS,
  getWorkbenchFieldSizeLabel,
  getWorkbenchFieldSizeStyle,
  type WorkbenchFieldSizeKey,
  type WorkbenchFieldSizeProp,
  type WorkbenchFieldSizeSpec,
} from './workbenchFieldSizeSettings';

type FieldSizeSettingsModalProps = {
  tabLabel: string;
  visibleKeys: WorkbenchFieldSizeKey[];
  specs: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>;
  draggable: Pick<ReturnType<typeof useDraggableModal>, 'style' | 'dragHandleProps'>;
  onClose: () => void;
  onReset: () => void;
  onChange: (key: WorkbenchFieldSizeKey, prop: WorkbenchFieldSizeProp, value: number) => void;
};

export function FieldSizeSettingsModal({
  tabLabel,
  visibleKeys,
  specs,
  draggable: _draggable,
  onClose,
  onReset,
  onChange,
}: FieldSizeSettingsModalProps) {
  return (
    <WorkbenchModal
      title={`${tabLabel}设置`}
      subtitle="只显示当前页面可调字段，调整后会自动保存。"
      isOpen
      onClose={onClose}
      widthClass="w-[min(980px,calc(100vw-4rem))]"
      heightClass="h-auto max-h-[82vh]"
      storageId="workbench_field_size_settings_compact_v2"
      zIndexClass="z-[280]"
      defaultGeometry={{ x: 0, y: 0, width: 980, height: 560 }}
    >
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-3">
            <WorkbenchNavigationWidthToggle />
          </div>
          <div className="grid gap-3">
            {visibleKeys.map((key) => {
              const spec = specs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key];
              return (
                <article
                  key={key}
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[112px_repeat(3,minmax(90px,1fr))_188px] lg:items-center"
                >
                  <div className="text-sm font-black text-slate-900">{getWorkbenchFieldSizeLabel(key)}</div>
                  <FieldSizeNumberInput
                    label="宽度"
                    prop="width"
                    value={spec.width}
                    onChange={(value) => onChange(key, 'width', value)}
                  />
                  <FieldSizeNumberInput
                    label="高度"
                    prop="height"
                    value={spec.height}
                    onChange={(value) => onChange(key, 'height', value)}
                  />
                  <FieldSizeNumberInput
                    label="字号"
                    prop="fontSize"
                    value={spec.fontSize}
                    onChange={(value) => onChange(key, 'fontSize', value)}
                  />
                  <div
                    className="xy-floating-field xy-floating-outline-fixed xy-floating-custom-field-size xy-has-value"
                    style={getWorkbenchFieldSizeStyle(spec)}
                  >
                    <input readOnly value={getWorkbenchFieldSizeLabel(key)} />
                    <label>{getWorkbenchFieldSizeLabel(key)}</label>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <footer className="flex shrink-0 justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
    </WorkbenchModal>
  );
}
