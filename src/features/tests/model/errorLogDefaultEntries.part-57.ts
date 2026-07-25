import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart57: ErrorLogEntry[] = [
  {
    id: 'brainstorm-reader-preview-spacing-meta-001',
    title: '关联脑洞预览正文顶部留白过多且标题元信息冗余',
    area: '作品工作台 / 关联脑洞弹窗',
    symptom: '脑洞正文框顶部像多出一行空白；标题后同时显示图钉、脑洞库、字数和时间，字数与时间偏小。',
    cause: '正文框四边统一使用 20px 内边距，短文本下顶部留白尤其明显；标题元信息仍保留早期来源图标和固定分类文字，并沿用 12px 小字号。',
    solution: '正文框顶部内边距单独缩小为 8px，其他方向和正文行距不变；删除图钉和脑洞库文字，只保留字数与时间并放大为 14px。',
    prevention: '预览框应分别控制顶部和其他方向内边距；标题元信息只保留对当前决策有用的内容，并用回归测试锁定图标、冗余来源文字和字号。',
    keywords: ['关联脑洞', '顶部留白', '脑洞库', '字数统计', '更新时间'],
    updatedAt: '2026-07-25',
  },
];
