import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SettingAiReadyTaxonomyTestPage } from './SettingAiReadyTaxonomyTestPage';
import { AI_READY_ENTRIES, AI_READY_PROFILES } from './settingAiReadyTaxonomyData';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

const collectionSource = readTestCollectionSource;

describe('SettingAiReadyTaxonomyTestPage', () => {
  it('renders a separate formal-layout simulation with selectable work and role previews', () => {
    render(<SettingAiReadyTaxonomyTestPage />);

    expect(screen.getByText('17号模拟 · AI可执行版')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '17号AI可执行设定资料树' })).toBeInTheDocument();
    expect(screen.getAllByText('金手指（男主专属）')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /力量体系/ }));
    expect(screen.getByDisplayValue('力量体系')).toBeInTheDocument();
    expect(screen.getAllByText('资源与战力上限')).toHaveLength(2);
    expect(screen.getByText('AI写战斗和升级时，要先比较双方境界。弱者获胜必须写清楚他用了什么克制手段、法宝或陷阱，不能突然变强。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /薛无痕/ }));
    expect(screen.getByDisplayValue('薛无痕')).toBeInTheDocument();
    expect(screen.getAllByText('反派计划（反派专属）')).toHaveLength(2);
    expect(screen.getByLabelText('失败代价')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-ai-ready-domain-selected-path="true"]')).toHaveLength(3);
    expect(document.querySelector('[data-ai-ready-selected-path="true"]')).toHaveClass('bg-[#2A9FB9]');
  });

  it('keeps the protagonist sections in AI reading order with all six cheat fields', () => {
    const protagonist = AI_READY_PROFILES['lin-ke'];

    expect(protagonist.sections.map((section) => section.title)).toEqual([
      '基础档案',
      '动机与行为规则',
      '金手指（男主专属）',
      '实力与手段',
      '当前状态',
      '关系',
    ]);
    expect(protagonist.sections.find((section) => section.title === '金手指（男主专属）')?.fields.map((field) => field.label)).toEqual([
      '金手指当前功能',
      '金手指来源',
      '金手指升级与解锁条件',
      '金手指使用限制与代价',
      '金手指真实来历与隐藏目的',
      '金手指当前解锁状态',
    ]);
  });

  it('gives every role unified relationships, constraints, state, and strength boundaries', () => {
    const roles = AI_READY_ENTRIES.filter((entry) => entry.domain === 'character').map((entry) => AI_READY_PROFILES[entry.id]);

    for (const role of roles) {
      expect(role.sections.find((section) => section.title === '关系')?.fields.map((field) => field.label)).toEqual([
        '人物关系',
        '隶属势力',
      ]);
      expect(role.sections.find((section) => section.title === '动机与行为规则')?.fields.map((field) => field.label)).toContain('角色已知信息与错误认知');
      expect(role.sections.find((section) => section.title === '当前状态')?.fields.map((field) => field.label)).toEqual([
        '当前处境',
        '当前地点',
        '身心状态',
        '当前资源',
      ]);
      expect(role.sections.find((section) => section.title === '实力与手段')?.fields.map((field) => field.label)).toContain('战力范围与弱点');
    }
  });

  it('includes growth context, antagonist planning, and work-level generation rules', () => {
    expect(AI_READY_PROFILES['su-wan-ning'].sections.find((section) => section.title === '剧情职能')?.fields.map((field) => field.label)).toContain('成长变化');
    expect(AI_READY_PROFILES['xue-wu-hen'].sections.find((section) => section.title === '反派计划（反派专属）')?.fields.map((field) => field.label)).toEqual([
      '行动期限与压力',
      '常用手段',
      '当前计划',
      '主角冲突',
      '失败代价',
      '关键弱点',
    ]);
    expect(AI_READY_PROFILES['power-system'].sections.flatMap((section) => section.fields.map((field) => field.label))).toEqual([
      '修炼境界',
      '突破条件',
      '越级战斗规则',
      '资源用途',
      '开局战力上限',
    ]);
    expect(AI_READY_PROFILES['setting-red-lines'].sections[0]?.fields.map((field) => field.label)).toEqual([
      '世界运行规则',
      '秘密内容、知情人及知情程度',
      '能力限制与不可实现效果',
      '新增能力、道具与规则限制',
    ]);
  });

  it('uses direct field names and explains causes, limits, and results in plain language', () => {
    const allLabels = Object.values(AI_READY_PROFILES).flatMap((profile) =>
      profile.sections.flatMap((section) => section.fields.map((field) => field.label)),
    );

    expect(allLabels).toContain('核心动机');
    expect(allLabels).toContain('角色已知信息与错误认知');
    expect(allLabels).toContain('秘密内容、知情人及知情程度');
    expect(allLabels).not.toContain('秘密知情范围');
    expect(allLabels).not.toContain('能力边界');
    expect(allLabels).not.toContain('新增设定限制');
    expect(allLabels).toContain('战力范围与弱点');
    expect(allLabels).not.toContain('表象与内核');
    expect(allLabels).not.toContain('表面性格和真实想法');
    expect(allLabels).not.toContain('知道的重要信息');
    expect(allLabels).not.toContain('越级胜利限制');
    expect(allLabels).not.toContain('最想得到什么');
    expect(allLabels.filter((label) => /(什么|怎样|为什么|会怎样|谁)/.test(label))).toEqual([]);
    expect(allLabels).not.toContain('秘密与知情范围');
    expect(AI_READY_PROFILES['work-positioning'].sections[0]?.fields[1]?.value).toContain('能力不是直接增加修为');
    expect(AI_READY_PROFILES['lin-ke'].aiPrompt).toContain('不能让他突然获得新能力');
    expect(AI_READY_PROFILES['xue-wu-hen'].sections.find((section) => section.title === '反派计划（反派专属）')?.fields[2]?.value).toContain('先制造新的矿难');
  });

  it('registers the new test immediately after test 16 without replacing it', () => {
    const source = collectionSource();
    const test16 = source.indexOf("path: '/work-setting-taxonomy-proposal-test'");
    const aiReady = source.indexOf("path: '/setting-ai-ready-taxonomy-test'");

    expect(test16).toBeGreaterThan(-1);
    expect(aiReady).toBeGreaterThan(test16);
    expect(source).toContain("const SettingAiReadyTaxonomyTestPage = lazy(() =>");
    expect(source).toContain("case '/setting-ai-ready-taxonomy-test':");
  });
});
