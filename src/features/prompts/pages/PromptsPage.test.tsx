import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { PromptsPage } from './PromptsPage';

const readPromptsPageSource = () =>
  [
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/PromptPageParts.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/PromptCategoryCreateModal.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'PromptsPage.tsx'), 'utf8'),
  ].join('\n');

describe('PromptsPage modal layering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens directly as novel prompts with no script prompt page or type branch', () => {
    const source = readPromptsPageSource();
    render(
      <MemoryRouter>
        <PromptsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '小说提示词' })).toBeInTheDocument();
    expect(screen.queryByText('剧本提示词')).not.toBeInTheDocument();
    expect(source).not.toContainSource("type PromptTab = 'novel' | 'script'");
    expect(source).not.toContainSource("promptType === 'script'");
    expect(source).not.toContainSource('剧本提示词');
  });

  it('keeps the prompt editor modal from dimming the prompt management window behind it', () => {
    const source = readPromptsPageSource();
    const editorStart = source.indexOf('function PromptEditorModal');
    const editorEnd = source.indexOf('function PromptRecycleModal', editorStart);
    const editorSource = source.slice(editorStart, editorEnd);
    const recycleSource = source.slice(editorEnd);

    expect(editorSource).toContainSource(
      'className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-transparent p-6"',
    );
    expect(editorSource).not.toContainSource('bg-black/40 p-6');
    expect(recycleSource).toContainSource('bg-black/40');
  });

  it('places audit secondary categories inside prompt management instead of the review panel', () => {
    const source = readPromptsPageSource();

    expect(source).toContainSource('AUDIT_PROMPT_SUBCATEGORIES');
    expect(source).toContainSource(
      'const [activeAuditSubcategory, setActiveAuditSubcategory] = useState(DEFAULT_AUDIT_PROMPT_SUBCATEGORY);',
    );
    expect(source).toContainSource('activeCategory === AUDIT_PROMPT_CATEGORY');
    expect(source).toContainSource('审核二级分类');
    expect(source).toContainSource(
      'normalizePromptSubcategory(item.category, item.subCategory) === activeAuditSubcategory',
    );
    expect(source).toContainSource('subCategory: normalizePromptSubcategory(category, prev.subCategory)');
    expect(source).toContainSource('normalizePromptSubcategory(prompt.category, prompt.subCategory)');
  });

  it('moves prompt category badges below the title so they do not squeeze names', () => {
    const source = readPromptsPageSource();
    const cardStart = source.indexOf('{filteredPrompts.map((prompt) => (');
    const cardEnd = source.indexOf('<button\n            onClick={openCreate}', cardStart);
    const cardSource = source.slice(cardStart, cardEnd);

    expect(cardSource).toContainSource(
      '<h2 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h2>',
    );
    expect(cardSource).toContainSource('<div className="mt-2 flex flex-col items-start gap-1">');
    expect(cardSource).toContainSource(
      '<span className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-500">{prompt.category}</span>',
    );
    expect(cardSource).toContainSource('line-clamp-3 text-[13px] leading-6 text-slate-500');
    expect(cardSource).not.toContainSource('<div className="flex items-center gap-2">');
    expect(cardSource).not.toContainSource('line-clamp-4 text-[13px] leading-6 text-slate-500');
  });

  it('creates categories through a software-style input modal and keeps right-click deletion', () => {
    const source = readPromptsPageSource();
    const categoryBarStart = source.indexOf('<div className="xy-category-capsules min-w-0 flex-1">');
    const categoryBarEnd = source.indexOf('{activeCategory === AUDIT_PROMPT_CATEGORY', categoryBarStart);
    const categoryBarSource = source.slice(categoryBarStart, categoryBarEnd);

    expect(source).toContainSource('const [categoryContextMenu, setCategoryContextMenu]');
    expect(source).toContainSource('const [categoryDeleteTarget, setCategoryDeleteTarget]');
    expect(source).toContainSource(
      'function getPromptCategoryContextMenuPosition(event: ReactMouseEvent<HTMLButtonElement>)',
    );
    expect(source).toContainSource('document.querySelector(\'[data-capsule-select-portal-root="true"]\')');
    expect(source).toContainSource('(event.clientX - rect.left) / scaleX');
    expect(source).toContainSource('(event.clientY - rect.top) / scaleY');
    expect(source).toContainSource(
      'setCategoryContextMenu({ category, ...getPromptCategoryContextMenuPosition(event) });',
    );
    expect(source).toContainSource(
      'const openCategoryContextMenu = (event: ReactMouseEvent<HTMLButtonElement>, category: string)',
    );
    expect(source).toContainSource('if (isDefaultPromptCategory(category))');
    expect(source).toContainSource('const confirmCategoryDelete = () =>');
    expect(source).toContainSource('isDefaultPromptCategory(categoryDeleteTarget)');
    expect(source).toContainSource('title="确认删除分类"');
    expect(source).toContainSource('confirmText="删除该分类"');
    expect(categoryBarSource).toContainSource('onContextMenu={(event) => openCategoryContextMenu(event, category)}');
    expect(categoryBarSource).toContainSource('<ActionButton onClick={() => setShowCategoryCreate(true)}>新增分类</ActionButton>');
    expect(source).toContainSource('<PromptCategoryCreateModal');
    expect(source).toContainSource('placeholder="请输入分类名称"');
    expect(source).not.toContainSource('placeholder="新增分类"');
    expect(source).not.toContainSource('value={newCategory}');
    expect(categoryBarSource).toContainSource('删除该分类');
    expect(categoryBarSource).not.toContainSource('categoryDeleteMode');
    expect(categoryBarSource).not.toContainSource('xy-category-capsule-delete');
    expect(categoryBarSource).not.toContainSource('删除分类');
    expect(source).not.toContainSource('setCategoryContextMenu({ category, x: event.clientX, y: event.clientY });');
  });

  it('adds a category after the user enters a name and confirms', () => {
    render(
      <MemoryRouter>
        <PromptsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: '新增分类' }));
    const input = screen.getByRole('textbox', { name: '分类名称' });
    fireEvent.change(input, { target: { value: '自定义分类' } });
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    expect(screen.getByRole('button', { name: '自定义分类' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '新增分类' })).not.toBeInTheDocument();
  });

  it('adds txt import and export controls beside the recycle bin action', () => {
    const source = readPromptsPageSource();
    const headerStart = source.indexOf(
      '<div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2">',
    );
    const headerEnd = source.indexOf('</div>\n        </div>', headerStart);
    const headerSource = source.slice(headerStart, headerEnd);

    expect(source).toContainSource("const PROMPT_EXPORT_HEADER = '月下提示词导出 v1';");
    expect(source).toContainSource("const PROMPT_EXPORT_BLOCK_SEPARATOR = '--- 提示词 ---';");
    expect(source).toContainSource('downloadPromptTextFile(fileName, buildPromptExportText(prompts));');
    expect(source).toContainSource('parsePromptExportText(');
    expect(source).toContainSource('const created = addPrompts(imported);');
    expect(headerSource).toContainSource('accept=".txt,text/plain"');
    expect(headerSource).toContainSource('onChange={importPrompts}');
    expect(headerSource).toContainSource('导入提示词');
    expect(headerSource).toContainSource('导出提示词');
    expect(headerSource.indexOf('导入提示词')).toBeLessThan(headerSource.indexOf('导出提示词'));
    expect(headerSource.indexOf('导出提示词')).toBeLessThan(headerSource.indexOf('setShowRecycle(true)'));
    expect(headerSource.indexOf('setShowRecycle(true)')).toBeLessThan(headerSource.indexOf('xy-ui132-search'));
    expect(headerSource).toContainSource('<div className="shrink-0">');
    expect(headerSource).toContainSource('placeholder="搜索提示词..."');
    expect(headerSource).not.toContainSource('<Upload');
    expect(headerSource).not.toContainSource('<Download');
  });

  it('uses compact prompt management spacing inside fixed modals', () => {
    const source = readPromptsPageSource();

    expect(source).toContainSource('<div className="flex-1 overflow-y-auto px-5 py-4">');
    expect(source).toContainSource('<div className="mb-3 flex flex-wrap items-center justify-between gap-3">');
    expect(source).toContainSource('<div className="mb-3 flex flex-wrap items-center gap-2">');
    expect(source).toContainSource('<div className="mb-4 flex items-center gap-3">');
    expect(source).not.toContainSource('<div className="flex-1 overflow-y-auto px-7 py-7">');
    expect(source).not.toContainSource('<div className="mb-6 flex items-center justify-between gap-5">');
    expect(source).not.toContainSource('<div className="mb-7 flex flex-wrap items-center gap-3">');
  });
});
