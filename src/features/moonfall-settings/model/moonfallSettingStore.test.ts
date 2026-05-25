import { describe, expect, it } from 'vitest';

import type { MoonfallReviewItem, MoonfallState } from './moonfallSettingTypes';
import {
  buildEmbeddingText,
  buildMoonfallRagBundle,
  buildMoonfallRagContext,
  createSettingFromReview,
  hashEmbedding,
  normalizeAiReviewItems,
  parseAiJsonCards,
  retrieveRelevantMoonfallSettings,
} from './moonfallSettingStore';

function reviewDraft(patch: Partial<MoonfallReviewItem> = {}): MoonfallReviewItem {
  return {
    id: 'review-1',
    selected: true,
    title: '月落现象',
    category: '世界观',
    subcategory: '天象',
    tags: ['月亮', '月落'],
    keywords: ['月亮坠落', '无尽长夜'],
    summary: '月亮坠落会引发邪气扩散。',
    originalText: '夜晚月亮坠落，邪气扩散。',
    organizedText: '每到夜晚，月亮坠落会带来邪气扩散。',
    relatedItems: ['邪气'],
    status: '已整理',
    confidence: 0.9,
    ...patch,
  };
}

function stateWithSettings(settings: MoonfallState['settings']): MoonfallState {
  return {
    projects: [{
      id: 'project-a',
      userId: 'local-user',
      name: '测试项目',
      description: '',
      createdAt: '',
      updatedAt: '',
    }],
    activeProjectId: 'project-a',
    sources: [],
    sourceChunks: [],
    settings,
    relations: [],
    retrievalLogs: [],
    importTasks: [],
    config: {
      aiModelId: '',
      embeddingModelId: '',
      embeddingBaseUrl: '',
      embeddingApiKey: '',
      embeddingModel: '',
      embeddingDimension: 1536,
      retrievalLimit: 10,
      similarityThreshold: 0.2,
      autoRag: false,
      ragTemplate: '续写模式',
    },
  };
}

describe('moonfallSettingStore', () => {
  it('repairs common AI JSON punctuation before parsing cards', () => {
    const cards = parseAiJsonCards(`AI结果如下：
[
  {
    “title”： “龙夏国”，
    “category”： “势力组织”，
    “tags”： [“龙夏”， “王权”]，
    “summary”： “龙夏国由炎龙帝君建立。”
  }
]`);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      title: '龙夏国',
      category: '势力组织',
      summary: '龙夏国由炎龙帝君建立。',
    });
  });

  it('normalizes extracted AI cards and keeps them pending before review', () => {
    const items = normalizeAiReviewItems([{
      title: '阴阳阙',
      category: '国家与地理',
      tags: '阴阳阙、月亮',
      keywords: ['日升月落'],
      summary: '天上的阴阳建筑。',
      originalText: '阴阳阙悬在天上。',
      organizedText: '阴阳阙负责维持日升月落。',
      confidence: 0.88,
    }]);

    const setting = createSettingFromReview('project-a', items[0]);

    expect(setting.category).toBe('地点区域');
    expect(setting.status).toBe('待确认');
    expect(setting.isVerified).toBe(false);
    expect(setting.allowRag).toBe(false);
    expect(setting.embeddingText).toContain('标题：阴阳阙');
  });

  it('retrieves only verified and allowed settings by default', () => {
    const verified = {
      ...createSettingFromReview('project-a', reviewDraft()),
      id: 'setting-verified',
      isVerified: true,
      allowRag: true,
      status: '已整理' as const,
      embeddingVector: hashEmbedding('月亮坠落 邪气 月落', 128),
      embeddingText: buildEmbeddingText(createSettingFromReview('project-a', reviewDraft())),
    };
    const pending = {
      ...createSettingFromReview('project-a', reviewDraft({ title: '待确认月亮' })),
      id: 'setting-pending',
      isVerified: false,
      allowRag: false,
      embeddingVector: hashEmbedding('月亮坠落 待确认', 128),
    };
    const results = retrieveRelevantMoonfallSettings(stateWithSettings([pending, verified]), {
      projectId: 'project-a',
      userId: 'local-user',
      query: '月亮坠落',
      limit: 10,
    });

    expect(results.map((result) => result.item.id)).toEqual(['setting-verified']);
  });

  it('keeps retrieval isolated by project and user', () => {
    const local = {
      ...createSettingFromReview('project-a', reviewDraft({ title: '本项目设定' })),
      id: 'setting-local',
      isVerified: true,
      allowRag: true,
      status: '已整理' as const,
      userId: 'local-user',
      embeddingVector: hashEmbedding('月亮坠落', 64),
    };
    const otherUser = {
      ...local,
      id: 'setting-other-user',
      userId: 'other-user',
    };
    const otherProject = {
      ...local,
      id: 'setting-other-project',
      projectId: 'project-b',
    };

    const results = retrieveRelevantMoonfallSettings(stateWithSettings([local, otherUser, otherProject]), {
      projectId: 'project-a',
      userId: 'local-user',
      query: '月亮坠落',
    });

    expect(results.map((result) => result.item.id)).toEqual(['setting-local']);
  });

  it('builds a writing context and retrieval log from results', () => {
    const item = {
      ...createSettingFromReview('project-a', reviewDraft()),
      id: 'setting-1',
      isVerified: true,
      allowRag: true,
      status: '已整理' as const,
      embeddingVector: hashEmbedding('月亮坠落 邪气', 96),
    };
    const state = stateWithSettings([item]);
    const bundle = buildMoonfallRagBundle(state, {
      projectId: 'project-a',
      userId: 'local-user',
      query: '月亮坠落',
      purpose: 'writing',
    });

    expect(bundle.results).toHaveLength(1);
    expect(bundle.contextText).toContain('以下是本次写作必须参考的设定资料');
    expect(bundle.contextText).toContain('【世界观】');
    expect(bundle.log.retrievedSettingIds).toEqual(['setting-1']);
    expect(buildMoonfallRagContext([])).toBe('');
  });
});
