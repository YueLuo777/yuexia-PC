import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WorkSettingTaxonomyProposalTestPage } from './WorkSettingTaxonomyProposalTestPage';
import { ROLE_PROFILES, STANDARD_ROLE_SECTION_TITLES } from './workSettingTaxonomyProposalData';

const readCollectionSource = () =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TestCollectionPage.tsx'), 'utf8');

describe('WorkSettingTaxonomyProposalTestPage', () => {
  it('renders test 16 as a formal setting-page simulation', () => {
    render(<WorkSettingTaxonomyProposalTestPage />);

    expect(screen.getByTestId('setting-format-simulation')).toBeInTheDocument();
    expect(screen.getByText('16号模拟')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '16号设定资料树' })).toBeInTheDocument();
    expect(screen.getByText('生成设定')).toBeInTheDocument();
    expect(screen.getByText('模型提示词')).toBeInTheDocument();
  });

  it('uses the requested compact male-protagonist group order and fields', () => {
    render(<WorkSettingTaxonomyProposalTestPage />);

    ['基础档案', '金手指（男主专属）', '实力与手段', '当前状态', '关系'].forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
    [
      '外貌',
      '性格',
      '称号/外号/别称',
      '人物背景',
      '当前目标',
      '能力概述',
      '能力来源',
      '能力规则',
      '能力状态',
      '境界修为',
      '功法体系',
      '战斗技能',
      '其他技能',
      '人物关系',
      '隶属势力',
    ].forEach((label) => expect(screen.getByLabelText(label)).toBeInTheDocument());
    ['背景与目标', '剧情定位与立场', '关系与补充'].forEach((title) => {
      expect(screen.queryByRole('heading', { name: title })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /林刻/ })).toHaveClass('border-2', 'border-[#078FAE]', 'bg-white');
    expect(screen.getByText('男主')).toBeInTheDocument();
  });

  it('merges background fields into the standard five groups and uses the same strength fields for every role', () => {
    const requiredFieldsBySection = {
      基础档案: ['外貌', '性格', '称号/外号/别称', '人物背景', '当前目标'],
      实力与手段: ['境界修为', '功法体系', '战斗技能', '其他技能'],
      剧情定位与立场: ['角色作用', '阵营立场'],
      当前状态: ['当前处境', '资源状态'],
      关系与补充: ['人物关系', '其他'],
    } as const;

    (['su-wan-ning', 'han-zhen', 'xue-wu-hen'] as const).forEach((id) => {
      const profile = ROLE_PROFILES[id];
      const sectionTitles = profile.sections.map((section) => section.title);
      STANDARD_ROLE_SECTION_TITLES.forEach((title) => expect(sectionTitles).toContain(title));
      Object.entries(requiredFieldsBySection).forEach(([title, requiredFields]) => {
        const labels = profile.sections.find((section) => section.title === title)?.fields.map((field) => field.label);
        requiredFields.forEach((label) => expect(labels).toContain(label));
      });
      expect(sectionTitles).not.toContain('背景与目标');
      expect(profile.sections.find((section) => section.title === '实力与手段')?.fields.map((field) => field.label)).toEqual([
        '境界修为',
        '功法体系',
        '战斗技能',
        '其他技能',
      ]);
    });
    expect(ROLE_PROFILES['lin-ke'].sections.map((section) => section.title)).toEqual([
      '基础档案',
      '金手指（男主专属）',
      '实力与手段',
      '当前状态',
      '关系',
    ]);
    expect(ROLE_PROFILES['lin-ke'].sections[0].fields.map((field) => field.label)).toEqual([
      '外貌',
      '性格',
      '称号/外号/别称',
      '人物背景',
      '当前目标',
    ]);
    expect(ROLE_PROFILES['lin-ke'].sections[2].fields.map((field) => field.label)).toEqual([
      '境界修为',
      '功法体系',
      '战斗技能',
      '其他技能',
    ]);
    expect(ROLE_PROFILES['lin-ke'].sections[4].fields.map((field) => field.label)).toEqual(['人物关系', '隶属势力']);
    expect(ROLE_PROFILES['xue-wu-hen'].sections.map((section) => section.title)).toContain('反派计划（反派专属）');
    expect(ROLE_PROFILES['su-wan-ning'].sections).toHaveLength(STANDARD_ROLE_SECTION_TITLES.length);
    expect(ROLE_PROFILES['han-zhen'].sections).toHaveLength(STANDARD_ROLE_SECTION_TITLES.length);
  });

  it('switches between the normalized female lead, supporting role, and antagonist designs', () => {
    render(<WorkSettingTaxonomyProposalTestPage />);

    fireEvent.click(screen.getByRole('button', { name: /苏晚凝/ }));
    expect(screen.getByLabelText('人物姓名')).toHaveValue('苏晚凝');
    expect(screen.getByLabelText('身份定位')).toHaveValue('女主角');
    expect(screen.getByLabelText('外貌')).toHaveValue('白衣束袖，眉眼清冷，常佩一柄无鞘短剑。');
    expect(screen.getByLabelText('当前目标')).toHaveValue(
      '查清师父失踪真相，保住剑宗传承，同时摆脱被宗门联姻利用的命运。',
    );
    STANDARD_ROLE_SECTION_TITLES.forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /专属/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /韩镇/ }));
    expect(screen.getByLabelText('身份定位')).toHaveValue('重要配角');
    expect(screen.getByLabelText('外貌')).toHaveValue('身形魁梧，右臂布满旧伤，常披玄铁护肩。');
    STANDARD_ROLE_SECTION_TITLES.forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
    expect(screen.getByLabelText('掌握情报')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /薛无痕/ }));
    expect(screen.getByLabelText('身份定位')).toHaveValue('阶段反派');
    expect(screen.getByLabelText('外貌')).toHaveValue('面容温雅，瞳色偏灰，衣袖常带淡淡药香。');
    [...STANDARD_ROLE_SECTION_TITLES, '反派计划（反派专属）'].forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
    ['核心欲望', '所属势力', '阶段计划', '弱点破绽'].forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
    expect(
      screen.getByText('根据当前反派设定补全所选字段，保持基础档案、实力手段、反派计划和弱点破绽一致。'),
    ).toBeInTheDocument();
  });

  it('switches to the simulated renamed work settings from the same tree', () => {
    render(<WorkSettingTaxonomyProposalTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '作品定位' }));
    expect(screen.getByLabelText('设定名')).toHaveValue('作品定位');
    expect(screen.getByLabelText('故事类型')).toHaveValue('东方玄幻、升级流、势力经营');
    expect(screen.getByLabelText('核心创意')).toBeInTheDocument();
    expect(screen.getByLabelText('一句话概括')).toBeInTheDocument();
    expect(
      screen.getByText('根据当前作品定位补全所选字段，保持故事类型、核心创意和一句话概括互相一致。'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '世界背景' }));
    expect(screen.getByLabelText('设定名')).toHaveValue('世界背景');
    expect(screen.getByLabelText('时代背景')).toBeInTheDocument();
    expect(screen.getByLabelText('世界格局')).toBeInTheDocument();
    expect(screen.getByLabelText('社会秩序')).toBeInTheDocument();
    expect(
      screen.getByText('根据当前世界背景补全所选字段，保持时代背景、世界格局和社会秩序互相一致。'),
    ).toBeInTheDocument();
  });

  it('keeps field-record controls usable inside the simulation', () => {
    render(<WorkSettingTaxonomyProposalTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '能力来源字段记录' }));
    expect(screen.getByText('能力来源记录')).toBeInTheDocument();
    expect(screen.getByText('当前为16号测试模拟记录，正式页面的数据和历史记录均未修改。')).toBeInTheDocument();
  });

  it('is registered in the UI test group after the field-sizing test', () => {
    const source = readCollectionSource();
    const previousEntry = source.indexOf("path: '/role-field-sizing-layout-test'");
    const proposalEntry = source.indexOf("path: '/work-setting-taxonomy-proposal-test'");
    const nextGroup = source.indexOf("title: 'AI 链路测试'");

    expect(source).toContainSource('const WorkSettingTaxonomyProposalTestPage = lazy(() =>');
    expect(proposalEntry).toBeGreaterThan(previousEntry);
    expect(proposalEntry).toBeLessThan(nextGroup);
    expect(source).toContainSource("case '/work-setting-taxonomy-proposal-test':");
  });
});
