import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart46: ErrorLogEntry[] = [
  {
    id: 'review-paragraph-spacing-zero-gap-001',
    title: '剧情审核段落之间仍有明显空白',
    area: '作品工作台 / 剧情审核 / 原文与AI结果预览',
    symptom: '剧情审核的选中段落底部与下一段文字之间存在明显空白，长章节显示不够紧凑。',
    cause: '只清除了段落行之间的外间距，但每个段落框仍保留12px上下内边距，相邻两段的内边距叠加后看起来仍像空行。',
    solution: '采用测试板块A方案：正式原文、AI标注结果和文笔润色预览统一取消段落外间距与上下内边距，只保留正文行高；验证后删除临时测试页面。',
    prevention: '回归测试同时约束正式段落列表外间距和段落框上下内边距，不能只用space-y为0判断视觉上没有空行。',
    keywords: ['剧情审核', '段落间距', '无空行', '内边距', '测试板块'],
    updatedAt: '2026-07-23',
  },
];
