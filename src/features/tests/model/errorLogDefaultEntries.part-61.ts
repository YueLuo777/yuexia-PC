import type { ErrorLogEntry } from './errorLogEntryTypes';

export const defaultEntriesPart61: ErrorLogEntry[] = [
  {
    id: 'commercial-sandbox-invite-reward-and-right-panel-fit-001',
    title: '用户裂变沙箱不应重复发奖励且右栏文案不能裁切',
    area: '测试板块 / 用户系统与用户裂变本地沙箱',
    symptom:
      '本地沙箱验证一级邀请时，观察期奖励存在被 React 状态更新重复触发的风险；真实桌面验收还发现右侧状态提示和账本原因在窄右栏里贴边裁切。',
    cause:
      '邀请奖励生效最初把发积分副作用放在 setRewards updater 内，开发模式或重复调度下可能执行多次；右侧栏沿用完整说明长文案，没有按窄栏设计短状态和流水展示。',
    solution:
      '先计算待生效奖励，再更新奖励状态，并在状态 updater 外统一发放积分；右侧状态改成短句，完整销售边界保留在页头和警示卡，账本原因压缩为审计短句并限制可读宽度。',
    prevention:
      '以后本地商业沙箱的余额、奖励和账本变更不得在 React 状态 updater 中执行副作用；真实桌面验收必须检查右侧栏长文案、流水原因和窄屏边界是否被裁切。',
    keywords: ['商业沙箱', '用户裂变', '邀请奖励', '重复发放', '右栏裁切', '测试板块'],
    updatedAt: '2026-07-31',
  },
];
