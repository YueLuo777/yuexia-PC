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
    expect(registry.has('/standard-mode-workbench-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 10, path: '/standard-mode-workbench-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 11, path: '/mode-switch-novel-library-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 15, path: '/standard-mode-smart-setting-flow-test' });
    expect(registry.get('/professional-workbench-baseline-test')).toBe(12);
    expect(registry.get('/tomato-genre-iteration-test')).toBe(19);
    expect(registry.get('/standard-mode-creation-pages-design-test')).toBe(21);
    expect(registry.has('/standard-mode-details-settings-redesign-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 22, path: '/standard-mode-details-settings-redesign-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 23, path: '/standard-mode-compact-setting-workspace-test' });
    expect(registry.has('/standard-mode-compact-navigation-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 24, path: '/standard-mode-compact-navigation-test' });
    expect(registry.get('/standard-mode-project-progress-test')).toBe(25);
    expect(registry.has('/template-node-workbench-layout-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 26, path: '/template-node-workbench-layout-test' });
    expect(registry.has('/creation-guide-variants-test')).toBe(false);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 27, path: '/creation-guide-variants-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 28, path: '/standard-mode-guided-navigation-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 29, path: '/four-level-setting-structure-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 30, path: '/setting-template-assembler-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 31, path: '/professional-template-hierarchy-variants-test' });
    expect(registry.get('/multi-ai-writing-idea-test')).toBe(33);
    expect(registry.get('/ai-ranking-book-search-idea-test')).toBe(34);
    expect(registry.get('/fantasy-template-field-reduction-test')).toBe(35);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 36, path: '/template-management-cascade-test' });
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 37, path: '/template-generation-step-cards-test' });
    expect(registry.get('/commercial-sandbox-migration-test')).toBe(38);
    expect(RETIRED_TEST_SERIALS).toContainEqual({ serial: 39, path: '/simplified-template-generation-settings-test' });
    expect(registry.get('/custom-setting-template-idea-test')).toBe(40);
    expect(registry.get('/custom-generation-order-idea-test')).toBe(41);
    expect(registry.get('/story-analysis-fusion-test')).toBe(42);
    expect(getNextTestSerial(testGroups)).toBe(43);
    expect(testGroups.find((group) => group.title === '未做')?.items.some((item) => item.serial === 19)).toBe(true);
  });

  it('rejects reused retired numbers and unregistered gaps', () => {
    const reused = [{ title: 'x', items: [{ ...testGroups[0].items[0], serial: 11, path: '/new-test' }] }];
    const gap = [{ title: 'x', items: [{ ...testGroups[0].items[0], serial: 2, path: '/new-test' }] }];

    expect(() => buildTestNumberByPath(reused)).toThrow('测试序号重复');
    expect(() => buildTestNumberByPath(gap)).toThrow('测试序号 1 缺少');
  });
});
