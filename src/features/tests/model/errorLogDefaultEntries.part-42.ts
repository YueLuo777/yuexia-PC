import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart42: ErrorLogEntry[] = [
  {
    id: 'chapter-navigation-test-17-formal-migration-001',
    title: '17号正文导航层级方案迁入正式页面',
    area: '作品工作台 / 正文 / 未发布与已发布导航',
    symptom: '正文卷和章节仍使用旧文件夹列表样式，章节选中后整行变色，与设定导航的层级和选中规则不一致。',
    cause: '17号测试只提供了卷分组、章节树线和蓝框选中预览，正式未发布与已发布侧栏没有完整复用这套结构。',
    solution: '未发布与已发布共同复用正文导航样式：卷使用浅青一级分组，章节使用带导线的白底条目，选中时只显示2px深蓝边框，并锁定选中边框与白底为100%不透明；保留新增、发布、撤回、排序和右键菜单行为，并删除17号临时测试。',
    prevention: '共享样式和回归测试同时约束两个正文侧栏，选中态必须重置父级透明度变量，禁止任一侧栏恢复整行底色选中、出现透明蓝框或脱离统一层级。',
    keywords: ['17号测试', '正文导航', '章节目录树', '蓝框选中', '正式迁移'],
    updatedAt: '2026-07-23',
  },
];
