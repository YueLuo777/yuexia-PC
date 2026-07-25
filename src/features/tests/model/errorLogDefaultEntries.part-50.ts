import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart50: ErrorLogEntry[] = [
  {
    id: 'prompt-editor-top-alignment-leading-blank-lines-001',
    title: '创建提示词弹窗左右字段未对齐且正文顶部出现空行',
    area: '提示词管理 / 创建与编辑提示词弹窗',
    symptom: '提示词名称框低于提示词内容框，提示词说明可用高度偏小，说明和内容正文上方还会显示一整行空白。',
    cause: '左侧字段列额外增加了顶部内边距，说明框没有稳定高度；嵌入边框的标题还被通用样式改回普通布局，占据约24px高度并把正文向下推，同时旧数据可能带有开头空白行。',
    solution: '移除左侧额外顶部偏移，使名称与内容顶边对齐；说明框固定为较大的稳定高度，明确让三个嵌入标题脱离普通布局，将说明和内容的顶部内边距统一为12px，并在打开、输入和保存时清理开头空白行。',
    prevention: '提示词弹窗布局回归必须同时测量名称与内容顶边、说明框高度、正文首行位置，并用带开头空白行的数据验证显示与保存结果。',
    keywords: ['创建提示词', '水平对齐', '提示词说明', '提示词内容', '顶部空行'],
    updatedAt: '2026-07-24',
  },
];
