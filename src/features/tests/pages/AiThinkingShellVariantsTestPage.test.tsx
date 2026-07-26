import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('AI thinking shell variants test page', () => {
  it('offers four clearly named shell comparisons and stays in the test collection', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/features/tests/pages/AiThinkingShellVariantsTestPage.tsx'), 'utf8');
    const collection = readTestCollectionSource();

    ['A 当前双层框', 'B 单层蓝框', 'C 蓝色消息块', 'D 紧凑折叠条'].forEach((title) => {
      expect(page).toContain(title);
    });
    expect(collection).toContain('/ai-thinking-shell-variants-test');
    expect(collection).toContain('AiThinkingShellVariantsTestPage');
  });
});
