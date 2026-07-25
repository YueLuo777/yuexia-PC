import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('compact short fields across formal pages', () => {
  it('embeds prompt metadata labels and enlarges the content editor text', () => {
    const source = readSource('src/features/prompts/components/PromptPageParts.tsx');
    expect(source.match(/xy-prompt-meta-field/g)).toHaveLength(5);
    expect(source).toContainSource('xy-border-embedded-transparent-backplate xy-workbench-name-field-caption');
    expect(source).toContainSource('aria-label="提示词名称"');
    expect(source).toContainSource('aria-label="提示词说明"');
    expect(source).toContainSource('className="xy-workbench-name-field-input"');
    expect(source).toContainSource('className="xy-prompt-meta-field-textarea"');
    expect(source).not.toContainSource('<span className="w-[84px] shrink-0">提示词名称</span>');
    expect(source).toContainSource('xy-prompt-meta-field xy-prompt-content-field relative flex min-h-0 flex-col bg-white');
    expect(source).toContainSource('aria-label="提示词内容"');
    expect(source).toContainSource('xy-prompt-content-editor min-h-0 w-full flex-1 resize-none border-0 bg-transparent');
    expect(source).not.toContainSource('<label>提示词内容</label>');
    expect(source).toContainSource('<AppModalShell');
    expect(source).toContainSource('heightClass="h-[min(680px,78dvh)] max-h-[calc(100dvh-48px)]"');
    expect(source).toContainSource('defaultGeometry={{ x: 0, y: 0, width: 980, height: 680 }}');
    expect(source).toContainSource('centerOnOpen');
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
    expect(brainstormSource).toContainSource('<span className="w-14 shrink-0">名称</span>');
    expect(brainstormSource).toContainSource('<span className="w-14 shrink-0 pt-2">说明</span>');
    expect(brainstormSource).toContainSource('heightClass="h-[min(620px,78vh)]"');
    expect(brainstormSource).toContainSource('storageId="brainstorm_prompt_editor_centered_v3"');
    expect(brainstormSource).toContainSource('defaultGeometry={{ x: 0, y: 0, width: 960, height: 620 }}');
    expect(brainstormSource).toContainSource('xy-prompt-meta-field xy-prompt-content-field relative flex min-h-[160px] flex-1 flex-col bg-white');
    expect(brainstormSource).toContainSource('className="xy-border-embedded-transparent-backplate xy-workbench-name-field-caption"');
    expect(brainstormSource).toContainSource('aria-label="提示词内容"');
    expect(settingSource.match(/<WorkbenchNameField/g)).toHaveLength(2);
    expect(nameFieldSource).toContainSource('className="xy-workbench-name-field"');
    expect(nameFieldSource).toContainSource('data-workbench-header-control="true"');
    expect(nameFieldSource).toContainSource('className="xy-border-embedded-transparent-backplate xy-workbench-name-field-caption"');
    expect(settingSource).not.toContainSource('<span className="w-[64px] shrink-0">设定名</span>');
  });
});
