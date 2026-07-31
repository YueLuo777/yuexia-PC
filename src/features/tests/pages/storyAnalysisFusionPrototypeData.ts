export type StyleProfile = {
  id: string;
  name: string;
  source: string;
  confidence: string;
  scores: Record<string, number>;
};

export const styleProfiles: StyleProfile[] = [
  {
    id: 'self-serial',
    name: '我的连载文风',
    source: '本人历史正文 · 24章',
    confidence: '高可信',
    scores: { 句长节奏: 82, 对话比例: 68, 动作密度: 76, 段落留白: 88 },
  },
  {
    id: 'licensed-reference',
    name: '已授权参考风格',
    source: '授权语料 · 20篇',
    confidence: '可用',
    scores: { 句长节奏: 74, 对话比例: 81, 动作密度: 69, 段落留白: 72 },
  },
];

export const styleAuditFindings = [
  {
    title: '句长节奏偏慢',
    level: '需处理',
    detail: '当前连续三句超过 35 字；目标规则是动作段以 12-24 字短句推进。',
  },
  {
    title: '解释先于动作',
    level: '建议',
    detail: '先写角色判断，再写动作结果。建议交换顺序，让信息通过动作暴露。',
  },
  {
    title: '作者指纹安全',
    level: '通过',
    detail: '只使用抽象规则，不调用作者姓名、原句、专有比喻或标志性表达。',
  },
] as const;

export const deconstructionStages = [
  ['1', '合法导入', '用户上传本人、自有版权或已获授权的 TXT / MD，不从付费平台抓取整本正文。'],
  ['2', '黄金三章', '先识别开局承诺、第一次反馈、章末钩子和读者期待，确认方向后再继续。'],
  ['3', '全书拆解', '按章节抽取爽点循环、情绪引擎、冲突升级、节奏和角色功能。'],
  ['4', '资产归一', '把具体人名和情节抽象成可迁移模块，并记录来源、证据和置信度。'],
  ['5', '类型迁移', '保留读者获得感，替换世界规则、人物关系、事件外壳和兑现方式。'],
] as const;

export const transferableAssets = [
  ['爽点公式', '压制误判 → 主角低调行动 → 结果反差 → 群体反馈'],
  ['情绪引擎', '受轻视、积压期待、证据落地、身份重新定价'],
  ['节奏模型', '每 2 章小反馈、每 8 章阶段爆点、卷末规则升级'],
  ['结构钩子', '读者先知道局部真相，角色后知后觉形成信息差'],
] as const;

export const targetGenres = [
  ['urban', '都市高武', '把资源捡漏迁移为能力评测与训练资源差'],
  ['suspense', '女频悬疑', '把身份反差迁移为线索认知差与关系误判'],
  ['history', '历史经营', '把升级反馈迁移为制度改造、产能和声望增长'],
] as const;

export const repositoryFindings = [
  {
    name: 'oh-story-claudecode',
    useful: '长篇拆书的分阶段管道、断点、黄金三章、爽点/情绪/节奏资产和质量门禁。',
    integrate: '借鉴数据结构与流程，在月下重新实现 TypeScript 服务；不引入其 Agent 运行时和示例语料。',
    license: 'MIT；复用源码、提示词或实质性文档时保留其版权声明和许可文本。',
  },
  {
    name: 'writing-dna-skill',
    useful: '把文风拆成语言、结构、选题/素材/认知和视觉层，并形成可反复读取的 Writing DNA。',
    integrate: '小说场景先采用语言、叙事结构和节奏三层；视觉层暂不进入正文审查。',
    license: 'MIT；复用其模板或实质性流程文本时保留该项目的许可文本。',
  },
] as const;

export const rightsGuards = [
  '不把第三方示例小说、付费章节或未经授权原文打包进软件',
  '导入前确认处理权；调用云模型前明确提示原文将发送给模型服务商',
  '产物只保留抽象规则和必要证据索引，不保留可替代原作的大段原文',
  '不以作者姓名作为生成按钮，不冒充作者，不承诺“一比一复刻”',
  '发布前进行原句、专名、关键桥段和章节顺序相似度检查',
] as const;
