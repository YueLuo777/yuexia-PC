import { describe, expect, it } from 'vitest';

import { parseRoleContent } from '@/features/workbench/components/workbenchRoleContent';
import { parseSettingContent, stringifySettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  createManualStandardTemplateRoleInstance,
  createManualStandardTemplateSettingInstance,
} from './standardModeTemplateInstance';
import type { WorkbenchLibraryEntry } from './workbenchLibraryStorage';

describe('standard mode manual template instances', () => {
  it('clones a collection field layout and stable template id without copying generated content', () => {
    const source: WorkbenchLibraryEntry = {
      id: 'kungfu-template',
      tab: '大纲',
      title: '功法档案',
      updatedAt: '',
      standardTemplateEntryId: 'kungfu-template',
      standardTemplateCollection: true,
      standardTemplatePlaceholder: true,
      content: stringifySettingContent({
        type: '功法技能',
        body: '旧内容',
        templateFieldLayout: {
          id: 'layout-kungfu',
          sections: [{
            title: '基础设定',
            fields: [{ key: 'name', title: '功法名称' }],
          }],
        },
      }),
    };

    const created = createManualStandardTemplateSettingInstance({
      source,
      title: '九阳功',
      type: '功法技能',
    });
    const setting = parseSettingContent(created.content);

    expect(created).toMatchObject({
      title: '九阳功',
      standardTemplateEntryId: 'kungfu-template',
      standardTemplateCollection: true,
      standardTemplateGenerated: false,
      standardTemplatePlaceholder: false,
    });
    expect(setting.body).toBe('');
    expect(setting.templateFieldLayout?.id).toBe('layout-kungfu');
  });

  it('creates another role instance in the same template collection', () => {
    const source = {
      id: 'support-template',
      tab: '角色',
      title: '重要配角档案',
      content: '{}',
      updatedAt: '',
      standardTemplateEntryId: 'support-template',
      standardTemplateCollection: true,
    } satisfies WorkbenchLibraryEntry;
    const created = createManualStandardTemplateRoleInstance({
      entries: [source],
      selectedRoleId: source.id,
      title: '苏晚凝',
      type: '重要正派角色',
    });

    expect(created.standardTemplateEntryId).toBe('support-template');
    expect(created.standardTemplateGenerated).toBe(false);
    expect(parseRoleContent(created.content).type).toBe('重要正派角色');
  });
});
