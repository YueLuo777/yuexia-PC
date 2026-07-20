import { useState } from 'react';

import {
  getReplaceBodyWordCount,
  readReplaceBodyWarningThreshold,
  shouldWarnBeforeReplacingBody,
} from '@/features/workbench/model/workbenchReplaceBodyWarning';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

import { applyFormat, getStoredFormatSettings } from './EditorToolModals';
import { stripAiThinkingBlock } from './workbenchAiPanelSupport';

type PendingReplacement = {
  content: string;
  wordCount: number;
  threshold: number;
};

type WorkbenchReplaceBodyButtonProps = {
  output: string;
  onReplaceContent: (content: string) => void;
  onReplaced: () => void;
};

export function WorkbenchReplaceBodyButton({ output, onReplaceContent, onReplaced }: WorkbenchReplaceBodyButtonProps) {
  const [pendingReplacement, setPendingReplacement] = useState<PendingReplacement | null>(null);

  const replaceBody = (content: string) => {
    onReplaceContent(content);
    onReplaced();
    setPendingReplacement(null);
  };

  const requestReplace = () => {
    if (!output.trim()) return;
    const content = applyFormat(stripAiThinkingBlock(output), getStoredFormatSettings());
    const threshold = readReplaceBodyWarningThreshold();
    const wordCount = getReplaceBodyWordCount(content);
    if (shouldWarnBeforeReplacingBody(content, threshold)) {
      setPendingReplacement({ content, wordCount, threshold });
      return;
    }
    replaceBody(content);
  };

  return (
    <>
      <button
        type="button"
        onClick={requestReplace}
        disabled={!output.trim()}
        className="min-w-0 flex-1 bg-brand px-2 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
      >
        替换正文
      </button>
      <ConfirmDialog
        isOpen={Boolean(pendingReplacement)}
        title="正文不足字数"
        description={
          pendingReplacement
            ? `当前准备替换的正文只有 ${pendingReplacement.wordCount} 字，少于设置的 ${pendingReplacement.threshold} 字。\n\n是否仍要替换当前章节正文？`
            : ''
        }
        cancelText="取消"
        confirmText="继续替换"
        confirmVariant="warning"
        onClose={() => setPendingReplacement(null)}
        onConfirm={() => {
          if (pendingReplacement) replaceBody(pendingReplacement.content);
        }}
      />
    </>
  );
}
