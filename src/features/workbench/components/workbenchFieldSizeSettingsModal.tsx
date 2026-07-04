import { X } from 'lucide-react';
import type { useDraggableModal } from '@/shared/hooks/useDraggableModal';
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
  draggable,
  onClose,
  onReset,
  onChange,
}: FieldSizeSettingsModalProps) {
  return (
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <section
        data-draggable-managed="true"
        onClick={(event) => event.stopPropagation()}
        className="modal-sharp flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex shrink-0 cursor-move items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"
          style={draggable.dragHandleProps.style}
        >
          <div>
            <h3 className="text-base font-black text-slate-900">{tabLabel}设置</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">只显示当前页面可调字段，调整后会自动保存。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-no-modal-drag="true"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="关闭设置"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {visibleKeys.map((key) => {
              const spec = specs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key];
              return (
                <article
                  key={key}
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[130px_repeat(3,minmax(0,1fr))_220px] lg:items-center"
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
      </section>
    </div>
  );
}
