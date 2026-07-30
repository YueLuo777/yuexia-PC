import { describe, expect, it } from 'vitest';

import {
  SMART_TEMPLATE_PRESETS,
  getRecommendedTemplatesForNovelCategory,
} from './standardModeSmartSettingFlowModel';
import type { TemplateStructure } from './standardModeTemplateModel';

function getEntries(structure: TemplateStructure) {
  return structure.flatMap((domain) => domain.groups).flatMap((group) => group.entries);
}

function getFieldCount(structure: TemplateStructure) {
  return getEntries(structure)
    .flatMap((entry) => entry.sections)
    .flatMap((section) => section.fields)
    .length;
}

describe('xianxia setting template variants', () => {
  const standard = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');
  const full = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia-full');
  const light = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia-light');

  it('keeps the existing preset id as standard and exposes all three named variants', () => {
    expect(standard?.title).toBe('玄幻仙侠（标准版）');
    expect(full?.title).toBe('玄幻仙侠（完整版）');
    expect(light?.title).toBe('玄幻仙侠（轻量版）');
    expect([standard, full, light].every((preset) => preset?.genreCategory === '玄幻仙侠')).toBe(true);
  });

  it('stores the complete and lightweight structures as independent editable templates', () => {
    expect(full).toBeDefined();
    expect(light).toBeDefined();
    expect(full?.structure.map((domain) => domain.title)).toEqual([
      '作品设定', '剧情规划', '人物设定', '地点地图', '势力设定', '道具资源', '伏笔线索', '怪物图鉴',
    ]);
    expect(light?.structure.map((domain) => domain.title)).toEqual([
      '作品设定', '剧情规划', '人物设定', '地点地图', '势力设定', '道具资源', '伏笔线索',
    ]);
    expect(getEntries(full!.structure).map((entry) => entry.title)).toEqual(expect.arrayContaining([
      '世界层级与连接', '后续分卷模板（可重复）', '宗门势力（可重复）', '妖兽档案（可重复）',
    ]));
    expect(getEntries(light!.structure).map((entry) => entry.title)).toEqual(expect.arrayContaining([
      '前期节奏', '第一卷关键地点（可重复）', '主角所属势力', '第一卷悬念',
    ]));
    expect(getFieldCount(full!.structure)).toBeGreaterThan(getFieldCount(light!.structure));
  });

  it.each(['玄幻', '仙侠'])('recommends all xianxia variants for the %s genre', (genre) => {
    expect(getRecommendedTemplatesForNovelCategory(genre, 'male').map((preset) => preset.title)).toEqual([
      '玄幻仙侠（标准版）',
      '玄幻仙侠（完整版）',
      '玄幻仙侠（轻量版）',
    ]);
  });
});
