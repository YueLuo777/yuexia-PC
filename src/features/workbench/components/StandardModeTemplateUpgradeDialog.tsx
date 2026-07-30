import { useEffect, useMemo, useState } from 'react';

import type { StandardSettingTemplateState } from '@/features/workbench/model/standardModeSettingModel';
import {
  getStandardTemplateUpgradeOptions,
  type StandardTemplateUpgradeOption,
} from '@/features/workbench/model/standardModeTemplateUpgrade';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

type StandardModeTemplateUpgradeDialogProps = {
  isOpen: boolean;
  template: StandardSettingTemplateState;
  onClose: () => void;
  onConfirm: (option: StandardTemplateUpgradeOption) => void;
};

export function StandardModeTemplateUpgradeDialog({
  isOpen,
  template,
  onClose,
  onConfirm,
}: StandardModeTemplateUpgradeDialogProps) {
  const options = useMemo(
    () => getStandardTemplateUpgradeOptions(template.templateId, template.structure),
    [template],
  );
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? '');

  useEffect(() => {
    if (isOpen) setSelectedId(options[0]?.id ?? '');
  }, [isOpen, options]);

  const selected = options.find((option) => option.id === selectedId) ?? options[0] ?? null;

  return (
    <AppModalShell
      title="升级设定模板"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[560px]"
      heightClass="h-auto"
      storageId="standard_setting_template_upgrade"
      zIndexClass="z-[300]"
      contentClassName="flex min-h-0 flex-col"
      centerOnOpen
    >
      <div className="px-6 py-5">
        <div className="rounded-md border border-cyan-200 bg-[#F1FBFD] px-4 py-3">
          <div className="text-xs font-bold text-[#078FAB]">当前模板</div>
          <div className="mt-1 text-sm font-black text-slate-800">{template.templateName}</div>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            升级会保留已填写和已生成的内容，只添加新版本缺少的设定字段。
          </p>
        </div>

        <div className="mt-4 space-y-2" role="radiogroup" aria-label="选择升级版本">
          {options.map((option) => {
            const selectedOption = option.id === selected?.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selectedOption}
                aria-label={`升级到${option.name}`}
                onClick={() => setSelectedId(option.id)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  selectedOption
                    ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
                    : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
                }`}
              >
                <span className="flex items-center justify-between gap-4">
                  <strong className="text-sm text-slate-800">{option.name}</strong>
                  <span className="shrink-0 text-xs font-black text-[#078FAB]">
                    新增 {option.addedFieldCount} 个字段
                  </span>
                </span>
                <span className="mt-1.5 block text-xs font-semibold leading-5 text-slate-500">
                  升级后共 {option.targetFieldCount} 个内置字段。{option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <ActionButton variant="secondary" onClick={onClose}>取消</ActionButton>
        <ActionButton
          variant="primary"
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          确认升级
        </ActionButton>
      </footer>
    </AppModalShell>
  );
}
