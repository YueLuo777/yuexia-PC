import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart52: ErrorLogEntry[] = [
  {
    id: 'prompt-editor-caption-border-line-overlap-001',
    title: '创建提示词弹窗的名称标题被滚动区域裁切',
    area: '提示词管理 / 创建与编辑提示词弹窗',
    symptom: '提示词名称位于左侧第一个输入框时，上半部分被裁掉，看起来像文字和边框发生重叠。',
    cause: '左侧列启用了纵向滚动，滚动区域又恰好从输入框顶边开始；嵌入标题向上伸出的部分超出滚动区域后被裁切。',
    solution: '缩短外层顶部留白，并在左右两列内部同时补回等量标题空间，使名称与内容顶边坐标不变且标题完整落在滚动区域内；同时加固标题遮线层。',
    prevention: '滚动容器中的首个嵌入标题必须检查完整字形和顶边坐标，既不能裁切，也不能为了留空间破坏左右对齐。',
    keywords: ['创建提示词', '嵌入标题', '标题裁切', '滚动区域', '左右对齐'],
    updatedAt: '2026-07-24',
  },
];
