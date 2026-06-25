import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readPromptsPageSource = () => (
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PromptsPage.tsx'), 'utf8')
);

describe('PromptsPage modal layering', () => {
  it('keeps the prompt editor modal from dimming the prompt management window behind it', () => {
    const source = readPromptsPageSource();
    const editorStart = source.indexOf('function PromptEditorModal');
    const editorEnd = source.indexOf('function PromptRecycleModal', editorStart);
    const editorSource = source.slice(editorStart, editorEnd);
    const recycleSource = source.slice(editorEnd);

    expect(editorSource).toContain('className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-transparent p-6"');
    expect(editorSource).not.toContain('bg-black/40 p-6');
    expect(recycleSource).toContain('bg-black/40');
  });
});
