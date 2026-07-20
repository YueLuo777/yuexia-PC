import { describe, expect, it } from 'vitest';

import { buildInspirationGenerationUserContent, normalizeInspirationGenerateCount } from './ConceptInspirationForm';

describe('ConceptInspirationForm generation helpers', () => {
  it('normalizes supported generation counts', () => {
    expect(normalizeInspirationGenerateCount('1')).toBe(1);
    expect(normalizeInspirationGenerateCount('10')).toBe(10);
    expect(normalizeInspirationGenerateCount('2')).toBe(1);
  });

  it('adds a distinct batch position to multi-result requests', () => {
    expect(buildInspirationGenerationUserContent('原始灵感', 1, 3)).toContain('第 2 个方案');
    expect(buildInspirationGenerationUserContent('原始灵感', 0, 1)).toBe('原始灵感');
  });
});
