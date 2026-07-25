import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart44: ErrorLogEntry[] = [
  {
    id: 'workbench-left-navigation-width-unification-002',
    title: '工作台左侧导航宽度统一开关没有真正统一',
    area: '作品工作台 / 脑洞到综合点评 / 左侧目录与导航区域',
    symptom: '开启“导航宽度统一”后，脑洞、章纲、梗概等页面的左侧区域仍会显示成不同宽度，看起来开关没有效果。',
    cause: '公共宽度传到各页面后，又被脑洞的280px上限和章纲、梗概按屏幕计算的最小宽度二次修改，导致同一个值最终显示成多个宽度。',
    solution: '统一模式直接使用正文目录对应的公共宽度，并让所有左侧分割线共同使用200至360px范围；页面自己的宽度限制只在关闭统一时生效。',
    prevention: '回归测试同时检查脑洞、设定、人物、章纲、正文、审核、状态和梗概所读取的公共宽度，并禁止统一模式再次套用页面专属上限。',
    keywords: ['导航宽度统一', '左侧区域', '脑洞', '设定', '章纲', '正文', '剧情审核', '综合点评'],
    updatedAt: '2026-07-23',
  },
];
