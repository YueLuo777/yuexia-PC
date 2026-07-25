import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart54: ErrorLogEntry[] = [
  {
    id: 'brainstorm-reader-header-splitter-layout-001',
    title: '关联脑洞弹窗顶部信息重复且候选区宽度不能调整',
    area: '作品工作台 / 关联脑洞弹窗',
    symptom: '弹窗顶部单独占用一整行显示脑洞标签和操作提示，预览来源、字数、时间又位于名称上方；候选书单与预览之间只有固定分隔线，不能按内容调整宽度。',
    cause: '弹窗沿用了早期固定两列和独立工具栏布局，没有让名称与元信息共用自适应标题行，也没有为分栏提供可操作的分割线。',
    solution: '删除重复工具栏，把来源、字数、时间移动到脑洞名称同一文字流中并按剩余宽度自动换行；将候选书单与预览之间改为支持拖拽和键盘调整的分割线，同时限制两侧最小宽度并记忆用户宽度。',
    prevention: '双栏读取弹窗新增信息时应优先复用标题行剩余空间；固定分隔线改为可调宽度时必须同时提供最小宽度、键盘操作、宽度记忆和长标题回归测试。',
    keywords: ['关联脑洞', '候选书单', '预览', '拖拽分割线', '长标题', '自适应布局'],
    updatedAt: '2026-07-24',
  },
];
