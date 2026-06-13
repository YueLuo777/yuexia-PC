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
});
