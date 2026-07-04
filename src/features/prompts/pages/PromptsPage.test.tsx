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

  it('places audit secondary categories inside prompt management instead of the review panel', () => {
    const source = readPromptsPageSource();

    expect(source).toContain('AUDIT_PROMPT_SUBCATEGORIES');
    expect(source).toContain('const [activeAuditSubcategory, setActiveAuditSubcategory] = useState(DEFAULT_AUDIT_PROMPT_SUBCATEGORY);');
    expect(source).toContain('activeCategory === AUDIT_PROMPT_CATEGORY');
    expect(source).toContain('审核二级分类');
    expect(source).toContain('normalizePromptSubcategory(item.category, item.subCategory) === activeAuditSubcategory');
    expect(source).toContain('subCategory: normalizePromptSubcategory(category, prev.subCategory)');
    expect(source).toContain('normalizePromptSubcategory(prompt.category, prompt.subCategory)');
  });
});
