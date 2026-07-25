import type { PromptWorkflowStep, PromptWorkspaceSection } from './PromptDrivenNovelWorkspaceTypes';

const field = (
  label: string,
  instruction: string,
  source: string,
  kind: PromptWorkspaceSection['fields'][number]['kind'],
) => ({ label, instruction, source, kind });

export const PROMPT_WORKSPACE_SECTIONS: PromptWorkspaceSection[] = [
  {
    id: 'core-work',
    title: '作品核心设定',
    summary: '决定AI写什么、怎么写，以及整本书不能偏离的方向。',
    sourceFiles: ['创意白皮书模板.md', '白皮书示例.md', 'SKILL.md'],
    fields: [
      field('故事类型', '明确题材、时代、类型组合和阅读方向。', '创意白皮书模板.md 1.1', 'core'),
      field('作品卖点', '说明这本书最吸引读者的核心看点和与同类作品的差异。', '创意白皮书模板.md 1.2', 'core'),
      field('一句话主线', '用一句话写清主角、目标、主要冲突和最终看点。', '创意白皮书模板.md 1.3', 'core'),
      field('目标读者', '说明主要读者是谁，以及他们期待看到什么。', '创意白皮书模板.md 1.4', 'core'),
      field('时代背景', '说明故事发生的时代、文明阶段和世界背景。', '创意白皮书模板.md 3.1', 'core'),
      field('力量体系', '说明修炼境界、力量来源和战力成长方式。', '创意白皮书模板.md 3.2', 'core'),
      field('主要势力和冲突格局', '说明主要国家、宗门、阵营之间的利益与冲突。', '创意白皮书模板.md 3.3', 'core'),
      field('核心设定红线', '集中记录身份秘密、金手指规则、世界限制和写作禁忌。', '创意白皮书模板.md 八', 'rule'),
    ],
  },
  {
    id: 'character-core',
    title: '人物与关系设定',
    summary: '让AI知道人物是谁、为什么行动、能做什么，以及关系如何变化。',
    sourceFiles: ['人物档案模板.md', '创意白皮书模板.md'],
    fields: [
      field('人物基本信息', '姓名、年龄、身份和初始状态。', '人物档案模板.md 基本信息', 'archive'),
      field('性格与行为方式', '稳定性格、关键弱点、做事方式和情绪底色。', '人物档案模板.md 人设核心/性格特征', 'archive'),
      field('能力与实力', '金手指、功法、战斗技能、其他技能和使用限制。', '人物档案模板.md 能力设定', 'archive'),
      field('外貌与语言习惯', '外貌、口头禅、标志动作和说话方式。', '人物档案模板.md 外貌描写/口头禅', 'archive'),
      field('人物关系与立场', '人物之间的关系、利益、态度和变化方向。', '人物档案模板.md 人物关系', 'archive'),
      field('人物成长与状态记录', '按章节记录目标、伤势、能力、关系和选择变化。', '人物档案模板.md 情感弧光/状态更新记录', 'record'),
    ],
  },
  {
    id: 'world-library',
    title: '世界资料库',
    summary: '把正文会反复用到的势力、地点、物品和伏笔拆成可更新档案。',
    sourceFiles: ['势力档案模板.md', '地点档案模板.md', '物品档案模板.md', '伏笔库模板.md'],
    fields: [
      field('势力档案', '记录组织结构、主要人物、势力关系、对主角策略和核心矛盾。', '势力档案模板.md', 'archive'),
      field('地点档案', '记录地点描述、位置、地标、历史事件和当前状态。', '地点档案模板.md', 'archive'),
      field('物品档案', '记录外观、效果、来历、归属变化、当前状态和相关伏笔。', '物品档案模板.md', 'archive'),
      field('伏笔库', '记录伏笔内容、埋设位置、关联对象、预计回收和实际回收结果。', '伏笔库模板.md', 'archive'),
      field('剧情摘要库', '记录全书主线、分段摘要、卷摘要、人物状态和伏笔追踪。', '摘要系统模板.md', 'record'),
      field('时间线发展记录', '记录故事时间、人物年龄基点、重大事件和势力变化。', 'SKILL.md 步骤4.4', 'record'),
    ],
  },
  {
    id: 'writing-rules',
    title: '写作与审核规则',
    summary: '控制正文的长度、节奏、表达方式和发布前的质量检查。',
    sourceFiles: ['写作风格指南模板.md', '全局创作规范.md', '升级补丁_自动审核系统v2.0.md'],
    fields: [
      field('写作风格', '整体基调、叙述视角、对话风格、参考作品和专属写法。', '写作风格指南模板.md', 'rule'),
      field('章节字数与结构', '章节字数、对话比例、节奏安排和章末钩子。', '写作风格指南模板.md 节奏控制', 'rule'),
      field('爽点与节奏', '爽点频率、核心公式、阶段推进和读者反馈。', '创意白皮书模板.md 七', 'rule'),
      field('禁止事项', '禁止的AI式表达、剧情毒点、战力错误和人设崩坏。', '全局创作规范.md / 升级补丁', 'rule'),
      field('审核规则', '根据故事类型加载通用规则、类型规则和项目专属检查项。', 'SKILL.md 步骤4.5', 'rule'),
    ],
  },
  {
    id: 'outline-planning',
    title: '剧情规划资料',
    summary: '先规划整本书和分卷，再把接下来要写的章节拆成可执行细纲。',
    sourceFiles: ['整书大纲模板.md', '一键生成细纲.md'],
    fields: [
      field('整书大纲', '总体规划、分卷目标、卷末高潮、主要人物和全书主题。', '整书大纲模板.md', 'core'),
      field('分卷计划', '每卷的核心事件、主要剧情、卷末高潮和登场人物。', '创意白皮书模板.md 六', 'core'),
      field('五章细纲', '每章概括、事件点、爽点、伏笔、章末钩子、字数和衔接。', '一键生成细纲.md 步骤3', 'core'),
      field('进度锚定表', '根据全书和本卷进度，检查当前五章应该推进到哪里。', '一键生成细纲.md 步骤2.5', 'rule'),
      field('细纲逻辑审核结果', '检查人物、力量、时间线、伏笔和爽点是否冲突并修复。', '一键生成细纲.md 步骤4.5', 'record'),
    ],
  },
];

export const PROMPT_NOVEL_WORKFLOW: PromptWorkflowStep[] = [
  {
    id: 'read-whitepaper', number: '01', title: '读取白皮书', summary: '先把题材、主角、世界观、卖点和红线提取出来。',
    sourceFiles: ['SKILL.md 步骤1', '创意白皮书模板.md'],
    reads: ['书名、故事类型、作品卖点', '主角姓名、人设、金手指和目标', '世界观、主要势力、核心矛盾和红线'],
    outputs: ['作品核心设定清单', '缺失信息和待补充项', '后续审核规则所需的题材标签'],
    completion: '核心必填项已经提取，缺失项已标记，AI不会把空白当成既定事实。', next: '初始化项目', kind: 'setup',
  },
  {
    id: 'initialize-project', number: '02', title: '初始化项目', summary: '建立设定库、正文库、摘要库和工作流文件。',
    sourceFiles: ['SKILL.md 步骤2-4'],
    reads: ['白皮书提取结果', '项目目录位置', '故事类型对应的审核规则'],
    outputs: ['00核心设定、人物、势力、地图、物品、伏笔、摘要目录', '写作风格、整书大纲、时间线和审核规则', 'AI续写、细纲、发布等工作流'],
    completion: '目录和核心文件建立完成，工作流能找到统一的设定入口。', next: '完善设定档案', kind: 'setup',
  },
  {
    id: 'build-setting-library', number: '03', title: '完善设定档案', summary: '把白皮书中的人物、势力、地点和伏笔变成独立资料。',
    sourceFiles: ['SKILL.md 步骤5', '人物/势力/地点/物品/伏笔模板'],
    reads: ['核心设定和整书大纲', '白皮书中的人物、势力、地点和物品', '已有章节中的状态变化'],
    outputs: ['人物、势力、地点、物品和伏笔档案', '全书剧情主线和初始摘要', '可按章节更新的状态记录'],
    completion: '正文中会反复出现的对象都有唯一档案，不再只埋在一篇白皮书里。', next: '规划整书与分卷', kind: 'setup',
  },
  {
    id: 'plan-outline', number: '04', title: '规划整书与分卷', summary: '先确定全书方向，再锁定当前卷和接下来五章。',
    sourceFiles: ['整书大纲模板.md', '一键生成细纲.md'],
    reads: ['核心设定红线', '整书大纲、分卷计划和当前摘要', '当前卷进度和节奏要求'],
    outputs: ['整书大纲和分卷目标', '进度锚定表', '五章细纲和细纲审核结果'],
    completion: '五章细纲通过逻辑、节奏、伏笔和红线检查，才进入正文生成。', next: '生成章节正文', kind: 'creation',
  },
  {
    id: 'write-chapter', number: '05', title: '生成章节正文', summary: '按细纲分段生成正文，完成字数、风格和人设自检。',
    sourceFiles: ['一键AI续写章节_v4.0.md', '写作风格指南模板.md'],
    reads: ['核心设定、人物和世界资料', '对应章节细纲', '前文正文、摘要和审核规则'],
    outputs: ['分段生成并合并的章节正文', '字数验证结果', '去AI化自检和正文质量检查结果'],
    completion: '正文达到字数、结构、风格和红线要求，才允许进入审核或发布。', next: '审核与修改', kind: 'creation',
  },
  {
    id: 'review-and-revise', number: '06', title: '审核与修改', summary: '先找出毒点和规则冲突，再生成修改副本，不直接覆盖原文。',
    sourceFiles: ['一键毒点检测修改.md', '升级补丁_自动审核系统v2.0.md', '多模型防漏修复补丁v3.0.md'],
    reads: ['章节原文', '审核规则和核心设定红线', '人物状态、力量体系和剧情摘要'],
    outputs: ['问题清单和修改方案', '修改后的章节副本', '审核结果和保留原文的对照依据'],
    completion: '修改结果经过复审，原文和修改版都保留，用户可以确认采用哪一版。', next: '发布章节并更新资料', kind: 'review',
  },
  {
    id: 'publish-and-update', number: '07', title: '发布章节并更新资料', summary: '发布不是结束，要把正文造成的变化写回各个设定和摘要。',
    sourceFiles: ['一键章节发布.md', '摘要系统模板.md'],
    reads: ['通过审核的章节正文', '人物、势力、地点、物品和伏笔档案', '上一次摘要、时间线和更新记录'],
    outputs: ['发布后的正文文件和报告', '人物/势力/物品状态变化', '章节摘要、卷摘要、全书主线和伏笔进度'],
    completion: '正文、设定状态、摘要、时间线和更新记录彼此一致。', next: '进入下一章', kind: 'maintenance',
  },
  {
    id: 'continue-next', number: '08', title: '进入下一章', summary: '以最新状态和摘要为输入，回到细纲与续写循环。',
    sourceFiles: ['一键初始化摘要系统.md', '一键章节发布.md', 'SKILL.md 初始化报告'],
    reads: ['最新章节摘要和全书主线', '最新人物、势力、伏笔和时间线状态', '下一章细纲或待生成范围'],
    outputs: ['下一章的生成上下文', '需要补充或修正的设定提醒', '可继续执行的细纲和续写任务'],
    completion: '下一章不会重新猜测前文，而是从已确认的状态继续。', next: '规划整书与分卷', kind: 'maintenance',
  },
];

export const PROMPT_AUXILIARY_WORKFLOWS = [
  { title: '导入已有小说', detail: '扫描正文，分批提取人物、势力、地点、物品、伏笔和章节细纲，并保存断点。', source: '一键导入已有小说.md' },
  { title: '初始化摘要系统', detail: '创建全书主线、分段摘要、卷摘要和状态追踪文件。', source: '一键初始化摘要系统.md' },
  { title: '去AI化润色', detail: '检测词汇、结构和对话痕迹，保存处理副本并生成修改报告。', source: '一键去AI化.md' },
  { title: '字数统计', detail: '扫描章节并生成总览、分卷统计、字数分布和需关注章节。', source: '一键字数统计.md' },
];
