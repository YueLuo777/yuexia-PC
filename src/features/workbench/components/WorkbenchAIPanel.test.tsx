import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (fileName: string) => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8');
  if (fileName !== 'WorkbenchAIPanel.tsx') return source;
  return [
    source,
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'workbenchAiPanelSupport.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAiRequestLogModal.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAiConversationView.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAiConfigPanel.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAIPanelView.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchReplaceBodyButton.tsx'), 'utf8'),
    readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../../shared/ui/AssociationSegmentedControl.tsx'),
      'utf8',
    ),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../model/workbenchReplaceBodyWarning.ts'), 'utf8'),
  ].join('\n');
};

describe('WorkbenchAIPanel linked context controls', () => {
  it('passes the active input through the extracted view scope', () => {
    const panelSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAIPanel.tsx'), 'utf8');
    const viewSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAIPanelView.tsx'), 'utf8');

    expect(panelSource).toMatch(/renderWorkbenchAIPanelView\([\s\S]*?\binput,\s*inputTextareaRef\b/);
    expect(viewSource).toMatch(/\{[\s\S]*?\binput,\s*inputTextareaRef\b[\s\S]*?\}\s*=\s*scope/s);
    expect(viewSource).toContainSource('value={input}');
  });

  it('uses only body category prompts for the body AI panel', () => {
    const source = readSource('WorkbenchAIPanel.tsx');

    expect(source).toContainSource('BODY_PROMPT_CATEGORY');
    expect(source).toContainSource('normalizePromptCategoryName(prompt.category) === BODY_PROMPT_CATEGORY');
    expect(source).not.toContainSource('WORKBENCH_AI_EXCLUDED_PROMPT_CATEGORIES');
    expect(source).not.toContainSource('!WORKBENCH_AI_EXCLUDED_PROMPT_CATEGORIES.has(prompt.category)');
  });

  it('allows sending with linked context when the input is empty', () => {
    const source = readSource('WorkbenchAIPanel.tsx');

    expect(source).toContainSource('const canSendMessage = Boolean(input.trim() || previewContextText.trim());');
    expect(source).toContainSource('const hasSendableContext = Boolean(contextPayload.trim());');
    expect(source).toContainSource('if (isLoading || (!text && !hasSendableContext)) return;');
    expect(source).toContainSource("const userTextForAi = text ? wrapAiRequestTag('写作要求', text) : '';");
    expect(source).toContainSource("content: text || `使用${contextTitle || '关联内容'}生成正文`");
    expect(source).toContainSource('sendDisabled={isLoading || !canSendMessage}');
    expect(source).not.toContainSource('if (!text || isLoading) return;');
    expect(source).not.toContainSource('sendDisabled={isLoading || !input.trim()}');
  });

  it('uses the approved unified spacing and one-row body result actions', () => {
    const source = readSource('WorkbenchAIPanel.tsx');
    const styles = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../../shared/styles/parts/part-11.css'),
      'utf8',
    );

    expect(source).toContainSource('<AssociationSegmentedControl');
    expect(source).toContainSource('className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9]');
    expect(source).toContainSource('className="grid w-12 shrink-0 place-items-center border-r border-[#08B3D9]/30');
    expect(source).not.toContainSource('grid w-14 shrink-0 place-items-center border-r border-[#08B3D9]/30');
    expect(source).toContainSource("minWidthClassName: 'w-28'");
    expect(source).toContainSource('className="xy-ai-panel-input-row"');
    expect(source).toContainSource('className="xy-ai-panel-action-row flex overflow-hidden rounded-xl border border-gray-200 bg-white"');
    expect(source).toContainSource('xy-ai-panel-output-slot xy-floating-field');
    expect(styles).toContainSource('.xy-ai-panel-output-slot.xy-floating-with-bottom-count {\n  margin-bottom: 0;');
    expect(styles).toContainSource('.xy-ai-panel-link-row,\n.xy-ai-panel-input-row,\n.xy-ai-panel-action-row {');
    expect(styles).toContainSource('margin-top: 0.75rem;');
    expect(source).not.toContainSource('className="mt-2 grid grid-cols-2 gap-2"');
    expect(source).not.toContainSource('清空内容');
    expect(source).toContainSource('onResetSessions');
    expect(source).toContainSource('清空');
    expect(source).toContainSource('className="absolute right-2 top-0 z-20 flex h-4 items-center text-xs font-bold"');
  });

  it('auto formats AI output before replacing chapter body', () => {
    const source = readSource('WorkbenchAIPanel.tsx');

    expect(source).toContainSource("import { applyFormat, getStoredFormatSettings } from './EditorToolModals';");
    expect(source).toContainSource(
      'const content = applyFormat(stripAiThinkingBlock(output), getStoredFormatSettings());',
    );
    expect(source).toContainSource('shouldWarnBeforeReplacingBody(content, threshold)');
    expect(source).toContainSource('<WorkbenchReplaceBodyButton');
    expect(source).toContainSource("onReplaced={() => flashStatus('已智能排版并替换正文')}");
    expect(source).not.toContainSource('onReplaceContent(stripAiThinkingBlock(output));');
  });

  it('supports clearing linked materials and lets chapter linking take precedence', () => {
    const source = readSource('WorkbenchAIPanel.tsx');

    expect(source).toContainSource('const activeLinkedContextItems = hasLinkedChapter ? [] : linkedContextItems;');
    expect(source).toContainSource('const hasLinkedContext = activeLinkedContextItems.length > 0;');
    expect(source).toContainSource(
      'const previewLinkedContextPayload = buildBodyLinkedContextPayload(activeLinkedContextItems);',
    );
    expect(source).toContainSource('linkedItems: previewLinkedContextPayload ? activeLinkedContextItems : []');
    expect(source).toContainSource('if (nextLinkChapter && linkedContextItems.length > 0) {');
    expect(source).toContainSource('onClearLinkedContext?.();');
    expect(source).toContainSource(
      'const activeRequestLinkedContextItems = activeSession.linkChapter ? [] : linkedContextItems;',
    );
    expect(source).toContainSource(
      'const linkedContextPayload = buildBodyLinkedContextPayload(activeRequestLinkedContextItems);',
    );
    expect(source).toContainSource('linkedItems: linkedContextPayload ? activeRequestLinkedContextItems : []');
    expect(source).toContainSource('const clearLinkedContext = () => {');
    expect(source).toContainSource('if (hasLinkedContext) {');
    expect(source).toContainSource('clearLinkedContext();');
    expect(source).toContainSource('return;');
    expect(source).not.toContainSource('aria-label="取消关联资料"');
    expect(source).not.toContainSource('title="取消关联资料"');
    expect(source).not.toContainSource('bg-[#ff4b4b]');
    expect(source).toContainSource('关联 <WordCountText value={activeLinkWordCount} compact />');
    expect(source).not.toContainSource('已关联：<WordCountText value={activeLinkWordCount} compact />');
    expect(source).not.toContainSource('if (!activeSession?.linkChapter || linkedContextItems.length === 0) return;');
  });

  it('lets the body AI request log material section fill the dialog height', () => {
    const source = readSource('WorkbenchAIPanel.tsx');
    const logLayoutSource = readSource('../../../shared/ui/AiRequestLogModalLayout.tsx');

    expect(source).toContainSource("import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';");
    expect(source).toContainSource('<AiRequestLogModalLayout');
    expect(logLayoutSource).toContainSource(
      'className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden"',
    );
    expect(logLayoutSource).toContainSource(
      'className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5"',
    );
    expect(source).toContainSource('function getBodyAiLogFillGroupWeights(log: WorkbenchAiRequestLog)');
    expect(source).toContainSource('if (hasContext && hasUser) return { prompt: 1, context: 2, user: 1 };');
    expect(source).toContainSource('if (hasContext) return { prompt: 1, context: 2 };');
    expect(source).toContainSource('if (hasUser) return { prompt: 2, user: 1 };');
    expect(source).toContainSource("{ id: 'context', title: '资料'");
    expect(source).toContainSource(
      "content: visibleRequestLog.visibleUserContent.trim() ? visibleRequestLog.userContent : ''",
    );
    expect(source).toContainSource('fillSingleGroup');
    expect(source).toContainSource('fillGroupWeights={getBodyAiLogFillGroupWeights(log)}');
    expect(logLayoutSource).toContainSource('<AiRequestLogGroups');
    expect(logLayoutSource).toContainSource('fillGroupWeights={fillGroupWeights}');
    expect(source).not.toContainSource('fillGroupId="context"');
  });
});
