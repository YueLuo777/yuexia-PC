import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart53: ErrorLogEntry[] = [
  {
    id: 'setting-body-navigation-selected-color-unified-001',
    title: '设定导航与正文导航的选中蓝色值不一致',
    area: '作品工作台 / 左侧导航 / 设定与正文',
    symptom: '设定条目和正文章节的选中态看起来接近，但边框和选中导线实际使用不同的蓝色值。',
    cause: '正文使用#078FAE，设定树迁移时另写了#2A9FB9，两个导航没有共享同一个选中颜色来源。',
    solution: '以正文为准，将正文的选中边框和选中导线提取为共享样式，设定条目蓝框、横向导线和选中路径全部复用#078FAE。',
    prevention: '同类导航选中态必须复用正文导航的共享颜色样式，不得在设定、人物或其他目录里重新填写近似色。',
    keywords: ['设定导航', '正文导航', '选中颜色', '#078FAE', '蓝色边框', '导线'],
    updatedAt: '2026-07-24',
  },
];
