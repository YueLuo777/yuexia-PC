import { PROMPT_BASED_SETTING_DOMAINS } from '@/features/workbench/model/promptBasedSettingTaxonomyData';
import {
  getPromptSettingFieldLabel,
  PROMPT_SETTING_TEMPLATES,
} from '@/features/workbench/model/promptBasedSettingTemplates';
import type { PromptTaxonomyTemplateKey } from '@/features/workbench/model/promptBasedSettingTaxonomyTypes';

import type { StructuredSettingFieldDefinition, StructuredSettingFieldSet } from './workbenchStructuredSettingDefinitions';

const TITLE_FIELD_LABELS: Partial<Record<PromptTaxonomyTemplateKey, string>> = {
  faction: '势力名',
  ability: '能力名',
  item: '物品名',
  'special-resource': '资源名',
  currency: '货币体系名',
  'world-structure': '世界架构名',
  location: '地点名',
  'danger-zone': '区域名',
  monster: '怪物名',
  foreshadow: '伏笔名称',
};

const LEGACY_FIELD_TITLES: Record<string, readonly string[]> = {
  'work-positioning:小说类型': ['故事类型'],
  'work-positioning:作品卖点': ['核心创意'],
  'work-positioning:一句话写清主线': ['一句话概括'],
  'world-background:故事发生时代': ['时代背景'],
  'world-background:主要势力': ['世界格局'],
  'world-background:社会运行规则': ['社会秩序'],
  'overall-plot:每卷安排': ['整体规划'],
  'overall-plot:全书主线目标': ['主线目标'],
  'overall-plot:前期剧情安排': ['阶段节奏'],
  'volume-plot:本卷主要任务': ['分卷总览'],
  'volume-plot:本卷核心事件': ['卷核心事件'],
  'volume-plot:本卷结尾高潮': ['卷末高潮'],
  'volume-plot:下卷剧情钩子': ['下一卷钩子'],
  'payoff-design:打脸对象': ['打脸对象设计'],
  'payoff-design:爽点铺垫': ['爽点公式'],
  'payoff-design:小爽点频率': ['爽点节奏'],
  'world-structure:世界排列和连接': ['世界架构'],
  'world-structure:世界区域划分': ['区域划分'],
  'world-structure:主要势力控制范围': ['势力分布'],
  'world-structure:主要资源产地': ['资源分布'],
  'world-structure:通行规则': ['世界规则'],
  'danger-zone:区域环境': ['区域概况'],
  'danger-zone:怪物来源': ['危险来源'],
  'danger-zone:区域历史': ['历史背景'],
  'danger-zone:区域生存规则': ['核心规则'],
  'faction:势力类型': ['基本信息'],
  'faction:核心优势': ['势力特点'],
  'faction:对主角行动': ['对主角策略'],
  'faction:当前问题': ['核心问题/矛盾'],
  'ability:能力类型': ['基本信息'],
  'ability:具体效果': ['核心效果'],
  'ability:修炼方式': ['修炼/升级'],
  'ability:能力相关伏笔': ['相关伏笔'],
  'ability:当前掌握程度': ['当前熟练度'],
  'ability:当前突破阶段': ['当前突破'],
  'ability:受损状态': ['受损/封印'],
  'ability:能力暴露风险': ['暴露程度'],
  'ability:最近使用代价': ['冷却/代价'],
  'ability:最近使用结果': ['最近使用'],
  'item:物品类型': ['基本信息'],
  'item:外观描述': ['物品描述'],
  'item:具体功能': ['效果/功能'],
  'item:物品历史': ['来历'],
  'special-resource:资源类型': ['基本信息'],
  'special-resource:获取身份条件': ['获取条件'],
  'special-resource:使用次数': ['使用规则'],
  'special-resource:使用权限': ['权限边界'],
  'currency:货币类型': ['基本信息'],
  'currency:货币品级': ['价值等级'],
  'currency:税收规则': ['关联规则'],
  'monster:外貌特征': ['怪物形象'],
  'monster:能力手段': ['怪物能力'],
  'monster:怪物来源': ['怪物背景'],
  'monster:弱点部位': ['怪物弱点'],
  'monster:分布区域': ['出没位置'],
  'monster:掉落资源': ['掉落/资源'],
  'foreshadow:伏笔编号': ['伏笔编号'],
  'foreshadow:埋设章节': ['首次出现章节'],
  'foreshadow:铺垫方式': ['铺垫方式'],
};

const createFieldKey = (template: PromptTaxonomyTemplateKey, title: string) => `prompt:${template}:${title}`;

const COMPACT_FIELD_TITLE_PATTERN =
  /(名称|别名|称号|类型|时代|视角|基调|字数|篇幅|数量|比例|频率|时间|期限|章节|等级|境界|状态|范围|位置|地点|次数|唯一性|持有者|控制者|决策者|首领|对象|知情人)$/;

const getPromptFieldDisplaySize = (title: string, wide?: boolean) => {
  if (wide) return 'expanded' as const;
  if (COMPACT_FIELD_TITLE_PATTERN.test(title)) return 'compact' as const;
  return 'standard' as const;
};

export const PROMPT_BASED_STRUCTURED_SETTING_FIELD_SETS: readonly StructuredSettingFieldSet[] =
  PROMPT_BASED_SETTING_DOMAINS.filter((domain) => domain.id !== 'character').flatMap((domain) =>
    domain.groups.flatMap((group) =>
      group.entries.map((entry) => {
        const template = PROMPT_SETTING_TEMPLATES[entry.template];
        const fields = template.sections.flatMap((section) =>
          section.fields.map((field) => {
            const title = getPromptSettingFieldLabel(entry.template, field.label);
            return {
              key: createFieldKey(entry.template, title),
              title,
              placeholder: field.hint,
              fieldClassName: field.wide ? 'col-span-2' : undefined,
              displaySize: getPromptFieldDisplaySize(title, field.wide),
              legacyTitles: LEGACY_FIELD_TITLES[`${entry.template}:${title}`],
            } satisfies StructuredSettingFieldDefinition;
          }),
        );
        return {
          id: `prompt-${entry.id}`,
          entryType: group.title,
          entryTitle: entry.title,
          matchAllTitles: domain.id !== 'work',
          titleFieldLabel: TITLE_FIELD_LABELS[entry.template] ?? '设定名',
          gridColumnsClassName: 'grid-cols-2',
          fields,
          groups: template.sections.map((section) => ({
            title: section.title,
            description: `填写${section.title}相关内容。`,
            fieldKeys: section.fields.map((field) => {
              const title = getPromptSettingFieldLabel(entry.template, field.label);
              return createFieldKey(entry.template, title);
            }),
          })),
        } satisfies StructuredSettingFieldSet;
      }),
    ),
  );
