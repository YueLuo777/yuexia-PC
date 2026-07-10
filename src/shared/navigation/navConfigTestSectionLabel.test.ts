import { describe, expect, it } from 'vitest';

import { DEFAULT_NAV_CONFIG, normalizeNavConfig } from '@/shared/navigation/navConfig';

describe('test section navigation label', () => {
  it('uses test section as the default visible navigation label', () => {
    expect(DEFAULT_NAV_CONFIG[0].items.find((item) => item.to === '/test-collection')?.label).toBe('测试板块');
  });

  it('normalizes saved old test navigation labels to test section', () => {
    const normalized = normalizeNavConfig([
      {
        title: 'navigation',
        iconName: 'LayoutGrid',
        items: [{ iconName: 'FlaskConical', label: '测试', to: '/test-collection' }],
      },
    ]);

    expect(normalized[0].items.find((item) => item.to === '/test-collection')?.label).toBe('测试板块');
    expect(JSON.stringify(normalized)).not.toContain('"label":"测试"');
  });
});
