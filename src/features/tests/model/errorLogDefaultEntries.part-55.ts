import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart55: ErrorLogEntry[] = [
  {
    id: 'setting-association-context-format-and-reader-heading-001',
    title: '关联设定格式重复、字数虚高且读取弹窗存在多余导航行',
    area: '作品工作台 / 设定关联与关联资料弹窗',
    symptom: '关联当前设定时名称重复，AI 无法区分待修改对象和参考资料，也看不到完整分类路径；界面直接显示原始标签并把标签字数计入关联字数，关联资料弹窗左栏还额外占用一行显示导航标题。',
    cause: '发送给 AI 的结构、用户日志展示和字数统计共用了同一段标签文本，关联项也没有统一的用途和路径数据；读取弹窗保留了与顶部分页重复的旧导航说明。',
    solution: '关联设定统一携带用途、完整分类路径和当前内容；发送给 AI 时使用结构化标签，界面日志改为普通文字，字数只统计设定正文，并删除左栏多余导航标题行。',
    prevention: '关联上下文新增或调整格式时，必须分别验证 AI 请求、用户可见日志、空内容关联和正文净字数；弹窗顶部已有明确分页时不得再增加重复导航标题。',
    keywords: ['关联设定', '分类路径', '本次处理对象', '参考资料', '关联字数', '设定导航'],
    updatedAt: '2026-07-24',
  },
];
