import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart43: ErrorLogEntry[] = [
  {
    id: 'setting-role-editor-coordinate-alignment-001',
    title: '作品设定与人物设定编辑框坐标统一',
    area: '作品工作台 / 设定 / 作品设定与人物设定编辑区',
    symptom: '从作品设定切换到人物设定男主角时，设定名、所属分组和正文框会发生横向跳动。',
    cause: '作品设定与人物设定分别使用不同的标题内边距、控件间隔、正文内边距和网格间隔，缩放后首列相差4.4px，第二个顶部控件累计相差8.8px。',
    solution: '提取两类编辑器共同使用的位置骨架，以男主角为基准统一标题起点、12px控件间隔、正文起点、12px网格间隔和纵向堆叠间隔；作品设定空状态也复用同一骨架。',
    prevention: '回归测试要求作品设定和人物设定同时引用同一组编辑器布局常量，禁止重新写入不同的px-2、gap-4或pt-2位置类。',
    keywords: ['作品设定', '人物设定', '坐标', '对齐', '框位置'],
    updatedAt: '2026-07-23',
  },
];
