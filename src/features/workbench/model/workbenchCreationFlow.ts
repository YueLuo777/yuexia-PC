export type WorkbenchCreationFlowPageKey =
  | 'brainstorm'
  | 'outline'
  | 'chapterOutline'
  | 'writing'
  | 'audit'
  | 'comment'
  | 'polish'
  | 'status'
  | 'summary';

export interface WorkbenchCreationFlowStep {
  id: WorkbenchCreationFlowPageKey;
  number: number;
  title: string;
  description: string;
  group: 'creation' | 'review';
}

export interface WorkbenchHeaderFlowItem {
  id: 'workInfo' | WorkbenchCreationFlowPageKey;
  title: string;
  flow?: WorkbenchCreationFlowPageKey;
  group?: 'creation' | 'review';
}

export const WORKBENCH_MAIN_FLOW_STEPS: WorkbenchCreationFlowStep[] = [
  { id: 'brainstorm', number: 1, title: '脑洞', description: '生成开书方向', group: 'creation' },
  { id: 'outline', number: 2, title: '设定', description: '整理设定主线', group: 'creation' },
  { id: 'chapterOutline', number: 3, title: '章纲', description: '展开章节结构', group: 'creation' },
  { id: 'writing', number: 4, title: '正文', description: '回到正文编辑器', group: 'creation' },
];

export const WORKBENCH_REVIEW_FLOW_STEPS: WorkbenchCreationFlowStep[] = [
  { id: 'audit', number: 5, title: '审核', description: '检查章节问题', group: 'review' },
  { id: 'comment', number: 6, title: '点评', description: '点评章节质量', group: 'review' },
  { id: 'polish', number: 7, title: '润色', description: '优化正文表达', group: 'review' },
  { id: 'status', number: 8, title: '状态', description: '更新设定状态', group: 'review' },
  { id: 'summary', number: 9, title: '梗概', description: '整理章节梗概', group: 'review' },
];

export const WORKBENCH_CREATION_FLOW_STEPS: WorkbenchCreationFlowStep[] = [
  ...WORKBENCH_MAIN_FLOW_STEPS,
  ...WORKBENCH_REVIEW_FLOW_STEPS,
];

export const WORKBENCH_HEADER_FLOW_ITEMS: WorkbenchHeaderFlowItem[] = [
  { id: 'workInfo', title: '作品信息' },
  ...WORKBENCH_CREATION_FLOW_STEPS.map((step) => ({
    id: step.id,
    title: step.title,
    flow: step.id,
    group: step.group,
  })),
];

export function isWorkbenchCreationFlowPageKey(value: unknown): value is WorkbenchCreationFlowPageKey {
  return typeof value === 'string' && WORKBENCH_CREATION_FLOW_STEPS.some((step) => step.id === value);
}
