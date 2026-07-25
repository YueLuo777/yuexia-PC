import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart47: ErrorLogEntry[] = [
  {
    id: 'chapter-editor-debounced-save-status-001',
    title: '正文连续输入时重复读取历史并同步保存整部作品',
    area: '作品工作台 / 正文编辑 / 自动保存',
    symptom: '正文内容增多后，连续输入可能出现延迟；底部始终只显示已保存，存储空间不足时也看不到失败提示。',
    cause: '每次按键都会读取并解析全部历史快照、同步写入正文，并遍历卷章重新统计整部作品字数。保存异常没有反馈给页面。',
    solution:
      '历史快照增加章节级五分钟缓存；正文、章节字数和作品字数改为350毫秒合并保存；底部增加正在保存、已保存和保存失败状态，失败内容保留在队列中并可点击重试。切换章节或作品前先强制保存。',
    prevention:
      '回归测试固定检查连续输入只落盘最新内容、五分钟内不重复读取历史、手动保存立即刷新，以及存储失败后内容仍可重试。',
    keywords: ['正文输入', '自动保存', '防抖', '历史快照', '保存失败', '重试'],
    updatedAt: '2026-07-23',
  },
];
