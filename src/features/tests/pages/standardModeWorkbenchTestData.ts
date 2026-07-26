export type StandardModeNovelId = 'ongoing' | 'new';

export type StandardModeBrainstormView = 'generate' | 'library' | 'link';

export interface StandardModeNovel {
  id: StandardModeNovelId;
  title: string;
  cover: string;
  category: string;
  chapters: number;
  words: string;
  progress: number;
  lastChapter: string;
  nextAction: string;
}

export type StandardModeWorkbenchTool =
  | 'brainstorm'
  | 'outline'
  | 'chapterOutline'
  | 'writing'
  | 'audit'
  | 'status'
  | 'summary'
  | 'polish'
  | 'review';

export interface StandardModeToolDefinition {
  id: StandardModeWorkbenchTool;
  label: string;
  group: '创作准备' | '章节创作' | '写后完善';
  description: string;
  actions: string[];
}

export const STANDARD_MODE_TOOLS: StandardModeToolDefinition[] = [
  {
    id: 'brainstorm',
    label: '脑洞',
    group: '创作准备',
    description: '生成新脑洞、浏览脑洞库，或者给当前小说关联已有脑洞。',
    actions: ['生成脑洞', '进入脑洞库', '关联脑洞'],
  },
  {
    id: 'outline',
    label: '大纲设定',
    group: '创作准备',
    description: '统一管理作品设定、人物、地点、势力和整体剧情。',
    actions: ['开始生成设定', '完善设定', '检查设定冲突'],
  },
  {
    id: 'chapterOutline',
    label: '章纲',
    group: '章节创作',
    description: '根据当前设定、上一章和本卷计划生成本章章纲。',
    actions: ['生成本章章纲', '完善章纲', '重新生成章纲'],
  },
  {
    id: 'writing',
    label: '正文',
    group: '章节创作',
    description: '直接进入与专业模式完全相同的正文页面。',
    actions: ['打开正文页面', '生成本章正文', '续写正文'],
  },
  {
    id: 'audit',
    label: '审核',
    group: '写后完善',
    description: '同时检查剧情逻辑、人设一致性、文本质量和阅读节奏。',
    actions: ['开始自动审核', '查看审核结果', '采用修改建议'],
  },
  {
    id: 'status',
    label: '状态更新',
    group: '写后完善',
    description: '从正文中找出人物、势力和道具的最新变化。',
    actions: ['分析状态变化', '确认全部更新'],
  },
  {
    id: 'summary',
    label: '章节梗概',
    group: '写后完善',
    description: '生成供下一章使用的章节梗概和关键事件。',
    actions: ['生成章节梗概', '保存并准备下一章'],
  },
  {
    id: 'polish',
    label: '风格润色',
    group: '写后完善',
    description: '选择内置行文风格，对指定章节生成可对比的润色稿。',
    actions: ['选择润色风格', '生成润色稿', '对比后替换'],
  },
  {
    id: 'review',
    label: '综合点评',
    group: '写后完善',
    description: '模拟不同读者和网文编辑阅读正文，汇总可执行的点评。',
    actions: ['选择点评人群', '开始综合点评', '查看改进清单'],
  },
];

export const STANDARD_MODE_TOOL_ORDER = STANDARD_MODE_TOOLS.map((tool) => tool.id);
