import { describe, expect, it } from 'vitest';

import {
  HOTSPOT_RULE_GROUPS,
  evaluateHotspotByRules,
  rankHotspotsByRuleEvaluation,
} from '@/features/hotspots/model/hotspotRules';
import type { HotspotItem } from '@/features/hotspots/model/hotspotTypes';

function item(title: string, rank = 1): HotspotItem {
  return {
    id: `douyin-${rank}-${title}`,
    source: 'douyin',
    sourceName: '抖音',
    rank,
    title,
    capturedAt: '2026-07-07T00:00:00.000Z',
  };
}

describe('hotspot rule evaluation', () => {
  it('boosts hotspots with novel-friendly hooks', () => {
    const result = evaluateHotspotByRules(item('普通人靠AI黑科技逆袭出圈'));

    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThanOrEqual(72);
    expect(result.matchedRules.map((rule) => rule.id)).toEqual(
      expect.arrayContaining(['identity-gap', 'tech-imagination', 'strong-emotion']),
    );
  });

  it('marks sensitive real cases as risky', () => {
    const result = evaluateHotspotByRules(item('警方通报重大刑案嫌犯被逮捕'));

    expect(result.level).toBe('risk');
    expect(result.score).toBeLessThan(55);
    expect(result.matchedRules.map((rule) => rule.id)).toEqual(
      expect.arrayContaining(['official-notice', 'sensitive-realcase']),
    );
  });

  it('ranks higher-scored hotspots before low-adaptation headlines', () => {
    const ranked = rankHotspotsByRuleEvaluation([item('球队4:3夺冠晋级决赛', 1), item('普通人靠AI黑科技逆袭出圈', 2)]);

    expect(ranked[0].title).toBe('普通人靠AI黑科技逆袭出圈');
  });

  it('keeps rule groups readable for the preview modal', () => {
    expect(HOTSPOT_RULE_GROUPS.length).toBeGreaterThan(8);
    expect(HOTSPOT_RULE_GROUPS.some((group) => group.polarity === 'bonus')).toBe(true);
    expect(HOTSPOT_RULE_GROUPS.some((group) => group.polarity === 'penalty')).toBe(true);
    expect(HOTSPOT_RULE_GROUPS.some((group) => group.polarity === 'risk')).toBe(true);
  });
});
