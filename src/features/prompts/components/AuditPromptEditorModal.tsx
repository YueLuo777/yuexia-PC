import { useEffect, useState } from 'react';

import { AUDIT_PROMPT_CATEGORY, normalizePromptRecord } from '@/features/prompts/hooks/usePrompts';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

import { AuditPromptEditorFields, type AuditPromptEditorDraft } from './AuditPromptEditorFields';

type AuditPromptEditorModalProps = {
  isOpen: boolean;
  title: string;
  categories: string[];
  initial?: PromptItem | null;
  onClose: () => void;
  onSave: (draft: AuditPromptEditorDraft) => void;
};

function createEmptyAuditDraft(): AuditPromptEditorDraft {
  return {
    name: '',
    description: '',
    content: '',
    textAuditContent: '',
    textAuditEnabled: true,
    category: AUDIT_PROMPT_CATEGORY,
    subCategory: undefined,
  };
}

export function AuditPromptEditorModal({
  isOpen,
  title,
  categories,
  initial,
  onClose,
  onSave,
}: AuditPromptEditorModalProps) {
  const [draft, setDraft] = useState<AuditPromptEditorDraft>(createEmptyAuditDraft);

  useEffect(() => {
    if (!isOpen) return;
    const normalizedInitial = initial ? normalizePromptRecord(initial) : null;
    setDraft({
      name: normalizedInitial?.name ?? '',
      description: normalizedInitial?.description ?? '',
      content: normalizedInitial?.content ?? '',
      textAuditContent: normalizedInitial?.textAuditContent ?? '',
      textAuditEnabled: normalizedInitial?.textAuditEnabled ?? true,
      category: AUDIT_PROMPT_CATEGORY,
      subCategory: undefined,
    });
  }, [initial, isOpen]);

  if (!isOpen) return null;
  const portalTarget = document.querySelector('.writer-assistant-theme') ?? document.body;

  return (
    <AppModalShell
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[1280px] max-w-[calc(100vw-48px)]"
      heightClass="h-[calc(90dvh-43px)] max-h-[calc(100dvh-48px)]"
      storageId="audit_prompt_editor"
      zIndexClass="z-[290]"
      panelClassName="xy-audit-prompt-editor-modal"
      portalTarget={portalTarget}
    >
        <AuditPromptEditorFields categories={categories} draft={draft} setDraft={setDraft} />

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
          {draft.textAuditEnabled ? (
            <span className="text-[16px] font-black leading-7 tracking-normal text-[#078fb0]">
              文本审核已启用：剧情审核全部通过后发送给AI。
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="flex items-center gap-2">
            <ActionButton onClick={onClose} variant="secondary">
              取消
            </ActionButton>
            <ActionButton
              onClick={() => onSave(draft)}
              disabled={!draft.name.trim() || (!draft.content.trim() && !draft.textAuditContent.trim())}
            >
              {initial ? '保存修改' : '创建提示词'}
            </ActionButton>
          </div>
        </div>
    </AppModalShell>
  );
}
