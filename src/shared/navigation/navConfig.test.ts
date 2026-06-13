import { describe, expect, it } from 'vitest';

import { DEFAULT_NAV_CONFIG, normalizeNavConfig } from '@/shared/navigation/navConfig';

describe('navigation config without zones', () => {
  it('keeps the default navigation as one flat internal group', () => {
    expect(DEFAULT_NAV_CONFIG).toHaveLength(1);
    expect(DEFAULT_NAV_CONFIG[0].title).toBe('导航');
    expect(DEFAULT_NAV_CONFIG[0].dividerAfterItemTo).toBe('/novels');
    expect(DEFAULT_NAV_CONFIG[0].dividerAfterItemTos).toEqual(['/novels']);
    expect(DEFAULT_NAV_CONFIG[0].items.map((item) => item.to)).toEqual([
      '/novels',
      '/scripts',
      '/library',
      '/prompts',
      '/model-manage',
      '/token-usage',
      '/test-collection',
    ]);
    expect(DEFAULT_NAV_CONFIG[0].items.find((item) => item.to === '/library')?.label).toBe('资料库');
    expect(JSON.stringify(DEFAULT_NAV_CONFIG)).not.toContain('专区');
  });

  it('renames the library navigation entry to materials library even for saved old configs', () => {
    const normalized = normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      items: [
        { iconName: 'Library', label: '库', to: '/library' },
      ],
    }]);

    expect(normalized[0].items.find((item) => item.to === '/library')?.label).toBe('资料库');
    expect(JSON.stringify(normalized)).not.toContain('"label":"库"');
  });

  it('flattens old zone-based navigation while preserving hidden item intent and default divider', () => {
    const normalized = normalizeNavConfig([
      {
        title: '创作专区',
        iconName: 'BookOpen',
        items: [
          { iconName: 'BookOpen', label: '我的小说', to: '/novels' },
          { iconName: 'Film', label: '我的剧本', to: '/scripts', hidden: true },
        ],
      },
      {
        title: '数据专区',
        iconName: 'Database',
        hidden: true,
        items: [
          { iconName: 'Tag', label: '提示词管理', to: '/prompts' },
        ],
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].title).toBe('导航');
    expect(normalized[0].dividerAfterItemTo).toBe('/novels');
    expect(normalized[0].dividerAfterItemTos).toEqual(['/novels']);
    expect(normalized[0].items.some((item) => item.to === '/novels')).toBe(true);
    expect(normalized[0].items.find((item) => item.to === '/scripts')?.hidden).toBe(true);
    expect(normalized[0].items.find((item) => item.to === '/prompts')?.hidden).toBe(true);
    expect(JSON.stringify(normalized)).not.toContain('创作专区');
    expect(JSON.stringify(normalized)).not.toContain('数据专区');
  });

  it('preserves a custom navigation divider and allows hiding it', () => {
    expect(normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      dividerAfterItemTo: '/prompts',
      items: DEFAULT_NAV_CONFIG[0].items,
    }])[0].dividerAfterItemTo).toBe('/prompts');
    expect(normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      dividerAfterItemTo: '/prompts',
      items: DEFAULT_NAV_CONFIG[0].items,
    }])[0].dividerAfterItemTos).toEqual(['/prompts']);

    expect(normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      dividerAfterItemTo: null,
      items: DEFAULT_NAV_CONFIG[0].items,
    }])[0].dividerAfterItemTo).toBeNull();
    expect(normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      dividerAfterItemTo: null,
      items: DEFAULT_NAV_CONFIG[0].items,
    }])[0].dividerAfterItemTos).toEqual([]);
  });

  it('preserves multiple navigation dividers and drops invalid or hidden targets', () => {
    const normalized = normalizeNavConfig([{
      title: '导航',
      iconName: 'LayoutGrid',
      dividerAfterItemTos: ['/novels', '/prompts', '/missing', '/prompts', '/scripts'],
      items: DEFAULT_NAV_CONFIG[0].items.map((item) => (
        item.to === '/scripts' ? { ...item, hidden: true } : item
      )),
    }]);

    expect(normalized[0].dividerAfterItemTo).toBe('/novels');
    expect(normalized[0].dividerAfterItemTos).toEqual(['/novels', '/prompts']);
  });
});
