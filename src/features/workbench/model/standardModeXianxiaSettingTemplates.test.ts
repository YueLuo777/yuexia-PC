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

function getFieldsById(structure: TemplateStructure) {
  return new Map(
    getEntries(structure)
      .flatMap((entry) => entry.sections)
      .flatMap((section) => section.fields)
      .map((field) => [field.id, field.title]),
  );
}

function getNodeIds(structure: TemplateStructure) {
  return new Set(structure.flatMap((domain) => [
    domain.id,
    ...domain.groups.flatMap((group) => [
      group.id,
      ...group.entries.flatMap((entry) => [
        entry.id,
        ...entry.sections.flatMap((section) => [section.id, ...section.fields.map((field) => field.id)]),
      ]),
    ]),
  ]));
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

  it('keeps the lightweight scope at 100 fields and grows standard into the complete template', () => {
    expect(full).toBeDefined();
    expect(standard).toBeDefined();
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
      '作品定位', '第一卷', '主角档案', '主角起始地点', '宗门势力（可重复）', '功法档案（可重复）',
    ]));
    expect(getFieldCount(light!.structure)).toBe(100);
    expect(getFieldCount(standard!.structure)).toBeGreaterThan(getFieldCount(light!.structure));
    expect(getFieldCount(full!.structure)).toBeGreaterThan(getFieldCount(standard!.structure));
  });

  it('preserves every shared field id across lightweight, standard, and complete upgrades', () => {
    const lightFields = getFieldsById(light!.structure);
    const standardFields = getFieldsById(standard!.structure);
    const fullFields = getFieldsById(full!.structure);

    lightFields.forEach((title, id) => expect(standardFields.get(id)).toBe(title));
    standardFields.forEach((title, id) => expect(fullFields.get(id)).toBe(title));
    const lightNodeIds = getNodeIds(light!.structure);
    const standardNodeIds = getNodeIds(standard!.structure);
    const fullNodeIds = getNodeIds(full!.structure);
    lightNodeIds.forEach((id) => expect(standardNodeIds.has(id)).toBe(true));
    standardNodeIds.forEach((id) => expect(fullNodeIds.has(id)).toBe(true));
  });

  it.each(['玄幻', '仙侠'])('recommends all xianxia variants for the %s genre', (genre) => {
    expect(getRecommendedTemplatesForNovelCategory(genre, 'male').map((preset) => preset.title)).toEqual([
      '玄幻仙侠（标准版）',
      '玄幻仙侠（完整版）',
      '玄幻仙侠（轻量版）',
    ]);
  });
});
