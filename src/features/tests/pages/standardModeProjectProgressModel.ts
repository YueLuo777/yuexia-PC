export type ProjectProgressStatus = 'complete' | 'partial' | 'missing';
export type ProjectDecision = 'undecided' | 'keep' | 'revise' | 'do' | 'later' | 'skip';

export type ProjectProgressItem = {
  id: string;
  title: string;
  status: ProjectProgressStatus;
  rating: 1 | 2 | 3 | 4 | 5;
  current: string;
  recommendation: string;
};

export type ProjectProgressGroup = {
  id: string;
  title: string;
  description: string;
  items: ProjectProgressItem[];
};

export const PROJECT_PROGRESS_GROUPS: ProjectProgressGroup[] = [
  {
    id: 'foundation',
    title: '作品与工作台',
    description: '从新建作品到进入对应书籍工作台的基础链路。',
    items: [
      { id: 'work-profile', title: '作品资料与男女频题材', status: 'complete', rating: 5, current: '支持作品名称、频道、题材、篇幅、简介、封面和保存重载。', recommendation: '这是所有自动推荐和AI生成的基础资料，必须保留。' },
      { id: 'workbench-guide', title: '四阶段工作台与创作向导', status: 'complete', rating: 5, current: '准备、设定、创作、检查四阶段均有正式入口，作品详情提供五步向导。', recommendation: '新手能否看懂流程主要依赖这里，建议继续作为标准模式主入口。' },
      { id: 'per-book-storage', title: '每本书独立保存工作台数据', status: 'complete', rating: 5, current: '脑洞关联、模板、设定、章纲和正文均按当前作品隔离。', recommendation: '避免不同小说串数据，属于不可取消的底层能力。' },
      { id: 'chapter-progress-state', title: '章节级流程状态看板', status: 'partial', rating: 5, current: '已有总字数、章纲、正文和审核数量，但没有逐章展示当前卡在哪一步。', recommendation: '建议显示“章纲待确认、正文待审核、状态待更新、已完成”等状态。' },
    ],
  },
  {
    id: 'brainstorm',
    title: '准备阶段',
    description: '生成、整理并选择后续设定所依据的脑洞。',
    items: [
      { id: 'brainstorm-generation', title: '生成脑洞', status: 'complete', rating: 5, current: '支持填写题材、流派、篇幅、金手指和其他要求后流式生成。', recommendation: '作为傻瓜式创作的第一步，应保留并继续简化输入。' },
      { id: 'brainstorm-library', title: '脑洞库分类、回收站与排序', status: 'complete', rating: 4, current: '支持未分类、新建分类、脑洞顺序、删除和回收站。', recommendation: '脑洞数量多时很有价值，推荐保留。' },
      { id: 'brainstorm-edit-compare', title: 'AI修改脑洞与版本对比', status: 'partial', rating: 3, current: '可以提出修改要求并生成内容，但修改前后对比和版本取舍还不完整。', recommendation: '不是首发核心，可在章纲正文闭环完成后补充。' },
      { id: 'brainstorm-to-settings', title: '根据脑洞进入设定流程', status: 'complete', rating: 5, current: '可以从选中脑洞跳转设定页并保留关联内容和字数。', recommendation: '连接准备阶段和设定阶段，必须保留。' },
    ],
  },
  {
    id: 'settings',
    title: '设定阶段',
    description: '选择模板、分步生成并检查作品设定。',
    items: [
      { id: 'template-recommendation', title: '根据作品资料推荐设定模板', status: 'complete', rating: 5, current: '读取作品频道、题材和预计篇幅，展示推荐依据并选择对应模板。', recommendation: '可以让普通用户理解推荐原因，建议作为固定流程。' },
      { id: 'template-edit-save', title: '修改模板并保存到我的模板', status: 'complete', rating: 4, current: '支持修改设定分类、设定名和子设定，并保存复用。', recommendation: '对有经验的作者有价值，但不应干扰默认模板的一键使用。' },
      { id: 'setting-step-generation', title: '五步生成作品设定', status: 'complete', rating: 5, current: '基础设定、剧情规划、主要人物、地点势力和创作补充可逐步生成。', recommendation: '分步生成便于作者修改和控制，是设定流程核心。' },
      { id: 'setting-generation-recovery', title: '设定生成暂停与中断恢复', status: 'complete', rating: 5, current: '生成状态会保存，关闭软件后运行中任务会恢复为暂停并可继续。', recommendation: 'AI长任务必须具备，建议其他生成流程也采用同一机制。' },
      { id: 'setting-empty-check', title: '检查空设定并跳转', status: 'complete', rating: 5, current: '可以列出未填写字段并直接跳到对应设定。', recommendation: '能显著降低漏设定，建议保留。' },
      { id: 'setting-conflict-check', title: '设定冲突与重复检测', status: 'missing', rating: 4, current: '当前主要检查空字段，还不能发现境界、人物关系、世界规则互相冲突。', recommendation: '设定量达到一万字后很有必要，建议在单章闭环完成后实现。' },
    ],
  },
  {
    id: 'outline',
    title: '章纲流程',
    description: '把设定和前文转化为可确认的章节计划。',
    items: [
      { id: 'outline-formal-page', title: '标准模式章纲页面', status: 'complete', rating: 5, current: '标准模式已复用专业模式章纲目录、编辑区和生成逻辑。', recommendation: '业务逻辑应继续共用，只简化标准模式操作。' },
      { id: 'outline-smart-association', title: '生成章纲前智能关联', status: 'missing', rating: 5, current: '现有手动关联可用，但还不能先看设定名再自动筛选必要设定和前文。', recommendation: '设定超过一万字后可大幅节省Token，是下一阶段最优先功能。' },
      { id: 'outline-version-confirm', title: '多版本章纲生成与正式确认', status: 'partial', rating: 4, current: '已有章纲生成和保存基础，但标准模式缺少清晰的版本切换、选定和正式确认步骤。', recommendation: '能避免AI第一版不合适直接进入正文，推荐补齐。' },
      { id: 'continuous-outline', title: '连续生成多章且保持连贯', status: 'missing', rating: 4, current: '还没有面向新手的连续章节批量生成、暂停点和跨章一致性控制。', recommendation: '适合批量创作，但应在单章链路稳定后再做。' },
    ],
  },
  {
    id: 'writing',
    title: '正文流程',
    description: '依据正式章纲生成、修改并保存章节正文。',
    items: [
      { id: 'writing-editor', title: '标准模式正文编辑器', status: 'complete', rating: 5, current: '标准模式复用专业模式正文目录、编辑器、字号和AI操作逻辑。', recommendation: '保持共用编辑器可以避免两个模式的数据和行为分叉。' },
      { id: 'writing-auto-context', title: '章纲到正文的自动上下文', status: 'partial', rating: 5, current: '已有手动关联和专业模式上下文能力，尚未形成标准模式一键自动关联。', recommendation: '应自动关联正式章纲、前章梗概、人物状态和必要设定。' },
      { id: 'writing-version-history', title: '正文生成版本与恢复旧稿', status: 'missing', rating: 4, current: '正文可以编辑保存，但缺少明确的AI生成版本历史和一键恢复。', recommendation: '可以防止重写覆盖满意内容，推荐实现。' },
      { id: 'writing-generation-recovery', title: '正文生成中断后继续', status: 'missing', rating: 5, current: '设定生成已有恢复机制，正文长任务还没有同等完整的恢复链路。', recommendation: '正文生成耗时更长，应复用设定生成的任务快照机制。' },
    ],
  },
  {
    id: 'review',
    title: '检查阶段',
    description: '审核正文、确认状态变化并为下一章准备上下文。',
    items: [
      { id: 'story-audit', title: '剧情与文本审核页面', status: 'complete', rating: 5, current: '已有章纲、原文、审核结果和操作台，标准模式可直接进入。', recommendation: '审核是AI正文进入正式稿之前的必要关卡。' },
      { id: 'audit-repair-loop', title: '审核问题、修改与再次确认闭环', status: 'partial', rating: 5, current: '可以得到审核结果，但逐条采纳、修改前后对比和复审通过流程仍需统一。', recommendation: '只有形成修复闭环，审核结果才真正有用。' },
      { id: 'status-update-loop', title: '状态变化确认并写回设定', status: 'partial', rating: 5, current: '已有状态检测和更新页面，标准模式还需要更明确的差异确认及完成标记。', recommendation: '人物、道具和伏笔状态必须在下一章前更新。' },
      { id: 'summary-loop', title: '生成梗概并保存到章节', status: 'partial', rating: 5, current: '已有梗概页面和生成逻辑，但还未与审核、状态更新自动串联。', recommendation: '梗概是后续智能关联的低成本上下文，强烈推荐。' },
      { id: 'next-chapter-loop', title: '完成本章后自动进入下一章', status: 'missing', rating: 5, current: '现在需要用户自行切换页面，尚未形成章纲、正文、审核、状态、梗概的循环。', recommendation: '这是标准模式真正傻瓜化的关键终点。' },
    ],
  },
  {
    id: 'enhancement',
    title: '稳定性与增强功能',
    description: '核心单章闭环之外的质量、成本和长期维护能力。',
    items: [
      { id: 'whole-book-check', title: '全书设定与剧情一致性检查', status: 'missing', rating: 4, current: '还没有跨卷扫描人物、时间线、境界和伏笔冲突的统一入口。', recommendation: '长篇创作后期价值很高，建议在单章流程完成后加入。' },
      { id: 'polish-comment-standard', title: '标准模式文笔润色与综合点评', status: 'partial', rating: 3, current: '专业模式已有相关功能，标准模式导航暂未开放。', recommendation: '属于增强项，可以根据目标用户反馈决定是否开放。' },
      { id: 'ai-cost-retry', title: 'Token预估、失败重试与降级模型', status: 'partial', rating: 4, current: '已有模型调用和错误处理基础，但标准模式缺少统一的成本预估和自动恢复策略。', recommendation: '正式发售前建议补齐，避免用户认为软件卡死或重复扣费。' },
      { id: 'backup-export', title: '作品备份、恢复与导出', status: 'partial', rating: 4, current: '项目已有部分导入导出能力，但标准模式缺少面向整本作品的一站式备份恢复流程。', recommendation: '正式发售前应提供用户可见的数据安全出口。' },
      { id: 'publishing-workflow', title: '发布平台格式与发布流程', status: 'missing', rating: 2, current: '当前重点是创作，尚未形成针对不同小说平台的发布工作流。', recommendation: '可以后置，先确保创作和数据安全链路稳定。' },
    ],
  },
];

export const PROJECT_PROGRESS_STATUS_LABELS: Record<ProjectProgressStatus, string> = {
  complete: '已完成',
  partial: '部分完成',
  missing: '未完成',
};

export const PROJECT_RECOMMENDATION_LABELS = {
  1: '暂不推荐',
  2: '低优先级',
  3: '建议',
  4: '推荐',
  5: '强烈推荐',
} as const;

export function getDefaultProjectDecision(item: ProjectProgressItem): ProjectDecision {
  return item.status === 'complete' ? 'keep' : 'undecided';
}
