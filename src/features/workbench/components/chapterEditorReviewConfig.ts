import { COMMENT_PROMPT_CATEGORY } from '@/features/prompts/hooks/usePrompts';
import type { ReviewMode } from '@/features/workbench/model/chapterReviewTaskState';

export type ChapterEditorEmbeddedMode = 'audit' | 'comment' | 'polish' | 'status';

export const POLISH_PROMPT_CATEGORY = '润色';
export const REVIEW_MODE_PROMPT_CATEGORIES: Record<ReviewMode, string> = {
  audit: '审核',
  comment: COMMENT_PROMPT_CATEGORY,
  polish: POLISH_PROMPT_CATEGORY,
};
export const AUDIT_STRUCTURE_PROMPT_FORMAT = `请按软件可识别的固定格式输出。每一项只能选择：通过 / 不通过。不要输出“部分通过”“基本通过”等第三种状态。

【剧情审核结果】

【审核项】章纲贴合度
【贴合度】0%-100%
【结果】通过 / 不通过
【说明】正文主要内容与章纲的关键事件、人物目标、因果走向和章节落点是否贴合。85%-100% 表示基本贴合；65%-84% 表示有偏差，建议复核；0%-64% 表示明显偏离。
【建议】

【审核项】主要事件是否完整
【结果】通过 / 不通过
【说明】本章核心事件是否完整呈现，读者能不能看明白这一章主要发生了什么。
【建议】

【审核项】人物行为是否合理
【结果】通过 / 不通过
【说明】人物行动是否有清楚原因，读者能不能理解角色为什么这样做。
【建议】

【审核项】前后逻辑是否清楚
【结果】通过 / 不通过
【说明】前一件事和后一件事之间是否接得上，角色行动、结果和转折是否有清楚原因。
【建议】

【审核项】剧情推进是否顺畅
【结果】通过 / 不通过
【说明】剧情推进是否顺畅。通过表示铺垫、冲突、转折和收束衔接自然；不通过表示突然跳转、关键过程缺失、推进过快或主线拖慢。
【建议】

【审核项】伏笔/设定是否矛盾
【结果】通过 / 不通过
【说明】本章伏笔、线索、能力、世界观、人物关系等设定是否前后一致。通过表示没有矛盾；不通过表示存在冲突或遗漏。
【建议】

【总体判断】
【剧情审核结论】通过 / 不通过
【最需要改的问题】
【优先修改建议】`;

export const REVIEW_MODE_DEFAULT_INSTRUCTIONS: Record<ReviewMode, string> = {
  audit:
    '请对文章内容进行剧情审核：检查章纲贴合度、剧情逻辑、人物行为、前后逻辑、剧情推进。输出需要列出问题位置、问题说明和修改建议。',
  comment:
    '请对文章内容进行点评：判断内容是否吸引人，重点点评开篇钩子、节奏、冲突、情绪张力和读者继续阅读欲望，并给出可执行的优化建议。',
  polish:
    '请对文章内容进行文笔润色：先检查错别字、语病、标点和重复表达，再优化语言表达、节奏、句子顺滑度、画面感和情绪力度，不改变剧情事件、人物行动、设定信息和章节结果。输出需要提供可替换的完整润色稿。',
};
