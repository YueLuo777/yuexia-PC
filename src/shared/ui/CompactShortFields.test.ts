import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('compact short fields across formal pages', () => {
  it('embeds prompt metadata labels and enlarges the content editor text', () => {
    const source = readSource('src/features/prompts/components/PromptPageParts.tsx');
    expect(source.match(/xy-floating-field xy-floating-compact xy-has-value text-sm font-bold text-slate-600/g)).toHaveLength(2);
    expect(source).toContainSource('<label>提示词名称</label>');
    expect(source).toContainSource('<label>提示词说明</label>');
    expect(source).not.toContainSource('<span className="w-[84px] shrink-0">提示词名称</span>');
    expect(source).toContainSource('xy-prompt-content-editor min-h-0 flex-1 font-sans text-[19px]');
    expect(source).toContainSource('border-b border-slate-100 px-8 py-2');
  });

  it('keeps model metadata compact', () => {
    const source = readSource('src/features/models/components/ModelManageParts.tsx');
    expect(source).toContainSource('<span className="shrink-0">模型名称</span>');
    expect(source).toContainSource('<span className="shrink-0">模型 ID</span>');
    expect(source).toContainSource('<span className="w-[84px] shrink-0">接口地址</span>');
    expect(source).toContainSource('<span className="w-[84px] shrink-0">API Key</span>');
  });

  it('keeps brainstorm prompt metadata and setting names compact', () => {
    const brainstormSource = readSource('src/features/workbench/components/BrainstormPromptEditModal.tsx');
    const settingSource = readSource('src/features/workbench/components/workbenchSettingEditor.tsx');
    const nameFieldSource = readSource('src/features/workbench/components/WorkbenchNameField.tsx');
    expect(brainstormSource).toContainSource('<span className="w-12 shrink-0">名称</span>');
    expect(brainstormSource).toContainSource('<span className="w-12 shrink-0 pt-2">说明</span>');
    expect(settingSource.match(/<WorkbenchNameField/g)).toHaveLength(3);
    expect(nameFieldSource).toContainSource('className="xy-workbench-name-field"');
    expect(nameFieldSource).toContainSource('className="xy-workbench-name-field-caption"');
    expect(settingSource).not.toContainSource('<span className="w-[64px] shrink-0">设定名</span>');
  });
});
