import { describe, expect, it } from 'vitest';

import { testGroups } from '@/features/tests/pages/testCollectionGroups';
import {
  buildTestNumberByPath,
  getNextTestSerial,
  RETIRED_TEST_SERIALS,
} from './testCollectionNumbering';

describe('test collection numbering', () => {
  it('keeps retired numbers unavailable and assigns the next number after the historical maximum', () => {
    const registry = buildTestNumberByPath(testGroups);

    expect(registry.has('/mode-switch-novel-library-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 11, path: '/mode-switch-novel-library-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 15, path: '/standard-mode-smart-setting-flow-test' });
    expect(registry.get('/professional-workbench-baseline-test')).toBe(12);
    expect(registry.get('/tomato-genre-iteration-test')).toBe(19);
    expect(getNextTestSerial(testGroups)).toBe(21);
    expect(testGroups.find((group) => group.title === '未做')?.items.some((item) => item.serial === 19)).toBe(true);
  });

  it('rejects reused retired numbers and unregistered gaps', () => {
    const reused = [{ title: 'x', items: [{ ...testGroups[0].items[0], serial: 11, path: '/new-test' }] }];
    const gap = [{ title: 'x', items: [{ ...testGroups[0].items[0], serial: 2, path: '/new-test' }] }];

    expect(() => buildTestNumberByPath(reused)).toThrow('测试序号重复');
    expect(() => buildTestNumberByPath(gap)).toThrow('测试序号 1 缺少');
  });
});
