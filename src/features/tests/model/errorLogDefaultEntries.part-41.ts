import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart41: ErrorLogEntry[] = [
  {
    id: 'setting-editor-top-spacing-test-18-final-23px-001',
    title: '18号测试最终以23px迁入正式设定页面',
    area: '作品工作台 / 设定页面 / 设定编辑区顶部留白',
    symptom: '设定名、所属分组和下方设定框距离切换设定行的下边界仍然偏远，25px测试方案确认后又需要再向上2px。',
    cause: '正式设定页共享顶部偏移仍保留为30px，临时18号测试只展示25px对照，没有迁入正式编辑器。',
    solution: '将共享的设定编辑区顶部留白改为23px，作品设定空状态、已选中设定和人物设定同步生效；设定名与下方框之间的内部间距保持不变，并删除18号临时测试。',
    prevention: '回归测试锁定共享偏移必须精确为23px，且三个正式编辑状态必须继续复用同一个偏移类；测试集合清理门禁防止18号入口回流。',
    keywords: ['18号测试', '设定页面', '顶部留白', '23px', '正式迁移'],
    updatedAt: '2026-07-23',
  },
];
