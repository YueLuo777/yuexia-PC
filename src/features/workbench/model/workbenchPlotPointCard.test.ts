import { describe, expect, it } from 'vitest';

import {
  getPlotPointDisplayText,
  getPlotPointScoreColorClass,
  prepareCollapsedPlotPointCard,
} from './workbenchPlotPointCard';

describe('workbenchPlotPointCard', () => {
  it('renames imported plot-point titles and extracts the average score', () => {
    const card = prepareCollapsedPlotPointCard({
      title: '导入剧情点 3',
      adapted: [
        '第3个剧情点（第21-30章）',
        '#评分 <fs> 新颖度：87 冲突强度：84 情绪强度：82 期待感：89 平均分：86 </fs>',
        '#剧情梗概',
        '王林被安排在恒岳派新手村，开始在底层环境里寻找任何能翻身的机会。',
      ].join('\n'),
    });

    expect(card.title).toBe('剧情点 3');
    expect(card.averageScore).toBe('86');
    expect(card.previewText).toBe('王林被安排在恒岳派新手村，开始在底层环境里寻找任何能翻身的机会。');
  });

  it('uses the gold score color for scores of 90 and above', () => {
    expect(getPlotPointScoreColorClass('90')).toBe('text-yellow-500');
  });

  it('removes the repeated title prefix from the collapsed preview text', () => {
    const card = prepareCollapsedPlotPointCard({
      title: '重生觉醒',
      adapted: '重生觉醒，七十二小时倒计时剧情内容：林刻在高考考场上猛然惊醒。',
    });

    expect(card.previewText).toBe('林刻在高考考场上猛然惊醒。');
  });

  it('removes the leading plot content label after title cleanup', () => {
    const card = prepareCollapsedPlotPointCard({
      title: '重生觉醒：倒计时72小时',
      adapted: '重生觉醒：倒计时72小时 剧情内容：林刻在高考考场惊醒。',
    });

    expect(card.previewText).toBe('林刻在高考考场惊醒。');
  });

  it('removes short AI-generated scene labels before the preview body', () => {
    const card = prepareCollapsedPlotPointCard({
      title: '重生觉醒',
      adapted: '系统绑定：林刻在高考考场惊醒，发现自己重生回三天前。',
    });

    expect(card.previewText).toBe('林刻在高考考场惊醒，发现自己重生回三天前。');
  });

  it('keeps the protagonist name when the body starts with an action clause', () => {
    const card = prepareCollapsedPlotPointCard({
      title: '林刻在考场醒来',
      adapted: '林刻在考场醒来，发现自己重生回高考前三天。',
    });

    expect(card.previewText).toBe('林刻在考场醒来，发现自己重生回高考前三天。');
  });

  it('does not prepend the candidate title back into the body preview', () => {
    expect(
      getPlotPointDisplayText({
        title: '高考灵气潮汐爆发',
        previewText: '林刻考场异象惊动超管局，高考当天，他坐在考场内吸收灵气。',
      }),
    ).toBe('林刻考场异象惊动超管局，高考当天，他坐在考场内吸收灵气。');
  });
});
