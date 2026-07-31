import { beforeEach, describe, expect, it } from 'vitest';

import {
  addTemplateSection,
  deleteTemplateNode,
  deleteSavedSettingTemplate,
  readSavedSettingTemplates,
  renameTemplateNode,
  SAVED_SETTING_TEMPLATES_STORAGE_KEY,
  saveSettingTemplateById,
  type TemplateStructure,
} from './standardModeTemplateModel';

const structure: TemplateStructure = [{
  id: 'characters',
  title: '人物设定',
  enabled: true,
  groups: [{
    id: 'lead-group',
    title: '主角',
    enabled: true,
    entries: [{
      id: 'hero',
      title: '男主角',
      enabled: true,
      sections: [{
        id: 'profile',
        title: '基础档案',
        enabled: true,
        fields: [{ id: 'name', title: '人物姓名', enabled: true }],
      }],
    }],
  }],
}];

describe('standard mode template model', () => {
  beforeEach(() => localStorage.clear());

  it('adds, renames, and deletes an internal category without moving its entry', () => {
    const added = addTemplateSection(structure, 'characters', 'lead-group', 'hero');
    const renamed = renameTemplateNode(added.structure, {
      domainId: 'characters',
      groupId: 'lead-group',
      entryId: 'hero',
      sectionId: added.section.id,
    }, '关系');
    expect(renamed[0].groups[0].entries[0].sections.map((section) => section.title)).toEqual(['基础档案', '关系']);

    const deleted = deleteTemplateNode(renamed, {
      domainId: 'characters',
      groupId: 'lead-group',
      entryId: 'hero',
      sectionId: added.section.id,
    });
    expect(deleted[0].groups[0].entries[0].title).toBe('男主角');
    expect(deleted[0].groups[0].entries[0].sections.map((section) => section.title)).toEqual(['基础档案']);
  });

  it('creates, renames, updates, and deletes a saved template by stable id', () => {
    const created = saveSettingTemplateById(
      null,
      '人物模板',
      structure,
      undefined,
      undefined,
      { channel: 'female', applicability: 'genre', genreCategory: '现代言情', basePresetId: 'female-ceo' },
    );
    const templateId = created[0].id;

    const renamedStructure = renameTemplateNode(structure, { domainId: 'characters' }, '人物档案');
    const updated = saveSettingTemplateById(templateId, '人物模板 2', renamedStructure);

    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({
      id: templateId,
      name: '人物模板 2',
      channel: 'female',
      applicability: 'genre',
      genreCategory: '现代言情',
      basePresetId: 'female-ceo',
    });
    expect(updated[0].structure[0].title).toBe('人物档案');
    expect(readSavedSettingTemplates()).toEqual(updated);
    expect(deleteSavedSettingTemplate(templateId)).toEqual([]);
    expect(readSavedSettingTemplates()).toEqual([]);
  });

  it('migrates a structure-only saved template to a complete V3 package without changing its ids', () => {
    localStorage.setItem(SAVED_SETTING_TEMPLATES_STORAGE_KEY, JSON.stringify([{
      id: 'legacy-template',
      name: '旧自定义模板',
      updatedAt: '2026-07-01',
      structure,
    }]));

    const [migrated] = readSavedSettingTemplates();
    expect(migrated).toMatchObject({
      formatVersion: 3,
      id: 'legacy-template',
      name: '旧自定义模板',
      revision: 1,
      source: 'custom',
      contractVersion: 'setting-generation-v2',
      channel: 'male',
      applicability: 'general',
      genreCategory: '通用',
    });
    expect(migrated.structure[0].groups[0].entries[0].id).toBe('hero');
    expect(migrated.generationBlueprint.entryRules.hero).toBeTruthy();
  });
});
