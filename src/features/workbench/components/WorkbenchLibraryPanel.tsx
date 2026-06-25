import { ChevronDown, ChevronRight, Folder, FolderOpen, Lock, Pin, Plus, Search, Settings, Square, Trash2, Unlock, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type SetStateAction } from 'react';
import type { CSSProperties } from 'react';
import type { DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { useModels } from '@/features/models/hooks/useModels';
import { callModel, callModelStream } from '@/features/models/services/callModel';
import { readPlotLibrarySnapshot } from '@/features/plot-library/hooks/usePlotLibrary';
import { normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { shouldSyncOutlinePreviewDraft } from '@/features/workbench/model/workbenchOutlineSync';
import { getPlotPointScoreColorClass, prepareCollapsedPlotPointCard } from '@/features/workbench/model/workbenchPlotPointCard';
import {
  DEFAULT_PLOT_POINT_OPENING_ELEMENTS,
  PLOT_POINT_CHAIN_SLOTS,
  PLOT_POINT_FALLBACK_CANDIDATES,
  PLOT_POINT_GENERATE_COUNTS,
  PLOT_POINT_OPENING_ELEMENT_OPTIONS,
  getPlotPointLengthLabel,
  getWorkbenchPlotPointDecisionMetrics,
  getWorkbenchPlotPointDisplayText,
  getWorkbenchPlotPointFitClass,
  getWorkbenchPlotPointFitLabel,
  getWorkbenchPlotPointMetricClass,
  getWorkbenchPlotPointPreviewText,
  getWorkbenchPlotPointReview,
  getWorkbenchPlotPointText,
  normalizePlotPointChainNames,
  normalizePlotPointChainSelections,
  normalizePlotPointChainSlot,
  normalizePlotPointGenerateCount,
  normalizePlotPointLengthMode,
  normalizePlotPointOpeningElements,
  normalizePlotPointSourceMode,
  plotLibraryItemToCandidate,
  type PlotPointChainSlot,
  type PlotPointLengthMode,
  type PlotPointSourceMode,
  type WorkbenchPlotPointCandidate,
} from '@/features/workbench/model/workbenchPlotChain';
import { buildPlotPointOutputFormatInstruction } from '@/features/workbench/model/workbenchPlotPointPrompt';
import { joinAiRequestSections, wrapAiRequestTag } from '@/features/workbench/model/workbenchAiRequestTagPolicy';
import {
  DEFAULT_WORKBENCH_ROLE_TYPES,
  canCreateWorkbenchRoleInType,
  getInitialPlotChainRoleIds,
  getPlotPointProtagonistReplacementRule,
  isDefaultWorkbenchRoleType,
  isMaleProtagonistRoleType,
  normalizeWorkbenchRoleLifeStatus,
  normalizeWorkbenchRoleType,
  shouldShowRolePinAction,
} from '@/features/workbench/model/workbenchRoleTypes';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  createWorkbenchLibraryEntry,
  readWorkbenchLibraryEntries,
  readWorkbenchLibraryEntriesWithGlobalBrainstorm,
  writeWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntriesWithGlobalBrainstorm,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  getWorkbenchAssociationRuntimeId,
  isWorkbenchAssociationRuntimeCurrent,
} from '@/features/workbench/model/workbenchAssociationCleanup';
import type { Chapter, Volume } from '@/features/workbench/model/workbenchTypes';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import {
  getBackgroundAiTask,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
  type BackgroundAiTask,
} from '@/shared/ai/backgroundAiTasks';
import { AiRequestLogContent, AiRequestLogGroups, type AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import { LinkedSourceControl } from '@/shared/ui/LinkedSourceControl';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { WordCountText } from '@/shared/ui/WordCountText';

const WORKBENCH_FOLDER_GROUP_BUTTON_CLASS = 'group flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#BDEEF7] xy-flow-group-bg px-1 text-left text-[14px] font-black text-[#1f2933] shadow-sm transition-colors';
const WORKBENCH_FOLDER_GROUP_ICON_CLASS = 'h-[17px] w-[17px] shrink-0 text-[#08AACE]';
const WORKBENCH_FOLDER_GROUP_COUNT_CLASS = 'rounded-full bg-white/70 px-2 py-0.5 text-xs font-black text-[#6f7e90]';
const WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS = 'min-h-[38px] w-full rounded-xl border border-transparent bg-white px-4 py-2 text-left text-sm font-black leading-5 shadow-sm';
const WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS = `group cursor-default select-none ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} transition-[background-color,border-color,box-shadow,opacity,transform] duration-150`;
const WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS = `flex items-center ${WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS} text-gray-400`;
const DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS = 'flex h-[42px] shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-[#fbfbfc] px-3 py-2.5';
const DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS = 'whitespace-nowrap text-sm font-bold text-gray-900';
const DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS = 'flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F8FD] text-xs font-medium text-[#08AACE]';
const DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS = 'flex items-center justify-center whitespace-nowrap rounded-md bg-[#08AACE] px-2 py-1 text-sm text-white transition-colors hover:bg-[#0798b8]';
const DETAIL_OUTLINE_VOLUME_ROW_CLASS = WORKBENCH_FOLDER_GROUP_BUTTON_CLASS;
const DETAIL_OUTLINE_VOLUME_ICON_CLASS = WORKBENCH_FOLDER_GROUP_ICON_CLASS;
const DETAIL_OUTLINE_VOLUME_TITLE_CLASS = 'min-w-0 flex-1 truncate leading-none';
const DETAIL_OUTLINE_VOLUME_COUNT_CLASS = WORKBENCH_FOLDER_GROUP_COUNT_CLASS;
const SETTING_SEGMENTED_TAB_GROUP_CLASS = 'flex h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white';
const SETTING_SEGMENTED_TAB_BUTTON_CLASS = 'min-w-[96px] px-4 text-sm font-black transition-colors';
const SETTING_SEGMENTED_TAB_ACTIVE_CLASS = 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]';
const SETTING_SEGMENTED_TAB_IDLE_CLASS = 'bg-white text-slate-600 hover:bg-[#EAF9FD] hover:text-[#078FAE]';

const FLOATING_AI_TEXTAREA_MIN_HEIGHT = 46;

type SettingSegmentedTabsProps<T extends string> = {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
};

function SettingSegmentedTabs<T extends string>({ tabs, activeTab, onChange }: SettingSegmentedTabsProps<T>) {
  return (
    <div className={SETTING_SEGMENTED_TAB_GROUP_CLASS}>
      {tabs.map((tab, index) => {
        const active = activeTab === tab;
        const borderClassName = index === 0 ? '' : 'border-l border-gray-200';
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`${SETTING_SEGMENTED_TAB_BUTTON_CLASS} ${borderClassName} ${
              active ? SETTING_SEGMENTED_TAB_ACTIVE_CLASS : SETTING_SEGMENTED_TAB_IDLE_CLASS
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
const FLOATING_AI_TEXTAREA_MAX_HEIGHT = 162;

function resizeFloatingAiTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.min(
    FLOATING_AI_TEXTAREA_MAX_HEIGHT,
    Math.max(FLOATING_AI_TEXTAREA_MIN_HEIGHT, textarea.scrollHeight),
  );
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > FLOATING_AI_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
}

interface WorkbenchLibraryPanelProps {
  storageKey: string;
  tabs: string[];
  emptyText: string;
  volumes?: Volume[];
  getChapterContent?: (chapterId: number) => string;
  outlineStorageKey?: string;
  scale?: number;
  defaultActiveTab?: string;
  fieldSizeOpenSignal?: number;
  showInlineFieldSizeButton?: boolean;
  openLogSignal?: number;
  openPlotPointSignal?: number;
  plotPointStandalone?: boolean;
  onOpenDetailOutlineFromPlotChain?: () => void;
  toolbarPortalId?: string;
}

type RoleStateFieldKey =
  | 'currentSituation'
  | 'currentGoal'
  | 'abilityState'
  | 'resourceState'
  | 'otherState';

type RoleStateFieldLevel = '每章更新' | '变化时更新' | '按需关联' | '硬性约束';

type RoleStateSettings = Record<RoleStateFieldKey, string>;
type RoleStateUpdateChapterKey = RoleStateFieldKey | 'relationshipState';
type RoleStateUpdateChapters = Partial<Record<RoleStateUpdateChapterKey, number>>;
type RoleBaseSettingFieldKey =
  | 'appearance'
  | 'aliasName'
  | 'corePersonality'
  | 'background'
  | 'abilityRules';

const ROLE_STATE_FIELD_DEFINITIONS: Array<{
  key: RoleStateFieldKey;
  title: string;
  level: RoleStateFieldLevel;
}> = [
  { key: 'currentSituation', title: '当前处境', level: '每章更新' },
  { key: 'currentGoal', title: '当前目标', level: '每章更新' },
  { key: 'abilityState', title: '能力状态', level: '每章更新' },
  { key: 'resourceState', title: '资源状态', level: '变化时更新' },
  { key: 'otherState', title: '其他', level: '按需关联' },
];

const ROLE_BASE_SETTING_FIELD_DEFINITIONS: Array<{
  key: RoleBaseSettingFieldKey;
  title: string;
  placeholder: string;
}> = [
  { key: 'appearance', title: '外貌', placeholder: '身形、容貌、衣着、气质、标志性细节。' },
  { key: 'aliasName', title: '称号/外号/别称', placeholder: '江湖称号、常用外号、化名、别称或他人称呼。' },
  { key: 'corePersonality', title: '核心性格', placeholder: '稳定性格、行事原则、情绪底色和关键弱点。' },
  { key: 'background', title: '人物背景', placeholder: '出身、经历、秘密、创伤、目标来源。' },
  { key: 'abilityRules', title: '金手指/能力', placeholder: '能力来源、边界、代价、限制和成长规则。' },
];

interface RoleContent {
  type: string;
  lifeStatus: '存活' | '死亡';
  baseSetting: string;
  relationship: string;
  stateSettings: RoleStateSettings;
  stateUpdateChapters?: RoleStateUpdateChapters;
  personality: string;
  background: string;
  status: string;
  history?: RoleHistoryVersion[];
}

type SmartImportSettingSegment = { title: string; type: string; body: string };
type SmartImportRoleSegment = { title: string; body: string };
type SmartImportTaggedSegments = {
  settingSegments: SmartImportSettingSegment[];
  roleSegments: SmartImportRoleSegment[];
};

interface RoleHistoryVersion {
  title: string;
  type: string;
  lifeStatus: '存活' | '死亡';
  baseSetting: string;
  relationship: string;
  stateSettings: RoleStateSettings;
  stateUpdateChapters?: RoleStateUpdateChapters;
  personality: string;
  background: string;
  status: string;
  savedAt: string;
}

interface SettingContent {
  type: string;
  body: string;
  structuredFieldSetId?: string;
  lockedDefaultEntryId?: string;
}

type StructuredSettingFieldDefinition = {
  key: string;
  title: string;
  placeholder?: string;
  control?: 'input' | 'textarea';
  maxLength?: number;
  fieldClassName?: string;
};

type StructuredSettingFieldGroup = {
  title: string;
  description: string;
  fieldKeys: readonly string[];
};

type StructuredSettingFieldSet = {
  id: string;
  entryType: string;
  entryTitle: string;
  matchAllTitles?: boolean;
  titleFieldLabel?: string;
  titleFieldGroupTitle?: string;
  gridColumnsClassName: string;
  gridContentClassName?: string;
  headerFieldKeys?: readonly string[];
  fields: readonly StructuredSettingFieldDefinition[];
  groups?: readonly StructuredSettingFieldGroup[];
};

const STRUCTURED_SETTING_TABS = ['固定设定', '状态设定', '确认'] as const;
type StructuredSettingTab = (typeof STRUCTURED_SETTING_TABS)[number];

const DEFAULT_ROLE_TYPES = DEFAULT_WORKBENCH_ROLE_TYPES;
const DEFAULT_MALE_PROTAGONIST_ROLE_TYPE = '男主角';
const DEFAULT_MALE_PROTAGONIST_ROLE_TITLE = '男主角';

function isMaleProtagonistRoleTypeChangeLocked(currentType: string, nextType: string) {
  return isMaleProtagonistRoleType(currentType) && !isMaleProtagonistRoleType(nextType);
}

const BASIC_SETTING_ENTRY_TYPE = '核心设定';
const BASIC_SETTING_ENTRY_TITLE = '基础设定';
const MONSTER_BESTIARY_FIELDS: readonly StructuredSettingFieldDefinition[] = [
  { key: 'monsterImage', title: '怪物形象', placeholder: '体型、外貌、颜色、标志性器官、压迫感和辨认特征。' },
  { key: 'monsterAbility', title: '怪物能力', placeholder: '攻击方式、天赋能力、防御特性、特殊感知、族群配合或战斗习惯。' },
  { key: 'monsterBackground', title: '怪物背景', placeholder: '来源、种族来历、诞生原因、传说、与地图/势力/主线的关联。' },
  { key: 'monsterWeakness', title: '怪物弱点', placeholder: '弱点部位、克制方式、恐惧物、行动限制、破解条件和禁忌。' },
  { key: 'habitatTrace', title: '出没位置', placeholder: '栖息地、当前出没区域、最近出现章节、是否正在追踪或伏击角色。' },
  { key: 'dropResources', title: '掉落/资源', placeholder: '妖丹、兽骨、鳞甲、毒囊、血脉、材料、情报或可获取收益。' },
];
const FORESHADOW_SETTING_FIELDS: readonly StructuredSettingFieldDefinition[] = [
  { key: 'foreshadowCode', title: '伏笔编号', placeholder: '最多 10 位编号。', control: 'input', maxLength: 10, fieldClassName: 'h-[48px] w-[150px] shrink-0' },
  { key: 'firstSeenChapter', title: '首次出现章节', placeholder: '第3章', control: 'input', maxLength: 7, fieldClassName: 'h-[48px] w-[170px] shrink-0' },
  { key: 'recoveredChapter', title: '回收章节', placeholder: '第36章', control: 'input', maxLength: 7, fieldClassName: 'h-[48px] w-[150px] shrink-0' },
  { key: 'relatedObject', title: '关联对象', placeholder: '关联人物、道具、势力、地图、怪物或剧情事件。', fieldClassName: 'min-h-[150px]' },
  { key: 'setupMethod', title: '铺垫方式', placeholder: '读者第一次看到它时是什么形式，例如异常反应、对话暗示、物品细节或旁人失态。', fieldClassName: 'min-h-[150px]' },
  { key: 'foreshadowContent', title: '伏笔内容', placeholder: '详细写明表层信息、隐藏真相、后续反转、回收方式和对剧情的影响。', fieldClassName: 'col-span-2 min-h-[260px]' },
];
const STRUCTURED_SETTING_FIELD_SETS: readonly StructuredSettingFieldSet[] = [
  {
    id: 'work-core-basic',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: BASIC_SETTING_ENTRY_TITLE,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'storyType', title: '故事类型', placeholder: '题材类型、时代背景、风格方向和读者期待。' },
      { key: 'coreConcept', title: '核心创意', placeholder: '这本书最核心、最有辨识度的卖点。' },
      { key: 'oneSentenceSummary', title: '一句话概括', placeholder: '用一句话概括主角、目标、冲突和看点。' },
    ],
  },
  {
    id: 'work-core-world-view',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: '世界观',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'eraBackground', title: '时代背景', placeholder: '故事发生的时代、文明状态、历史阶段和基础环境。' },
      { key: 'worldPattern', title: '世界格局', placeholder: '国家、宗门、势力范围、区域关系和主要冲突格局。' },
      { key: 'socialOrder', title: '社会秩序', placeholder: '权力、法律、阶层、交易、宗门或国家规则如何运转。' },
    ],
  },
  {
    id: 'work-core-cheat-advantage',
    entryType: BASIC_SETTING_ENTRY_TYPE,
    entryTitle: '主角金手指/优势',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'abilitySource', title: '能力来源', placeholder: '金手指从哪里来，主角为什么拥有它。' },
      { key: 'coreFunction', title: '核心功能', placeholder: '最常用、最能制造爽点的主要能力。' },
      { key: 'upgradeMethod', title: '升级方式', placeholder: '如何解锁、进阶、强化或扩展能力。' },
      { key: 'useLimit', title: '使用限制', placeholder: '冷却、代价、条件、风险，以及不能做到什么。' },
      { key: 'hiddenTruth', title: '隐藏真相', placeholder: '金手指背后的来源、阴谋、使命或后期反转。' },
    ],
  },
  {
    id: 'faction-righteous-no-1',
    entryType: '正派势力',
    entryTitle: '1号势力',
    titleFieldLabel: '势力名',
    titleFieldGroupTitle: '固定设定',
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '固定设定',
        description: '长期档案，智能导入时优先补全，后续除非设定变更通常不覆盖。',
        fieldKeys: ['basicInfo', 'factionTraits', 'organization', 'mainCharacters'],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，智能更新时优先刷新这一侧。',
        fieldKeys: ['factionRelations', 'protagonistStrategy', 'coreConflict'],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '势力名称、类型、地盘、公开身份、核心资源和当前定位。' },
      { key: 'factionTraits', title: '势力特点', placeholder: '行事风格、价值观、优势、短板、外界印象。' },
      { key: 'organization', title: '组织架构', placeholder: '首领、长老、部门、等级、权力来源和决策方式。' },
      { key: 'mainCharacters', title: '主要人物', placeholder: '首领、代表人物、关键成员，以及他们在势力中的作用。' },
      { key: 'factionRelations', title: '势力关系', placeholder: '当前盟友、敌人、合作对象、冲突对象和利益绑定。' },
      { key: 'protagonistStrategy', title: '对主角策略', placeholder: '当前如何拉拢、利用、保护、试探、压制或追杀主角。' },
      { key: 'coreConflict', title: '核心问题/矛盾', placeholder: '当前内部隐患、外部压力、资源危机、路线冲突或待解决问题。' },
    ],
  },
  {
    id: 'faction-world-map',
    entryType: '世界地图',
    entryTitle: '世界地图',
    matchAllTitles: true,
    titleFieldLabel: '地图名',
    titleFieldGroupTitle: '固定设定',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'mapOverview', title: '世界架构', placeholder: '大陆规模、地理风貌、主要国家/宗门分布和世界层级。' },
      { key: 'regionDivision', title: '区域划分', placeholder: '国家、城池、宗门地盘、荒域、边境、海域等区域层级。' },
      { key: 'factionDistribution', title: '势力分布', placeholder: '哪些势力控制哪些地域，边界、缓冲区和争夺区在哪里。' },
      { key: 'resourceDistribution', title: '资源分布', placeholder: '矿脉、灵药、妖兽材料、遗迹、交易中心和稀缺产地。' },
      { key: 'geographyRules', title: '世界规则', placeholder: '禁飞、灵气浓度、空间异常、天气灾害等地图底层规则。' },
    ],
  },
  {
    id: 'faction-danger-zone',
    entryType: '世界地图',
    entryTitle: '危险区域',
    matchAllTitles: true,
    titleFieldLabel: '区域名',
    titleFieldGroupTitle: '固定设定',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'zoneOverview', title: '区域概况', placeholder: '危险区类型、范围、环境、入口位置和外界认知。' },
      { key: 'dangerSource', title: '危险来源', placeholder: '怪物、机关、污染、阵法、诅咒、空间异常或人为伏击。' },
      { key: 'entryCondition', title: '进入条件', placeholder: '开启时间、令牌、境界限制、路线门槛、代价和禁忌。' },
      { key: 'resourceReward', title: '资源收益', placeholder: '灵药、矿石、妖丹、传承、情报、地图线索和可获得奖励。' },
      { key: 'historyBackground', title: '历史背景', placeholder: '禁区形成原因、旧战场、遗迹主人、传说和主线关联。' },
      { key: 'coreRules', title: '核心规则', placeholder: '危险区内不可违反的底层规则、触发机制和生存限制。' },
    ],
  },
  {
    id: 'monster-list',
    entryType: '怪物列表',
    entryTitle: '怪物图鉴',
    matchAllTitles: true,
    titleFieldLabel: '怪物名',
    gridColumnsClassName: 'grid-cols-2',
    fields: MONSTER_BESTIARY_FIELDS,
  },
  {
    id: 'foreshadow-main',
    entryType: '主线伏笔',
    entryTitle: '1号主线伏笔',
    matchAllTitles: true,
    titleFieldLabel: '伏笔名称',
    gridColumnsClassName: 'grid-cols-2',
    gridContentClassName: 'content-start auto-rows-min',
    headerFieldKeys: ['foreshadowCode', 'firstSeenChapter', 'recoveredChapter'],
    fields: FORESHADOW_SETTING_FIELDS,
  },
  {
    id: 'foreshadow-character',
    entryType: '人物伏笔',
    entryTitle: '1号人物伏笔',
    matchAllTitles: true,
    titleFieldLabel: '伏笔名称',
    gridColumnsClassName: 'grid-cols-2',
    gridContentClassName: 'content-start auto-rows-min',
    headerFieldKeys: ['foreshadowCode', 'firstSeenChapter', 'recoveredChapter'],
    fields: FORESHADOW_SETTING_FIELDS,
  },
  {
    id: 'item-ability',
    entryType: '功法能力',
    entryTitle: '功法能力',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '固定设定',
        description: '功法能力的长期规则，记录来源、核心效果、成长方式、限制和伏笔。',
        fieldKeys: ['basicInfo', 'abilitySource', 'coreEffect', 'growthMethod', 'useLimit', 'foreshadowing'],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，AI 更新时只刷新熟练度、突破、受损封印、暴露程度、代价和最近使用。',
        fieldKeys: ['currentMastery', 'breakthroughState', 'damageSeal', 'exposureLevel', 'cooldownCost', 'recentUse'],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '功法/能力名称、类型、等级、首次登场章节。' },
      { key: 'abilitySource', title: '能力来源', placeholder: '传承、血脉、系统、法宝、师承、禁术或特殊机缘。' },
      { key: 'coreEffect', title: '核心效果', placeholder: '主要能力、战斗表现、辅助用途、剧情作用和辨识度。' },
      { key: 'growthMethod', title: '修炼/升级', placeholder: '如何修炼、突破条件、熟练度提升方式、进阶材料或代价。' },
      { key: 'useLimit', title: '使用限制', placeholder: '冷却、消耗、境界门槛、反噬、禁忌、不能做到什么。' },
      { key: 'foreshadowing', title: '相关伏笔', placeholder: '隐藏形态、后续解锁、来源秘密、与人物身世或主线的关联。' },
      { key: 'currentMastery', title: '当前熟练度', placeholder: '当前掌握到什么程度、能稳定使用哪些招式。' },
      { key: 'breakthroughState', title: '当前突破', placeholder: '是否接近突破、卡在哪一层、缺少什么条件。' },
      { key: 'damageSeal', title: '受损/封印', placeholder: '是否受损、被封、被污染、被限制或暂时无法使用。' },
      { key: 'exposureLevel', title: '暴露程度', placeholder: '是否被他人知晓、被谁识破、会引来什么风险。' },
      { key: 'cooldownCost', title: '冷却/代价', placeholder: '最近使用后的冷却、消耗、反噬、伤势或副作用。' },
      { key: 'recentUse', title: '最近使用', placeholder: '最近章节中何时使用、造成什么结果、留下什么线索。' },
    ],
  },
  {
    id: 'item-resource-currency',
    entryType: '资源货币',
    entryTitle: '资源货币',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '资源名称、货币类型、主要用途、流通范围。' },
      { key: 'valueLevel', title: '价值等级', placeholder: '下品、中品、上品等换算比例、购买力和价格边界。' },
      { key: 'acquireChannel', title: '获取渠道', placeholder: '矿脉、任务、宗门俸禄、交易、掠夺、奖励。' },
      { key: 'consumeUsage', title: '消耗用途', placeholder: '修炼、炼器、阵法、交通、情报、治疗等消耗场景。' },
      { key: 'circulationLimit', title: '流通限制', placeholder: '禁区、黑市、势力管制、假币、兑换门槛。' },
      { key: 'relatedRules', title: '关联规则', placeholder: '与势力税收、资源矿脉、物品价格、人物债务的关系。' },
    ],
  },
  {
    id: 'item-special-resource',
    entryType: '特殊资源',
    entryTitle: '特殊资源',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    groups: [
      {
        title: '固定设定',
        description: '特殊资源的长期规则，记录为什么珍贵、怎么获得、谁能用、什么时候失效和主线关联。',
        fieldKeys: ['basicInfo', 'acquireCondition', 'useRules', 'permissionBoundary', 'failureCondition', 'mainlineRelation'],
      },
      {
        title: '状态设定',
        description: '章节推进后会变化，AI 更新时只刷新归属、可用、次数、竞争、激活和触发状态。',
        fieldKeys: ['currentOwnership', 'availableStatus', 'remainingUses', 'competitionRisk', 'activationProgress', 'recentTrigger'],
      },
    ],
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '资源类型、唯一性、等级、首次登场章节。' },
      { key: 'acquireCondition', title: '获取条件', placeholder: '身份、令牌、任务、地点、境界、代价。' },
      { key: 'useRules', title: '使用规则', placeholder: '使用次数、有效期、限制、失败代价。' },
      { key: 'permissionBoundary', title: '权限边界', placeholder: '谁能使用、是否可转让、是否绑定身份或血脉。' },
      { key: 'failureCondition', title: '失效条件', placeholder: '过期、被夺、违约、地点关闭、次数耗尽等失效规则。' },
      { key: 'mainlineRelation', title: '主线关联', placeholder: '与人物身世、势力争夺、地图线索或后期反转的关系。' },
      { key: 'currentOwnership', title: '当前归属', placeholder: '谁拥有资格、资格是否被抢夺、转让或冻结。' },
      { key: 'availableStatus', title: '可用状态', placeholder: '是否激活、过期、封锁、已使用或待确认。' },
      { key: 'remainingUses', title: '剩余次数', placeholder: '还能使用几次、是否已有部分消耗或临时锁定。' },
      { key: 'competitionRisk', title: '竞争风险', placeholder: '哪些人物或势力正在争夺、是否暴露。' },
      { key: 'activationProgress', title: '激活进度', placeholder: '已满足哪些条件、还缺哪些钥匙、地点或章节触发。' },
      { key: 'recentTrigger', title: '最近触发', placeholder: '最近章节触发了什么条件、线索或限制。' },
    ],
  },
  {
    id: 'item-equipment',
    entryType: '物品装备',
    entryTitle: '物品装备',
    matchAllTitles: true,
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'basicInfo', title: '基本信息', placeholder: '类型、等级、初次登场章节。' },
      { key: 'description', title: '物品描述', placeholder: '外观、材质、标志性细节、识别特征。' },
      { key: 'functionEffect', title: '效果/功能', placeholder: '主要能力、使用条件、副作用、限制和战斗/剧情用途。' },
      { key: 'origin', title: '来历', placeholder: '物品的来源背景、制造者、历史、被谁发现或带入剧情。' },
      { key: 'ownershipChange', title: '归属变化', placeholder: '曾经持有者、转手原因、争夺过程、当前归属如何形成。' },
      { key: 'currentStatus', title: '当前状态', placeholder: '持有者、损坏/封印/激活状态、是否可用、是否暴露。' },
      { key: 'foreshadowing', title: '相关伏笔', placeholder: '隐藏能力、后续解锁、与人物身世/主线秘密/地图线索的关联。' },
    ],
  },
  {
    id: 'work-plot-blueprint',
    entryType: '剧情规划',
    entryTitle: '剧情蓝图',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'overallPlanning', title: '整体规划', placeholder: '预计总字数、共几卷、故事从哪里开始到哪里结束。' },
      { key: 'mainGoal', title: '主线目标', placeholder: '主角长期要完成的大目标。' },
      { key: 'phasePace', title: '阶段节奏', placeholder: '前期、中期、后期分别推进什么内容。' },
    ],
  },
  {
    id: 'work-plot-volume',
    entryType: '剧情规划',
    entryTitle: '分卷剧情',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'volumeOverview', title: '分卷总览', placeholder: '每一卷的卷名、字数、核心阶段和主要任务。' },
      { key: 'volumeCoreEvent', title: '卷核心事件', placeholder: '这一卷最重要的剧情事件和冲突推进。' },
      { key: 'volumeClimax', title: '卷末高潮', placeholder: '卷末的大收获、大反转、大决战或阶段性爆点。' },
      { key: 'nextVolumeHook', title: '下一卷钩子', placeholder: '本卷结尾留下什么问题、危机或新地图。' },
    ],
  },
  {
    id: 'work-plot-payoff',
    entryType: '剧情规划',
    entryTitle: '爽点设计',
    gridColumnsClassName: 'grid-cols-2',
    fields: [
      { key: 'corePayoffTypes', title: '核心爽点类型', placeholder: '升级、反杀、打脸、误解、收获、揭秘等主要爽点。' },
      { key: 'faceSlapTargets', title: '打脸对象设计', placeholder: '谁看不起主角、为什么被打脸、打脸场景在哪里。' },
      { key: 'payoffFormula', title: '爽点公式', placeholder: '主角想法、实际行动、结果、配角反应、主角内心反应。' },
      { key: 'payoffPace', title: '爽点节奏', placeholder: '小爽点、中爽点、大爆点分别多久出现一次。' },
    ],
  },
];
const DEFAULT_WORK_SETTING_TYPES = ['核心设定', '剧情规划', '资源货币', '世界地图'];
const DEFAULT_WORK_SETTING_STARTER_VERSION = '2026-06-25-foreshadow-fields-v1';
const DEFAULT_WORK_SETTING_STARTER_ENTRIES = [
  { type: BASIC_SETTING_ENTRY_TYPE, title: BASIC_SETTING_ENTRY_TITLE },
  { type: BASIC_SETTING_ENTRY_TYPE, title: '世界观' },
  { type: BASIC_SETTING_ENTRY_TYPE, title: '主角金手指/优势' },
  { type: '剧情规划', title: '剧情蓝图' },
  { type: '剧情规划', title: '爽点设计' },
  { type: '剧情规划', title: '分卷剧情' },
  { type: '主线伏笔', title: '1号主线伏笔' },
  { type: '人物伏笔', title: '1号人物伏笔' },
  { type: '世界地图', title: '世界架构' },
  { type: '世界地图', title: '危险区域' },
  { type: '资源货币', title: '资源货币' },
];
const getDefaultWorkSettingEntryId = (type: string, title: string) => `${normalizeSettingType(type)}::${title.trim()}`;
const DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS = new Set(
  DEFAULT_WORK_SETTING_STARTER_ENTRIES.map((item) => getDefaultWorkSettingEntryId(item.type, item.title)),
);
const LEGACY_COMPACT_WORK_SETTING_STARTER_ENTRIES = [
  { type: '世界规则', title: '世界规则' },
  { type: '主线伏笔', title: '主线伏笔' },
  { type: '人物伏笔', title: '人物伏笔' },
  { type: '已回收伏笔', title: '已回收伏笔' },
];
const LEGACY_DETAILED_DEFAULT_SETTING_STARTER_ENTRIES = [
  { type: '核心设定', title: '核心设定' },
  { type: '剧情规划', title: '剧情规划' },
  { type: '核心设定', title: '作品定位' },
  { type: '核心设定', title: '主角初始处境' },
  { type: '核心设定', title: '核心爽点' },
  { type: '核心设定', title: '核心矛盾' },
  { type: '核心设定', title: '核心金手指' },
  { type: '核心设定', title: '主角成长方向' },
  { type: '世界规则', title: '力量规则' },
  { type: '世界规则', title: '境界体系' },
  { type: '世界规则', title: '资源规则' },
  { type: '世界规则', title: '世界背景' },
  { type: '世界规则', title: '社会秩序' },
  { type: '世界规则', title: '禁忌规则' },
  { type: '剧情规划', title: '主线目标' },
  { type: '剧情规划', title: '阶段剧情' },
  { type: '剧情规划', title: '开局事件' },
  { type: '剧情规划', title: '关键转折' },
  { type: '剧情规划', title: '高潮节点' },
  { type: '剧情规划', title: '结局方向' },
  { type: '功法能力', title: '主修功法' },
  { type: '功法能力', title: '战斗技能' },
  { type: '功法能力', title: '特殊能力' },
  { type: '功法能力', title: '能力限制' },
  { type: '物品装备', title: '武器' },
  { type: '物品装备', title: '防具/护身物' },
  { type: '物品装备', title: '法宝/特殊装备' },
  { type: '物品装备', title: '关键道具' },
  { type: '资源货币', title: '通用货币' },
  { type: '资源货币', title: '修炼资源' },
  { type: '资源货币', title: '材料资源' },
  { type: '资源货币', title: '交易规则' },
  { type: '特殊资源', title: '传承资格' },
  { type: '特殊资源', title: '权限令牌' },
  { type: '特殊资源', title: '唯一资源' },
  { type: '特殊资源', title: '稀缺名额' },
  { type: '世界地图', title: '大陆结构' },
  { type: '世界地图', title: '国家城池' },
  { type: '世界地图', title: '宗门位置' },
  { type: '世界地图', title: '重要地点' },
  { type: '危险区域', title: '秘境' },
  { type: '危险区域', title: '禁区' },
  { type: '危险区域', title: '遗迹' },
  { type: '危险区域', title: '战场' },
  { type: '危险区域', title: '污染/灾变区域' },
  { type: '主线伏笔', title: '核心秘密' },
  { type: '主线伏笔', title: '世界真相' },
  { type: '主线伏笔', title: '主线线索' },
  { type: '主线伏笔', title: '后期反转' },
  { type: '人物伏笔', title: '身份秘密' },
  { type: '人物伏笔', title: '血脉/身世' },
  { type: '人物伏笔', title: '关系伏笔' },
  { type: '人物伏笔', title: '背叛/转变' },
  { type: '已回收伏笔', title: '已揭露秘密' },
  { type: '已回收伏笔', title: '已解决线索' },
  { type: '已回收伏笔', title: '已完成回收' },
  { type: '硬规则', title: '战力规则' },
  { type: '硬规则', title: '时间规则' },
  { type: '硬规则', title: '能力边界' },
  { type: '硬规则', title: '世界不可违背规则' },
  { type: '禁写规则', title: '不能前后矛盾' },
  { type: '禁写规则', title: '不能写崩人设' },
  { type: '禁写规则', title: '不能跳过铺垫' },
  { type: '禁写规则', title: '不能破坏爽点承诺' },
  { type: '禁写规则', title: '不能滥加设定' },
];
const LEGACY_AUTO_DOMAIN_SETTING_STARTER_ENTRIES = [
  { type: '正派势力', title: '正派势力' },
  { type: '反派势力', title: '反派势力' },
  { type: '中立势力', title: '中立势力' },
  { type: '其他势力', title: '其他势力' },
  { type: '功法能力', title: '功法能力' },
  { type: '物品装备', title: '物品装备' },
  { type: '资源货币', title: '资源货币' },
  { type: '特殊资源', title: '特殊资源' },
  { type: '世界地图', title: '世界地图' },
  { type: '危险区域', title: '危险区域' },
];
const LEGACY_DEFAULT_WORK_SETTING_INSTRUCTIONS = [
  { type: '核心设定', title: '作品定位', body: '填写说明：记录题材、风格、目标读者、主打体验和整体卖点，让 AI 明白这本书要给读者什么感觉。' },
  { type: '核心设定', title: '主角初始处境', body: '填写说明：记录主角开局身份、困境、资源、敌人、弱点和眼前目标，让 AI 明白故事从哪里起步。' },
  { type: '核心设定', title: '核心爽点', body: '填写说明：记录本书最主要的爽感来源，例如越级反杀、扮猪吃虎、资源暴富、势力崛起。' },
  { type: '核心设定', title: '核心矛盾', body: '填写说明：记录贯穿全书的最大冲突，例如主角与旧秩序、天道、神庭、家族仇敌之间的矛盾。' },
  { type: '世界规则', title: '力量规则', body: '填写说明：记录力量来源、使用方式、限制、代价、克制关系和不能随便突破的边界。' },
  { type: '世界规则', title: '世界背景与秩序', body: '填写说明：记录时代背景、地域结构、文明形态、宗门王朝、阶层法律和交易秩序。' },
  { type: '剧情规划', title: '主线目标与阶段剧情', body: '填写说明：记录主角长期目标、每卷阶段目标、主要地图、敌人、收获和推进方向。' },
  { type: '剧情规划', title: '关键转折与结局方向', body: '填写说明：记录觉醒、背叛、真相揭露、高潮节点、后期反转和最终走向。' },
  { type: '正派势力', title: '正派势力', body: '填写说明：记录主角阵营、宗门学院、王朝官方等正向势力的结构、成员、资源、立场和可提供的帮助。' },
  { type: '反派势力', title: '反派势力', body: '填写说明：记录敌对宗门、魔道邪修、反派联盟、幕后势力的目标、等级、行动方式和压迫来源。' },
  { type: '中立势力', title: '中立势力', body: '填写说明：记录商会、情报组织、佣兵散修、中立城池的交易规则、利益立场和可合作程度。' },
  { type: '其他势力', title: '其他势力', body: '填写说明：记录远古势力、隐藏势力、异族势力、临时组织等不适合放进正反中立的势力。' },
  { type: '功法能力', title: '功法能力', body: '填写说明：记录主修功法、战斗技能、特殊能力、神通法术、成长路线、使用限制和代价。' },
  { type: '物品装备', title: '物品装备', body: '填写说明：记录武器、防具、法宝、载具、关键道具的来源、功能、等级、绑定者和剧情作用。' },
  { type: '资源货币', title: '资源货币', body: '填写说明：记录通用货币、修炼资源、材料资源、交易资源的价值、获取方式、稀缺程度和消耗场景。' },
  { type: '特殊资源', title: '特殊资源', body: '填写说明：记录传承资格、权限令牌、唯一资源、稀缺名额为什么珍贵、谁在争夺、会引发什么冲突。' },
  { type: '世界地图', title: '世界地图', body: '填写说明：记录世界架构、区域划分、势力分布、资源分布和世界规则。' },
  { type: '危险区域', title: '危险区域', body: '填写说明：记录秘境、禁区、遗迹、战场、污染灾变区域的进入条件、危险来源、收益和隐藏秘密。' },
  { type: '主线伏笔', title: '主线伏笔', body: '填写说明：记录核心秘密、世界真相、主线线索、后期反转，以及应该在哪些章节铺垫和回收。' },
  { type: '人物伏笔', title: '人物伏笔', body: '填写说明：记录身份秘密、血脉身世、关系伏笔、背叛或转变，让人物反转有提前铺垫。' },
  { type: '已回收伏笔', title: '已回收伏笔', body: '填写说明：记录已经揭露、已经解决、已经完成回收的伏笔，防止 AI 重复悬念或忘记结果。' },
  { type: '硬规则', title: '硬规则', body: '填写说明：记录战力规则、时间规则、能力边界和世界不可违背规则，防止战力或逻辑崩坏。' },
  { type: '禁写规则', title: '禁写规则', body: '填写说明：记录不能前后矛盾、不能写崩人设、不能跳过铺垫、不能破坏爽点承诺、不能滥加设定。' },
];
const SETTING_WORKSPACE_DOMAIN_GROUPS = {
  'setting:faction': ['正派势力', '反派势力', '中立势力', '其他势力'],
  'setting:item': ['功法能力', '物品装备', '特殊资源'],
  'setting:monster': ['怪物列表'],
  'setting:foreshadow': ['主线伏笔', '人物伏笔'],
} as const;
const SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES: Record<string, string> = {
  作品设定: DEFAULT_WORK_SETTING_TYPES[0],
  势力设定: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:faction'][0],
  道具资源: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:item'][0],
  怪物图鉴: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:monster'][0],
  伏笔线索: SETTING_WORKSPACE_DOMAIN_GROUPS['setting:foreshadow'][0],
};
const SETTING_IMPORT_ROLE_TOP_LABELS = new Set(['人物设定', '角色设定']);
const DEFAULT_SETTING_TYPES = [
  ...DEFAULT_WORK_SETTING_TYPES,
  ...Object.values(SETTING_WORKSPACE_DOMAIN_GROUPS).flat(),
];
const DEFAULT_SETTING_TYPE_DOMAINS = Object.fromEntries(
  Object.entries(SETTING_WORKSPACE_DOMAIN_GROUPS).flatMap(([domain, groups]) => (
    groups.map((group) => [group, domain])
  )),
) as Record<string, string>;
const ROLE_TAB = '角色';
const BRAINSTORM_TAB = '脑洞';
const SETTING_TAB = '大纲';
const PROMPT_SETTING_CATEGORY = '设定';
const DETAIL_OUTLINE_TAB = '细纲';
const DETAIL_OUTLINE_PROMPT_CATEGORY = '章纲';
const PLOT_CHAIN_PROMPT_CATEGORY = DETAIL_OUTLINE_PROMPT_CATEGORY;
const DETAIL_OUTLINE_DISPLAY_LABEL = '章纲';
const OUTLINE_LIBRARY_TAB = '梗概';
const LEGACY_OUTLINE_LIBRARY_TAB = '摘要';
const LEGACY_OUTLINE_LIBRARY_TAB_OLD = '概要';
const BRAINSTORM_TYPE = '脑洞库';
const CHAPTER_SUMMARY_TAB = '章节梗概';
const LEGACY_CHAPTER_SUMMARY_TAB = '章节摘要';
const LEGACY_CHAPTER_SUMMARY_TAB_OLD = '章节概要';
const VOLUME_SUMMARY_TAB = '卷梗概';
const LEGACY_VOLUME_SUMMARY_TAB = '卷摘要';
const LEGACY_VOLUME_SUMMARY_TAB_OLD = '卷概要';
const CHAPTER_DETAIL_OUTLINE_TAB = '章节细纲';
const SETTING_LIBRARY_TABS = new Set([ROLE_TAB, BRAINSTORM_TAB, SETTING_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB]);
const UNCATEGORIZED_TYPE = '未分类';
const DEFAULT_SETTING_ENTRY_TYPE = DEFAULT_SETTING_TYPES[0] ?? UNCATEGORIZED_TYPE;
const SETTING_LIBRARY_LEFT_MIN_WIDTH = 180;
const SETTING_LIBRARY_LEFT_WIDTH = SETTING_LIBRARY_LEFT_MIN_WIDTH;
const SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH = 260;
const SETTING_LIBRARY_LEFT_MAX_WIDTH = 640;
const OUTLINE_LEFT_MAX_DISPLAY_WIDTH = 560;
const SETTING_LIBRARY_RIGHT_WIDTH = 350;
const SETTING_LIBRARY_RIGHT_MIN_WIDTH = 280;
const OUTLINE_ACTION_RIGHT_MIN_WIDTH = 420;
const SETTING_LIBRARY_RIGHT_MAX_WIDTH = 620;
const BRAINSTORM_PREVIEW_WIDTH = 520;
const BRAINSTORM_PREVIEW_MIN_WIDTH = 320;
const BRAINSTORM_PREVIEW_MAX_WIDTH = 760;
const BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH = 280;
const BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH = 480;
const BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH = 340;
const BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH = 760;
const BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH = 320;
const PLOT_POINT_LAYOUT_LEFT_WIDTH = 300;
const PLOT_POINT_LAYOUT_TREE_MIN_WIDTH = 132;
const PLOT_POINT_LAYOUT_TREE_WIDTH = PLOT_POINT_LAYOUT_TREE_MIN_WIDTH;
const PLOT_POINT_LAYOUT_TREE_MAX_WIDTH = 260;
const PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH = 220;
const PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH = 520;
const PLOT_POINT_LAYOUT_RIGHT_WIDTH = 360;
const PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH = 300;
const PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH = 620;
const PLOT_POINT_LAYOUT_CENTER_MIN_WIDTH = 360;
const ROLE_HISTORY_LIMIT = 20;
const DETAIL_OUTLINE_PREVIEW_HEIGHT = '42vh';
type LibraryCategoryMenu = {
  kind: 'role' | 'setting';
  type: string;
  x: number;
  y: number;
} | null;

type LibraryEntryMenu = {
  entryId: string;
  title: string;
  tab: string;
  roleType?: string;
  pinnedAt?: number;
  x: number;
  y: number;
} | null;

type PendingCategoryRename = {
  kind: 'role' | 'setting';
  type: string;
} | null;

type ClearSettingsTarget = 'settingCategories' | 'settingEntries' | 'roleCategories' | 'roleEntries';
type ClearSettingsMeta = { label: string; count: number; description: string };
type ContextMenuSize = { width: number; height: number };

const CONTEXT_MENU_VIEWPORT_PADDING = 8;
const SETTING_CATEGORY_CONTEXT_MENU_SIZE = { width: 220, height: 300 };
const SETTING_ENTRY_CONTEXT_MENU_SIZE = { width: 180, height: 280 };
const PROMPT_DISABLE_CONTEXT_MENU_SIZE = { width: 140, height: 72 };
const DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE = { width: 136, height: 56 };

function clampFixedMenuPosition(x: number, y: number, size: ContextMenuSize) {
  if (typeof window === 'undefined') return { left: x, top: y };
  return {
    left: Math.max(CONTEXT_MENU_VIEWPORT_PADDING, Math.min(x, window.innerWidth - size.width - CONTEXT_MENU_VIEWPORT_PADDING)),
    top: Math.max(CONTEXT_MENU_VIEWPORT_PADDING, Math.min(y, window.innerHeight - size.height - CONTEXT_MENU_VIEWPORT_PADDING)),
  };
}

type PromptDisableMenu = {
  tab: string;
  disabled: boolean;
  x: number;
  y: number;
} | null;

type PendingEntryDelete = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;
type PendingEntryRename = Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'> | null;
type LibraryManagementModalState =
  | { type: 'models' }
  | { type: 'prompts'; category: string }
  | null;
type LibraryAiRequestLog = {
  createdAt: string;
  tab: string;
  modelName: string;
  promptName: string;
  hasLinkedBrainstorm: boolean;
  linkedBrainstormTitle: string;
  visibleUserText: string;
  systemPrompt: string;
  userContent: string;
  contextTitle?: string;
  contextText?: string;
  contextWordCount?: number;
  readerContextTitle?: string;
  readerContextText?: string;
  readerContextWordCount?: number;
};

type DetailOutlineReaderTab = 'settings' | 'roles' | 'outlines' | 'plotChain';
const OTHER_SETTING_LINK_TABS = [
  { id: 'work', title: '作品设定' },
  { id: 'roles', title: '人物设定' },
  { id: 'factions', title: '势力设定' },
  { id: 'items', title: '道具资源' },
  { id: 'monsters', title: '怪物图鉴' },
  { id: 'foreshadow', title: '伏笔线索' },
] as const;
type OtherSettingLinkTabId = (typeof OTHER_SETTING_LINK_TABS)[number]['id'];
type OtherSettingLinkEntry = {
  id: string;
  entryId: string;
  source: 'setting' | 'role';
  tabId: OtherSettingLinkTabId;
  tabTitle: string;
  groupName: string;
  title: string;
  type: string;
  text: string;
  wordCount: number;
};
type OtherSettingLinkGroup = {
  name: string;
  entries: OtherSettingLinkEntry[];
};
type OtherSettingLinkTab = {
  id: OtherSettingLinkTabId;
  title: string;
  groups: OtherSettingLinkGroup[];
};
type SettingLinkSource = 'current' | 'other' | 'brainstorm' | null;
const LIBRARY_AI_LOG_VIEW_TABS = ['输出日志', '格式'] as const;
type LibraryAiLogViewTab = (typeof LIBRARY_AI_LOG_VIEW_TABS)[number];
const SETTING_IMPORT_FORMAT_PREVIEW_SCOPES = ['设定条目', '分组', '标签'] as const;
type SettingImportFormatPreviewScope = (typeof SETTING_IMPORT_FORMAT_PREVIEW_SCOPES)[number];
type SettingImportFormatField = {
  title: string;
  placeholder?: string;
};
type SettingImportFormatEntry = {
  id: string;
  tabId: OtherSettingLinkTabId;
  tabTitle: string;
  groupName: string;
  title: string;
  fields: SettingImportFormatField[];
  note?: string;
};
type SettingImportFormatGroup = {
  name: string;
  entries: SettingImportFormatEntry[];
};
type SettingImportFormatTab = {
  id: OtherSettingLinkTabId;
  title: string;
  groups: SettingImportFormatGroup[];
};
type BuildSettingImportFormatTabsOptions = {
  visibleSettingTypes: string[];
  settingEntries: WorkbenchLibraryEntry[];
  getSettingTypeWorkspaceDomain: (type: string) => string | null;
};

export function parseGeneratedPlotPointCandidates(text: string): WorkbenchPlotPointCandidate[] {
  const clean = stripAiThinkingBlock(text).trim();
  if (!clean) return [];
  return clean
    .split(/\n(?=\s*(?:[-*]|\d+[.、）)]|剧情点\s*\d+|【?剧情点[^】\n]*】?[：:])\s*)/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .filter((block) => !/^#+\s*/.test(block))
    .slice(0, 30)
    .map((block, index) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line
          .trim()
          .replace(/^[-*]\s*/, '')
          .replace(/^\d+[.、）)]\s*/, '')
          .replace(/^剧情点\s*\d+[.、）)]?\s*[：:]?\s*/, '')
          .trim())
        .filter(Boolean);
      const isMetaLine = (line: string) => /^(变量替换|变量替换说明|替换说明|修改说明|改写说明|AI评价|评价|原剧情点|原型)[：:]/.test(line);
      const contentLines = lines.filter((line) => !isMetaLine(line));
      const mainLine = contentLines[0] ?? lines[0] ?? '';
      const variableLine = lines.find((line) => /^(变量替换|变量替换说明|替换说明)[：:]/.test(line));
      const reviewLine = lines.find((line) => /^(AI评价|评价)[：:]/.test(line));
      const normalizedMainLine = mainLine.replace(/^剧情点[：:]\s*/, '').trim();
      const labelOnlyMatch = normalizedMainLine.match(/^(标题|剧情点)[：:]\s*(.+)$/);
      const shortTitleMatch = labelOnlyMatch ? null : normalizedMainLine.match(/^([^：:]{1,22})[：:]\s*(.+)$/);
      const titleFromLine = shortTitleMatch?.[1]?.trim() ?? '';
      const firstContent = labelOnlyMatch
        ? labelOnlyMatch[2].trim()
        : shortTitleMatch
          ? shortTitleMatch[2].trim().replace(new RegExp(`^${titleFromLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[，,、。；;：:\\s]*`), '').trim()
          : normalizedMainLine;
      const adapted = [firstContent, ...contentLines.slice(1)].filter(Boolean).join('\n').trim();
      const derivedTitle = firstContent.split(/[，。！？；,.!?;]/)[0]?.trim() || `AI剧情点 ${index + 1}`;
      const title = shortTitleMatch
        ? titleFromLine
        : derivedTitle.slice(0, 22);
      return {
        id: `ai:${index}:${adapted.slice(0, 18)}`,
        title,
        source: 'AI生成' as const,
        originalGenre: 'AI生成',
        original: block,
        adapted,
        variable: variableLine?.replace(/^(变量替换|变量替换说明|替换说明)[：:]\s*/, '').trim() || '由当前设定、用户要求和上下文生成',
        review: reviewLine?.replace(/^(AI评价|评价)[：:]\s*/, '').trim(),
      };
    })
    .filter((item) => item.adapted.length >= 6);
}

type LibraryEntryDragState = {
  entryId: string;
  tab: string;
  type: string;
} | null;

type LibraryEntryDropPreviewState = {
  entryId: string;
  tab: string;
  type: string;
  mode: 'target-position' | 'group-end';
  targetEntryId?: string;
} | null;

type LibraryEntryPointerDragState = {
  entryId: string;
  tab: string;
  type: string;
  pointerId: number;
  element: HTMLElement;
  startX: number;
  startY: number;
  active: boolean;
  armed: boolean;
  activationTimer: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
  cleanup: () => void;
} | null;

const LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE = 14;
const LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;
const LIBRARY_ENTRY_POINTER_DRAG_RETARGET_DISTANCE = 28;
const LIBRARY_ENTRY_POINTER_DRAG_RETURN_DISTANCE = 28;

function hasLibraryEntryPointerRetargetedTooSoon(
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance = targetKey === `entry:${pointerDrag.entryId}`
    ? LIBRARY_ENTRY_POINTER_DRAG_RETURN_DISTANCE
    : LIBRARY_ENTRY_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

function rememberLibraryEntryPointerPreviewTarget(
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}

function isLibraryPointerPastGroupEntries(
  hoverGroup: HTMLElement,
  pointerDrag: NonNullable<LibraryEntryPointerDragState>,
  clientY: number,
) {
  const visibleEntries = Array.from(hoverGroup.querySelectorAll<HTMLElement>('[data-library-entry-id]'))
    .filter((element) => (
      element.dataset.libraryEntryTab === pointerDrag.tab
      && element.dataset.libraryEntryId !== pointerDrag.entryId
    ));
  if (visibleEntries.length === 0) return true;
  const lastEntryRect = visibleEntries[visibleEntries.length - 1].getBoundingClientRect();
  return clientY > lastEntryRect.bottom;
}

function getDetailOutlinePreviewHeight() {
  return DETAIL_OUTLINE_PREVIEW_HEIGHT;
}

const DETAIL_OUTLINE_STATE_MARKER = '【本章状态变化预期】';
const DETAIL_OUTLINE_PUBLISHED_GROUP_NAME = 'detail_outline_published_chapters';

function splitDetailOutlineStateExpectation(content: string) {
  const markerIndex = content.indexOf(DETAIL_OUTLINE_STATE_MARKER);
  if (markerIndex < 0) {
    return { outline: content, stateExpectation: '' };
  }
  return {
    outline: content.slice(0, markerIndex).trimEnd(),
    stateExpectation: content.slice(markerIndex + DETAIL_OUTLINE_STATE_MARKER.length).trimStart(),
  };
}

function mergeDetailOutlineStateExpectation(outline: string, stateExpectation: string) {
  const cleanOutline = outline.trimEnd();
  const cleanStateExpectation = stateExpectation.trim();
  if (!cleanStateExpectation) return cleanOutline;
  return [cleanOutline, `${DETAIL_OUTLINE_STATE_MARKER}\n${cleanStateExpectation}`]
    .filter((part) => part.trim())
    .join('\n\n');
}

type WorkbenchFieldSizeKey =
  | 'roleSearch'
  | 'roleCategoryName'
  | 'roleCreateName'
  | 'roleDetailName'
  | 'roleDetailCategory'
  | 'settingName'
  | 'settingModelSelect'
  | 'settingPromptSelect'
  | 'roleModelSelect'
  | 'rolePromptSelect'
  | 'brainstormModelSelect'
  | 'brainstormPromptSelect'
  | 'outlineSummaryModelSelect'
  | 'outlineSummaryPromptSelect'
  | 'detailOutlineModelSelect'
  | 'detailOutlinePromptSelect';
type WorkbenchFieldSizeSpec = { width: number; height: number; fontSize: number };
type WorkbenchFieldSizeProp = keyof WorkbenchFieldSizeSpec;

const WORKBENCH_FIELD_SIZE_STORAGE_KEY = 'xinyuexia_workbench_field_size_specs_v1';
const WORKBENCH_FIELD_SIZE_DEFAULTS: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> = {
  roleSearch: { width: 260, height: 44, fontSize: 13 },
  roleCategoryName: { width: 260, height: 44, fontSize: 13 },
  roleCreateName: { width: 260, height: 44, fontSize: 13 },
  roleDetailName: { width: 220, height: 44, fontSize: 13 },
  roleDetailCategory: { width: 220, height: 44, fontSize: 13 },
  settingName: { width: 220, height: 56, fontSize: 18 },
  settingModelSelect: { width: 250, height: 44, fontSize: 13 },
  settingPromptSelect: { width: 250, height: 44, fontSize: 13 },
  roleModelSelect: { width: 250, height: 44, fontSize: 13 },
  rolePromptSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormModelSelect: { width: 250, height: 44, fontSize: 13 },
  brainstormPromptSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryModelSelect: { width: 250, height: 44, fontSize: 13 },
  outlineSummaryPromptSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlineModelSelect: { width: 250, height: 44, fontSize: 13 },
  detailOutlinePromptSelect: { width: 250, height: 44, fontSize: 13 },
};

const WORKBENCH_FIELD_SIZE_SETTING_KEYS = (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).filter(
  (key) => key !== 'roleCategoryName' && key !== 'roleCreateName',
);

const WORKBENCH_FIELD_SIZE_KEYS_BY_TAB: Record<string, WorkbenchFieldSizeKey[]> = {
  [SETTING_TAB]: ['settingName', 'settingModelSelect', 'settingPromptSelect'],
  [ROLE_TAB]: ['roleSearch', 'roleDetailName', 'roleDetailCategory', 'roleModelSelect', 'rolePromptSelect'],
  [BRAINSTORM_TAB]: ['brainstormModelSelect', 'brainstormPromptSelect'],
  [OUTLINE_LIBRARY_TAB]: ['outlineSummaryModelSelect', 'outlineSummaryPromptSelect'],
  [DETAIL_OUTLINE_TAB]: ['detailOutlineModelSelect', 'detailOutlinePromptSelect'],
};

const WORKBENCH_FIELD_SIZE_LABELS: Partial<Record<WorkbenchFieldSizeKey, string>> = {
  roleSearch: '角色短字段',
  roleCategoryName: '分类名字',
  roleCreateName: '角色名字',
  roleDetailName: '角色名',
  settingName: '设定名',
  settingModelSelect: '设定模型框',
  settingPromptSelect: '设定提示词框',
  roleModelSelect: '角色模型框',
  rolePromptSelect: '角色提示词框',
  brainstormModelSelect: '脑洞模型框',
  brainstormPromptSelect: '脑洞提示词框',
  outlineSummaryModelSelect: '梗概模型框',
  outlineSummaryPromptSelect: '梗概提示词框',
  detailOutlineModelSelect: '章纲模型框',
  detailOutlinePromptSelect: '章纲提示词框',
};

function getWorkbenchFieldSizeLabel(key: WorkbenchFieldSizeKey) {
  return WORKBENCH_FIELD_SIZE_LABELS[key] ?? (key === 'roleDetailCategory' ? '分类' : key);
}

function getWorkbenchFieldSizeTabLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === OUTLINE_LIBRARY_TAB) return '章节梗概';
  if (tab === DETAIL_OUTLINE_TAB) return '生成章纲';
  return tab;
}

function getWorkbenchTabDisplayLabel(tab: string) {
  if (tab === SETTING_TAB) return '设定';
  if (tab === DETAIL_OUTLINE_TAB) return DETAIL_OUTLINE_DISPLAY_LABEL;
  if (tab === CHAPTER_DETAIL_OUTLINE_TAB) return '章节章纲';
  return tab;
}

const WORKBENCH_FIELD_SIZE_LIMITS: Record<WorkbenchFieldSizeProp, { min: number; max: number }> = {
  width: { min: 120, max: 520 },
  height: { min: 34, max: 90 },
  fontSize: { min: 11, max: 24 },
};

function clampFieldSizeValue(prop: WorkbenchFieldSizeProp, value: number) {
  const limit = WORKBENCH_FIELD_SIZE_LIMITS[prop];
  if (!Number.isFinite(value)) return WORKBENCH_FIELD_SIZE_DEFAULTS.settingName[prop];
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

function normalizeFieldSizeSpec(key: WorkbenchFieldSizeKey, value?: Partial<WorkbenchFieldSizeSpec>): WorkbenchFieldSizeSpec {
  const base = WORKBENCH_FIELD_SIZE_DEFAULTS[key];
  return {
    width: clampFieldSizeValue('width', Number(value?.width ?? base.width)),
    height: clampFieldSizeValue('height', Number(value?.height ?? base.height)),
    fontSize: clampFieldSizeValue('fontSize', Number(value?.fontSize ?? base.fontSize)),
  };
}

function readWorkbenchFieldSizeSpecs(): Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec> {
  try {
    const parsed = JSON.parse(localStorage.getItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY) || '{}') as Partial<Record<WorkbenchFieldSizeKey, Partial<WorkbenchFieldSizeSpec>>>;
    return (Object.keys(WORKBENCH_FIELD_SIZE_DEFAULTS) as WorkbenchFieldSizeKey[]).reduce((acc, key) => {
      acc[key] = normalizeFieldSizeSpec(key, parsed[key]);
      return acc;
    }, {} as Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>);
  } catch {
    return { ...WORKBENCH_FIELD_SIZE_DEFAULTS };
  }
}

function writeWorkbenchFieldSizeSpecs(specs: Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>) {
  localStorage.setItem(WORKBENCH_FIELD_SIZE_STORAGE_KEY, JSON.stringify(specs));
}

function getWorkbenchFieldSizeStyle(spec: WorkbenchFieldSizeSpec): CSSProperties {
  return {
    width: spec.width,
    minWidth: WORKBENCH_FIELD_SIZE_LIMITS.width.min,
    maxWidth: '100%',
    '--xy-field-width': `${spec.width}px`,
    '--xy-field-height': `${spec.height}px`,
    '--xy-field-font-size': `${spec.fontSize}px`,
  } as CSSProperties;
}

function FieldSizeNumberInput({
  label,
  prop,
  value,
  onChange,
}: {
  label: string;
  prop: WorkbenchFieldSizeProp;
  value: number;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const commitValue = (nextValue: string) => {
    if (!nextValue.trim()) {
      setDraftValue(String(value));
      return;
    }
    const normalizedValue = clampFieldSizeValue(prop, Number(nextValue));
    setDraftValue(String(normalizedValue));
    onChange(normalizedValue);
  };

  return (
    <label className="block text-xs font-black text-slate-500">
      <span>{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^\d]/g, '');
          setDraftValue(nextValue);
        }}
        onBlur={() => commitValue(draftValue)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitValue(draftValue);
            event.currentTarget.blur();
          }
        }}
        className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-slate-800 outline-none focus:border-[#08AACE]"
      />
    </label>
  );
}

type LibraryTabConfig = {
  selectedId?: string | null;
  typeDraft?: string;
  titleDraft?: string;
  createKind?: 'category' | 'setting';
  roleTypeDraft?: string;
  roleNameDraft?: string;
  aiInput?: string;
  aiOutput?: string;
  aiResult?: string;
  libraryAiTaskId?: string;
  aiSessions?: unknown[];
  activeAiSessionId?: string;
  outlineAiInput?: string;
  outlineAiTaskId?: string;
  detailOutlineReaderTouched?: boolean;
  detailOutlineReaderSettingIds?: string[];
  detailOutlineReaderRoleIds?: string[];
  detailOutlineReaderOutlineIds?: string[];
  detailOutlineReaderPlotChainIds?: string[];
  plotPointPromptId?: string;
  detailOutlinePromptId?: string;
  outlineSummaryPromptId?: string;
  selectedOutlineChapterId?: number | null;
  plotPointSourceMode?: PlotPointSourceMode;
  plotPointGenerateCount?: number;
  plotPointLength?: PlotPointLengthMode;
  plotPointOpeningElements?: string[];
  plotPointPreviewDraft?: string;
  plotPointAiTaskId?: string;
  plotPointGeneratedCandidateText?: string;
  plotPointPreviewCleared?: boolean;
  plotPointSelectedCandidates?: WorkbenchPlotPointCandidate[];
  plotPointChainSelections?: Partial<Record<PlotPointChainSlot, string[]>>;
  plotPointChainWrittenSelections?: Partial<Record<PlotPointChainSlot, string[]>>;
  plotPointChainNames?: Partial<Record<PlotPointChainSlot, string>>;
  plotPointActiveChainSlot?: PlotPointChainSlot;
  modelId?: string;
  promptId?: string;
  promptDisabled?: boolean;
  brainstormGenre?: string;
  brainstormBackground?: string;
  brainstormIdea?: string;
  brainstormCheat?: string;
  brainstormCount?: string;
  brainstormRequirement?: string;
  brainstormPreviewFontSize?: number;
  brainstormOutputFontSize?: number;
  brainstormStreamEnabled?: boolean;
  associationSessionId?: string | null;
  loadedBrainstormId?: string | null;
  loadedBrainstormTitle?: string;
  loadedBrainstormText?: string;
  linkedOtherSettingIds?: string[];
  settingLinkSource?: 'current' | 'other' | 'brainstorm' | null;
  detailOutlineReaderSessionId?: string | null;
  smartImportLocked?: boolean;
  settingPreviewFontSize?: number;
  roleTextFontSize?: number;
  detailOutlineFontSize?: number;
};

type BrainstormQuestionKey =
  | 'brainstormGenre'
  | 'brainstormBackground'
  | 'brainstormIdea'
  | 'brainstormCheat'
  | 'brainstormCount'
  | 'brainstormRequirement';

type BrainstormQuestionDraft = Record<BrainstormQuestionKey, string>;

const EMPTY_BRAINSTORM_QUESTION_DRAFT: BrainstormQuestionDraft = {
  brainstormGenre: '',
  brainstormBackground: '',
  brainstormIdea: '',
  brainstormCheat: '',
  brainstormCount: '',
  brainstormRequirement: '',
};

type BrainstormAiSession = {
  id: string;
  input: string;
  output: string;
  result: string;
  previewTitles?: string[];
  previewDrafts?: string[];
  previewSelectedIndexes?: number[];
  previewCount?: number;
  backgroundAiTaskId?: string;
};

type LibraryFontTarget = 'brainstormPreview' | 'brainstormOutput' | 'settingPreview' | 'detailOutline';

function createBrainstormAiSession(id = '1', config?: Pick<LibraryTabConfig, 'aiInput' | 'aiOutput' | 'aiResult'>): BrainstormAiSession {
  return {
    id,
    input: config?.aiInput ?? '',
    output: config?.aiOutput ?? '',
    result: config?.aiResult ?? '',
  };
}

function normalizeBrainstormAiSessions(value: unknown, fallbackConfig: Pick<LibraryTabConfig, 'aiInput' | 'aiOutput' | 'aiResult'>): BrainstormAiSession[] {
  if (!Array.isArray(value)) return [createBrainstormAiSession('1', fallbackConfig)];
  const sessions = value
    .map((item, index): BrainstormAiSession | null => {
      if (!item || typeof item !== 'object') return null;
      const session = item as Partial<BrainstormAiSession>;
      const id = typeof session.id === 'string' && session.id.trim()
        ? session.id.trim()
        : String(index + 1);
      return {
        id,
        input: typeof session.input === 'string' ? session.input : '',
        output: typeof session.output === 'string' ? session.output : '',
        result: typeof session.result === 'string' ? session.result : '',
        previewTitles: Array.isArray(session.previewTitles) ? session.previewTitles.filter((item): item is string => typeof item === 'string') : undefined,
        previewDrafts: Array.isArray(session.previewDrafts) ? session.previewDrafts.filter((item): item is string => typeof item === 'string') : undefined,
        previewSelectedIndexes: Array.isArray(session.previewSelectedIndexes)
          ? session.previewSelectedIndexes.filter((item): item is number => Number.isInteger(item) && item >= 0)
          : undefined,
        previewCount: Number.isFinite(session.previewCount) && Number(session.previewCount) > 0
          ? Number(session.previewCount)
          : undefined,
        backgroundAiTaskId: typeof session.backgroundAiTaskId === 'string' ? session.backgroundAiTaskId : undefined,
      };
    })
    .filter((session): session is BrainstormAiSession => Boolean(session));
  return sessions.length > 0 ? sessions : [createBrainstormAiSession('1', fallbackConfig)];
}

function getActiveBrainstormAiSessionId(value: unknown, sessions: BrainstormAiSession[]) {
  const activeId = typeof value === 'string' ? value : '';
  return sessions.some((session) => session.id === activeId) ? activeId : sessions[0]?.id ?? '1';
}

function getBrainstormOutputCount(value: string) {
  const count = Number(normalizeBrainstormCountValue(value));
  return Number.isFinite(count) && count > 0 ? count : 1;
}

function getTemporaryBrainstormTitle(_index: number) {
  return '脑洞输出';
}

function getSelectedBrainstormPreviewIndexes(previews: string[], selectedIndexes?: number[]) {
  if (Array.isArray(selectedIndexes)) {
    return selectedIndexes.filter((index) => index >= 0 && index < previews.length);
  }
  return previews
    .map((preview, index) => (preview.trim() ? index : -1))
    .filter((index) => index >= 0);
}

function getFloatingTitleInputStyle(value: string, minCh: number, maxCh: number): CSSProperties {
  const normalizedLength = Math.max(
    minCh,
    Math.min(
      maxCh,
      Array.from(value.trim() || ' ').reduce((sum, char) => sum + (/[\u4e00-\u9fff]/.test(char) ? 1 : 0.62), 0) + 0.35,
    ),
  );
  return {
    '--xy-floating-title-input-width': `${normalizedLength.toFixed(2)}em`,
  } as CSSProperties;
}

function splitBrainstormGeneratedText(text: string, count: number) {
  const clean = stripBrainstormRequestHeader(stripAiThinkingBlock(text)).trim();
  if (!clean) return Array.from({ length: count }, () => '');
  const numberedParts = clean
    .split(/\n(?=\s*(?:[-*]\s*)?(?:脑洞\s*)?\d+[.、）)]\s*)/)
    .map((part) => part.trim().replace(/^(?:[-*]\s*)?(?:脑洞\s*)?\d+[.、）)]\s*/, '').trim())
    .filter(Boolean);
  const parts = numberedParts.length >= 2
    ? numberedParts
    : clean.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= count) return parts.slice(0, count);
  return Array.from({ length: count }, (_, index) => parts[index] ?? (index === 0 ? clean : ''));
}

function clearStoredBrainstormAiSessionPreviews(storageKey: string) {
  const currentConfigs = readTabConfigs(storageKey);
  const currentConfig = currentConfigs[BRAINSTORM_TAB] ?? {};
  const currentSessions = normalizeBrainstormAiSessions(currentConfig.aiSessions, currentConfig);
  const activeId = getActiveBrainstormAiSessionId(currentConfig.activeAiSessionId, currentSessions);
  const nextSessions = currentSessions.map((session) => (
    session.id === activeId
      ? (() => {
        const task = session.backgroundAiTaskId ? getBackgroundAiTask(session.backgroundAiTaskId) : null;
        const keepBackgroundOutput = Boolean(task && (task.status === 'running' || task.status === 'success'));
        return {
          ...session,
          input: '',
          output: keepBackgroundOutput ? session.output : '',
          result: keepBackgroundOutput ? session.result : '',
          backgroundAiTaskId: keepBackgroundOutput ? session.backgroundAiTaskId : undefined,
          previewCount: keepBackgroundOutput ? session.previewCount : undefined,
          previewTitles: [],
          previewDrafts: [],
          previewSelectedIndexes: undefined,
        };
      })()
      : session
  ));
  localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify({
    ...currentConfigs,
    [BRAINSTORM_TAB]: {
      ...currentConfig,
      aiSessions: nextSessions,
      activeAiSessionId: activeId,
      aiInput: '',
      aiOutput: '',
      aiResult: '',
    },
  }));
}

const BRAINSTORM_QUESTION_FIELDS: Array<{
  key: BrainstormQuestionKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'brainstormGenre', label: '题材', placeholder: '如都市、玄幻' },
  { key: 'brainstormBackground', label: '故事主题', placeholder: '如系统流' },
  { key: 'brainstormIdea', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
  { key: 'brainstormCheat', label: '你的构思', placeholder: '任何灵感都可以' },
  { key: 'brainstormCount', label: '逐个生成几个脑洞', placeholder: '' },
  { key: 'brainstormRequirement', label: '补充内容', placeholder: '主角名字、性格、女主设定等' },
];
const BRAINSTORM_OUTPUT_ONLY_INSTRUCTION = '请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签。';
const BRAINSTORM_REQUEST_HEADER = '【以下是用户输出的内容】';
const BRAINSTORM_OTHER_REQUIREMENTS_HEADER = '【其他要求】';
const BRAINSTORM_GENERATE_TASK_TEXT = '请根据以下信息，生成一个可以保存进脑洞库的小说脑洞设定。';
const BRAINSTORM_GENERATE_RULE_TEXT = '要求：内容要具体、可继续扩展，避免只复述问题；如果信息不足，请合理补全但不要偏离用户要求。';

function normalizeBrainstormCountValue(value: string) {
  const trimmed = value.trim();
  const legacyMatch = trimmed.match(/^(\d+)\s*个$/);
  return legacyMatch?.[1] ?? trimmed;
}

const BRAINSTORM_PREVIEW_MIN_FONT_SIZE = 12;
const BRAINSTORM_PREVIEW_MAX_FONT_SIZE = 28;
const BRAINSTORM_OUTPUT_MIN_FONT_SIZE = 12;
const BRAINSTORM_OUTPUT_MAX_FONT_SIZE = 28;
const SETTING_PREVIEW_MIN_FONT_SIZE = 12;
const SETTING_PREVIEW_MAX_FONT_SIZE = 28;
const ROLE_TEXT_MIN_FONT_SIZE = 12;
const ROLE_TEXT_MAX_FONT_SIZE = 28;
const DETAIL_OUTLINE_MIN_FONT_SIZE = 12;
const DETAIL_OUTLINE_MAX_FONT_SIZE = 28;
const LIBRARY_AI_TIMEOUT_MS = 180000;

type LibraryTabConfigs = Record<string, LibraryTabConfig>;

function getTabConfigsStorageKey(storageKey: string) {
  return `${storageKey}_tab_configs_v1`;
}

function getActiveTabStorageKey(storageKey: string) {
  return `${storageKey}_active_tab`;
}

function readActiveTab(storageKey: string, tabs: string[], defaultActiveTab?: string) {
  const normalizedDefault = normalizeTabName(defaultActiveTab ?? '');
  if (tabs.includes(normalizedDefault)) return normalizedDefault;
  try {
    const stored = normalizeTabName(localStorage.getItem(getActiveTabStorageKey(storageKey)) ?? '');
    if (tabs.includes(stored)) return stored;
  } catch {
    // Ignore localStorage failures and fall back to the supplied default.
  }
  return tabs[0] ?? '';
}

function getSettingLibraryWidthStorageKey(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview') {
  return `${storageKey}_${normalizeTabName(tab)}_${side}_width`;
}

function getExpandedStringSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

function readExpandedStringSet(storageKey: string, tab: string, name: string, fallback: string[] = [UNCATEGORIZED_TYPE]) {
  try {
    const raw = localStorage.getItem(getExpandedStringSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as string[] : fallback;
    const values = parsed.filter((item) => typeof item === 'string' && item.trim());
    return new Set(values.length > 0 ? values : fallback);
  } catch {
    return new Set(fallback);
  }
}

function persistExpandedStringSet(storageKey: string, tab: string, name: string, values: Set<string>) {
  localStorage.setItem(getExpandedStringSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

function getExpandedNumberSetStorageKey(storageKey: string, tab: string, name: string) {
  return `${storageKey}_${normalizeTabName(tab)}_${name}_expanded_v1`;
}

function readExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    const raw = localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name));
    const parsed = raw ? JSON.parse(raw) as number[] : [];
    return new Set(parsed.filter((item) => Number.isFinite(item)));
  } catch {
    return new Set<number>();
  }
}

function hasStoredExpandedNumberSet(storageKey: string, tab: string, name: string) {
  try {
    return localStorage.getItem(getExpandedNumberSetStorageKey(storageKey, tab, name)) !== null;
  } catch {
    return false;
  }
}

function persistExpandedNumberSet(storageKey: string, tab: string, name: string, values: Set<number>) {
  localStorage.setItem(getExpandedNumberSetStorageKey(storageKey, tab, name), JSON.stringify([...values]));
}

function getManualDetailOutlinePublishedStorageKey(storageKey: string) {
  return `${storageKey}_${DETAIL_OUTLINE_PUBLISHED_GROUP_NAME}_v1`;
}

function readManualDetailOutlinePublishedChapterIds(storageKey: string) {
  try {
    const raw = localStorage.getItem(getManualDetailOutlinePublishedStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as number[] : [];
    return new Set(parsed.filter((item) => Number.isFinite(item)));
  } catch {
    return new Set<number>();
  }
}

function persistManualDetailOutlinePublishedChapterIds(storageKey: string, values: Set<number>) {
  localStorage.setItem(getManualDetailOutlinePublishedStorageKey(storageKey), JSON.stringify([...values]));
}

function getSettingLibraryLeftMaxWidth(tab: string, scaleValue = 1) {
  if (typeof window === 'undefined') return SETTING_LIBRARY_LEFT_MAX_WIDTH;
  const normalizedScale = Number.isFinite(scaleValue) && scaleValue > 0 ? scaleValue : 1;
  const isOutlineActionTab = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB;
  const isSettingTab = tab === SETTING_TAB;
  const minWidth = isSettingTab ? SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH : SETTING_LIBRARY_LEFT_MIN_WIDTH;
  const viewportDivider = isSettingTab ? 2 : isOutlineActionTab ? 2.5 : 5;
  const viewportLimitWidth = Math.floor(window.innerWidth / normalizedScale / viewportDivider);
  const fixedMaxWidth = isSettingTab
    ? SETTING_LIBRARY_LEFT_MAX_WIDTH
    : isOutlineActionTab
      ? OUTLINE_LEFT_MAX_DISPLAY_WIDTH
      : SETTING_LIBRARY_LEFT_MAX_WIDTH;
  return Math.max(
    minWidth,
    Math.min(fixedMaxWidth, viewportLimitWidth),
  );
}

function getDetailOutlineLeftMinWidth(scaleValue = 1) {
  if (typeof window === 'undefined') return SETTING_LIBRARY_LEFT_MIN_WIDTH;
  const normalizedScale = Number.isFinite(scaleValue) && scaleValue > 0 ? scaleValue : 1;
  const viewportEighthWidth = Math.floor(window.innerWidth / normalizedScale / 8);
  return Math.max(SETTING_LIBRARY_LEFT_MIN_WIDTH, viewportEighthWidth);
}

function getSettingLibraryLeftMinWidth(tab: string, scaleValue = 1) {
  if (tab === SETTING_TAB) return SETTING_LIBRARY_SETTING_LEFT_MIN_WIDTH;
  return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
    ? getDetailOutlineLeftMinWidth(scaleValue)
    : SETTING_LIBRARY_LEFT_MIN_WIDTH;
}

function clampSettingLibraryLeftWidth(value: number, tab: string, scaleValue = 1) {
  const minWidth = getSettingLibraryLeftMinWidth(tab, scaleValue);
  const maxWidth = Math.max(minWidth, getSettingLibraryLeftMaxWidth(tab, scaleValue));
  return Math.min(maxWidth, Math.max(minWidth, value));
}

function readSettingLibraryLeftWidth(storageKey: string, tab: string, scaleValue = 1) {
  const fallbackWidth = clampSettingLibraryLeftWidth(SETTING_LIBRARY_LEFT_WIDTH, tab, scaleValue);
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'left')) ?? SETTING_LIBRARY_LEFT_WIDTH);
    if (!Number.isFinite(value)) return fallbackWidth;
    return clampSettingLibraryLeftWidth(value, tab, scaleValue);
  } catch {
    return fallbackWidth;
  }
}

function readSettingLibraryRightWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'right')) ?? SETTING_LIBRARY_RIGHT_WIDTH);
    const minWidth = tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
      ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
      : SETTING_LIBRARY_RIGHT_MIN_WIDTH;
    if (!Number.isFinite(value)) return minWidth;
    return Math.min(SETTING_LIBRARY_RIGHT_MAX_WIDTH, Math.max(minWidth, value));
  } catch {
    return tab === DETAIL_OUTLINE_TAB || tab === OUTLINE_LIBRARY_TAB
      ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
      : SETTING_LIBRARY_RIGHT_WIDTH;
  }
}

function readBrainstormPreviewWidth(storageKey: string, tab: string) {
  try {
    const value = Number(localStorage.getItem(getSettingLibraryWidthStorageKey(storageKey, tab, 'brainstormPreview')) ?? BRAINSTORM_PREVIEW_WIDTH);
    if (!Number.isFinite(value)) return BRAINSTORM_PREVIEW_WIDTH;
    return Math.min(BRAINSTORM_PREVIEW_MAX_WIDTH, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, value));
  } catch {
    return BRAINSTORM_PREVIEW_WIDTH;
  }
}

function persistSettingLibraryWidth(storageKey: string, tab: string, side: 'left' | 'right' | 'brainstormPreview', value: number) {
  localStorage.setItem(getSettingLibraryWidthStorageKey(storageKey, tab, side), String(value));
}

function getPlotPointLayoutWidthStorageKey(storageKey: string, side: 'tree' | 'left' | 'right') {
  return `${storageKey}_plot_point_layout_${side}_width_v1`;
}

function readPlotPointLayoutTreeWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'tree')) ?? PLOT_POINT_LAYOUT_TREE_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_TREE_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_TREE_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_TREE_WIDTH;
  }
}

function readPlotPointLayoutLeftWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'left')) ?? PLOT_POINT_LAYOUT_LEFT_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_LEFT_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_LEFT_WIDTH;
  }
}

function readPlotPointLayoutRightWidth(storageKey: string) {
  try {
    const value = Number(localStorage.getItem(getPlotPointLayoutWidthStorageKey(storageKey, 'right')) ?? PLOT_POINT_LAYOUT_RIGHT_WIDTH);
    if (!Number.isFinite(value)) return PLOT_POINT_LAYOUT_RIGHT_WIDTH;
    return Math.min(PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH, Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, value));
  } catch {
    return PLOT_POINT_LAYOUT_RIGHT_WIDTH;
  }
}

function persistPlotPointLayoutWidth(storageKey: string, side: 'tree' | 'left' | 'right', value: number) {
  localStorage.setItem(getPlotPointLayoutWidthStorageKey(storageKey, side), String(value));
}

function readTabConfigs(storageKey: string): LibraryTabConfigs {
  try {
    const raw = localStorage.getItem(getTabConfigsStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as LibraryTabConfigs : {};
    if (parsed && typeof parsed === 'object' && !parsed[SETTING_TAB] && parsed['设定']) {
      parsed[SETTING_TAB] = parsed['设定'];
    }
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function getRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_role_types`;
}

function readCustomRoleTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getRoleTypesStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return Array.from(new Set(parsed
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => normalizeWorkbenchRoleType(item))));
  } catch {
    return [];
  }
}

function getHiddenRoleTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_role_types`;
}

const ROLE_TAXONOMY_DEFAULTS_VERSION = '2026-06-24-role-groups-v3';
const SETTING_TAXONOMY_DEFAULTS_VERSION = '2026-06-18-setting-tabs-groups-v3';

function getRoleTaxonomyDefaultsVersionStorageKey(storageKey: string) {
  return `${storageKey}_role_taxonomy_defaults_version`;
}

function getSettingTaxonomyDefaultsVersionStorageKey(storageKey: string) {
  return `${storageKey}_setting_taxonomy_defaults_version`;
}

function getSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_setting_types`;
}

function getSettingTypeDomainsStorageKey(storageKey: string) {
  return `${storageKey}_setting_type_domains`;
}

function readCustomSettingTypes(storageKey: string) {
  try {
    const raw = localStorage.getItem(getSettingTypesStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

function readCustomSettingTypeDomains(storageKey: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(getSettingTypeDomainsStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    return Object.entries(parsed).reduce<Record<string, string>>((acc, [type, domain]) => {
      if (type.trim() && typeof domain === 'string' && domain.trim()) acc[type] = domain;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function getHiddenSettingTypesStorageKey(storageKey: string) {
  return `${storageKey}_hidden_setting_types`;
}

function readStringList(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return parsed.filter((item) => typeof item === 'string' && item.trim());
  } catch {
    return [];
  }
}

function normalizeLinkedOtherSettingIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)));
}

function readHiddenRoleTypes(storageKey: string) {
  const hidden = readStringList(getHiddenRoleTypesStorageKey(storageKey))
    .map((item) => normalizeWorkbenchRoleType(item));
  if (localStorage.getItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey)) === ROLE_TAXONOMY_DEFAULTS_VERSION) {
    return Array.from(new Set(hidden));
  }
  const next = Array.from(new Set(hidden.filter((type) => !DEFAULT_ROLE_TYPES.includes(type))));
  localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify(next));
  localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
  return next;
}

function readHiddenSettingTypes(storageKey: string) {
  const hidden = readStringList(getHiddenSettingTypesStorageKey(storageKey))
    .map((item) => normalizeSettingType(item));
  if (localStorage.getItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey)) === SETTING_TAXONOMY_DEFAULTS_VERSION) {
    return Array.from(new Set(hidden));
  }
  const next = Array.from(new Set(hidden.filter((type) => !DEFAULT_SETTING_TYPES.includes(type))));
  localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(next));
  localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
  return next;
}

function normalizeTabName(tab: string) {
  if (tab === '角色库') return ROLE_TAB;
  if (tab === '设定') return SETTING_TAB;
  if (tab === '设定库') return SETTING_TAB;
  if (tab === '摘要库' || tab === '概要库' || tab === LEGACY_OUTLINE_LIBRARY_TAB || tab === LEGACY_OUTLINE_LIBRARY_TAB_OLD) return OUTLINE_LIBRARY_TAB;
  if (tab === LEGACY_CHAPTER_SUMMARY_TAB || tab === LEGACY_CHAPTER_SUMMARY_TAB_OLD) return CHAPTER_SUMMARY_TAB;
  if (tab === LEGACY_VOLUME_SUMMARY_TAB || tab === LEGACY_VOLUME_SUMMARY_TAB_OLD) return VOLUME_SUMMARY_TAB;
  return tab;
}

function isSettingLikeTab(tab: string) {
  return tab === BRAINSTORM_TAB || tab === SETTING_TAB;
}

function isDetailOutlineLikeTab(tab: string) {
  return tab === DETAIL_OUTLINE_TAB || tab === DETAIL_OUTLINE_DISPLAY_LABEL || tab === CHAPTER_DETAIL_OUTLINE_TAB;
}

function normalizeEntries(entries: WorkbenchLibraryEntry[]) {
  return entries.map((entry) => ({ ...entry, tab: normalizeTabName(entry.tab) }));
}

function hasLibraryAiDialogContent(aiInput = '', aiOutput = '', aiResult = '') {
  return Boolean(aiInput.trim() || aiOutput.trim() || aiResult.trim());
}

function readNormalizedEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(storageKey));
}

function readNormalizedEntriesWithGlobalBrainstorm(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey));
}

function getDefaultWorkSettingStarterVersionStorageKey(storageKey: string) {
  return `${storageKey}_work_setting_starter_version`;
}

function createDefaultWorkSettingStarterEntry(item: typeof DEFAULT_WORK_SETTING_STARTER_ENTRIES[number]) {
  const structuredFieldSet = getStructuredSettingFieldSetByDefaultTitle(item.type, item.title);
  return {
    ...createWorkbenchLibraryEntry(SETTING_TAB, item.title),
    content: stringifySettingContent({
      type: item.type,
      body: '',
      lockedDefaultEntryId: getDefaultWorkSettingEntryId(item.type, item.title),
      ...(structuredFieldSet ? { structuredFieldSetId: structuredFieldSet.id } : {}),
    }),
  };
}

function clearLegacyDefaultWorkSettingInstructions(entries: WorkbenchLibraryEntry[]) {
  const legacyInstructions = new Set(LEGACY_DEFAULT_WORK_SETTING_INSTRUCTIONS.map((item) => `${normalizeSettingType(item.type)}::${item.title}::${item.body}`));
  let changed = false;
  const nextEntries = entries.map((entry) => {
    if (entry.tab !== SETTING_TAB) return entry;
    const setting = parseSettingContent(entry.content);
    if (!legacyInstructions.has(`${setting.type}::${entry.title.trim()}::${setting.body}`)) return entry;
    changed = true;
    return {
      ...entry,
      content: stringifySettingContent({ ...setting, body: '' }),
    };
  });
  return changed ? nextEntries : entries;
}

function removeLegacyAutoDomainSettingStarterEntries(entries: WorkbenchLibraryEntry[]) {
  const legacyAutoEntries = new Set([
    ...LEGACY_AUTO_DOMAIN_SETTING_STARTER_ENTRIES,
    ...LEGACY_DETAILED_DEFAULT_SETTING_STARTER_ENTRIES,
    ...LEGACY_COMPACT_WORK_SETTING_STARTER_ENTRIES,
  ].map((item) => `${normalizeSettingType(item.type)}::${item.title}`));
  let changed = false;
  const nextEntries = entries.filter((entry) => {
    if (entry.tab !== SETTING_TAB) return true;
    const setting = parseSettingContent(entry.content);
    const defaultEntryId = getDefaultWorkSettingEntryId(setting.type, entry.title);
    const isCurrentDefaultEntry = (
      (setting.lockedDefaultEntryId && DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(setting.lockedDefaultEntryId))
      || DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(defaultEntryId)
    );
    const shouldRemove = legacyAutoEntries.has(`${setting.type}::${entry.title.trim()}`) && !setting.body.trim() && !isCurrentDefaultEntry;
    if (shouldRemove) changed = true;
    return !shouldRemove;
  });
  return changed ? nextEntries : entries;
}

function withDefaultWorkSettingStarterEntries(entries: WorkbenchLibraryEntry[], storageKey: string) {
  const clearedEntries = removeLegacyAutoDomainSettingStarterEntries(clearLegacyDefaultWorkSettingInstructions(entries));
  if (localStorage.getItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey)) === DEFAULT_WORK_SETTING_STARTER_VERSION) {
    return clearedEntries;
  }
  const existingKeys = new Set(clearedEntries
    .filter((entry) => entry.tab === SETTING_TAB)
    .map((entry) => {
      const setting = parseSettingContent(entry.content);
      return `${setting.type}::${entry.title.trim()}`;
    }));
  const missingEntries = DEFAULT_WORK_SETTING_STARTER_ENTRIES
    .filter((item) => !existingKeys.has(`${item.type}::${item.title}`))
    .map(createDefaultWorkSettingStarterEntry);
  localStorage.setItem(getDefaultWorkSettingStarterVersionStorageKey(storageKey), DEFAULT_WORK_SETTING_STARTER_VERSION);
  return missingEntries.length > 0 ? [...missingEntries, ...clearedEntries] : clearedEntries;
}

function createDefaultMaleProtagonistRoleEntry() {
  return {
    ...createWorkbenchLibraryEntry(ROLE_TAB, DEFAULT_MALE_PROTAGONIST_ROLE_TITLE),
    content: stringifyRoleContent({
      type: DEFAULT_MALE_PROTAGONIST_ROLE_TYPE,
      lifeStatus: '存活',
      baseSetting: '',
      relationship: '',
      stateSettings: createEmptyRoleStateSettings(),
      stateUpdateChapters: {},
      personality: '',
      background: '',
      status: '',
      history: [],
    }),
  };
}

function hasMaleProtagonistRoleEntry(entries: WorkbenchLibraryEntry[]) {
  return entries.some((entry) => entry.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(entry.content).type));
}

function withDefaultMaleProtagonistRoleEntry(entries: WorkbenchLibraryEntry[]) {
  if (hasMaleProtagonistRoleEntry(entries)) return entries;
  return [createDefaultMaleProtagonistRoleEntry(), ...entries];
}

function readNormalizedEntriesWithVisibleDefaults(storageKey: string, tabs: string[]) {
  const entries = readNormalizedEntriesWithGlobalBrainstorm(storageKey);
  const withSettingDefaults = tabs.includes(SETTING_TAB)
    ? withDefaultWorkSettingStarterEntries(entries, storageKey)
    : entries;
  const nextEntries = tabs.includes(ROLE_TAB)
    ? withDefaultMaleProtagonistRoleEntry(withSettingDefaults)
    : withSettingDefaults;
  if (nextEntries !== entries) {
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, nextEntries);
  }
  return nextEntries;
}

function getBrainstormRecycleStorageKey(storageKey: string) {
  void storageKey;
  return `${GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY}_brainstorm_recycle_v1`;
}

function readBrainstormRecycleEntries(storageKey: string) {
  return normalizeEntries(readWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey)))
    .filter((entry) => entry.tab === BRAINSTORM_TAB);
}

function writeBrainstormRecycleEntries(storageKey: string, entries: WorkbenchLibraryEntry[]) {
  writeWorkbenchLibraryEntries(getBrainstormRecycleStorageKey(storageKey), entries);
}

function createEmptyRoleStateSettings(): RoleStateSettings {
  return ROLE_STATE_FIELD_DEFINITIONS.reduce((result, field) => ({
    ...result,
    [field.key]: '',
  }), {} as RoleStateSettings);
}

function normalizeRoleStateSettings(value: unknown, legacyStatus = ''): RoleStateSettings {
  const next = createEmptyRoleStateSettings();
  if (value && typeof value === 'object') {
    const record = value as Partial<Record<RoleStateFieldKey, unknown>>;
    ROLE_STATE_FIELD_DEFINITIONS.forEach((field) => {
      const fieldValue = record[field.key];
      next[field.key] = typeof fieldValue === 'string' ? fieldValue : '';
    });
  }
  if (!ROLE_STATE_FIELD_DEFINITIONS.some((field) => next[field.key].trim()) && legacyStatus.trim()) {
    next.currentSituation = legacyStatus;
  }
  return next;
}

function normalizeRoleStateUpdateChapters(value: unknown): RoleStateUpdateChapters {
  const next: RoleStateUpdateChapters = {};
  if (!value || typeof value !== 'object') return next;
  const record = value as Partial<Record<RoleStateFieldKey, unknown>>;
  ROLE_STATE_FIELD_DEFINITIONS.forEach((field) => {
    const chapter = record[field.key];
    if (typeof chapter === 'number' && Number.isFinite(chapter) && chapter > 0) {
      next[field.key] = Math.floor(chapter);
    }
  });
  return next;
}

function buildLegacyRoleBaseSetting(parsed: Partial<RoleContent>) {
  return [
    parsed.personality?.trim() ? `人物设定：${parsed.personality.trim()}` : '',
    parsed.background?.trim() ? parsed.background.trim() : '',
  ].filter(Boolean).join('\n\n');
}

function getRoleBaseSetting(role: RoleContent) {
  return role.baseSetting?.trim()
    ? role.baseSetting
    : buildLegacyRoleBaseSetting(role);
}

function getRoleStateSettings(role: RoleContent) {
  return normalizeRoleStateSettings(role.stateSettings, role.status);
}

function getRoleStateUpdateChapters(role: RoleContent) {
  return normalizeRoleStateUpdateChapters(role.stateUpdateChapters);
}

function getRoleStateUpdateLabel(chapter: number | undefined) {
  return chapter ? `更新至第${chapter}章` : '未记录章节';
}

function buildRoleStateSettingsText(settings: RoleStateSettings) {
  return ROLE_STATE_FIELD_DEFINITIONS
    .map((field) => {
      const content = settings[field.key].trim();
      return content ? `${field.title}：${content}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function getRoleReadableContent(role: RoleContent) {
  return [
    getRoleBaseSetting(role),
    role.relationship?.trim() ? `人物关系：${role.relationship.trim()}` : '',
    buildRoleStateSettingsText(getRoleStateSettings(role)),
  ].filter((part) => part.trim()).join('\n\n');
}

function parseRoleContent(content: string): RoleContent {
  try {
    const parsed = JSON.parse(content) as Partial<RoleContent>;
    const type = normalizeWorkbenchRoleType(parsed.type);
    const lifeStatus = normalizeWorkbenchRoleLifeStatus(type, parsed.lifeStatus);
    const baseSetting = typeof parsed.baseSetting === 'string'
      ? parsed.baseSetting
      : buildLegacyRoleBaseSetting(parsed);
    const stateSettings = normalizeRoleStateSettings(parsed.stateSettings, parsed.status);
    const stateUpdateChapters = normalizeRoleStateUpdateChapters(parsed.stateUpdateChapters);
    return {
      type,
      lifeStatus,
      baseSetting,
      relationship: parsed.relationship || '',
      stateSettings,
      stateUpdateChapters,
      personality: parsed.personality || '',
      background: parsed.background || baseSetting,
      status: parsed.status || buildRoleStateSettingsText(stateSettings),
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, ROLE_HISTORY_LIMIT) : [],
    };
  } catch {
    const stateSettings = createEmptyRoleStateSettings();
    return {
      type: '未分类',
      lifeStatus: '存活',
      baseSetting: content || '',
      relationship: '',
      stateSettings,
      stateUpdateChapters: {},
      personality: '',
      background: content || '',
      status: '',
      history: [],
    };
  }
}

function stringifyRoleContent(value: RoleContent) {
  const type = normalizeWorkbenchRoleType(value.type);
  const baseSetting = getRoleBaseSetting(value);
  const stateSettings = getRoleStateSettings(value);
  const stateUpdateChapters = getRoleStateUpdateChapters(value);
  return JSON.stringify({
    ...value,
    type,
    lifeStatus: normalizeWorkbenchRoleLifeStatus(type, value.lifeStatus),
    baseSetting,
    relationship: value.relationship || '',
    stateSettings,
    stateUpdateChapters,
    background: value.background || baseSetting,
    status: value.status || buildRoleStateSettingsText(stateSettings),
  });
}

function buildRoleReaderContent(entry: WorkbenchLibraryEntry, role: RoleContent) {
  const baseSetting = getRoleBaseSetting(role);
  const stateText = buildRoleStateSettingsText(getRoleStateSettings(role));
  const baseContent = [
    `角色名：${entry.title || '未命名角色'}`,
    `角色分类：${normalizeWorkbenchRoleType(role.type) || '未分类'}`,
    truncateTextForAi(baseSetting, 900),
  ].filter(Boolean).join('\n\n');
  const stateContent = [
    `生存状态：${role.lifeStatus}`,
    truncateTextForAi(stateText, 900),
  ].filter(Boolean).join('\n\n');
  return [
    wrapAiRequestTag('基础设定', baseContent),
    role.relationship.trim() ? wrapAiRequestTag('人物关系', truncateTextForAi(role.relationship, 700)) : '',
    wrapAiRequestTag('状态设定', stateContent),
  ].filter(Boolean).join('\n\n');
}

function createRoleHistoryVersion(entry: WorkbenchLibraryEntry, role: RoleContent): RoleHistoryVersion {
  return {
    title: entry.title,
    type: role.type,
    lifeStatus: role.lifeStatus,
    baseSetting: getRoleBaseSetting(role),
    relationship: role.relationship,
    stateSettings: getRoleStateSettings(role),
    stateUpdateChapters: getRoleStateUpdateChapters(role),
    personality: role.personality,
    background: role.background,
    status: role.status,
    savedAt: new Date().toLocaleString('zh-CN'),
  };
}

function isSameRoleVersion(left: RoleHistoryVersion, right: RoleHistoryVersion) {
  return left.title === right.title &&
    left.type === right.type &&
    left.lifeStatus === right.lifeStatus &&
    left.baseSetting === right.baseSetting &&
    left.relationship === right.relationship &&
    JSON.stringify(left.stateSettings) === JSON.stringify(right.stateSettings) &&
    JSON.stringify(left.stateUpdateChapters ?? {}) === JSON.stringify(right.stateUpdateChapters ?? {}) &&
    left.personality === right.personality &&
    left.background === right.background &&
    left.status === right.status;
}

function appendRoleHistory(history: RoleHistoryVersion[] | undefined, version: RoleHistoryVersion) {
  const current = history ?? [];
  if (current[0] && isSameRoleVersion(current[0], version)) return current.slice(0, ROLE_HISTORY_LIMIT);
  return [version, ...current].slice(0, ROLE_HISTORY_LIMIT);
}

function normalizeSettingType(value: string | undefined) {
  return value?.trim() || UNCATEGORIZED_TYPE;
}

function parseSettingContent(content: string): SettingContent {
  try {
    const parsed = JSON.parse(content) as Partial<SettingContent>;
    return {
      type: normalizeSettingType(parsed.type),
      body: parsed.body || '',
      structuredFieldSetId: typeof parsed.structuredFieldSetId === 'string' ? parsed.structuredFieldSetId : undefined,
      lockedDefaultEntryId: typeof parsed.lockedDefaultEntryId === 'string' ? parsed.lockedDefaultEntryId : undefined,
    };
  } catch {
    return {
      type: '未分类',
      body: content || '',
    };
  }
}

function stringifySettingContent(value: SettingContent) {
  return JSON.stringify({
    ...value,
    type: normalizeSettingType(value.type),
    structuredFieldSetId: value.structuredFieldSetId || undefined,
    lockedDefaultEntryId: value.lockedDefaultEntryId || undefined,
  });
}

function isLockedDefaultSettingEntry(entry: WorkbenchLibraryEntry) {
  if (entry.tab !== SETTING_TAB) return false;
  const setting = parseSettingContent(entry.content);
  const defaultEntryId = getDefaultWorkSettingEntryId(setting.type, entry.title);
  return Boolean(
    (setting.lockedDefaultEntryId && DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(setting.lockedDefaultEntryId))
    || DEFAULT_WORK_SETTING_STARTER_ENTRY_IDS.has(defaultEntryId),
  );
}

function createEmptyStructuredSettingFields(fieldSet: StructuredSettingFieldSet) {
  return fieldSet.fields.reduce((result, field) => {
    result[field.key] = '';
    return result;
  }, {} as Record<string, string>);
}

function parseSectionedSettingBody(body: string) {
  const sections: Record<string, string> = {};
  const pattern = /(?:^|\n)\s*【([^】\n]+)】：\s*\n([\s\S]*?)(?=\n\s*【[^】\n]+】：\s*\n|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    sections[match[1].trim()] = match[2].trim();
  }
  return sections;
}

function parseStructuredSettingFields(body: string, fieldSet: StructuredSettingFieldSet) {
  const sections = parseSectionedSettingBody(body);
  const fields = createEmptyStructuredSettingFields(fieldSet);
  fieldSet.fields.forEach((field) => {
    fields[field.key] = sections[field.title] ?? '';
  });
  return fields;
}

function stringifyStructuredSettingFields(fields: Record<string, string>, fieldSet: StructuredSettingFieldSet) {
  return fieldSet.fields
    .map((field) => `【${field.title}】：\n${fields[field.key].trim()}`)
    .join('\n\n');
}

function createEmptyRoleBaseSettingFields() {
  return ROLE_BASE_SETTING_FIELD_DEFINITIONS.reduce((result, field) => {
    result[field.key] = '';
    return result;
  }, {} as Record<RoleBaseSettingFieldKey, string>);
}

function parseRoleBaseSettingFields(body: string) {
  const sections = parseSectionedSettingBody(body);
  const fields = createEmptyRoleBaseSettingFields();
  const hasSectionedContent = ROLE_BASE_SETTING_FIELD_DEFINITIONS.some((field) => sections[field.title] !== undefined);
  ROLE_BASE_SETTING_FIELD_DEFINITIONS.forEach((field) => {
    fields[field.key] = sections[field.title] ?? '';
  });
  if (!hasSectionedContent && body.trim()) {
    fields.background = body;
  }
  return fields;
}

function stringifyRoleBaseSettingFields(fields: Record<RoleBaseSettingFieldKey, string>) {
  return ROLE_BASE_SETTING_FIELD_DEFINITIONS
    .map((field) => `【${field.title}】：\n${fields[field.key].trim()}`)
    .join('\n\n');
}

function getImportedRoleSection(sections: Record<string, string>, names: string[]) {
  for (const name of names) {
    const value = sections[name]?.trim();
    if (value) return value;
  }
  return '';
}

function buildImportedRoleEntryTitle(segment: SmartImportRoleSegment, existingRoleTitle = '') {
  const sections = parseSectionedSettingBody(segment.body);
  const explicitName = getImportedRoleSection(sections, ['人物姓名', '姓名', '角色姓名', '名字']);
  if (explicitName) return explicitName;
  if (/男主角|主角/.test(segment.title) && existingRoleTitle.trim()) return existingRoleTitle;
  return segment.title.replace(/设定$/, '').trim() || DEFAULT_MALE_PROTAGONIST_ROLE_TITLE;
}

function createImportedRoleContent(segment: SmartImportRoleSegment, existingRole?: RoleContent): RoleContent {
  const sections = parseSectionedSettingBody(segment.body);
  const importedType = getImportedRoleSection(sections, ['身份定位', '角色定位', '人物定位', '身份', '类型']);
  const type = importedType || existingRole?.type || (/男主角|主角/.test(segment.title) ? DEFAULT_MALE_PROTAGONIST_ROLE_TYPE : '未分类');
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
  const relationship = getImportedRoleSection(sections, ['人物关系', '关系']);
  const baseSetting = hasBaseFields ? stringifyRoleBaseSettingFields(baseFields) : segment.body.trim();
  return {
    type,
    lifeStatus: existingRole?.lifeStatus ?? '存活',
    baseSetting,
    relationship,
    stateSettings,
    stateUpdateChapters: existingRole?.stateUpdateChapters ?? {},
    personality: baseFields.corePersonality,
    background: baseFields.background || baseSetting,
    status: buildRoleStateSettingsText(stateSettings),
    history: existingRole?.history ?? [],
  };
}

function getStructuredSettingFieldSet(entry: WorkbenchLibraryEntry, setting: SettingContent | null) {
  if (setting?.structuredFieldSetId) {
    const fieldSet = STRUCTURED_SETTING_FIELD_SETS.find((item) => item.id === setting.structuredFieldSetId);
    if (fieldSet) return fieldSet;
  }
  const titleMatchedFieldSet = STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => (
    setting?.type === fieldSet.entryType && entry.title.trim() === fieldSet.entryTitle
  ));
  if (titleMatchedFieldSet) return titleMatchedFieldSet;
  const typeMatchedFieldSet = STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => (
    fieldSet.matchAllTitles && setting?.type === fieldSet.entryType
  ));
  if (typeMatchedFieldSet) return typeMatchedFieldSet;
  if (setting?.body.trim()) {
    const sections = parseSectionedSettingBody(setting.body);
    return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => (
      setting.type === fieldSet.entryType && fieldSet.fields.some((field) => sections[field.title] !== undefined)
    )) ?? null;
  }
  return null;
}

function getStructuredSettingFieldSetByDefaultTitle(type: string, title: string) {
  const normalizedType = normalizeSettingType(type);
  const normalizedTitle = title.trim();
  return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => (
    normalizeSettingType(fieldSet.entryType) === normalizedType && fieldSet.entryTitle === normalizedTitle
  )) ?? null;
}

function getSettingImportFormatFieldSet(type: string, title: string) {
  const directFieldSet = getStructuredSettingFieldSetByDefaultTitle(type, title);
  if (directFieldSet) return directFieldSet;
  const normalizedType = normalizeSettingType(type);
  if (['正派势力', '反派势力', '中立势力', '其他势力'].includes(normalizedType)) {
    return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => fieldSet.id === 'faction-righteous-no-1') ?? null;
  }
  if (normalizedType === '世界地图' && title.trim() === '危险区域') {
    return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => fieldSet.id === 'faction-danger-zone') ?? null;
  }
  return STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => (
    fieldSet.matchAllTitles && normalizeSettingType(fieldSet.entryType) === normalizedType
  )) ?? null;
}

function mapStructuredFieldsToImportFormat(fields: readonly StructuredSettingFieldDefinition[]): SettingImportFormatField[] {
  return fields.map((field) => ({ title: field.title, placeholder: field.placeholder }));
}

function getSettingImportFormatFields(type: string, title: string): SettingImportFormatField[] {
  const fieldSet = getSettingImportFormatFieldSet(type, title);
  if (fieldSet) return mapStructuredFieldsToImportFormat(fieldSet.fields);
  return [{ title: '内容', placeholder: '直接填写该设定条目的正文内容。' }];
}

function getSettingImportFormatEntryTitles(type: string, currentSettingEntries: WorkbenchLibraryEntry[] = []) {
  const normalizedType = normalizeSettingType(type);
  if (normalizedType === '正派势力') return ['1号势力'];
  if (normalizedType === '反派势力') return ['反派势力'];
  if (normalizedType === '中立势力') return ['中立势力'];
  if (normalizedType === '其他势力') return ['其他势力'];
  if (normalizedType === '世界地图') return ['世界架构', '危险区域'];
  if (normalizedType === '怪物列表') return ['怪物图鉴'];
  const currentTitles = currentSettingEntries
    .filter((entry) => normalizeSettingType(parseSettingContent(entry.content).type) === normalizedType)
    .map((entry) => entry.title);
  const starterTitles = DEFAULT_WORK_SETTING_STARTER_ENTRIES
    .filter((entry) => normalizeSettingType(entry.type) === normalizedType)
    .map((entry) => entry.title);
  const structuredTitles = STRUCTURED_SETTING_FIELD_SETS
    .filter((fieldSet) => normalizeSettingType(fieldSet.entryType) === normalizedType && !fieldSet.matchAllTitles)
    .map((fieldSet) => fieldSet.entryTitle);
  const knownTitles = Array.from(new Set([...currentTitles, ...starterTitles, ...structuredTitles]))
    .filter((title) => title.trim());
  const visibleTitles = knownTitles.filter((title) => normalizeSettingType(title) !== normalizedType);
  return visibleTitles.length > 0 ? visibleTitles : [normalizedType];
}

function createSettingImportFormatEntry(
  tabId: OtherSettingLinkTabId,
  tabTitle: string,
  groupName: string,
  title: string,
): SettingImportFormatEntry {
  return {
    id: `${tabId}:${groupName}:${title}`,
    tabId,
    tabTitle,
    groupName,
    title,
    fields: getSettingImportFormatFields(groupName, title),
  };
}

function buildSettingImportFormatTabs(options: BuildSettingImportFormatTabsOptions): SettingImportFormatTab[] {
  const { visibleSettingTypes, settingEntries, getSettingTypeWorkspaceDomain } = options;
  const workGroups = visibleSettingTypes.filter((type) => !getSettingTypeWorkspaceDomain(type)).map((groupName) => ({
    name: groupName,
    entries: getSettingImportFormatEntryTitles(groupName, settingEntries).map((title) => (
      createSettingImportFormatEntry('work', '作品设定', groupName, title)
    )),
  }));
  const roleFields: SettingImportFormatField[] = [
    { title: '人物姓名', placeholder: '角色姓名。' },
    { title: '身份定位', placeholder: '男主角、女主角、配角、反派等。' },
    ...ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => ({ title: field.title, placeholder: field.placeholder })),
    { title: '人物关系', placeholder: '与主角、阵营、亲友、敌人、师徒、利益对象的关系。' },
    ...ROLE_STATE_FIELD_DEFINITIONS.map((field) => ({ title: field.title, placeholder: `${field.level}的状态内容。` })),
  ];
  const domainTabs: SettingImportFormatTab[] = [
    {
      id: 'work',
      title: '作品设定',
      groups: workGroups,
    },
    {
      id: 'roles',
      title: '人物设定',
      groups: [
        {
          name: DEFAULT_MALE_PROTAGONIST_ROLE_TITLE,
          entries: [
            {
              id: 'roles:男主角:男主角设定',
              tabId: 'roles',
              tabTitle: '人物设定',
              groupName: DEFAULT_MALE_PROTAGONIST_ROLE_TITLE,
              title: '男主角设定',
              fields: roleFields,
              note: '人物设定会写入角色库；写入“身份定位：男主角”时，会优先匹配男主角角色。',
            },
          ],
        },
      ],
    },
    ...([
      ['factions', '势力设定', 'setting:faction'],
      ['items', '道具资源', 'setting:item'],
      ['monsters', '怪物图鉴', 'setting:monster'],
      ['foreshadow', '伏笔线索', 'setting:foreshadow'],
    ] as const).map(([tabId, tabTitle, domain]) => ({
      id: tabId,
      title: tabTitle,
      groups: visibleSettingTypes.filter((type) => getSettingTypeWorkspaceDomain(type) === domain).map((groupName) => ({
        name: groupName,
        entries: getSettingImportFormatEntryTitles(groupName, settingEntries).map((title) => (
          createSettingImportFormatEntry(tabId, tabTitle, groupName, title)
        )),
      })),
    })),
  ];
  return domainTabs;
}

const DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID = 'work';
const DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID = '';

function findSettingImportFormatEntry(entryId: string, tabs: SettingImportFormatTab[]) {
  return tabs
    .flatMap((tab) => tab.groups.flatMap((group) => group.entries))
    .find((entry) => entry.id === entryId) ?? tabs[0]?.groups[0]?.entries[0] ?? null;
}

function buildSettingImportFormatEntryBlock(entry: SettingImportFormatEntry) {
  const fieldLines = entry.fields.flatMap((field) => [
    `【${field.title}】：`,
    field.title === '身份定位' ? '男主角' : '内容',
  ]);
  return [
    `*${entry.title}*：`,
    ...fieldLines,
  ].join('\n').trimEnd();
}

function buildSettingImportFormatPreview(entry: SettingImportFormatEntry) {
  const entryBlock = buildSettingImportFormatEntryBlock(entry);
  if (entry.tabTitle === '人物设定') {
    return [
      '<人物设定>',
      entryBlock,
      '</人物设定>',
    ].join('\n').trimEnd();
  }
  return [
    `<${entry.tabTitle}>`,
    `<${entry.groupName}>`,
    entryBlock,
    `</${entry.groupName}>`,
    `</${entry.tabTitle}>`,
  ].join('\n').trimEnd();
}

function buildSettingImportFormatGroupPreview(tab: SettingImportFormatTab, group: SettingImportFormatGroup) {
  const entryBlocks = group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry));
  if (tab.title === '人物设定') {
    return [
      '<人物设定>',
      ...entryBlocks,
      '</人物设定>',
    ].join('\n').trimEnd();
  }
  return [
    `<${tab.title}>`,
    `<${group.name}>`,
    ...entryBlocks,
    `</${group.name}>`,
    `</${tab.title}>`,
  ].join('\n').trimEnd();
}

function buildSettingImportFormatTabPreview(tab: SettingImportFormatTab) {
  if (tab.title === '人物设定') {
    const entryBlocks = tab.groups.flatMap((group) => group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry)));
    return [
      '<人物设定>',
      ...entryBlocks,
      '</人物设定>',
    ].join('\n').trimEnd();
  }
  const groupBlocks = tab.groups.map((group) => [
    `<${group.name}>`,
    ...group.entries.map((entry) => buildSettingImportFormatEntryBlock(entry)),
    `</${group.name}>`,
  ].join('\n').trimEnd());
  return [
    `<${tab.title}>`,
    ...groupBlocks,
    `</${tab.title}>`,
  ].join('\n').trimEnd();
}

function buildSettingImportFormatScopedPreview(
  scope: SettingImportFormatPreviewScope,
  tab: SettingImportFormatTab,
  group: SettingImportFormatGroup,
  entry: SettingImportFormatEntry,
) {
  if (scope === '标签') return buildSettingImportFormatTabPreview(tab);
  if (scope === '分组') return buildSettingImportFormatGroupPreview(tab, group);
  return buildSettingImportFormatPreview(entry);
}

function getSettingImportFormatLineClassName(line: string, lineIndex: number) {
  const trimmed = line.trim();
  if (/^<\/?[^<>]+>$/.test(trimmed)) {
    return lineIndex === 0 ? 'text-amber-600' : 'text-purple-700';
  }
  if (/^\*[^*]+\*[:：]$/.test(trimmed)) return 'text-sky-700';
  return 'text-slate-800';
}

function SettingImportFormatPreviewText({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, index) => (
        <span
          key={`${index}-${line}`}
          className={`block min-h-[1.75em] ${getSettingImportFormatLineClassName(line, index)}`}
        >
          {line || '\u00A0'}
        </span>
      ))}
    </>
  );
}

function normalizeImportedSettingKey(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeImportedSettingBody(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}

function classifySettingText(text: string) {
  const source = text.toLowerCase();
  if (/(爽点|卖点|期待感|差异点|题材|男频|读者第一眼)/.test(source)) return '题材卖点';
  if (/(境界|等级|阶位|成长|修炼|突破|修为|职业|技能|资源消耗|晋升|练气|筑基|金丹|元婴|化神|异能等级|机甲等级|基因等级)/.test(source)) return '成长体系';
  if (/(金手指|外挂|独有能力|代价|升级方式|误用风险|系统|面板)/.test(source)) return '金手指';
  if (/(邪教|魔教|反派组织|敌对|黑暗势力|反派势力)/.test(source)) return '反派势力';
  if (/(中立|商会|协会|交易所|佣兵|旁观势力)/.test(source)) return '中立势力';
  if (/(宗门|家族|王朝|帮派|军队|学院|公司|财团|组织|势力|联盟|官方|阵营)/.test(source)) return '正派势力';
  if (/(妖兽|怪兽|怪物|魔兽|异兽|凶兽|灵兽|灵宠|邪祟|兽潮|妖丹|兽骨|鳞甲|毒囊)/.test(source)) return '怪物列表';
  if (/(人物关系|关系网|关系规则|家族谱系|阵营关系)/.test(source)) return '人物关系';
  if (/(功法|能力|技能|神通|法术|异能|招式)/.test(source)) return '功法能力';
  if (/(货币|灵石|金币|资源|材料|能源|消耗|储备)/.test(source)) return '核心设定';
  if (/(权限|唯一|稀缺|特殊资源|资格|名额)/.test(source)) return '特殊资源';
  if (/(道具|装备|物品|法宝|武器|载具|机甲)/.test(source)) return '物品装备';
  if (/(禁区|危险|秘境|遗迹|灾区|战场|污染区)/.test(source)) return '世界地图';
  if (/(地点|地图|交通|地域|地理|重要地点|世界地图)/.test(source)) return '世界地图';
  if (/(主线|剧情|任务|目标|冲突|开局|转折|高潮|结局|章节|卷|事件)/.test(source)) return '剧情规划';
  if (/(人物伏笔|身份秘密|角色秘密|人物线索)/.test(source)) return '人物伏笔';
  if (/(伏笔|线索|暗示|秘密|谜团|隐藏|后续|埋下|回收|真相)/.test(source)) return '主线伏笔';
  if (/(禁写|不能写错|不能越界|硬约束|前后矛盾|规则红线)/.test(source)) return '核心设定';
  if (/(世界|规则|背景|科技|修炼|社会秩序|限制条件|天道|能量)/.test(source)) return '核心设定';
  if (/(核心|定位|承诺|主角处境|底层设定)/.test(source)) return '核心设定';
  return '其他设定';
}

function createImportItemSegments(sectionBody: string, fallbackTitle: string) {
  const itemPattern = /^\s*(?:\*([^*\n]+)\*|#([^#\n]+)#)\s*[：:]\s*/gm;
  const itemMatches = [...sectionBody.matchAll(itemPattern)];
  if (itemMatches.length === 0) return [{
    title: fallbackTitle,
    body: sectionBody.trim(),
  }];

  return itemMatches.map((itemMatch, index) => {
    const title = (itemMatch[1] ?? itemMatch[2] ?? '').trim();
    const bodyStart = (itemMatch.index ?? 0) + itemMatch[0].length;
    const bodyEnd = index + 1 < itemMatches.length
      ? itemMatches[index + 1].index ?? sectionBody.length
      : sectionBody.length;
    return {
      title,
      body: sectionBody.slice(bodyStart, bodyEnd).trim(),
    };
  }).filter((item) => item.title && item.body);
}

function collectTaggedSettingSegments(
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
      createImportItemSegments(sectionBody, DEFAULT_MALE_PROTAGONIST_ROLE_TITLE)
        .forEach((item) => result.roleSegments.push(item));
      continue;
    }

    const topDefaultType = SETTING_IMPORT_TOP_LABEL_DEFAULT_TYPES[type] ?? null;
    if (topDefaultType) {
      const beforeCount = result.settingSegments.length + result.roleSegments.length;
      collectTaggedSettingSegments(sectionBody, topDefaultType, result);
      if (result.settingSegments.length + result.roleSegments.length === beforeCount) {
        createImportItemSegments(sectionBody, topDefaultType)
          .forEach((item) => result.settingSegments.push({ ...item, type: topDefaultType }));
      }
      continue;
    }

    const normalizedType = normalizeSettingType(type);
    createImportItemSegments(sectionBody, normalizedType)
      .forEach((item) => result.settingSegments.push({ ...item, type: normalizedType }));
  }

  if (!matched && forcedDefaultType) {
    createImportItemSegments(normalized, forcedDefaultType)
      .forEach((item) => result.settingSegments.push({ ...item, type: forcedDefaultType }));
  }
}

function createTaggedSettingSegments(text: string): SmartImportTaggedSegments {
  const result: SmartImportTaggedSegments = {
    settingSegments: [],
    roleSegments: [],
  };
  collectTaggedSettingSegments(text, null, result);
  return result;
}

function createSmartSettingSegments(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const rawBlocks = normalized
    .split(/\n{2,}|(?=\n\s*(?:第[一二三四五六七八九十百千万\d]+[章节卷]|[一二三四五六七八九十]+[、.．]|[0-9]+[、.．]|[-*]\s+))/)
    .map((item) => item.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
  const blocks = rawBlocks.length > 0 ? rawBlocks : [normalized];
  return blocks.map((body, index) => {
    const firstLine = body.split('\n').find((line) => line.trim())?.trim() ?? '';
    const title = firstLine
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

function cleanMarkdownHeadingTitle(text: string) {
  return text
    .replace(/^#+\s*/, '')
    .replace(/\s*#+\s*$/, '')
    .trim();
}

function createMarkdownSettingSegments(text: string) {
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

function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

type RoleBaseStateEditorProps = {
  entry: WorkbenchLibraryEntry;
  role: RoleContent;
  roleEntries: WorkbenchLibraryEntry[];
  roleTypeOptions: string[];
  roleTextFontSize: number;
  currentChapterNumber?: number | null;
  roleLifeStatus: '存活' | '死亡' | undefined;
  onTitleChange: (title: string) => void;
  onRoleChange: (updates: Partial<RoleContent>) => void;
};

function RoleBaseStateEditor({
  entry,
  role,
  roleEntries,
  roleTypeOptions,
  roleTextFontSize,
  currentChapterNumber,
  roleLifeStatus,
  onTitleChange,
  onRoleChange,
}: RoleBaseStateEditorProps) {
  const baseSetting = getRoleBaseSetting(role);
  const baseSettingFields = parseRoleBaseSettingFields(baseSetting);
  const stateSettings = getRoleStateSettings(role);
  const stateUpdateChapters = getRoleStateUpdateChapters(role);
  const relationshipWords = countTextWords(role.relationship);
  const relationshipUpdateLabel = getRoleStateUpdateLabel(stateUpdateChapters.relationshipState);
  const stateWords = countTextWords(buildRoleStateSettingsText(stateSettings)) + relationshipWords;
  const roleIsMaleProtagonist = isMaleProtagonistRoleType(role.type);
  const showRoleIdentityControls = !roleIsMaleProtagonist;
  const currentChapterLabel = currentChapterNumber ? `当前编辑：第${currentChapterNumber}章` : '当前编辑：未选择章节';
  const roleSettingTabs = ['基础设定', '状态设定', '未确认'] as const;
  const [activeRoleSettingTab, setActiveRoleSettingTab] = useState<(typeof roleSettingTabs)[number]>('基础设定');
  const [autoConfirmRoleState, setAutoConfirmRoleState] = useState(false);
  const pendingRoleStateUpdates = [
    {
      title: '人物关系',
      beforeTitle: '人物关系未更新前',
      afterTitle: '人物关系更新后',
      beforeValue: role.relationship.trim() || '暂无已确认人物关系。',
      afterValue: '正文中出现新的关系变化，建议写入人物关系。',
    },
    {
      title: '资源状态',
      beforeTitle: '资源状态未更新前',
      afterTitle: '资源状态更新后',
      beforeValue: stateSettings.resourceState.trim() || '暂无已确认资源状态。',
      afterValue: '正文中出现资源得失，建议写入资源状态。',
    },
    {
      title: '当前目标',
      beforeTitle: '当前目标未更新前',
      afterTitle: '当前目标更新后',
      beforeValue: stateSettings.currentGoal.trim() || '暂无已确认当前目标。',
      afterValue: '角色目标可能发生变化，建议写入当前目标。',
    },
  ];
  const contentGridClassName = 'grid min-h-full grid-cols-2 auto-rows-fr gap-3';

  const updateRoleBaseSettingField = (key: RoleBaseSettingFieldKey, value: string) => {
    const nextFields = {
      ...baseSettingFields,
      [key]: value,
    };
    const nextBaseSetting = stringifyRoleBaseSettingFields(nextFields);
    onRoleChange({
      baseSetting: nextBaseSetting,
      background: nextBaseSetting,
      personality: '',
    });
  };

  const updateStateField = (key: RoleStateFieldKey, value: string) => {
    const nextStateSettings = {
      ...stateSettings,
      [key]: value,
    };
    const nextStateUpdateChapters = currentChapterNumber
      ? {
          ...stateUpdateChapters,
          [key]: currentChapterNumber,
        }
      : stateUpdateChapters;
    onRoleChange({
      stateSettings: nextStateSettings,
      stateUpdateChapters: nextStateUpdateChapters,
      status: buildRoleStateSettingsText(nextStateSettings),
    });
  };

  const updateRelationshipState = (value: string) => {
    const nextStateUpdateChapters = currentChapterNumber
      ? {
          ...stateUpdateChapters,
          relationshipState: currentChapterNumber,
        }
      : stateUpdateChapters;
    onRoleChange({
      relationship: value,
      stateUpdateChapters: nextStateUpdateChapters,
    });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3">
        <header className="shrink-0 border-b border-slate-200 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <label className="relative flex h-[48px] w-[148px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0">
                  <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-sm font-medium leading-5 text-slate-500">人物姓名</span>
                  <input
                    value={entry.title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="填写人物姓名"
                    className="h-6 w-full bg-transparent text-[17px] font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </label>
                {showRoleIdentityControls ? (
                  <CapsuleSelect
                    floatingLabel="身份定位"
                    className="xy-capsule-fill min-w-[168px]"
                    value={role.type}
                    onChange={(value) => onRoleChange({ type: value })}
                    options={roleTypeOptions.map((type) => ({
                      value: type,
                      label: type,
                      disabled:
                        role.type !== '男主角' &&
                        normalizeWorkbenchRoleType(type) === '男主角' &&
                        !canCreateWorkbenchRoleInType(
                          roleEntries
                            .filter((item) => item.id !== entry.id)
                            .map((item) => parseRoleContent(item.content).type),
                          type,
                        ),
                    }))}
                    buttonClassName="h-[42px] px-3 text-sm"
                  />
                ) : (
                  <div aria-hidden="true" className="h-[42px] min-w-[168px] shrink-0" />
                )}
              </div>
            </div>
            {showRoleIdentityControls ? (
              <div className="inline-flex h-9 w-[112px] shrink-0 rounded-[18px] bg-slate-100 p-1">
                {(['存活', '死亡'] as const).map((status) => {
                  const active = roleLifeStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onRoleChange({ lifeStatus: status })}
                      className={`flex-1 rounded-2xl text-xs font-black transition-colors ${
                        active ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div aria-hidden="true" className="h-9 w-[112px] shrink-0" />
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
            <SettingSegmentedTabs
              tabs={roleSettingTabs}
              activeTab={activeRoleSettingTab}
              onChange={setActiveRoleSettingTab}
            />
            {activeRoleSettingTab === '未确认' ? (
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5">
                <span className="text-xs font-black text-cyan-800">未确认更新</span>
                <button
                  type="button"
                  onClick={() => setAutoConfirmRoleState((current) => !current)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                    autoConfirmRoleState ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-cyan-200 bg-white text-cyan-700'
                  }`}
                >
                  自动确认 {autoConfirmRoleState ? '开' : '关'}
                </button>
                <button type="button" className="rounded-full bg-cyan-600 px-2.5 py-1 text-xs font-black text-white">
                  一键确认
                </button>
              </div>
            ) : (
              <p className="shrink-0 text-xs font-black text-slate-400">
                {currentChapterLabel} / 状态设定共 {stateWords} 字
              </p>
            )}
          </div>
        </header>

        <section className="editor-scrollbar min-h-0 flex-1 overflow-y-auto px-1 pb-1 pr-2 pt-3">
          <div className={contentGridClassName}>
            {activeRoleSettingTab === '基础设定' && ROLE_BASE_SETTING_FIELD_DEFINITIONS.map((field) => {
              const value = baseSettingFields[field.key];
              return (
                <article
                  key={field.key}
                  className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5"
                >
                  <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                    {field.title}
                  </div>
                  <textarea
                    value={value}
                    onChange={(event) => updateRoleBaseSettingField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                    style={{ fontSize: roleTextFontSize }}
                  />
                </article>
              );
            })}

            {activeRoleSettingTab === '状态设定' && (
              <>
                <article className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
                  <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                    人物关系
                  </div>
                  <div className={`xy-border-embedded-transparent-backplate absolute right-5 top-0 z-10 -translate-y-1/2 pl-2 text-xs font-black leading-5 ${
                    stateUpdateChapters.relationshipState ? 'text-[#08AACE]' : 'text-red-500'
                  }`}>
                    {relationshipUpdateLabel}
                  </div>
                  <textarea
                    value={role.relationship}
                    onChange={(event) => updateRelationshipState(event.target.value)}
                    placeholder="记录与主角、阵营、亲友、敌人、师徒、利益对象的关系。关系绑定人物，不绑定世界。"
                    className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                    style={{ fontSize: roleTextFontSize }}
                  />
                </article>
                {ROLE_STATE_FIELD_DEFINITIONS.map((field) => {
                  const fieldValue = stateSettings[field.key];
                  const updateLabel = getRoleStateUpdateLabel(stateUpdateChapters[field.key]);
                  return (
                    <article key={field.key} className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
                      <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                        {field.title}
                      </div>
                      <div className={`xy-border-embedded-transparent-backplate absolute right-5 top-0 z-10 -translate-y-1/2 pl-2 text-xs font-black leading-5 ${
                        stateUpdateChapters[field.key] ? 'text-[#08AACE]' : 'text-red-500'
                      }`}>
                        {updateLabel}
                      </div>
                      <textarea
                        value={fieldValue}
                        onChange={(event) => updateStateField(field.key, event.target.value)}
                        placeholder={`记录${field.title}`}
                        className="editor-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none"
                        style={{ fontSize: roleTextFontSize }}
                      />
                    </article>
                  );
                })}
              </>
            )}

            {activeRoleSettingTab === '未确认' && pendingRoleStateUpdates.map((item) => (
              <article key={item.title} className="relative flex min-h-[150px] flex-col rounded-[22px] border-2 border-slate-950 bg-white p-4 pt-5">
                <div className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-base font-black leading-6 text-slate-950">
                  {item.title}
                </div>
                <button type="button" className="mb-2 rounded-full border border-cyan-200 px-2 py-0.5 text-xs font-black text-cyan-700">
                  手动确认
                </button>
                <div className="grid gap-3 md:grid-cols-2">
                  <section className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <h4 className="text-xs font-black text-slate-500">{item.beforeTitle}</h4>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{item.beforeValue}</p>
                  </section>
                  <section className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2">
                    <h4 className="text-xs font-black text-cyan-700">{item.afterTitle}</h4>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-700">{item.afterValue}</p>
                  </section>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function compactTextForAi(content: string, maxLength: number) {
  const text = content.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}……`;
}

function truncateTextForAi(content: string, maxLength: number) {
  const text = content.trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}……`;
}

function getRequestLogMeta(content?: string, unit = '字') {
  return `${countTextWords(content ?? '')} ${unit}`;
}

function escapeXmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatBrainstormReferenceForAi(title: string, text: string) {
  const content = text.trim();
  if (!content) return '';
  const safeTitle = title.trim() || '脑洞';
  return [
    '【参考资料开始：用户关联脑洞】',
    '注意：以下内容只是参考资料，不是输出格式，不要照抄标签，不要为它单独生成设定，不要输出本段任何标签。',
    '资料类型：脑洞',
    `资料标题：${safeTitle}`,
    '',
    content,
    '',
    '【参考资料结束：用户关联脑洞】',
  ].join('\n');
}

function formatSettingLinkedContextForAi(context: { source: 'current' | 'other' | 'brainstorm' | null; title: string; text: string }) {
  const text = context.text.trim();
  if (!context.source || !text) return '';
  if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, text);
  if (context.source === 'other') return wrapAiRequestTag('关联其他设定', text, { 标题: context.title.trim() || '其他设定' });
  const tagName = '待处理设定';
  const title = context.title.trim() || '当前设定';
  return wrapAiRequestTag(tagName, text, { 标题: title });
}

function formatSettingUserRequirementForAi(userText: string) {
  const text = userText.trim();
  return wrapAiRequestTag('修改要求', text);
}

function buildLibraryLogGroups(log: LibraryAiRequestLog, options?: {
  includeContext?: boolean;
  includeReaderContext?: boolean;
  contextFallback?: string;
  userTitle?: string;
  readerTitle?: string;
  readerEmptyText?: string;
  omitEmptyUser?: boolean;
  expandReaderContextContent?: boolean;
  expandAllContent?: boolean;
}): AiRequestLogGroup[] {
  const expandedContentClassName = 'overflow-visible';
  const groups: AiRequestLogGroup[] = [
    {
      id: 'prompt',
      title: '提示词',
      meta: getRequestLogMeta(log.systemPrompt),
      content: log.systemPrompt,
      emptyText: '空内容',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    },
  ];
  if (options?.includeReaderContext) {
    groups.push({
      id: 'reader-context',
      title: options.readerTitle || '关联设定',
      meta: log.readerContextTitle || getRequestLogMeta(log.readerContextText),
      content: log.readerContextText,
      emptyText: options.readerEmptyText || '未关联设定或前文章纲',
      tone: 'cyan',
      contentClassName: options.expandAllContent
        ? expandedContentClassName
        : options.expandReaderContextContent
        ? 'min-h-[360px] overflow-visible'
        : undefined,
    });
  }
  if (options?.includeContext !== false) {
    groups.push({
      id: 'context',
      title: '关联内容',
      meta: log.contextTitle || (log.hasLinkedBrainstorm ? log.linkedBrainstormTitle : getRequestLogMeta(log.contextText)),
      content: log.contextText || (log.hasLinkedBrainstorm ? log.userContent : ''),
      emptyText: options?.contextFallback || '未关联内容',
      tone: 'cyan',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    });
  }
  if (!(options?.omitEmptyUser && !log.userContent.trim())) {
    groups.push({
      id: 'user',
      title: options?.userTitle || '用户要求',
      meta: getRequestLogMeta(log.userContent),
      content: log.userContent,
      emptyText: '空内容',
      tone: 'amber',
      contentClassName: options?.expandAllContent ? expandedContentClassName : undefined,
    });
  }
  return groups;
}

function buildRequestLogPlainPreview(groups: AiRequestLogGroup[]) {
  return groups
    .map((group) => group.content?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n');
}

function getBrainstormQuestionRows(value: string) {
  const rows = value
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / 26)), 0);
  return Math.max(1, rows);
}

function parseAiChatTurns(content: string) {
  const turns: Array<{ role: 'user' | 'ai'; content: string }> = [];
  const markerPattern = /\[\[(USER|AI)\]\]\n/g;
  const matches = [...content.matchAll(markerPattern)];
  if (matches.length === 0) {
    if (content.trim()) turns.push({ role: 'ai', content: content.trim() });
    return turns;
  }
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? content.length : content.length;
    const text = content.slice(start, end).trim();
    if (!text) return;
    turns.push({
      role: match[1] === 'USER' ? 'user' : 'ai',
      content: text,
    });
  });
  return turns;
}

function formatAiThinkingResponse(content: string, reasoning: string, seconds: number, done: boolean) {
  const reasoningText = reasoning.trim();
  const body = content.trimStart();
  if (!reasoningText) return body || (done ? '' : '正在思考...');
  return [
    `[[THINKING seconds=${Math.max(0, seconds)} status=${done ? 'done' : 'thinking'}]]`,
    reasoningText,
    '[[/THINKING]]',
    body ? `\n${body}` : '',
  ].join('\n').trimEnd();
}

function stripAiThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

function stripBrainstormRequestHeader(content: string) {
  const trimmed = content.trim();
  if (!trimmed.startsWith(BRAINSTORM_REQUEST_HEADER)) return content;
  return trimmed.slice(BRAINSTORM_REQUEST_HEADER.length).replace(/^\s+/, '');
}

function normalizeBrainstormEchoText(content: string) {
  return stripBrainstormRequestHeader(stripAiThinkingBlock(content))
    .replace(/\s+/g, '')
    .trim();
}

function getBrainstormOtherRequirementsBlock(requestText: string) {
  const headerIndex = requestText.indexOf(BRAINSTORM_OTHER_REQUIREMENTS_HEADER);
  return headerIndex >= 0 ? requestText.slice(headerIndex) : requestText;
}

function isBrainstormEchoedRequest(content: string, requestText: string) {
  const output = normalizeBrainstormEchoText(content);
  const request = normalizeBrainstormEchoText(requestText);
  const otherRequirements = normalizeBrainstormEchoText(getBrainstormOtherRequirementsBlock(requestText));
  return Boolean(output && request && (output === request || output === otherRequirements));
}

function getBrainstormDisplayContent(content: string, requestText: string) {
  if (isBrainstormEchoedRequest(content, requestText)) {
    return '【错误】模型只复述了输入内容，没有生成脑洞。请重试，或换一个提示词/模型。';
  }
  const displayContent = stripBrainstormRequestHeader(content).trim();
  return displayContent || '【错误】模型没有返回内容。请重试，或检查模型、提示词和网络。';
}

function buildSequentialBrainstormRequestText(baseRequestText: string, index: number, total: number, completedItems: string[]) {
  return [
    baseRequestText,
    '',
    '【逐个生成模式】',
    `现在只生成第 ${index} / ${total} 个脑洞。`,
    '不要输出其他编号的脑洞，不要复述提示词，直接输出这个脑洞的完整内容。',
    completedItems.length > 0
      ? `【已生成脑洞，避免重复】\n${completedItems.map((item, itemIndex) => `${itemIndex + 1}. ${item}`).join('\n\n')}`
      : '',
  ].filter(Boolean).join('\n');
}

function formatSequentialBrainstormOutput(completedItems: string[], activeIndex?: number, activeContent = '') {
  const lines = completedItems.map((item, index) => `${index + 1}. ${item.trim()}`);
  if (activeIndex && activeContent.trim()) lines.push(`${activeIndex}. ${activeContent.trim()}`);
  return lines.join('\n\n').trim();
}

function renderAiChatContent(content: string, options: { hideReasoningBody?: boolean } = {}) {
  const thinkingMatch = content.match(/^\[\[THINKING seconds=(\d+) status=(thinking|done)\]\]\n([\s\S]*?)\n\[\[\/THINKING\]\]\n?\n?([\s\S]*)$/);
  if (thinkingMatch) {
    const seconds = thinkingMatch[1] ?? '0';
    const done = thinkingMatch[2] === 'done';
    const reasoning = thinkingMatch[3]?.trim() ?? '';
    const answer = thinkingMatch[4]?.trimStart() ?? '';
    const thinkingLabel = done ? `已思考（用时 ${seconds} 秒）` : `正在思考（${seconds} 秒）`;
    return (
      <div className="space-y-3">
        {options.hideReasoningBody ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-sm font-medium text-gray-600">
            {done ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronRight className="h-4 w-4 text-brand" />}
            <span>{thinkingLabel}</span>
          </div>
        ) : (
          <details open={!done} className="group rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-gray-600">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-gray-600">
              {done ? <ChevronDown className="h-4 w-4 text-brand" /> : <ChevronRight className="h-4 w-4 text-brand" />}
              <span>{thinkingLabel}</span>
            </summary>
            {reasoning && (
              <div className="mt-2 border-l-2 border-gray-200 pl-3 text-sm leading-7 text-gray-500">
                {reasoning}
              </div>
            )}
          </details>
        )}
        {answer && <div>{answer}</div>}
      </div>
    );
  }
  const loadingMatch = content.match(/^正在生成(\.{1,3})$/);
  if (!loadingMatch) return content;
  return (
    <span className="inline-flex min-w-[88px] items-center">
      <span>正在生成</span>
      <span className="inline-block w-[24px]">{loadingMatch[1]}</span>
    </span>
  );
}

function getLatestUsefulAiText(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns]
    .reverse()
    .find((turn) => turn.role === 'ai' && turn.content.trim() && !/^正在生成\.{1,3}$/.test(turn.content.trim()));
  if (latestAi) return stripAiThinkingBlock(latestAi.content);
  if (turns.length > 0) return '';

  const legacyAiMatches = [...content.matchAll(/(?:^|\n)AI[：:]\s*([\s\S]*?)(?=\n\s*用户[：:]|\n\s*\[\[USER\]\]|$)/g)]
    .map((match) => match[1]?.trim() ?? '')
    .filter((value) => value && !/^正在生成\.{1,3}$/.test(value));
  if (legacyAiMatches.length > 0) return legacyAiMatches[legacyAiMatches.length - 1];

  return content
    .replace(/\[\[(?:USER|AI)\]\]\n?/g, '')
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .replace(/^\s*(?:用户|AI)[：:].*$/gm, '')
    .replace(/^正在生成\.{1,3}\s*$/gm, '')
    .trim();
}

function getLatestAiTurnContent(content: string) {
  const turns = parseAiChatTurns(content);
  const latestAi = [...turns].reverse().find((turn) => turn.role === 'ai');
  return latestAi?.content ?? content;
}

function getLibraryBackgroundTaskOutput(task: BackgroundAiTask, stoppedText = '【已中止】本次生成已停止。') {
  if (task.status === 'aborted' && !stripAiThinkingBlock(getLatestAiTurnContent(task.output)).trim()) return stoppedText;
  if (task.status === 'failed' && task.error && !stripAiThinkingBlock(getLatestAiTurnContent(task.output)).trim()) return `【错误】${task.error}`;
  return task.output;
}

function getBrainstormBackgroundTaskResult(task: BackgroundAiTask) {
  return stripBrainstormRequestHeader(getLatestAiTurnContent(getLibraryBackgroundTaskOutput(task))).trim();
}

function getBrainstormEntryBody(entry: WorkbenchLibraryEntry | null | undefined) {
  if (!entry) return '';
  const parsed = parseSettingContent(entry.content);
  return getLatestUsefulAiText(parsed.body || entry.content);
}

function getSettingEntryBody(entry: WorkbenchLibraryEntry | null | undefined) {
  if (!entry) return '';
  const parsed = parseSettingContent(entry.content);
  const rawContent = entry.content.trim();
  return getLatestUsefulAiText(parsed.body || (rawContent.startsWith('{') ? '' : entry.content));
}

function LibraryManagementModal({
  modal,
  onClose,
}: {
  modal: Exclude<LibraryManagementModalState, null>;
  onClose: () => void;
}) {
  const draggable = useDraggableModal(`workbench_library_${modal.type}_${modal.type === 'prompts' ? modal.category : 'models'}`);
  useTopModalEscape(true, onClose);
  const title = modal.type === 'models' ? '模型管理' : `${modal.category}提示词管理`;

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35 px-8 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1500px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        style={draggable.style}
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-11 shrink-0 cursor-move items-center justify-between border-b border-slate-200 bg-white px-4"
        >
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="关闭"
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          {modal.type === 'models' ? <ModelManagePage /> : <PromptsPage initialCategory={modal.category} />}
        </div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>,
    document.body,
  );
}

function LibraryAiLogShell({
  id,
  subtitle,
  onClose,
  children,
}: {
  id: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const draggable = useDraggableModal(id);
  useTopModalEscape(true, onClose);

  return createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[285] flex items-center justify-center bg-black/35 px-6 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        data-draggable-managed="true"
        style={draggable.style}
        className="modal-sharp relative flex h-[min(820px,88vh)] w-[min(1120px,94vw)] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <header
          {...draggable.dragHandleProps}
          className="flex h-14 shrink-0 cursor-move items-center justify-between border-b border-slate-100 px-5"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">输出日志</h2>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          </div>
          <button
            data-no-modal-drag="true"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            关闭
          </button>
        </header>
        {children}
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('top')} className="absolute left-4 right-4 top-0 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('bottom')} className="absolute bottom-0 left-4 right-4 z-20 h-2 cursor-ns-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('left')} className="absolute bottom-4 left-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.getResizeHandleProps('right')} className="absolute bottom-4 right-0 top-4 z-20 w-2 cursor-ew-resize" />
        <div data-no-modal-drag="true" {...draggable.resizeHandleProps} className="absolute bottom-0 right-0 z-20 h-5 w-5 cursor-nwse-resize">
          <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-gray-300" />
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function WorkbenchLibraryPanel({
  storageKey,
  tabs,
  emptyText,
  volumes = [],
  getChapterContent,
  outlineStorageKey,
  scale = 1,
  defaultActiveTab,
  fieldSizeOpenSignal = 0,
  showInlineFieldSizeButton = true,
  openLogSignal = 0,
  openPlotPointSignal = 0,
  plotPointStandalone = false,
  onOpenDetailOutlineFromPlotChain,
  toolbarPortalId,
}: WorkbenchLibraryPanelProps) {
  const tabsSignature = tabs.map(normalizeTabName).join('\u001f');
  const normalizedTabs = useMemo(() => (tabsSignature ? tabsSignature.split('\u001f') : []), [tabsSignature]);
  const isSettingLibraryPanel = useMemo(
    () => normalizedTabs.every((tab) => SETTING_LIBRARY_TABS.has(tab)),
    [normalizedTabs],
  );
  const [entries, setEntries] = useState<WorkbenchLibraryEntry[]>(() => readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
  const [brainstormRecycleEntries, setBrainstormRecycleEntries] = useState<WorkbenchLibraryEntry[]>(() => (
    readBrainstormRecycleEntries(storageKey)
  ));
  const [outlineEntries, setOutlineEntries] = useState<WorkbenchLibraryEntry[]>(() => (
    outlineStorageKey ? readNormalizedEntries(outlineStorageKey) : []
  ));
  const [activeTab, setActiveTab] = useState(() => readActiveTab(storageKey, normalizedTabs, defaultActiveTab));
  const [outlineSettingScope, setOutlineSettingScope] = useState<'work' | 'character'>('work');
  const [outlineSettingDomain, setOutlineSettingDomain] = useState('work');
  const settingLibraryMode = 'advanced';
  const [tabConfigs, setTabConfigs] = useState<LibraryTabConfigs>(() => readTabConfigs(storageKey));
  const activeTabConfig = tabConfigs[activeTab] ?? {};
  const [roleSearch, setRoleSearch] = useState('');
  const [customRoleTypes, setCustomRoleTypes] = useState<string[]>(() => readCustomRoleTypes(storageKey));
  const [hiddenRoleTypes, setHiddenRoleTypes] = useState<string[]>(() => readHiddenRoleTypes(storageKey));
  const [customSettingTypes, setCustomSettingTypes] = useState<string[]>(() => readCustomSettingTypes(storageKey));
  const [customSettingTypeDomains, setCustomSettingTypeDomains] = useState<Record<string, string>>(() => readCustomSettingTypeDomains(storageKey));
  const [hiddenSettingTypes, setHiddenSettingTypes] = useState<string[]>(() => readHiddenSettingTypes(storageKey));
  const [outlineStart, setOutlineStart] = useState('1');
  const [outlineEnd, setOutlineEnd] = useState('50');
  const [selectedOutlineChapterId, setSelectedOutlineChapterId] = useState<number | null>(() => (
    Number.isFinite(activeTabConfig.selectedOutlineChapterId) ? activeTabConfig.selectedOutlineChapterId ?? null : null
  ));
  const [selectedOutlineVolumeId, setSelectedOutlineVolumeId] = useState<number | null>(null);
  const [outlineSelectionType, setOutlineSelectionType] = useState<'chapter' | 'volume'>('chapter');
  const [outlinePreviewDraft, setOutlinePreviewDraftState] = useState(() => (
    plotPointStandalone ? activeTabConfig.plotPointPreviewDraft ?? '' : ''
  ));
  const [lastDetailOutlineReplacement, setLastDetailOutlineReplacement] = useState<{
    chapterSerialNumber: number;
    content: string;
    draft: string;
  } | null>(null);
  const [, forceOutlineSelectionRefresh] = useState(0);
  const [expandedOutlineVolumeIds, setExpandedOutlineVolumeIds] = useState<Set<number>>(() => (
    readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')
  ));
  const [showDetailOutlinePublished, setShowDetailOutlinePublished] = useState(false);
  const [manualDetailOutlinePublishedChapterIds, setManualDetailOutlinePublishedChapterIds] = useState<Set<number>>(() => (
    readManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey)
  ));
  const [detailOutlineChapterMenu, setDetailOutlineChapterMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    chapter: Chapter | null;
  }>({ visible: false, x: 0, y: 0, chapter: null });
  const [isFieldSizeSettingsOpen, setIsFieldSizeSettingsOpen] = useState(false);
  const lastFieldSizeOpenSignalRef = useRef(fieldSizeOpenSignal);
  const lastOpenLogSignalRef = useRef(openLogSignal);
  const [fieldSizeSpecs, setFieldSizeSpecs] = useState<Record<WorkbenchFieldSizeKey, WorkbenchFieldSizeSpec>>(() => readWorkbenchFieldSizeSpecs());
  const fieldSizeSettingsDraggable = useDraggableModal('workbench_field_size_settings');
  const visibleFieldSizeKeys = WORKBENCH_FIELD_SIZE_KEYS_BY_TAB[activeTab] ?? WORKBENCH_FIELD_SIZE_SETTING_KEYS;
  const fieldSizeTabLabel = getWorkbenchFieldSizeTabLabel(activeTab);
  const [settingLibraryLeftWidth, setSettingLibraryLeftWidth] = useState(() => readSettingLibraryLeftWidth(storageKey, activeTab, scale));
  const [settingLibraryRightWidth, setSettingLibraryRightWidth] = useState(() => readSettingLibraryRightWidth(storageKey, activeTab));
  const [brainstormPreviewWidth, setBrainstormPreviewWidth] = useState(() => readBrainstormPreviewWidth(storageKey, activeTab));
  const [plotPointLayoutTreeWidth, setPlotPointLayoutTreeWidth] = useState(() => readPlotPointLayoutTreeWidth(storageKey));
  const [plotPointLayoutLeftWidth, setPlotPointLayoutLeftWidth] = useState(() => readPlotPointLayoutLeftWidth(storageKey));
  const [plotPointLayoutRightWidth, setPlotPointLayoutRightWidth] = useState(() => readPlotPointLayoutRightWidth(storageKey));
  const [expandedRoleTypes, setExpandedRoleTypes] = useState<Set<string>>(() => (
    readExpandedStringSet(storageKey, ROLE_TAB, 'role_types')
  ));
  const [expandedSettingTypes, setExpandedSettingTypes] = useState<Set<string>>(() => (
    readExpandedStringSet(storageKey, activeTab, 'setting_types')
  ));
  const [categoryMenu, setCategoryMenu] = useState<LibraryCategoryMenu>(null);
  const [entryMenu, setEntryMenu] = useState<LibraryEntryMenu>(null);
  const [entryMoveMenuOpen, setEntryMoveMenuOpen] = useState(false);
  const [pendingEntryDelete, setPendingEntryDelete] = useState<PendingEntryDelete>(null);
  const [pendingEntryRename, setPendingEntryRename] = useState<PendingEntryRename>(null);
  const [entryRenameDraft, setEntryRenameDraft] = useState('');
  const [pendingCategoryRename, setPendingCategoryRename] = useState<PendingCategoryRename>(null);
  const [categoryRenameDraft, setCategoryRenameDraft] = useState('');
  const [isClearSettingsConfirmOpen, setIsClearSettingsConfirmOpen] = useState(false);
  const [clearSettingsConfirmTarget, setClearSettingsConfirmTarget] = useState<ClearSettingsTarget>('settingEntries');
  const [clearSettingsConfirmStep, setClearSettingsConfirmStep] = useState<1 | 2>(1);
  const [activeStructuredSettingTab, setActiveStructuredSettingTab] = useState<StructuredSettingTab>('固定设定');
  const [promptDisableMenu, setPromptDisableMenu] = useState<PromptDisableMenu>(null);
  const [managementModal, setManagementModal] = useState<LibraryManagementModalState>(null);
  const [draggingLibraryEntry, setDraggingLibraryEntry] = useState<LibraryEntryDragState>(null);
  const [libraryDropTarget, setLibraryDropTarget] = useState<{ tab: string; type: string } | null>(null);
  const [libraryEntryDropPreview, setLibraryEntryDropPreview] = useState<LibraryEntryDropPreviewState>(null);
  const libraryEntryDropPreviewRef = useRef<LibraryEntryDropPreviewState>(null);
  const libraryDropHandledRef = useRef(false);
  const libraryEntryPointerDragRef = useRef<LibraryEntryPointerDragState>(null);
  const libraryPointerSuppressClickRef = useRef(false);
  const [roleHistoryEntryId, setRoleHistoryEntryId] = useState<string | null>(null);
  const [isBrainstormReaderOpen, setIsBrainstormReaderOpen] = useState(false);
  const [selectedBrainstormReaderId, setSelectedBrainstormReaderId] = useState<string | null>(null);
  const [isOtherSettingReaderOpen, setIsOtherSettingReaderOpen] = useState(false);
  const [otherSettingReaderTabId, setOtherSettingReaderTabId] = useState<OtherSettingLinkTabId>('work');
  const [otherSettingReaderPreviewId, setOtherSettingReaderPreviewId] = useState('');
  const [draftOtherSettingReaderIds, setDraftOtherSettingReaderIds] = useState<Set<string>>(() => new Set());
  const [otherSettingReaderQuery, setOtherSettingReaderQuery] = useState('');
  const [isBrainstormRecycleOpen, setIsBrainstormRecycleOpen] = useState(false);
  const [isClearBrainstormRecycleConfirmOpen, setIsClearBrainstormRecycleConfirmOpen] = useState(false);
  const [isBrainstormPromptManagerOpen, setIsBrainstormPromptManagerOpen] = useState(false);
  const [editingBrainstormPrompt, setEditingBrainstormPrompt] = useState<PromptItem | null>(null);
  const [isCreatingBrainstormPrompt, setIsCreatingBrainstormPrompt] = useState(false);
  const [brainstormPromptDraft, setBrainstormPromptDraft] = useState({ name: '', description: '', content: '' });
  const [brainstormQuestionDraft, setBrainstormQuestionDraft] = useState<BrainstormQuestionDraft>(EMPTY_BRAINSTORM_QUESTION_DRAFT);
  const [brainstormGenerateDraft, setBrainstormGenerateDraft] = useState<BrainstormQuestionDraft | null>(null);
  const [isBrainstormConfirmScrolling, setIsBrainstormConfirmScrolling] = useState(false);
  const [activeDetailOutlineScrollId, setActiveDetailOutlineScrollId] = useState<number | null>(null);
  const [isDetailOutlineReaderOpen, setIsDetailOutlineReaderOpen] = useState(false);
  const [detailOutlineReaderTab, setDetailOutlineReaderTab] = useState<DetailOutlineReaderTab>('settings');
  const [detailOutlineReaderPreviewId, setDetailOutlineReaderPreviewId] = useState('');
  const [collapsedDetailOutlineReaderGroups, setCollapsedDetailOutlineReaderGroups] = useState<Record<string, boolean>>({});
  const [draftDetailOutlineReaderSettingIds, setDraftDetailOutlineReaderSettingIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderRoleIds, setDraftDetailOutlineReaderRoleIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderOutlineIds, setDraftDetailOutlineReaderOutlineIds] = useState<Set<string>>(() => new Set());
  const [draftDetailOutlineReaderPlotChainIds, setDraftDetailOutlineReaderPlotChainIds] = useState<Set<string>>(() => new Set());
  const [isPlotPointModalOpen, setIsPlotPointModalOpen] = useState(false);
  const [plotPointInput, setPlotPointInput] = useState('');
  const [plotPointOutput, setPlotPointOutput] = useState('');
  const [plotPointGeneratedCandidateText, setPlotPointGeneratedCandidateTextState] = useState(() => (
    activeTabConfig.plotPointGeneratedCandidateText ?? ''
  ));
  const [isPlotPointPreviewCleared, setIsPlotPointPreviewClearedState] = useState(() => (
    activeTabConfig.plotPointPreviewCleared ?? !activeTabConfig.plotPointGeneratedCandidateText
  ));
  const [plotPointSourceMode, setPlotPointSourceModeState] = useState<PlotPointSourceMode>(() => (
    normalizePlotPointSourceMode(activeTabConfig.plotPointSourceMode)
  ));
  const [plotPointGenerateCount, setPlotPointGenerateCountState] = useState<5 | 10 | 20>(() => (
    normalizePlotPointGenerateCount(activeTabConfig.plotPointGenerateCount)
  ));
  const [plotPointLength, setPlotPointLengthState] = useState<PlotPointLengthMode>(() => (
    normalizePlotPointLengthMode(activeTabConfig.plotPointLength)
  ));
  const [plotPointActiveChainSlot, setPlotPointActiveChainSlot] = useState<PlotPointChainSlot>(() => (
    normalizePlotPointChainSlot(activeTabConfig.plotPointActiveChainSlot)
  ));
  const [plotPointChainSelections, setPlotPointChainSelections] = useState<Record<PlotPointChainSlot, string[]>>(() => (
    normalizePlotPointChainSelections(activeTabConfig.plotPointChainSelections)
  ));
  const [plotPointChainWrittenSelections, setPlotPointChainWrittenSelections] = useState<Record<PlotPointChainSlot, string[]>>(() => (
    normalizePlotPointChainSelections(activeTabConfig.plotPointChainWrittenSelections)
  ));
  const [plotPointChainNames, setPlotPointChainNames] = useState<Record<PlotPointChainSlot, string>>(() => (
    normalizePlotPointChainNames(activeTabConfig.plotPointChainNames)
  ));
  const [expandedPlotPointChainTreeSlots, setExpandedPlotPointChainTreeSlots] = useState<Record<PlotPointChainSlot, boolean>>({
    1: true,
    2: true,
    3: true,
  });
  const [plotPointChainRefreshStates, setPlotPointChainRefreshStates] = useState<Record<PlotPointChainSlot, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [plotPointSelectedCandidateMap, setPlotPointSelectedCandidateMap] = useState<Record<string, WorkbenchPlotPointCandidate>>(() => (
    Object.fromEntries((activeTabConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item]))
  ));
  const [expandedPlotPointPreviewIds, setExpandedPlotPointPreviewIds] = useState<string[]>([]);
  const [plotPointChainMenuSlot, setPlotPointChainMenuSlot] = useState<PlotPointChainSlot | null>(null);
  const [activeBrainstormOutputScrollIndex, setActiveBrainstormOutputScrollIndex] = useState<number | null>(null);
  const [activeSettingSidebarScrollKey, setActiveSettingSidebarScrollKey] = useState<string | null>(null);
  const [plotPointChainRenameDraft, setPlotPointChainRenameDraft] = useState('');
  const [plotPointChainFilterMode, setPlotPointChainFilterMode] = useState<'all' | 'unwritten' | 'written'>('all');
  const [activePlotPointChainItemId, setActivePlotPointChainItemId] = useState<string | null>(null);
  const [plotPointOpeningElements, setPlotPointOpeningElementsState] = useState<string[]>(() => (
    normalizePlotPointOpeningElements(activeTabConfig.plotPointOpeningElements)
  ));
  const [settingCreateDialog, setSettingCreateDialog] = useState<'category' | 'setting' | null>(null);
  const [settingCreateContextKind, setSettingCreateContextKind] = useState<'role' | 'setting' | null>(null);
  const [settingCreateDraft, setSettingCreateDraft] = useState('');
  const [settingCreateTypeDraft, setSettingCreateTypeDraft] = useState('');
  const [isLibraryAiLoading, setIsLibraryAiLoading] = useState(false);
  const [isLibraryAiLogOpen, setIsLibraryAiLogOpen] = useState(false);
  const [libraryAiLogScope, setLibraryAiLogScope] = useState<'library' | 'outline'>('library');
  const [libraryAiLogViewTab, setLibraryAiLogViewTab] = useState<LibraryAiLogViewTab>('输出日志');
  const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);
  const [settingImportFormatTabId, setSettingImportFormatTabId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_TAB_ID);
  const [settingImportFormatEntryId, setSettingImportFormatEntryId] = useState(DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID);
  const [settingImportFormatPreviewScope, setSettingImportFormatPreviewScope] = useState<SettingImportFormatPreviewScope>('设定条目');
  const [lastLibraryAiRequestLog, setLastLibraryAiRequestLog] = useState<LibraryAiRequestLog | null>(null);
  const suppressNextOutlinePreviewSyncRef = useRef(false);
  const [activeLibraryFontTarget, setActiveLibraryFontTarget] = useState<LibraryFontTarget>('brainstormOutput');
  const [lastOutlineAiRequestLog, setLastOutlineAiRequestLog] = useState<LibraryAiRequestLog | null>(null);
  const [loadingDotCount, setLoadingDotCount] = useState(1);
  const [tabPortalTarget, setTabPortalTarget] = useState<HTMLElement | null>(null);
  const [headerToolPortalTarget, setHeaderToolPortalTarget] = useState<HTMLElement | null>(null);
  const outlinePreviewRefs = useRef<Record<number, HTMLElement | null>>({});
  const libraryAiOutputRef = useRef<HTMLDivElement | null>(null);
  const libraryAiAutoScrollRef = useRef(true);
  const libraryAiProgrammaticScrollRef = useRef(false);
  const libraryAiInputRef = useRef<HTMLTextAreaElement | null>(null);
  const libraryAiRequestSeqRef = useRef(0);
  const plotPointGenerationModeRef = useRef<'restart' | 'continue'>('restart');
  const brainstormConfirmScrollTimerRef = useRef<number | null>(null);
  const brainstormOutputScrollTimerRef = useRef<number | null>(null);
  const detailOutlineScrollTimerRef = useRef<number | null>(null);
  const settingSidebarScrollTimerRef = useRef<number | null>(null);
  const roleExpandedReloadRef = useRef(false);
  const settingExpandedReloadRef = useRef(false);
  const outlineExpandedReloadRef = useRef(false);
  const { models: modelSnapshot } = useModels();
  const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);
  const { prompts, addPrompt, updatePrompt, deletePrompt, togglePin } = usePrompts();
  const brainstormPrompts = useMemo(() => prompts.filter((prompt) => prompt.category === BRAINSTORM_TAB), [prompts]);
  const rolePromptOptions = useMemo(
    () => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === PROMPT_SETTING_CATEGORY),
    [prompts],
  );
  const outlinePrompts = useMemo(() => prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === '梗概'), [prompts]);
  const scaleStyle = scale === 1 ? undefined : ({ zoom: scale } as CSSProperties);
  const selectedId = activeTabConfig.selectedId ?? null;
  const roleTypeDraft = activeTabConfig.roleTypeDraft ?? activeTabConfig.typeDraft ?? '';
  const roleNameDraft = activeTabConfig.roleNameDraft ?? activeTabConfig.titleDraft ?? '';
  const settingTypeDraft = activeTabConfig.typeDraft ?? '';
  const settingTitleDraft = activeTabConfig.titleDraft ?? '';
  const brainstormAiSessions = normalizeBrainstormAiSessions(activeTabConfig.aiSessions, activeTabConfig);
  const activeBrainstormAiSessionId = getActiveBrainstormAiSessionId(activeTabConfig.activeAiSessionId, brainstormAiSessions);
  const activeBrainstormAiSession = brainstormAiSessions.find((session) => session.id === activeBrainstormAiSessionId) ?? brainstormAiSessions[0];
  const aiInput = activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.input ?? '' : activeTabConfig.aiInput ?? '';
  const canSendLibraryAiMessage = activeTab === SETTING_TAB || aiInput.trim().length > 0;
  const aiOutput = activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.output ?? '' : activeTabConfig.aiOutput ?? '';
  const aiResult = activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.result ?? '' : activeTabConfig.aiResult ?? '';
  const hasLibraryAiContent = hasLibraryAiDialogContent(aiInput, aiOutput, aiResult);
  const animatedAiOutput = isLibraryAiLoading
    ? aiOutput.replace(/正在生成\.\.\./g, `正在生成${'.'.repeat(loadingDotCount)}`)
    : aiOutput;
  const aiChatTurns = parseAiChatTurns(animatedAiOutput);
  const previousActiveTabRef = useRef(activeTab);
  useEffect(() => {
    resizeFloatingAiTextarea(libraryAiInputRef.current);
  }, [activeTab, aiInput]);

  const brainstormPreviewFontSize = Math.min(
    BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
    Math.max(BRAINSTORM_PREVIEW_MIN_FONT_SIZE, activeTabConfig.brainstormPreviewFontSize ?? 14),
  );
  const brainstormOutputFontSize = Math.min(
    BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
    Math.max(BRAINSTORM_OUTPUT_MIN_FONT_SIZE, activeTabConfig.brainstormOutputFontSize ?? 14),
  );
  const brainstormStreamEnabled = activeTabConfig.brainstormStreamEnabled !== false;
  const settingPreviewFontSize = Math.min(
    SETTING_PREVIEW_MAX_FONT_SIZE,
    Math.max(SETTING_PREVIEW_MIN_FONT_SIZE, activeTabConfig.settingPreviewFontSize ?? 14),
  );
  const roleTextFontSize = Math.min(
    ROLE_TEXT_MAX_FONT_SIZE,
    Math.max(ROLE_TEXT_MIN_FONT_SIZE, activeTabConfig.roleTextFontSize ?? 14),
  );
  const currentOutlineChapterNumber = useMemo(() => (
    volumes
      .flatMap((volume) => volume.chapters)
      .find((chapter) => chapter.id === selectedOutlineChapterId)
      ?.serialNumber ?? null
  ), [selectedOutlineChapterId, volumes]);
  const detailOutlineFontSize = Math.min(
    DETAIL_OUTLINE_MAX_FONT_SIZE,
    Math.max(DETAIL_OUTLINE_MIN_FONT_SIZE, activeTabConfig.detailOutlineFontSize ?? 14),
  );
  useTopModalEscape(isBrainstormPromptManagerOpen && !editingBrainstormPrompt && !isCreatingBrainstormPrompt, closeBrainstormPromptManager);
  useTopModalEscape(Boolean(editingBrainstormPrompt || isCreatingBrainstormPrompt), () => closeBrainstormPromptEdit());
  useTopModalEscape(Boolean(brainstormGenerateDraft), () => setBrainstormGenerateDraft(null));
  useTopModalEscape(Boolean(settingCreateDialog), () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  });
  useTopModalEscape(isFieldSizeSettingsOpen, () => setIsFieldSizeSettingsOpen(false));
  useTopModalEscape(isLibraryAiLogOpen, () => setIsLibraryAiLogOpen(false));
  useTopModalEscape(isDetailOutlineReaderOpen, () => setIsDetailOutlineReaderOpen(false));
  useTopModalEscape(isPlotPointModalOpen, () => setIsPlotPointModalOpen(false));
  useTopModalEscape(isBrainstormRecycleOpen && !isClearBrainstormRecycleConfirmOpen, () => setIsBrainstormRecycleOpen(false));
  useTopModalEscape(isBrainstormReaderOpen, closeBrainstormReader);
  useTopModalEscape(isOtherSettingReaderOpen, closeOtherSettingReader);

  useEffect(() => {
    if (fieldSizeOpenSignal <= 0 || fieldSizeOpenSignal === lastFieldSizeOpenSignalRef.current) return;
    lastFieldSizeOpenSignalRef.current = fieldSizeOpenSignal;
    setIsFieldSizeSettingsOpen(true);
  }, [fieldSizeOpenSignal]);

  useEffect(() => {
    if (openLogSignal <= 0 || openLogSignal === lastOpenLogSignalRef.current) return;
    lastOpenLogSignalRef.current = openLogSignal;
    openLibraryAiLog(activeTab === SETTING_TAB || activeTab === ROLE_TAB || activeTab === BRAINSTORM_TAB ? 'library' : 'outline');
  }, [activeTab, openLogSignal]);

  useEffect(() => {
    if (openPlotPointSignal <= 0 || activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return;
    setIsPlotPointModalOpen(true);
  }, [activeTab, openPlotPointSignal, plotPointStandalone]);

  useEffect(() => () => {
    if (brainstormConfirmScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormConfirmScrollTimerRef.current);
    }
    if (detailOutlineScrollTimerRef.current !== null) {
      window.clearTimeout(detailOutlineScrollTimerRef.current);
    }
    if (settingSidebarScrollTimerRef.current !== null) {
      window.clearTimeout(settingSidebarScrollTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearStoredBrainstormAiSessionPreviews(storageKey);
    };
  }, [storageKey]);

  const updateTabConfig = useCallback((tab: string, updates: LibraryTabConfig) => {
    setTabConfigs((prev) => {
      const next = {
        ...prev,
        [tab]: {
          ...prev[tab],
          ...updates,
        },
      };
      localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
  }, [storageKey]);
  const updateActiveTabConfig = useCallback((updates: LibraryTabConfig) => updateTabConfig(activeTab, updates), [activeTab, updateTabConfig]);
  const updateBrainstormAiSession = useCallback((sessionId: string, patch: Partial<Omit<BrainstormAiSession, 'id'>>) => {
    setTabConfigs((prev) => {
      const currentConfig = prev[BRAINSTORM_TAB] ?? {};
      const currentSessions = normalizeBrainstormAiSessions(currentConfig.aiSessions, currentConfig);
      const currentActiveId = getActiveBrainstormAiSessionId(currentConfig.activeAiSessionId, currentSessions);
      const targetId = currentSessions.some((session) => session.id === sessionId) ? sessionId : currentActiveId;
      const nextSessions = currentSessions.map((session) => (
        session.id === targetId ? { ...session, ...patch } : session
      ));
      const activeSession = nextSessions.find((session) => session.id === currentActiveId) ?? nextSessions[0];
      const nextConfig: LibraryTabConfig = {
        ...currentConfig,
        aiSessions: nextSessions,
        activeAiSessionId: currentActiveId,
        aiInput: activeSession?.input ?? '',
        aiOutput: activeSession?.output ?? '',
        aiResult: activeSession?.result ?? '',
      };
      const next = {
        ...prev,
        [BRAINSTORM_TAB]: nextConfig,
      };
      localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
  }, [storageKey]);
  const updateActiveBrainstormAiSession = (patch: Partial<Omit<BrainstormAiSession, 'id'>>) => {
    updateBrainstormAiSession(activeBrainstormAiSessionId, patch);
  };
  useEffect(() => {
    const previousTab = previousActiveTabRef.current;
    previousActiveTabRef.current = activeTab;
    if (previousTab !== BRAINSTORM_TAB || activeTab === BRAINSTORM_TAB) return;
    updateBrainstormAiSession(activeBrainstormAiSessionId, {
      input: '',
      output: '',
      result: '',
      previewTitles: [],
      previewDrafts: [],
      previewSelectedIndexes: undefined,
    });
  }, [activeTab, activeBrainstormAiSessionId, updateBrainstormAiSession]);
  const setOutlinePreviewDraft = useCallback((value: SetStateAction<string>) => {
    setOutlinePreviewDraftState((current) => {
      const nextValue = typeof value === 'function' ? value(current) : value;
      if (plotPointStandalone) updateActiveTabConfig({ plotPointPreviewDraft: nextValue });
      return nextValue;
    });
  }, [plotPointStandalone, updateActiveTabConfig]);
  const setPlotPointGeneratedCandidateText = (value: string) => {
    setPlotPointGeneratedCandidateTextState(value);
    updateActiveTabConfig({ plotPointGeneratedCandidateText: value });
  };
  const setIsPlotPointPreviewCleared = (value: boolean) => {
    setIsPlotPointPreviewClearedState(value);
    updateActiveTabConfig({ plotPointPreviewCleared: value });
  };
  const setPlotPointSelectedCandidateCache = (updater: (current: Record<string, WorkbenchPlotPointCandidate>) => Record<string, WorkbenchPlotPointCandidate>) => {
    setPlotPointSelectedCandidateMap((current) => {
      const next = updater(current);
      updateActiveTabConfig({ plotPointSelectedCandidates: Object.values(next) });
      return next;
    });
  };
  const setActivePlotPointChainSlot = (slot: PlotPointChainSlot) => {
    setPlotPointActiveChainSlot(slot);
    setPlotPointChainMenuSlot(null);
    setActivePlotPointChainItemId(null);
    updateActiveTabConfig({ plotPointActiveChainSlot: slot });
  };
  const renamePlotPointChain = (slot: PlotPointChainSlot, value: string) => {
    const nextName = value.trim() || `剧情链${slot}`;
    setPlotPointChainNames((current) => {
      const next = { ...current, [slot]: nextName };
      updateActiveTabConfig({ plotPointChainNames: next });
      return next;
    });
    setPlotPointChainRenameDraft(nextName);
    setPlotPointChainMenuSlot(null);
  };
  const setPlotPointGenerateCount = (value: typeof PLOT_POINT_GENERATE_COUNTS[number]) => {
    const normalizedValue = normalizePlotPointGenerateCount(value);
    setPlotPointGenerateCountState(normalizedValue);
    updateActiveTabConfig({ plotPointGenerateCount: normalizedValue });
  };
  const setPlotPointLength = (value: PlotPointLengthMode) => {
    const normalizedValue = normalizePlotPointLengthMode(value);
    setPlotPointLengthState(normalizedValue);
    updateActiveTabConfig({ plotPointLength: normalizedValue });
  };
  const setSelectedId = (id: string | null) => updateActiveTabConfig({ selectedId: id });
  const setSelectedIdForTab = (tab: string, id: string | null) => updateTabConfig(tab, { selectedId: id });
  const setRoleTypeDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleTypeDraft: value, typeDraft: value });
  const setRoleNameDraft = (value: string) => updateTabConfig(ROLE_TAB, { roleNameDraft: value, titleDraft: value });
  const setSettingTypeDraft = (value: string) => updateActiveTabConfig({ typeDraft: value });
  const setSettingTitleDraft = (value: string) => updateActiveTabConfig({ titleDraft: value });
  const setLibraryEntryDropPreviewState = (next: LibraryEntryDropPreviewState) => {
    libraryEntryDropPreviewRef.current = next;
    setLibraryEntryDropPreview(next);
  };
  const getSelectedSettingWorkspaceDomain = useCallback(() => {
    return Object.prototype.hasOwnProperty.call(SETTING_WORKSPACE_DOMAIN_GROUPS, outlineSettingDomain)
      ? outlineSettingDomain
      : null;
  }, [outlineSettingDomain]);
  const getSelectedSettingWorkspaceType = useCallback(() => {
    const domain = getSelectedSettingWorkspaceDomain();
    return domain ? SETTING_WORKSPACE_DOMAIN_GROUPS[domain as keyof typeof SETTING_WORKSPACE_DOMAIN_GROUPS][0] : null;
  }, [getSelectedSettingWorkspaceDomain]);
  const getSettingTypeWorkspaceDomain = useCallback((type: string) => {
    const customDomain = customSettingTypeDomains[type];
    return DEFAULT_SETTING_TYPE_DOMAINS[type]
      ?? (customDomain && Object.prototype.hasOwnProperty.call(SETTING_WORKSPACE_DOMAIN_GROUPS, customDomain) ? customDomain : null)
      ?? null;
  }, [customSettingTypeDomains]);
  const setAiInput = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ input: value });
      return;
    }
    updateActiveTabConfig({ aiInput: value });
  };
  const setAiOutput = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ output: value });
      return;
    }
    updateActiveTabConfig({ aiOutput: value });
  };
  const setAiResult = (value: string) => {
    if (activeTab === BRAINSTORM_TAB) {
      updateActiveBrainstormAiSession({ result: value });
      return;
    }
    updateActiveTabConfig({ aiResult: value });
  };

  useEffect(() => {
    const syncBackgroundTasks = () => {
      setTabConfigs((prev) => {
        let changed = false;
        const next: LibraryTabConfigs = { ...prev };
        Object.entries(prev).forEach(([tab, config]) => {
          let nextConfig = config;
          if (tab === BRAINSTORM_TAB) {
            const sessions = normalizeBrainstormAiSessions(config.aiSessions, config);
            let sessionsChanged = false;
            const nextSessions = sessions.map((session) => {
              if (!session.backgroundAiTaskId) return session;
              const task = getBackgroundAiTask(session.backgroundAiTaskId);
              if (!task || task.meta?.target !== 'workbenchLibraryAi' || task.meta.storageKey !== storageKey) return session;
              const output = getLibraryBackgroundTaskOutput(task);
              const result = getBrainstormBackgroundTaskResult(task);
              if (session.output === output && session.result === result) return session;
              sessionsChanged = true;
              return { ...session, output, result };
            });
            if (sessionsChanged) {
              const activeId = getActiveBrainstormAiSessionId(config.activeAiSessionId, nextSessions);
              const activeSession = nextSessions.find((session) => session.id === activeId) ?? nextSessions[0];
              nextConfig = {
                ...nextConfig,
                aiSessions: nextSessions,
                activeAiSessionId: activeId,
                aiInput: activeSession?.input ?? '',
                aiOutput: activeSession?.output ?? '',
                aiResult: activeSession?.result ?? '',
              };
            }
          } else if (nextConfig.libraryAiTaskId) {
            const task = getBackgroundAiTask(nextConfig.libraryAiTaskId);
            if (task && task.meta?.target === 'workbenchLibraryAi' && task.meta.storageKey === storageKey) {
              const output = getLibraryBackgroundTaskOutput(task);
              if (nextConfig.aiOutput !== output) {
                nextConfig = { ...nextConfig, aiOutput: output };
              }
            }
          }
          if (nextConfig !== config) {
            changed = true;
            next[tab] = nextConfig;
          }
        });
        if (changed) localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
        return changed ? next : prev;
      });

      const activeConfig = tabConfigs[activeTab] ?? {};
      const activeBrainstormTaskId = activeTab === BRAINSTORM_TAB ? activeBrainstormAiSession?.backgroundAiTaskId : undefined;
      const activeLibraryTask = activeBrainstormTaskId
        ? getBackgroundAiTask(activeBrainstormTaskId)
        : activeConfig.libraryAiTaskId
          ? getBackgroundAiTask(activeConfig.libraryAiTaskId)
          : null;
      const activeOutlineTask = activeConfig.outlineAiTaskId ? getBackgroundAiTask(activeConfig.outlineAiTaskId) : null;
      const activePlotPointTask = activeConfig.plotPointAiTaskId ? getBackgroundAiTask(activeConfig.plotPointAiTaskId) : null;

      if (activeOutlineTask && activeOutlineTask.meta?.target === 'workbenchOutlineAi' && activeOutlineTask.meta.storageKey === storageKey) {
        const output = getLibraryBackgroundTaskOutput(activeOutlineTask);
        setOutlinePreviewDraftState(output);
        if (plotPointStandalone && activeConfig.plotPointPreviewDraft !== output) {
          updateActiveTabConfig({ plotPointPreviewDraft: output });
        }
        if (plotPointStandalone) {
          const candidateText = stripAiThinkingBlock(output);
          setPlotPointGeneratedCandidateTextState(candidateText);
          setIsPlotPointPreviewClearedState(
            activeOutlineTask.status === 'running'
              ? parseGeneratedPlotPointCandidates(candidateText).length === 0
              : false,
          );
        }
      }

      if (activePlotPointTask && activePlotPointTask.meta?.target === 'workbenchPlotPointAi' && activePlotPointTask.meta.storageKey === storageKey) {
        const output = getLibraryBackgroundTaskOutput(activePlotPointTask);
        setPlotPointOutput(output);
        const candidateText = stripAiThinkingBlock(output);
        setPlotPointGeneratedCandidateTextState(candidateText);
        setIsPlotPointPreviewClearedState(
          activePlotPointTask.status === 'running'
            ? parseGeneratedPlotPointCandidates(candidateText).length === 0
            : false,
        );
      }

      const relevantTask = activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB
        ? (isPlotPointModalOpen ? activePlotPointTask ?? activeOutlineTask : activeOutlineTask)
        : activeLibraryTask;
      setIsLibraryAiLoading(relevantTask?.status === 'running');
    };

    syncBackgroundTasks();
    return subscribeBackgroundAiTasks(syncBackgroundTasks);
  }, [
    activeBrainstormAiSession?.backgroundAiTaskId,
    activeTab,
    isPlotPointModalOpen,
    plotPointStandalone,
    storageKey,
    tabConfigs,
    updateActiveTabConfig,
  ]);

  const setBrainstormPreviewFontSize = (value: number) => {
    updateActiveTabConfig({
      brainstormPreviewFontSize: Math.min(
        BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
        Math.max(BRAINSTORM_PREVIEW_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setBrainstormOutputFontSize = (value: number) => {
    updateActiveTabConfig({
      brainstormOutputFontSize: Math.min(
        BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
        Math.max(BRAINSTORM_OUTPUT_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setSettingPreviewFontSize = (value: number) => {
    updateActiveTabConfig({
      settingPreviewFontSize: Math.min(
        SETTING_PREVIEW_MAX_FONT_SIZE,
        Math.max(SETTING_PREVIEW_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setRoleTextFontSize = (value: number) => {
    updateActiveTabConfig({
      roleTextFontSize: Math.min(
        ROLE_TEXT_MAX_FONT_SIZE,
        Math.max(ROLE_TEXT_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setDetailOutlineFontSize = (value: number) => {
    updateActiveTabConfig({
      detailOutlineFontSize: Math.min(
        DETAIL_OUTLINE_MAX_FONT_SIZE,
        Math.max(DETAIL_OUTLINE_MIN_FONT_SIZE, value),
      ),
    });
  };
  const setBrainstormQuestionField = (key: BrainstormQuestionKey, value: string) => {
    setBrainstormQuestionDraft((current) => ({
      ...current,
      [key]: key === 'brainstormCount' ? normalizeBrainstormCountValue(value) : value,
    }));
  };
  const updateFieldSizeSpec = (key: WorkbenchFieldSizeKey, prop: WorkbenchFieldSizeProp, value: number) => {
    setFieldSizeSpecs((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          [prop]: clampFieldSizeValue(prop, value),
        },
      };
      writeWorkbenchFieldSizeSpecs(next);
      return next;
    });
  };

  useEffect(() => {
    const nextConfig = tabConfigs[activeTab] ?? {};
    if (plotPointStandalone) setOutlinePreviewDraftState(nextConfig.plotPointPreviewDraft ?? '');
    setPlotPointGeneratedCandidateTextState(nextConfig.plotPointGeneratedCandidateText ?? '');
    setIsPlotPointPreviewClearedState(nextConfig.plotPointPreviewCleared ?? !nextConfig.plotPointGeneratedCandidateText);
    setPlotPointSelectedCandidateMap(Object.fromEntries((nextConfig.plotPointSelectedCandidates ?? []).map((item) => [item.id, item])));
    setPlotPointChainSelections(normalizePlotPointChainSelections(nextConfig.plotPointChainSelections));
    setPlotPointChainWrittenSelections(normalizePlotPointChainSelections(nextConfig.plotPointChainWrittenSelections));
    setPlotPointChainNames(normalizePlotPointChainNames(nextConfig.plotPointChainNames));
    setPlotPointActiveChainSlot(normalizePlotPointChainSlot(nextConfig.plotPointActiveChainSlot));
    setPlotPointSourceModeState(normalizePlotPointSourceMode(nextConfig.plotPointSourceMode));
    setPlotPointGenerateCountState(normalizePlotPointGenerateCount(nextConfig.plotPointGenerateCount));
    setPlotPointLengthState(normalizePlotPointLengthMode(nextConfig.plotPointLength));
    setPlotPointOpeningElementsState(normalizePlotPointOpeningElements(nextConfig.plotPointOpeningElements));
    setSelectedOutlineChapterId(Number.isFinite(nextConfig.selectedOutlineChapterId) ? nextConfig.selectedOutlineChapterId ?? null : null);
  }, [activeTab, plotPointStandalone, tabConfigs]);
  const resetFieldSizeSpecs = () => {
    const defaults = readWorkbenchFieldSizeSpecs();
    visibleFieldSizeKeys.forEach((key) => {
      defaults[key] = { ...WORKBENCH_FIELD_SIZE_DEFAULTS[key] };
    });
    writeWorkbenchFieldSizeSpecs(defaults);
    setFieldSizeSpecs(defaults);
  };
  const getFieldSizeStyle = (key: WorkbenchFieldSizeKey) => getWorkbenchFieldSizeStyle(fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key]);
  const getEmbeddedConfigSelectStyle = (style: CSSProperties): CSSProperties => (
    showInlineFieldSizeButton
      ? style
      : {
        ...style,
        width: '100%',
        maxWidth: '100%',
        '--xy-field-width': '100%',
      } as CSSProperties
  );
  const getConfigFieldSizeKey = (tab: string, kind: 'model' | 'prompt'): WorkbenchFieldSizeKey => {
    if (tab === ROLE_TAB) return kind === 'model' ? 'roleModelSelect' : 'rolePromptSelect';
    if (tab === BRAINSTORM_TAB) return kind === 'model' ? 'brainstormModelSelect' : 'brainstormPromptSelect';
    return kind === 'model' ? 'settingModelSelect' : 'settingPromptSelect';
  };
  const getConfigFieldSizeStyle = (tab: string, kind: 'model' | 'prompt'): CSSProperties => getFieldSizeStyle(getConfigFieldSizeKey(tab, kind));
  const hasBrainstormQuestionContent = (draft: BrainstormQuestionDraft) => (
    BRAINSTORM_QUESTION_FIELDS.some((field) => draft[field.key].trim())
  );

  const buildBrainstormPromptFromQuestions = (draft: BrainstormQuestionDraft) => {
    const lines = BRAINSTORM_QUESTION_FIELDS
      .map((field) => {
        const value = draft[field.key].trim();
        if (!value) return null;
        return `${field.label.replace(/^\d+\./, '')}：${value}`;
      })
      .filter((line): line is string => Boolean(line))
      .join('\n');
    if (!lines) return '';
    return [
      BRAINSTORM_GENERATE_TASK_TEXT,
      BRAINSTORM_GENERATE_RULE_TEXT,
      '',
      BRAINSTORM_OTHER_REQUIREMENTS_HEADER,
      lines,
    ].join('\n');
  };

  const openBrainstormGenerateConfirm = () => {
    if (isLibraryAiLoading) return;
    setBrainstormGenerateDraft({ ...brainstormQuestionDraft });
  };

  const scrollLibraryAiOutputToBottom = () => {
    const output = libraryAiOutputRef.current;
    if (!output) return;
    libraryAiProgrammaticScrollRef.current = true;
    output.scrollTop = output.scrollHeight;
    window.requestAnimationFrame(() => {
      libraryAiProgrammaticScrollRef.current = false;
    });
  };

  const handleLibraryAiOutputScroll = () => {
    const output = libraryAiOutputRef.current;
    if (!output || libraryAiProgrammaticScrollRef.current) return;
    const distanceToBottom = output.scrollHeight - output.scrollTop - output.clientHeight;
    libraryAiAutoScrollRef.current = distanceToBottom <= 24;
  };

  useEffect(() => {
    if (!isLibraryAiLoading) {
      setLoadingDotCount(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isLibraryAiLoading]);

  useEffect(() => {
    if (!isLibraryAiLoading) return;
    if (!libraryAiAutoScrollRef.current) return;
    scrollLibraryAiOutputToBottom();
  }, [animatedAiOutput, isLibraryAiLoading]);

  const setRememberedActiveTab = useCallback((tab: string) => {
    const normalizedTab = normalizeTabName(tab);
    setActiveTab(normalizedTab);
    try {
      if (normalizedTabs.includes(normalizedTab)) {
        localStorage.setItem(getActiveTabStorageKey(storageKey), normalizedTab);
      }
    } catch {
      // Local tab memory is a convenience; the panel should still work without it.
    }
  }, [normalizedTabs, storageKey]);

  const getResizeEventScale = (element: HTMLElement) => {
    const rectWidth = element.getBoundingClientRect().width;
    const layoutWidth = element.offsetWidth;
    if (!rectWidth || !layoutWidth) return scale || 1;
    return rectWidth / layoutWidth || scale || 1;
  };

  const startLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale);
    const maxWidth = Math.max(
      minWidth,
      isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),
    );
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryLeftWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
      setSettingLibraryLeftWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'left', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startRightWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const isOutlineActionTab = activeTab === DETAIL_OUTLINE_TAB || activeTab === OUTLINE_LIBRARY_TAB;
    const minWidth = isBrainstormTab
      ? BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH
      : isOutlineActionTab
        ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
        : SETTING_LIBRARY_RIGHT_MIN_WIDTH;
    const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH : SETTING_LIBRARY_RIGHT_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryRightWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (startX - moveEvent.clientX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
      setSettingLibraryRightWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'right', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startBrainstormPreviewWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const maxWidth = activeTab === BRAINSTORM_TAB ? BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH : BRAINSTORM_PREVIEW_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, brainstormPreviewWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX),
      );
      setBrainstormPreviewWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'brainstormPreview', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startPlotPointTreeWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, plotPointLayoutTreeWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutTreeWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'tree', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startPlotPointLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, plotPointLayoutLeftWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutLeftWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'left', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const startPlotPointRightWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the resize alive.
    }
    const eventScale = getResizeEventScale(event.currentTarget);
    const startX = event.clientX;
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, plotPointLayoutRightWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (startX - moveEvent.clientX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutRightWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'right', nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  const leftResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startLeftWidthResize}
      className="group relative z-50 flex h-full w-4 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      style={activeTab === SETTING_TAB ? { gridColumn: 2, gridRow: 2 } : undefined}
      title="拖拽调整左侧宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const rightResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startRightWidthResize}
      className="group relative z-50 flex h-full w-4 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      style={activeTab === SETTING_TAB ? { gridColumn: 4, gridRow: '1 / 3' } : undefined}
      title="拖拽调整右侧宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const brainstormPreviewResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startBrainstormPreviewWidthResize}
      className="group relative z-30 flex h-full w-4 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整脑洞预览宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const plotPointLeftResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startPlotPointLeftWidthResize}
      className="group relative z-30 flex h-full w-3 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整剧情链左侧宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const plotPointTreeResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startPlotPointTreeWidthResize}
      className="group relative z-30 flex h-full w-3 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整剧情链目录宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const plotPointRightResizeHandle = (
    <div
      data-no-modal-drag="true"
      onPointerDown={startPlotPointRightWidthResize}
      className="group relative z-30 flex h-full w-3 -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent"
      title="拖拽调整剧情链右侧宽度"
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );

  const visibleEntries = useMemo(() => entries.filter((entry) => entry.tab === activeTab), [activeTab, entries]);
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const selectedRole = selectedEntry && activeTab === ROLE_TAB ? parseRoleContent(selectedEntry.content) : null;
  const selectedRoleIsMaleProtagonist = Boolean(selectedRole && isMaleProtagonistRoleType(selectedRole.type));
  const selectedRoleLifeStatus = selectedRoleIsMaleProtagonist ? '存活' : selectedRole?.lifeStatus;

  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab)) return;
    setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, activeTab));
    setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, activeTab));
  }, [activeTab, scale, storageKey]);

  useEffect(() => {
    if (!SETTING_LIBRARY_TABS.has(activeTab) || activeTab === BRAINSTORM_TAB) return;
    const syncVisibleLeftWidth = () => {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, activeTab, scale));
    };
    syncVisibleLeftWidth();
    window.addEventListener('resize', syncVisibleLeftWidth);
    return () => window.removeEventListener('resize', syncVisibleLeftWidth);
  }, [activeTab, scale, storageKey]);

  useEffect(() => {
    const nextActiveTab = readActiveTab(storageKey, normalizedTabs, defaultActiveTab);
    setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    setTabConfigs(readTabConfigs(storageKey));
    setActiveTab(nextActiveTab);
    if (SETTING_LIBRARY_TABS.has(nextActiveTab)) {
      setSettingLibraryLeftWidth(readSettingLibraryLeftWidth(storageKey, nextActiveTab, scale));
      setSettingLibraryRightWidth(readSettingLibraryRightWidth(storageKey, nextActiveTab));
      setBrainstormPreviewWidth(readBrainstormPreviewWidth(storageKey, nextActiveTab));
    }
    setCustomRoleTypes(readCustomRoleTypes(storageKey));
    setCustomSettingTypes(readCustomSettingTypes(storageKey));
    setCustomSettingTypeDomains(readCustomSettingTypeDomains(storageKey));
    setHiddenRoleTypes(readHiddenRoleTypes(storageKey));
    setHiddenSettingTypes(readHiddenSettingTypes(storageKey));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== storageKey && event.detail?.storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncBrainstormRecycleEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== getBrainstormRecycleStorageKey(storageKey)) return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== storageKey && event.key !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) return;
      setEntries(readNormalizedEntriesWithVisibleDefaults(storageKey, normalizedTabs));
    };
    const syncStorageBrainstormRecycleEntries = (event: StorageEvent) => {
      if (event.key && event.key !== getBrainstormRecycleStorageKey(storageKey)) return;
      setBrainstormRecycleEntries(readBrainstormRecycleEntries(storageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
    window.addEventListener('storage', syncStorageEntries);
    window.addEventListener('storage', syncStorageBrainstormRecycleEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncBrainstormRecycleEntries);
      window.removeEventListener('storage', syncStorageEntries);
      window.removeEventListener('storage', syncStorageBrainstormRecycleEntries);
    };
  }, [defaultActiveTab, normalizedTabs, scale, storageKey]);

  useEffect(() => {
    if (!categoryMenu && !entryMenu && !promptDisableMenu) return;
    const closeMenu = (event: globalThis.MouseEvent | PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-library-context-menu="true"]')) return;
      setCategoryMenu(null);
      setEntryMenu(null);
      setPromptDisableMenu(null);
    };
    window.addEventListener('pointerdown', closeMenu, true);
    window.addEventListener('contextmenu', closeMenu, true);
    return () => {
      window.removeEventListener('pointerdown', closeMenu, true);
      window.removeEventListener('contextmenu', closeMenu, true);
    };
  }, [categoryMenu, entryMenu, promptDisableMenu]);

  useEffect(() => {
    if (!outlineStorageKey) {
      setOutlineEntries([]);
      return;
    }
    setOutlineEntries(readNormalizedEntries(outlineStorageKey));

    const syncEntries = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.storageKey !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };
    const syncStorageEntries = (event: StorageEvent) => {
      if (event.key && event.key !== outlineStorageKey) return;
      setOutlineEntries(readNormalizedEntries(outlineStorageKey));
    };

    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncStorageEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncStorageEntries);
    };
  }, [outlineStorageKey]);

  useEffect(() => {
    if (normalizedTabs.includes(activeTab)) return;
    setRememberedActiveTab(normalizedTabs[0] ?? '');
  }, [activeTab, normalizedTabs, setRememberedActiveTab]);

  useEffect(() => {
    roleExpandedReloadRef.current = true;
    setExpandedRoleTypes(readExpandedStringSet(storageKey, ROLE_TAB, 'role_types'));
  }, [storageKey]);

  useEffect(() => {
    settingExpandedReloadRef.current = true;
    setExpandedSettingTypes(readExpandedStringSet(storageKey, activeTab, 'setting_types'));
  }, [activeTab, storageKey]);

  useEffect(() => {
    outlineExpandedReloadRef.current = true;
    setExpandedOutlineVolumeIds(readExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes'));
  }, [activeTab, outlineStorageKey, storageKey]);

  useEffect(() => {
    setManualDetailOutlinePublishedChapterIds(readManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey));
    setShowDetailOutlinePublished(false);
  }, [outlineStorageKey, storageKey]);

  useEffect(() => {
    if (roleExpandedReloadRef.current) {
      roleExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, ROLE_TAB, 'role_types', expandedRoleTypes);
  }, [expandedRoleTypes, storageKey]);

  useEffect(() => {
    if (settingExpandedReloadRef.current) {
      settingExpandedReloadRef.current = false;
      return;
    }
    persistExpandedStringSet(storageKey, activeTab, 'setting_types', expandedSettingTypes);
  }, [activeTab, expandedSettingTypes, storageKey]);

  useEffect(() => {
    if (outlineExpandedReloadRef.current) {
      outlineExpandedReloadRef.current = false;
      return;
    }
    persistExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes', expandedOutlineVolumeIds);
  }, [activeTab, expandedOutlineVolumeIds, outlineStorageKey, storageKey]);

  useEffect(() => {
    persistManualDetailOutlinePublishedChapterIds(outlineStorageKey ?? storageKey, manualDetailOutlinePublishedChapterIds);
  }, [manualDetailOutlinePublishedChapterIds, outlineStorageKey, storageKey]);

  useEffect(() => {
    if (!detailOutlineChapterMenu.visible) return;
    const close = () => setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [detailOutlineChapterMenu.visible]);

  useEffect(() => {
    if ((!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) return;
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      if (prev.size > 0 || volumes.length === 0) return prev;
      return new Set(volumes.map((volume) => volume.id));
    });
  }, [activeTab, outlineStorageKey, storageKey, tabs, volumes]);

  useEffect(() => {
    if (hasStoredExpandedNumberSet(outlineStorageKey ?? storageKey, activeTab, 'outline_volumes')) return;
    setExpandedOutlineVolumeIds((prev) => {
      const next = new Set(prev);
      volumes.forEach((volume) => next.add(volume.id));
      return next;
    });
  }, [activeTab, outlineStorageKey, storageKey, volumes]);

  useEffect(() => {
    if (outlineSelectionType !== 'chapter' || selectedOutlineChapterId == null) return;
    const id = window.setTimeout(() => {
      outlinePreviewRefs.current[selectedOutlineChapterId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(id);
  }, [outlineSelectionType, selectedOutlineChapterId]);

  useEffect(() => {
    if (activeTab !== DETAIL_OUTLINE_TAB || outlineSelectionType === 'chapter') return;
    setOutlineSelectionType('chapter');
    setSelectedOutlineVolumeId(null);
  }, [activeTab, outlineSelectionType]);

  useEffect(() => {
    if (!shouldSyncOutlinePreviewDraft({ plotPointStandalone })) return;
    if (suppressNextOutlinePreviewSyncRef.current) {
      suppressNextOutlinePreviewSyncRef.current = false;
      return;
    }
    if (isDetailOutlineLikeTab(activeTab)) return;
    if ((!tabs.includes(CHAPTER_SUMMARY_TAB) || !tabs.includes(VOLUME_SUMMARY_TAB)) && activeTab !== OUTLINE_LIBRARY_TAB) return;
    const isDetailOutlineTab = false;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    if (!isDetailOutlineTab && outlineSelectionType === 'volume') {
      const volume = volumes.find((item) => item.id === selectedOutlineVolumeId) ?? volumes[0];
      const content = currentOutlineEntries.find((entry) => (
        entry.tab === VOLUME_SUMMARY_TAB
        || entry.tab === LEGACY_VOLUME_SUMMARY_TAB
        || entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD
      ) && (
        entry.title === `${volume?.name ?? ''}梗概`
        || entry.title === `${volume?.name ?? ''}摘要`
        || entry.title === `${volume?.name ?? ''}概要`
      ))?.content ?? '';
      setOutlinePreviewDraft(content);
      return;
    }
    const chapters = volumes.flatMap((volume) => volume.chapters);
    const chapter = chapters.find((item) => item.id === selectedOutlineChapterId) ?? chapters[0];
    const chapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const chapterTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章细纲` : `第${chapter?.serialNumber ?? ''}章梗概`;
    const legacyChapterTitle = `第${chapter?.serialNumber ?? ''}章摘要`;
    const olderLegacyChapterTitle = `第${chapter?.serialNumber ?? ''}章概要`;
    const chapterDisplayTitle = isDetailOutlineTab ? `第${chapter?.serialNumber ?? ''}章章纲` : chapterTitle;
    const content = currentOutlineEntries.find((entry) => (
      entry.tab === chapterTab && (
        entry.title === chapterTitle
        || entry.title === legacyChapterTitle
        || entry.title === olderLegacyChapterTitle
        || entry.title === chapterDisplayTitle
      )
    ))?.content ?? '';
    setOutlinePreviewDraft(content);
  }, [activeTab, entries, outlineEntries, outlineSelectionType, outlineStorageKey, plotPointStandalone, selectedOutlineChapterId, selectedOutlineVolumeId, setOutlinePreviewDraft, tabs, volumes]);

  useEffect(() => {
    const updateTarget = () => {
      setTabPortalTarget(document.getElementById('workbench-modal-header-extra'));
      setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'));
    };
    updateTarget();
    const id = window.setTimeout(updateTarget, 0);
    return () => window.clearTimeout(id);
  }, []);

  const persist = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next);
    setEntries(normalized);
    writeWorkbenchLibraryEntriesWithGlobalBrainstorm(storageKey, normalized);
  };

  const persistBrainstormRecycle = (next: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeEntries(next).filter((entry) => entry.tab === BRAINSTORM_TAB);
    setBrainstormRecycleEntries(normalized);
    writeBrainstormRecycleEntries(storageKey, normalized);
  };

  const persistOutline = (next: WorkbenchLibraryEntry[]) => {
    if (!outlineStorageKey) {
      persist(next);
      return;
    }
    const normalized = normalizeEntries(next);
    setOutlineEntries(normalized);
    writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
  };

  const addEntry = () => {
    const entry = createWorkbenchLibraryEntry(activeTab, `新建${activeTab}`);
    persist([entry, ...entries]);
    setSelectedId(entry.id);
  };

  const addEntryToTab = (tab: string, title: string) => {
    const entry = createWorkbenchLibraryEntry(tab, title);
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
  };

  const addSettingTypeByName = (name: string) => {
    const type = name.trim();
    if (!type) return;
    const selectedSettingWorkspaceDomain = getSelectedSettingWorkspaceDomain();
    setCustomSettingTypes((prev) => {
      if (prev.includes(type) || DEFAULT_SETTING_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    if (selectedSettingWorkspaceDomain && getSettingTypeWorkspaceDomain(type) !== selectedSettingWorkspaceDomain) {
      setCustomSettingTypeDomains((prev) => {
        if (prev[type] === selectedSettingWorkspaceDomain) return prev;
        const next = { ...prev, [type]: selectedSettingWorkspaceDomain };
        localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(type));
  };

  const addSettingType = () => {
    addSettingTypeByName(settingTypeDraft);
    setSettingTypeDraft('');
  };

  const getSettingCreateTypeOptions = () => {
    if (activeTab === SETTING_TAB && outlineSettingScope === 'character') return roleTypeOptions;
    if (activeTab === SETTING_TAB) {
      const domain = getSelectedSettingWorkspaceDomain();
      return domain
        ? settingTypeOptions.filter((type) => getSettingTypeWorkspaceDomain(type) === domain)
        : settingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type));
    }
    return settingTypeOptions;
  };

  const getValidSettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    if (settingCreateTypeDraft && options.includes(settingCreateTypeDraft)) return settingCreateTypeDraft;
    return options[0] ?? DEFAULT_SETTING_ENTRY_TYPE;
  };

  const getSelectedEntrySettingCreateType = () => {
    const options = getSettingCreateTypeOptions();
    const selectedId = tabConfigs[activeTab]?.selectedId;
    const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) : null;
    if (!selectedEntry || !isSettingLikeTab(selectedEntry.tab)) return getValidSettingCreateType();
    const selectedType = parseSettingContent(selectedEntry.content).type;
    return options.includes(selectedType) ? selectedType : getValidSettingCreateType();
  };

  const addSetting = (tab = SETTING_TAB, titleDraft = settingTitleDraft, typeDraft?: string) => {
    const title = titleDraft.trim() || `新建${tab}`;
    const selectedSettingWorkspaceType = typeDraft ?? getSelectedSettingWorkspaceType();
    const entry = {
      ...createWorkbenchLibraryEntry(tab, title),
      content: stringifySettingContent({
        type: tab === SETTING_TAB ? selectedSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE : DEFAULT_SETTING_ENTRY_TYPE,
        body: '',
      }),
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(tab);
    setSelectedIdForTab(tab, entry.id);
    updateTabConfig(tab, { titleDraft: '' });
  };

  const confirmSettingCreate = () => {
    if (!settingCreateDialog) return;
    const createTitle = settingCreateDraft.trim();
    if (!createTitle) return;
    const creatingOutlineCharacter = settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
    if (settingCreateDialog === 'category') {
      if (creatingOutlineCharacter) {
        addRoleTypeByName(createTitle);
        setSettingCreateDraft('');
        setSettingCreateTypeDraft('');
        setSettingCreateDialog(null);
        setSettingCreateContextKind(null);
        return;
      }
      addSettingTypeByName(createTitle);
      setSettingCreateDraft('');
      setSettingCreateTypeDraft('');
      setSettingCreateDialog(null);
      setSettingCreateContextKind(null);
      return;
    }
    const selectedCreateType = getValidSettingCreateType();
    if (creatingOutlineCharacter) {
      addRole(selectedCreateType, { switchToRoleTab: false, title: createTitle });
      setSettingCreateDraft('');
      setSettingCreateTypeDraft('');
      setSettingCreateDialog(null);
      setSettingCreateContextKind(null);
      return;
    }
    addSetting(activeTab, createTitle, selectedCreateType);
    setSettingCreateDraft('');
    setSettingCreateTypeDraft('');
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  };

  const openSettingCreateDialog = (kind: 'category' | 'setting') => {
    setSettingCreateDraft('');
    setSettingCreateTypeDraft(kind === 'setting' ? getSelectedEntrySettingCreateType() : '');
    setSettingCreateContextKind(null);
    setSettingCreateDialog(kind);
  };

  const smartImportSettings = () => {
    if (activeTabConfig.smartImportLocked !== false) return;
    const sourceText = stripAiThinkingBlock(getLatestUsefulAiText(activeTab === SETTING_TAB ? aiOutput : (aiResult || aiOutput)));
    const taggedSegments = createTaggedSettingSegments(sourceText);
    const markdownSegments = createMarkdownSettingSegments(sourceText);
    const resolvedSettingTypes = new Set(settingTypeOptions);
    const hasTaggedSegments = taggedSegments.settingSegments.length > 0 || taggedSegments.roleSegments.length > 0;
    const segments = hasTaggedSegments
      ? taggedSegments.settingSegments
      : markdownSegments.length > 0
        ? markdownSegments
        : createSmartSettingSegments(sourceText);
    const roleSegments = hasTaggedSegments ? taggedSegments.roleSegments : [];
    if (segments.length === 0 && roleSegments.length === 0) return;
    const remainingEntries = [...entries];
    const importedEntries: WorkbenchLibraryEntry[] = [];
    const importedRoleEntries: WorkbenchLibraryEntry[] = [];
    const importedCustomTypes = new Set<string>();
    const importedSettingTypes = new Set<string>();
    const importedRoleTypes = new Set<string>();
    segments.forEach((segment) => {
      const type = normalizeSettingType(segment.type);
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE) {
        importedSettingTypes.add(type);
      }
      if (type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !resolvedSettingTypes.has(type)) {
        importedCustomTypes.add(type);
      }
      const titleKey = normalizeImportedSettingKey(segment.title);
      const typeKey = normalizeImportedSettingKey(type);
      const body = normalizeImportedSettingBody(segment.body);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== SETTING_TAB) return false;
        const setting = parseSettingContent(entry.content);
        return normalizeImportedSettingKey(entry.title) === titleKey
          && normalizeImportedSettingKey(setting.type) === typeKey;
      });

      if (existingIndex >= 0) {
        const [existingEntry] = remainingEntries.splice(existingIndex, 1);
        const existingSetting = parseSettingContent(existingEntry.content);
        importedEntries.push({
          ...existingEntry,
          content: normalizeImportedSettingBody(existingSetting.body) === body
            ? existingEntry.content
            : stringifySettingContent({ type, body }),
          updatedAt: normalizeImportedSettingBody(existingSetting.body) === body
            ? existingEntry.updatedAt
            : new Date().toLocaleString('zh-CN'),
        });
        return;
      }

      importedEntries.push({
        ...createWorkbenchLibraryEntry(SETTING_TAB, segment.title),
        content: stringifySettingContent({ type, body }),
      });
    });
    roleSegments.forEach((segment) => {
      const sections = parseSectionedSettingBody(segment.body);
      const importedType = getImportedRoleSection(sections, ['身份定位', '角色定位', '人物定位', '身份', '类型']);
      const shouldMatchMaleProtagonist = isMaleProtagonistRoleType(importedType) || /男主角|主角/.test(segment.title);
      const existingIndex = remainingEntries.findIndex((entry) => {
        if (entry.tab !== ROLE_TAB) return false;
        const role = parseRoleContent(entry.content);
        const importedTitle = buildImportedRoleEntryTitle(segment, shouldMatchMaleProtagonist ? entry.title : '');
        return normalizeImportedSettingKey(entry.title) === normalizeImportedSettingKey(importedTitle)
          || (shouldMatchMaleProtagonist && isMaleProtagonistRoleType(role.type));
      });

      if (existingIndex >= 0) {
        const [existingEntry] = remainingEntries.splice(existingIndex, 1);
        const existingRole = parseRoleContent(existingEntry.content);
        const nextTitle = buildImportedRoleEntryTitle(segment, existingEntry.title);
        const nextRole = createImportedRoleContent(segment, existingRole);
        importedRoleTypes.add(nextRole.type);
        importedRoleEntries.push({
          ...existingEntry,
          title: nextTitle,
          content: stringifyRoleContent(nextRole),
          updatedAt: new Date().toLocaleString('zh-CN'),
        });
        return;
      }

      const nextTitle = buildImportedRoleEntryTitle(segment);
      const nextRole = createImportedRoleContent(segment);
      importedRoleTypes.add(nextRole.type);
      importedRoleEntries.push({
        ...createWorkbenchLibraryEntry(ROLE_TAB, nextTitle),
        content: stringifyRoleContent(nextRole),
      });
    });
    persist([...importedEntries, ...importedRoleEntries, ...remainingEntries]);
    if (importedCustomTypes.size > 0) {
      setCustomSettingTypes((prev) => {
        const next = Array.from(new Set([...prev, ...importedCustomTypes]));
        localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(next));
        return next;
      });
    }
    if (importedSettingTypes.size > 0) {
      setHiddenSettingTypes((prev) => {
        const next = prev.filter((type) => !importedSettingTypes.has(type));
        if (next.length !== prev.length) {
          localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(next));
        }
        return next;
      });
    }
    updateActiveTabConfig({ smartImportLocked: true });
    if (importedRoleEntries.length > 0) updateTabConfig(ROLE_TAB, { smartImportLocked: true });
    setRememberedActiveTab(importedEntries.length > 0 ? SETTING_TAB : ROLE_TAB);
    if (importedEntries.length > 0) setSelectedIdForTab(SETTING_TAB, importedEntries[0]?.id ?? null);
    if (importedRoleEntries.length > 0) setSelectedIdForTab(ROLE_TAB, importedRoleEntries[0]?.id ?? null);
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      segments.forEach((segment) => next.add(normalizeSettingType(segment.type)));
      return next;
    });
    if (importedRoleTypes.size > 0) {
      setExpandedRoleTypes((prev) => new Set([...prev, ...importedRoleTypes]));
    }
  };

  const isSettingTypeInActiveClearDomain = (type: string) => {
    const domain = getSelectedSettingWorkspaceDomain();
    const typeDomain = getSettingTypeWorkspaceDomain(type);
    return domain ? typeDomain === domain : !typeDomain;
  };

  const clearSettingCategories = () => {
    const domain = getSelectedSettingWorkspaceDomain();
    const shouldClearType = (type: string) => (
      type !== UNCATEGORIZED_TYPE &&
      !DEFAULT_SETTING_TYPES.includes(type) &&
      (domain ? getSettingTypeWorkspaceDomain(type) === domain : !getSettingTypeWorkspaceDomain(type))
    );
    const nextCustomTypes = customSettingTypes.filter((type) => !shouldClearType(type));
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const nextCustomTypeDomains = Object.fromEntries(
      Object.entries(customSettingTypeDomains).filter(([type]) => !shouldClearType(type)),
    );
    setCustomSettingTypeDomains(nextCustomTypeDomains);
    localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    const nextHiddenTypes = hiddenSettingTypes.filter((type) => !isSettingTypeInActiveClearDomain(type));
    setHiddenSettingTypes(nextHiddenTypes);
    localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
    localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
    const nextExpandedTypes = domain
      ? SETTING_WORKSPACE_DOMAIN_GROUPS[domain as keyof typeof SETTING_WORKSPACE_DOMAIN_GROUPS] ?? []
      : DEFAULT_WORK_SETTING_TYPES;
    setExpandedSettingTypes(new Set(nextExpandedTypes));
    const nextEntries = entries.filter((entry) => {
      if (entry.tab !== SETTING_TAB) return true;
      if (isLockedDefaultSettingEntry(entry)) return true;
      return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);
    });
    persist(nextEntries);
    if (selectedEntry?.tab === SETTING_TAB && !isLockedDefaultSettingEntry(selectedEntry) && isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
    if (activeTab === SETTING_TAB && outlineSettingScope !== 'character' && selectedEntry?.tab === SETTING_TAB && !isLockedDefaultSettingEntry(selectedEntry) && isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)) {
      setSelectedId(null);
    }
  };

  const clearSettingEntries = () => {
    const nextEntries = entries.filter((entry) => {
      if (entry.tab !== SETTING_TAB) return true;
      if (isLockedDefaultSettingEntry(entry)) return true;
      return !isSettingTypeInActiveClearDomain(parseSettingContent(entry.content).type);
    });
    persist(nextEntries);
    if (selectedEntry?.tab === SETTING_TAB && !isLockedDefaultSettingEntry(selectedEntry) && isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
    if (activeTab === SETTING_TAB && outlineSettingScope !== 'character' && selectedEntry?.tab === SETTING_TAB && !isLockedDefaultSettingEntry(selectedEntry) && isSettingTypeInActiveClearDomain(parseSettingContent(selectedEntry.content).type)) {
      setSelectedId(null);
    }
  };

  const clearRoleCategories = () => {
    setCustomRoleTypes([]);
    localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify([]));
    setHiddenRoleTypes([]);
    localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify([]));
    localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
    setExpandedRoleTypes(new Set(DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE)));
    persist(entries.filter((entry) => {
      if (entry.tab !== ROLE_TAB) return true;
      return isDefaultWorkbenchRoleType(parseRoleContent(entry.content).type);
    }));
    if (selectedEntry?.tab === ROLE_TAB && !isDefaultWorkbenchRoleType(selectedRole?.type)) setSelectedIdForTab(ROLE_TAB, null);
    if ((activeTab === ROLE_TAB || (activeTab === SETTING_TAB && outlineSettingScope === 'character')) && selectedEntry?.tab === ROLE_TAB && !isDefaultWorkbenchRoleType(selectedRole?.type)) {
      setSelectedId(null);
    }
  };

  const clearRoleEntries = () => {
    persist(entries.filter((entry) => entry.tab !== ROLE_TAB || isMaleProtagonistRoleType(parseRoleContent(entry.content).type)));
    if (selectedEntry?.tab === ROLE_TAB && !selectedRoleIsMaleProtagonist) setSelectedIdForTab(ROLE_TAB, null);
    if ((activeTab === ROLE_TAB || (activeTab === SETTING_TAB && outlineSettingScope === 'character')) && selectedEntry?.tab === ROLE_TAB && !selectedRoleIsMaleProtagonist) {
      setSelectedId(null);
    }
  };

  const getNextBrainstormTitle = () => {
    const maxNumber = entries
      .filter((entry) => entry.tab === BRAINSTORM_TAB)
      .map((entry) => entry.title.match(/^脑洞(\d+)$/)?.[1])
      .filter((value): value is string => Boolean(value))
      .reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    return `脑洞${maxNumber + 1}`;
  };
  const getNextBrainstormTitles = (count: number) => {
    const maxNumber = entries
      .filter((entry) => entry.tab === BRAINSTORM_TAB)
      .map((entry) => entry.title.match(/^脑洞(\d+)$/)?.[1])
      .filter((value): value is string => Boolean(value))
      .reduce((max, value) => Math.max(max, Number(value) || 0), 0);
    return Array.from({ length: count }, (_, index) => `脑洞${maxNumber + index + 1}`);
  };

  const getCurrentBrainstormOutputPreviews = (selectedOnly = false) => {
    const count = activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount);
    const body = getLatestUsefulAiText(aiResult || aiOutput);
    const splitParts = splitBrainstormGeneratedText(body, count);
    const drafts = activeBrainstormAiSession?.previewDrafts;
    const titles = activeBrainstormAiSession?.previewTitles;
    const previews = Array.from({ length: count }, (_, index) => ({
      title: titles?.[index]?.trim() || getTemporaryBrainstormTitle(index),
      body: drafts?.[index] ?? splitParts[index] ?? '',
      index,
    })).filter((item) => item.body.trim());
    if (!selectedOnly) return previews;
    const selectedIndexes = new Set(getSelectedBrainstormPreviewIndexes(
      Array.from({ length: count }, (_, index) => drafts?.[index] ?? splitParts[index] ?? ''),
      activeBrainstormAiSession?.previewSelectedIndexes,
    ));
    return previews.filter((item) => selectedIndexes.has(item.index));
  };

  const saveBrainstormOutputAsNew = () => {
    const previews = getCurrentBrainstormOutputPreviews(true);
    if (previews.length === 0) return;
    const nextTitles = getNextBrainstormTitles(previews.length);
    const nextEntries = previews.map((preview, index) => ({
      ...createWorkbenchLibraryEntry(BRAINSTORM_TAB, nextTitles[index] ?? getNextBrainstormTitle()),
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body: preview.body }),
    }));
    persist([...nextEntries, ...entries]);
    setRememberedActiveTab(BRAINSTORM_TAB);
    setSelectedIdForTab(BRAINSTORM_TAB, nextEntries[0].id);
    setExpandedSettingTypes((prev) => new Set(prev).add(BRAINSTORM_TYPE));
  };

  const saveBrainstormOutput = (targetId?: string | null) => {
    const selectedPreviews = getCurrentBrainstormOutputPreviews(true);
    if (selectedPreviews.length !== 1) return;
    const body = selectedPreviews[0]?.body.trim() ?? '';
    if (!body || !targetId) return;
    updateEntry(targetId, {
      content: stringifySettingContent({ type: BRAINSTORM_TYPE, body }),
    });
  };

  const openBrainstormPromptEdit = (prompt: PromptItem) => {
    setEditingBrainstormPrompt(prompt);
    setIsCreatingBrainstormPrompt(false);
    setBrainstormPromptDraft({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
    });
  };

  const openBrainstormPromptCreate = () => {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(true);
    setBrainstormPromptDraft({
      name: '',
      description: '',
      content: '',
    });
  };

  function closeBrainstormPromptEdit() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
  }

  function closeBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
    setIsBrainstormPromptManagerOpen(false);
  }

  function closeBrainstormReader() {
    setSelectedBrainstormReaderId(null);
    setIsBrainstormReaderOpen(false);
  }

  function confirmBrainstormReaderSelection() {
    const selectedEntry = entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === selectedBrainstormReaderId);
    if (!selectedEntry) return;
    const selectedText = getBrainstormEntryBody(selectedEntry);
    updateActiveTabConfig({
      associationSessionId: getWorkbenchAssociationRuntimeId(),
      loadedBrainstormId: selectedEntry.id,
      loadedBrainstormTitle: selectedEntry.title,
      loadedBrainstormText: selectedText,
      linkedOtherSettingIds: [],
      settingLinkSource: 'brainstorm',
      promptDisabled: false,
    });
    closeBrainstormReader();
  }

  function openOtherSettingReader() {
    const linkedIds = getActiveSettingLinkSource() === 'other'
      ? normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds)
      : [];
    setDraftOtherSettingReaderIds(new Set(linkedIds));
    setOtherSettingReaderQuery('');
    const preferredTab = otherSettingLinkTabs.find((tab) => tab.id === otherSettingReaderTabId && tab.groups.some((group) => group.entries.length > 0))
      ?? otherSettingLinkTabs.find((tab) => tab.groups.some((group) => group.entries.length > 0))
      ?? otherSettingLinkTabs[0];
    if (preferredTab) setOtherSettingReaderTabId(preferredTab.id);
    const firstEntry = preferredTab?.groups.flatMap((group) => group.entries)[0] ?? otherSettingLinkFlatEntries[0];
    setOtherSettingReaderPreviewId(linkedIds[0] ?? firstEntry?.id ?? '');
    setIsOtherSettingReaderOpen(true);
  }

  function closeOtherSettingReader() {
    setOtherSettingReaderQuery('');
    setIsOtherSettingReaderOpen(false);
  }

  function toggleDraftOtherSettingReaderId(id: string) {
    setDraftOtherSettingReaderIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllCurrentOtherSettingLinkTab() {
    const ids = (selectedOtherSettingLinkTab?.groups ?? [])
      .flatMap((group) => group.entries)
      .map((entry) => entry.id);
    setDraftOtherSettingReaderIds(new Set(ids));
  }

  function toggleVisibleOtherSettingLinkGroupSelection(items: OtherSettingLinkEntry[]) {
    setDraftOtherSettingReaderIds((current) => {
      const next = new Set(current);
      const allSelected = items.every((item) => next.has(item.id));
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }

  function confirmOtherSettingReaderSelection() {
    const selectedIds = Array.from(draftOtherSettingReaderIds).filter((id) => otherSettingLinkFlatEntries.some((entry) => entry.id === id));
    updateActiveTabConfig({
      associationSessionId: selectedIds.length > 0 ? getWorkbenchAssociationRuntimeId() : null,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
      linkedOtherSettingIds: selectedIds,
      settingLinkSource: selectedIds.length > 0 ? 'other' : null,
      promptDisabled: false,
    });
    closeOtherSettingReader();
  }

  function clearActiveLinkedOtherSettings() {
    updateActiveTabConfig({
      associationSessionId: null,
      linkedOtherSettingIds: [],
      settingLinkSource: null,
      promptDisabled: false,
    });
    setDraftOtherSettingReaderIds(new Set());
  }

  function clearActiveLinkedBrainstorm() {
    updateActiveTabConfig({
      associationSessionId: null,
      loadedBrainstormId: null,
      loadedBrainstormTitle: '',
      loadedBrainstormText: '',
      linkedOtherSettingIds: [],
      settingLinkSource: null,
      promptDisabled: false,
    });
    setSelectedBrainstormReaderId(null);
  }

  const getActiveLinkedBrainstormSnapshot = () => {
    if (activeTab !== SETTING_TAB) return { title: '', text: '' };
    const linkedId = activeTabConfig.loadedBrainstormId;
    const linkedEntry = linkedId
      ? entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === linkedId)
      : null;
    if (linkedEntry) {
      return {
        title: linkedEntry.title,
        text: getBrainstormEntryBody(linkedEntry),
      };
    }
    return {
      title: activeTabConfig.loadedBrainstormTitle ?? '',
      text: activeTabConfig.loadedBrainstormText ?? '',
    };
  };

  const getActiveSettingLinkSource = (): SettingLinkSource => {
    if (activeTab !== SETTING_TAB) return null;
    if (!isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)) return null;
    const linkedOtherSettingIds = normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds);
    if (activeTabConfig.settingLinkSource === 'other') {
      return linkedOtherSettingIds.length > 0 ? 'other' : null;
    }
    if (activeTabConfig.settingLinkSource === 'current' || activeTabConfig.settingLinkSource === 'brainstorm') {
      return activeTabConfig.settingLinkSource;
    }
    if (linkedOtherSettingIds.length > 0) return 'other';
    return activeTabConfig.loadedBrainstormId || activeTabConfig.loadedBrainstormText?.trim() ? 'brainstorm' : null;
  };

  const getActiveLinkedSettingSnapshot = (): { source: SettingLinkSource; title: string; text: string } => {
    const source = getActiveSettingLinkSource();
    if (source === 'current') {
      if (outlineSettingScope === 'character') {
        const currentRoleId = tabConfigs[ROLE_TAB]?.selectedId ?? null;
        const currentRoleEntry = roleEntries.find((entry) => entry.id === currentRoleId) ?? roleEntries[0] ?? null;
        const currentRole = currentRoleEntry ? parseRoleContent(currentRoleEntry.content) : null;
        return {
          source,
          title: currentRoleEntry?.title ?? '当前人物设定',
          text: currentRoleEntry && currentRole ? buildRoleReaderContent(currentRoleEntry, currentRole) : '',
        };
      }
      const currentEntry = selectedEntry?.tab === SETTING_TAB ? selectedEntry : null;
      return {
        source,
        title: currentEntry?.title ?? '当前设定',
        text: getSettingEntryBody(currentEntry),
      };
    }
    if (source === 'brainstorm') {
      const linkedBrainstorm = getActiveLinkedBrainstormSnapshot();
      return {
        source,
        title: linkedBrainstorm.title,
        text: linkedBrainstorm.text,
      };
    }
    if (source === 'other') {
      const linkedEntries = activeOtherSettingLinkEntries;
      return {
        source,
        title: linkedEntries.length > 0 ? `其他设定 ${linkedEntries.length} 项` : '其他设定',
        text: linkedEntries.map((entry) => [
          `【${entry.tabTitle} / ${entry.groupName} / ${entry.title}】`,
          entry.text,
        ].filter(Boolean).join('\n')).join('\n\n'),
      };
    }
    return {
      source: null,
      title: '',
      text: '',
    };
  };

  useEffect(() => {
    if (activeTab !== SETTING_TAB) return;
    const linkedId = activeTabConfig.loadedBrainstormId;
    if (!linkedId) return;
    const linkedEntry = entries.find((entry) => entry.tab === BRAINSTORM_TAB && entry.id === linkedId);
    if (!linkedEntry) return;
    const latestText = getBrainstormEntryBody(linkedEntry);
    if (
      activeTabConfig.loadedBrainstormTitle === linkedEntry.title
      && activeTabConfig.loadedBrainstormText === latestText
    ) {
      return;
    }
    updateTabConfig(SETTING_TAB, {
      loadedBrainstormTitle: linkedEntry.title,
      loadedBrainstormText: latestText,
    });
  }, [
    activeTab,
    activeTabConfig.loadedBrainstormId,
    activeTabConfig.loadedBrainstormText,
    activeTabConfig.loadedBrainstormTitle,
    entries,
    updateTabConfig,
  ]);

  function openBrainstormPromptManager() {
    setEditingBrainstormPrompt(null);
    setIsCreatingBrainstormPrompt(false);
    setIsBrainstormPromptManagerOpen(true);
  }

  const handleBrainstormConfirmScroll = () => {
    setIsBrainstormConfirmScrolling(true);
    if (brainstormConfirmScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormConfirmScrollTimerRef.current);
    }
    brainstormConfirmScrollTimerRef.current = window.setTimeout(() => {
      setIsBrainstormConfirmScrolling(false);
      brainstormConfirmScrollTimerRef.current = null;
    }, 700);
  };

  const handleBrainstormOutputTextareaScroll = (index: number) => {
    setActiveBrainstormOutputScrollIndex(index);
    if (brainstormOutputScrollTimerRef.current !== null) {
      window.clearTimeout(brainstormOutputScrollTimerRef.current);
    }
    brainstormOutputScrollTimerRef.current = window.setTimeout(() => {
      setActiveBrainstormOutputScrollIndex(null);
      brainstormOutputScrollTimerRef.current = null;
    }, 700);
  };

  const handleDetailOutlineTextareaScroll = (chapterId: number) => {
    setActiveDetailOutlineScrollId(chapterId);
    if (detailOutlineScrollTimerRef.current !== null) {
      window.clearTimeout(detailOutlineScrollTimerRef.current);
    }
    detailOutlineScrollTimerRef.current = window.setTimeout(() => {
      setActiveDetailOutlineScrollId(null);
      detailOutlineScrollTimerRef.current = null;
    }, 700);
  };

  const handleSettingSidebarScroll = (key: string) => {
    setActiveSettingSidebarScrollKey(key);
    if (settingSidebarScrollTimerRef.current !== null) {
      window.clearTimeout(settingSidebarScrollTimerRef.current);
    }
    settingSidebarScrollTimerRef.current = window.setTimeout(() => {
      setActiveSettingSidebarScrollKey(null);
      settingSidebarScrollTimerRef.current = null;
    }, 700);
  };

  const saveBrainstormPromptEdit = () => {
    const name = brainstormPromptDraft.name.trim();
    if (!name) return;
    const payload = {
      name,
      description: brainstormPromptDraft.description,
      content: brainstormPromptDraft.content,
      category: BRAINSTORM_TAB,
    };
    if (editingBrainstormPrompt) {
      updatePrompt(editingBrainstormPrompt.id, payload);
    } else if (isCreatingBrainstormPrompt) {
      addPrompt({ ...payload, promptType: 'novel' });
    }
    closeBrainstormPromptEdit();
  };

  const deleteBrainstormPrompt = (prompt: PromptItem) => {
    if (prompt.isLocked) return;
    if (!window.confirm(`确定删除提示词「${prompt.name}」吗？删除后会进入提示词回收站。`)) return;
    deletePrompt(prompt.id);
  };

  const buildSettingLibraryRequestText = (promptText: string, userText: string) => {
    const parts = [promptText.trim()].filter(Boolean);
    const linkedSettingContext = formatSettingLinkedContextForAi(getActiveLinkedSettingSnapshot());
    if (linkedSettingContext) {
      parts.push(linkedSettingContext);
    }
    const userRequirement = formatSettingUserRequirementForAi(userText);
    if (userRequirement) {
      parts.push(userRequirement);
    }
    return parts.join('\n\n');
  };

  const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {
    const selectedModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const requestPromptCategory = activeTab === SETTING_TAB
      ? PROMPT_SETTING_CATEGORY
      : activeTab === DETAIL_OUTLINE_TAB
      ? DETAIL_OUTLINE_PROMPT_CATEGORY
      : activeTab;
    const promptCandidates = activeTab === ROLE_TAB
      ? rolePromptOptions
      : prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === requestPromptCategory);
    const isPromptDisabledForRequest = activeTab === SETTING_TAB
      ? outlineSettingScope !== 'character' && getActiveSettingLinkSource() === 'current'
      : Boolean(activeTabConfig.promptDisabled);
    const selectedPrompt = isPromptDisabledForRequest
      ? null
      : promptCandidates.find((prompt) => prompt.id === activeTabConfig.promptId) ?? promptCandidates[0] ?? null;
    const baseModelPrompt = isPromptDisabledForRequest
      ? ''
      : selectedPrompt?.content ?? `你是${activeTab}生成助手。请根据用户输入生成清晰、可编辑的中文内容。`;
    const modelPrompt = activeTab === SETTING_TAB
      ? ''
      : activeTab === BRAINSTORM_TAB
        ? [baseModelPrompt, BRAINSTORM_OUTPUT_ONLY_INSTRUCTION].filter(Boolean).join('\n\n')
        : baseModelPrompt;
    const linkedSettingContext = getActiveLinkedSettingSnapshot();
    const hasLinkedSettingContext = activeTab === SETTING_TAB && Boolean(linkedSettingContext.text.trim());
    const hasLinkedBrainstorm = hasLinkedSettingContext && linkedSettingContext.source === 'brainstorm';
    const linkedSettingContextForAi = formatSettingLinkedContextForAi(linkedSettingContext);
    const settingUserRequirementForAi = formatSettingUserRequirementForAi(text);
    const requestText = activeTab === SETTING_TAB && overrideText === undefined
      ? buildSettingLibraryRequestText(baseModelPrompt, text)
      : text;
    return {
      selectedModel,
      selectedPrompt,
      modelPrompt,
      requestText,
      log: {
        createdAt: new Date().toLocaleString('zh-CN'),
        tab: activeTab,
        modelName: selectedModel?.name ?? '未配置模型',
        promptName: isPromptDisabledForRequest ? '已禁用提示词' : selectedPrompt?.name ?? '默认提示词',
        hasLinkedBrainstorm,
        linkedBrainstormTitle: hasLinkedBrainstorm ? linkedSettingContext.title : '',
        visibleUserText: text,
        systemPrompt: activeTab === SETTING_TAB ? baseModelPrompt : modelPrompt,
        userContent: activeTab === SETTING_TAB ? settingUserRequirementForAi : requestText,
        contextTitle: hasLinkedSettingContext ? linkedSettingContext.title : '',
        contextText: hasLinkedSettingContext ? linkedSettingContextForAi : '',
        contextWordCount: countTextWords(hasLinkedSettingContext ? linkedSettingContext.text : ''),
      } satisfies LibraryAiRequestLog,
    };
  };

  const sendLibraryAiMessage = async (
    overrideText?: string,
    options: { visibleText?: string; previewCount?: number } = {},
  ) => {
    const text = (overrideText ?? aiInput).trim();
    if (isLibraryAiLoading || (!text && activeTab !== SETTING_TAB)) return;
    const { selectedModel, modelPrompt, requestText, log } = buildLibraryAiRequestPayload(text, overrideText);
    if (!selectedModel) {
      setAiOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
      return;
    }
    libraryAiAutoScrollRef.current = true;
    setLastLibraryAiRequestLog(log);
    libraryAiRequestSeqRef.current += 1;
    const targetTab = activeTab;
    const targetBrainstormSessionId = targetTab === BRAINSTORM_TAB ? activeBrainstormAiSessionId : undefined;
    const targetBrainstormPreviewCount = targetTab === BRAINSTORM_TAB
      ? options.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)
      : undefined;
    setIsLibraryAiLoading(true);
    if (overrideText === undefined) setAiInput('');
    if (targetTab === BRAINSTORM_TAB) {
      setAiResult('');
      updateActiveBrainstormAiSession({
        previewTitles: [],
        previewDrafts: [],
        previewSelectedIndexes: undefined,
        previewCount: targetBrainstormPreviewCount,
      });
    }
    const visibleUserText = (options.visibleText ?? text).trim();
    const pendingOutput = `${aiOutput.trim() ? `${aiOutput.trim()}\n\n` : ''}[[USER]]\n${visibleUserText}\n\n[[AI]]\n正在生成...`;
    const replacePendingOutput = (content: string) => (
      pendingOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, `[[AI]]\n${content}`)
    );
    setAiOutput(pendingOutput);
    const shouldStream = targetTab === SETTING_TAB || (targetTab === BRAINSTORM_TAB && brainstormStreamEnabled);
    const shouldGenerateBrainstormSequentially = targetTab === BRAINSTORM_TAB
      && typeof targetBrainstormPreviewCount === 'number'
      && targetBrainstormPreviewCount > 1;
    const task = startBackgroundAiTask({
      kind: targetTab === BRAINSTORM_TAB ? 'brainstorm' : 'outline',
      title: `${targetTab}生成`,
      input: requestText,
      initialOutput: pendingOutput,
      progressLabel: '正在生成',
      meta: {
        target: 'workbenchLibraryAi',
        storageKey,
        tab: targetTab,
        sessionId: targetBrainstormSessionId ?? null,
      },
      runner: async ({ signal, emit }) => {
      let content = '';
      try {
        if (shouldGenerateBrainstormSequentially) {
          const completedItems: string[] = [];
          for (let index = 1; index <= targetBrainstormPreviewCount; index += 1) {
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            let streamedContent = '';
            const itemRequestText = buildSequentialBrainstormRequestText(requestText, index, targetBrainstormPreviewCount, completedItems);
            emit(replacePendingOutput(formatSequentialBrainstormOutput(completedItems, index, '正在生成...')), { replace: true });
            const itemContent = await callModelStream({
              model: selectedModel,
              prompt: modelPrompt,
              userContent: itemRequestText,
              recordType: 'generate',
              signal,
              timeoutMs: LIBRARY_AI_TIMEOUT_MS,
              onChunk: (chunk) => {
                streamedContent += chunk;
                const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());
                emit(
                  replacePendingOutput(formatSequentialBrainstormOutput(
                    completedItems,
                    index,
                    brainstormStreamDisplay || '正在生成...',
                  )),
                  { replace: true },
                );
              },
            });
            const itemDisplayContent = getBrainstormDisplayContent(itemContent, itemRequestText);
            completedItems.push(stripAiThinkingBlock(itemDisplayContent));
            emit(replacePendingOutput(formatSequentialBrainstormOutput(completedItems)), { replace: true });
          }
          return replacePendingOutput(formatSequentialBrainstormOutput(completedItems));
        }
        if (shouldStream) {
        let streamedContent = '';
        let reasoningContent = '';
        const streamStartedAt = performance.now();
        const getThinkingSeconds = () => Math.max(1, Math.round((performance.now() - streamStartedAt) / 1000));
        content = await callModelStream({
          model: selectedModel,
          prompt: modelPrompt,
          userContent: requestText,
          recordType: 'generate',
          signal,
          timeoutMs: LIBRARY_AI_TIMEOUT_MS,
          onChunk: (chunk) => {
            streamedContent += chunk;
            const brainstormStreamDisplay = stripBrainstormRequestHeader(streamedContent.trimStart());
            emit(replacePendingOutput(formatAiThinkingResponse(
              targetTab === BRAINSTORM_TAB ? brainstormStreamDisplay || '正在生成...' : streamedContent || '正在生成...',
              reasoningContent,
              getThinkingSeconds(),
              false,
            )), { replace: true });
          },
          onReasoning: (chunk) => {
            if (streamedContent) return;
            reasoningContent += chunk;
            const temporaryOutput = formatAiThinkingResponse('', reasoningContent, getThinkingSeconds(), false);
            emit(replacePendingOutput(temporaryOutput), { replace: true });
          },
        });
        if (reasoningContent.trim()) {
          content = formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true);
        }
        } else {
        content = await callModel({
          model: selectedModel,
          prompt: modelPrompt,
          userContent: requestText,
          recordType: 'generate',
          signal,
          timeoutMs: LIBRARY_AI_TIMEOUT_MS,
        });
        }
        const displayContent = targetTab === BRAINSTORM_TAB
        ? getBrainstormDisplayContent(content, requestText)
        : content;
        return replacePendingOutput(displayContent);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          const message = error instanceof Error ? error.message : '模型请求失败。';
          emit(replacePendingOutput(`【错误】${message}`), { replace: true, progressLabel: '失败' });
        }
        throw error;
      }
      },
    });
    if (targetTab === BRAINSTORM_TAB && targetBrainstormSessionId) {
      updateBrainstormAiSession(targetBrainstormSessionId, {
        output: pendingOutput,
        result: '',
        backgroundAiTaskId: task.id,
        previewCount: targetBrainstormPreviewCount,
        previewTitles: [],
        previewDrafts: [],
        previewSelectedIndexes: undefined,
      });
    } else {
      updateTabConfig(targetTab, { aiOutput: pendingOutput, libraryAiTaskId: task.id });
    }
  };

  const stopLibraryAiMessage = () => {
    const taskId = activeTab === BRAINSTORM_TAB
      ? activeBrainstormAiSession?.backgroundAiTaskId
      : activeTabConfig.libraryAiTaskId;
    if (taskId) stopBackgroundAiTask(taskId);
    setIsLibraryAiLoading(false);
    setAiOutput(aiOutput.replace(/\[\[AI\]\]\n正在生成\.\.\.$/, '[[AI]]\n已暂停'));
  };

  const clearLibraryAiDialog = () => {
    if (activeTab === BRAINSTORM_TAB) {
      libraryAiRequestSeqRef.current += 1;
      if (activeBrainstormAiSession?.backgroundAiTaskId) {
        stopBackgroundAiTask(activeBrainstormAiSession.backgroundAiTaskId);
      }
      setIsLibraryAiLoading(false);
      updateActiveBrainstormAiSession({
        input: '',
        output: '',
        result: '',
        backgroundAiTaskId: undefined,
        previewCount: undefined,
      });
      updateActiveBrainstormAiSession({ previewTitles: [], previewDrafts: [], previewSelectedIndexes: undefined });
      return;
    }
    libraryAiRequestSeqRef.current += 1;
    if (activeTabConfig.libraryAiTaskId) stopBackgroundAiTask(activeTabConfig.libraryAiTaskId);
    setIsLibraryAiLoading(false);
    setTabConfigs((prev) => {
      const currentConfig = prev[activeTab] ?? {};
      const nextConfig: LibraryTabConfig = {
        ...currentConfig,
        aiInput: '',
        aiOutput: '',
        aiResult: '',
        libraryAiTaskId: undefined,
      };
      delete nextConfig.aiSessions;
      delete nextConfig.activeAiSessionId;
      const next = {
        ...prev,
        [activeTab]: nextConfig,
      };
      localStorage.setItem(getTabConfigsStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
  };

  const clearBrainstormOutputArea = () => {
    if (activeTab !== BRAINSTORM_TAB) return;
    libraryAiRequestSeqRef.current += 1;
    if (activeBrainstormAiSession?.backgroundAiTaskId) {
      stopBackgroundAiTask(activeBrainstormAiSession.backgroundAiTaskId);
    }
    setIsLibraryAiLoading(false);
    updateActiveBrainstormAiSession({
      output: '',
      result: '',
      backgroundAiTaskId: undefined,
      previewCount: undefined,
      previewTitles: [],
      previewDrafts: [],
      previewSelectedIndexes: undefined,
    });
  };

  const copyBrainstormOutputArea = () => {
    if (activeTab !== BRAINSTORM_TAB) return;
    const outputText = stripAiThinkingBlock(activeBrainstormAiSession?.output ?? activeTabConfig.aiOutput ?? activeTabConfig.aiResult ?? '').trim();
    if (!outputText) return;
    void navigator.clipboard.writeText(outputText);
  };

  const handleLibraryAiInputKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    void sendLibraryAiMessage();
  };

  const confirmBrainstormGenerate = () => {
    if (!brainstormGenerateDraft) return;
    const promptText = buildBrainstormPromptFromQuestions(brainstormGenerateDraft);
    const visibleText = stripBrainstormRequestHeader(promptText);
    const previewCount = getBrainstormOutputCount(brainstormGenerateDraft.brainstormCount);
    setBrainstormGenerateDraft(null);
    void sendLibraryAiMessage(promptText, { visibleText, previewCount });
  };

  const addRoleTypeByName = (name: string) => {
    const type = normalizeWorkbenchRoleType(name);
    if (!type) return;
    setCustomRoleTypes((prev) => {
      if (prev.includes(type) || DEFAULT_ROLE_TYPES.includes(type)) return prev;
      const next = [...prev, type];
      localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(next));
      return next;
    });
    setExpandedRoleTypes((prev) => new Set(prev).add(type));
  };

  const addRoleType = () => {
    addRoleTypeByName(roleTypeDraft);
    setRoleTypeDraft('');
  };

  const getDefaultRoleCreateType = () => (
    DEFAULT_ROLE_TYPES.find((type) => canCreateWorkbenchRoleInType(
      roleEntries.map((entry) => parseRoleContent(entry.content).type),
      type,
    )) ?? DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE
  );

  const addRole = (type = getDefaultRoleCreateType(), options: { switchToRoleTab?: boolean; title?: string } = {}) => {
    const normalizedType = normalizeWorkbenchRoleType(type);
    if (!canCreateWorkbenchRoleInType(roleEntries.map((entry) => parseRoleContent(entry.content).type), normalizedType)) return;
    const title = options.title?.trim() || roleNameDraft.trim() || '新建角色';
    const entry = createWorkbenchLibraryEntry(ROLE_TAB, title);
    const stateSettings = createEmptyRoleStateSettings();
    const roleEntry = {
      ...entry,
      content: stringifyRoleContent({
        type: normalizedType,
        lifeStatus: '存活',
        baseSetting: '',
        relationship: '',
        stateSettings,
        personality: '',
        background: '',
        status: '',
        history: [],
      }),
    };
    persist([roleEntry, ...entries]);
    if (options.switchToRoleTab !== false) setRememberedActiveTab(ROLE_TAB);
    setSelectedIdForTab(ROLE_TAB, roleEntry.id);
    setExpandedRoleTypes((prev) => new Set(prev).add(normalizedType));
    if (options.title === undefined) setRoleNameDraft('');
  };

  const updateEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    persist(entries.map((entry) => (
      entry.id === id
        ? (() => {
          const nextUpdates = { ...updates };
          if (nextUpdates.title !== undefined && isLockedDefaultSettingEntry(entry)) {
            delete nextUpdates.title;
          }
          if (nextUpdates.title !== undefined && nextUpdates.content === undefined && isSettingLikeTab(entry.tab)) {
            const setting = parseSettingContent(entry.content);
            const fieldSet = getStructuredSettingFieldSet(entry, setting);
            if (fieldSet && setting.structuredFieldSetId !== fieldSet.id) {
              nextUpdates.content = stringifySettingContent({ ...setting, structuredFieldSetId: fieldSet.id });
            }
          }
          if (nextUpdates.content !== undefined && isLockedDefaultSettingEntry(entry)) {
            const currentSetting = parseSettingContent(entry.content);
            const nextSetting = parseSettingContent(nextUpdates.content);
            nextUpdates.content = stringifySettingContent({
              ...nextSetting,
              type: currentSetting.type,
              lockedDefaultEntryId: currentSetting.lockedDefaultEntryId ?? getDefaultWorkSettingEntryId(currentSetting.type, entry.title),
            });
          }
          return { ...entry, ...nextUpdates, updatedAt: new Date().toLocaleString('zh-CN') };
        })()
        : entry
    )));
  };

  const createEditableSettingEntry = (updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
    const title = updates.title?.trim() || `新建${activeTab}`;
    const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();
    const defaultType = activeTab === SETTING_TAB ? selectedSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE : UNCATEGORIZED_TYPE;
    const content = updates.content ?? stringifySettingContent({ type: defaultType, body: '' });
    const entry = {
      ...createWorkbenchLibraryEntry(activeTab, title, content),
      content,
    };
    persist([entry, ...entries]);
    setRememberedActiveTab(activeTab);
    setSelectedIdForTab(activeTab, entry.id);
    if (isSettingLikeTab(activeTab)) {
      setExpandedSettingTypes((prev) => new Set(prev).add(parseSettingContent(content).type || UNCATEGORIZED_TYPE));
    }
    return entry;
  };

  const updateRole = (updates: Partial<RoleContent>) => {
    if (!selectedEntry || !selectedRole) return;
    const normalizedUpdates = {
      ...updates,
      ...(updates.type ? { type: normalizeWorkbenchRoleType(updates.type) } : {}),
    };
    if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(selectedRole.type, normalizedUpdates.type)) return;
    const nextType = normalizeWorkbenchRoleType(normalizedUpdates.type ?? selectedRole.type);
    if (isMaleProtagonistRoleType(nextType)) {
      normalizedUpdates.lifeStatus = '存活';
    }
    if (normalizedUpdates.type && !canCreateWorkbenchRoleInType(
      roleEntries
        .filter((entry) => entry.id !== selectedEntry.id)
        .map((entry) => parseRoleContent(entry.content).type),
      normalizedUpdates.type,
    )) return;
    const changed = Object.entries(normalizedUpdates).some(([key, value]) => (
      selectedRole[key as keyof RoleContent] !== value
    ));
    if (!changed) return;
    const history = appendRoleHistory(selectedRole.history, createRoleHistoryVersion(selectedEntry, selectedRole));
    updateEntry(selectedEntry.id, {
      content: stringifyRoleContent({ ...selectedRole, ...normalizedUpdates, history }),
    });
  };

  const updateSelectedRoleTitle = (title: string) => {
    if (!selectedEntry || !selectedRole || selectedEntry.title === title) return;
    const history = appendRoleHistory(selectedRole.history, createRoleHistoryVersion(selectedEntry, selectedRole));
    updateEntry(selectedEntry.id, {
      title,
      content: stringifyRoleContent({ ...selectedRole, history }),
    });
  };

  const moveLibraryEntryToType = (entryId: string, targetTab: string, targetType: string) => {
    const normalizedTargetTab = normalizeTabName(targetTab);
    const draggedEntry = entries.find((entry) => entry.id === entryId);
    if (!draggedEntry || draggedEntry.tab !== normalizedTargetTab) return;

    let nextDraggedEntry = draggedEntry;
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(draggedEntry.content);
      if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;
      if (!canCreateWorkbenchRoleInType(
        entries
          .filter((item) => item.id !== draggedEntry.id && item.tab === ROLE_TAB)
          .map((item) => parseRoleContent(item.content).type),
        targetType,
      )) return;
      if (role.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifyRoleContent({
            ...role,
            type: targetType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(draggedEntry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    } else if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(draggedEntry.content);
      if (setting.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    }

    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    const targetTypeLastIndex = nextEntries.reduce((lastIndex, entry, index) => {
      if (entry.tab !== normalizedTargetTab) return lastIndex;
      if (normalizedTargetTab === ROLE_TAB) {
        return parseRoleContent(entry.content).type === targetType ? index : lastIndex;
      }
      if (isSettingLikeTab(normalizedTargetTab)) {
        return parseSettingContent(entry.content).type === targetType ? index : lastIndex;
      }
      return lastIndex;
    }, -1);
    if (targetTypeLastIndex >= 0) {
      nextEntries.splice(targetTypeLastIndex + 1, 0, nextDraggedEntry);
    } else {
      const targetTabLastIndex = nextEntries.reduce((lastIndex, entry, index) => (
        entry.tab === normalizedTargetTab ? index : lastIndex
      ), -1);
      nextEntries.splice(targetTabLastIndex + 1, 0, nextDraggedEntry);
    }
    persist(nextEntries);
    if (normalizedTargetTab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(targetType));
      return;
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(targetType));
  };

  const createLibraryEntryPreviewForType = (
    entry: WorkbenchLibraryEntry,
    targetTab: string,
    targetType: string,
  ) => {
    const normalizedTargetTab = normalizeTabName(targetTab);
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(entry.content);
      return {
        ...entry,
        content: stringifyRoleContent({ ...role, type: targetType }),
      };
    }
    if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(entry.content);
      return {
        ...entry,
        content: stringifySettingContent({ ...setting, type: targetType }),
      };
    }
    return entry;
  };

  const getPreviewedLibraryGroupEntries = (
    groupEntries: WorkbenchLibraryEntry[],
    tab: string,
    type: string,
  ) => {
    if (!libraryEntryDropPreview || libraryEntryDropPreview.tab !== tab) return groupEntries;
    const draggedEntry = entries.find((entry) => entry.id === libraryEntryDropPreview.entryId);
    if (!draggedEntry || draggedEntry.tab !== tab) return groupEntries;

    const groupWithoutDraggedEntry = groupEntries.filter((entry) => entry.id !== draggedEntry.id);
    if (libraryEntryDropPreview.type !== type) {
      return groupWithoutDraggedEntry.length === groupEntries.length ? groupEntries : groupWithoutDraggedEntry;
    }

    const previewEntry = createLibraryEntryPreviewForType(draggedEntry, tab, type);
    const nextEntries = [...groupWithoutDraggedEntry];
    if (libraryEntryDropPreview.mode === 'target-position' && libraryEntryDropPreview.targetEntryId) {
      const targetIndex = groupEntries.findIndex((entry) => entry.id === libraryEntryDropPreview.targetEntryId);
      const insertIndex = targetIndex >= 0 ? Math.min(targetIndex, nextEntries.length) : nextEntries.length;
      nextEntries.splice(insertIndex, 0, previewEntry);
      return nextEntries;
    }
    nextEntries.push(previewEntry);
    return nextEntries;
  };

  const getLibraryEntriesForType = (tab: string, type: string) => {
    const normalizedTab = normalizeTabName(tab);
    return entries.filter((entry) => {
      if (entry.tab !== normalizedTab) return false;
      if (normalizedTab === ROLE_TAB) return parseRoleContent(entry.content).type === type;
      if (isSettingLikeTab(normalizedTab)) return parseSettingContent(entry.content).type === type;
      return false;
    });
  };

  const getLibraryEntryTargetIdAtPreviewIndex = (
    targetTab: string,
    targetType: string,
    previewIndex: number,
  ) => {
    const groupEntries = getLibraryEntriesForType(targetTab, targetType);
    if (!Number.isInteger(previewIndex) || groupEntries.length === 0) return null;
    const targetIndex = Math.max(0, Math.min(previewIndex, groupEntries.length - 1));
    return groupEntries[targetIndex]?.id ?? null;
  };

  const moveLibraryEntryBefore = (
    entryId: string,
    targetEntryId: string,
    targetTab: string,
    targetType: string,
  ) => {
    if (!entryId || entryId === targetEntryId) return;
    const normalizedTargetTab = normalizeTabName(targetTab);
    const draggedEntry = entries.find((entry) => entry.id === entryId);
    const targetEntry = entries.find((entry) => entry.id === targetEntryId);
    if (!draggedEntry || !targetEntry || draggedEntry.tab !== normalizedTargetTab || targetEntry.tab !== normalizedTargetTab) return;

    let nextDraggedEntry = draggedEntry;
    if (normalizedTargetTab === ROLE_TAB) {
      const role = parseRoleContent(draggedEntry.content);
      if (role.type !== targetType) {
        if (isMaleProtagonistRoleTypeChangeLocked(role.type, targetType)) return;
        if (!canCreateWorkbenchRoleInType(
          entries
            .filter((entry) => entry.id !== draggedEntry.id && entry.tab === ROLE_TAB)
            .map((entry) => parseRoleContent(entry.content).type),
          targetType,
        )) return;
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifyRoleContent({
            ...role,
            type: targetType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(draggedEntry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    } else if (isSettingLikeTab(normalizedTargetTab)) {
      const setting = parseSettingContent(draggedEntry.content);
      if (setting.type !== targetType) {
        nextDraggedEntry = {
          ...draggedEntry,
          content: stringifySettingContent({ ...setting, type: targetType }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }
    }

    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    const targetIndex = entries.findIndex((entry) => entry.id === targetEntryId);
    if (targetIndex < 0) return;
    nextEntries.splice(Math.min(targetIndex, nextEntries.length), 0, nextDraggedEntry);
    persist(nextEntries);
    if (normalizedTargetTab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(targetType));
      return;
    }
    setExpandedSettingTypes((prev) => new Set(prev).add(targetType));
  };

  const commitLibraryEntryDropPreview = (preview: LibraryEntryDropPreviewState) => {
    if (!preview) return;
    if (preview.mode === 'group-end') {
      moveLibraryEntryToType(preview.entryId, preview.tab, preview.type);
      return;
    }
    if (!preview.targetEntryId) return;
    const targetEntry = entries.find((entry) => entry.id === preview.targetEntryId);
    if (!targetEntry) return;
    moveLibraryEntryBefore(preview.entryId, preview.targetEntryId, targetEntry.tab, preview.type);
  };

  const handleLibraryEntryDragStart = (
    event: ReactDragEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    libraryDropHandledRef.current = false;
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry({ entryId: entry.id, tab: entry.tab, type });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', entry.id);
  };

  const beginLibraryEntryPointerDrag = (
    event: ReactPointerEvent<HTMLElement>,
    entry: WorkbenchLibraryEntry,
    type: string,
  ) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    const nestedButton = target.closest('button');
    if (nestedButton && nestedButton !== event.currentTarget) return;
    libraryEntryPointerDragRef.current?.cleanup();
    const dragElement = event.currentTarget;
    const pointerId = event.pointerId;
    const activationTimer = window.setTimeout(() => {
      const pointerDrag = libraryEntryPointerDragRef.current;
      if (pointerDrag?.pointerId === pointerId) pointerDrag.armed = true;
    }, LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DELAY_MS);
    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      updateLibraryEntryPointerPreviewAt(moveEvent.clientX, moveEvent.clientY);
      if (libraryEntryPointerDragRef.current?.active) moveEvent.preventDefault();
    };
    const handleWindowPointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      finishLibraryEntryPointerDragById(pointerId);
    };
    window.addEventListener('pointermove', handleWindowPointerMove, { capture: true });
    window.addEventListener('pointerup', handleWindowPointerEnd, { capture: true });
    window.addEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
    libraryEntryPointerDragRef.current = {
      entryId: entry.id,
      tab: entry.tab,
      type,
      pointerId,
      element: dragElement,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      armed: false,
      activationTimer,
      lastPreviewX: event.clientX,
      lastPreviewY: event.clientY,
      lastPreviewTargetKey: null,
      cleanup: () => {
        window.clearTimeout(activationTimer);
        window.removeEventListener('pointermove', handleWindowPointerMove, { capture: true });
        window.removeEventListener('pointerup', handleWindowPointerEnd, { capture: true });
        window.removeEventListener('pointercancel', handleWindowPointerEnd, { capture: true });
      },
    };
    try {
      dragElement.setPointerCapture(pointerId);
    } catch {
      // Pointer capture is a drag nicety; the document fallback below still works.
    }
  };

  const updateLibraryEntryPointerPreviewAt = (clientX: number, clientY: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag) return;
    const distance = Math.hypot(clientX - pointerDrag.startX, clientY - pointerDrag.startY);
    if (!pointerDrag.active && !pointerDrag.armed) return;
    if (!pointerDrag.active && distance < LIBRARY_ENTRY_POINTER_DRAG_ACTIVATION_DISTANCE) return;
    if (!pointerDrag.active) {
      pointerDrag.active = true;
      libraryPointerSuppressClickRef.current = true;
      libraryDropHandledRef.current = false;
      setDraggingLibraryEntry({ entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: pointerDrag.type });
    }

    const hoverElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const hoverEntry = hoverElement?.closest('[data-library-entry-id]') as HTMLElement | null;
    if (hoverEntry?.dataset.libraryEntryId && hoverEntry.dataset.libraryEntryTab === pointerDrag.tab) {
      const targetType = hoverEntry.dataset.libraryEntryType || pointerDrag.type;
      const previewIndex = Number(hoverEntry.dataset.libraryEntryPreviewIndex);
      const targetEntryId = getLibraryEntryTargetIdAtPreviewIndex(pointerDrag.tab, targetType, previewIndex)
        ?? hoverEntry.dataset.libraryEntryId;
      const targetKey = `entry:${targetEntryId}`;
      if (
        targetEntryId === pointerDrag.entryId
        && (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey)
      ) return;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId
          && current.tab === pointerDrag.tab
          && current.type === targetType
          && current.mode === 'target-position'
          && current.targetEntryId === targetEntryId
          ? current
          : {
            entryId: pointerDrag.entryId,
            tab: pointerDrag.tab,
            type: targetType,
            mode: 'target-position',
            targetEntryId,
          },
      );
      return;
    }

    const hoverGroup = hoverElement?.closest('[data-library-group-type]') as HTMLElement | null;
    if (hoverGroup?.dataset.libraryGroupTab === pointerDrag.tab) {
      if (!isLibraryPointerPastGroupEntries(hoverGroup, pointerDrag, clientY)) return;
      const targetType = hoverGroup.dataset.libraryGroupType || pointerDrag.type;
      const targetKey = `group:${targetType}`;
      if (hasLibraryEntryPointerRetargetedTooSoon(pointerDrag, targetKey, clientX, clientY)) return;
      rememberLibraryEntryPointerPreviewTarget(pointerDrag, targetKey, clientX, clientY);
      const current = libraryEntryDropPreviewRef.current;
      setLibraryDropTarget((previous) => (
        previous?.tab === pointerDrag.tab && previous.type === targetType
          ? previous
          : { tab: pointerDrag.tab, type: targetType }
      ));
      setLibraryEntryDropPreviewState(
        current?.entryId === pointerDrag.entryId
          && current.tab === pointerDrag.tab
          && current.type === targetType
          && current.mode === 'group-end'
          ? current
          : { entryId: pointerDrag.entryId, tab: pointerDrag.tab, type: targetType, mode: 'group-end' },
      );
    }
  };

  const updateLibraryEntryPointerPreview = (event: ReactPointerEvent<HTMLElement>) => {
    updateLibraryEntryPointerPreviewAt(event.clientX, event.clientY);
    if (libraryEntryPointerDragRef.current?.active) event.preventDefault();
  };

  const finishLibraryEntryPointerDragById = (pointerId: number) => {
    const pointerDrag = libraryEntryPointerDragRef.current;
    if (!pointerDrag || pointerDrag.pointerId !== pointerId) return;
    libraryEntryPointerDragRef.current = null;
    pointerDrag.cleanup();
    try {
      pointerDrag.element.releasePointerCapture(pointerId);
    } catch {
      // Ignore release failures when capture was not established.
    }
    if (!pointerDrag?.active) return;
    commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    window.setTimeout(() => {
      libraryPointerSuppressClickRef.current = false;
    }, 0);
  };

  const finishLibraryEntryPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    finishLibraryEntryPointerDragById(event.pointerId);
  };

  const handleLibraryCategoryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
    shouldPreviewGroupEnd = false,
  ) => {
    if (!draggingLibraryEntry || draggingLibraryEntry.tab !== tab) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setLibraryDropTarget((current) => (
      current?.tab === tab && current.type === type ? current : { tab, type }
    ));
    if (!shouldPreviewGroupEnd) return;
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId
        && current.tab === tab
        && current.type === type
        && current.mode === 'group-end'
        ? current
        : { entryId: draggingLibraryEntry.entryId, tab, type, mode: 'group-end' },
    );
  };

  const handleLibraryCategoryDragLeave = (event: ReactDragEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) return;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };

  const handleLibraryCategoryDrop = (
    event: ReactDragEvent<HTMLElement>,
    tab: string,
    type: string,
  ) => {
    event.preventDefault();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== tab) return;
    moveLibraryEntryToType(entryId, tab, type);
  };

  const handleLibraryEntryDragOver = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    if (!draggingLibraryEntry) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    if (draggingLibraryEntry.tab !== targetEntry.tab) return;
    const targetEntryId = typeof previewIndex === 'number'
      ? getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id
      : targetEntry.id;
    if (draggingLibraryEntry.entryId === targetEntryId && !libraryEntryDropPreviewRef.current) return;
    setLibraryDropTarget(null);
    const current = libraryEntryDropPreviewRef.current;
    setLibraryEntryDropPreviewState(
      current?.entryId === draggingLibraryEntry.entryId
        && current.tab === targetEntry.tab
        && current.type === targetType
        && current.mode === 'target-position'
        && current.targetEntryId === targetEntryId
        ? current
        : {
          entryId: draggingLibraryEntry.entryId,
          tab: targetEntry.tab,
          type: targetType,
          mode: 'target-position',
          targetEntryId,
        },
    );
  };

  const handleLibraryEntryDrop = (
    event: ReactDragEvent<HTMLElement>,
    targetEntry: WorkbenchLibraryEntry,
    targetType: string,
    previewIndex?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const entryId = draggingLibraryEntry?.entryId || event.dataTransfer.getData('text/plain');
    const currentPreview = libraryEntryDropPreviewRef.current;
    libraryDropHandledRef.current = true;
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
    setDraggingLibraryEntry(null);
    if (!entryId || draggingLibraryEntry?.tab !== targetEntry.tab) return;
    if (currentPreview?.entryId === entryId) {
      commitLibraryEntryDropPreview(currentPreview);
      return;
    }
    const targetEntryId = typeof previewIndex === 'number'
      ? getLibraryEntryTargetIdAtPreviewIndex(targetEntry.tab, targetType, previewIndex) ?? targetEntry.id
      : targetEntry.id;
    moveLibraryEntryBefore(entryId, targetEntryId, targetEntry.tab, targetType);
  };

  const handleLibraryEntryDragEnd = () => {
    if (!libraryDropHandledRef.current) commitLibraryEntryDropPreview(libraryEntryDropPreviewRef.current);
    libraryDropHandledRef.current = false;
    setDraggingLibraryEntry(null);
    setLibraryDropTarget(null);
    setLibraryEntryDropPreviewState(null);
  };

  const deleteEntry = (id: string) => {
    const target = entries.find((entry) => entry.id === id);
    if (target && isLockedDefaultSettingEntry(target)) return;
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) return;
    if (target?.tab === BRAINSTORM_TAB) {
      persist(entries.filter((entry) => entry.id !== id));
      persistBrainstormRecycle([
        { ...target, deletedAt: new Date().toISOString(), updatedAt: new Date().toLocaleString('zh-CN') },
        ...brainstormRecycleEntries.filter((entry) => entry.id !== id),
      ]);
      if (selectedId === id) setSelectedId(null);
      return;
    }
    persist(entries.filter((entry) => entry.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const restoreBrainstormEntry = (id: string) => {
    const target = brainstormRecycleEntries.find((entry) => entry.id === id);
    if (!target) return;
    const { deletedAt: _deletedAt, ...restored } = target;
    const nextEntry = { ...restored, tab: BRAINSTORM_TAB, updatedAt: new Date().toLocaleString('zh-CN') };
    persistBrainstormRecycle(brainstormRecycleEntries.filter((entry) => entry.id !== id));
    persist([nextEntry, ...entries.filter((entry) => entry.id !== id)]);
    setRememberedActiveTab(BRAINSTORM_TAB);
    setSelectedIdForTab(BRAINSTORM_TAB, nextEntry.id);
    setExpandedSettingTypes((prev) => new Set(prev).add(BRAINSTORM_TYPE));
  };

  const permanentlyDeleteBrainstormEntry = (id: string) => {
    const target = brainstormRecycleEntries.find((entry) => entry.id === id);
    if (!target) return;
    persistBrainstormRecycle(brainstormRecycleEntries.filter((entry) => entry.id !== id));
  };

  const clearBrainstormRecycle = () => {
    if (brainstormRecycleEntries.length === 0) return;
    persistBrainstormRecycle([]);
    setIsClearBrainstormRecycleConfirmOpen(false);
  };

  const confirmDeleteEntry = (entry: Pick<WorkbenchLibraryEntry, 'id' | 'title' | 'tab'>) => {
    const target = entries.find((item) => item.id === entry.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      setEntryMenu(null);
      return;
    }
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) {
      setEntryMenu(null);
      return;
    }
    setEntryMenu(null);
    setPendingEntryDelete(entry);
  };

  const handleConfirmDeleteEntry = () => {
    if (!pendingEntryDelete) return;
    const target = entries.find((entry) => entry.id === pendingEntryDelete.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      setPendingEntryDelete(null);
      return;
    }
    if (target?.tab === ROLE_TAB && isMaleProtagonistRoleType(parseRoleContent(target.content).type)) {
      setPendingEntryDelete(null);
      return;
    }
    deleteEntry(pendingEntryDelete.id);
    if (roleHistoryEntryId === pendingEntryDelete.id) setRoleHistoryEntryId(null);
    setPendingEntryDelete(null);
  };

  const openCategoryMenu = (event: MouseEvent<HTMLButtonElement>, kind: 'role' | 'setting', type: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (type === UNCATEGORIZED_TYPE) return;
    setEntryMenu(null);
    setEntryMoveMenuOpen(false);
    const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_CATEGORY_CONTEXT_MENU_SIZE);
    setCategoryMenu({ kind, type, x: left, y: top });
  };

  const openEntryMenu = (event: MouseEvent<HTMLElement>, entry: WorkbenchLibraryEntry) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryMenu(null);
    setEntryMoveMenuOpen(false);
    const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, SETTING_ENTRY_CONTEXT_MENU_SIZE);
    setEntryMenu({
      entryId: entry.id,
      title: entry.title,
      tab: entry.tab,
      roleType: entry.tab === ROLE_TAB ? parseRoleContent(entry.content).type : undefined,
      pinnedAt: entry.pinnedAt,
      x: left,
      y: top,
    });
  };

  const deleteRoleType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE || isDefaultWorkbenchRoleType(type)) return;
    const nextCustomTypes = customRoleTypes.filter((item) => item !== type);
    setCustomRoleTypes(nextCustomTypes);
    localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    if (DEFAULT_ROLE_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenRoleTypes, type]));
      setHiddenRoleTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenRoleTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
      localStorage.setItem(getRoleTaxonomyDefaultsVersionStorageKey(storageKey), ROLE_TAXONOMY_DEFAULTS_VERSION);
    }
    setExpandedRoleTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE);
      return next;
    });
    setExpandedSettingTypes((prev) => new Set(prev).add(DEFAULT_ROLE_TYPES[0] ?? UNCATEGORIZED_TYPE));
    persist(entries.filter((entry) => {
      if (entry.tab !== ROLE_TAB) return true;
      const role = parseRoleContent(entry.content);
      return role.type !== type;
    }));
    if (selectedEntry?.tab === ROLE_TAB && selectedRole?.type === type) setSelectedIdForTab(ROLE_TAB, null);
  };

  const deleteSettingType = (type: string) => {
    if (type === UNCATEGORIZED_TYPE) return;
    if (DEFAULT_SETTING_TYPES.includes(type)) return;
    const nextCustomTypes = customSettingTypes.filter((item) => item !== type);
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const { [type]: _deletedSettingTypeDomain, ...nextCustomTypeDomains } = customSettingTypeDomains;
    setCustomSettingTypeDomains(nextCustomTypeDomains);
    localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    if (DEFAULT_SETTING_TYPES.includes(type)) {
      const nextHiddenTypes = Array.from(new Set([...hiddenSettingTypes, type]));
      setHiddenSettingTypes(nextHiddenTypes);
      localStorage.setItem(getHiddenSettingTypesStorageKey(storageKey), JSON.stringify(nextHiddenTypes));
      localStorage.setItem(getSettingTaxonomyDefaultsVersionStorageKey(storageKey), SETTING_TAXONOMY_DEFAULTS_VERSION);
    }
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      next.add(UNCATEGORIZED_TYPE);
      return next;
    });
    persist(entries.filter((entry) => {
      if (!isSettingLikeTab(entry.tab)) return true;
      const setting = parseSettingContent(entry.content);
      return setting.type !== type;
    }));
    if (selectedEntry?.tab === SETTING_TAB && parseSettingContent(selectedEntry.content).type === type) {
      setSelectedIdForTab(SETTING_TAB, null);
    }
  };

  const deleteCategoryFromMenu = () => {
    if (!categoryMenu) return;
    if (categoryMenu.kind === 'role') deleteRoleType(categoryMenu.type);
    else deleteSettingType(categoryMenu.type);
    setCategoryMenu(null);
  };

  const openClearSettingsConfirmFromMenu = (target: ClearSettingsTarget) => {
    setCategoryMenu(null);
    openClearSettingsConfirm(target);
  };

  const createEntryFromCategoryMenu = () => {
    if (!categoryMenu) return;
    if (categoryMenu.kind === 'role') {
      addRole(categoryMenu.type);
    } else {
      addSetting(SETTING_TAB, '', categoryMenu.type);
    }
    setCategoryMenu(null);
  };

  const openSiblingCategoryCreateFromMenu = () => {
    if (!categoryMenu) return;
    setSettingCreateDraft('');
    setSettingCreateTypeDraft('');
    setSettingCreateContextKind(categoryMenu.kind);
    setSettingCreateDialog('category');
    setCategoryMenu(null);
  };

  const openCategoryRenameFromMenu = () => {
    if (!categoryMenu) return;
    setPendingCategoryRename({ kind: categoryMenu.kind, type: categoryMenu.type });
    setCategoryRenameDraft(categoryMenu.type);
    setCategoryMenu(null);
  };

  const closeCategoryRenameDialog = () => {
    setPendingCategoryRename(null);
    setCategoryRenameDraft('');
  };

  const confirmCategoryRename = () => {
    if (!pendingCategoryRename) return;
    const currentType = pendingCategoryRename.type;
    const nextType = pendingCategoryRename.kind === 'role'
      ? normalizeWorkbenchRoleType(categoryRenameDraft)
      : categoryRenameDraft.trim();
    if (!nextType || nextType === currentType || nextType === UNCATEGORIZED_TYPE) {
      closeCategoryRenameDialog();
      return;
    }
    if (pendingCategoryRename.kind === 'role') {
      if (isDefaultWorkbenchRoleType(currentType)) {
        closeCategoryRenameDialog();
        return;
      }
      if (roleTypeOptions.includes(nextType)) return;
      const nextCustomTypes = customRoleTypes.map((type) => (type === currentType ? nextType : type));
      setCustomRoleTypes(nextCustomTypes);
      localStorage.setItem(getRoleTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
      setExpandedRoleTypes((prev) => {
        const next = new Set(prev);
        if (next.delete(currentType)) next.add(nextType);
        return next;
      });
      persist(entries.map((entry) => {
        if (entry.tab !== ROLE_TAB) return entry;
        const role = parseRoleContent(entry.content);
        if (role.type !== currentType) return entry;
        return {
          ...entry,
          content: stringifyRoleContent({
            ...role,
            type: nextType,
            history: appendRoleHistory(role.history, createRoleHistoryVersion(entry, role)),
          }),
          updatedAt: new Date().toLocaleString('zh-CN'),
        };
      }));
      closeCategoryRenameDialog();
      return;
    }
    if (DEFAULT_SETTING_TYPES.includes(currentType)) {
      closeCategoryRenameDialog();
      return;
    }
    if (settingTypeOptions.includes(nextType)) return;
    const nextCustomTypes = customSettingTypes.map((type) => (type === currentType ? nextType : type));
    setCustomSettingTypes(nextCustomTypes);
    localStorage.setItem(getSettingTypesStorageKey(storageKey), JSON.stringify(nextCustomTypes));
    const nextCustomTypeDomains = { ...customSettingTypeDomains };
    if (nextCustomTypeDomains[currentType]) {
      nextCustomTypeDomains[nextType] = nextCustomTypeDomains[currentType];
      delete nextCustomTypeDomains[currentType];
      setCustomSettingTypeDomains(nextCustomTypeDomains);
      localStorage.setItem(getSettingTypeDomainsStorageKey(storageKey), JSON.stringify(nextCustomTypeDomains));
    }
    setExpandedSettingTypes((prev) => {
      const next = new Set(prev);
      if (next.delete(currentType)) next.add(nextType);
      return next;
    });
    persist(entries.map((entry) => {
      if (!isSettingLikeTab(entry.tab)) return entry;
      const setting = parseSettingContent(entry.content);
      if (setting.type !== currentType) return entry;
      return {
        ...entry,
        content: stringifySettingContent({ ...setting, type: nextType }),
        updatedAt: new Date().toLocaleString('zh-CN'),
      };
    }));
    closeCategoryRenameDialog();
  };

  const deleteEntryFromMenu = () => {
    if (!entryMenu) return;
    const targetEntry = entries.find((entry) => entry.id === entryMenu.entryId);
    if (targetEntry && isLockedDefaultSettingEntry(targetEntry)) return;
    if (entryMenu.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? '')) return;
    const target = { id: entryMenu.entryId, title: entryMenu.title, tab: entryMenu.tab };
    setEntryMenu(null);
    confirmDeleteEntry(target);
  };

  const renameEntryFromMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (target && isLockedDefaultSettingEntry(target)) {
      setEntryMenu(null);
      return;
    }
    setPendingEntryRename({ id: entryMenu.entryId, title: entryMenu.title, tab: entryMenu.tab });
    setEntryRenameDraft(entryMenu.title);
    setEntryMenu(null);
  };

  const createEntryFromEntryMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (!target) {
      setEntryMenu(null);
      return;
    }
    if (target.tab === ROLE_TAB) {
      const role = parseRoleContent(target.content);
      addRole(role.type);
    } else if (isSettingLikeTab(target.tab)) {
      const setting = parseSettingContent(target.content);
      addSetting(SETTING_TAB, '', setting.type);
    } else {
      addEntryToTab(target.tab, `新建${target.tab}`);
    }
    setEntryMenu(null);
  };

  const copyEntryFromMenu = () => {
    if (!entryMenu) return;
    const target = entries.find((entry) => entry.id === entryMenu.entryId);
    if (!target) return;
    if (target.tab === ROLE_TAB) {
      const role = parseRoleContent(target.content);
      if (!canCreateWorkbenchRoleInType(roleEntries.map((entry) => parseRoleContent(entry.content).type), role.type)) return;
    }
    const copy = createWorkbenchLibraryEntry(target.tab, `${target.title} 副本`, target.content);
    persist([copy, ...entries]);
    setRememberedActiveTab(target.tab);
    setSelectedIdForTab(target.tab, copy.id);
    if (target.tab === ROLE_TAB) {
      setExpandedRoleTypes((prev) => new Set(prev).add(parseRoleContent(target.content).type));
    } else if (isSettingLikeTab(target.tab)) {
      setExpandedSettingTypes((prev) => new Set(prev).add(parseSettingContent(target.content).type));
    }
    setEntryMenu(null);
  };

  const moveEntryFromMenuToType = (targetType: string) => {
    if (!entryMenu) return;
    moveLibraryEntryToType(entryMenu.entryId, entryMenu.tab, targetType);
    setEntryMenu(null);
    setEntryMoveMenuOpen(false);
  };

  const closeEntryRenameDialog = () => {
    setPendingEntryRename(null);
    setEntryRenameDraft('');
  };

  const confirmEntryRename = () => {
    if (!pendingEntryRename) return;
    const target = entries.find((entry) => entry.id === pendingEntryRename.id);
    if (target && isLockedDefaultSettingEntry(target)) {
      closeEntryRenameDialog();
      return;
    }
    const nextTitle = entryRenameDraft.trim();
    if (!nextTitle) return;
    persist(entries.map((entry) => (
      entry.id === pendingEntryRename.id
        ? { ...entry, title: nextTitle, updatedAt: new Date().toLocaleString('zh-CN') }
        : entry
    )));
    closeEntryRenameDialog();
  };

  const toggleEntryPinnedFromMenu = () => {
    if (!entryMenu || entryMenu.tab !== ROLE_TAB) return;
    if (!shouldShowRolePinAction(entryMenu.roleType)) {
      setEntryMenu(null);
      return;
    }
    const nextPinnedAt = entryMenu.pinnedAt ? undefined : Date.now();
    persist(entries.map((entry) => (
      entry.id === entryMenu.entryId
        ? { ...entry, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
        : entry
    )));
    setEntryMenu(null);
  };

  const toggleRolePinned = (entry: WorkbenchLibraryEntry) => {
    if (entry.tab !== ROLE_TAB) return;
    if (!shouldShowRolePinAction(parseRoleContent(entry.content).type)) return;
    const nextPinnedAt = entry.pinnedAt ? undefined : Date.now();
    persist(entries.map((item) => (
      item.id === entry.id
        ? { ...item, pinnedAt: nextPinnedAt, updatedAt: new Date().toLocaleString('zh-CN') }
        : item
    )));
  };

  const roleEntries = useMemo(() => entries.filter((entry) => entry.tab === ROLE_TAB), [entries]);
  const roleTypeOptions = useMemo(() => {
    const entryTypes = roleEntries.map((entry) => normalizeWorkbenchRoleType(parseRoleContent(entry.content).type)).filter(Boolean);
    const hidden = new Set(hiddenRoleTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_ROLE_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...customRoleTypes.map((type) => normalizeWorkbenchRoleType(type)).filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
      ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && !hidden.has(type)),
    ]));
    return merged;
  }, [customRoleTypes, hiddenRoleTypes, roleEntries]);
  const searchedRoles = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase();
    if (!keyword) return roleEntries;
    return roleEntries.filter((entry) => entry.title.toLowerCase().includes(keyword));
  }, [roleEntries, roleSearch]);

  const groupedRoles = useMemo(() => roleTypeOptions.map((type) => {
    const entriesInType = searchedRoles.filter((entry) => parseRoleContent(entry.content).type === type);
    return {
      type,
      entries: entriesInType
        .map((entry, index) => ({ entry, index }))
        .sort((left, right) => {
          const leftPinned = typeof left.entry.pinnedAt === 'number';
          const rightPinned = typeof right.entry.pinnedAt === 'number';
          if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
          if (leftPinned) return -1;
          if (rightPinned) return 1;
          return left.index - right.index;
        })
        .map(({ entry }) => entry),
    };
  }), [roleTypeOptions, searchedRoles]);
  const settingEntries = useMemo(() => entries.filter((entry) => entry.tab === SETTING_TAB), [entries]);
  const settingTypeOptions = useMemo(() => {
    const entryTypes = settingEntries.map((entry) => parseSettingContent(entry.content).type).filter(Boolean);
    const hidden = new Set(hiddenSettingTypes);
    const merged = Array.from(new Set([
      ...DEFAULT_SETTING_TYPES.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
      ...customSettingTypes.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
      ...entryTypes.filter((type) => type !== UNCATEGORIZED_TYPE && type !== BRAINSTORM_TYPE && !hidden.has(type)),
    ]));
    return merged;
  }, [customSettingTypes, hiddenSettingTypes, settingEntries]);
  const settingImportFormatGuideTabs = useMemo(() => buildSettingImportFormatTabs({
    visibleSettingTypes: settingTypeOptions,
    settingEntries,
    getSettingTypeWorkspaceDomain,
  }), [getSettingTypeWorkspaceDomain, settingEntries, settingTypeOptions]);
  const otherSettingLinkTabs = useMemo<OtherSettingLinkTab[]>(() => {
    const createSettingEntry = (entry: WorkbenchLibraryEntry, tabId: OtherSettingLinkTabId, tabTitle: string): OtherSettingLinkEntry => {
      const setting = parseSettingContent(entry.content);
      const text = getSettingEntryBody(entry);
      return {
        id: `setting:${entry.id}`,
        entryId: entry.id,
        source: 'setting',
        tabId,
        tabTitle,
        groupName: setting.type || UNCATEGORIZED_TYPE,
        title: entry.title,
        type: setting.type || UNCATEGORIZED_TYPE,
        text,
        wordCount: countTextWords(text),
      };
    };
    const createSettingGroups = (tabId: OtherSettingLinkTabId, tabTitle: string, domain: string | null) => (
      settingTypeOptions
        .filter((type) => (domain ? getSettingTypeWorkspaceDomain(type) === domain : !getSettingTypeWorkspaceDomain(type)))
        .map((type) => ({
          name: type,
          entries: settingEntries
            .filter((entry) => parseSettingContent(entry.content).type === type)
            .map((entry) => createSettingEntry(entry, tabId, tabTitle)),
        }))
        .filter((group) => group.entries.length > 0)
    );
    return OTHER_SETTING_LINK_TABS.map((tab): OtherSettingLinkTab => {
      if (tab.id === 'roles') {
        return {
          ...tab,
          groups: groupedRoles
            .map((group) => ({
              name: group.type,
              entries: group.entries.map((entry): OtherSettingLinkEntry => {
                const role = parseRoleContent(entry.content);
                const text = buildRoleReaderContent(entry, role);
                return {
                  id: `role:${entry.id}`,
                  entryId: entry.id,
                  source: 'role',
                  tabId: tab.id,
                  tabTitle: tab.title,
                  groupName: group.type,
                  title: entry.title,
                  type: role.type,
                  text,
                  wordCount: countTextWords(text),
                };
              }),
            }))
            .filter((group) => group.entries.length > 0),
        };
      }
      const domainByTabId: Partial<Record<OtherSettingLinkTabId, string | null>> = {
        work: null,
        factions: 'setting:faction',
        items: 'setting:item',
        monsters: 'setting:monster',
        foreshadow: 'setting:foreshadow',
      };
      return {
        ...tab,
        groups: createSettingGroups(tab.id, tab.title, domainByTabId[tab.id] ?? null),
      };
    });
  }, [getSettingTypeWorkspaceDomain, groupedRoles, settingEntries, settingTypeOptions]);
  const otherSettingLinkFlatEntries = useMemo(() => (
    otherSettingLinkTabs.flatMap((tab) => tab.groups.flatMap((group) => group.entries))
  ), [otherSettingLinkTabs]);
  const activeOtherSettingLinkEntries = useMemo(() => {
    if (!isWorkbenchAssociationRuntimeCurrent(activeTabConfig.associationSessionId)) return [];
    const entryMap = new Map(otherSettingLinkFlatEntries.map((entry) => [entry.id, entry]));
    return normalizeLinkedOtherSettingIds(activeTabConfig.linkedOtherSettingIds)
      .map((id) => entryMap.get(id))
      .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
  }, [activeTabConfig.associationSessionId, activeTabConfig.linkedOtherSettingIds, otherSettingLinkFlatEntries]);
  const deletableRoleEntries = useMemo(() => (
    roleEntries.filter((entry) => !isMaleProtagonistRoleType(parseRoleContent(entry.content).type))
  ), [roleEntries]);
  const deletableSettingEntries = useMemo(() => (
    settingEntries.filter((entry) => !isLockedDefaultSettingEntry(entry))
  ), [settingEntries]);
  const selectedSettingClearDomain = activeTab === SETTING_TAB && outlineSettingScope !== 'character'
    ? getSelectedSettingWorkspaceDomain()
    : null;
  const deletableSettingEntriesForClear = useMemo(() => (
    deletableSettingEntries.filter((entry) => {
      const typeDomain = getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type);
      return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
    })
  ), [deletableSettingEntries, getSettingTypeWorkspaceDomain, selectedSettingClearDomain]);
  const deletableSettingTypes = useMemo(() => (
    settingTypeOptions.filter((type) => {
      if (type === UNCATEGORIZED_TYPE || DEFAULT_SETTING_TYPES.includes(type)) return false;
      const typeDomain = getSettingTypeWorkspaceDomain(type);
      return selectedSettingClearDomain ? typeDomain === selectedSettingClearDomain : !typeDomain;
    })
  ), [getSettingTypeWorkspaceDomain, selectedSettingClearDomain, settingTypeOptions]);
  const clearSettingsTargetMeta: Record<ClearSettingsTarget, ClearSettingsMeta> = {
    settingCategories: {
      label: '设定分组',
      count: deletableSettingTypes.length,
      description: '确定要清空全部自建设定分组吗？默认分组和默认设定条目会保留。',
    },
    settingEntries: {
      label: '设定',
      count: deletableSettingEntriesForClear.length,
      description: `确定要清空全部自建设定吗？当前共有 ${deletableSettingEntriesForClear.length} 条可删除设定会被删除，默认设定条目会保留。`,
    },
    roleCategories: {
      label: '角色分组',
      count: roleTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE && !isDefaultWorkbenchRoleType(type)).length,
      description: `确定要清空全部自建人物分组吗？女主角、重要正派角色、正派配角、重要反派角色、反派配角、龙套角色等默认分组会保留。`,
    },
    roleEntries: {
      label: '角色',
      count: deletableRoleEntries.length,
      description: `确定要清空全部角色吗？当前共有 ${deletableRoleEntries.length} 个可删除角色会被删除，男主角会保留。`,
    },
  };

  const closeClearSettingsConfirm = () => {
    setIsClearSettingsConfirmOpen(false);
    setClearSettingsConfirmStep(1);
  };

  const openClearSettingsConfirm = (target: ClearSettingsTarget) => {
    if (clearSettingsTargetMeta[target].count === 0) return;
    setClearSettingsConfirmTarget(target);
    setClearSettingsConfirmStep(1);
    setIsClearSettingsConfirmOpen(true);
  };

  const confirmClearSettings = () => {
    if (clearSettingsConfirmStep === 1) {
      setClearSettingsConfirmStep(2);
      return;
    }
    if (clearSettingsConfirmTarget === 'settingCategories') clearSettingCategories();
    if (clearSettingsConfirmTarget === 'settingEntries') clearSettingEntries();
    if (clearSettingsConfirmTarget === 'roleCategories') clearRoleCategories();
    if (clearSettingsConfirmTarget === 'roleEntries') clearRoleEntries();
    closeClearSettingsConfirm();
  };

  const renderFieldSizeButton = () => {
    if (!showInlineFieldSizeButton) return null;
    return (
      <button
        type="button"
        onClick={() => setIsFieldSizeSettingsOpen(true)}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 shadow-sm hover:border-[#08AACE] hover:text-[#08AACE]"
        aria-label={`${fieldSizeTabLabel}设置`}
      >
        <Settings className="h-4 w-4" />
        设置
      </button>
    );
  };
  const openLibraryAiLog = (scope: 'library' | 'outline') => {
    setLibraryAiLogScope(scope);
    setIsLibraryAiLogOpen(true);
  };
  const renderLibraryAiLogButton = (
    scope: 'library' | 'outline',
    className = 'h-9 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 shadow-sm hover:border-brand hover:text-brand',
  ) => {
    if (!showInlineFieldSizeButton) return null;
    return (
      <button
        type="button"
        onClick={() => openLibraryAiLog(scope)}
        className={className}
      >
        日志
      </button>
    );
  };
  const renderDetailOutlineFontSizeTool = () => {
    if (activeTab !== DETAIL_OUTLINE_TAB || plotPointStandalone) return null;
    return (
      <FontSizeStepper
        value={detailOutlineFontSize}
        min={DETAIL_OUTLINE_MIN_FONT_SIZE}
        max={DETAIL_OUTLINE_MAX_FONT_SIZE}
        ariaLabel="章纲字号"
        onChange={setDetailOutlineFontSize}
        className="shrink-0"
      />
    );
  };
  const getActiveLibraryFontConfig = () => {
    if (activeTab === BRAINSTORM_TAB) {
      if (activeLibraryFontTarget === 'brainstormPreview') {
        return {
          value: brainstormPreviewFontSize,
          min: BRAINSTORM_PREVIEW_MIN_FONT_SIZE,
          max: BRAINSTORM_PREVIEW_MAX_FONT_SIZE,
          onChange: setBrainstormPreviewFontSize,
          ariaLabel: '脑洞预览字号',
        };
      }
      return {
        value: brainstormOutputFontSize,
        min: BRAINSTORM_OUTPUT_MIN_FONT_SIZE,
        max: BRAINSTORM_OUTPUT_MAX_FONT_SIZE,
        onChange: setBrainstormOutputFontSize,
        ariaLabel: '脑洞输出字号',
      };
    }
    if (activeTab === SETTING_TAB) {
      if (outlineSettingScope === 'character') {
        return {
          value: roleTextFontSize,
          min: ROLE_TEXT_MIN_FONT_SIZE,
          max: ROLE_TEXT_MAX_FONT_SIZE,
          onChange: setRoleTextFontSize,
          ariaLabel: '人物设定字号',
        };
      }
      return {
        value: settingPreviewFontSize,
        min: SETTING_PREVIEW_MIN_FONT_SIZE,
        max: SETTING_PREVIEW_MAX_FONT_SIZE,
        onChange: setSettingPreviewFontSize,
        ariaLabel: '设定预览字号',
      };
    }
    if (activeTab === ROLE_TAB) {
      return {
        value: roleTextFontSize,
        min: ROLE_TEXT_MIN_FONT_SIZE,
        max: ROLE_TEXT_MAX_FONT_SIZE,
        onChange: setRoleTextFontSize,
        ariaLabel: '人物设定字号',
      };
    }
    if (activeTab === DETAIL_OUTLINE_TAB && !plotPointStandalone) {
      return {
        value: detailOutlineFontSize,
        min: DETAIL_OUTLINE_MIN_FONT_SIZE,
        max: DETAIL_OUTLINE_MAX_FONT_SIZE,
        onChange: setDetailOutlineFontSize,
        ariaLabel: '章纲字号',
      };
    }
    return null;
  };
  const renderActiveLibraryFontSizeTool = () => {
    const config = getActiveLibraryFontConfig();
    if (!config) return null;
    return (
      <FontSizeStepper
        value={config.value}
        min={config.min}
        max={config.max}
        onChange={config.onChange}
        ariaLabel={config.ariaLabel}
        className="shrink-0"
      />
    );
  };
  const renderLibraryHeaderFontSizeTool = () => {
    const fontSizeTool = renderActiveLibraryFontSizeTool();
    if (!fontSizeTool) return null;
    if (activeTab !== BRAINSTORM_TAB) return fontSizeTool;
    return (
      <div className="inline-flex shrink-0 items-center gap-2">
        <label
          className="xy-header-stream-tool"
          title={brainstormStreamEnabled ? '关闭流式输出' : '开启流式输出'}
          aria-label={brainstormStreamEnabled ? '关闭流式输出' : '开启流式输出'}
        >
          <span className="xy-stream-toggle-text">流式输出</span>
          <input
            type="checkbox"
            checked={brainstormStreamEnabled}
            onChange={(event) => updateActiveTabConfig({ brainstormStreamEnabled: event.target.checked })}
          />
          <span className="xy-stream-toggle-track">
            <span className="xy-stream-toggle-thumb" />
          </span>
        </label>
        {fontSizeTool}
      </div>
    );
  };

  const topTabs = isSettingLibraryPanel ? null : (
    <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2">
      {normalizedTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setRememberedActiveTab(tab)}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === tab ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          {getWorkbenchTabDisplayLabel(tab)}
        </button>
      ))}
    </div>
  );

  const renderTopTabs = () => (
    normalizedTabs.length <= 1 || !topTabs
      ? null
      : (
    tabPortalTarget
      ? createPortal(topTabs, tabPortalTarget)
      : <div data-no-modal-drag="true" className="flex shrink-0 cursor-default items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">{topTabs}</div>
      )
  );

  const libraryHeaderFontSizePortal = headerToolPortalTarget && !showInlineFieldSizeButton
    ? createPortal(renderLibraryHeaderFontSizeTool(), headerToolPortalTarget)
    : null;

  const fieldSizeSettingsModal = isFieldSizeSettingsOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/30 p-4"
      onClick={() => setIsFieldSizeSettingsOpen(false)}
    >
      <section
        data-draggable-managed="true"
        onClick={(event) => event.stopPropagation()}
        className="modal-sharp flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        style={fieldSizeSettingsDraggable.style}
      >
        <header
          {...fieldSizeSettingsDraggable.dragHandleProps}
          className="flex shrink-0 cursor-move items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"
          style={fieldSizeSettingsDraggable.dragHandleProps.style}
        >
          <div>
            <h3 className="text-base font-black text-slate-900">{fieldSizeTabLabel}设置</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">只显示当前页面可调字段，调整后会自动保存。</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFieldSizeSettingsOpen(false)}
            data-no-modal-drag="true"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="关闭设置"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3">
            {visibleFieldSizeKeys.map((key) => {
              const spec = fieldSizeSpecs[key] ?? WORKBENCH_FIELD_SIZE_DEFAULTS[key];
              return (
                <article key={key} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[130px_repeat(3,minmax(0,1fr))_220px] lg:items-center">
                  <div className="text-sm font-black text-slate-900">{getWorkbenchFieldSizeLabel(key)}</div>
                  <FieldSizeNumberInput
                    label="宽度"
                    prop="width"
                    value={spec.width}
                    onChange={(value) => updateFieldSizeSpec(key, 'width', value)}
                  />
                  <FieldSizeNumberInput
                    label="高度"
                    prop="height"
                    value={spec.height}
                    onChange={(value) => updateFieldSizeSpec(key, 'height', value)}
                  />
                  <FieldSizeNumberInput
                    label="字号"
                    prop="fontSize"
                    value={spec.fontSize}
                    onChange={(value) => updateFieldSizeSpec(key, 'fontSize', value)}
                  />
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-custom-field-size xy-has-value" style={getWorkbenchFieldSizeStyle(spec)}>
                    <input readOnly value={getWorkbenchFieldSizeLabel(key)} />
                    <label>{getWorkbenchFieldSizeLabel(key)}</label>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <footer className="flex shrink-0 justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={resetFieldSizeSpecs}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            恢复默认
          </button>
          <button
            type="button"
            onClick={() => setIsFieldSizeSettingsOpen(false)}
            className="rounded-xl bg-[#08AACE] px-5 py-2 text-sm font-black text-white hover:bg-[#0798b8]"
          >
            完成
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  ) : null;

  const categoryMenuClearCategoryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleCategories' : 'settingCategories';
  const categoryMenuClearEntryTarget: ClearSettingsTarget = categoryMenu?.kind === 'role' ? 'roleEntries' : 'settingEntries';
  const canDeleteCategoryFromMenu = categoryMenu ? (
    categoryMenu.kind === 'role'
      ? !isDefaultWorkbenchRoleType(categoryMenu.type)
      : !DEFAULT_SETTING_TYPES.includes(categoryMenu.type)
  ) : false;
  const canRenameCategoryFromMenu = canDeleteCategoryFromMenu;
  const categoryContextMenu = categoryMenu ? createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[136px] max-w-[220px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: categoryMenu.x, top: categoryMenu.y }}
    >
      <button
        type="button"
        onClick={createEntryFromCategoryMenu}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-[#08AACE] hover:bg-[#EAF9FD]"
      >
        新建{categoryMenu.kind === 'role' ? '角色' : '设定'}
      </button>
      <button
        type="button"
        onClick={openSiblingCategoryCreateFromMenu}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
      >
        新建分组
      </button>
      <button
        type="button"
        onClick={openCategoryRenameFromMenu}
        disabled={!canRenameCategoryFromMenu}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        重命名分组
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        type="button"
        onClick={() => openClearSettingsConfirmFromMenu(categoryMenuClearEntryTarget)}
        disabled={clearSettingsTargetMeta[categoryMenuClearEntryTarget].count === 0}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        清空{clearSettingsTargetMeta[categoryMenuClearEntryTarget].label}
      </button>
      <button
        type="button"
        onClick={() => openClearSettingsConfirmFromMenu(categoryMenuClearCategoryTarget)}
        disabled={clearSettingsTargetMeta[categoryMenuClearCategoryTarget].count === 0}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        清空{clearSettingsTargetMeta[categoryMenuClearCategoryTarget].label}
      </button>
      {canDeleteCategoryFromMenu ? (
        <>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={deleteCategoryFromMenu}
            className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50"
          >
            删除分组
          </button>
        </>
      ) : null}
    </div>,
    document.body,
  ) : null;

  const entryMenuTarget = entryMenu ? entries.find((entry) => entry.id === entryMenu.entryId) : null;
  const entryMenuIsLockedDefaultSetting = Boolean(entryMenuTarget && isLockedDefaultSettingEntry(entryMenuTarget));
  const entryMenuIsMaleProtagonist = Boolean(entryMenu?.tab === ROLE_TAB && isMaleProtagonistRoleType(entryMenu.roleType ?? ''));
  const entryMenuRoleType = entryMenuTarget?.tab === ROLE_TAB ? parseRoleContent(entryMenuTarget.content).type : '';
  const entryMenuCopyDisabled = Boolean(
    entryMenuTarget?.tab === ROLE_TAB &&
    !canCreateWorkbenchRoleInType(roleEntries.map((entry) => parseRoleContent(entry.content).type), entryMenuRoleType),
  );
  const entryMenuCreateDisabled = entryMenuCopyDisabled;
  const entryMenuRenameDisabled = entryMenuIsLockedDefaultSetting;
  const entryMenuDeleteDisabled = entryMenuIsLockedDefaultSetting || entryMenuIsMaleProtagonist;
  const entryMenuMoveDisabled = entryMenuIsLockedDefaultSetting || entryMenuIsMaleProtagonist;
  const entryMenuMoveOptions = entryMenuTarget?.tab === ROLE_TAB
    ? roleTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE)
    : entryMenuTarget && isSettingLikeTab(entryMenuTarget.tab)
      ? settingTypeOptions.filter((type) => type !== UNCATEGORIZED_TYPE && isSettingTypeInActiveClearDomain(type))
      : [];

  const entryContextMenu = entryMenu ? createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[96px] max-w-[180px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: entryMenu.x, top: entryMenu.y }}
    >
      {entryMenu.tab === ROLE_TAB && shouldShowRolePinAction(entryMenu.roleType) && (
        <button
          onClick={toggleEntryPinnedFromMenu}
          className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-brand hover:bg-brand-light"
        >
          {entryMenu.pinnedAt ? '取消置顶' : '置顶'}
        </button>
      )}
      <button
        onClick={createEntryFromEntryMenu}
        disabled={entryMenuCreateDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        新建{entryMenu.tab === ROLE_TAB ? '角色' : '设定'}
      </button>
      <button
        onClick={copyEntryFromMenu}
        disabled={entryMenuCopyDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        复制
      </button>
      <button
        onClick={renameEntryFromMenu}
        disabled={entryMenuRenameDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        重命名
      </button>
      {entryMenuMoveOptions.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setEntryMoveMenuOpen((open) => !open)}
            disabled={entryMenuMoveDisabled}
            className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            移动到分组
          </button>
          {entryMoveMenuOpen && !entryMenuMoveDisabled && (
            <div className="my-1 max-h-44 overflow-y-auto border-y border-gray-100 py-1">
              {entryMenuMoveOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => moveEntryFromMenuToType(type)}
                  className="w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-xs font-black text-slate-500 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <button
        onClick={deleteEntryFromMenu}
        disabled={entryMenuDeleteDisabled}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        删除
      </button>
    </div>,
    document.body,
  ) : null;
  const pendingDeleteLabel = pendingEntryDelete?.tab === ROLE_TAB ? '角色' : pendingEntryDelete?.tab;
  const pendingDeleteDescription = pendingEntryDelete?.tab === BRAINSTORM_TAB
    ? `确定要删除脑洞「${pendingEntryDelete?.title ?? ''}」吗？\n删除后会进入脑洞回收站，可以恢复。`
    : `确定要删除${pendingDeleteLabel ?? '内容'}「${pendingEntryDelete?.title ?? ''}」吗？\n删除后无法恢复。`;
  const deleteConfirmDialog = (
    <ConfirmDialog
      isOpen={Boolean(pendingEntryDelete)}
      title="确认删除"
      description={pendingDeleteDescription}
      confirmText="删除"
      cancelText="取消"
      confirmVariant="danger"
      onClose={() => setPendingEntryDelete(null)}
      onConfirm={handleConfirmDeleteEntry}
    />
  );
  const entryRenameDialog = pendingEntryRename ? createPortal(
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-950/35 p-5"
      data-titlebar-no-drag="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeEntryRenameDialog();
      }}
    >
      <section
        className="w-[min(420px,92vw)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        data-no-modal-drag="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900">重命名</h3>
          <button
            type="button"
            onClick={closeEntryRenameDialog}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          data-no-modal-drag="true"
          value={entryRenameDraft}
          onChange={(event) => setEntryRenameDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirmEntryRename();
            if (event.key === 'Escape') closeEntryRenameDialog();
          }}
          autoFocus
          className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={closeEntryRenameDialog}
            className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={confirmEntryRename}
            disabled={!entryRenameDraft.trim()}
            className="h-10 rounded-xl bg-[#08AACE] text-sm font-black text-white transition-colors hover:bg-[#078fb0] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            保存
          </button>
        </div>
      </section>
    </div>,
    document.body,
  ) : null;
  const currentClearSettingsMeta = clearSettingsTargetMeta[clearSettingsConfirmTarget];
  const clearSettingsConfirmDialog = (
    <ConfirmDialog
      isOpen={isClearSettingsConfirmOpen}
      title={clearSettingsConfirmStep === 1 ? `确认清空${currentClearSettingsMeta.label}` : `再次确认清空${currentClearSettingsMeta.label}`}
      description={clearSettingsConfirmStep === 1
        ? `${currentClearSettingsMeta.description}\n\n这是第一次确认，点击确认后还需要再确认一次。`
        : `最后确认：即将清空${currentClearSettingsMeta.label}，这个操作会立即生效。请确认不是误点。`}
      confirmText={clearSettingsConfirmStep === 1 ? '确认，继续' : `确认清空${currentClearSettingsMeta.label}`}
      cancelText="再看看"
      confirmVariant="danger"
      onClose={closeClearSettingsConfirm}
      onConfirm={confirmClearSettings}
    />
  );
  const promptDisableContextMenu = promptDisableMenu ? createPortal(
    <div
      data-library-context-menu="true"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[10000] w-max min-w-[76px] max-w-[140px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      style={{ left: promptDisableMenu.x, top: promptDisableMenu.y }}
    >
      <button
        type="button"
        onClick={() => {
          updateTabConfig(promptDisableMenu.tab, { promptDisabled: !promptDisableMenu.disabled });
          setPromptDisableMenu(null);
        }}
        className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-50"
      >
        {promptDisableMenu.disabled ? '启用' : '禁用'}
      </button>
    </div>,
    document.body,
  ) : null;
  const selectedOtherSettingLinkTab = otherSettingLinkTabs.find((tab) => tab.id === otherSettingReaderTabId) ?? otherSettingLinkTabs[0];
  const otherSettingReaderKeyword = otherSettingReaderQuery.trim();
  const visibleOtherSettingGroups = (selectedOtherSettingLinkTab?.groups ?? [])
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => (
        !otherSettingReaderKeyword
        || `${entry.title} ${entry.type} ${entry.groupName} ${entry.text}`.includes(otherSettingReaderKeyword)
      )),
    }))
    .filter((group) => group.entries.length > 0);
  const selectedOtherSettingLinkEntry = otherSettingLinkFlatEntries.find((entry) => entry.id === otherSettingReaderPreviewId)
    ?? visibleOtherSettingGroups.flatMap((group) => group.entries)[0]
    ?? otherSettingLinkFlatEntries[0]
    ?? null;
  const draftOtherSettingLinkEntries = Array.from(draftOtherSettingReaderIds)
    .map((id) => otherSettingLinkFlatEntries.find((entry) => entry.id === id))
    .filter((entry): entry is OtherSettingLinkEntry => Boolean(entry));
  const draftOtherSettingLinkWordCount = draftOtherSettingLinkEntries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const otherSettingReaderModal = isOtherSettingReaderOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeOtherSettingReader}
    >
      <div
        className="modal-sharp flex h-[min(760px,90vh)] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">关联其他设定</h3>
            <p className="mt-1 text-xs text-gray-400">读取设定页面下所有设定条目，勾选后作为本次 AI 请求的参考上下文。</p>
          </div>
          <button
            onClick={closeOtherSettingReader}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
          {otherSettingLinkTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setOtherSettingReaderTabId(tab.id);
                const firstEntry = tab.groups.flatMap((group) => group.entries)[0];
                if (firstEntry) setOtherSettingReaderPreviewId(firstEntry.id);
              }}
              className={`h-9 rounded-xl border px-3 text-sm font-black transition-colors ${
                selectedOtherSettingLinkTab?.id === tab.id
                  ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
              }`}
            >
              {tab.title}
            </button>
          ))}
          <button
            type="button"
            onClick={selectAllCurrentOtherSettingLinkTab}
            disabled={!selectedOtherSettingLinkTab?.groups.some((group) => group.entries.length > 0)}
            className="ml-auto h-9 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            关联所有
          </button>
          <label className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              value={otherSettingReaderQuery}
              onChange={(event) => setOtherSettingReaderQuery(event.target.value)}
              placeholder="搜索设定条目"
              className="h-9 w-full rounded-xl border border-gray-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
            />
          </label>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_280px]">
          <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">
            {visibleOtherSettingGroups.length === 0 ? (
              <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm font-bold text-gray-400">
                暂无匹配设定
              </div>
            ) : visibleOtherSettingGroups.map((group) => (
              <section key={group.name} className="mb-3">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-2 text-sm font-black text-slate-800">
                  <Folder className="h-4 w-4 text-[#08AACE]" />
                  <span className="min-w-0 flex-1 truncate">{group.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleVisibleOtherSettingLinkGroupSelection(group.entries)}
                    className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                  >
                    全选
                  </button>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.entries.length}</span>
                </div>
                <div className="mt-1 space-y-1">
                  {group.entries.map((entry) => {
                    const selected = selectedOtherSettingLinkEntry?.id === entry.id;
                    const linked = draftOtherSettingReaderIds.has(entry.id);
                    return (
                      <div
                        key={entry.id}
                        className={`flex min-h-[38px] w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-black transition-colors ${
                          selected
                            ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#078fb0]'
                            : 'border border-transparent bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                        }`}
                      >
                        <button
                          type="button"
                          aria-label={`${draftOtherSettingReaderIds.has(entry.id) ? '取消选择' : '选择'}${entry.title}`}
                          onClick={() => toggleDraftOtherSettingReaderId(entry.id)}
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-sm font-black transition-colors ${
                            linked
                              ? 'border-[#08AACE] bg-[#08AACE] text-white'
                              : 'border-slate-300 bg-white text-transparent hover:border-[#08AACE] hover:text-[#08AACE]'
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtherSettingReaderPreviewId(entry.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                          <span className="shrink-0 text-xs text-[#08AACE]">{entry.wordCount}字</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </aside>

          <main className="editor-scrollbar min-h-0 overflow-y-auto p-6">
            {selectedOtherSettingLinkEntry ? (
              <article className="flex min-h-full flex-col">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-2xl font-black text-gray-900">{selectedOtherSettingLinkEntry.title}</h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${
                      draftOtherSettingReaderIds.has(selectedOtherSettingLinkEntry.id)
                        ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {draftOtherSettingReaderIds.has(selectedOtherSettingLinkEntry.id) ? '已勾选' : '未勾选'}
                  </span>
                </div>
                <div className="min-h-[360px] flex-1 whitespace-pre-wrap rounded-2xl border-2 border-slate-900 bg-white p-5 text-sm font-bold leading-8 text-slate-600">
                  {selectedOtherSettingLinkEntry.text || '暂无内容'}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                请选择左侧设定后查看完整内容
              </div>
            )}
          </main>

          <aside className="editor-scrollbar min-h-0 overflow-y-auto border-l border-gray-100 bg-cyan-50 p-4">
            <div className="mb-3 text-sm font-black text-[#08AACE]">本次将关联</div>
            <div className="space-y-2">
              {draftOtherSettingLinkEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-cyan-200 bg-white p-4 text-center text-xs font-bold leading-5 text-slate-400">
                  还没有选择其他设定
                </div>
              ) : draftOtherSettingLinkEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setOtherSettingReaderTabId(entry.tabId);
                    setOtherSettingReaderPreviewId(entry.id);
                  }}
                  className="w-full rounded-xl bg-white px-3 py-2 text-left shadow-sm transition-colors hover:bg-[#F8FEFF]"
                >
                  <div className="truncate text-sm font-black text-slate-800">{entry.title}</div>
                  <div className="mt-1 truncate text-xs font-bold text-slate-400">{entry.tabTitle} / {entry.groupName}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-cyan-200 bg-white p-3 text-xs font-bold leading-5 text-slate-500">
              确认后，这些条目会合并成“关联其他设定”上下文，与当前设定、脑洞来源互斥。
            </div>
          </aside>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            已选 {draftOtherSettingLinkEntries.length} 项 · 共 {draftOtherSettingLinkWordCount} 字
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDraftOtherSettingReaderIds(new Set())}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              清空
            </button>
            <button
              type="button"
              onClick={closeOtherSettingReader}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmOtherSettingReaderSelection}
              className="rounded-xl bg-[#08AACE] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0796B8]"
            >
              确认关联
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormEntries = entries.filter((entry) => entry.tab === BRAINSTORM_TAB);
  const selectedBrainstormReaderEntry = brainstormEntries.find((entry) => entry.id === selectedBrainstormReaderId) ?? null;
  const selectedBrainstormReaderContent = selectedBrainstormReaderEntry
    ? parseSettingContent(selectedBrainstormReaderEntry.content)
    : null;
  const selectedBrainstormReaderText = getBrainstormEntryBody(selectedBrainstormReaderEntry);
  const brainstormReaderModal = isBrainstormReaderOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormReader}
    >
      <div
        className="modal-sharp flex h-[78vh] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">关联脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">每个脑洞都是可独立成书的候选项目；左侧切换预览，右侧确认关联。</p>
          </div>
          <button
            onClick={closeBrainstormReader}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] bg-white">
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-900">候选书单</h4>
              <span className="rounded-full bg-[#EAF9FD] px-2.5 py-1 text-xs font-black text-[#08AACE]">{brainstormEntries.length}</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {brainstormEntries.length === 0 && (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  暂无脑洞
                </div>
              )}
              {brainstormEntries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const contentText = parsed.body || entry.content || '';
                const active = selectedBrainstormReaderId === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedBrainstormReaderId(entry.id)}
                    className={`w-full rounded-xl border p-3 text-left transition hover:bg-white ${
                      active
                        ? 'border-[#08AACE] bg-white shadow-sm ring-1 ring-[#08AACE]/20'
                        : 'border-transparent bg-white/70 text-gray-600 hover:border-[#08AACE]/30'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-black text-gray-900">{entry.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-black text-slate-400">
                          <span className="rounded-md bg-[#EAF9FD] px-2 py-0.5 text-[#08AACE]">{parsed.type || BRAINSTORM_TYPE}</span>
                          <span><WordCountText value={countTextWords(contentText)} compact /></span>
                        </div>
                      </div>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] ${
                        active ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
                      }`}>
                        ✓
                      </span>
                    </div>
                    <div className="line-clamp-3 text-xs font-semibold leading-5 text-slate-500">
                      {contentText || '暂无内容'}
                    </div>
                  </button>
                );
              })}
            </div>
</aside>
          <main className="min-h-0 p-5">
            {selectedBrainstormReaderEntry ? (
              <article className="flex h-full min-h-0 flex-col rounded-2xl border border-[#08AACE]/30 bg-[#F8FDFF] p-5">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-black text-[#08AACE]">
                      <Pin className="h-4 w-4" />
                      {selectedBrainstormReaderContent?.type || BRAINSTORM_TYPE}
                      <span className="text-slate-300">·</span>
                      <WordCountText value={countTextWords(selectedBrainstormReaderText)} compact />
                      <span className="text-slate-300">·</span>
                      {selectedBrainstormReaderEntry.updatedAt}
                    </div>
                    <h4 className="mt-2 truncate text-2xl font-black text-gray-900">
                      {selectedBrainstormReaderEntry.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={confirmBrainstormReaderSelection}
                    className="h-9 shrink-0 rounded-xl bg-[#08AACE] px-4 text-sm font-black text-white shadow-sm hover:bg-[#0798b8]"
                  >
                    关联此项
                  </button>
                </div>
                <div className="mb-4 grid shrink-0 grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-600">
                    <div className="mb-1 text-[11px] font-black text-[#08AACE]">项目类型</div>
                    {selectedBrainstormReaderContent?.type || BRAINSTORM_TYPE}
                  </div>
                  <div className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-600">
                    <div className="mb-1 text-[11px] font-black text-amber-600">关联方式</div>
                    关联后会作为完整脑洞项目随本次请求发送给 AI。
                  </div>
                </div>
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm font-semibold leading-7 text-slate-600">
                  {selectedBrainstormReaderText || '暂无内容'}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                请选择左侧脑洞后查看完整项目
              </div>
            )}
          </main>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <div className="min-w-0 truncate text-sm font-bold text-gray-500">
            {selectedBrainstormReaderEntry
              ? `将关联：${selectedBrainstormReaderEntry.title} · ${countTextWords(selectedBrainstormReaderText)} 字`
              : '请选择一个脑洞项目后关联'}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={closeBrainstormReader}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmBrainstormReaderSelection}
              disabled={!selectedBrainstormReaderEntry}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              关联脑洞
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormRecycleModal = isBrainstormRecycleOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={() => {
        setIsClearBrainstormRecycleConfirmOpen(false);
        setIsBrainstormRecycleOpen(false);
      }}
    >
      <div
        className="modal-sharp flex h-[min(720px,86vh)] w-[min(760px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900">脑洞回收站</h3>
            <p className="mt-1 text-xs font-medium text-gray-400">{brainstormRecycleEntries.length} 个已删除脑洞，可以恢复或永久删除。</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClearBrainstormRecycleConfirmOpen(true)}
              disabled={brainstormRecycleEntries.length === 0}
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
            >
              清空回收站
            </button>
            <button
              type="button"
              onClick={() => {
                setIsClearBrainstormRecycleConfirmOpen(false);
                setIsBrainstormRecycleOpen(false);
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          {brainstormRecycleEntries.length === 0 ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm font-bold text-gray-400">
              暂无删除的脑洞
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {brainstormRecycleEntries.map((entry) => {
                const parsed = parseSettingContent(entry.content);
                const body = parsed.body || entry.content;
                const entryWordCount = countTextWords(body);
                return (
                  <article key={entry.id} className="flex min-h-[170px] flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-bold text-gray-900">{entry.title}</h4>
                        <div className="mt-1 text-xs font-bold"><WordCountText value={entryWordCount} compact /></div>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-400">
                        {parsed.type || BRAINSTORM_TYPE}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-wrap text-xs leading-5 text-gray-500">{body || '暂无内容'}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => restoreBrainstormEntry(entry.id)}
                        className="rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        onClick={() => permanentlyDeleteBrainstormEntry(entry.id)}
                        className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                      >
                        永久删除
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const clearBrainstormRecycleConfirmDialog = (
    <ConfirmDialog
      isOpen={isClearBrainstormRecycleConfirmOpen}
      title="清空脑洞回收站"
      description={`确定要清空 ${brainstormRecycleEntries.length} 个已删除脑洞吗？\n清空后无法恢复。`}
      confirmText="清空回收站"
      cancelText="再看看"
      confirmVariant="danger"
      onClose={() => setIsClearBrainstormRecycleConfirmOpen(false)}
      onConfirm={clearBrainstormRecycle}
    />
  );
  const brainstormPromptManagerModal = isBrainstormPromptManagerOpen ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormPromptManager}
    >
      <div
        className="modal-sharp flex h-[70vh] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">提示词管理</h3>
            <p className="mt-1 text-xs text-gray-400">仅显示“脑洞”分类下的提示词。</p>
          </div>
          <button
            onClick={closeBrainstormPromptManager}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
            <div className="flex flex-wrap gap-4">
              {brainstormPrompts.length === 0 && (
                <div className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                  暂无提示词
                </div>
              )}
              {brainstormPrompts.map((prompt) => (
                <article key={prompt.id} className="flex h-[247px] w-[255px] flex-col rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[17px] font-bold text-slate-900">{prompt.name}</h4>
                        <span className="rounded-xl border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-500">脑洞</span>
                      </div>
                    </div>
                    <Lock className={`h-4 w-4 shrink-0 ${prompt.isLocked ? 'text-orange-400' : 'text-slate-300'}`} />
                  </div>
                  <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-50 p-3">
                    <div className="editor-scrollbar h-full overflow-y-auto whitespace-pre-wrap break-words text-sm font-medium leading-7 text-slate-800">
                      {prompt.description || '暂无说明'}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>?? <WordCountText value={(prompt.description || '').length} /></span>
                    <span>{prompt.updatedAt}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <button
                      onClick={() => togglePin(prompt.id)}
                      className={`rounded-[14px] px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                        prompt.isFavorite ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand hover:bg-brand-dark'
                      }`}
                    >
                      {prompt.isFavorite ? '已置顶' : '置顶'}
                    </button>
                    <button
                      onClick={() => openBrainstormPromptEdit(prompt)}
                      disabled={prompt.isLocked}
                      className="rounded-[14px] bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteBrainstormPrompt(prompt)}
                      disabled={prompt.isLocked}
                      className="rounded-[14px] bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
              <button
                onClick={openBrainstormPromptCreate}
                className="flex h-[247px] w-[255px] flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-300 bg-white text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50/40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-300 bg-sky-50/60 text-4xl leading-none">
                  +
                </span>
                <span className="mt-6 text-base font-medium">创建提示词</span>
              </button>
            </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormPromptEditModal = (editingBrainstormPrompt || isCreatingBrainstormPrompt) ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[290] flex items-center justify-center bg-black/35"
      onClick={closeBrainstormPromptEdit}
    >
      <div
        className="modal-sharp flex h-[min(820px,92vh)] w-[min(960px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isCreatingBrainstormPrompt ? '创建提示词' : '编辑提示词'}</h3>
            <p className="mt-1 text-xs text-gray-400">只会保存到“脑洞”分类下。</p>
          </div>
          <button
            onClick={closeBrainstormPromptEdit}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="editor-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className={`xy-floating-field xy-floating-compact ${brainstormPromptDraft.name.trim() ? 'xy-has-value' : ''}`}>
            <input
              value={brainstormPromptDraft.name}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="名称"
            />
            <label>名称</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact ${brainstormPromptDraft.description.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={brainstormPromptDraft.description}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="editor-scrollbar h-24"
              placeholder="说明"
            />
            <label>说明</label>
          </div>
          <div className={`xy-floating-field xy-floating-compact xy-floating-fill flex min-h-[260px] flex-1 flex-col ${brainstormPromptDraft.content.trim() ? 'xy-has-value' : ''}`}>
            <textarea
              value={brainstormPromptDraft.content}
              onChange={(event) => setBrainstormPromptDraft((prev) => ({ ...prev, content: event.target.value }))}
              className="editor-scrollbar min-h-[260px] flex-1"
              placeholder="提示词内容"
            />
            <label>提示词内容</label>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={closeBrainstormPromptEdit}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={saveBrainstormPromptEdit}
            disabled={!brainstormPromptDraft.name.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const brainstormGenerateConfirmModal = brainstormGenerateDraft ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={() => setBrainstormGenerateDraft(null)}
    >
      <div
        className="modal-sharp flex h-[min(680px,86vh)] w-[min(720px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">确认生成脑洞</h3>
            <p className="mt-1 text-xs text-gray-400">确认后会把这些内容发送给当前模型，并在左侧输出区显示结果。</p>
          </div>
          <button
            onClick={() => setBrainstormGenerateDraft(null)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          onScroll={handleBrainstormConfirmScroll}
          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5 ${
            isBrainstormConfirmScrolling ? 'scrollbar-active' : ''
          }`}
        >
          <div className="space-y-3">
            {BRAINSTORM_QUESTION_FIELDS.filter((field) => brainstormGenerateDraft[field.key].trim()).map((field) => (
              <section key={field.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-900">{field.label}</div>
                <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                  {brainstormGenerateDraft[field.key].trim()}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setBrainstormGenerateDraft(null)}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirmBrainstormGenerate}
            disabled={isLibraryAiLoading}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认生成
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const settingCreateIsCharacter = settingCreateContextKind === 'role' || (activeTab === SETTING_TAB && outlineSettingScope === 'character');
  const settingCreateItemLabel = settingCreateIsCharacter ? '角色' : '设定';
  const settingCreateTypeOptions = settingCreateDialog === 'setting' ? getSettingCreateTypeOptions() : [];
  const settingCreateTypeValue = settingCreateTypeOptions.includes(settingCreateTypeDraft)
    ? settingCreateTypeDraft
    : settingCreateTypeOptions[0] ?? '';
  const closeSettingCreateDialog = () => {
    setSettingCreateDialog(null);
    setSettingCreateContextKind(null);
  };
  const settingCreateModal = settingCreateDialog ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={closeSettingCreateDialog}
    >
      <div
        className="modal-sharp flex w-[min(460px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {settingCreateDialog === 'category' ? '新建分组' : `新建${settingCreateItemLabel}`}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {settingCreateDialog === 'category' ? '输入分组名称，确认后会显示在左侧分组里。' : `选择所属分组，确认后会创建新的${settingCreateItemLabel}。`}
            </p>
          </div>
          <button
            onClick={closeSettingCreateDialog}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className={`xy-floating-field xy-floating-outline-fixed ${settingCreateDraft.trim() ? 'xy-has-value' : ''}`}>
            <input
              autoFocus
              value={settingCreateDraft}
              onChange={(event) => setSettingCreateDraft(event.target.value)}
              onKeyDown={(event) => {
                const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
                if (event.key === 'Enter' && !isImeComposing) confirmSettingCreate();
              }}
              placeholder={settingCreateDialog === 'category' ? '输入分组名字' : `输入${settingCreateItemLabel}名字`}
            />
            <label>{settingCreateDialog === 'category' ? '分组名字' : `${settingCreateItemLabel}名字`}</label>
          </div>
          {settingCreateDialog === 'setting' && (
            <label className="mt-4 block text-sm font-black text-slate-700">
              <span className="mb-2 block text-xs text-slate-400">所属分组</span>
              <select
                value={settingCreateTypeValue}
                onChange={(event) => setSettingCreateTypeDraft(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:ring-2 focus:ring-[#08AACE]/15"
              >
                {settingCreateTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={closeSettingCreateDialog}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirmSettingCreate}
            disabled={!settingCreateDraft.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;
  const categoryRenameModal = pendingCategoryRename ? createPortal(
    <div
      className="modal-sharp fixed inset-0 z-[280] flex items-center justify-center bg-black/35"
      onClick={closeCategoryRenameDialog}
    >
      <div
        className="modal-sharp flex w-[min(420px,92vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">重命名分组</h3>
            <p className="mt-1 text-xs text-gray-400">默认分组不会进入这里，自建分组改名后，分组下内容会一起移动。</p>
          </div>
          <button
            onClick={closeCategoryRenameDialog}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className={`xy-floating-field xy-floating-outline-fixed ${categoryRenameDraft.trim() ? 'xy-has-value' : ''}`}>
            <input
              autoFocus
              value={categoryRenameDraft}
              onChange={(event) => setCategoryRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229;
                if (event.key === 'Enter' && !isImeComposing) confirmCategoryRename();
              }}
              placeholder="输入新的分组名字"
            />
            <label>分组名字</label>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={closeCategoryRenameDialog}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={confirmCategoryRename}
            disabled={!categoryRenameDraft.trim()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            确认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  if (activeTab === ROLE_TAB) {
    const roleHistoryModal = selectedEntry && selectedRole && roleHistoryEntryId === selectedEntry.id ? createPortal(
      <div
        className="modal-sharp fixed inset-0 z-[10020] flex items-center justify-center bg-black/30"
        onClick={() => setRoleHistoryEntryId(null)}
      >
        <div
          className="modal-sharp flex h-[72vh] w-[860px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">历史版本</h3>
              <p className="mt-1 text-xs text-gray-400">{selectedEntry.title} · {selectedRole.history?.length ?? 0} / {ROLE_HISTORY_LIMIT}</p>
            </div>
            <button
              onClick={() => setRoleHistoryEntryId(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            {!selectedRole.history || selectedRole.history.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                暂无历史版本，修改角色后会自动记录。
              </div>
            ) : (
              <div className="space-y-3">
                {selectedRole.history.map((version, index) => (
                  <article key={`${version.savedAt}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate text-sm font-bold text-gray-900">
                        版本 {selectedRole.history!.length - index}：{version.title}
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{version.savedAt}</span>
                    </div>
                    <div className="mb-3 text-xs font-bold text-gray-500">分类：{version.type}</div>
                    <div className="grid grid-cols-2 gap-3 text-xs leading-5 text-gray-500">
                      <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 font-bold text-gray-700">基础设定</div>
                        <p className="whitespace-pre-wrap">{version.baseSetting || version.background || '暂无内容'}</p>
                      </div>
                      <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 font-bold text-gray-700">状态设定</div>
                        <p className="whitespace-pre-wrap">{buildRoleStateSettingsText(normalizeRoleStateSettings(version.stateSettings, version.status)) || '暂无内容'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    ) : null;

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {roleHistoryModal}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
        {settingCreateModal}
        {categoryRenameModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        <div
          className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 0px minmax(0,1fr)`,
          }}
        >
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-4 pb-3 pt-2">
            <div className="flex shrink-0 gap-2">
              <div
                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleSearch.trim() ? 'xy-has-value' : ''}`}
                style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
              >
                <input
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="搜索角色..."
                />
                <label>搜索角色</label>
              </div>
              <button className="h-11 min-w-[64px] shrink-0 whitespace-nowrap rounded-2xl bg-brand px-4 text-sm font-bold text-white">搜索</button>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
              {groupedRoles.map((group) => {
                const expanded = expandedRoleTypes.has(group.type);
                const isDropTarget = libraryDropTarget?.tab === ROLE_TAB && libraryDropTarget.type === group.type;
                const previewEntries = getPreviewedLibraryGroupEntries(group.entries, ROLE_TAB, group.type);
                const GroupFolderIcon = expanded ? FolderOpen : Folder;
                return (
                  <div
                    key={group.type}
                    data-library-group-tab={ROLE_TAB}
                    data-library-group-type={group.type}
                    onDragOver={(event) => handleLibraryCategoryDragOver(event, ROLE_TAB, group.type, group.entries.length === 0)}
                    onDragLeave={handleLibraryCategoryDragLeave}
                    onDrop={(event) => handleLibraryCategoryDrop(event, ROLE_TAB, group.type)}
                    className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
                  >
                    <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
                      <button
                        onContextMenu={(event) => openCategoryMenu(event, 'role', group.type)}
                        onClick={() => {
                          setExpandedRoleTypes((prev) => {
                            const next = new Set(prev);
                            if (next.has(group.type)) next.delete(group.type);
                            else next.add(group.type);
                            return next;
                          });
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        aria-expanded={expanded}
                      >
                        <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                        <span className="min-w-0 flex-1 truncate leading-none">{group.type}</span>
                        <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{previewEntries.length}</span>
                      </button>
                    </div>
                    {expanded && (
                      <div className="editor-scrollbar mt-1 max-h-[464px] space-y-1 overflow-y-auto pr-1">
                        {previewEntries.map((entry, previewIndex) => {
                          const showPinAction = shouldShowRolePinAction(group.type);
                          return (
                            <div
                              key={entry.id}
                              data-library-entry-id={entry.id}
                              data-library-entry-tab={ROLE_TAB}
                              data-library-entry-type={group.type}
                              data-library-entry-preview-index={previewIndex}
                              onDragStart={(event) => handleLibraryEntryDragStart(event, entry, group.type)}
                              onDragOver={(event) => handleLibraryEntryDragOver(event, entry, group.type, previewIndex)}
                              onDrop={(event) => handleLibraryEntryDrop(event, entry, group.type, previewIndex)}
                              onDragEnd={handleLibraryEntryDragEnd}
                              onPointerDown={(event) => beginLibraryEntryPointerDrag(event, entry, group.type)}
                              onPointerMove={updateLibraryEntryPointerPreview}
                              onPointerUp={finishLibraryEntryPointerDrag}
                              onPointerCancel={finishLibraryEntryPointerDrag}
                              onContextMenu={(event) => openEntryMenu(event, entry)}
                              onClick={(event) => {
                                if (libraryPointerSuppressClickRef.current) {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  return;
                                }
                                setSelectedId(entry.id);
                              }}
                              className={`flex w-full cursor-default select-none items-center gap-2 rounded-xl border px-4 py-2 text-left text-sm font-black transition-[background-color,border-color,box-shadow,opacity,transform] duration-150 ${
                                selectedEntry?.id === entry.id
                                  ? 'border-transparent xy-selected-mint-bg text-gray-900'
                                  : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                              } ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                            >
                              <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                              {showPinAction && (
                                <button
                                  type="button"
                                  draggable={false}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleRolePinned(entry);
                                  }}
                                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                    entry.pinnedAt
                                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                                      : 'bg-gray-100 text-gray-500 hover:bg-brand-light hover:text-brand'
                                  }`}
                                  title={entry.pinnedAt ? '取消置顶' : '置顶'}
                                >
                                  {entry.pinnedAt ? '取消' : '置顶'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex shrink-0 flex-col gap-2">
              <div className="flex gap-2">
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleTypeDraft.trim() ? 'xy-has-value' : ''}`}
                  style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
                >
                  <input
                    value={roleTypeDraft}
                    onChange={(event) => setRoleTypeDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addRoleType();
                    }}
                    placeholder="分类名字"
                  />
                  <label>分类名字</label>
                </div>
                <button
                  onClick={addRoleType}
                  className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  新建分类
                </button>
              </div>
              <div className="flex gap-2">
                <div
                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact xy-floating-outline-role-compact xy-floating-custom-field-size min-w-0 ${roleNameDraft.trim() ? 'xy-has-value' : ''}`}
                  style={{ ...getFieldSizeStyle('roleSearch'), flex: `0 1 ${fieldSizeSpecs.roleSearch.width}px` }}
                >
                  <input
                    value={roleNameDraft}
                    onChange={(event) => setRoleNameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addRole(getDefaultRoleCreateType());
                    }}
                    placeholder="角色名字"
                  />
                  <label>角色名字</label>
                </div>
                <button onClick={() => addRole(getDefaultRoleCreateType())} className="h-11 shrink-0 rounded-2xl bg-brand px-3 text-sm font-bold text-white hover:bg-brand-dark">
                  新建角色
                </button>
              </div>
            </div>
          </aside>
          {leftResizeHandle}

          <main className={`min-w-0 flex min-h-0 flex-col overflow-hidden bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}>
            {selectedEntry && selectedRole ? (
              <RoleBaseStateEditor
                entry={selectedEntry}
                role={selectedRole}
                roleEntries={roleEntries}
                roleTypeOptions={roleTypeOptions}
                roleTextFontSize={roleTextFontSize}
                currentChapterNumber={currentOutlineChapterNumber}
                roleLifeStatus={selectedRoleLifeStatus}
                onTitleChange={updateSelectedRoleTitle}
                onRoleChange={updateRole}
              />
            ) : (
              <div className="m-5 flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                点击左侧“新建角色”开始创建角色
              </div>
            )}
          </main>

          {settingLibraryMode === 'advanced' && (
          <>
          {rightResizeHandle}
          <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <h3 className="shrink-0 text-base font-bold text-gray-900">角色生成</h3>
              <div className="flex shrink-0 items-center gap-2">
                {renderFieldSizeButton()}
                {renderLibraryAiLogButton('library')}
              </div>
            </div>
            <div className="mt-3 shrink-0 space-y-3">
              <CombinedAiConfigSelect
                style={getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(ROLE_TAB, 'model'))}
                modelValue={activeTabConfig.modelId ?? ''}
                promptValue={activeTabConfig.promptId ?? ''}
                modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                promptOptions={rolePromptOptions.length === 0 ? [{ value: '', label: '暂无设定提示词', disabled: true }] : rolePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                onPromptChange={(value) => updateActiveTabConfig({ promptId: value })}
                onModelManage={() => setManagementModal({ type: 'models' })}
                onPromptManage={() => setManagementModal({ type: 'prompts', category: PROMPT_SETTING_CATEGORY })}
                promptDisabled={Boolean(activeTabConfig.promptDisabled)}
                onPromptContextMenu={(event) => {
                  event.preventDefault();
                  const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, PROMPT_DISABLE_CONTEXT_MENU_SIZE);
                  setPromptDisableMenu({
                    tab: ROLE_TAB,
                    disabled: Boolean(activeTabConfig.promptDisabled),
                    x: left,
                    y: top,
                  });
                }}
              />
            </div>
            <div className="relative mt-5 min-h-0 flex-1">
              <button
                type="button"
                onClick={clearLibraryAiDialog}
                disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate absolute -top-2 right-4 px-1 text-xs font-black text-red-500 hover:text-red-600 disabled:text-red-300"
              >
                清空
              </button>
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full ${aiOutput.trim() ? 'xy-has-value' : ''}`}>
                <textarea
                  value={aiOutput}
                  onChange={(event) => setAiOutput(event.target.value)}
                  placeholder="AI输出框"
                  className="editor-scrollbar"
                />
                <span className="xy-floating-count"><WordCountText value={countTextWords(aiOutput)} /></span>
              </div>
            </div>
            <div className="mt-2 shrink-0">
                <AiInlineInput
                  ref={libraryAiInputRef}
                  value={aiInput}
                  onChange={(event) => {
                    setAiInput(event.target.value);
                    resizeFloatingAiTextarea(event.currentTarget);
                  }}
                  onKeyDown={handleLibraryAiInputKeyDown}
                  onSend={() => void sendLibraryAiMessage()}
                  onStop={stopLibraryAiMessage}
                  sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                  stopDisabled={!isLibraryAiLoading}
                  placeholder="输入对话指令..."
                />
            </div>
          </aside>
          </>
          )}
        </div>
      </div>
    );
  }

  if (isSettingLibraryPanel && SETTING_LIBRARY_TABS.has(activeTab) && activeTab !== OUTLINE_LIBRARY_TAB && activeTab !== DETAIL_OUTLINE_TAB) {
    const isOutlineCharacterScope = activeTab === SETTING_TAB && outlineSettingScope === 'character';
    const effectiveLibraryTab = isOutlineCharacterScope ? ROLE_TAB : activeTab;
    const effectiveTabConfig = tabConfigs[effectiveLibraryTab] ?? {};
    const effectiveSelectedId = effectiveTabConfig.selectedId ?? null;
    const selectedSettingWorkspaceDomain = activeTab === SETTING_TAB && !isOutlineCharacterScope
      ? getSelectedSettingWorkspaceDomain()
      : null;
    const selectedSettingWorkspaceType = getSelectedSettingWorkspaceType();
    const allCurrentEntries = entries.filter((entry) => entry.tab === effectiveLibraryTab);
    const currentEntries = selectedSettingWorkspaceDomain
      ? allCurrentEntries.filter((entry) => getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type) === selectedSettingWorkspaceDomain)
      : allCurrentEntries;
    const currentSelectedEntry = currentEntries.find((entry) => entry.id === effectiveSelectedId) ?? currentEntries[0] ?? null;
    const activeIsSettingLike = isOutlineCharacterScope || isSettingLikeTab(effectiveLibraryTab);
    const activeIsBrainstorm = activeTab === BRAINSTORM_TAB;
    const currentSelectedSetting = activeIsSettingLike && currentSelectedEntry ? parseSettingContent(currentSelectedEntry.content) : null;
    const currentSelectedSettingIsLockedDefault = currentSelectedEntry ? isLockedDefaultSettingEntry(currentSelectedEntry) : false;
    const currentStructuredSettingFieldSet = currentSelectedEntry ? getStructuredSettingFieldSet(currentSelectedEntry, currentSelectedSetting) : null;
    const currentStructuredSettingFields = currentSelectedSetting && currentStructuredSettingFieldSet
      ? parseStructuredSettingFields(currentSelectedSetting.body, currentStructuredSettingFieldSet)
      : {};
    const currentStructuredTitleFieldLabel = currentStructuredSettingFieldSet?.titleFieldLabel;
    const currentStructuredTitleFieldGroupTitle = currentStructuredSettingFieldSet?.titleFieldGroupTitle ?? currentStructuredSettingFieldSet?.groups?.[0]?.title;
    const currentStructuredActiveGroup = currentStructuredSettingFieldSet?.groups?.find((group) => group.title === activeStructuredSettingTab)
      ?? currentStructuredSettingFieldSet?.groups?.[0];
    const currentStructuredHeaderFieldKeys = new Set(currentStructuredSettingFieldSet?.headerFieldKeys ?? []);
    const currentStructuredActiveGroupWordCount = currentStructuredActiveGroup?.fieldKeys.reduce((total, fieldKey) => (
      total + countTextWords(currentStructuredSettingFields[fieldKey] ?? '')
    ), 0) ?? 0;
    const updateStructuredSettingField = (key: string, value: string) => {
      if (!currentSelectedEntry || !currentSelectedSetting || !currentStructuredSettingFieldSet) return;
      updateEntry(currentSelectedEntry.id, {
        content: stringifySettingContent({
          ...currentSelectedSetting,
          structuredFieldSetId: currentStructuredSettingFieldSet.id,
          body: stringifyStructuredSettingFields({
            ...currentStructuredSettingFields,
            [key]: value,
          }, currentStructuredSettingFieldSet),
        }),
      });
    };
    const currentSelectedRole = isOutlineCharacterScope && currentSelectedEntry ? parseRoleContent(currentSelectedEntry.content) : null;
    const currentSelectedRoleIsMaleProtagonist = Boolean(currentSelectedRole && isMaleProtagonistRoleType(currentSelectedRole.type));
    const currentSelectedRoleLifeStatus = currentSelectedRoleIsMaleProtagonist ? '存活' : currentSelectedRole?.lifeStatus;
    const updateOutlineCharacterRole = (updates: Partial<RoleContent>) => {
      if (!currentSelectedEntry || !currentSelectedRole) return;
      const normalizedUpdates = {
        ...updates,
        ...(updates.type ? { type: normalizeWorkbenchRoleType(updates.type) } : {}),
      };
      if (normalizedUpdates.type && isMaleProtagonistRoleTypeChangeLocked(currentSelectedRole.type, normalizedUpdates.type)) return;
      const nextType = normalizeWorkbenchRoleType(normalizedUpdates.type ?? currentSelectedRole.type);
      if (isMaleProtagonistRoleType(nextType)) normalizedUpdates.lifeStatus = '存活';
      if (normalizedUpdates.type && !canCreateWorkbenchRoleInType(
        roleEntries
          .filter((entry) => entry.id !== currentSelectedEntry.id)
          .map((entry) => parseRoleContent(entry.content).type),
        normalizedUpdates.type,
      )) return;
      updateEntry(currentSelectedEntry.id, {
        content: stringifyRoleContent({ ...currentSelectedRole, ...normalizedUpdates }),
      });
    };
    const activeSettingTypeOptions = activeIsBrainstorm ? [BRAINSTORM_TYPE] : isOutlineCharacterScope ? roleTypeOptions : settingTypeOptions;
    const currentBrainstormBody = activeIsBrainstorm ? currentSelectedSetting?.body ?? '' : '';
    const currentBrainstormPreviewWordCount = activeIsBrainstorm ? countTextWords(currentBrainstormBody) : 0;
    const brainstormLayoutLeftWidth = Math.min(settingLibraryLeftWidth, BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH);
    const brainstormLayoutPreviewWidth = Math.min(brainstormPreviewWidth, BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH);
    const brainstormLayoutRightWidth = Math.max(
      BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
      Math.min(settingLibraryRightWidth, BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH),
    );
    const activeSettingLinkSource = getActiveSettingLinkSource();
    const currentLinkedSettingContext = getActiveLinkedSettingSnapshot();
    const linkedSettingWordCount = countTextWords(currentLinkedSettingContext.text);
    const effectivePromptDisabled = activeTab === SETTING_TAB
      ? !isOutlineCharacterScope && activeSettingLinkSource === 'current'
      : Boolean(activeTabConfig.promptDisabled);
    const latestUsefulAiOutput = activeIsBrainstorm ? getLatestUsefulAiText(aiResult || aiOutput) : aiOutput.trim();
    const smartImportLocked = activeTabConfig.smartImportLocked !== false;
    const activeSettingWorkspaceDomain = selectedSettingWorkspaceDomain;
    const activeSettingWorkspaceType = selectedSettingWorkspaceType;
    const visibleSettingTypeOptions = activeSettingWorkspaceDomain
      ? activeSettingTypeOptions.filter((type) => getSettingTypeWorkspaceDomain(type) === activeSettingWorkspaceDomain)
      : activeSettingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type));
    const groupedSettingEntries = visibleSettingTypeOptions.map((type) => ({
      type,
      entries: currentEntries.filter((entry) => {
        if (isOutlineCharacterScope) return parseRoleContent(entry.content).type === type;
        const parsed = parseSettingContent(entry.content);
        if (activeIsBrainstorm) return (parsed.type || BRAINSTORM_TYPE) === type || parsed.type === UNCATEGORIZED_TYPE;
        return parsed.type === type;
      }),
    }));
    const visibleWorkSettingTypes = new Set(settingTypeOptions.filter((type) => !getSettingTypeWorkspaceDomain(type)));
    const visibleRoleTypes = new Set(roleTypeOptions);
    const visibleWorkSettingCount = settingEntries.filter((entry) => visibleWorkSettingTypes.has(parseSettingContent(entry.content).type)).length;
    const visibleRoleCount = roleEntries.filter((entry) => visibleRoleTypes.has(parseRoleContent(entry.content).type)).length;
    const settingWorkspaceDomainTabs = [
      { id: 'work', label: '作品设定', count: visibleWorkSettingCount, type: null },
      { id: 'character', label: '人物设定', count: visibleRoleCount, type: null },
      { id: 'setting:faction', label: '势力设定', type: 'setting:faction' },
      { id: 'setting:item', label: '道具资源', type: 'setting:item' },
      { id: 'setting:monster', label: '怪物图鉴', type: 'setting:monster' },
      { id: 'setting:foreshadow', label: '伏笔线索', type: 'setting:foreshadow' },
    ];
    const getSettingWorkspaceTabCount = (type: string | null, fallback?: number) => (
      type
        ? settingEntries.filter((entry) => getSettingTypeWorkspaceDomain(parseSettingContent(entry.content).type) === type).length
        : fallback ?? 0
    );
    const selectSettingWorkspaceDomain = (id: string) => {
      setOutlineSettingDomain(id);
      setOutlineSettingScope(id === 'character' ? 'character' : 'work');
    };
    const settingWorkspaceTopTabs = activeTab === SETTING_TAB && !activeIsBrainstorm ? (
      <div
        className="min-w-0 overflow-hidden border-b border-slate-100 bg-white px-4 py-3"
        style={{ gridColumn: '1 / 4', gridRow: 1 }}
      >
        <div className="scrollbar-hidden flex min-w-0 items-center gap-2 overflow-x-auto">
          {settingWorkspaceDomainTabs.map((tab) => {
            const active = outlineSettingDomain === tab.id;
            const count = getSettingWorkspaceTabCount(tab.type, 'count' in tab ? tab.count : undefined);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectSettingWorkspaceDomain(tab.id)}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-black transition-colors ${
                  active
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE]/50 hover:text-[#078FAE]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white text-[#078FAE]' : 'bg-slate-100 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ) : null;
    const activeTabDisplayLabel = getWorkbenchTabDisplayLabel(activeTab);
    const panelTitle = `${activeTabDisplayLabel}生成`;
    const promptCategory = activeTab === SETTING_TAB
      ? PROMPT_SETTING_CATEGORY
      : activeTab === DETAIL_OUTLINE_TAB
      ? DETAIL_OUTLINE_PROMPT_CATEGORY
      : activeTab;
    const promptCategoryLabel = activeTab === SETTING_TAB ? activeTabDisplayLabel : promptCategory;
    const activeTabPrompts = prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === promptCategory);
    const activePromptId = activeTabPrompts.some((prompt) => prompt.id === activeTabConfig.promptId)
      ? activeTabConfig.promptId
      : activeTabPrompts[0]?.id ?? '';
    const showPromptDisableButton = activeTab !== SETTING_TAB;
    const rightSelectFieldTab = activeIsBrainstorm ? BRAINSTORM_TAB : (activeTab === ROLE_TAB ? ROLE_TAB : SETTING_TAB);
    const showInlineLibraryAiLogButton = showInlineFieldSizeButton && (activeTab === SETTING_TAB || activeIsBrainstorm);
    const showHeaderLibraryAiLogButton = false;
    const showPanelHeader = showInlineFieldSizeButton && (showInlineLibraryAiLogButton || (!activeIsBrainstorm && (activeTab !== SETTING_TAB || showHeaderLibraryAiLogButton)));
    const libraryToolbarPortalTarget = toolbarPortalId && activeIsBrainstorm && typeof document !== 'undefined'
      ? document.getElementById(toolbarPortalId)
      : null;
    const libraryToolbarPortal = libraryToolbarPortalTarget ? createPortal(
      <>
        {renderFieldSizeButton()}
        {renderLibraryAiLogButton('library')}
      </>,
      libraryToolbarPortalTarget,
    ) : null;
    const rawBrainstormOutputValue = activeIsBrainstorm && isLibraryAiLoading && !aiResult
      ? `正在生成${'.'.repeat(loadingDotCount)}`
      : aiResult || latestUsefulAiOutput;
    const brainstormOutputValue = activeIsBrainstorm ? stripAiThinkingBlock(rawBrainstormOutputValue) : rawBrainstormOutputValue;
    const brainstormOutputWordCount = activeIsBrainstorm ? countTextWords(brainstormOutputValue) : 0;
    const brainstormOutputPreviewCount = activeIsBrainstorm
      ? activeBrainstormAiSession?.previewCount ?? getBrainstormOutputCount(brainstormQuestionDraft.brainstormCount)
      : 1;
    const brainstormOutputSplitParts = activeIsBrainstorm ? splitBrainstormGeneratedText(brainstormOutputValue, brainstormOutputPreviewCount) : [];
    const brainstormOutputPreviews = Array.from({ length: brainstormOutputPreviewCount }, (_, index) => (
      activeBrainstormAiSession?.previewDrafts?.[index] ?? brainstormOutputSplitParts[index] ?? ''
    ));
    const brainstormOutputTitles = Array.from({ length: brainstormOutputPreviewCount }, (_, index) => (
      activeBrainstormAiSession?.previewTitles?.[index]?.trim() || getTemporaryBrainstormTitle(index)
    ));
    const selectedBrainstormOutputIndexes = getSelectedBrainstormPreviewIndexes(
      brainstormOutputPreviews,
      activeBrainstormAiSession?.previewSelectedIndexes,
    );
    const selectedBrainstormOutputIndexSet = new Set(selectedBrainstormOutputIndexes);
    const selectedBrainstormOutputCount = selectedBrainstormOutputIndexes
      .filter((index) => brainstormOutputPreviews[index]?.trim())
      .length;
    const showBrainstormOutputSelection = activeIsBrainstorm && brainstormOutputPreviewCount > 1;
    const setBrainstormOutputPreviewDraft = (index: number, value: string) => {
      const nextDrafts = [...brainstormOutputPreviews];
      nextDrafts[index] = value;
      updateActiveBrainstormAiSession({ previewDrafts: nextDrafts });
    };
    const setBrainstormOutputPreviewTitle = (index: number, value: string) => {
      const nextTitles = [...brainstormOutputTitles];
      nextTitles[index] = value;
      updateActiveBrainstormAiSession({ previewTitles: nextTitles });
    };
    const toggleBrainstormOutputPreviewSelected = (index: number) => {
      const nextSelected = selectedBrainstormOutputIndexSet.has(index)
        ? selectedBrainstormOutputIndexes.filter((item) => item !== index)
        : [...selectedBrainstormOutputIndexes, index].sort((a, b) => a - b);
      updateActiveBrainstormAiSession({ previewSelectedIndexes: nextSelected });
    };
    const previewAiRequestText = activeIsBrainstorm
      ? buildBrainstormPromptFromQuestions(brainstormQuestionDraft)
      : aiInput.trim();
    const previewAiRequestLog = activeTab === SETTING_TAB || activeIsBrainstorm
      ? buildLibraryAiRequestPayload(previewAiRequestText, activeIsBrainstorm ? previewAiRequestText : undefined).log
      : null;
    const visibleAiRequestLog = previewAiRequestLog ?? lastLibraryAiRequestLog;
    const visibleAiRequestLogGroups = visibleAiRequestLog
      ? buildLibraryLogGroups(visibleAiRequestLog, {
        includeContext: !activeIsBrainstorm,
        omitEmptyUser: activeIsBrainstorm,
        userTitle: activeTab === SETTING_TAB ? '修改要求' : activeIsBrainstorm ? '其他要求' : undefined,
      })
      : [];
    const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);
    const activeSettingImportFormatTab = settingImportFormatGuideTabs.find((tab) => tab.id === settingImportFormatTabId) ?? settingImportFormatGuideTabs[0];
    const selectedSettingImportFormatEntry = findSettingImportFormatEntry(settingImportFormatEntryId, settingImportFormatGuideTabs);
    const selectedSettingImportFormatGroup = activeSettingImportFormatTab?.groups.find((group) => (
      group.entries.some((entry) => entry.id === selectedSettingImportFormatEntry?.id)
    )) ?? activeSettingImportFormatTab?.groups[0] ?? null;
    const settingImportFormatPreview = selectedSettingImportFormatEntry
      && activeSettingImportFormatTab
      && selectedSettingImportFormatGroup
      ? buildSettingImportFormatScopedPreview(
        settingImportFormatPreviewScope,
        activeSettingImportFormatTab,
        selectedSettingImportFormatGroup,
        selectedSettingImportFormatEntry,
      )
      : '';
    const selectSettingImportFormatTab = (tabId: OtherSettingLinkTabId) => {
      const nextTab = settingImportFormatGuideTabs.find((tab) => tab.id === tabId) ?? settingImportFormatGuideTabs[0];
      if (!nextTab) return;
      setSettingImportFormatTabId(nextTab.id);
      setSettingImportFormatEntryId(nextTab.groups[0]?.entries[0]?.id ?? DEFAULT_SETTING_IMPORT_FORMAT_ENTRY_ID);
    };
    const libraryAiLogModal = isLibraryAiLogOpen && libraryAiLogScope === 'library' ? (
      <LibraryAiLogShell
        id={`workbench_library_ai_log_${activeTab}`}
        subtitle={libraryAiLogViewTab === '格式' ? '查看智能导入能识别的标签、分组、条目和子设定格式' : '当前预览：点击发送后会按这里的内容发给 AI'}
        onClose={() => setIsLibraryAiLogOpen(false)}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4">
              {libraryAiLogViewTab === '格式' && (
                <>
                {settingImportFormatGuideTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectSettingImportFormatTab(tab.id)}
                    className={`h-9 min-w-[104px] shrink-0 rounded-lg px-4 text-sm font-black transition-colors ${
                      activeSettingImportFormatTab?.id === tab.id
                        ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                        : 'border border-gray-200 bg-white text-slate-600 hover:border-cyan-100 hover:bg-[#F8FEFF] hover:text-[#08AACE]'
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
                </>
              )}
            </div>
            <div className={SETTING_SEGMENTED_TAB_GROUP_CLASS}>
              {LIBRARY_AI_LOG_VIEW_TABS.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLibraryAiLogViewTab(tab)}
                  className={`${SETTING_SEGMENTED_TAB_BUTTON_CLASS} ${index === 0 ? '' : 'border-l border-gray-200'} ${
                    libraryAiLogViewTab === tab ? SETTING_SEGMENTED_TAB_ACTIVE_CLASS : SETTING_SEGMENTED_TAB_IDLE_CLASS
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {libraryAiLogViewTab === '输出日志' ? (
            visibleAiRequestLog ? (
              <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
                <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white p-3">
                      <div className="text-xs text-slate-400">链路</div>
                      <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.tab}生成</div>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <div className="text-xs text-slate-400">模型</div>
                      <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.modelName}</div>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <div className="text-xs text-slate-400">提示词</div>
                      <div className="mt-1 font-bold text-slate-800">{visibleAiRequestLog.promptName}</div>
                    </div>
                    {visibleAiRequestLog.visibleUserText.trim() && (
                      <div className="rounded-xl bg-white p-3">
                        <div className="text-xs text-slate-400">{activeTab === SETTING_TAB ? '修改要求' : '其他要求'}</div>
                        <div className="mt-1 break-words font-bold text-slate-800">{visibleAiRequestLog.visibleUserText}</div>
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-3 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={showLibraryAiLogTitles}
                        onChange={(event) => setShowLibraryAiLogTitles(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#08AACE] focus:ring-[#08AACE]/20"
                      />
                      <span>显示标题内容</span>
                    </label>
                  </div>
                </aside>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
                  {showLibraryAiLogTitles ? (
                    <AiRequestLogGroups groups={visibleAiRequestLogGroups} fillSingleGroup />
                  ) : (
                    <div className="ai-request-log-text min-h-0 flex-1 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                      {visibleAiRequestLogPlainPreview ? <AiRequestLogContent content={visibleAiRequestLogPlainPreview} /> : '暂无可预览内容'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
                暂无输出日志
              </div>
            )
          ) : selectedSettingImportFormatEntry ? (
            <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
              <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-slate-50">
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                  {activeSettingImportFormatTab?.groups.map((group) => (
                    <section key={group.name}>
                      <div className="flex h-9 items-center gap-2 rounded-md border border-[#BDEEF7] bg-[#EAF9FD] px-2 text-sm font-black text-slate-900">
                        <Folder className="h-4 w-4 text-[#08AACE]" />
                        <span className="min-w-0 flex-1 truncate">{group.name}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{group.entries.length}</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {group.entries.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setSettingImportFormatEntryId(entry.id)}
                            className={`flex min-h-[34px] w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-black transition-colors ${
                              selectedSettingImportFormatEntry.id === entry.id
                                ? 'border border-[#9FEAF6] bg-[#EAF9FD] text-[#08AACE]'
                                : 'bg-white text-slate-700 hover:bg-[#F8FEFF]'
                            }`}
                          >
                            <span className="min-w-0 truncate">{entry.title}</span>
                            <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-[#08AACE]">{entry.fields.length}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </aside>
              <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-5">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#08AACE]">
                      <span>{selectedSettingImportFormatEntry.tabTitle}</span>
                      <span>/</span>
                      <span>{selectedSettingImportFormatEntry.groupName}</span>
                    </div>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedSettingImportFormatEntry.title}</h3>
                  </div>
                  <span className="rounded-xl border border-cyan-200 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#08AACE]">格式预览</span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-900 bg-white p-4">
                  <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                    <div className="text-sm font-black text-slate-900">可复制格式</div>
                    <div className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {SETTING_IMPORT_FORMAT_PREVIEW_SCOPES.map((scope, index) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => setSettingImportFormatPreviewScope(scope)}
                          className={`min-w-[76px] px-3 text-xs font-black transition-colors ${index === 0 ? '' : 'border-l border-gray-200'} ${
                            settingImportFormatPreviewScope === scope
                              ? 'bg-[#EAF9FD] text-[#08AACE]'
                              : 'bg-white text-slate-500 hover:bg-[#F8FEFF] hover:text-[#08AACE]'
                          }`}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </div>
                  <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-[#FBFCFE] p-4 text-sm font-semibold leading-7 text-slate-800">
                    <SettingImportFormatPreviewText content={settingImportFormatPreview} />
                  </pre>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
              暂无格式内容
            </div>
          )}
        </div>
      </LibraryAiLogShell>
    ) : null;
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white" style={scaleStyle}>
        {libraryHeaderFontSizePortal}
        {libraryToolbarPortal}
        {renderTopTabs()}
        {categoryContextMenu}
        {entryContextMenu}
        {deleteConfirmDialog}
        {entryRenameDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {libraryAiLogModal}
        {clearSettingsConfirmDialog}
        {promptDisableContextMenu}
        {otherSettingReaderModal}
        {brainstormReaderModal}
        {brainstormRecycleModal}
        {clearBrainstormRecycleConfirmDialog}
        {brainstormPromptManagerModal}
        {brainstormPromptEditModal}
        {brainstormGenerateConfirmModal}
        {settingCreateModal}
        {categoryRenameModal}
        <div
          className="grid h-full min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateRows: activeTab === SETTING_TAB && !activeIsBrainstorm ? 'auto minmax(0,1fr)' : undefined,
            gridTemplateColumns: activeIsBrainstorm
              ? `${brainstormLayoutLeftWidth}px 0px ${brainstormLayoutPreviewWidth}px 0px minmax(${BRAINSTORM_LAYOUT_OUTPUT_MIN_WIDTH}px,1fr) 0px ${brainstormLayoutRightWidth}px`
              : settingLibraryMode === 'advanced'
              ? `${settingLibraryLeftWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
              : `${settingLibraryLeftWidth}px 0px minmax(0,1fr)`,
          }}
        >
          {settingWorkspaceTopTabs}
          <aside
            className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-gray-50 px-1 py-2"
            style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 1, gridRow: 2 } : undefined}
          >
          <div
            className={`${activeIsBrainstorm ? 'mt-0' : 'mt-2'} xy-setting-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto space-y-1 ${
              activeSettingSidebarScrollKey === 'setting-sidebar' ? 'scrollbar-active' : ''
            }`}
            onScroll={() => handleSettingSidebarScroll('setting-sidebar')}
          >
            {(activeIsSettingLike ? groupedSettingEntries : [{ type: UNCATEGORIZED_TYPE, entries: currentEntries }]).map((group) => {
              const expanded = isOutlineCharacterScope ? expandedRoleTypes.has(group.type) : expandedSettingTypes.has(group.type);
              const isDropTarget = libraryDropTarget?.tab === effectiveLibraryTab && libraryDropTarget.type === group.type;
              const previewEntries = getPreviewedLibraryGroupEntries(group.entries, effectiveLibraryTab, group.type);
              const GroupFolderIcon = expanded ? FolderOpen : Folder;
              return (
                <div
                  key={group.type}
                  data-library-group-tab={effectiveLibraryTab}
                  data-library-group-type={group.type}
                  onDragOver={(event) => handleLibraryCategoryDragOver(event, effectiveLibraryTab, group.type, group.entries.length === 0)}
                  onDragLeave={handleLibraryCategoryDragLeave}
                  onDrop={(event) => handleLibraryCategoryDrop(event, effectiveLibraryTab, group.type)}
                  className={isDropTarget ? 'rounded-xl ring-2 ring-brand/40' : undefined}
                >
                  <div className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}>
                    <button
                      onContextMenu={(event) => {
                        if (activeIsSettingLike && !activeIsBrainstorm) openCategoryMenu(event, isOutlineCharacterScope ? 'role' : 'setting', group.type);
                      }}
                      onClick={() => {
                        setExpandedSettingTypes((prev) => {
                          if (isOutlineCharacterScope) return prev;
                          const next = new Set(prev);
                          if (next.has(group.type)) next.delete(group.type);
                          else next.add(group.type);
                          return next;
                        });
                        if (isOutlineCharacterScope) {
                          setExpandedRoleTypes((prev) => {
                            const next = new Set(prev);
                            if (next.has(group.type)) next.delete(group.type);
                            else next.add(group.type);
                            return next;
                          });
                        }
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-expanded={expanded}
                    >
                      <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                      <span className="min-w-0 flex-1 truncate leading-none">{group.type}</span>
                      <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{previewEntries.length}</span>
                    </button>
                  </div>
                  {expanded && (
                    <div className="mt-0.5 space-y-0.5">
                      {previewEntries.length === 0 ? (
                        <div className={WORKBENCH_LIBRARY_ENTRY_EMPTY_CLASS}>
                          {isOutlineCharacterScope ? '暂无角色' : activeTab === SETTING_TAB ? '暂无设定' : `该分类下暂无${activeTab}`}
                        </div>
                      ) : previewEntries.map((entry, previewIndex) => {
                        const parsed = activeIsSettingLike ? parseSettingContent(entry.content) : null;
                        const role = isOutlineCharacterScope ? parseRoleContent(entry.content) : null;
                        const entryWordCount = countTextWords(role ? getRoleReadableContent(role) : parsed ? parsed.body : entry.content);
                        return (
                          <button
                            key={entry.id}
                            data-library-entry-id={entry.id}
                            data-library-entry-tab={effectiveLibraryTab}
                            data-library-entry-type={role?.type ?? parsed?.type ?? group.type}
                            data-library-entry-preview-index={previewIndex}
                            onDragStart={(event) => handleLibraryEntryDragStart(event, entry, role?.type ?? parsed?.type ?? group.type)}
                            onDragOver={(event) => handleLibraryEntryDragOver(event, entry, role?.type ?? parsed?.type ?? group.type, previewIndex)}
                            onDrop={(event) => handleLibraryEntryDrop(event, entry, role?.type ?? parsed?.type ?? group.type, previewIndex)}
                            onDragEnd={handleLibraryEntryDragEnd}
                            onPointerDown={(event) => beginLibraryEntryPointerDrag(event, entry, role?.type ?? parsed?.type ?? group.type)}
                            onPointerMove={updateLibraryEntryPointerPreview}
                            onPointerUp={finishLibraryEntryPointerDrag}
                            onPointerCancel={finishLibraryEntryPointerDrag}
                            onContextMenu={(event) => openEntryMenu(event, entry)}
                            onClick={(event) => {
                              if (libraryPointerSuppressClickRef.current) {
                                event.preventDefault();
                                event.stopPropagation();
                                return;
                              }
                              setSelectedIdForTab(effectiveLibraryTab, entry.id);
                            }}
                            className={`${WORKBENCH_LIBRARY_ENTRY_BUTTON_CLASS} ${
                              currentSelectedEntry?.id === entry.id
                                ? activeIsBrainstorm
                                  ? 'border-transparent xy-selected-mint-bg text-gray-900'
                                  : 'border-transparent xy-selected-mint-bg text-gray-900'
                                : activeIsBrainstorm
                                  ? 'border-transparent bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                                  : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                            } ${draggingLibraryEntry?.entryId === entry.id ? 'cursor-grabbing scale-[0.99] opacity-80 ring-2 ring-[#08AACE]/35 shadow-sm' : ''}`}
                          >
                            <div className="flex w-full items-center gap-2">
                              <span className="min-w-0 truncate pl-3 text-sm font-black text-gray-700">{entry.title}</span>
                              <span className="ml-auto shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-black text-[#08AACE]">
                                <WordCountText value={entryWordCount} compact />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
          {!activeIsBrainstorm && (
            <div className="mt-3 shrink-0 space-y-2">
              <div className="grid h-11 grid-cols-3 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                <div
                  className="flex min-w-0 items-center justify-center whitespace-nowrap border-r border-slate-200 bg-[#DFF7FC] px-2 text-sm font-black text-[#08AACE]"
                  aria-disabled="true"
                >
                  新建
                </div>
                <button
                  type="button"
                  onClick={() => openSettingCreateDialog('category')}
                  className="min-w-0 whitespace-nowrap border-r border-slate-200 bg-white px-2 text-sm font-black text-slate-700 transition-colors hover:bg-[#EAF9FD] hover:text-[#08AACE]"
                >
                  分组
                </button>
                <button
                  type="button"
                  onClick={() => openSettingCreateDialog('setting')}
                  className="min-w-0 whitespace-nowrap bg-white px-2 text-sm font-black text-slate-700 transition-colors hover:bg-[#EAF9FD] hover:text-[#08AACE]"
                >
                  {isOutlineCharacterScope ? '角色' : '设定'}
                </button>
              </div>
            </div>
          )}
          {activeIsBrainstorm && (
            <div className="shrink-0 border-t border-gray-100 bg-gray-50 pt-3">
              <button
                type="button"
                onClick={() => setIsBrainstormRecycleOpen(true)}
                className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-left shadow-sm transition-colors hover:border-red-200 hover:bg-red-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </span>
                  <span className="truncate text-sm font-black text-slate-800">脑洞回收站</span>
                </span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-red-400">
                  {brainstormRecycleEntries.length}
                </span>
              </button>
            </div>
          )}
          </aside>
          {leftResizeHandle}

          <main
            className={`min-w-0 flex min-h-0 flex-col bg-white ${settingLibraryMode === 'advanced' ? 'border-r border-gray-100' : ''}`}
            style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 3, gridRow: 2 } : undefined}
          >
          {isOutlineCharacterScope ? (
            currentSelectedEntry && currentSelectedRole ? (
              <RoleBaseStateEditor
                entry={currentSelectedEntry}
                role={currentSelectedRole}
                roleEntries={roleEntries}
                roleTypeOptions={roleTypeOptions}
                roleTextFontSize={roleTextFontSize}
                currentChapterNumber={currentOutlineChapterNumber}
                roleLifeStatus={currentSelectedRoleLifeStatus}
                onTitleChange={(title) => updateEntry(currentSelectedEntry.id, { title })}
                onRoleChange={updateOutlineCharacterRole}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">点击左侧“新建角色”开始创建角色</div>
            )
          ) : activeIsBrainstorm ? (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="relative min-h-0 flex-1">
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-brainstorm-preview-field xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${currentBrainstormBody.trim() ? 'xy-has-value' : ''}`}>
                  <textarea
                    value={currentBrainstormBody}
                    onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}
                    onChange={(event) => {
                      if (!currentSelectedEntry || !currentSelectedSetting) return;
                      updateEntry(currentSelectedEntry.id, {
                        content: stringifySettingContent({ ...currentSelectedSetting, body: event.target.value }),
                      });
                    }}
                    placeholder="这里显示选中的脑洞内容，也可以直接编辑。"
                    className="editor-scrollbar text-sm leading-7 text-gray-700"
                    style={{ fontSize: brainstormPreviewFontSize }}
                  />
                  <label aria-hidden="true" className="opacity-0">脑洞预览</label>
                  {currentSelectedEntry && (
                    <div className="xy-floating-inline-title-tool xy-brainstorm-floating-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
                      <input
                        value={currentSelectedEntry.title}
                        onFocus={() => setActiveLibraryFontTarget('brainstormPreview')}
                        onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                        className="xy-floating-title-input max-w-[120px] min-w-[58px] text-sm font-black leading-none text-slate-950 outline-none"
                        style={getFloatingTitleInputStyle(currentSelectedEntry.title, 3, 9)}
                        aria-label="脑洞名称"
                      />
                      <span><WordCountText value={currentBrainstormPreviewWordCount} /></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : currentSelectedEntry ? (
            <div className={`flex min-h-0 flex-1 flex-col ${currentStructuredTitleFieldLabel ? 'px-5 py-3' : 'p-5'}`}>
              {currentStructuredTitleFieldLabel ? (
                <header className="shrink-0 border-b border-slate-200 pb-3">
                  <div data-testid="structured-title-row" className="flex items-start gap-4 overflow-x-auto pb-1">
                    <label
                      data-testid="structured-title-field"
                      className="relative flex h-[48px] w-[168px] shrink-0 items-center rounded-[20px] border-2 border-slate-950 bg-white px-4 py-0"
                    >
                      <span className="xy-border-embedded-transparent-backplate absolute left-5 top-0 z-10 -translate-y-1/2 pr-2 text-sm font-medium leading-5 text-slate-500">
                        {currentStructuredTitleFieldLabel}
                      </span>
                      <input
                        data-no-modal-drag="true"
                        aria-label={currentStructuredTitleFieldLabel}
                        value={currentSelectedEntry.title}
                        disabled={currentSelectedSettingIsLockedDefault}
                        onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                        placeholder={currentStructuredTitleFieldLabel}
                        title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
                        className={`h-7 w-full bg-transparent text-lg font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 ${
                          currentSelectedSettingIsLockedDefault ? 'cursor-not-allowed text-slate-500' : ''
                        }`}
                      />
                    </label>
                    {currentStructuredSettingFieldSet?.headerFieldKeys?.map((fieldKey) => {
                      const field = currentStructuredSettingFieldSet.fields.find((item) => item.key === fieldKey);
                      if (!field) return null;
                      const value = currentStructuredSettingFields[field.key] ?? '';
                      return (
                        <div
                          key={field.key}
                          className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'h-[48px] w-[150px] shrink-0'} ${value.trim() ? 'xy-has-value' : ''}`}
                        >
                          <input
                            data-no-modal-drag="true"
                            aria-label={field.title}
                            value={value}
                            maxLength={field.maxLength}
                            onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                            onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                            placeholder={field.placeholder ?? `填写${field.title}`}
                            className="text-sm leading-7 text-gray-700"
                            style={{ fontSize: settingPreviewFontSize }}
                          />
                          <label className="xy-floating-title-count">{field.title} <span><WordCountText value={countTextWords(value)} /></span></label>
                        </div>
                      );
                    })}
                    {currentStructuredSettingFieldSet?.groups ? (
                      <div aria-hidden="true" className="h-9 w-[112px] shrink-0" />
                    ) : null}
                  </div>
                  {currentStructuredSettingFieldSet?.groups ? (
                    <div className="mt-3 flex items-center justify-between gap-4 overflow-x-auto pb-1">
                      <SettingSegmentedTabs
                        tabs={STRUCTURED_SETTING_TABS}
                        activeTab={activeStructuredSettingTab}
                        onChange={setActiveStructuredSettingTab}
                      />
                      {activeStructuredSettingTab !== '确认' && currentStructuredActiveGroup ? (
                        <p className="shrink-0 text-xs font-black text-slate-400">
                          {currentStructuredActiveGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </header>
              ) : (
                <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                  <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                    <div
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size ${currentSelectedEntry.title.trim() ? 'xy-has-value' : ''}`}
                      style={getFieldSizeStyle('settingName')}
                    >
                      <input
                        data-no-modal-drag="true"
                        value={currentSelectedEntry.title}
                        disabled={currentSelectedSettingIsLockedDefault}
                        onChange={(event) => updateEntry(currentSelectedEntry.id, { title: event.target.value })}
                        placeholder="设定名"
                        title={currentSelectedSettingIsLockedDefault ? '默认设定条目已锁定，不能改名' : undefined}
                        className={currentSelectedSettingIsLockedDefault ? 'cursor-not-allowed text-slate-500' : undefined}
                      />
                      <label>设定名</label>
                    </div>
                  </div>
                </div>
              )}
              <div className="relative min-h-0 flex-1">
                {currentStructuredSettingFieldSet ? (
                  currentStructuredSettingFieldSet.groups ? (
                    (() => {
                      const activeGroup = currentStructuredActiveGroup;
                      return (
                    <div className="flex h-full min-h-0 flex-col gap-3">
                      {!currentStructuredTitleFieldLabel ? (
                        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 pb-3">
                          <SettingSegmentedTabs
                            tabs={STRUCTURED_SETTING_TABS}
                            activeTab={activeStructuredSettingTab}
                            onChange={setActiveStructuredSettingTab}
                          />
                          {activeStructuredSettingTab !== '确认' && activeGroup ? (
                            <p className="shrink-0 text-xs font-black text-slate-400">
                              {activeGroup.title}共 {currentStructuredActiveGroupWordCount} 字
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {activeStructuredSettingTab === '确认' ? (
                        <section className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                          <h3 className="text-sm font-black text-cyan-800">确认更新</h3>
                          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                            AI 反馈进入确认区后，左侧显示未更新前内容，右侧显示更新后内容，确认后才写入状态设定。
                          </p>
                        </section>
                      ) : activeGroup ? (
                        <section
                          key={activeGroup.title}
                          className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        >
                          <div data-testid="structured-setting-fields" className={`grid min-h-0 flex-1 grid-cols-2 gap-3 px-1 pb-1 pr-2 pt-3 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}>
                            {activeGroup.fieldKeys.filter((fieldKey) => !currentStructuredHeaderFieldKeys.has(fieldKey)).map((fieldKey) => {
                              const field = currentStructuredSettingFieldSet.fields.find((item) => item.key === fieldKey);
                              if (!field) return null;
                              const value = currentStructuredSettingFields[field.key] ?? '';
                              const fieldControl = field.control ?? 'textarea';
                              return (
                                <div
                                  key={field.key}
                                  className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                                >
                                  {fieldControl === 'input' ? (
                                    <input
                                      data-no-modal-drag="true"
                                      aria-label={field.title}
                                      value={value}
                                      maxLength={field.maxLength}
                                      onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                      onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                      placeholder={field.placeholder ?? `填写${field.title}`}
                                      className="text-sm leading-7 text-gray-700"
                                      style={{ fontSize: settingPreviewFontSize }}
                                    />
                                  ) : (
                                    <textarea
                                      data-no-modal-drag="true"
                                      aria-label={field.title}
                                      value={value}
                                      onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                      onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                      onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`)}
                                      placeholder={field.placeholder ?? `填写${field.title}`}
                                      className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                                        activeSettingSidebarScrollKey === `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}` ? 'scrollbar-active' : ''
                                      }`}
                                      style={{ fontSize: settingPreviewFontSize }}
                                    />
                                  )}
                                  <label className="xy-floating-title-count">{field.title} <span><WordCountText value={countTextWords(value)} /></span></label>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ) : null}
                    </div>
                      );
                    })()
                  ) : (
                    <div data-testid="structured-setting-fields" className={`grid h-full min-h-0 ${currentStructuredSettingFieldSet.gridColumnsClassName} gap-4 ${currentStructuredSettingFieldSet.gridContentClassName ?? ''}`}>
                      {currentStructuredSettingFieldSet.fields.filter((field) => !currentStructuredHeaderFieldKeys.has(field.key)).map((field) => {
                        const value = currentStructuredSettingFields[field.key] ?? '';
                        const fieldControl = field.control ?? 'textarea';
                        return (
                          <div
                            key={field.key}
                            className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count xy-floating-visible-placeholder xy-structured-setting-field ${field.fieldClassName ?? 'min-h-0 flex-1'} ${value.trim() ? 'xy-has-value' : ''}`}
                          >
                            {fieldControl === 'input' ? (
                              <input
                                data-no-modal-drag="true"
                                aria-label={field.title}
                                value={value}
                                maxLength={field.maxLength}
                                onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                placeholder={field.placeholder ?? `填写${field.title}`}
                                className="text-sm leading-7 text-gray-700"
                                style={{ fontSize: settingPreviewFontSize }}
                              />
                            ) : (
                              <textarea
                                data-no-modal-drag="true"
                                aria-label={field.title}
                                value={value}
                                onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                                onChange={(event) => updateStructuredSettingField(field.key, event.target.value)}
                                onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}`)}
                                placeholder={field.placeholder ?? `填写${field.title}`}
                                className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                                  activeSettingSidebarScrollKey === `setting-textarea:${currentStructuredSettingFieldSet.id}:${field.key}` ? 'scrollbar-active' : ''
                                }`}
                                style={{ fontSize: settingPreviewFontSize }}
                              />
                            )}
                            <label className="xy-floating-title-count">{field.title} <span><WordCountText value={countTextWords(value)} /></span></label>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content).trim() ? 'xy-has-value' : ''}`}>
                    <textarea
                      data-no-modal-drag="true"
                      value={currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content}
                      onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                      onChange={(event) => updateEntry(currentSelectedEntry.id, {
                        content: currentSelectedSetting
                          ? stringifySettingContent({ ...currentSelectedSetting, body: event.target.value })
                          : event.target.value,
                      })}
                      onScroll={() => handleSettingSidebarScroll(`setting-textarea:${currentSelectedEntry.id}`)}
                      placeholder="这里显示选中的设定内容，也可以直接编辑。"
                      className={`scrollbar-scroll-only scrollbar-half-width text-sm leading-7 text-gray-700 ${
                        activeSettingSidebarScrollKey === `setting-textarea:${currentSelectedEntry.id}` ? 'scrollbar-active' : ''
                      }`}
                      style={{ fontSize: settingPreviewFontSize }}
                    />
                    <label className="xy-floating-title-count">设定预览 <span><WordCountText value={countTextWords(currentSelectedSetting ? currentSelectedSetting.body : currentSelectedEntry.content)} /></span></label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col p-5">
              <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
                <div className="max-w-full" style={{ width: fieldSizeSpecs.settingName.width }}>
                  <div
                    className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-setting-name xy-floating-custom-field-size"
                    style={getFieldSizeStyle('settingName')}
                  >
                    <input
                      data-no-modal-drag="true"
                      value=""
                      onChange={(event) => {
                        const title = event.target.value;
                        if (!title.trim()) return;
                        createEditableSettingEntry({ title });
                      }}
                      placeholder="输入设定名"
                    />
                    <label>设定名</label>
                  </div>
                </div>
              </div>
              <div className="relative min-h-0 flex-1">
                <div className="xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1">
                  <textarea
                    data-no-modal-drag="true"
                    value=""
                    onChange={(event) => {
                      const body = event.target.value;
                      if (!body.trim()) return;
                      createEditableSettingEntry({
                        content: stringifySettingContent({ type: activeSettingWorkspaceType ?? DEFAULT_SETTING_ENTRY_TYPE, body }),
                      });
                    }}
                    onFocus={() => setActiveLibraryFontTarget('settingPreview')}
                    placeholder="这里可以直接输入设定内容，会自动新建设定。"
                    className="editor-scrollbar text-sm leading-7 text-gray-700"
                    style={{ fontSize: settingPreviewFontSize }}
                  />
                  <label className="xy-floating-title-count">设定预览 <span><WordCountText value={0} /></span></label>
                </div>
              </div>
            </div>
          )}
          </main>

          {activeIsBrainstorm && brainstormPreviewResizeHandle}

          {activeIsBrainstorm && (
            <section className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
              <div className="flex min-h-0 flex-1 flex-col gap-5 p-4">
                <div className="editor-scrollbar xy-brainstorm-output-preview-list flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                  {brainstormOutputPreviews.map((previewValue, index) => {
                    const titleValue = brainstormOutputTitles[index] ?? getTemporaryBrainstormTitle(index);
                    const previewWordCount = countTextWords(previewValue);
                    const outputChecked = selectedBrainstormOutputIndexSet.has(index);
                    return (
                      <div key={index} className="relative min-h-[120px] flex-1">
                        <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${previewValue.trim() ? 'xy-has-value' : ''}`}>
                          <textarea
                            value={previewValue}
                            onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}
                            onScroll={() => handleBrainstormOutputTextareaScroll(index)}
                            onChange={(event) => setBrainstormOutputPreviewDraft(index, event.target.value)}
                            placeholder={`这里显示本次 AI 生成的${titleValue}，保存脑洞时只保存这里的内容。`}
                            className={`scrollbar-scroll-only text-sm leading-6 text-gray-700 ${activeBrainstormOutputScrollIndex === index ? 'scrollbar-active' : ''}`}
                            style={{ fontSize: brainstormOutputFontSize }}
                          />
                          <label aria-hidden="true" className="opacity-0">脑洞输出框</label>
                        </div>
                        <div className="xy-floating-inline-title-tool xy-brainstorm-output-title-tool xy-floating-title-count xy-border-embedded-transparent-backplate absolute top-0 z-20 -translate-y-1/2">
                          {showBrainstormOutputSelection && (
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={outputChecked}
                              aria-label={`${titleValue}保存勾选`}
                              onClick={() => toggleBrainstormOutputPreviewSelected(index)}
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] font-black leading-none transition-colors ${
                                outputChecked
                                  ? 'border-[#08AACE] bg-[#08AACE] text-white'
                                  : 'border-slate-300 bg-white text-transparent hover:border-[#08AACE]'
                              }`}
                            >
                              ✓
                            </button>
                          )}
                          <input
                            value={titleValue}
                            onFocus={() => setActiveLibraryFontTarget('brainstormOutput')}
                            onChange={(event) => setBrainstormOutputPreviewTitle(index, event.target.value)}
                            className="xy-floating-title-input max-w-[180px] min-w-[72px] text-sm font-black leading-none text-slate-950 outline-none"
                            style={getFloatingTitleInputStyle(titleValue, 4, 12)}
                            aria-label={`脑洞输出名称 ${index + 1}`}
                          />
                          <span><WordCountText value={previewWordCount} /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="shrink-0 space-y-3">
                  <AiInlineInput
                    ref={libraryAiInputRef}
                    value={aiInput}
                    onChange={(event) => {
                      setAiInput(event.target.value);
                      resizeFloatingAiTextarea(event.currentTarget);
                    }}
                    onKeyDown={handleLibraryAiInputKeyDown}
                    onSend={() => void sendLibraryAiMessage()}
                    onStop={stopLibraryAiMessage}
                    sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                    stopDisabled={!isLibraryAiLoading}
                    placeholder="输入对话指令..."
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <div className="xy-capsule-group overflow-hidden">
                      <button
                        onClick={() => saveBrainstormOutput(currentSelectedEntry?.id)}
                        disabled={!currentSelectedEntry || selectedBrainstormOutputCount !== 1}
                        className="xy-capsule-button"
                      >
                        替换当前脑洞
                      </button>
                      <button
                        onClick={saveBrainstormOutputAsNew}
                        disabled={selectedBrainstormOutputCount === 0}
                        className="xy-capsule-button"
                      >
                        保存为新脑洞
                      </button>
                      </div>
                      <div className="xy-capsule-group overflow-hidden">
                      <button
                        type="button"
                        onClick={copyBrainstormOutputArea}
                        disabled={!brainstormOutputValue.trim()}
                        className="xy-capsule-button"
                      >
                        复制脑洞
                      </button>
                      <button
                        type="button"
                        onClick={clearBrainstormOutputArea}
                        disabled={!brainstormOutputValue.trim() && !isLibraryAiLoading}
                        className="xy-capsule-button text-red-500 hover:text-red-600 disabled:text-red-300"
                      >
                        清空脑洞
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {settingLibraryMode === 'advanced' && (
          <>
          {rightResizeHandle}
          <aside
            className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2"
            style={activeTab === SETTING_TAB && !activeIsBrainstorm ? { gridColumn: 5, gridRow: '1 / 3' } : undefined}
          >
          <div className="shrink-0">
            {showPanelHeader && (
            <div className="flex items-center justify-between gap-3">
              {activeTab !== SETTING_TAB ? (
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="shrink-0 text-base font-bold text-gray-900">{panelTitle}</h3>
                </div>
              ) : <div />}
              <div className="flex shrink-0 items-center gap-2">
                {!libraryToolbarPortalTarget && (
                  <>
                    {renderFieldSizeButton()}
                    {showHeaderLibraryAiLogButton && renderLibraryAiLogButton('library')}
                    {showInlineLibraryAiLogButton && renderLibraryAiLogButton('library')}
                  </>
                )}
              </div>
            </div>
            )}
            <div className={`${showPanelHeader ? 'mt-3' : ''} space-y-3`}>
              <div className="flex max-w-full items-start gap-2">
                <CombinedAiConfigSelect
                  style={activeIsBrainstorm ? ({
                    ...getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model')),
                    width: '100%',
                    maxWidth: '100%',
                    '--xy-field-width': '100%',
                  } as CSSProperties) : getEmbeddedConfigSelectStyle(getConfigFieldSizeStyle(rightSelectFieldTab, 'model'))}
                  className={activeIsBrainstorm ? 'w-full' : undefined}
                  modelValue={activeTabConfig.modelId ?? ''}
                  promptValue={activePromptId ?? ''}
                  modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                  promptOptions={activeTabPrompts.length === 0 ? [{ value: '', label: `暂无${promptCategoryLabel}提示词`, disabled: true }] : activeTabPrompts.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                  onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                  onPromptChange={(value) => updateActiveTabConfig({ promptId: value })}
                  onModelManage={() => setManagementModal({ type: 'models' })}
                  onPromptManage={() => setManagementModal({
                    type: 'prompts',
                    category: activeIsBrainstorm
                      ? BRAINSTORM_TAB
                      : activeTab === SETTING_TAB
                        ? PROMPT_SETTING_CATEGORY
                      : activeTab === DETAIL_OUTLINE_TAB
                        ? DETAIL_OUTLINE_PROMPT_CATEGORY
                      : activeTab,
                  })}
                  promptDisabled={effectivePromptDisabled}
                  onPromptContextMenu={showPromptDisableButton ? (event) => {
                    event.preventDefault();
                    const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, PROMPT_DISABLE_CONTEXT_MENU_SIZE);
                    setPromptDisableMenu({
                      tab: activeTab,
                      disabled: effectivePromptDisabled,
                      x: left,
                      y: top,
                    });
                  } : undefined}
                />
              </div>
            </div>
          </div>
          {activeIsBrainstorm ? (
            <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="xy-brainstorm-question-panel xy-shellless-panel editor-scrollbar min-h-0 flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 py-2">
                <div className="flex min-h-full flex-col gap-4 pt-2">
                  {BRAINSTORM_QUESTION_FIELDS.map((field, index) => {
                    const isLastField = index === BRAINSTORM_QUESTION_FIELDS.length - 1;
                    const questionRows = getBrainstormQuestionRows(brainstormQuestionDraft[field.key]);
                    const isCountField = field.key === 'brainstormCount';
                    if (isCountField) return null;
                    if (field.key === 'brainstormBackground') return null;
                    if (field.key === 'brainstormGenre') {
                      const pairedFields = BRAINSTORM_QUESTION_FIELDS.filter((item) => (
                        item.key === 'brainstormGenre' || item.key === 'brainstormBackground'
                      ));
                      return (
                        <div key="brainstorm-genre-background-row" className="grid shrink-0 grid-cols-2 gap-4 text-sm font-bold text-gray-700">
                          {pairedFields.map((pairedField) => {
                            const pairedRows = getBrainstormQuestionRows(brainstormQuestionDraft[pairedField.key]);
                            return (
                              <div
                                key={pairedField.key}
                                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${brainstormQuestionDraft[pairedField.key].trim() ? 'xy-has-value' : ''}`}
                              >
                                <textarea
                                  value={brainstormQuestionDraft[pairedField.key]}
                                  onChange={(event) => setBrainstormQuestionField(pairedField.key, event.target.value)}
                                  placeholder={pairedField.placeholder}
                                  rows={1}
                                  className="font-bold leading-5"
                                  style={{
                                    height: `${Math.max(52, pairedRows * 20 + 32)}px`,
                                    overflowY: 'hidden',
                                  }}
                                />
                                <label>{pairedField.label}</label>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                    <div key={field.key} className="block shrink-0 text-sm font-bold text-gray-700">
                      <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-compact-textarea xy-floating-visible-placeholder ${brainstormQuestionDraft[field.key].trim() ? 'xy-has-value' : ''}`}>
                        <textarea
                          value={brainstormQuestionDraft[field.key]}
                          onChange={(event) => setBrainstormQuestionField(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          rows={1}
                          className={`font-bold leading-5 ${isLastField ? 'min-h-0 flex-1' : ''}`}
                          style={isLastField ? {
                            minHeight: `${Math.max(180, questionRows * 20 + 52)}px`,
                            height: '100%',
                            overflowY: 'hidden',
                          } : {
                            height: `${Math.max(52, questionRows * 20 + 32)}px`,
                            overflowY: 'hidden',
                          }}
                        />
                      <label>{field.label}</label>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="shrink-0 text-sm font-black text-slate-950">逐个生成</span>
                  <div className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {['3', '5', '10'].map((value) => {
                      const active = brainstormQuestionDraft.brainstormCount === value;
                      return (
                        <button
                          {...{ key: value }}
                          type="button"
                          onClick={() => setBrainstormQuestionField('brainstormCount', active ? '' : value)}
                          className={`min-w-0 flex-1 border-r border-slate-200 px-2 text-sm font-black leading-none transition-colors last:border-r-0 ${
                            active
                              ? 'bg-[#08AACE] text-white'
                              : 'bg-white text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={openBrainstormGenerateConfirm}
                  disabled={isLibraryAiLoading}
                  className="h-10 w-20 shrink-0 whitespace-nowrap rounded-xl bg-brand px-0 text-sm font-bold leading-none text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLibraryAiLoading ? '生成中...' : '逐个生成'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mt-5 min-h-0 flex-1">
              <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill h-full xy-has-value">
                <label className="xy-floating-title-count xy-border-embedded-transparent-backplate">生成设定</label>
                <button
                  type="button"
                  onClick={clearLibraryAiDialog}
                  disabled={!hasLibraryAiContent && !isLibraryAiLoading}
                  className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-top-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600 disabled:text-red-300"
                >
                  清空
                </button>
                <div
                  ref={libraryAiOutputRef}
                  onScroll={handleLibraryAiOutputScroll}
                  className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto text-sm leading-6 text-gray-700"
                >
                  {aiChatTurns.length === 0 ? (
                    <div />
                  ) : (
                    <div className="space-y-3">
                      {aiChatTurns.map((turn, index) => (
                        <div key={`${turn.role}-${index}`} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                              turn.role === 'user'
                                ? 'max-w-[82%] bg-brand text-white'
                                : 'max-w-[96%] border border-gray-200 bg-gray-50 text-gray-800'
                            }`}
                          >
                            {renderAiChatContent(turn.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </div>
              <>
              {activeTab === SETTING_TAB && (
                <div className="mt-3 flex min-w-0 items-center gap-1.5">
                  <div className="flex h-9 shrink-0 overflow-hidden rounded-xl border border-[#08B3D9] bg-white shadow-sm">
                    <div className="flex w-12 items-center justify-center border-r border-[#08B3D9]/30 bg-[#E9FAFE] text-sm font-black text-[#078BA9]">
                      关联
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSettingLinkSource === 'current') {
                          updateActiveTabConfig({ associationSessionId: null, settingLinkSource: null, promptDisabled: false });
                          return;
                        }
                        updateActiveTabConfig({
                          associationSessionId: getWorkbenchAssociationRuntimeId(),
                          settingLinkSource: 'current',
                          loadedBrainstormId: null,
                          loadedBrainstormTitle: '',
                          loadedBrainstormText: '',
                          linkedOtherSettingIds: [],
                          promptDisabled: true,
                        });
                      }}
                      disabled={!currentSelectedEntry}
                      className={`w-[86px] px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 ${
                        activeSettingLinkSource === 'current'
                          ? 'bg-[#08B3D9] text-white'
                          : 'bg-white text-gray-600 hover:bg-[#E9FAFE] hover:text-[#08B3D9]'
                      }`}
                      title={isOutlineCharacterScope ? '关联当前人物设定' : '关联当前选中的设定预览'}
                    >
                      当前设定
                    </button>
                    {activeSettingLinkSource === 'other' ? (
                      <div className="flex border-l border-[#08B3D9]/30">
                        <button
                          type="button"
                          onClick={openOtherSettingReader}
                          className="w-[96px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                          title="重新选择关联其他设定"
                        >
                          其他设定
                        </button>
                        <button
                          type="button"
                          onClick={clearActiveLinkedOtherSettings}
                          className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                          title="取消关联其他设定"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={openOtherSettingReader}
                        className="w-[86px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                        title="关联其他设定"
                      >
                        其他设定
                      </button>
                    )}
                    {activeSettingLinkSource === 'brainstorm' ? (
                      <div className="flex border-l border-[#08B3D9]/30">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                            setIsBrainstormReaderOpen(true);
                          }}
                          className="w-[90px] px-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                          title="重新选择关联脑洞"
                        >
                          已关联脑洞
                        </button>
                        <button
                          type="button"
                          onClick={clearActiveLinkedBrainstorm}
                          className="grid w-9 place-items-center bg-red-500 text-white transition-colors hover:bg-red-600"
                          title="取消关联脑洞"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrainstormReaderId(activeTabConfig.loadedBrainstormId ?? null);
                          setIsBrainstormReaderOpen(true);
                        }}
                        className="w-[68px] border-l border-[#08B3D9]/30 bg-white px-2 text-sm font-bold text-gray-600 transition-colors hover:bg-[#E9FAFE] hover:text-[#08B3D9]"
                        title={isOutlineCharacterScope ? '关联脑洞库内容到人物设定' : '关联脑洞库内容'}
                      >
                        脑洞
                      </button>
                    )}
                  </div>
                  {activeSettingLinkSource && (
                    <span className="min-w-0 shrink whitespace-nowrap text-xs font-bold text-slate-400">
                      关联 <WordCountText value={linkedSettingWordCount} compact />
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                {activeTab === SETTING_TAB ? (
                  <div className="flex h-10 w-44 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={smartImportSettings}
                      disabled={smartImportLocked}
                      className={`min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-bold transition-colors ${
                        smartImportLocked
                          ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                          : 'bg-[#08AACE] text-white hover:bg-[#0796B8]'
                      }`}
                    >
                      智能导入设定
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveTabConfig({ smartImportLocked: !smartImportLocked })}
                      className={`flex h-full w-10 shrink-0 items-center justify-center border-l transition-colors ${
                        smartImportLocked
                          ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600'
                          : 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#08AACE] hover:bg-[#DDF5FB] hover:text-[#078fb0]'
                      }`}
                      title={smartImportLocked ? '解锁智能导入设定' : '锁定智能导入设定'}
                    >
                      {smartImportLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentSelectedEntry) {
                        addEntryToTab(activeTab, `新建${activeTab}`);
                        return;
                      }
                      updateEntry(currentSelectedEntry.id, { title: currentSelectedEntry.title || `新建${activeTab}` });
                    }}
                    className="h-10 w-1/3 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                  >
                    保存为新{activeTab}
                  </button>
                )}
              </div>
              <div className="mt-3">
              <AiInlineInput
                ref={libraryAiInputRef}
                value={aiInput}
                onChange={(event) => {
                  setAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={handleLibraryAiInputKeyDown}
                onSend={() => void sendLibraryAiMessage()}
                onStop={stopLibraryAiMessage}
                sendDisabled={isLibraryAiLoading || !canSendLibraryAiMessage}
                stopDisabled={!isLibraryAiLoading}
                placeholder="输入对话指令..."
              />
              </div>
              </>
            </>
          )}
          </aside>
          </>
          )}
        </div>
      </div>
    );
  }

  if ((tabs.includes(CHAPTER_SUMMARY_TAB) && tabs.includes(VOLUME_SUMMARY_TAB)) || activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) {
    const isDetailOutlineTab = activeTab === DETAIL_OUTLINE_TAB;
    const enableVolumeSummary = !isDetailOutlineTab;
    const outlineChapterTab = isDetailOutlineTab ? CHAPTER_DETAIL_OUTLINE_TAB : CHAPTER_SUMMARY_TAB;
    const safeOutlineSelectionType = isDetailOutlineTab ? 'chapter' : outlineSelectionType;
    const currentOutlineEntries = activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey ? outlineEntries : entries;
    const persistCurrentOutline = (next: WorkbenchLibraryEntry[]) => {
      if (activeTab === OUTLINE_LIBRARY_TAB && outlineStorageKey) {
        const normalized = normalizeEntries(next);
        setOutlineEntries(normalized);
        writeWorkbenchLibraryEntries(outlineStorageKey, normalized);
        return;
      }
      persist(next);
    };
    const updateOutlineEntry = (id: string, updates: Partial<Pick<WorkbenchLibraryEntry, 'title' | 'content'>>) => {
      const next = currentOutlineEntries.map((entry) => (
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toLocaleString('zh-CN') }
          : entry
      ));
      persistCurrentOutline(next);
    };
    const chapterEntries = currentOutlineEntries.filter((entry) => entry.tab === outlineChapterTab);
    const volumeEntries = enableVolumeSummary
      ? currentOutlineEntries.filter((entry) => (
        entry.tab === VOLUME_SUMMARY_TAB
        || entry.tab === LEGACY_VOLUME_SUMMARY_TAB
        || entry.tab === LEGACY_VOLUME_SUMMARY_TAB_OLD
      ))
      : [];
    const outlineChapters = volumes.flatMap((volume) => (
      [...volume.chapters]
        .sort((a, b) => a.serialNumber - b.serialNumber)
        .map((chapter) => ({ volume, chapter }))
    ));
    const isDetailOutlineChapterPublished = (chapter: Chapter) => Boolean(chapter.isPublished) || manualDetailOutlinePublishedChapterIds.has(chapter.id);
    const filterDetailOutlineVolumesByPublishState = (published: boolean) => (
      volumes
        .map((volume) => ({
          ...volume,
          chapters: [...volume.chapters]
            .filter((chapter) => isDetailOutlineChapterPublished(chapter) === published)
            .sort((a, b) => a.serialNumber - b.serialNumber),
        }))
    );
    const detailOutlineUnpublishedVolumes = filterDetailOutlineVolumesByPublishState(false);
    const detailOutlinePublishedVolumes = filterDetailOutlineVolumesByPublishState(true);
    const detailOutlineUnpublishedCount = detailOutlineUnpublishedVolumes.reduce((sum, volume) => sum + volume.chapters.length, 0);
    const detailOutlinePublishedCount = detailOutlinePublishedVolumes.reduce((sum, volume) => sum + volume.chapters.length, 0);
    const selectedOutlineChapter = outlineChapters.find((item) => item.chapter.id === selectedOutlineChapterId) ?? outlineChapters[0] ?? null;
    const selectedOutlineVolume = volumes.find((volume) => volume.id === selectedOutlineVolumeId) ?? volumes[0] ?? null;
    const effectiveSelectedOutlineChapterId = safeOutlineSelectionType === 'chapter'
      ? selectedOutlineChapterId ?? selectedOutlineChapter?.chapter.id ?? null
      : null;
    const getChapterSummaryTitle = (serialNumber: number) => isDetailOutlineTab ? `第${serialNumber}章细纲` : `第${serialNumber}章梗概`;
    const getLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章摘要`;
    const getOlderLegacyChapterSummaryTitle = (serialNumber: number) => `第${serialNumber}章概要`;
    const getChapterSummaryDisplayTitle = (serialNumber: number) => isDetailOutlineTab ? `第${serialNumber}章章纲` : getChapterSummaryTitle(serialNumber);
    const getVolumeSummaryTitle = (volumeName: string) => `${volumeName}梗概`;
    const getLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}摘要`;
    const getOlderLegacyVolumeSummaryTitle = (volumeName: string) => `${volumeName}概要`;
    const getChapterSummaryEntry = (serialNumber: number) => (
      chapterEntries.find((entry) => (
        entry.title === getChapterSummaryTitle(serialNumber)
        || entry.title === getLegacyChapterSummaryTitle(serialNumber)
        || entry.title === getOlderLegacyChapterSummaryTitle(serialNumber)
        || entry.title === getChapterSummaryDisplayTitle(serialNumber)
      ))
    );
    const getVolumeSummaryEntry = (volumeName: string) => (
      volumeEntries.find((entry) => (
        entry.title === getVolumeSummaryTitle(volumeName)
        || entry.title === getLegacyVolumeSummaryTitle(volumeName)
        || entry.title === getOlderLegacyVolumeSummaryTitle(volumeName)
      ))
    );
    const selectedOutlineEntry = selectedOutlineChapter
      ? getChapterSummaryEntry(selectedOutlineChapter.chapter.serialNumber)
      : null;
    const selectedVolumeEntry = selectedOutlineVolume
      ? getVolumeSummaryEntry(selectedOutlineVolume.name)
      : null;
    const getVolumeDisplayIndex = (volumeId: number) => {
      const index = volumes.findIndex((item) => item.id === volumeId);
      return index >= 0 ? index + 1 : 1;
    };
    const getOutlineChapterFrameTitle = (volume: Volume, chapter: Chapter) => (
      isDetailOutlineTab
        ? `第${chapter.serialNumber}章章纲`
        : `第${chapter.serialNumber}章梗概（第${getVolumeDisplayIndex(volume.id)}卷）`
    );
    const updateChapterSummary = (serialNumber: number, content: string) => {
      const title = getChapterSummaryTitle(serialNumber);
      const existing = getChapterSummaryEntry(serialNumber);
      if (existing) {
        updateOutlineEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry(outlineChapterTab, title),
        content,
      };
      persistCurrentOutline([entry, ...currentOutlineEntries]);
      setSelectedId(entry.id);
    };
    const updateVolumeSummary = (volumeName: string, content: string) => {
      const title = getVolumeSummaryTitle(volumeName);
      const existing = getVolumeSummaryEntry(volumeName);
      if (existing) {
        updateOutlineEntry(existing.id, { content });
        return;
      }
      const entry = {
        ...createWorkbenchLibraryEntry(VOLUME_SUMMARY_TAB, title),
        content,
      };
      persistCurrentOutline([entry, ...currentOutlineEntries]);
      setSelectedId(entry.id);
    };
    const clearOutlineAiOutputDraft = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      updateActiveTabConfig({ outlineAiTaskId: undefined });
      setOutlinePreviewDraft('');
    };
    const renderDetailOutlineDraftClearButton = () => {
      if (!isDetailOutlineTab || plotPointStandalone || !selectedOutlineChapter) return null;
      return (
        <button
          type="button"
          onClick={clearOutlineAiOutputDraft}
          className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-draft-clear-tool absolute z-40 px-1 text-xs font-black text-red-500 hover:text-red-600"
        >
          清空
        </button>
      );
    };
    const saveOutlinePreviewDraft = () => {
      const cleanDraft = stripAiThinkingBlock(outlinePreviewDraft);
      if (isDetailOutlineTab) {
        if (selectedOutlineChapter) {
          setLastDetailOutlineReplacement({
            chapterSerialNumber: selectedOutlineChapter.chapter.serialNumber,
            content: selectedOutlineEntry?.content ?? '',
            draft: outlinePreviewDraft,
          });
          suppressNextOutlinePreviewSyncRef.current = true;
          updateActiveTabConfig({ outlineAiTaskId: undefined });
          updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
          setOutlinePreviewDraft('');
        }
        return;
      }
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        updateVolumeSummary(selectedOutlineVolume.name, cleanDraft);
        setOutlinePreviewDraft(cleanDraft);
        return;
      }
      if (selectedOutlineChapter) {
        updateChapterSummary(selectedOutlineChapter.chapter.serialNumber, cleanDraft);
        setOutlinePreviewDraft(cleanDraft);
      }
    };
    const undoDetailOutlineReplacement = () => {
      if (!lastDetailOutlineReplacement) return;
      updateChapterSummary(lastDetailOutlineReplacement.chapterSerialNumber, lastDetailOutlineReplacement.content);
      setOutlinePreviewDraft(lastDetailOutlineReplacement.draft);
      setLastDetailOutlineReplacement(null);
    };
    const selectOutlineChapter = (chapterId: number, serialNumber: number) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('chapter');
      setSelectedOutlineChapterId(chapterId);
      setSelectedOutlineVolumeId(null);
      updateActiveTabConfig({ selectedOutlineChapterId: chapterId });
      const entry = getChapterSummaryEntry(serialNumber);
      setSelectedId(entry?.id ?? null);
      if (!isDetailOutlineTab && !isDetailOutlineLikeTab(activeTab)) setOutlinePreviewDraft(entry?.content ?? '');
    };
    const selectOutlineVolume = (volume: Volume) => {
      forceOutlineSelectionRefresh((value) => value + 1);
      setOutlineSelectionType('volume');
      setSelectedOutlineVolumeId(volume.id);
      setSelectedOutlineChapterId(null);
      updateActiveTabConfig({ selectedOutlineChapterId: null });
      const entry = getVolumeSummaryEntry(volume.name);
      setSelectedId(entry?.id ?? null);
      setOutlinePreviewDraft(entry?.content ?? '');
    };
    const toggleOutlineVolume = (volumeId: number) => {
      setExpandedOutlineVolumeIds((prev) => {
        const next = new Set(prev);
        if (next.has(volumeId)) next.delete(volumeId);
        else next.add(volumeId);
        return next;
      });
    };
    const moveDetailOutlineChapterToPublished = (chapterId: number) => {
      setManualDetailOutlinePublishedChapterIds((prev) => {
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });
      setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
      setShowDetailOutlinePublished(true);
    };
    const moveDetailOutlineChapterToUnpublished = (chapter: Chapter) => {
      if (chapter.isPublished) return;
      setManualDetailOutlinePublishedChapterIds((prev) => {
        const next = new Set(prev);
        next.delete(chapter.id);
        return next;
      });
      setDetailOutlineChapterMenu({ visible: false, x: 0, y: 0, chapter: null });
    };
    const outlineSidebarWidth = settingLibraryLeftWidth;
    const outlinePreviewTitle = plotPointStandalone ? '剧情点预览' : isDetailOutlineTab ? 'AI输出章纲' : (safeOutlineSelectionType === 'volume' ? '卷梗概预览' : '章节梗概');
    const outlinePromptCategory = plotPointStandalone ? PLOT_CHAIN_PROMPT_CATEGORY : isDetailOutlineTab ? DETAIL_OUTLINE_PROMPT_CATEGORY : '梗概';
    const outlinePromptOptions = prompts.filter((prompt) => normalizePromptCategoryName(prompt.category) === outlinePromptCategory);
    const configuredOutlinePromptId = plotPointStandalone
      ? activeTabConfig.plotPointPromptId ?? activeTabConfig.promptId
      : isDetailOutlineTab
      ? activeTabConfig.detailOutlinePromptId ?? activeTabConfig.promptId
      : activeTabConfig.outlineSummaryPromptId ?? activeTabConfig.promptId;
    const activeOutlinePromptId = outlinePromptOptions.some((prompt) => prompt.id === configuredOutlinePromptId) ? configuredOutlinePromptId : '';
    const activeOutlinePrompt = outlinePromptOptions.find((prompt) => prompt.id === activeOutlinePromptId) ?? outlinePromptOptions[0] ?? null;
    const updateOutlinePromptId = (value: string) => {
      if (plotPointStandalone) {
        updateActiveTabConfig({ plotPointPromptId: value });
        return;
      }
      if (isDetailOutlineTab) {
        updateActiveTabConfig({ detailOutlinePromptId: value });
        return;
      }
      updateActiveTabConfig({ outlineSummaryPromptId: value });
    };
    const selectedOutlineModel = models.find((model) => model.id === activeTabConfig.modelId) ?? models[0] ?? null;
    const outlineModelFieldSizeKey: WorkbenchFieldSizeKey = isDetailOutlineTab ? 'detailOutlineModelSelect' : 'outlineSummaryModelSelect';
    const outlineAiInput = activeTabConfig.outlineAiInput ?? '';
    const setOutlineAiInput = (value: string) => updateActiveTabConfig({ outlineAiInput: value });
    const detailOutlineReaderSettingEntries = settingTypeOptions.flatMap((type) => (
      entries.filter((entry) => entry.tab === SETTING_TAB && parseSettingContent(entry.content).type === type)
    ));
    const detailOutlineReaderRoleEntries = roleTypeOptions.flatMap((type) => (
      entries
        .filter((entry) => entry.tab === ROLE_TAB && parseRoleContent(entry.content).type === type)
        .map((entry, index) => ({ entry, index }))
        .sort((left, right) => {
          const leftPinned = typeof left.entry.pinnedAt === 'number';
          const rightPinned = typeof right.entry.pinnedAt === 'number';
          if (leftPinned && rightPinned) return (left.entry.pinnedAt ?? 0) - (right.entry.pinnedAt ?? 0);
          if (leftPinned) return -1;
          if (rightPinned) return 1;
          return left.index - right.index;
        })
        .map(({ entry }) => entry)
    ));
    const detailOutlineReaderSettingItems = detailOutlineReaderSettingEntries
      .map((entry) => {
        const parsed = parseSettingContent(entry.content);
        const content = parsed.body || entry.content || '';
        return {
          id: entry.id,
          title: entry.title || '未命名设定',
          group: parsed.type || '未分类',
          content,
        };
      })
      .filter((item) => item.content.trim());
    const detailOutlineReaderRoleItems = detailOutlineReaderRoleEntries
      .map((entry) => {
        const parsed = parseRoleContent(entry.content);
        return {
          id: entry.id,
          title: entry.title || '未命名角色',
          group: parsed.type || '未分类',
          content: buildRoleReaderContent(entry, parsed),
        };
      })
      .filter((item) => item.content.trim());
    const hasCurrentDetailOutlineReaderSession = isWorkbenchAssociationRuntimeCurrent(activeTabConfig.detailOutlineReaderSessionId);
    const inheritedDetailOutlineSettingIds = hasCurrentDetailOutlineReaderSession && isDetailOutlineTab && !activeTabConfig.detailOutlineReaderTouched && activeTabConfig.detailOutlineReaderSettingIds === undefined
      ? detailOutlineReaderSettingItems.map((item) => item.id)
      : hasCurrentDetailOutlineReaderSession ? activeTabConfig.detailOutlineReaderSettingIds ?? [] : [];
    const selectedDetailOutlineSettingIds = new Set(inheritedDetailOutlineSettingIds);
    const selectedDetailOutlineRoleIds = new Set(hasCurrentDetailOutlineReaderSession
      ? activeTabConfig.detailOutlineReaderTouched
        ? activeTabConfig.detailOutlineReaderRoleIds ?? []
        : getInitialPlotChainRoleIds({
        configuredRoleIds: activeTabConfig.detailOutlineReaderRoleIds,
        plotPointStandalone,
        roles: detailOutlineReaderRoleItems,
      })
      : []);
    const detailOutlineReaderOutlineLimitSerial = selectedOutlineChapter?.chapter.serialNumber ?? Number.POSITIVE_INFINITY;
    const detailOutlineReaderOutlineItems = outlineChapters
      .filter(({ chapter }) => chapter.serialNumber < detailOutlineReaderOutlineLimitSerial)
      .map(({ volume, chapter }) => {
        const entry = getChapterSummaryEntry(chapter.serialNumber);
        return {
          id: String(chapter.id),
          title: `第${chapter.serialNumber}章章纲`,
          group: volume.name,
          content: entry?.content ?? '',
        };
      })
      .filter((item) => item.content.trim());
    const detailOutlineReaderPlotPointMap = new Map(
      [
        ...Object.values(plotPointSelectedCandidateMap),
        ...PLOT_POINT_FALLBACK_CANDIDATES,
      ].map((item) => [item.id, item]),
    );
    const detailOutlineReaderPlotChainItems = (plotPointChainSelections[plotPointActiveChainSlot] ?? [])
      .map((id, index) => {
        const item = detailOutlineReaderPlotPointMap.get(id);
        if (!item) return null;
        const content = [
          getWorkbenchPlotPointText(item, plotPointLength),
          item.review ? `AI评价：${item.review}` : '',
        ].filter(Boolean).join('\n');
        return {
          id: item.id,
          title: `${index + 1}. ${item.title}`,
          group: plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`,
          content,
        };
      })
      .filter((item): item is { id: string; title: string; group: string; content: string } => Boolean(item && item.content.trim()));
    const selectedDetailOutlineOutlineIds = new Set(hasCurrentDetailOutlineReaderSession ? activeTabConfig.detailOutlineReaderOutlineIds ?? [] : []);
    const selectedDetailOutlinePlotChainIds = new Set(hasCurrentDetailOutlineReaderSession ? activeTabConfig.detailOutlineReaderPlotChainIds ?? [] : []);
    const selectedDetailOutlineSettingItems = detailOutlineReaderSettingItems.filter((item) => selectedDetailOutlineSettingIds.has(item.id));
    const selectedDetailOutlineRoleItems = detailOutlineReaderRoleItems.filter((item) => selectedDetailOutlineRoleIds.has(item.id));
    const selectedDetailOutlineOutlineItems = detailOutlineReaderOutlineItems.filter((item) => selectedDetailOutlineOutlineIds.has(item.id));
    const selectedDetailOutlinePlotChainItems = detailOutlineReaderPlotChainItems.filter((item) => selectedDetailOutlinePlotChainIds.has(item.id));
    const selectedDetailOutlineReaderItems = [
      ...selectedDetailOutlineSettingItems,
      ...selectedDetailOutlineRoleItems,
      ...selectedDetailOutlineOutlineItems,
      ...selectedDetailOutlinePlotChainItems,
    ];
    const detailOutlineReaderWordCount = selectedDetailOutlineReaderItems.reduce((sum, item) => sum + countTextWords(item.content), 0);
    const buildDetailOutlineReaderContext = () => {
      const settingText = selectedDetailOutlineSettingItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const outlineText = selectedDetailOutlineOutlineItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const roleText = selectedDetailOutlineRoleItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const plotChainText = selectedDetailOutlinePlotChainItems
        .filter((item) => item.content.trim())
        .map((item) => `【${item.group} / ${item.title}】\n${item.content.trim()}`)
        .join('\n\n');
      const innerContext = joinAiRequestSections([
        wrapAiRequestTag('设定资料', settingText),
        wrapAiRequestTag('角色资料', roleText),
        wrapAiRequestTag('前文章纲', outlineText),
        wrapAiRequestTag('剧情链', plotChainText),
      ]);
      return wrapAiRequestTag('关联资料', innerContext);
    };
    const openDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set(selectedDetailOutlineSettingIds));
      setDraftDetailOutlineReaderRoleIds(new Set(selectedDetailOutlineRoleIds));
      setDraftDetailOutlineReaderOutlineIds(new Set(selectedDetailOutlineOutlineIds));
      setDraftDetailOutlineReaderPlotChainIds(new Set(selectedDetailOutlinePlotChainIds));
      setDetailOutlineReaderTab('outlines');
      setDetailOutlineReaderPreviewId('');
      setIsDetailOutlineReaderOpen(true);
    };
    const clearDraftDetailOutlineReader = () => {
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
      setDraftDetailOutlineReaderPlotChainIds(new Set());
    };
    const confirmDetailOutlineReader = () => {
      const validSettingIds = detailOutlineReaderSettingItems.map((item) => item.id);
      const validRoleIds = detailOutlineReaderRoleItems.map((item) => item.id);
      const validOutlineIds = detailOutlineReaderOutlineItems.map((item) => item.id);
      const validPlotChainIds = detailOutlineReaderPlotChainItems.map((item) => item.id);
      const nextSettingIds = Array.from(draftDetailOutlineReaderSettingIds)
        .filter((id) => validSettingIds.includes(id));
      const nextRoleIds = Array.from(draftDetailOutlineReaderRoleIds)
        .filter((id) => validRoleIds.includes(id));
      const nextOutlineIds = Array.from(draftDetailOutlineReaderOutlineIds)
        .filter((id) => validOutlineIds.includes(id));
      const nextPlotChainIds = Array.from(draftDetailOutlineReaderPlotChainIds)
        .filter((id) => validPlotChainIds.includes(id));
      const hasSelectedReaderItems = nextSettingIds.length > 0 || nextRoleIds.length > 0 || nextOutlineIds.length > 0 || nextPlotChainIds.length > 0;
      updateActiveTabConfig({
        detailOutlineReaderSessionId: hasSelectedReaderItems ? getWorkbenchAssociationRuntimeId() : null,
        detailOutlineReaderTouched: true,
        detailOutlineReaderSettingIds: nextSettingIds,
        detailOutlineReaderRoleIds: nextRoleIds,
        detailOutlineReaderOutlineIds: nextOutlineIds,
        detailOutlineReaderPlotChainIds: nextPlotChainIds,
      });
      setIsDetailOutlineReaderOpen(false);
    };
    const clearDetailOutlineReaderSelection = () => {
      updateActiveTabConfig({
        detailOutlineReaderSessionId: null,
        detailOutlineReaderTouched: true,
        detailOutlineReaderSettingIds: [],
        detailOutlineReaderRoleIds: [],
        detailOutlineReaderOutlineIds: [],
        detailOutlineReaderPlotChainIds: [],
      });
      setDraftDetailOutlineReaderSettingIds(new Set());
      setDraftDetailOutlineReaderRoleIds(new Set());
      setDraftDetailOutlineReaderOutlineIds(new Set());
      setDraftDetailOutlineReaderPlotChainIds(new Set());
    };
    const toggleDraftDetailOutlineReaderSetting = (id: string) => {
      setDraftDetailOutlineReaderSettingIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderRole = (id: string) => {
      setDraftDetailOutlineReaderRoleIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderOutline = (id: string) => {
      setDraftDetailOutlineReaderOutlineIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleDraftDetailOutlineReaderPlotChain = (id: string) => {
      setDraftDetailOutlineReaderPlotChainIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const outlinePreviewDraftContent = stripAiThinkingBlock(outlinePreviewDraft);
    const plotPointGeneratedCandidates = parseGeneratedPlotPointCandidates(plotPointGeneratedCandidateText);
    const normalizedGeneratedPlotPointCandidates = plotPointGeneratedCandidates.map((item) => ({
      ...item,
      source: plotPointSourceMode === 'library' ? '剧情库' as const : item.source,
    }));
    const plotPointLibraryCandidates = readPlotLibrarySnapshot().items
      .slice(0, 30)
      .map(plotLibraryItemToCandidate);
    const effectivePlotPointLibraryCandidates = plotPointLibraryCandidates.length > 0
      ? plotPointLibraryCandidates
      : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === '剧情库');
    const effectivePlotPointAiCandidates = normalizedGeneratedPlotPointCandidates.length > 0
      ? normalizedGeneratedPlotPointCandidates
      : PLOT_POINT_FALLBACK_CANDIDATES.filter((item) => item.source === 'AI生成');
    const plotPointCandidatePool = normalizedGeneratedPlotPointCandidates.length > 0
      ? normalizedGeneratedPlotPointCandidates
      : isLibraryAiLoading
      ? []
      : isPlotPointPreviewCleared
      ? []
      : plotPointSourceMode === 'library'
      ? effectivePlotPointLibraryCandidates
      : plotPointSourceMode === 'ai'
      ? effectivePlotPointAiCandidates
      : [...effectivePlotPointLibraryCandidates, ...effectivePlotPointAiCandidates];
    const plotPointVisibleCandidates = plotPointCandidatePool.slice(0, plotPointGenerateCount);
    const plotPointSelectedIds = plotPointChainSelections[plotPointActiveChainSlot] ?? [];
    const hasPlotPointChain = plotPointSelectedIds.length > 0;
    const isPlotPointFollowupStage = hasPlotPointChain && plotPointChainRefreshStates[plotPointActiveChainSlot];
    const plotPointCandidateMap = new Map(
      [
        ...Object.values(plotPointSelectedCandidateMap),
        ...effectivePlotPointLibraryCandidates,
        ...effectivePlotPointAiCandidates,
        ...PLOT_POINT_FALLBACK_CANDIDATES,
      ]
        .map((item) => [item.id, item]),
    );
    const plotPointSelectedItems = plotPointSelectedIds
      .map((id) => plotPointCandidateMap.get(id))
      .filter((item): item is WorkbenchPlotPointCandidate => Boolean(item));
    const plotPointWrittenIds = plotPointChainWrittenSelections[plotPointActiveChainSlot] ?? [];
    const plotPointWrittenIdSet = new Set(plotPointWrittenIds);
    const plotPointUnwrittenItems = plotPointSelectedItems.filter((item) => !plotPointWrittenIdSet.has(item.id));
    const visiblePlotPointSelectedItems = plotPointSelectedItems.filter((item) => {
      const written = plotPointWrittenIdSet.has(item.id);
      if (plotPointChainFilterMode === 'written') return written;
      if (plotPointChainFilterMode === 'unwritten') return !written;
      return true;
    });
    const firstPlotPointChainTitle = plotPointSelectedItems[0] ? '剧情点 1' : '还没有第1号剧情';
    const firstPlotPointChainContent = plotPointSelectedItems[0]
      ? getWorkbenchPlotPointText(plotPointSelectedItems[0], plotPointLength)
      : '';
    const togglePlotPointCandidate = (id: string) => {
      const candidate = plotPointCandidateMap.get(id);
      setPlotPointChainSelections((current) => {
        const currentChain = current[plotPointActiveChainSlot] ?? [];
        const isSelected = currentChain.includes(id);
        if (!isSelected && candidate) {
          setPlotPointSelectedCandidateCache((cache) => ({ ...cache, [id]: candidate }));
        }
        const next = {
          ...current,
          [plotPointActiveChainSlot]: currentChain.includes(id)
            ? currentChain.filter((itemId) => itemId !== id)
            : [...currentChain, id],
        };
        updateActiveTabConfig({ plotPointChainSelections: next });
        if (isSelected) {
          setPlotPointChainWrittenSelections((writtenCurrent) => {
            const nextWritten = {
              ...writtenCurrent,
              [plotPointActiveChainSlot]: (writtenCurrent[plotPointActiveChainSlot] ?? []).filter((itemId) => itemId !== id),
            };
            updateActiveTabConfig({ plotPointChainWrittenSelections: nextWritten });
            return nextWritten;
          });
          if (activePlotPointChainItemId === id) setActivePlotPointChainItemId(null);
        }
        return next;
      });
      setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: false }));
    };
    const markPlotPointChainItemWritten = (id: string) => {
      setPlotPointChainWrittenSelections((current) => {
        const currentWritten = current[plotPointActiveChainSlot] ?? [];
        if (currentWritten.includes(id)) return current;
        const next = {
          ...current,
          [plotPointActiveChainSlot]: [...currentWritten, id],
        };
        updateActiveTabConfig({ plotPointChainWrittenSelections: next });
        return next;
      });
    };
    const movePlotPointChainItemToUnwritten = (id: string) => {
      setPlotPointChainWrittenSelections((current) => {
        const currentWritten = current[plotPointActiveChainSlot] ?? [];
        if (!currentWritten.includes(id)) return current;
        const next = {
          ...current,
          [plotPointActiveChainSlot]: currentWritten.filter((itemId) => itemId !== id),
        };
        updateActiveTabConfig({ plotPointChainWrittenSelections: next });
        return next;
      });
    };
    const togglePlotPointPreviewExpanded = (id: string) => {
      setExpandedPlotPointPreviewIds((current) => (
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
      ));
    };
    const togglePlotPointOpeningElement = (element: string) => {
      setPlotPointOpeningElementsState((current) => {
        const next = current.includes(element)
          ? current.filter((item) => item !== element)
          : [...current, element];
        updateActiveTabConfig({ plotPointOpeningElements: next });
        return next;
      });
    };
    const plotPointLibraryContext = (plotPointSourceMode === 'ai' ? [] : plotPointLibraryCandidates)
      .slice(0, plotPointGenerateCount)
      .map((item, index) => `${index + 1}. ${item.title}\n${item.adapted}`)
      .join('\n\n');
    const plotPointChainContext = plotPointSelectedItems
      .map((item, index) => `${index + 1}. ${item.title}：${getWorkbenchPlotPointText(item, plotPointLength)}`)
      .join('\n');
    const plotPointRoleNameHints = selectedDetailOutlineRoleItems
      .map((item) => `${item.group}：${item.title}`)
      .join('；');
    const plotPointSettingNameHints = selectedDetailOutlineSettingItems
      .map((item) => `${item.group}：${item.title}`)
      .join('；');
    const plotPointProtagonistReplacementRule = getPlotPointProtagonistReplacementRule(detailOutlineReaderRoleItems);
    const buildPlotPointOutlineInput = () => {
      if (plotPointSelectedItems.length === 0) return '';
      const chainText = plotPointSelectedItems
        .map((item, index) => `${index + 1}. ${item.title}\n${getWorkbenchPlotPointText(item, plotPointLength)}`)
        .join('\n\n');
      const selectedReaderContext = buildDetailOutlineReaderContext();
      return [
        `请根据以下剧情链生成本章章纲，只输出适合写作执行的章纲要求，不要输出正文。请在末尾输出${DETAIL_OUTLINE_STATE_MARKER}，按人物状态、道具状态、势力状态、关系状态、线索/信息列出本章预计变化。`,
        `当前目标：${selectedOutlineChapter ? `第${selectedOutlineChapter.chapter.serialNumber}章` : '当前章节'}`,
        `【剧情链】\n${chainText}`,
        selectedReaderContext ? `【关联内容】\n${selectedReaderContext}` : '',
      ].filter(Boolean).join('\n\n');
    };
    const openDetailOutlineFromPlotPoint = () => {
      const nextInput = buildPlotPointOutlineInput();
      if (!nextInput) return;
      updateActiveTabConfig({ outlineAiInput: nextInput });
      onOpenDetailOutlineFromPlotChain?.();
    };
    const getPlotPointGenerationRulesText = () => [
      `长度：${getPlotPointLengthLabel(plotPointLength)}。`,
      plotPointOpeningElements.length > 0 ? `类型：${plotPointOpeningElements.join('、')}。` : '类型：未指定。',
      `剧情点数量：${plotPointGenerateCount}个。`,
    ].join('\n');
    const buildPlotPointRequestText = (userText: string) => {
      const effectivePlotPointChainContext = plotPointGenerationModeRef.current === 'continue' ? plotPointChainContext : '';
      return [
        `【生成规则】\n${getPlotPointGenerationRulesText()}`,
        '【任务要求】\n请生成剧情点，不要直接写成完整正文。',
        plotPointProtagonistReplacementRule,
        '变量替换硬规则：输出里的角色、势力、道具、地点和外挂变量，必须优先替换成当前小说已关联设定/角色里的具体名称。',
        plotPointRoleNameHints ? `已关联角色名：${plotPointRoleNameHints}。例如主角叫“林刻”时，输出必须写“林刻”，不要写“主角”或照抄剧情库原角色名。` : '',
        plotPointSettingNameHints ? `已关联设定名：${plotPointSettingNameHints}。剧情库里的旧世界观、旧势力名、旧道具名只能当结构参考，不能原样照抄。` : '',
        '如果某个变量在当前设定中找不到明确对应物，可以使用“某势力/某秘宝”等临时占位，但不能保留剧情库原小说的人名和专名。',
        effectivePlotPointChainContext
          ? [
            `当前剧情链：\n${effectivePlotPointChainContext}`,
            '本次任务是“衔接当前剧情链”，不是重新生成开头剧情。',
            '所有候选剧情点都必须直接承接当前剧情链最后一条的后果、目标、冲突或悬念。',
            '本批所有候选都处在同一个下一步进度，都是可衔接当前剧情链的不同备选方案，不是连续章节。',
            '不要输出与当前剧情链无关的通用套路、世界观介绍、人物设定说明或重新开局。',
            '每条候选只写下一步可执行剧情：谁遇到什么新问题、如何推进、留下什么期待。',
          ].join('\n')
          : [
            '当前剧情链为空，请生成同一进度的开端候选。',
            '每个候选都必须能作为小说真正的第一章开场使用：必须直接出现主角首次进入故事的处境、场景、压力、冲突或异变触发。',
            '不要把候选写成已经经过前情推进后的续写内容，不要默认系统已激活、奖励已发放、战斗已开始、学校已爆炸、任务已进行到中段。',
            '不要让第1条、第2条、第3条分别承担不同章节进度；它们都应该是“同一章开头的不同方案”。',
          ].join('\n'),
        plotPointLibraryContext && !effectivePlotPointChainContext ? `可参考剧情库：\n${plotPointLibraryContext}` : '',
        buildPlotPointOutputFormatInstruction({
          count: plotPointGenerateCount,
          hasChain: Boolean(effectivePlotPointChainContext),
        }),
        userText ? `【用户要求】\n${userText}` : '',
      ].filter(Boolean).join('\n\n');
    };
    const outlineDraftFrameTitle = plotPointStandalone
      ? selectedOutlineChapter
        ? `第${selectedOutlineChapter.chapter.serialNumber}章剧情点（第${getVolumeDisplayIndex(selectedOutlineChapter.volume.id)}卷）`
        : '剧情点预览'
      : safeOutlineSelectionType === 'volume' && selectedOutlineVolume
        ? `${selectedOutlineVolume.name}梗概`
        : selectedOutlineChapter
          ? isDetailOutlineTab
            ? 'AI输出框'
            : `第${selectedOutlineChapter.chapter.serialNumber}章梗概`
          : outlinePreviewTitle;
    const outlineDraftCountLeft = plotPointStandalone
      ? '7.6rem'
      : isDetailOutlineTab
        ? '6.2rem'
        : safeOutlineSelectionType === 'volume'
          ? '8.2rem'
          : selectedOutlineChapter
            ? '11.4rem'
            : '6.2rem';
    const shouldShowOutlineDraftWordCount = plotPointStandalone;
    const getSelectedOutlineContext = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        return selectedOutlineVolume.chapters
          .map((chapter) => {
            const content = getChapterContent?.(chapter.id) ?? '';
            return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
          })
          .join('\n\n');
      }
      if (!selectedOutlineChapter) return '';
      const { chapter } = selectedOutlineChapter;
      const content = getChapterContent?.(chapter.id) ?? '';
      return `第${chapter.serialNumber}章 ${chapter.title}\n${content}`;
    };
    const getOutlineContextTitle = () => {
      if (safeOutlineSelectionType === 'volume' && selectedOutlineVolume) {
        return `${selectedOutlineVolume.name} · ${selectedOutlineVolume.chapters.length}章`;
      }
      if (!selectedOutlineChapter) return '未选择章节';
      return `第${selectedOutlineChapter.chapter.serialNumber}章 ${selectedOutlineChapter.chapter.title}`;
    };
    const getOutlineFullContextTitle = () => {
      const baseTitle = getOutlineContextTitle();
      if (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0) return baseTitle;
      return `${baseTitle} + 读取${selectedDetailOutlineReaderItems.length}项`;
    };
    const getOutlineAiContext = () => {
      const selectedContext = getSelectedOutlineContext();
      const readerContext = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      if (isDetailOutlineTab) return readerContext;
      return joinAiRequestSections([
        wrapAiRequestTag('待梗概正文', selectedContext, { 标题: getOutlineContextTitle() }),
        readerContext,
      ]);
    };
    const formatOutlineUserTextForAi = (userText: string) => {
      if (plotPointStandalone) return userText;
      if (isDetailOutlineTab) return wrapAiRequestTag('本章要求', userText);
      return wrapAiRequestTag('梗概要求', userText);
    };
    const getOutlineDefaultPrompt = () => (
      plotPointStandalone
        ? '请根据关联的大纲设定、前文章纲、剧情链和用户要求，生成适合本书下一步展开的剧情点。'
        : isDetailOutlineTab
        ? `请根据关联的设定、前文章纲和剧情链生成章纲。请在章纲末尾输出${DETAIL_OUTLINE_STATE_MARKER}，按人物状态、道具状态、势力状态、关系状态、线索/信息列出本章预计变化；这里不是正式状态库，只是本章写作计划。`
        : '请根据所选章节正文生成章节梗概。'
    );
    const buildOutlineAiRequestLog = (
      userText: string,
      contextText: string,
      promptText: string,
      createdAt = '当前预览',
      visibleUserText = userText,
    ): LibraryAiRequestLog => {
      const readerContextText = isDetailOutlineTab ? buildDetailOutlineReaderContext() : '';
      return {
        createdAt,
        tab: plotPointStandalone ? '生成剧情链' : isDetailOutlineTab ? '生成章纲' : '章节梗概',
        modelName: selectedOutlineModel?.name ?? '未选择模型',
        promptName: activeOutlinePrompt?.name ?? '默认提示词',
        hasLinkedBrainstorm: false,
        linkedBrainstormTitle: '',
        visibleUserText,
        systemPrompt: promptText,
        userContent: userText,
        contextTitle: contextText
          ? (plotPointStandalone
            ? (selectedDetailOutlineReaderItems.length > 0 ? `已关联 ${selectedDetailOutlineReaderItems.length} 项` : '')
            : getOutlineFullContextTitle())
          : '',
        contextText,
        contextWordCount: countTextWords(contextText),
        readerContextTitle: selectedDetailOutlineReaderItems.length > 0
          ? `已关联 ${selectedDetailOutlineReaderItems.length} 项`
          : '',
        readerContextText,
        readerContextWordCount: countTextWords(readerContextText),
      };
    };
    const previewOutlineContextText = getOutlineAiContext();
    const previewOutlinePromptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
    const shouldShowOutlineBodyContext = !isDetailOutlineTab;
    const visibleOutlineAiRequestLog = (
      isLibraryAiLogOpen && libraryAiLogScope === 'outline'
        ? buildOutlineAiRequestLog(
          plotPointStandalone ? buildPlotPointRequestText(outlineAiInput.trim()) : formatOutlineUserTextForAi(outlineAiInput.trim()),
          previewOutlineContextText,
          previewOutlinePromptText,
          '当前预览',
          plotPointStandalone ? buildPlotPointRequestText(outlineAiInput.trim()) : outlineAiInput.trim(),
        )
        : null
    ) ?? lastOutlineAiRequestLog;
    const outlineUserLogTitle = isDetailOutlineTab && !plotPointStandalone ? '其他要求' : '输入内容';
    const outlineAiLogModal = isLibraryAiLogOpen && libraryAiLogScope === 'outline' && visibleOutlineAiRequestLog ? (
      <LibraryAiLogShell
        id={`workbench_library_ai_log_${activeTab}`}
        subtitle="当前预览：点击发送后会按这里的内容发给 AI"
        onClose={() => setIsLibraryAiLogOpen(false)}
      >
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-r border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">链路</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.tab}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">模型</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.modelName}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs text-slate-400">提示词</div>
                  <div className="mt-1 font-bold text-slate-800">{visibleOutlineAiRequestLog.promptName}</div>
                </div>
                {shouldShowOutlineBodyContext && visibleOutlineAiRequestLog.contextText?.trim() && (
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">关联正文</div>
                    <div className="mt-1 font-bold text-brand">{visibleOutlineAiRequestLog.contextTitle}</div>
                    <div className="mt-1 text-xs font-bold text-slate-400"><WordCountText value={visibleOutlineAiRequestLog.contextWordCount ?? 0} /></div>
                  </div>
                )}
                {isDetailOutlineTab && visibleOutlineAiRequestLog.readerContextText?.trim() && (
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">关联资料</div>
                    <div className="mt-1 font-bold text-brand">
                      {visibleOutlineAiRequestLog.readerContextTitle}
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">
                      <WordCountText value={visibleOutlineAiRequestLog.readerContextWordCount ?? 0} /></div>
                  </div>
                )}
                {visibleOutlineAiRequestLog.visibleUserText.trim() && (
                  <div className="rounded-xl bg-white p-3">
                    <div className="text-xs text-slate-400">{outlineUserLogTitle}</div>
                    <div className="mt-1 break-words font-bold text-slate-800">{visibleOutlineAiRequestLog.visibleUserText}</div>
                  </div>
                )}
              </div>
            </aside>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
              <AiRequestLogGroups
                groups={buildLibraryLogGroups(visibleOutlineAiRequestLog, {
                  includeContext: shouldShowOutlineBodyContext,
                  includeReaderContext: isDetailOutlineTab,
                  readerTitle: '关联资料',
                  readerEmptyText: '未关联章纲、设定或角色',
                  userTitle: outlineUserLogTitle,
                  expandReaderContextContent: plotPointStandalone,
                  expandAllContent: plotPointStandalone,
                })}
                fillSingleGroup
              />
            </div>
          </div>
      </LibraryAiLogShell>
    ) : null;
    const draftDetailOutlineReaderItems = [
      ...detailOutlineReaderSettingItems.filter((item) => draftDetailOutlineReaderSettingIds.has(item.id)),
      ...detailOutlineReaderRoleItems.filter((item) => draftDetailOutlineReaderRoleIds.has(item.id)),
      ...detailOutlineReaderOutlineItems.filter((item) => draftDetailOutlineReaderOutlineIds.has(item.id)),
      ...detailOutlineReaderPlotChainItems.filter((item) => draftDetailOutlineReaderPlotChainIds.has(item.id)),
    ];
    const draftDetailOutlineReaderWordCount = draftDetailOutlineReaderItems.reduce((sum, item) => sum + countTextWords(item.content), 0);
    const activeDetailOutlineReaderItems = detailOutlineReaderTab === 'settings'
      ? detailOutlineReaderSettingItems
      : detailOutlineReaderTab === 'roles'
      ? detailOutlineReaderRoleItems
      : detailOutlineReaderTab === 'plotChain'
      ? detailOutlineReaderPlotChainItems
      : detailOutlineReaderOutlineItems;
    const activeDetailOutlineReaderPreviewItem = activeDetailOutlineReaderItems.find((item) => item.id === detailOutlineReaderPreviewId) ?? null;
    const isActiveDetailOutlineReaderPreviewChecked = activeDetailOutlineReaderPreviewItem
      ? detailOutlineReaderTab === 'settings'
        ? draftDetailOutlineReaderSettingIds.has(activeDetailOutlineReaderPreviewItem.id)
        : detailOutlineReaderTab === 'roles'
        ? draftDetailOutlineReaderRoleIds.has(activeDetailOutlineReaderPreviewItem.id)
        : detailOutlineReaderTab === 'plotChain'
        ? draftDetailOutlineReaderPlotChainIds.has(activeDetailOutlineReaderPreviewItem.id)
        : draftDetailOutlineReaderOutlineIds.has(activeDetailOutlineReaderPreviewItem.id)
      : false;
    const detailOutlineReaderNavGroups = Array.from(
      activeDetailOutlineReaderItems.reduce((map, item) => {
        map.set(item.group, [...(map.get(item.group) ?? []), item]);
        return map;
      }, new Map<string, typeof activeDetailOutlineReaderItems>()),
    ).map(([group, items]) => ({ group, items }));
    const toggleDetailOutlineReaderGroup = (group: string) => {
      const key = `${detailOutlineReaderTab}:${group}`;
      setCollapsedDetailOutlineReaderGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const setDraftDetailOutlineReaderIdsForActiveTab = (ids: Set<string>) => {
      if (detailOutlineReaderTab === 'settings') setDraftDetailOutlineReaderSettingIds(ids);
      else if (detailOutlineReaderTab === 'roles') setDraftDetailOutlineReaderRoleIds(ids);
      else if (detailOutlineReaderTab === 'plotChain') setDraftDetailOutlineReaderPlotChainIds(ids);
      else setDraftDetailOutlineReaderOutlineIds(ids);
    };
    const getDraftDetailOutlineReaderIdsForActiveTab = () => (
      detailOutlineReaderTab === 'settings'
        ? draftDetailOutlineReaderSettingIds
        : detailOutlineReaderTab === 'roles'
        ? draftDetailOutlineReaderRoleIds
        : detailOutlineReaderTab === 'plotChain'
        ? draftDetailOutlineReaderPlotChainIds
        : draftDetailOutlineReaderOutlineIds
    );
    const selectAllActiveDetailOutlineReaderItems = () => {
      setDraftDetailOutlineReaderIdsForActiveTab(new Set(activeDetailOutlineReaderItems.map((item) => item.id)));
    };
    const toggleActiveDetailOutlineReaderGroupSelection = (items: typeof activeDetailOutlineReaderItems) => {
      const current = getDraftDetailOutlineReaderIdsForActiveTab();
      const next = new Set(current);
      const allSelected = items.every((item) => next.has(item.id));
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      setDraftDetailOutlineReaderIdsForActiveTab(next);
    };
    const detailOutlineReaderModal = isDetailOutlineReaderOpen && isDetailOutlineTab ? createPortal(
      <div
        className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/35"
        onClick={() => setIsDetailOutlineReaderOpen(false)}
      >
        <div
          className="modal-sharp adjustment-crisp flex h-[min(760px,90vh)] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900">关联资料</h3>
              <p className="mt-1 text-xs text-gray-400">勾选后会作为本次生成章纲的参考资料。</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailOutlineReaderOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
            {([
              ['outlines', '章纲'],
              ['settings', '设定'],
              ['roles', '角色'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setDetailOutlineReaderTab(tab);
                  setDetailOutlineReaderPreviewId('');
                }}
                className={`h-9 rounded-xl border px-3 text-sm font-black transition-colors ${
                  detailOutlineReaderTab === tab
                    ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#08AACE]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#9BEFFC] hover:text-[#08AACE]'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={selectAllActiveDetailOutlineReaderItems}
              disabled={activeDetailOutlineReaderItems.length === 0}
              className="ml-auto h-9 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            >
              关联所有
            </button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_280px] bg-white">
            <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-gray-100 bg-slate-50 px-1 py-2">
              <div className="mb-2 flex items-center justify-between gap-2 px-2">
                <div className="min-w-0 truncate text-[15px] font-black text-slate-400">
                  {detailOutlineReaderTab === 'settings'
                    ? '设定导航'
                    : detailOutlineReaderTab === 'roles'
                    ? '角色导航'
                    : detailOutlineReaderTab === 'plotChain'
                    ? '剧情链'
                    : '前文章纲'}
                </div>
              </div>
              <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
                {detailOutlineReaderNavGroups.length === 0 ? (
                  <div className="rounded-xl bg-white px-3 py-4 text-xs font-bold leading-5 text-slate-400">
                    {detailOutlineReaderTab === 'settings'
                      ? '暂无设定分组'
                      : detailOutlineReaderTab === 'roles'
                      ? '暂无角色分组'
                      : detailOutlineReaderTab === 'plotChain'
                      ? '当前剧情链暂无可关联剧情点'
                      : '当前章节前面暂无可读章纲'}
                  </div>
                ) : detailOutlineReaderNavGroups.map((group) => {
                  const collapsed = collapsedDetailOutlineReaderGroups[`${detailOutlineReaderTab}:${group.group}`] ?? false;
                  const GroupFolderIcon = collapsed ? Folder : FolderOpen;
                  return (
                    <div key={group.group} className="rounded-md">
                      <button
                        type="button"
                        onClick={() => toggleDetailOutlineReaderGroup(group.group)}
                        className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                        aria-expanded={!collapsed}
                      >
                        <GroupFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                        <span className="min-w-0 flex-1 truncate leading-none">{group.group}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleActiveDetailOutlineReaderGroupSelection(group.items);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              event.preventDefault();
                              event.stopPropagation();
                              toggleActiveDetailOutlineReaderGroupSelection(group.items);
                            }}
                            className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                          >
                            全选
                          </span>
                          <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{group.items.length}</span>
                        </span>
                      </button>
                      {!collapsed && (
                        <div className="mt-1 space-y-1 bg-white">
                          {group.items.map((item) => {
                            const checked = detailOutlineReaderTab === 'settings'
                              ? draftDetailOutlineReaderSettingIds.has(item.id)
                              : detailOutlineReaderTab === 'roles'
                              ? draftDetailOutlineReaderRoleIds.has(item.id)
                              : detailOutlineReaderTab === 'plotChain'
                              ? draftDetailOutlineReaderPlotChainIds.has(item.id)
                              : draftDetailOutlineReaderOutlineIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setDetailOutlineReaderPreviewId(item.id)}
                                className={`flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-[15px] font-black ${
                                  checked ? 'xy-selected-content-bg text-gray-900' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                              >
                                <span
                                  role="checkbox"
                                  aria-checked={checked}
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setDetailOutlineReaderPreviewId(item.id);
                                    if (detailOutlineReaderTab === 'settings') toggleDraftDetailOutlineReaderSetting(item.id);
                                    else if (detailOutlineReaderTab === 'roles') toggleDraftDetailOutlineReaderRole(item.id);
                                    else if (detailOutlineReaderTab === 'plotChain') toggleDraftDetailOutlineReaderPlotChain(item.id);
                                    else toggleDraftDetailOutlineReaderOutline(item.id);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key !== 'Enter' && event.key !== ' ') return;
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setDetailOutlineReaderPreviewId(item.id);
                                    if (detailOutlineReaderTab === 'settings') toggleDraftDetailOutlineReaderSetting(item.id);
                                    else if (detailOutlineReaderTab === 'roles') toggleDraftDetailOutlineReaderRole(item.id);
                                    else if (detailOutlineReaderTab === 'plotChain') toggleDraftDetailOutlineReaderPlotChain(item.id);
                                    else toggleDraftDetailOutlineReaderOutline(item.id);
                                  }}
                                  className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                                  checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent'
                                }`}
                                >
                                  ✓
                                </span>
                                <span className="min-w-0 truncate">{item.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
            <main className="editor-scrollbar min-h-0 overflow-y-auto p-6">
              {activeDetailOutlineReaderPreviewItem ? (
                <article
                  className={
                    'flex min-h-full flex-col ' +
                    (isActiveDetailOutlineReaderPreviewChecked ? 'xy-selected-content-bg text-slate-900' : 'text-gray-600')
                  }
                >
                  <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#08AACE]">
                        {detailOutlineReaderTab === 'settings'
                          ? '设定'
                          : detailOutlineReaderTab === 'roles'
                          ? '角色'
                          : detailOutlineReaderTab === 'plotChain'
                          ? '剧情链'
                          : '章纲'} / {activeDetailOutlineReaderPreviewItem.group}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (detailOutlineReaderTab === 'settings') toggleDraftDetailOutlineReaderSetting(activeDetailOutlineReaderPreviewItem.id);
                            else if (detailOutlineReaderTab === 'roles') toggleDraftDetailOutlineReaderRole(activeDetailOutlineReaderPreviewItem.id);
                            else if (detailOutlineReaderTab === 'plotChain') toggleDraftDetailOutlineReaderPlotChain(activeDetailOutlineReaderPreviewItem.id);
                            else toggleDraftDetailOutlineReaderOutline(activeDetailOutlineReaderPreviewItem.id);
                          }}
                          className={
                            'grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-black ' +
                            (isActiveDetailOutlineReaderPreviewChecked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent')
                          }
                        >
                          ✓
                        </button>
                        <h4 className="mt-1 truncate text-2xl font-black text-slate-900">{activeDetailOutlineReaderPreviewItem.title}</h4>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black ${
                        isActiveDetailOutlineReaderPreviewChecked
                          ? 'border border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                          : 'border border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {isActiveDetailOutlineReaderPreviewChecked ? '已勾选' : '未勾选'}
                    </span>
                  </div>
                  <div className="min-h-[360px] flex-1 whitespace-pre-wrap break-words rounded-2xl border-2 border-slate-900 bg-white p-5 text-sm font-bold leading-8 text-slate-600">
                    {activeDetailOutlineReaderPreviewItem.content || '暂无内容'}
                  </div>
                </article>
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-300">
                  {detailOutlineReaderTab === 'settings'
                    ? '暂无可关联设定'
                    : detailOutlineReaderTab === 'roles'
                    ? '暂无可关联角色'
                    : detailOutlineReaderTab === 'plotChain'
                    ? '暂无可关联剧情链'
                    : '暂无可关联章纲'}
                </div>
              )}
            </main>
            <aside className="editor-scrollbar min-h-0 overflow-y-auto border-l border-gray-100 bg-cyan-50 p-4">
              <div className="mb-3 text-sm font-black text-[#08AACE]">本次将读取</div>
              <div className="space-y-2">
                {draftDetailOutlineReaderItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-cyan-200 bg-white p-4 text-center text-xs font-bold leading-5 text-slate-400">
                    还没有选择关联资料
                  </div>
                ) : draftDetailOutlineReaderItems.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setDetailOutlineReaderTab(
                        detailOutlineReaderSettingItems.some((item) => item.id === entry.id)
                          ? 'settings'
                          : detailOutlineReaderRoleItems.some((item) => item.id === entry.id)
                          ? 'roles'
                          : detailOutlineReaderPlotChainItems.some((item) => item.id === entry.id)
                          ? 'plotChain'
                          : 'outlines',
                      );
                      setDetailOutlineReaderPreviewId(entry.id);
                    }}
                    className="w-full rounded-xl bg-white px-3 py-2 text-left shadow-sm transition-colors hover:bg-[#F8FEFF]"
                  >
                    <div className="truncate text-sm font-black text-slate-800">{entry.title}</div>
                    <div className="mt-1 truncate text-xs font-bold text-slate-400">{entry.group}</div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
            <div className="min-w-0 truncate text-sm font-bold text-gray-500">
              将读取 {draftDetailOutlineReaderItems.length} 项，共 <WordCountText value={draftDetailOutlineReaderWordCount} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearDraftDetailOutlineReader}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50"
              >
                清空
              </button>
              <button
                type="button"
                onClick={() => setIsDetailOutlineReaderOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDetailOutlineReader}
                className="rounded-xl bg-[#08AACE] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0798b8]"
              >
                确认读取
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    ) : null;
    const sendPlotPointAiMessage = async () => {
      const userText = plotPointInput.trim();
      const requestText = [
        '请根据关联的大纲设定、前文章纲和当前章节正文，生成本章剧情点。',
        '输出要求：按条列出关键剧情点，每条尽量包含冲突、行动、变化或伏笔，不要直接写成完整正文。',
        userText ? `补充要求：${userText}` : '',
      ].filter(Boolean).join('\n');
      if (isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setPlotPointOutput('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastOutlineAiRequestLog(buildOutlineAiRequestLog(requestText, contextText, promptText, new Date().toLocaleString('zh-CN')));
      setIsLibraryAiLoading(true);
      setPlotPointOutput('正在思考...');
      setPlotPointGeneratedCandidateText('');
      setIsPlotPointPreviewCleared(true);
      const task = startBackgroundAiTask({
        kind: 'detailOutline',
        title: '生成剧情点',
        input: requestText,
        initialOutput: '正在思考...',
        progressLabel: '正在生成',
        meta: {
          target: 'workbenchPlotPointAi',
          storageKey,
          tab: activeTab,
        },
        runner: async ({ signal, emit }) => {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          content = await callModelStream({
            model: selectedOutlineModel,
            prompt: `${promptText}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`,
            userContent: requestText,
            chapterContext: contextText,
            recordType: 'stream',
            signal,
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
            onChunk: (chunk) => {
              content += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
          });
          return reasoningContent.trim()
            ? formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true)
            : content;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
        },
      });
      updateActiveTabConfig({ plotPointAiTaskId: task.id });
    };
    const plotPointOutputContent = stripAiThinkingBlock(plotPointOutput);
    const plotPointOverlay = (
      <div
        className={plotPointStandalone ? 'flex min-h-0 flex-1 items-stretch justify-center bg-white' : 'modal-sharp fixed inset-0 z-[250] flex items-center justify-center bg-black/35 p-4'}
        onClick={plotPointStandalone ? undefined : () => setIsPlotPointModalOpen(false)}
      >
        <div
          className={plotPointStandalone ? 'flex h-full w-full flex-col overflow-hidden bg-white text-slate-900' : 'modal-sharp flex h-[min(760px,88vh)] w-[min(980px,92vw)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl'}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">生成剧情链</h3>
              <p className="mt-1 text-xs font-bold text-slate-400">关联内容与生成章纲一致，会带上大纲设定、前文章纲和当前章节正文。</p>
            </div>
            {!plotPointStandalone && (
              <button
                type="button"
                onClick={() => setIsPlotPointModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">章节</div>
                  <div className="mt-1 font-black text-slate-800">{getOutlineContextTitle()}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">模型</div>
                  <div className="mt-1 truncate font-black text-slate-800">{selectedOutlineModel?.name ?? '未选择模型'}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">提示词</div>
                  <div className="mt-1 truncate font-black text-slate-800">{activeOutlinePrompt?.name ?? '默认提示词'}</div>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <div className="text-xs font-bold text-slate-400">关联资料</div>
                  <div className={`mt-1 font-black ${selectedDetailOutlineReaderItems.length > 0 ? 'text-[#08AACE]' : 'text-slate-500'}`}>
                    已关联 {selectedDetailOutlineReaderItems.length} 项
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-400"><WordCountText value={detailOutlineReaderWordCount} /></div>
                </div>
                <button
                  type="button"
                  onClick={openDetailOutlineReader}
                  className="h-10 w-full rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                >
                  关联资料
                </button>
              </div>
            </aside>
            <main className="flex min-h-0 flex-col p-5">
              <div className="relative min-h-0 flex-1">
                <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full ${plotPointOutput.trim() ? 'xy-has-value' : ''}`}>
                  {plotPointOutput.startsWith('[[THINKING') ? (
                    <div className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-slate-600">
                      {renderAiChatContent(plotPointOutput)}
                    </div>
                  ) : (
                    <textarea
                      value={plotPointOutput}
                      onChange={(event) => {
                        setPlotPointOutput(event.target.value);
                        setPlotPointGeneratedCandidateText(event.target.value);
                        setIsPlotPointPreviewCleared(false);
                      }}
                      placeholder="生成后的剧情点会显示在这里，可以手动调整后复制到章纲要求里。"
                      className="editor-scrollbar text-sm leading-6 text-slate-600 outline-none"
                    />
                  )}
                  <label>剧情点预览</label>
                  <span className="xy-floating-count"><WordCountText value={countTextWords(plotPointOutputContent)} /></span>
                </div>
              </div>
              <div className="mt-3">
                <AiInlineInput
                  value={plotPointInput}
                  onChange={(event) => {
                    setPlotPointInput(event.target.value);
                    resizeFloatingAiTextarea(event.currentTarget);
                  }}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                      event.preventDefault();
                      void sendPlotPointAiMessage();
                    }
                  }}
                  onSend={() => void sendPlotPointAiMessage()}
                  onStop={() => {
                    if (activeTabConfig.plotPointAiTaskId) stopBackgroundAiTask(activeTabConfig.plotPointAiTaskId);
                    setIsLibraryAiLoading(false);
                  }}
                  sendDisabled={isLibraryAiLoading}
                  stopDisabled={!isLibraryAiLoading}
                  label="请输入剧情点要求"
                  textareaClassName="editor-scrollbar"
                />
              </div>
              <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setOutlineAiInput(plotPointOutputContent);
                    setIsPlotPointModalOpen(false);
                  }}
                  disabled={!plotPointOutputContent.trim()}
                  className="min-w-0 flex-1 bg-[#08AACE] px-3 py-2 text-sm font-black text-white hover:bg-[#0798b8] disabled:bg-slate-300"
                >
                  放入章纲要求
                </button>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(plotPointOutputContent)}
                  disabled={!plotPointOutputContent.trim()}
                  className="min-w-0 flex-1 border-l border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                >
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTabConfig.plotPointAiTaskId) stopBackgroundAiTask(activeTabConfig.plotPointAiTaskId);
                    setPlotPointOutput('');
                    setPlotPointGeneratedCandidateText('');
                    setIsPlotPointPreviewCleared(true);
                    updateActiveTabConfig({ plotPointAiTaskId: undefined });
                  }}
                  className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700"
                >
                  清空
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
    const plotPointModal = isPlotPointModalOpen && isDetailOutlineTab && !plotPointStandalone
      ? createPortal(plotPointOverlay, document.body)
      : null;
    const sendOutlineAiMessage = async () => {
      const userText = outlineAiInput.trim();
      const rawRequestText = plotPointStandalone
        ? buildPlotPointRequestText(userText)
        : userText || (isDetailOutlineTab ? '请根据关联的设定和前文章纲生成本章章纲。' : '');
      const requestText = formatOutlineUserTextForAi(rawRequestText);
      if (!requestText || isLibraryAiLoading) return;
      if (!selectedOutlineModel) {
        setOutlinePreviewDraft('【错误】尚未配置可用模型。请先到模型管理中新增模型。');
        return;
      }
      const contextText = getOutlineAiContext();
      const promptText = plotPointStandalone
        ? `${activeOutlinePrompt?.content ?? getOutlineDefaultPrompt()}\n\n当前任务是生成剧情点，不是直接生成完整细纲或正文。`
        : activeOutlinePrompt?.content ?? getOutlineDefaultPrompt();
      setLastOutlineAiRequestLog(buildOutlineAiRequestLog(requestText, contextText, promptText, new Date().toLocaleString('zh-CN'), rawRequestText));
      setIsLibraryAiLoading(true);
      setOutlineAiInput('');
      setOutlinePreviewDraft('正在思考...');
      if (plotPointStandalone) {
        setPlotPointGeneratedCandidateText('');
        setIsPlotPointPreviewCleared(true);
      }
      const task = startBackgroundAiTask({
        kind: plotPointStandalone ? 'detailOutline' : isDetailOutlineTab ? 'detailOutline' : 'summary',
        title: plotPointStandalone ? '生成剧情点' : isDetailOutlineTab ? '生成章纲' : '生成梗概',
        input: requestText,
        initialOutput: '正在思考...',
        progressLabel: '正在生成',
        meta: {
          target: 'workbenchOutlineAi',
          storageKey,
          tab: activeTab,
          plotPointStandalone,
        },
        runner: async ({ signal, emit }) => {
        let content = '';
        let reasoningContent = '';
        const startedAt = Date.now();
        const getThinkingSeconds = () => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        try {
          content = await callModelStream({
            model: selectedOutlineModel,
            prompt: promptText,
            userContent: requestText,
            chapterContext: contextText,
            recordType: 'stream',
            signal,
            onReasoning: (chunk) => {
              reasoningContent += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
            onChunk: (chunk) => {
              content += chunk;
              emit(formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), false), { replace: true });
            },
          });
          return reasoningContent.trim()
            ? formatAiThinkingResponse(content, reasoningContent, getThinkingSeconds(), true)
            : content;
        } catch (error) {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            const message = error instanceof Error ? error.message : '模型请求失败。';
            emit(`【错误】${message}`, { replace: true, progressLabel: '失败' });
          }
          throw error;
        }
        },
      });
      updateActiveTabConfig({
        outlineAiTaskId: task.id,
        ...(plotPointStandalone ? { plotPointPreviewDraft: '正在思考...' } : {}),
      });
    };
    const stopOutlineAiMessage = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      setIsLibraryAiLoading(false);
    };
    const clearOutlinePreviewDraft = () => {
      if (activeTabConfig.outlineAiTaskId) stopBackgroundAiTask(activeTabConfig.outlineAiTaskId);
      updateActiveTabConfig({ outlineAiTaskId: undefined });
      setOutlinePreviewDraft('');
    };

    const plotPointLinkedSettingSummary = selectedDetailOutlineReaderItems.length > 0
      ? selectedDetailOutlineReaderItems.map((item) => item.title).join('、')
      : '未关联大纲设定';
    const plotPointUserRequirementSummary = plotPointOpeningElements.length > 0
      ? plotPointOpeningElements.join('、')
      : '未选择';
    const renderDetailOutlineVolumeTree = (displayVolumes: Volume[], publishedLane = false) => (
      <div className="space-y-3">
        {displayVolumes.map((volume) => {
          const expanded = expandedOutlineVolumeIds.has(volume.id);
          const VolumeFolderIcon = expanded ? FolderOpen : Folder;
          const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;

          return (
            <div key={volume.id} className="mb-1">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleOutlineVolume(volume.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  toggleOutlineVolume(volume.id);
                }}
                className={WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                aria-expanded={expanded}
              >
                <VolumeFolderIcon className={WORKBENCH_FOLDER_GROUP_ICON_CLASS} />
                <span className="min-w-0 flex-1 truncate leading-none">{volume.name}</span>
                <span className={WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{volume.chapters.length}章</span>
                {enableVolumeSummary && !publishedLane && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      selectOutlineVolume(volume);
                    }}
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold transition-colors ${
                      volumeIsSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-brand/40 bg-white/70 text-brand-dark hover:bg-white'
                    }`}
                  >
                    卷梗概
                  </button>
                )}
              </div>
              {expanded && (
                <div
                  className="mt-1 grid justify-start gap-1.5 px-1.5 py-1.5"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}
                >
                  {volume.chapters.map((chapter) => {
                    const entry = getChapterSummaryEntry(chapter.serialNumber);
                    const selected = effectiveSelectedOutlineChapterId === chapter.id;
                    const outlineWordCount = countTextWords(entry?.content ?? '');
                    const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');
                    const hasSummary = outlineWordCount > 0;
                    const outlineButtonContentStateClass = chapterContentWordCount > 0
                        ? 'xy-detail-outline-number-used'
                        : hasSummary
                          ? 'xy-detail-outline-number-has-outline'
                          : 'xy-detail-outline-number-no-outline';
                    const outlineButtonSelectedClass = selected ? 'xy-detail-outline-number-selected' : '';
                    const outlineButtonClass = isDetailOutlineTab
                      ? `relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block ${outlineButtonContentStateClass} ${outlineButtonSelectedClass}`
                      : `relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                          selected
                            ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                            : hasSummary
                            ? 'border-[#08B3D9] bg-[#E1F3F7] text-[#08AACE] hover:border-[#067B96] hover:bg-[#D3EEF5]'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                        }`;
                    return (
                      <button
                        key={chapter.id}
                        onMouseDown={(event) => {
                          if (event.button !== 0) return;
                          event.preventDefault();
                          event.stopPropagation();
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onContextMenu={(event) => {
                          if (!isDetailOutlineTab) return;
                          event.preventDefault();
                          event.stopPropagation();
                          const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE);
                          setDetailOutlineChapterMenu({
                            visible: true,
                            x: left,
                            y: top,
                            chapter,
                          });
                        }}
                        className={outlineButtonClass}
                        title={publishedLane ? '移回未发布' : '移动到已发布'}
                      >
                        {chapter.serialNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
    if (plotPointStandalone) {
      return (
        <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
          {fieldSizeSettingsModal}
          {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
          {outlineAiLogModal}
          {detailOutlineReaderModal}
          <main
            className="grid min-h-0 flex-1 overflow-hidden bg-white"
            style={{
              gridTemplateColumns: `${plotPointLayoutTreeWidth}px 0px ${plotPointLayoutLeftWidth}px 0px minmax(${PLOT_POINT_LAYOUT_CENTER_MIN_WIDTH}px,1fr) 0px ${plotPointLayoutRightWidth}px`,
            }}
          >
            <aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-white px-1 py-2">
              <nav className="editor-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="剧情链目录树">
                <div className="space-y-3">
                  <section
                    className="relative"
                    aria-label="当前主链未写序号导航"
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setPlotPointChainMenuSlot(plotPointActiveChainSlot);
                      setPlotPointChainRenameDraft(plotPointChainNames[plotPointActiveChainSlot] ?? `剧情链${plotPointActiveChainSlot}`);
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true}
                      onClick={() => {
                        setPlotPointChainMenuSlot(null);
                        setExpandedPlotPointChainTreeSlots((current) => ({ ...current, [plotPointActiveChainSlot]: !(current[plotPointActiveChainSlot] ?? true) }));
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                        {(expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                        主链
                      </span>
                      <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{plotPointUnwrittenItems.length}未写</span>
                    </button>
                    {plotPointChainMenuSlot === plotPointActiveChainSlot && (
                      <div role="menu" aria-label="当前主链菜单" className="absolute left-2 top-12 z-10 w-40 rounded-lg border border-[#bdeef7] bg-white p-2 shadow-lg">
                        <label className="block text-[10px] font-black text-[#078fb0]" htmlFor="plot-point-chain-rename">重命名</label>
                        <input
                          id="plot-point-chain-rename"
                          value={plotPointChainRenameDraft}
                          onChange={(event) => setPlotPointChainRenameDraft(event.target.value)}
                          className="mt-1 h-8 w-full rounded-md border border-[#bdeef7] px-2 text-xs font-bold text-slate-700 outline-none focus:border-[#08AACE]"
                        />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => renamePlotPointChain(plotPointActiveChainSlot, plotPointChainRenameDraft)}
                          className="mt-2 h-8 w-full rounded-md bg-[#08AACE] px-2 text-[11px] font-black text-white hover:bg-[#0798b8]"
                        >
                          保存
                        </button>
                      </div>
                    )}
                    {(expandedPlotPointChainTreeSlots[plotPointActiveChainSlot] ?? true) && (
                      <div
                        className="mt-1 grid justify-start gap-2 px-1.5 py-1.5"
                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(36px, max-content))' }}
                        aria-label="当前主链未写剧情点序号"
                      >
                        {plotPointUnwrittenItems.length === 0 ? (
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-400">暂无未写剧情点</div>
                        ) : (
                          plotPointUnwrittenItems.map((item) => {
                            const originalIndex = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);
                            const activePoint = activePlotPointChainItemId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                aria-label={`跳转未写剧情点${originalIndex + 1} ${item.title}`}
                                onClick={() => {
                                  setPlotPointChainMenuSlot(null);
                                  setPlotPointChainFilterMode('all');
                                  setActivePlotPointChainItemId(item.id);
                                }}
                                title={`未写剧情点${originalIndex + 1} ${item.title}`}
                                className={`relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                  activePoint
                                    ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                }`}
                              >
                                {originalIndex + 1}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </section>
                  <details className="rounded-xl bg-white text-xs font-bold text-slate-500">
                    <summary className="xy-plot-chain-summary flex cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-sm font-bold leading-5 text-white transition-colors hover:brightness-95">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">备选链</span>
                      <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{PLOT_POINT_CHAIN_SLOTS.length - 1}条</span>
                    </summary>
                    <div className="mt-1 grid gap-2 px-1.5 py-1.5">
                      {PLOT_POINT_CHAIN_SLOTS.filter((slot) => slot !== plotPointActiveChainSlot).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setActivePlotPointChainSlot(slot)}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#08AACE] bg-[#08AACE] px-3 py-1.5 text-left text-sm font-bold leading-5 text-white transition-colors hover:brightness-95"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{plotPointChainNames[slot] ?? `剧情链${slot}`}</span>
                          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{(plotPointChainSelections[slot] ?? []).length}点</span>
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </nav>
            </aside>

            {plotPointTreeResizeHandle}

            <aside className="min-w-0 flex min-h-0 flex-col border-r border-slate-100 bg-white">
              <div className="editor-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    ['all', '全部'],
                    ['unwritten', '只看未写'],
                    ['written', '只看已写'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPlotPointChainFilterMode(mode as typeof plotPointChainFilterMode)}
                      className={`h-10 w-20 whitespace-nowrap rounded-2xl border px-2 text-sm font-black ${
                        plotPointChainFilterMode === mode
                          ? 'border-[#08AACE] bg-[#08AACE] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openDetailOutlineFromPlotPoint}
                    className="h-10 w-20 whitespace-nowrap rounded-2xl bg-[#08AACE] px-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0798b8]"
                  >
                    生成章纲
                  </button>
                </div>
                {plotPointSelectedItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
                    先在右侧关联资料，再选择剧情点来源和剧情点类型。选中的剧情点会加入当前剧情链。
                  </div>
                ) : visiblePlotPointSelectedItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">
                    当前过滤条件下没有剧情点，切到“全部”可以查看已写内容。
                  </div>
                ) : (
                  <div className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-px before:bg-[#9DEBFA]">
                    {visiblePlotPointSelectedItems.map((item) => {
                      const index = plotPointSelectedItems.findIndex((selectedItem) => selectedItem.id === item.id);
                      const written = plotPointWrittenIdSet.has(item.id);
                      const activeChainItem = activePlotPointChainItemId === item.id;
                      const collapsedCard = prepareCollapsedPlotPointCard(item);
                      const scoreText = item.score ?? collapsedCard.averageScore;
                      const metrics = getWorkbenchPlotPointDecisionMetrics(item, scoreText, index > 0, index);
                      const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                      const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                      const reviewExpanded = expandedPlotPointPreviewIds.includes(`chain-review:${item.id}`);
                      const metricItems = [
                        ['内容', metrics.clarity],
                        ['潜力', metrics.potential],
                        ['衔接', metrics.fit],
                      ] as const;
                      return (
                        <div key={item.id} className={`relative rounded-2xl border bg-white p-4 shadow-sm ${activeChainItem ? 'border-[#08AACE] ring-2 ring-[#bdeef7]' : written ? 'border-slate-200' : 'border-[#bdeef7]'}`}>
                          <button
                            type="button"
                            onClick={() => setActivePlotPointChainItemId(item.id)}
                            className={`absolute -left-[26px] top-4 grid h-8 w-8 place-items-center rounded-full text-xs font-black shadow-sm ${
                              activeChainItem ? 'bg-[#08AACE] text-white' : written ? 'bg-slate-100 text-slate-500 ring-2 ring-slate-200' : 'bg-white text-[#08AACE] ring-2 ring-[#9DEBFA]'
                            }`}
                            title={`剧情点${index + 1} ${item.title}`}
                          >
                            {index + 1}
                          </button>
                          <div className="editor-scrollbar mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[#BDEEF7] bg-[#F1FBFE] p-4 text-sm font-bold leading-7 text-slate-700">
                            {displayText}
                          </div>
                          <div className="mt-3 min-w-0">
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {metricItems.map(([label, value]) => (
                                <div key={label} className={`flex h-8 items-center justify-between rounded-xl border px-3 shadow-sm ${getWorkbenchPlotPointMetricClass(value)}`}>
                                  <span className="text-xs font-black opacity-80">{label}</span>
                                  <span className="text-sm font-black">{value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => togglePlotPointPreviewExpanded(`chain-review:${item.id}`)}
                                className="h-7 rounded-lg border border-[#bdeef7] bg-white px-3 text-xs font-black text-[#08AACE] transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD]"
                              >
                                {reviewExpanded ? '收起AI评价' : 'AI评价'}
                              </button>
                              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => (written ? movePlotPointChainItemToUnwritten(item.id) : markPlotPointChainItemWritten(item.id))}
                                  className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-black shadow-sm transition-colors ${
                                    written
                                      ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {written ? '移回未写' : '标为已写'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePlotPointCandidate(item.id)}
                                  className="h-8 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-red-500 shadow-sm transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600"
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                            {reviewExpanded && (
                              <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold leading-5 text-[#078fb0]">
                                {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                              </div>
                            )}
                          </div>
                        </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {plotPointLeftResizeHandle}

            <section className="min-w-0 flex min-h-0 flex-col bg-white">
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                {plotPointVisibleCandidates.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                    暂无剧情点预览
                  </div>
                ) : (
                <div className="space-y-3">
                  {plotPointVisibleCandidates.map((item, index) => {
                    const selected = plotPointSelectedIds.includes(item.id);
                    const expanded = expandedPlotPointPreviewIds.includes(item.id);
                    const collapsedCard = prepareCollapsedPlotPointCard(item);
                    const averageScore = item.score ?? collapsedCard.averageScore;
                    const metrics = getWorkbenchPlotPointDecisionMetrics(item, averageScore, hasPlotPointChain, index);
                    const previewText = collapsedCard.previewText || getWorkbenchPlotPointPreviewText(item);
                    const displayText = getWorkbenchPlotPointDisplayText(item, previewText);
                    const fitLabel = getWorkbenchPlotPointFitLabel(metrics.fit, hasPlotPointChain);
                    const metricItems = [
                      ['内容', metrics.clarity],
                      ['潜力', metrics.potential],
                      [hasPlotPointChain ? '衔接' : '开端', metrics.fit],
                    ] as const;
                    return (
                      <div key={item.id} className={`rounded-xl border p-3 shadow-sm transition-colors ${selected ? 'border-[#08AACE] bg-[#EAF9FD] ring-2 ring-[#bdeef7]' : 'border-slate-200 bg-white hover:border-[#bdeef7]'}`}>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className="min-w-0 max-w-full truncate text-base font-black text-slate-950">剧情点 {index + 1}</span>
                              {averageScore && (
                                <span className={`shrink-0 rounded-full bg-white px-2 py-1 text-xs font-black ${getPlotPointScoreColorClass(averageScore)}`}>
                                  {averageScore}分
                                </span>
                              )}
                              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${getWorkbenchPlotPointFitClass(metrics.fit)}`}>
                                {fitLabel} {metrics.fit}
                              </span>
                              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#08AACE]">{item.source}</span>
                            </div>
                            <p className={`mt-2 text-[14.4px] font-bold leading-[24px] ${expanded ? '' : 'line-clamp-3'} ${selected ? 'text-slate-800' : 'text-slate-600'}`}>{displayText}</p>
                            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                              {getWorkbenchPlotPointReview(item, isPlotPointFollowupStage)}
                            </div>
                          </div>
                          <div className="flex w-[118px] shrink-0 flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedPlotPointPreviewIds((current) => (
                                    current.includes(item.id)
                                      ? current.filter((candidateId) => candidateId !== item.id)
                                      : [...current, item.id]
                                  ));
                                }}
                                className="h-8 w-12 shrink-0 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-500 hover:border-[#08AACE] hover:text-[#08AACE]"
                              >
                                {expanded ? '收起' : '展开'}
                              </button>
                              <button
                                type="button"
                                onClick={() => togglePlotPointCandidate(item.id)}
                                className={`h-8 w-14 shrink-0 rounded-lg text-xs font-black ${selected ? 'bg-slate-900 text-white' : 'border border-[#08AACE] bg-white text-[#08AACE] hover:bg-[#EAF9FD]'}`}
                              >
                                {selected ? '已选' : '选择'}
                              </button>
                            </div>
                            <div className="space-y-1">
                              {metricItems.map(([label, value]) => (
                                <div key={label} className="flex h-7 items-center justify-between rounded-lg bg-slate-50 px-2 text-[11px] font-black">
                                  <span className="text-slate-500">{label}</span>
                                  <span className="text-slate-700">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
              <div className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4">
                <button
                  type="button"
                  onClick={() => {
                    setPlotPointGeneratedCandidateText('');
                    setIsPlotPointPreviewCleared(true);
                    setOutlinePreviewDraft('');
                    setExpandedPlotPointPreviewIds([]);
                  }}
                  className="h-9 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-500 hover:bg-red-50"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isLibraryAiLoading) return;
                    plotPointGenerationModeRef.current = 'restart';
                    setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: false }));
                    setIsPlotPointPreviewCleared(false);
                    void sendOutlineAiMessage();
                  }}
                  disabled={isLibraryAiLoading}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-[#08AACE] hover:text-[#08AACE] disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  重新生成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isLibraryAiLoading || !hasPlotPointChain) return;
                    plotPointGenerationModeRef.current = 'continue';
                    setPlotPointChainRefreshStates((current) => ({ ...current, [plotPointActiveChainSlot]: true }));
                    setIsPlotPointPreviewCleared(false);
                    void sendOutlineAiMessage();
                  }}
                  disabled={isLibraryAiLoading || !hasPlotPointChain}
                  className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  继续生成
                </button>
              </div>
            </section>

            {plotPointRightResizeHandle}

            <aside className="min-w-0 flex min-h-0 flex-col border-l border-slate-100 bg-gray-50">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 pt-2">
                <section className="shrink-0">
                  <div className="space-y-2">
                    {showInlineFieldSizeButton ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex shrink-0 items-center gap-2">
                        {renderLibraryAiLogButton('outline', 'h-9 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-[#08AACE] hover:bg-[#EAF9FD] hover:text-[#08AACE]')}
                        {renderDetailOutlineFontSizeTool()}
                        {renderFieldSizeButton()}
                      </div>
                    </div>
                    ) : null}
                    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2">
                      <CombinedAiConfigSelect
                        style={getEmbeddedConfigSelectStyle(getFieldSizeStyle(outlineModelFieldSizeKey))}
                        modelValue={activeTabConfig.modelId ?? ''}
                        promptValue={activeOutlinePromptId ?? ''}
                        modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                        promptOptions={outlinePromptOptions.length === 0 ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }] : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                        onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                        onPromptChange={updateOutlinePromptId}
                        onModelManage={() => setManagementModal({ type: 'models' })}
                        onPromptManage={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">长度：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {([
                          ['short', '短'],
                          ['medium', '中'],
                          ['long', '长'],
                        ] as const).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPlotPointLength(key)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointLength === key ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点类型：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {(['强情绪', '强冲突', '强悬念'] as const).map((element) => (
                          <button
                            key={element}
                            type="button"
                            onClick={() => togglePlotPointOpeningElement(element)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointOpeningElements.includes(element) ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {element}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0" />
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {(['强期待', '强爽点', '强压迫'] as const).map((element) => (
                          <button
                            key={element}
                            type="button"
                            onClick={() => togglePlotPointOpeningElement(element)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointOpeningElements.includes(element) ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {element}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-[96px] shrink-0 text-sm font-black text-slate-950">剧情点数量：</span>
                      <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {([5, 10, 20] as const).map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setPlotPointGenerateCount(count)}
                            className={`h-9 min-w-0 flex-1 border-r border-slate-200 text-[15px] font-black leading-none last:border-r-0 ${
                              plotPointGenerateCount === count ? 'bg-[#EAF9FD] text-[#08AACE]' : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {count}个
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 xy-has-value">
                    <div className="xy-floating-rich-preview editor-scrollbar h-full w-full overflow-y-auto whitespace-pre-wrap text-xs font-bold leading-6 text-slate-600">
                      {outlinePreviewDraft.trim() ? renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone }) : null}
                    </div>
                    <label>{plotPointStandalone ? '剧情点预览' : '章纲预览'}</label>
                    <span className="xy-floating-count xy-floating-count-top-left" style={{ '--xy-floating-count-left': plotPointStandalone ? '7.6rem' : '6.2rem' } as CSSProperties}><WordCountText value={countTextWords(outlinePreviewDraftContent)} /></span>
                    <button type="button" onClick={clearOutlinePreviewDraft} className="xy-floating-outline-clear-button xy-border-embedded-transparent-backplate xy-floating-outline-inner-clear-tool absolute z-40 px-1 text-xs font-black text-red-500">清空</button>
                  </div>
                  <LinkedSourceControl
                    linked={selectedDetailOutlineReaderItems.length > 0}
                    label="关联"
                    linkedLabel="已关联"
                    onOpen={openDetailOutlineReader}
                    onClear={clearDetailOutlineReaderSelection}
                    meta={detailOutlineReaderWordCount > 0 ? <WordCountText value={detailOutlineReaderWordCount} compact /> : null}
                    title={plotPointLinkedSettingSummary}
                    className="mt-3 flex items-center gap-3"
                    groupClassName="flex h-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                    linkedButtonClassName="h-9 min-w-[78px] px-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                    clearButtonClassName="flex h-9 w-10 items-center justify-center bg-red-500 text-white hover:bg-red-600"
                    buttonClassName="h-9 min-w-[84px] rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                    metaClassName="shrink-0 text-sm font-black text-[#08AACE]"
                  />
                  <div className="mt-3">
                    <AiInlineInput
                      value={outlineAiInput}
                      onChange={(event) => {
                        setOutlineAiInput(event.target.value);
                        resizeFloatingAiTextarea(event.currentTarget);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          void sendOutlineAiMessage();
                        }
                      }}
                      onSend={() => void sendOutlineAiMessage()}
                      onStop={stopOutlineAiMessage}
                      sendDisabled={isLibraryAiLoading}
                      stopDisabled={!isLibraryAiLoading}
                      textareaClassName="editor-scrollbar"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
        {libraryHeaderFontSizePortal}
        {(activeTab === OUTLINE_LIBRARY_TAB || activeTab === DETAIL_OUTLINE_TAB) && !plotPointStandalone && renderTopTabs()}
        {deleteConfirmDialog}
        {fieldSizeSettingsModal}
        {managementModal && <LibraryManagementModal modal={managementModal} onClose={() => setManagementModal(null)} />}
        {outlineAiLogModal}
        {plotPointModal}
        {detailOutlineReaderModal}
        {detailOutlineChapterMenu.visible && detailOutlineChapterMenu.chapter && (
          <div
            className="fixed z-[100] w-[136px] rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
            style={{
              left: detailOutlineChapterMenu.x,
              top: detailOutlineChapterMenu.y,
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            {isDetailOutlineChapterPublished(detailOutlineChapterMenu.chapter) ? (
              <button
                type="button"
                disabled={detailOutlineChapterMenu.chapter.isPublished}
                onClick={() => moveDetailOutlineChapterToUnpublished(detailOutlineChapterMenu.chapter!)}
                className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white"
                title={detailOutlineChapterMenu.chapter.isPublished ? '正文已发布，章纲会自动留在已发布' : undefined}
              >
                移回未发布
              </button>
            ) : (
              <button
                type="button"
                onClick={() => moveDetailOutlineChapterToPublished(detailOutlineChapterMenu.chapter!.id)}
                className="w-full rounded-md px-3 py-2 text-left text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
              >
                移动到已发布
              </button>
            )}
          </div>
        )}
        <div
          className="relative grid min-h-0 flex-1 overflow-hidden bg-white"
          style={{
            gridTemplateColumns: isDetailOutlineTab && showDetailOutlinePublished
              ? `${outlineSidebarWidth}px 0px 190px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`
              : `${outlineSidebarWidth}px 0px minmax(0,1fr) 0px ${settingLibraryRightWidth}px`,
          }}
        >
            <aside className={`min-w-0 flex min-h-0 flex-col border-r border-gray-100 ${isDetailOutlineTab ? 'bg-[#F8FAFC]' : 'bg-gray-50 px-1 py-2'}`}>
          {isDetailOutlineTab && (
            <div className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS : 'mb-3 flex h-9 shrink-0 items-center justify-between gap-2'}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>未发布</span>
                <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>
                  {detailOutlineUnpublishedCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailOutlinePublished((prev) => !prev)}
                className={isDetailOutlineTab ? DETAIL_OUTLINE_SIDEBAR_TOGGLE_CLASS : 'shrink-0 rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-[#0798b8]'}
              >
                {showDetailOutlinePublished ? '收回已发布' : '展开已发布'}
              </button>
            </div>
          )}
          <section className={`flex min-h-0 flex-1 flex-col ${isDetailOutlineTab ? 'px-1 py-2' : ''}`}>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {(isDetailOutlineTab ? detailOutlineUnpublishedCount === 0 : volumes.length === 0) ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无章节</p>
              ) : (
                <div className={isDetailOutlineTab ? 'space-y-2' : 'space-y-3'}>
                  {(isDetailOutlineTab
                    ? detailOutlineUnpublishedVolumes.filter((volume) => volume.chapters.length > 0)
                    : volumes
                  ).map((volume) => {
                    const expanded = expandedOutlineVolumeIds.has(volume.id);
                    const VolumeFolderIcon = expanded ? FolderOpen : Folder;
                    const volumeIsSelected = safeOutlineSelectionType === 'volume' && selectedOutlineVolume?.id === volume.id;

                    return (
                    <div key={volume.id} className="mb-1">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleOutlineVolume(volume.id)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          toggleOutlineVolume(volume.id);
                        }}
                        className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ROW_CLASS : WORKBENCH_FOLDER_GROUP_BUTTON_CLASS}
                        aria-expanded={expanded}
                      >
                        <VolumeFolderIcon
                          className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_ICON_CLASS : WORKBENCH_FOLDER_GROUP_ICON_CLASS}
                        />
                        <span className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_TITLE_CLASS : 'min-w-0 flex-1 truncate leading-none'}>{volume.name}</span>
                        <span className={isDetailOutlineTab ? DETAIL_OUTLINE_VOLUME_COUNT_CLASS : WORKBENCH_FOLDER_GROUP_COUNT_CLASS}>{volume.chapters.length}章</span>
                        {enableVolumeSummary && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              selectOutlineVolume(volume);
                            }}
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold transition-colors ${
                              volumeIsSelected
                                ? 'border-brand bg-brand text-white'
                                : 'border-brand/40 bg-white/70 text-brand-dark hover:bg-white'
                            }`}
                          >
                            卷梗概
                          </button>
                        )}
                      </div>
                      {expanded && (
                        <div
                          className="mt-1 grid justify-start gap-1.5 px-1.5 py-1.5"
                          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(32px, max-content))' }}
                        >
                          {[...volume.chapters].sort((a, b) => a.serialNumber - b.serialNumber).map((chapter) => {
                            const entry = getChapterSummaryEntry(chapter.serialNumber);
                            const selected = effectiveSelectedOutlineChapterId === chapter.id;
                            const outlineWordCount = countTextWords(entry?.content ?? '');
                            const chapterContentWordCount = countTextWords(getChapterContent?.(chapter.id) ?? '');
                            const hasSummary = outlineWordCount > 0;
                            const outlineButtonContentStateClass = chapterContentWordCount > 0
                                ? 'xy-detail-outline-number-used'
                                : hasSummary
                                  ? 'xy-detail-outline-number-has-outline'
                                  : 'xy-detail-outline-number-no-outline';
                            const outlineButtonSelectedClass = selected ? 'xy-detail-outline-number-selected' : '';
                            const outlineButtonClass = isDetailOutlineTab
                              ? `relative grid h-8 w-8 place-items-center rounded-lg border text-center text-sm font-black leading-none transition-colors xy-detail-outline-number-block ${outlineButtonContentStateClass} ${outlineButtonSelectedClass}`
                              : `relative h-9 min-w-9 rounded-lg border px-2 text-sm font-black transition-colors ${
                                  selected
                                    ? 'border-[#08B3D9] bg-[#EAF9FD] text-[#078fb0]'
                                    : hasSummary
                                    ? 'border-[#08B3D9] bg-[#E1F3F7] text-[#08AACE] hover:border-[#067B96] hover:bg-[#D3EEF5]'
                                    : 'border-slate-200 bg-white text-slate-900 hover:border-[#08B3D9] hover:bg-[#EAF9FD] hover:text-[#078fb0]'
                                }`;
                            return (
                              <button
                                key={chapter.id}
                                onMouseDown={(event) => {
                                  if (event.button !== 0) return;
                                  event.preventDefault();
                                  event.stopPropagation();
                                  selectOutlineChapter(chapter.id, chapter.serialNumber);
                                }}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                                onContextMenu={(event) => {
                                  if (!isDetailOutlineTab) return;
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const { left, top } = clampFixedMenuPosition(event.clientX, event.clientY, DETAIL_OUTLINE_CHAPTER_CONTEXT_MENU_SIZE);
                                  setDetailOutlineChapterMenu({
                                    visible: true,
                                    x: left,
                                    y: top,
                                    chapter,
                                  });
                                }}
                                className={outlineButtonClass}
                                title={isDetailOutlineTab ? '移动到已发布' : undefined}
                              >
                                {isDetailOutlineTab ? (
                                  chapter.serialNumber
                                ) : (
                                  chapter.serialNumber
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </aside>
        {leftResizeHandle}
        {isDetailOutlineTab && showDetailOutlinePublished && (
          <aside className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white">
            <div className={DETAIL_OUTLINE_SIDEBAR_HEADER_CLASS}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={DETAIL_OUTLINE_SIDEBAR_TITLE_CLASS}>已发布</span>
                <span className={DETAIL_OUTLINE_SIDEBAR_COUNT_CLASS}>
                  {detailOutlinePublishedCount}
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
              {volumes.length === 0 ? (
                <p className="pt-10 text-center text-xs text-gray-400">暂无已发布章纲</p>
              ) : (
                renderDetailOutlineVolumeTree(detailOutlinePublishedVolumes, true)
              )}
            </div>
          </aside>
        )}

        <main className="min-w-0 flex min-h-0 flex-col border-r border-gray-100 bg-white p-5">
          <div className={`editor-scrollbar min-h-0 flex-1 overflow-y-auto ${isDetailOutlineTab ? '-mr-4 pr-4 pt-2.5' : '-mr-4 pr-4 pt-5'}`}>
            {outlineChapters.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">暂无章节可预览</div>
            ) : safeOutlineSelectionType === 'volume' && selectedOutlineVolume ? (
              <section className="xy-selected-content-bg rounded-xl border border-[#08AACE] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{selectedOutlineVolume.name}梗概</h4>
                  <span className="shrink-0 text-lg font-bold text-gray-900">{selectedOutlineVolume.chapters.length}章</span>
                </div>
                <textarea
                  data-no-modal-drag="true"
                  value={selectedVolumeEntry?.content ?? ''}
                  onChange={(event) => updateVolumeSummary(selectedOutlineVolume.name, event.target.value)}
                  placeholder="这一卷的梗概会显示在这里，内容是该卷下所有章节内容的总结。"
                  className="editor-scrollbar h-[460px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 outline-none focus:border-brand"
                />
                <div className="mt-2 text-right text-xs font-bold text-gray-400">
                  <WordCountText value={countTextWords(selectedVolumeEntry?.content ?? '')} /></div>
              </section>
            ) : isDetailOutlineTab && selectedOutlineChapter ? (
              (() => {
                const { volume, chapter } = selectedOutlineChapter;
                const entry = getChapterSummaryEntry(chapter.serialNumber);
                const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                const outlineCardContent = entry?.content ?? '';
                const detailOutlineParts = splitDetailOutlineStateExpectation(outlineCardContent);
                const updateDetailOutlinePart = (part: 'outline' | 'stateExpectation', value: string) => {
                  updateChapterSummary(
                    chapter.serialNumber,
                    mergeDetailOutlineStateExpectation(
                      part === 'outline' ? value : detailOutlineParts.outline,
                      part === 'stateExpectation' ? value : detailOutlineParts.stateExpectation,
                    ),
                  );
                };
                return (
                  <div
                    key={chapter.id}
                    ref={(element) => {
                      outlinePreviewRefs.current[chapter.id] = element;
                    }}
                    className="flex h-full min-h-0 flex-col gap-4"
                  >
                    <section
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-[0_0_62%] ${detailOutlineParts.outline.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={detailOutlineParts.outline}
                        onChange={(event) => updateDetailOutlinePart('outline', event.target.value)}
                        onFocus={() => {
                          setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onScroll={() => handleDetailOutlineTextareaScroll(chapter.id)}
                        placeholder="该章章纲会显示在这里，可由 AI 根据章节内容生成。"
                        className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`}
                        style={{
                          height: '100%',
                          overflowY: 'auto',
                          fontSize: detailOutlineFontSize,
                        }}
                      />
                      <label className="xy-floating-title-count xy-detail-outline-title-count">
                        <span className="xy-floating-title-text xy-detail-outline-heading-title">{outlineCardTitle}</span>
                      </label>
                      <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
                        {`第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`}
                      </span>
                      <span className="xy-floating-count">
                        <WordCountText value={countTextWords(detailOutlineParts.outline)} />
                      </span>
                    </section>
                    <section
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count min-h-0 flex-1 ${detailOutlineParts.stateExpectation.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={detailOutlineParts.stateExpectation}
                        onChange={(event) => updateDetailOutlinePart('stateExpectation', event.target.value)}
                        onFocus={() => {
                          setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        placeholder="按人物状态、道具状态、势力状态、关系状态、线索/信息记录本章预计变化。"
                        className="w-full resize-none text-sm leading-6 text-gray-700 outline-none scrollbar-scroll-only"
                        style={{
                          height: '100%',
                          overflowY: 'auto',
                          fontSize: detailOutlineFontSize,
                        }}
                      />
                      <label className="xy-floating-title-count xy-detail-outline-title-count">
                        <span className="xy-floating-title-text xy-detail-outline-heading-title">状态变化</span>
                      </label>
                      <span className="xy-floating-count">
                        <WordCountText value={countTextWords(detailOutlineParts.stateExpectation)} />
                      </span>
                    </section>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {outlineChapters.map(({ volume, chapter }) => {
                  const entry = getChapterSummaryEntry(chapter.serialNumber);
                  const selected = effectiveSelectedOutlineChapterId === chapter.id;
                  const outlineCardTitle = getOutlineChapterFrameTitle(volume, chapter);
                  const outlineCardContent = entry?.content ?? '';
                  const detailOutlineHeight = isDetailOutlineTab ? getDetailOutlinePreviewHeight() : undefined;
                  return (
                    <section
                      key={chapter.id}
                      ref={(element) => {
                        outlinePreviewRefs.current[chapter.id] = element;
                      }}
                      className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count ${selected ? 'xy-outline-selected xy-has-value' : outlineCardContent.trim() ? 'xy-has-value' : ''}`}
                    >
                      <textarea
                        data-no-modal-drag="true"
                        value={outlineCardContent}
                        onChange={(event) => updateChapterSummary(chapter.serialNumber, event.target.value)}
                        onFocus={() => {
                          if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                          selectOutlineChapter(chapter.id, chapter.serialNumber);
                        }}
                        onScroll={isDetailOutlineTab ? () => handleDetailOutlineTextareaScroll(chapter.id) : undefined}
                        placeholder={isDetailOutlineTab ? '该章章纲会显示在这里，可由 AI 根据章节内容生成。' : '该章梗概会显示在这里，可由 AI 根据章节内容生成。'}
                        className={`w-full resize-none text-sm leading-6 text-gray-700 outline-none ${
                          isDetailOutlineTab
                            ? `scrollbar-scroll-only ${activeDetailOutlineScrollId === chapter.id ? 'scrollbar-active' : ''}`
                            : 'editor-scrollbar h-36'
                        }`}
                        style={isDetailOutlineTab ? {
                          height: detailOutlineHeight,
                          overflowY: 'auto',
                          fontSize: detailOutlineFontSize,
                        } : undefined}
                      />
                      <label className={isDetailOutlineTab ? 'xy-floating-title-count xy-detail-outline-title-count' : undefined}>
                        <span className={isDetailOutlineTab ? 'xy-floating-title-text xy-detail-outline-heading-title' : undefined}>{outlineCardTitle}</span>
                      </label>
                      <span className="xy-floating-outline-chapter-meta xy-border-embedded-transparent-backplate absolute right-9 top-0 z-20 max-w-[44%] -translate-y-1/2 truncate text-sm font-black leading-5 text-slate-950">
                        {isDetailOutlineTab
                          ? `第${getVolumeDisplayIndex(volume.id)}卷 · ${chapter.title.trim() || '未命名章节'}`
                          : <>第{chapter.serialNumber}章 {chapter.title.trim() || '未命名章节'} <WordCountText value={chapter.wordCount} compact /></>}
                      </span>
                      {isDetailOutlineTab && (
                        <span className="xy-floating-count">
                          <WordCountText value={countTextWords(outlineCardContent)} />
                        </span>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {rightResizeHandle}
        <aside className="min-w-0 flex min-h-0 flex-col border-l border-gray-100 bg-gray-50 px-4 pb-4 pt-2">
          <div className="shrink-0 space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-2 text-sm text-gray-500">
              <CombinedAiConfigSelect
                style={getEmbeddedConfigSelectStyle(getFieldSizeStyle(outlineModelFieldSizeKey))}
                modelValue={activeTabConfig.modelId ?? ''}
                promptValue={activeOutlinePromptId ?? ''}
                modelOptions={models.length === 0 ? [{ value: '', label: '暂无可用模型', disabled: true }] : models.map((model) => ({ value: model.id, label: model.name }))}
                promptOptions={outlinePromptOptions.length === 0 ? [{ value: '', label: `暂无${outlinePromptCategory}提示词`, disabled: true }] : outlinePromptOptions.map((prompt) => ({ value: prompt.id, label: prompt.name }))}
                onModelChange={(value) => updateActiveTabConfig({ modelId: value })}
                onPromptChange={updateOutlinePromptId}
                onModelManage={() => setManagementModal({ type: 'models' })}
                onPromptManage={() => setManagementModal({ type: 'prompts', category: outlinePromptCategory })}
              />
            </div>
          </div>
          <div className="relative mt-5 min-h-[170px] flex-1">
            {outlinePreviewDraft.startsWith('[[THINKING') ? (
              <div className="xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-with-bottom-count h-full xy-has-value">
                <div
                  className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-gray-600"
                  onMouseDown={() => {
                    if (isDetailOutlineTab) setActiveLibraryFontTarget('detailOutline');
                  }}
                  style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
                >
                  {renderAiChatContent(outlinePreviewDraft, { hideReasoningBody: plotPointStandalone })}
                </div>
                <label>{outlineDraftFrameTitle}</label>
                {shouldShowOutlineDraftWordCount && (
                  <span className="xy-floating-count xy-floating-count-top-left" style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}><WordCountText value={countTextWords(outlinePreviewDraftContent)} /></span>
                )}
                {renderDetailOutlineDraftClearButton()}
              </div>
            ) : (
              <div className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-outline-ai-output-frame xy-floating-fill xy-floating-with-bottom-count h-full ${outlinePreviewDraft.trim() ? 'xy-has-value' : ''}`}>
                <textarea
                  data-no-modal-drag="true"
                  value={outlinePreviewDraft}
                  onFocus={() => setActiveLibraryFontTarget(isDetailOutlineTab ? 'detailOutline' : 'settingPreview')}
                  onChange={(event) => setOutlinePreviewDraft(event.target.value)}
                  placeholder={plotPointStandalone ? '生成后的剧情点会显示在这里，也可以手动编辑后复制。' : isDetailOutlineTab ? '生成后的章纲会显示在这里，也可以手动编辑后替换所选章纲。' : '生成后的梗概会显示在这里，也可以手动编辑后保存。'}
                  className="editor-scrollbar text-sm leading-6 text-gray-700 outline-none placeholder:text-slate-500 placeholder:font-semibold"
                  style={isDetailOutlineTab ? { fontSize: detailOutlineFontSize } : undefined}
                />
                <label>{outlineDraftFrameTitle}</label>
                {shouldShowOutlineDraftWordCount && (
                  <span className="xy-floating-count xy-floating-count-top-left" style={{ '--xy-floating-count-left': outlineDraftCountLeft } as CSSProperties}><WordCountText value={countTextWords(outlinePreviewDraftContent)} /></span>
                )}
                {renderDetailOutlineDraftClearButton()}
              </div>
            )}
          </div>
            {isDetailOutlineTab && (
              <LinkedSourceControl
                linked={selectedDetailOutlineReaderItems.length > 0}
                label="关联大纲"
                linkedLabel="已关联大纲"
                onOpen={openDetailOutlineReader}
                onClear={clearDetailOutlineReaderSelection}
                clearOnLinkedClick
                meta={<>关联 <WordCountText value={detailOutlineReaderWordCount} compact /></>}
                className="mt-3 flex items-center gap-2"
                groupClassName="flex h-10 w-[132px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                buttonClassName="h-10 w-[132px] whitespace-nowrap rounded-xl border border-[#08AACE] bg-white px-3 text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                linkedButtonClassName="min-w-0 flex-1 whitespace-nowrap px-3 text-sm font-black text-white bg-red-500 hover:bg-red-600"
              />
            )}
            <div className="mt-3">
              <AiInlineInput
                value={outlineAiInput}
                onChange={(event) => {
                  setOutlineAiInput(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void sendOutlineAiMessage();
                  }
                }}
                onSend={() => void sendOutlineAiMessage()}
                onStop={stopOutlineAiMessage}
                sendDisabled={isLibraryAiLoading || (!plotPointStandalone && !outlineAiInput.trim() && (!isDetailOutlineTab || selectedDetailOutlineReaderItems.length === 0))}
                stopDisabled={!isLibraryAiLoading}
                label={plotPointStandalone ? '请输入剧情点要求' : '请输入要求'}
                textareaClassName="editor-scrollbar"
              />
            </div>
            <div className="mt-3 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => {
                  if (plotPointStandalone) setOutlineAiInput(stripAiThinkingBlock(outlinePreviewDraft));
                  else saveOutlinePreviewDraft();
                }}
                disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
                className="min-w-[92px] flex-1 whitespace-nowrap bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-gray-300"
              >
                {plotPointStandalone ? '放入章纲要求' : isDetailOutlineTab ? '替换章纲' : '保存梗概'}
              </button>
              {isDetailOutlineTab && !plotPointStandalone && (
                <button
                  onClick={undoDetailOutlineReplacement}
                  disabled={!lastDetailOutlineReplacement}
                  className="min-w-[92px] flex-1 whitespace-nowrap border-l border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:text-gray-300"
                >
                  撤销替换
                </button>
              )}
              <button
                onClick={() => void navigator.clipboard.writeText(stripAiThinkingBlock(outlinePreviewDraft))}
                disabled={!stripAiThinkingBlock(outlinePreviewDraft).trim()}
                className="min-w-[92px] flex-1 whitespace-nowrap border-l border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
              >
                {isDetailOutlineTab ? '复制章纲' : '复制梗概'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  }
  return (
      <div className="flex min-h-0 flex-1 flex-col bg-white" style={scaleStyle}>
      {renderTopTabs()}
      {fieldSizeSettingsModal}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] overflow-hidden bg-white">
        <aside className="flex min-h-0 flex-col border-r border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-bold text-gray-700">{activeTab}</span>
            <button onClick={addEntry} className="rounded-md p-1 text-brand hover:bg-brand-light" title="新增">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {visibleEntries.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs leading-5 text-gray-400">{emptyText}</p>
            ) : (
              <div className="space-y-1">
                {visibleEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`group w-full rounded-lg border px-2 py-2 text-left font-black transition-colors ${
                      selectedEntry?.id === entry.id ? 'border-transparent xy-selected-mint-bg' : 'border-gray-100 bg-gray-50 hover:border-brand/40'
                    }`}
                  >
                    <div className="truncate text-xs font-black text-gray-800">{entry.title}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{entry.updatedAt}</span>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col p-4">
          {selectedEntry ? (
            <>
              <input
                value={selectedEntry.title}
                onChange={(event) => updateEntry(selectedEntry.id, { title: event.target.value })}
                className="mb-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-brand"
              />
              <textarea
                value={selectedEntry.content}
                onChange={(event) => updateEntry(selectedEntry.id, { content: event.target.value })}
                placeholder={`填写${activeTab}内容...`}
                className="editor-scrollbar flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-brand"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              点击左侧加号新增内容
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
