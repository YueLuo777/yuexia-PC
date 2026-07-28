import type { TestGroup } from '@/features/tests/pages/testCollectionTypes';

export type RetiredTestSerial = {
  serial: number;
  path: string;
};

export const RETIRED_TEST_SERIALS: RetiredTestSerial[] = [
  { serial: 11, path: '/mode-switch-novel-library-test' },
  { serial: 15, path: '/standard-mode-smart-setting-flow-test' },
  { serial: 22, path: '/standard-mode-details-settings-redesign-test' },
  { serial: 24, path: '/standard-mode-compact-navigation-test' },
  { serial: 26, path: '/template-node-workbench-layout-test' },
  { serial: 27, path: '/creation-guide-variants-test' },
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
