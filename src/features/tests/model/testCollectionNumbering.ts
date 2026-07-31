import type { TestGroup } from '@/features/tests/pages/testCollectionTypes';

export type RetiredTestSerial = {
  serial: number;
  path: string;
};

export const RETIRED_TEST_SERIALS: RetiredTestSerial[] = [
  { serial: 6, path: '/work-setting-taxonomy-proposal-test' },
  { serial: 7, path: '/setting-ai-ready-taxonomy-test' },
  { serial: 8, path: '/prompt-driven-novel-workspace-test' },
  { serial: 10, path: '/standard-mode-workbench-test' },
  { serial: 11, path: '/mode-switch-novel-library-test' },
  { serial: 13, path: '/standard-mode-four-stage-workbench-test' },
  { serial: 14, path: '/standard-mode-setting-template-choice-test' },
  { serial: 15, path: '/standard-mode-smart-setting-flow-test' },
  { serial: 16, path: '/prompt-library-structure-test' },
  { serial: 17, path: '/prompt-workflow-preview-test' },
  { serial: 18, path: '/test-browser' },
  { serial: 22, path: '/standard-mode-details-settings-redesign-test' },
  { serial: 23, path: '/standard-mode-compact-setting-workspace-test' },
  { serial: 24, path: '/standard-mode-compact-navigation-test' },
  { serial: 26, path: '/template-node-workbench-layout-test' },
  { serial: 27, path: '/creation-guide-variants-test' },
  { serial: 28, path: '/standard-mode-guided-navigation-test' },
  { serial: 29, path: '/four-level-setting-structure-test' },
  { serial: 30, path: '/setting-template-assembler-test' },
  { serial: 31, path: '/professional-template-hierarchy-variants-test' },
  { serial: 32, path: '/professional-template-diy-variants-test' },
  { serial: 36, path: '/template-management-cascade-test' },
  { serial: 37, path: '/template-generation-step-cards-test' },
  { serial: 39, path: '/simplified-template-generation-settings-test' },
];

export function buildTestNumberByPath(groups: TestGroup[]) {
  const activeItems = groups.flatMap((group) => group.items);
  const activeSerials = activeItems.map((item) => item.serial);
  const retiredSerials = RETIRED_TEST_SERIALS.map((item) => item.serial);
  const allSerials = [...activeSerials, ...retiredSerials];
  const uniqueSerials = new Set(allSerials);
  const maxSerial = Math.max(0, ...allSerials);

  if (uniqueSerials.size !== allSerials.length) {
    throw new Error('测试序号重复：新测试不能复用已存在或已删除的序号。');
  }
  for (let serial = 1; serial <= maxSerial; serial += 1) {
    if (!uniqueSerials.has(serial)) {
      throw new Error(`测试序号 ${serial} 缺少：删除测试后必须登记为已退役序号。`);
    }
  }

  return new Map(activeItems.map((item) => [item.path, item.serial] as const));
}

export function getNextTestSerial(groups: TestGroup[]) {
  const activeSerials = groups.flatMap((group) => group.items.map((item) => item.serial));
  const retiredSerials = RETIRED_TEST_SERIALS.map((item) => item.serial);
  return Math.max(0, ...activeSerials, ...retiredSerials) + 1;
}

export function formatTestSerial(serial: number | undefined) {
  return String(serial ?? 0).padStart(2, '0');
}
