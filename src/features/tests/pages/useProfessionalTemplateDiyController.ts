import { useMemo, useState } from 'react';

import {
  addTemplateDomain,
  addTemplateEntry,
  addTemplateField,
  addTemplateGroup,
  addTemplateSection,
  cloneTemplateStructure,
  deleteTemplateNode,
  renameTemplateNode,
  summarizeTemplate,
  type TemplateEntryNode,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

import { professionalTemplateStructure } from './professionalTemplateHierarchyModel';

export type DiyLevel = 'domain' | 'group' | 'entry' | 'field';
export type DiyLockedLevels = Record<DiyLevel, boolean>;

export function getDiyEntryFields(entry: TemplateEntryNode | undefined) {
  return entry?.sections.flatMap((section) => section.fields) ?? [];
}

export function useProfessionalTemplateDiyController() {
  const [structure, setStructure] = useState<TemplateStructure>(() =>
    cloneTemplateStructure(professionalTemplateStructure),
  );
  const [domainId, setDomainId] = useState(structure[0]?.id ?? '');
  const domain = structure.find((item) => item.id === domainId) ?? structure[0];
  const [groupId, setGroupId] = useState(domain?.groups[0]?.id ?? '');
  const group = domain?.groups.find((item) => item.id === groupId) ?? domain?.groups[0];
  const [entryId, setEntryId] = useState(group?.entries[0]?.id ?? '');
  const entry = group?.entries.find((item) => item.id === entryId) ?? group?.entries[0];
  const [fieldId, setFieldId] = useState(getDiyEntryFields(entry)[0]?.id ?? '');
  const fields = useMemo(() => getDiyEntryFields(entry), [entry]);
  const [lockedLevels, setLockedLevels] = useState<DiyLockedLevels>({
    domain: true,
    group: true,
    entry: true,
    field: true,
  });
  const [feedback, setFeedback] = useState('四级删除默认锁定；新增、查看和切换不受影响。');
  const summary = summarizeTemplate(structure);

  const selectDomain = (nextDomainId: string) => {
    const nextDomain = structure.find((item) => item.id === nextDomainId);
    const nextGroup = nextDomain?.groups[0];
    const nextEntry = nextGroup?.entries[0];
    setDomainId(nextDomainId);
    setGroupId(nextGroup?.id ?? '');
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
  };

  const selectGroup = (nextGroupId: string) => {
    const nextGroup = domain?.groups.find((item) => item.id === nextGroupId);
    const nextEntry = nextGroup?.entries[0];
    setGroupId(nextGroupId);
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
  };

  const selectEntry = (nextEntryId: string) => {
    const nextEntry = group?.entries.find((item) => item.id === nextEntryId);
    setEntryId(nextEntryId);
    setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
  };

  const selectPath = (nextDomainId: string, nextGroupId: string, nextEntryId: string, nextFieldId = '') => {
    setDomainId(nextDomainId);
    setGroupId(nextGroupId);
    setEntryId(nextEntryId);
    setFieldId(nextFieldId);
  };

  const requireName = (name: string, label: string) => {
    const normalized = name.trim();
    if (!normalized) setFeedback(`请先输入${label}名称。`);
    return normalized;
  };

  const addDomain = (input: string) => {
    const name = requireName(input, '一级分类');
    if (!name) return false;
    const added = addTemplateDomain(structure);
    setStructure(renameTemplateNode(added.structure, { domainId: added.domain.id }, name));
    setDomainId(added.domain.id);
    setGroupId('');
    setEntryId('');
    setFieldId('');
    setFeedback(`已新增一级分类“${name}”，可继续添加二级分组。`);
    return true;
  };

  const addGroup = (input: string) => {
    const name = requireName(input, '二级分组');
    if (!name || !domain) return false;
    const added = addTemplateGroup(structure, domain.id);
    setStructure(renameTemplateNode(added.structure, { domainId: domain.id, groupId: added.group.id }, name));
    setGroupId(added.group.id);
    setEntryId('');
    setFieldId('');
    setFeedback(`已在“${domain.title}”下新增二级分组“${name}”。`);
    return true;
  };

  const addEntry = (input: string) => {
    const name = requireName(input, '三级设定');
    if (!name || !domain || !group) return false;
    const added = addTemplateEntry(structure, domain.id, group.id);
    setStructure(renameTemplateNode(
      added.structure,
      { domainId: domain.id, groupId: group.id, entryId: added.entry.id },
      name,
    ));
    setEntryId(added.entry.id);
    setFieldId('');
    setFeedback(`已在“${group.title}”下新增三级设定“${name}”。`);
    return true;
  };

  const addField = (input: string) => {
    const name = requireName(input, '四级设定');
    if (!name || !domain || !group || !entry) return false;
    let baseStructure = structure;
    let sectionId = entry.sections[0]?.id;
    if (!sectionId) {
      const sectionAdded = addTemplateSection(baseStructure, domain.id, group.id, entry.id);
      baseStructure = sectionAdded.structure;
      sectionId = sectionAdded.section.id;
    }
    const added = addTemplateField(baseStructure, domain.id, group.id, entry.id, sectionId);
    setStructure(renameTemplateNode(
      added.structure,
      { domainId: domain.id, groupId: group.id, entryId: entry.id, sectionId, fieldId: added.field.id },
      name,
    ));
    setFieldId(added.field.id);
    setFeedback(`已在“${entry.title}”下新增四级设定“${name}”。`);
    return true;
  };

  const deleteDomain = (targetDomainId: string, title: string) => {
    if (lockedLevels.domain) return;
    const next = deleteTemplateNode(structure, { domainId: targetDomainId });
    setStructure(next);
    if (targetDomainId === domain?.id) {
      const nextDomain = next[0];
      const nextGroup = nextDomain?.groups[0];
      const nextEntry = nextGroup?.entries[0];
      setDomainId(nextDomain?.id ?? '');
      setGroupId(nextGroup?.id ?? '');
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除一级分类“${title}”及其全部下级设定。`);
  };

  const deleteGroup = (targetGroupId: string, title: string) => {
    if (lockedLevels.group || !domain) return;
    const next = deleteTemplateNode(structure, { domainId: domain.id, groupId: targetGroupId });
    setStructure(next);
    if (targetGroupId === group?.id) {
      const nextGroup = next.find((item) => item.id === domain.id)?.groups[0];
      const nextEntry = nextGroup?.entries[0];
      setGroupId(nextGroup?.id ?? '');
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除二级分组“${title}”及其全部下级设定。`);
  };

  const deleteEntry = (targetEntryId: string, title: string, targetGroupId = group?.id) => {
    if (lockedLevels.entry || !domain || !targetGroupId) return;
    const next = deleteTemplateNode(structure, { domainId: domain.id, groupId: targetGroupId, entryId: targetEntryId });
    setStructure(next);
    if (targetEntryId === entry?.id) {
      const nextGroup = next.find((item) => item.id === domain.id)?.groups.find((item) => item.id === targetGroupId);
      const nextEntry = nextGroup?.entries[0];
      setEntryId(nextEntry?.id ?? '');
      setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除三级设定“${title}”及其全部四级设定。`);
  };

  const deleteField = (
    targetFieldId: string,
    title: string,
    targetEntryId = entry?.id,
    targetGroupId = group?.id,
  ) => {
    if (lockedLevels.field || !domain || !targetGroupId || !targetEntryId) return;
    const targetEntry = domain.groups
      .find((item) => item.id === targetGroupId)?.entries
      .find((item) => item.id === targetEntryId);
    const section = targetEntry?.sections.find((item) => item.fields.some((field) => field.id === targetFieldId));
    if (!section) return;
    const next = deleteTemplateNode(structure, {
      domainId: domain.id,
      groupId: targetGroupId,
      entryId: targetEntryId,
      sectionId: section.id,
      fieldId: targetFieldId,
    });
    setStructure(next);
    if (targetFieldId === fieldId) {
      const nextEntry = next
        .find((item) => item.id === domain.id)?.groups
        .find((item) => item.id === targetGroupId)?.entries
        .find((item) => item.id === targetEntryId);
      setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
    }
    setFeedback(`已删除四级设定“${title}”。`);
  };

  const toggleLevelLock = (level: DiyLevel, label: string) => {
    setLockedLevels((current) => {
      const locked = !current[level];
      setFeedback(`${label}删除功能已${locked ? '锁定' : '解锁'}。`);
      return { ...current, [level]: locked };
    });
  };

  const resetStructure = () => {
    const next = cloneTemplateStructure(professionalTemplateStructure);
    const nextDomain = next[0];
    const nextGroup = nextDomain?.groups[0];
    const nextEntry = nextGroup?.entries[0];
    setStructure(next);
    setDomainId(nextDomain?.id ?? '');
    setGroupId(nextGroup?.id ?? '');
    setEntryId(nextEntry?.id ?? '');
    setFieldId(getDiyEntryFields(nextEntry)[0]?.id ?? '');
    setLockedLevels({ domain: true, group: true, entry: true, field: true });
    setFeedback('已恢复默认完整结构，四级删除均已重新锁定。');
  };

  return {
    structure,
    domain,
    group,
    entry,
    fields,
    fieldId,
    lockedLevels,
    feedback,
    summary,
    selectDomain,
    selectGroup,
    selectEntry,
    selectPath,
    selectField: setFieldId,
    addDomain,
    addGroup,
    addEntry,
    addField,
    deleteDomain,
    deleteGroup,
    deleteEntry,
    deleteField,
    toggleLevelLock,
    resetStructure,
    setFeedback,
  };
}

export type ProfessionalTemplateDiyController = ReturnType<typeof useProfessionalTemplateDiyController>;
