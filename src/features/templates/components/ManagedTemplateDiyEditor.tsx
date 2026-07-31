import { TemplateDiyCascadeEditor } from '@/features/templates/components/TemplateDiyCascadeEditor';
import { useTemplateDiyController } from '@/features/templates/hooks/useTemplateDiyController';
import type { TemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';
import type { ReactNode } from 'react';

export function ManagedTemplateDiyEditor({
  initialStructure,
  onChange,
  saveName,
  onSaveNameChange,
  onSaveTemplate,
  footerActions,
  readOnly = false,
}: {
  initialStructure: TemplateStructure;
  onChange: (structure: TemplateStructure) => void;
  saveName: string;
  onSaveNameChange: (name: string) => void;
  onSaveTemplate: () => void;
  footerActions?: ReactNode;
  readOnly?: boolean;
}) {
  const controller = useTemplateDiyController({ initialStructure, onChange });
  const { summary } = controller;
  return (
    <section
      className="flex min-h-0 flex-col overflow-hidden bg-[#F5F8FA]"
      aria-label="逐级DIY模板编辑器"
      data-template-diy-cascade-editor="true"
      data-domain-count={summary.domainCount}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
        <div className="min-w-0 truncate text-sm font-bold text-slate-500">
          当前路径：
          <span className="text-[#078FAB]">
            {controller.domain?.title ?? '未选择'} ＞ {controller.group?.title ?? '未选择'} ＞{' '}
            {controller.entry?.title ?? '未选择'}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            {readOnly ? '内置模板固定，只能查看结构' : '删除默认解锁；生成步骤由系统按当前结构自动安排'}
          </span>
        </div>
      </div>

      <TemplateDiyCascadeEditor controller={controller} readOnly={readOnly} />

      <footer
        className={`shrink-0 border-t border-slate-200 bg-white ${
          footerActions ? 'grid min-h-[96px] grid-cols-[minmax(0,1fr)_auto]' : 'flex h-[72px] items-center justify-between gap-4 px-4'
        }`}
        data-template-editor-footer="true"
      >
        {readOnly ? (
          <div className={footerActions ? 'min-w-0 px-4 py-3' : 'min-w-0'}>
            <div className="text-sm font-black text-slate-700">
              当前结构：{summary.domainCount} 个一级 · {summary.groupCount} 个二级 · {summary.entryCount} 个三级 ·{' '}
              {summary.fieldCount} 个四级
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-400">
              内置模板不支持修改或保存；需要扩展时，请到“我的模板”新建模板并选择此模板作为基础。
            </div>
          </div>
        ) : footerActions ? (
          <div className="grid min-w-0 grid-rows-[auto_auto] gap-2 px-4 py-3">
            <div className="min-w-0" data-template-summary-row="true">
              <div className="text-sm font-black text-slate-700">
                当前结构：{summary.domainCount} 个一级 · {summary.groupCount} 个二级 · {summary.entryCount} 个三级 ·{' '}
                {summary.fieldCount} 个四级
              </div>
            </div>
            <div className="flex min-w-0 items-end justify-between gap-4" data-template-save-row="true">
              <div className="min-w-0 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
                {controller.feedback}
              </div>
              <SaveTemplateActions
                controller={controller}
                onReset={controller.resetStructure}
                saveName={saveName}
                onSaveNameChange={onSaveNameChange}
                onSaveTemplate={onSaveTemplate}
                canSave
              />
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-700">
                当前结构：{summary.domainCount} 个一级 · {summary.groupCount} 个二级 · {summary.entryCount} 个三级 ·{' '}
                {summary.fieldCount} 个四级
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-[#078FAB]" aria-live="polite">
                {controller.feedback}
              </div>
            </div>
            <SaveTemplateActions
              controller={controller}
              onReset={controller.resetStructure}
              saveName={saveName}
              onSaveNameChange={onSaveNameChange}
              onSaveTemplate={onSaveTemplate}
              canSave
            />
          </>
        )}
        {footerActions ? (
          <div className="flex items-end gap-3 border-l border-slate-200 px-4 py-3" data-template-confirm-actions="true">
            {footerActions}
          </div>
        ) : null}
      </footer>
    </section>
  );
}

function SaveTemplateActions({
  controller,
  onReset,
  saveName,
  onSaveNameChange,
  onSaveTemplate,
  canSave,
}: {
  controller: ReturnType<typeof useTemplateDiyController>;
  onReset: () => void;
  saveName: string;
  onSaveNameChange: (name: string) => void;
  onSaveTemplate: () => void;
  canSave: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2" role="region" aria-label="保存模板">
      <button
        type="button"
        onClick={onReset}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-500 hover:border-[#9DDFEA] hover:text-[#078FAB]"
      >
        撤销本次修改
      </button>
      <input
        value={saveName}
        aria-label="保存模板名称"
        onChange={(event) => onSaveNameChange(event.target.value)}
        className="h-10 w-52 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
      />
      <button
        type="button"
        disabled={!saveName.trim() || !canSave}
        onClick={onSaveTemplate}
        className="h-10 rounded-md bg-[#08AACE] px-4 text-sm font-black text-white hover:bg-[#0798B8] disabled:bg-slate-200 disabled:text-slate-400"
      >
        保存到我的模板
      </button>
    </div>
  );
}
