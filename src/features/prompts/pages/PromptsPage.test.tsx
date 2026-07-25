import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { trimPromptEditorLeadingBlankLines } from '../components/PromptPageParts';
import { PromptsPage } from './PromptsPage';

const readPromptsPageSource = () =>
  [
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/PromptPageParts.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/AuditPromptEditorFields.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../components/AuditPromptEditorModal.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../shared/styles/parts/part-12.css'), 'utf8'),
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

  it('routes prompt editor and recycle windows through the shared modal shell', () => {
    const source = readPromptsPageSource();
    const editorStart = source.indexOf('function PromptEditorModal');
    const editorEnd = source.indexOf('function PromptRecycleModal', editorStart);
    const editorSource = source.slice(editorStart, editorEnd);
    const recycleSource = source.slice(editorEnd);

    expect(editorSource).toContainSource('<AppModalShell');
    expect(editorSource).toContainSource('zIndexClass="z-[290]"');
    expect(editorSource).not.toContainSource('fixed inset-0');
    expect(recycleSource).toContainSource('<AppModalShell');
    expect(recycleSource).toContainSource('zIndexClass="z-[270]"');
  });

  it.skip('places audit secondary categories inside prompt management instead of the review panel', () => {
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

  it.skip('moves prompt category badges below the title so they do not squeeze names', () => {
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

  it.skip('creates categories through a software-style input modal and keeps right-click deletion', () => {
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

  it.skip('uses compact prompt management spacing inside fixed modals', () => {
    const source = readPromptsPageSource();

    expect(source).toContainSource('<div className="shrink-0 px-5 pt-4">');
    expect(source).toContainSource('data-testid="prompt-card-scroll-region"');
    expect(source).toContainSource(
      'className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 [scrollbar-gutter:stable]"',
    );
    expect(source).toContainSource('<div className="mb-3 flex flex-wrap items-center justify-between gap-3">');
    expect(source).toContainSource('<div className="mb-3 flex flex-wrap items-center gap-2">');
    expect(source).toContainSource('<div className="mb-4 flex items-center gap-3">');
    expect(source).not.toContainSource('<div className="flex-1 overflow-y-auto px-7 py-7">');
    expect(source).not.toContainSource('<div className="mb-6 flex items-center justify-between gap-5">');
    expect(source).not.toContainSource('<div className="mb-7 flex flex-wrap items-center gap-3">');
  });

  it('renders one audit category with a dual-content editor and a persisted text-audit switch', () => {
    const source = readPromptsPageSource();
    expect(source).toContainSource('normalizePromptRecord');
    expect(source).toContainSource('data-testid="prompt-card-scroll-region"');
    expect(source).toContainSource('overflow-y-auto px-5 pb-4 [scrollbar-gutter:stable]');
    expect(source).not.toContainSource('flex-1 overflow-y-auto px-5 py-4');
    expect(source).not.toContainSource('activeAuditSubcategory');
    expect(source).not.toContainSource('审核二级分类');
    expect(source).toContainSource('function AuditPromptEditorModal');
    expect(source).toContainSource('<AppModalShell');
    expect(source).toContainSource("document.querySelector('.writer-assistant-theme') ?? document.body");
    expect(source).toContainSource('heightClass="h-[calc(90dvh-43px)] max-h-[calc(100dvh-48px)]"');
    expect(source).toContainSource('widthClass="w-[1280px] max-w-[calc(100vw-48px)]"');
    expect(source).not.toContainSource('w-[1600px]');
    expect(source).toContainSource('heightClass="h-[min(680px,78dvh)] max-h-[calc(100dvh-48px)]"');
    expect(source).toContainSource('widthClass="w-[980px]"');
    expect(source).toContainSource('defaultGeometry={{ x: 0, y: 0, width: 980, height: 680 }}');
    expect(source).toContainSource('panelClassName="xy-prompt-editor-modal"');
    expect(source).toContainSource('gap-6 px-8 pb-7 pt-4');
    expect(source).toContainSource('min-h-0 space-y-5 overflow-y-auto pt-3 pr-1');
    expect(source).toContainSource('grid min-h-0 grid-cols-1 gap-5 pt-3');
    expect(source).toContainSource('xy-prompt-meta-field-multiline h-[180px] shrink-0 bg-white');
    expect(source.match(/className="absolute xy-border-embedded-transparent-backplate xy-workbench-name-field-caption"/g)).toHaveLength(3);
    expect(source).toContainSource('.xy-prompt-editor-modal .xy-workbench-name-field-caption::before');
    expect(source).toContainSource('.xy-prompt-editor-modal .xy-workbench-name-field-caption > span');
    expect(source.match(/<span>提示词(?:名称|说明|内容)<\/span>/g)).toHaveLength(3);
    expect(source).toContainSource('px-6 pb-5 pt-3 font-sans text-[19px]');
    expect(source).toContainSource('.xy-prompt-editor-modal .xy-prompt-meta-field-textarea');
    expect(source).toContainSource('padding-top: 12px;');
    expect(source).toContainSource('xy-prompt-meta-field xy-prompt-content-field relative flex min-h-0 flex-col bg-white');
    expect(source).toContainSource('aria-label="提示词内容"');
    expect(source).not.toContainSource('<label>提示词内容</label>');
    expect(source).not.toContainSource('isAuditDraft');
    expect(source).toContainSource('<AuditPromptEditorFields categories={categories} draft={draft} setDraft={setDraft} />');
    expect(source).toContainSource('label="剧情审核提示词"');
    expect(source).toContainSource('label="文本审核提示词"');
    expect(source).toContainSource("{disabled ? '启用' : '禁用'}");
    expect(source).toContainSource('absolute -top-px left-5 z-10 flex h-6 -translate-y-1/2');
    expect(source).toContainSource('items-center text-base font-black leading-6 tracking-normal');
    expect(source).toContainSource('absolute -top-px right-5 z-10 flex h-5 -translate-y-1/2');
    expect(source).not.toContainSource('.xy-audit-prompt-content-field:focus-within > span');
    expect(source).not.toContainSource('<fieldset');
    expect(source).toContainSource('文本审核已禁用：此提示词不会发送给AI。');
    const namePosition = source.indexOf('label="提示词名称"');
    const descriptionPosition = source.indexOf('label="提示词说明"');
    expect(descriptionPosition).toBeGreaterThan(namePosition);
    expect(source).toContainSource('flex h-full min-w-0 flex-col gap-3 rounded-2xl');
    expect(source).toContainSource('xy-audit-meta-field xy-prompt-meta-field min-w-0 bg-white');
    expect(source).toContainSource('className="xy-border-embedded-transparent-backplate xy-workbench-name-field-caption"');
    expect(source).toContainSource('className="xy-workbench-name-field-input"');
    expect(source).toContainSource('className="xy-prompt-meta-field-textarea"');
    expect(source).toContainSource('placeholder=""');
    expect(source).toContainSource('className="w-[220px] max-w-full"');
    expect(source).toContainSource('grid min-h-[216px] shrink-0 grid-cols-2 gap-5');
    expect(source).toContainSource('className="min-h-[100px] flex-1"');
    expect(source).toContainSource("['脑洞', '设定', '章纲', '正文']");
    expect(source).toContainSource("['审核', '点评', '润色', '状态', '梗概']");
    expect(source).toContainSource("['未分类']");
    expect(source).toContainSource('mb-3 block text-sm font-black');
    expect(source).toContainSource('h-9 rounded-lg border px-3.5 text-sm font-bold');
    expect(source).not.toContainSource("['题材迭代']");
    expect(source).toContainSource('absolute inset-0 z-[5] flex items-center justify-center');
    expect(source).toContainSource('px-5 py-3 text-lg font-black leading-7');
    expect(source).toContainSource('tracking-normal text-red-600 shadow-sm');
    expect(source).toContainSource('text-[16px] font-black leading-7 tracking-normal text-[#078fb0]');
    expect(source).toContainSource('.xy-audit-prompt-editor-modal *');
    expect(source).toContainSource('scrollbar-gutter: stable');
    expect(source).toContainSource('.xy-audit-prompt-content-editor:focus');
    expect(source).toContainSource('<div className="flex min-w-0 flex-1 items-center gap-2">');
    expect(source).toContainSource('{prompt.category}');
  });

  it('removes leading blank lines from prompt descriptions and content', () => {
    expect(trimPromptEditorLeadingBlankLines('\n\n提示词正文')).toBe('提示词正文');
    expect(trimPromptEditorLeadingBlankLines('  \n\t\n提示词说明')).toBe('提示词说明');
    expect(trimPromptEditorLeadingBlankLines('第一行\n\n第二行')).toBe('第一行\n\n第二行');
  });

  it('disables and restores the text-audit prompt without deleting its content', () => {
    localStorage.setItem(
      'xinyuexia_prompts_v1',
      JSON.stringify([
        {
          id: 'audit-1',
          name: '章节审核',
          description: '',
          content: '剧情审核规则',
          textAuditContent: '文本审核规则',
          textAuditEnabled: true,
          category: '审核',
          promptType: 'novel',
          usageCount: 0,
          isFavorite: false,
          isLocked: false,
          createdAt: '',
          updatedAt: '',
        },
      ]),
    );
    render(
      <MemoryRouter>
        <PromptsPage initialCategory="审核" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: '编辑' }));
    expect(screen.getByLabelText('剧情审核提示词')).toHaveValue('剧情审核规则');
    const textAuditEditor = screen.getByLabelText('文本审核提示词');
    expect(textAuditEditor).toHaveValue('文本审核规则');

    const disableButton = screen.getByRole('button', { name: '禁用' });
    const textAuditFrame = textAuditEditor.parentElement;
    expect(textAuditFrame).toContainElement(disableButton);
    expect(disableButton).toHaveClass('-top-px', '-translate-y-1/2');
    fireEvent.click(disableButton);
    expect(textAuditEditor).toBeDisabled();
    expect(screen.getByText('文本审核已禁用：此提示词不会发送给AI。')).toHaveClass(
      'text-lg',
      'font-black',
    );
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    const [stored] = JSON.parse(localStorage.getItem('xinyuexia_prompts_v1') ?? '[]');
    expect(stored).toMatchObject({
      category: '审核',
      content: '剧情审核规则',
      textAuditContent: '文本审核规则',
      textAuditEnabled: false,
    });
  });
});
