import type { TemplateSectionNode, TemplateStructure } from './standardModeTemplateModel';

export type SmartTemplateEntrySeed = [title: string, fields: string[]];
export type SmartTemplateGroupSeed = [title: string, entries: SmartTemplateEntrySeed[]];
export type SmartTemplateDomainSeed = [title: string, groups: SmartTemplateGroupSeed[]];

function resolveSectionTitle(entryTitle: string, fieldTitle: string) {
  if (/(人物|主角|配角|反派|角色)/.test(entryTitle)) {
    if (/(金手指)/.test(fieldTitle)) return '金手指';
    if (/(姓名|身份|外貌|性格|背景|出身|经历|秘密|目标|称号|别名)/.test(fieldTitle)) return '基础档案';
    if (/(动机|原则|底线|言行|认知|计划|冲突|破绽|代价)/.test(fieldTitle)) return '动机与行为规则';
    if (/(境界|功法|战斗|能力|技能|战力|职业)/.test(fieldTitle)) return '实力与手段';
    if (/(处境|任务|风险|地点|身体|精神|状态|资源)/.test(fieldTitle)) return '当前状态';
    if (/(关系|势力|盟友|敌人)/.test(fieldTitle)) return '关系';
  }
  if (/(限制|风险|条件|规则|底线|禁区|禁止|代价)/.test(fieldTitle)) return '规则与限制';
  if (/(来源|来历|获得|获取|持有|归属)/.test(fieldTitle)) return '来源与归属';
  if (/(目标|事件|冲突|任务|高潮|结局|节奏|钩子|转折)/.test(fieldTitle)) return '剧情安排';
  return '基础设定';
}

function createSections(prefix: string, entryTitle: string, fields: string[]): TemplateSectionNode[] {
  const sections = new Map<string, string[]>();
  fields.forEach((fieldTitle) => {
    const sectionTitle = resolveSectionTitle(entryTitle, fieldTitle);
    sections.set(sectionTitle, [...(sections.get(sectionTitle) ?? []), fieldTitle]);
  });
  return [...sections.entries()].map(([sectionTitle, sectionFields], sectionIndex) => ({
    id: `${prefix}-section-${sectionIndex}`,
    title: sectionTitle,
    enabled: true,
    fields: sectionFields.map((fieldTitle, fieldIndex) => ({
      id: `${prefix}-section-${sectionIndex}-field-${fieldIndex}`,
      title: fieldTitle,
      enabled: true,
      value: '',
    })),
  }));
}

export function createSmartTemplateStructure(
  prefix: string,
  domains: SmartTemplateDomainSeed[],
): TemplateStructure {
  return domains.map(([domainTitle, groups], domainIndex) => ({
    id: `${prefix}-domain-${domainIndex}`,
    title: domainTitle,
    enabled: true,
    groups: groups.map(([groupTitle, entries], groupIndex) => ({
      id: `${prefix}-group-${domainIndex}-${groupIndex}`,
      title: groupTitle,
      enabled: true,
      entries: entries.map(([entryTitle, fields], entryIndex) => {
        const entryPrefix = `${prefix}-entry-${domainIndex}-${groupIndex}-${entryIndex}`;
        return {
        id: entryPrefix,
        title: entryTitle,
        enabled: true,
        sections: createSections(entryPrefix, entryTitle, fields),
      }}),
    })),
  }));
}
