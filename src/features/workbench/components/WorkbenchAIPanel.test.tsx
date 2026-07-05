import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (fileName: string) => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8')
);

describe('WorkbenchAIPanel linked context controls', () => {
  it('supports clearing linked materials and lets chapter linking take precedence', () => {
    const source = readSource('WorkbenchAIPanel.tsx');

    expect(source).toContain('const activeLinkedContextItems = hasLinkedChapter ? [] : linkedContextItems;');
    expect(source).toContain('const hasLinkedContext = activeLinkedContextItems.length > 0;');
    expect(source).toContain('const previewLinkedContextPayload = buildBodyLinkedContextPayload(activeLinkedContextItems);');
    expect(source).toContain('linkedItems: previewLinkedContextPayload ? activeLinkedContextItems : []');
    expect(source).toContain('if (nextLinkChapter && linkedContextItems.length > 0) {');
    expect(source).toContain('onClearLinkedContext?.();');
    expect(source).toContain('const activeRequestLinkedContextItems = activeSession.linkChapter ? [] : linkedContextItems;');
    expect(source).toContain('const linkedContextPayload = buildBodyLinkedContextPayload(activeRequestLinkedContextItems);');
    expect(source).toContain('linkedItems: linkedContextPayload ? activeRequestLinkedContextItems : []');
    expect(source).toContain('const clearLinkedContext = () => {');
    expect(source).toContain('if (hasLinkedContext) {');
    expect(source).toContain('clearLinkedContext();');
    expect(source).toContain('return;');
    expect(source).not.toContain('aria-label="取消关联资料"');
    expect(source).not.toContain('title="取消关联资料"');
    expect(source).not.toContain('bg-[#ff4b4b]');
    expect(source).toContain('关联 <WordCountText value={activeLinkWordCount} compact />');
    expect(source).not.toContain('已关联：<WordCountText value={activeLinkWordCount} compact />');
    expect(source).not.toContain('if (!activeSession?.linkChapter || linkedContextItems.length === 0) return;');
  });

  it('lets the body AI request log material section fill the dialog height', () => {
    const source = readSource('WorkbenchAIPanel.tsx');
    const logLayoutSource = readSource('../../../shared/ui/AiRequestLogModalLayout.tsx');

    expect(source).toContain("import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';");
    expect(source).toContain('<AiRequestLogModalLayout');
    expect(logLayoutSource).toContain('className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)] overflow-hidden"');
    expect(logLayoutSource).toContain('className="editor-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden p-5"');
    expect(source).toContain('function getBodyAiLogFillGroupWeights(log: WorkbenchAiRequestLog)');
    expect(source).toContain('if (hasContext && hasUser) return { prompt: 1, context: 2, user: 1 };');
    expect(source).toContain('if (hasContext) return { prompt: 1, context: 2 };');
    expect(source).toContain('if (hasUser) return { prompt: 2, user: 1 };');
    expect(source).toContain("{ id: 'context', title: '资料'");
    expect(source).toContain("content: visibleRequestLog.visibleUserContent.trim() ? visibleRequestLog.userContent : ''");
    expect(source).toContain('fillSingleGroup');
    expect(source).toContain('fillGroupWeights={getBodyAiLogFillGroupWeights(visibleRequestLog)}');
    expect(logLayoutSource).toContain('<AiRequestLogGroups');
    expect(logLayoutSource).toContain('fillGroupWeights={fillGroupWeights}');
    expect(source).not.toContain('fillGroupId="context"');
  });
});
