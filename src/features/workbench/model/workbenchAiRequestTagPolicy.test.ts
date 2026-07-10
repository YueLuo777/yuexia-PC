import { describe, expect, it } from 'vitest';

import {
  WORKBENCH_AI_REQUEST_TAG_POLICIES,
  joinAiRequestSections,
  wrapAiRequestTag,
} from './workbenchAiRequestTagPolicy';

describe('workbench AI request tag policy', () => {
  it('covers every AI entry shown in the creation toolbar', () => {
    expect(WORKBENCH_AI_REQUEST_TAG_POLICIES.map((item) => item.label)).toEqual([
      '脑洞',
      '大纲',
      '章纲',
      '正文',
      '审核',
      '综合点评',
      '润色',
      '更新状态',
      '生成梗概',
    ]);
  });

  it('keeps brainstorm untagged but requires XML-style tags for material-heavy chains', () => {
    const policyByLabel = new Map(WORKBENCH_AI_REQUEST_TAG_POLICIES.map((item) => [item.label, item]));

    expect(policyByLabel.get('脑洞')).toMatchObject({
      useXmlTags: false,
      tags: [],
    });

    ['大纲', '章纲', '正文', '审核', '综合点评', '润色', '更新状态', '生成梗概'].forEach((label) => {
      const policy = policyByLabel.get(label);
      expect(policy?.useXmlTags).toBe(true);
      expect(policy?.tags.length).toBeGreaterThan(0);
      expect(policy?.reason).toBeTruthy();
    });
  });

  it('uses task-specific tag names so reference material and user instructions stay separate', () => {
    const policyByLabel = new Map(WORKBENCH_AI_REQUEST_TAG_POLICIES.map((item) => [item.label, item]));

    expect(policyByLabel.get('大纲')?.tags).toEqual(['待处理设定', '关联脑洞', '修改要求']);
    expect(policyByLabel.get('章纲')?.tags).toEqual([
      '关联资料',
      '设定资料',
      '角色资料',
      '前文章纲',
      '剧情链',
      '本章要求',
    ]);
    expect(policyByLabel.get('正文')?.tags).toEqual(['本章章纲', '前文正文', '前文梗概', '关联设定', '写作要求']);
    expect(policyByLabel.get('审核')?.tags).toEqual(['待审核正文', '关联章纲', '审核要求']);
    expect(policyByLabel.get('综合点评')?.tags).toEqual(['待点评正文', '关联章纲', '点评要求']);
    expect(policyByLabel.get('润色')?.tags).toEqual(['待润色正文', '关联章纲', '润色要求']);
    expect(policyByLabel.get('更新状态')?.tags).toEqual(['待提取正文', '已有状态', '状态更新要求']);
    expect(policyByLabel.get('生成梗概')?.tags).toEqual(['待梗概正文', '梗概要求']);
  });

  it('wraps sent materials in readable XML-style sections', () => {
    expect(wrapAiRequestTag('待处理设定', '世界观正文', { 标题: '灵气 & 旧城 "A"' })).toBe(
      '<待处理设定 标题="灵气 &amp; 旧城 &quot;A&quot;">\n世界观正文\n</待处理设定>',
    );
    expect(wrapAiRequestTag('修改要求', '   ')).toBe('');
    expect(joinAiRequestSections(['', '<关联脑洞>内容</关联脑洞>', '  <修改要求>改节奏</修改要求>  '])).toBe(
      '<关联脑洞>内容</关联脑洞>\n\n<修改要求>改节奏</修改要求>',
    );
  });
});
