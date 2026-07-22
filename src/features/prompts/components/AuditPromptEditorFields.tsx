import type { Dispatch, SetStateAction } from 'react';

export type AuditPromptEditorDraft = {
  name: string;
  description: string;
  content: string;
  textAuditContent: string;
  textAuditEnabled: boolean;
  category: string;
  subCategory: undefined;
};

const AUDIT_CATEGORY_ROWS = [
  ['脑洞', '设定', '章纲', '正文'],
  ['审核', '点评', '润色', '状态', '梗概'],
  ['未分类'],
] as const;

function getAuditCategoryRows(categories: string[]) {
  const available = new Set(categories);
  const preferred = new Set<string>(AUDIT_CATEGORY_ROWS.flat());
  const custom = categories.filter((category) => !preferred.has(category));
  return AUDIT_CATEGORY_ROWS.map((row, index) => [
    ...row.filter((category) => available.has(category)),
    ...(index === AUDIT_CATEGORY_ROWS.length - 1 ? custom : []),
  ]).filter((row) => row.length > 0);
}

function AuditMetaField({
  label,
  value,
  onChange,
  multiline = false,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`xy-audit-meta-field min-w-0 bg-white ${multiline ? 'xy-audit-meta-field-multiline' : ''} ${className}`}
    >
      <span aria-hidden="true" className="xy-workbench-name-field-caption">
        {label}
      </span>
      {multiline ? (
        <textarea
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder=""
          className="xy-audit-meta-field-textarea"
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          className="xy-workbench-name-field-input"
        />
      )}
    </div>
  );
}

function AuditPromptContentField({
  label,
  value,
  disabled = false,
  onChange,
  onToggleDisabled,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onToggleDisabled?: () => void;
}) {
  return (
    <div
      className={`xy-audit-prompt-content-field relative min-h-0 rounded-2xl border-2 px-4 pb-4 transition-colors ${
        disabled
          ? 'border-dashed border-slate-300 bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_12px,#f1f5f9_12px,#f1f5f9_24px)]'
          : 'border-slate-800 bg-white'
      }`}
    >
      <span
        className={`xy-border-embedded-transparent-backplate absolute -top-px left-5 z-10 flex h-5 -translate-y-1/2 items-center text-sm font-black leading-none tracking-normal ${
          disabled ? 'text-slate-400 [--xy-floating-backplate-bg:#f8fafc]' : 'text-slate-800'
        }`}
      >
        {label}
      </span>
      {onToggleDisabled ? (
        <button
          type="button"
          onClick={onToggleDisabled}
          className={`xy-border-embedded-transparent-backplate absolute -top-px right-5 z-10 flex h-5 -translate-y-1/2 items-center font-sans text-sm font-black leading-none tracking-normal ${
            disabled
              ? 'text-[#078fb0] hover:text-[#08AACE] [--xy-floating-backplate-bg:#f8fafc]'
              : 'text-red-500 hover:text-red-600'
          }`}
        >
          {disabled ? '启用' : '禁用'}
        </button>
      ) : null}
      <textarea
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="xy-audit-prompt-content-editor h-full min-h-[230px] w-full resize-none border-0 bg-transparent py-2 pl-0 pr-0 font-sans text-[16px] font-medium leading-7 tracking-normal text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
      />
      {disabled ? (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-8 text-center">
          <span className="rounded-xl border border-red-200 bg-white/90 px-5 py-3 text-lg font-black leading-7 tracking-normal text-red-600 shadow-sm">
            文本审核已禁用：此提示词不会发送给AI。
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function AuditPromptEditorFields({
  categories,
  draft,
  setDraft,
}: {
  categories: string[];
  draft: AuditPromptEditorDraft;
  setDraft: Dispatch<SetStateAction<AuditPromptEditorDraft>>;
}) {
  const categoryRows = getAuditCategoryRows(categories);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 py-4">
      <div className="grid min-h-[216px] shrink-0 grid-cols-2 gap-5">
        <section className="flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <AuditMetaField
            label="提示词名称"
            value={draft.name}
            onChange={(name) => setDraft((previous) => ({ ...previous, name }))}
            className="w-[220px] max-w-full"
          />
          <AuditMetaField
            label="提示词说明"
            value={draft.description}
            onChange={(description) => setDraft((previous) => ({ ...previous, description }))}
            multiline
            className="min-h-[100px] flex-1"
          />
        </section>

        <section className="h-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <span className="mb-3 block text-sm font-black tracking-normal text-slate-700">分类</span>
          <div className="flex flex-col items-start gap-2">
            {categoryRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2">
                {row.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setDraft((previous) => ({ ...previous, category }))}
                    className={`h-9 rounded-lg border px-3.5 text-sm font-bold tracking-normal transition-colors ${
                      draft.category === category
                        ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-5">
        <AuditPromptContentField
          label="剧情审核提示词"
          value={draft.content}
          onChange={(content) => setDraft((previous) => ({ ...previous, content }))}
        />
        <AuditPromptContentField
          label="文本审核提示词"
          value={draft.textAuditContent}
          disabled={!draft.textAuditEnabled}
          onChange={(textAuditContent) => setDraft((previous) => ({ ...previous, textAuditContent }))}
          onToggleDisabled={() =>
            setDraft((previous) => ({ ...previous, textAuditEnabled: !previous.textAuditEnabled }))
          }
        />
      </div>
    </div>
  );
}
