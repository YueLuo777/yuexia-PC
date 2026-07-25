import {
  SETTING_IMPORT_ROLE_TOP_LABELS,
  SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES,
} from '@/features/workbench/model/workbenchSettingTaxonomy';

import {
  buildRoleStateSettingsText,
  createEmptyRoleBaseSettingFields,
  createEmptyRoleStateSettings,
  stringifyRoleBaseSettingFields,
  type RoleContent,
} from './workbenchRoleContent';
import {
  getPromptRoleFieldSections,
  getPromptRoleStateKey,
  stringifyPromptRoleBaseFields,
} from './workbenchPromptRoleFields';
import { normalizeSettingType, parseSectionedSettingBody } from './workbenchStructuredSettings';

const DEFAULT_MALE_PROTAGONIST_ROLE_TYPE = '男主角';
const DEFAULT_MALE_PROTAGONIST_ROLE_TITLE = '男主角';

export type SmartImportSettingSegment = { title: string; type: string; body: string };
export type SmartImportRoleSegment = { title: string; body: string };
export type SmartImportTaggedSegments = {
  settingSegments: SmartImportSettingSegment[];
  roleSegments: SmartImportRoleSegment[];
};

export function getImportedRoleSection(sections: Record<string, string>, names: string[]) {
  for (const name of names) {
    const value = sections[name]?.trim();
    if (value) return value;
  }
  return '';
}

export function buildImportedRoleEntryTitle(segment: SmartImportRoleSegment, existingRoleTitle = '') {
  const sections = parseSectionedSettingBody(segment.body);
  const explicitName = getImportedRoleSection(sections, ['人物姓名', '姓名', '角色姓名', '名字']);
  if (explicitName) return explicitName;
  if (/男主角|主角/.test(segment.title) && existingRoleTitle.trim()) return existingRoleTitle;
  return segment.title.replace(/设定$/, '').trim() || DEFAULT_MALE_PROTAGONIST_ROLE_TITLE;
}

export function createImportedRoleContent(segment: SmartImportRoleSegment, existingRole?: RoleContent): RoleContent {
  const sections = parseSectionedSettingBody(segment.body);
  const importedType = getImportedRoleSection(sections, ['身份定位', '角色定位', '人物定位', '身份', '类型']);
  const type =
    importedType ||
    existingRole?.type ||
    (/男主角|主角/.test(segment.title) ? DEFAULT_MALE_PROTAGONIST_ROLE_TYPE : '未分类');
  const promptFields = Object.fromEntries(
    getPromptRoleFieldSections(type)
      .flatMap((section) => section.fields)
      .map((field) => {
        const aliases: Record<string, string[]> = {
          性格: ['核心性格', '人设'],
          称号: ['称号/外号/别称', '外号'],
          别名: ['化名', '别称'],
          人物经历: ['人物背景', '背景', '经历', '身世'],
          金手指当前功能: ['金手指/能力', '金手指', '能力规则', '能力'],
        };
        return [field.key, getImportedRoleSection(sections, [field.label, ...(aliases[field.label] ?? [])])];
      }),
  );
  const baseFields = createEmptyRoleBaseSettingFields();
  baseFields.appearance = getImportedRoleSection(sections, ['外貌', '人物外貌', '形象']);
  baseFields.aliasName = getImportedRoleSection(sections, ['称号/外号/别称', '称号', '外号', '别称', '别名']);
  baseFields.corePersonality = getImportedRoleSection(sections, ['核心性格', '性格', '人设']);
  baseFields.background = getImportedRoleSection(sections, ['人物背景', '背景', '经历', '身世']);
  baseFields.abilityRules = getImportedRoleSection(sections, ['金手指/能力', '金手指', '能力规则', '能力']);
  const hasBaseFields = Object.values(baseFields).some((value) => value.trim());
  const stateSettings = createEmptyRoleStateSettings();
  stateSettings.currentSituation = getImportedRoleSection(sections, ['当前处境', '处境']);
  stateSettings.currentGoal = getImportedRoleSection(sections, ['当前目标', '目标']);
  stateSettings.abilityState = getImportedRoleSection(sections, ['能力状态']);
  stateSettings.resourceState = getImportedRoleSection(sections, ['资源状态']);
  stateSettings.otherState = getImportedRoleSection(sections, ['其他', '其他状态']);
  getPromptRoleFieldSections(type)
    .flatMap((section) => section.fields)
    .forEach((field) => {
      const stateKey = getPromptRoleStateKey(field.label);
      const value = promptFields[field.key]?.trim();
      if (stateKey && value) stateSettings[stateKey] = value;
    });
  const relationship = getImportedRoleSection(sections, ['人物关系', '关系']);
  const hasPromptFields = Object.values(promptFields).some((value) => value.trim());
  const baseSetting = hasPromptFields
    ? stringifyPromptRoleBaseFields(type, promptFields)
    : hasBaseFields
      ? stringifyRoleBaseSettingFields(baseFields)
      : segment.body.trim();
  return {
    type,
    lifeStatus:
      getImportedRoleSection(sections, ['生存状态', '存活状态']) === '死亡'
        ? '死亡'
        : (existingRole?.lifeStatus ?? '存活'),
    baseSetting,
    relationship,
    stateSettings,
    stateUpdateChapters: existingRole?.stateUpdateChapters ?? {},
    personality: getImportedRoleSection(sections, ['性格', '核心性格', '人设']) || baseFields.corePersonality,
    background: baseFields.background || baseSetting,
    status: buildRoleStateSettingsText(stateSettings),
    history: existingRole?.history ?? [],
  };
}

export function normalizeImportedSettingKey(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeImportedSettingBody(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}

export function classifySettingText(text: string) {
  const source = text.toLowerCase();
  if (/(爽点|卖点|期待感|差异点|题材|男频|读者第一眼)/.test(source)) return '核心设定';
  if (
    /(境界|等级|阶位|成长|修炼|突破|修为|职业|技能|资源消耗|晋升|练气|筑基|金丹|元婴|化神|异能等级|机甲等级|基因等级)/.test(
      source,
    )
  )
    return '核心设定';
  if (/(金手指|外挂|独有能力|代价|升级方式|误用风险|系统|面板)/.test(source)) return '功法能力';
  if (/(邪教|魔教|反派组织|敌对|黑暗势力|反派势力)/.test(source)) return '反派势力';
  if (/(中立|商会|协会|交易所|佣兵|旁观势力)/.test(source)) return '中立势力';
  if (/(宗门|家族|王朝|帮派|军队|学院|公司|财团|组织|势力|联盟|官方|阵营)/.test(source)) return '正派势力';
  if (/(妖兽|怪兽|怪物|魔兽|异兽|凶兽|灵兽|灵宠|邪祟|兽潮|妖丹|兽骨|鳞甲|毒囊)/.test(source)) return '常见怪物';
  if (/(人物关系|关系网|关系规则|家族谱系|阵营关系)/.test(source)) return '核心设定';
  if (/(功法|能力|技能|神通|法术|异能|招式)/.test(source)) return '功法能力';
  if (/(货币|灵石|金币|资源|材料|能源|消耗|储备)/.test(source)) return '资源货币';
  if (/(权限|唯一|稀缺|特殊资源|资格|名额)/.test(source)) return '特殊资源';
  if (/(道具|装备|物品|法宝|武器|载具|机甲)/.test(source)) return '物品装备';
  if (/(秘境|遗迹)/.test(source)) return '秘境遗迹';
  if (/(禁区|危险|禁地|灾区|战场|污染区)/.test(source)) return '危险区域';
  if (/(地点|地图|交通|地域|地理|重要地点|世界地图)/.test(source)) return '其他地点';
  if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '剧情规划';
  if (/(人物伏笔|身份秘密|角色秘密|人物线索)/.test(source)) return '人物伏笔';
  if (/(伏笔|线索|暗示|秘密|谜团|隐藏|后续|埋下|回收|真相)/.test(source)) return '主线伏笔';
  if (/(禁写|不能写错|不能越界|硬约束|前后矛盾|规则红线)/.test(source)) return '创作规范';
  if (/(世界|规则|背景|科技|修炼|社会秩序|限制条件|天道|能量)/.test(source)) return '核心设定';
  if (/(核心|定位|承诺|主角处境|底层设定)/.test(source)) return '核心设定';
  return '核心设定';
}

export function createImportItemSegments(sectionBody: string, fallbackTitle: string) {
  const itemPattern = /^\s*(?:\*([^*\n]+)\*|#([^#\n]+)#)\s*[：:]\s*/gm;
  const itemMatches = [...sectionBody.matchAll(itemPattern)];
  if (itemMatches.length === 0)
    return [
      {
        title: fallbackTitle,
        body: sectionBody.trim(),
      },
    ];

  return itemMatches
    .map((itemMatch, index) => {
      const title = (itemMatch[1] ?? itemMatch[2] ?? '').trim();
      const bodyStart = (itemMatch.index ?? 0) + itemMatch[0].length;
      const bodyEnd =
        index + 1 < itemMatches.length ? (itemMatches[index + 1].index ?? sectionBody.length) : sectionBody.length;
      return {
        title,
        body: sectionBody.slice(bodyStart, bodyEnd).trim(),
      };
    })
    .filter((item) => item.title && item.body);
}

export function collectTaggedSettingSegments(
  text: string,
  forcedDefaultType: string | null,
  result: SmartImportTaggedSegments,
) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return;
  const sectionPattern = /<([^<>/]+)>\s*([\s\S]*?)\s*<\/\1>/g;
  let matched = false;

  for (const sectionMatch of normalized.matchAll(sectionPattern)) {
    matched = true;
    const type = (sectionMatch[1] ?? '').trim();
    const sectionBody = (sectionMatch[2] ?? '').trim();
    if (!type || !sectionBody) continue;

    if (SETTING_IMPORT_ROLE_TOP_LABELS.has(type)) {
      createImportItemSegments(sectionBody, DEFAULT_MALE_PROTAGONIST_ROLE_TITLE).forEach((item) =>
        result.roleSegments.push(item),
      );
      continue;
    }

    const topDefaultType = SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES[type] ?? null;
    if (topDefaultType) {
      const beforeCount = result.settingSegments.length + result.roleSegments.length;
      collectTaggedSettingSegments(sectionBody, topDefaultType, result);
      if (result.settingSegments.length + result.roleSegments.length === beforeCount) {
        createImportItemSegments(sectionBody, topDefaultType).forEach((item) =>
          result.settingSegments.push({ ...item, type: topDefaultType }),
        );
      }
      continue;
    }

    const normalizedType = normalizeSettingType(type);
    createImportItemSegments(sectionBody, normalizedType).forEach((item) =>
      result.settingSegments.push({ ...item, type: normalizedType }),
    );
  }

  if (!matched && forcedDefaultType) {
    createImportItemSegments(normalized, forcedDefaultType).forEach((item) =>
      result.settingSegments.push({ ...item, type: forcedDefaultType }),
    );
  }
}

export function createTaggedSettingSegments(text: string): SmartImportTaggedSegments {
  const result: SmartImportTaggedSegments = {
    settingSegments: [],
    roleSegments: [],
  };
  collectTaggedSettingSegments(text, null, result);
  return result;
}

export function createSmartSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const rawBlocks = normalized
    .split(
      /\n{2,}|(?=\n\s*(?:第[一二三四五六七八九十百千万\d]+[章节卷]|[一二三四五六七八九十]+[、.．]|[0-9]+[、.．]|[-*]\s+))/,
    )
    .map((item) => item.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
  const blocks = rawBlocks.length > 0 ? rawBlocks : [normalized];
  return blocks.map((body, index) => {
    const firstLine =
      body
        .split('\n')
        .find((line) => line.trim())
        ?.trim() ?? '';
    const title =
      firstLine
        .replace(/^#+\s*/, '')
        .replace(/^[一二三四五六七八九十]+[、.．]\s*/, '')
        .replace(/^[0-9]+[、.．]\s*/, '')
        .slice(0, 24) || `智能设定${index + 1}`;
    return {
      title,
      type: classifySettingText(body),
      body,
    };
  });
}

export function cleanMarkdownHeadingTitle(text: string) {
  return text
    .replace(/^#+\s*/, '')
    .replace(/\s*#+\s*$/, '')
    .trim();
}

export function createMarkdownSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const segments: Array<{ title: string; type: string; body: string }> = [];
  let currentType = '';
  let currentTitle = '';
  let bodyLines: string[] = [];

  const flush = () => {
    const title = currentTitle.trim();
    if (!title) {
      bodyLines = [];
      return;
    }
    const body = bodyLines
      .join('\n')
      .replace(/^#{1,6}\s*/gm, '')
      .trim();
    segments.push({
      title,
      type: currentType.trim() || classifySettingText(`${title}\n${body}`),
      body,
    });
    bodyLines = [];
  };

  normalized.split('\n').forEach((line) => {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) {
      if (currentTitle) bodyLines.push(line);
      return;
    }

    const level = heading[1].length;
    const title = cleanMarkdownHeadingTitle(heading[2] ?? '');
    if (!title) return;

    if (level === 1) {
      flush();
      currentType = title;
      currentTitle = '';
      return;
    }

    if (level === 2) {
      flush();
      currentTitle = title;
      return;
    }

    if (currentTitle) bodyLines.push(title);
  });

  flush();
  return segments;
}
