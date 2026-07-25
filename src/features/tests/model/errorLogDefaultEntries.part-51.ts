import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart51: ErrorLogEntry[] = [
  {
    id: 'setting-linked-ai-payload-word-count-001',
    title: '设定关联字数没有按实际发送给 AI 的内容统计',
    area: '作品工作台 / 设定 / AI 关联内容',
    symptom: '右侧显示的“关联 X 字”和输出日志里的关联字数取自内部设定快照，无法准确代表最终发送给 AI 的关联内容。',
    cause: '关联字数在格式化请求之前统计原始快照，但真正提交时还会增加关联标题和结构标记，展示口径与发送口径不是同一份文本。',
    solution: '右侧关联字数和输出日志统一改为统计格式化后的最终关联文本，也就是实际拼进 AI 请求的关联内容。',
    prevention: '关联字数必须从最终请求片段计算，界面、日志和模型请求不得分别使用原始快照或重复拼装的文本。',
    keywords: ['设定关联', '关联字数', 'AI 请求', '输出日志', '最终发送内容'],
    updatedAt: '2026-07-24',
  },
];
