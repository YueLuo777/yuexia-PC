import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart45: ErrorLogEntry[] = [
  {
    id: 'chapter-tree-connector-overlap-001',
    title: '正文目录导线穿入章节选中框且末端凸出',
    area: '作品工作台 / 正文 / 未发布与已发布章节目录',
    symptom: '章节树的横向导线压在蓝色选中框上，最后一章下方还会多出一小段竖线。',
    cause: '目录容器和每个章节行重复绘制竖线，两个收尾位置相差4px；横线又按章节内容区定位，向右覆盖了2px边框。',
    solution: '章节树只保留容器的一条竖线并准确停在最后一章中心，横线改为从竖线连接到章节框外沿；设定树的同类横线也同步停止在边框外。',
    prevention: '回归测试同时约束未发布、已发布共用的导线样式，并检查设定树连接线不得覆盖选中边框。',
    keywords: ['正文目录', '章节树', '导线', '选中边框', '已发布', '未发布'],
    updatedAt: '2026-07-23',
  },
];
