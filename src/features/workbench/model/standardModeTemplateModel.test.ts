import { describe, expect, it } from 'vitest';

import {
  addTemplateSection,
  deleteTemplateNode,
  renameTemplateNode,
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
});
