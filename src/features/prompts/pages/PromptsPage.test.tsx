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

  it('moves prompt category badges below the title so they do not squeeze names', () => {
    const source = readPromptsPageSource();
    const cardStart = source.indexOf('{filteredPrompts.map((prompt) => (');
    const cardEnd = source.indexOf('<button\n            onClick={openCreate}', cardStart);
    const cardSource = source.slice(cardStart, cardEnd);

    expect(cardSource).toContain('<h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>');
    expect(cardSource).toContain('<div className="mt-2 flex flex-col items-start gap-1">');
    expect(cardSource).toContain('<span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-500">{prompt.category}</span>');
    expect(cardSource).toContain('line-clamp-3 text-[13px] leading-6 text-slate-500');
    expect(cardSource).not.toContain('<div className="flex items-center gap-2">');
    expect(cardSource).not.toContain('line-clamp-4 text-[13px] leading-6 text-slate-500');
  });
});
