import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart56: ErrorLogEntry[] = [
  {
    id: 'association-selection-hover-checkmark-001',
    title: '关联候选项未点击时悬停会提前显示勾',
    area: '作品工作台 / 关联脑洞、关联设定与章纲关联弹窗',
    symptom: '鼠标移到尚未勾选的候选项方框上时会出现勾，容易让用户误以为该条目已经被选择。',
    cause: '未勾选方框仍然渲染了勾，只靠透明文字隐藏；悬停样式又把文字颜色改成蓝色，导致隐藏的勾被显示出来。',
    solution: '未勾选时不再渲染勾，悬停只加深方框边线；只有实际点击并进入已勾选状态后才显示白色勾。',
    prevention: '二态选择控件不得依赖透明文字隐藏状态图标；回归测试必须分别检查未勾选 DOM 为空和已勾选后才出现图标。',
    keywords: ['关联脑洞', '候选书单', '悬停', '勾选框', '预览与选择'],
    updatedAt: '2026-07-24',
  },
];
