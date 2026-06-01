import { useEffect, useMemo, useState } from 'react';

import type { NewPromptInput, PromptItem } from '@/features/prompts/model/promptTypes';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { createJsonStorage } from '@/shared/storage/jsonStorage';

const PROMPTS_KEY = 'xinyuexia_prompts_v1';
const PROMPT_RECYCLE_KEY = 'xinyuexia_prompt_recycle_v1';
const PROMPT_CATEGORIES_KEY = 'xinyuexia_prompt_categories_v1';
const UNCATEGORIZED = '未分类';
const PROMPT_CATEGORY_ALIASES: Record<string, string> = {
  大纲: '设定',
  提炼: '提炼剧情',
};
export const DEFAULT_PROMPT_CATEGORIES = ['脑洞', '设定', '细纲', '剧情链', '正文', '审核', '润色', '更新', '概要', '提炼剧情', UNCATEGORIZED];

export function normalizePromptCategoryName(category: string) {
  const trimmed = category.trim() || UNCATEGORIZED;
  return PROMPT_CATEGORY_ALIASES[trimmed] ?? trimmed;
}

export function isDefaultPromptCategory(category: string) {
  return DEFAULT_PROMPT_CATEGORIES.includes(normalizePromptCategoryName(category));
}

const PROMPTS_UPDATED_EVENT = APP_EVENTS.promptsUpdated;
const PLOT_CHAIN_2_SEED_ID = 'seed-plot-chain-2';

function buildPlotChain2PromptContent(referencePromptContent = '') {
  return [
    '你是小说剧情链策划助手。你的任务不是写正文，而是根据用户已关联的设定、角色、前文章纲、当前剧情链、生成规则和用户要求，生成适合这本小说继续推进的剧情点。',
    '',
    '【参考格式与规则】',
    referencePromptContent.trim()
      ? '优先参考同分类“剧情链”提示词的格式、分段方式和生成规则；但必须遵守下面的剧情链2硬规则，不能把候选写成连续章节。'
      : '参考标准剧情链提示词的格式：先理解关联内容和生成规则，再输出同一进度的多个候选剧情点。',
    referencePromptContent.trim() ? `以下是“剧情链”提示词可参考内容：\n${referencePromptContent.trim()}` : '',
    '',
    '【剧情链2硬规则】',
    '1. 必须贴合本书已有设定、人物关系、世界观、力量体系和当前基调，不要套用无关题材、无关人物或剧情库旧名字。',
    '2. 剧情点要像梗概，短而清楚，不要啰嗦，不要写成完整正文，不要写大量心理描写、环境描写或解释说明。',
    '3. 每个剧情点重点写“主角做了什么”“主角要怎么做”“这一步带来什么冲突或结果”。',
    '4. 如果是开头剧情点，要快速建立主角处境、目标、压力、金手指或核心冲突。',
    '5. 如果已经有剧情链，要直接承接上一条剧情点的后果、目标、悬念或冲突，不要重新开局。',
    '6. 每条剧情点都要有行动推进：发现、选择、试探、布局、交易、对抗、反击、暴露、转折、获得线索等都可以，但不要只写设定介绍。',
    '7. 变量必须替换成本书当前设定里的具体名称。比如主角叫林刻，就写林刻，不要写“主角”。找不到明确名称时，可以用“某势力”“某秘宝”等临时占位，但不要照抄其他小说专名。',
    '8. 同一批剧情点必须是“同一进度的多个备选方案”，不是连续章节。',
    '9. 当前剧情链为空时，输出的每个剧情点都必须能作为小说真正的第一章开场使用；要直接写主角首次进入故事时的处境、场景、压力、冲突或异变触发。',
    '10. 当前剧情链为空时，不要写成已经经过前情推进后的续写内容，不要默认系统已激活、奖励已发放、战斗已开始、学校已爆炸、任务已进行到中段。',
    '11. 当前剧情链已有内容时，输出的每个剧情点都必须能作为已选剧情链之后的同一个下一步使用；不要把编号1写成下一章、编号2写成再下一章。',
    '12. 每条候选之间不要互相承接。只有用户选中其中一条后，下一次继续生成才进入下一个进度。',
    '',
    '【输出格式】',
    '按用户要求的数量输出，连续编号；编号只代表候选序号，不代表章节顺序。',
    '每条只写一段剧情点正文，正文开头直接进入人物、事件、行动或冲突。',
    '不要写“标题：”。不要写小标题。不要写“剧情内容：”。不要写“变量替换：”。不要写“原型：”。',
    '每条后面可以用一行“AI评价：”简短说明这个剧情点的爽点、冲突、期待感或衔接价值。',
    '',
    '【示例格式】',
    '1. 林刻在校内异能测试中故意压低表现，只展示出普通觉醒资质，却暗中借系统提示锁定真正适合自己的修炼资源。老师和同学都以为他只是侥幸过线，林刻顺势隐藏实力，准备从资源分配环节切入。',
    'AI评价：这条剧情点让主角主动藏锋，同时把下一步目标落到资源争夺上，节奏清楚，方便继续衔接。',
    '',
    '2. 林刻发现测试名单被人提前调换，原本属于他的低风险路线变成了高危任务。他没有当场争辩，而是顺着对方安排进入任务区，准备反向利用这次陷害查出背后的人。',
    'AI评价：这条剧情点把外部陷害转成主角主动布局，既有冲突，也能带出后续反击。',
  ].filter(Boolean).join('\\n');
}

function getBaseSeedPrompts(referencePromptContent = ''): PromptItem[] {
  return [
    {
      id: PLOT_CHAIN_2_SEED_ID,
      name: '剧情链2',
      description: '参考“剧情链”提示词格式，根据关联设定和生成规则，生成同一进度的精炼剧情点候选。',
      category: '剧情链',
      promptType: 'novel',
      usageCount: 0,
      isFavorite: false,
      isLocked: false,
      createdAt: '2026/6/1 00:00:00',
      updatedAt: '2026/6/1 00:00:00',
      content: buildPlotChain2PromptContent(referencePromptContent),
    },
  ];
}

const SEEDED_PROMPTS = getBaseSeedPrompts();

function applySeedPrompts(prompts: PromptItem[]) {
  const plotChainReference = prompts.find((prompt) => (
    prompt.id !== PLOT_CHAIN_2_SEED_ID
    && normalizePromptCategoryName(prompt.category) === '剧情链'
    && prompt.name.trim() === '剧情链'
  ));
  const seeds = getBaseSeedPrompts(plotChainReference?.content ?? '');
  const synced = prompts.map((prompt) => {
    const seed = seeds.find((item) => item.id === prompt.id);
    if (!seed) return prompt;
    return {
      ...prompt,
      ...seed,
      usageCount: prompt.usageCount ?? seed.usageCount,
      isFavorite: prompt.isFavorite ?? seed.isFavorite,
      isLocked: prompt.isLocked ?? seed.isLocked,
      createdAt: prompt.createdAt ?? seed.createdAt,
    };
  });
  const existing = new Set(synced.map((prompt) => `${normalizePromptCategoryName(prompt.category)}::${prompt.name.trim()}`));
  const missing = seeds.filter((prompt) => !existing.has(`${normalizePromptCategoryName(prompt.category)}::${prompt.name}`));
  return missing.length > 0 ? [...missing, ...synced] : synced;
}

const promptsStorage = createJsonStorage<PromptItem[]>(PROMPTS_KEY, () => applySeedPrompts([]), {
  normalize: (value) => Array.isArray(value)
    ? applySeedPrompts((value as PromptItem[]).map((prompt) => ({
        ...prompt,
        category: normalizePromptCategoryName(prompt.category ?? UNCATEGORIZED),
      })))
    : applySeedPrompts([]),
  eventName: PROMPTS_UPDATED_EVENT,
});
const promptRecycleStorage = createJsonStorage<PromptItem[]>(PROMPT_RECYCLE_KEY, [], {
  normalize: (value) => Array.isArray(value)
    ? (value as PromptItem[]).map((prompt) => ({
        ...prompt,
        category: normalizePromptCategoryName(prompt.category ?? UNCATEGORIZED),
      }))
    : [],
  eventName: PROMPTS_UPDATED_EVENT,
});
function orderCategories(value: string[]) {
  const seen = new Set<string>();
  const cleaned = value
    .map((item) => normalizePromptCategoryName(item))
    .filter((item) => item.length > 0 && item !== '全部');
  const custom = cleaned.filter((item) => !DEFAULT_PROMPT_CATEGORIES.includes(item));
  return [...DEFAULT_PROMPT_CATEGORIES.slice(0, -1), ...custom, UNCATEGORIZED].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

const promptCategoriesStorage = createJsonStorage<string[]>(PROMPT_CATEGORIES_KEY, DEFAULT_PROMPT_CATEGORIES, {
  normalize: (value) => orderCategories(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : DEFAULT_PROMPT_CATEGORIES),
  eventName: PROMPTS_UPDATED_EVENT,
});

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

function createId() {
  return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(category: string) {
  return normalizePromptCategoryName(category);
}

export function readPromptSnapshot() {
  return {
    prompts: promptsStorage.read(),
    recycleBin: promptRecycleStorage.read(),
    categories: promptCategoriesStorage.read(),
  };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptItem[]>(() => promptsStorage.read());
  const [recycleBin, setRecycleBin] = useState<PromptItem[]>(() => promptRecycleStorage.read());
  const [categories, setCategories] = useState<string[]>(() => promptCategoriesStorage.read());

  useEffect(() => {
    const seededPrompts = promptsStorage.read();
    const rawPrompts = (() => {
      try {
        const raw = localStorage.getItem(PROMPTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const rawPlotChainReference = Array.isArray(rawPrompts)
      ? rawPrompts.find((prompt) => (
          prompt
          && typeof prompt === 'object'
          && (prompt as PromptItem).id !== PLOT_CHAIN_2_SEED_ID
          && normalizePromptCategoryName(String((prompt as PromptItem).category ?? UNCATEGORIZED)) === '剧情链'
          && String((prompt as PromptItem).name ?? '').trim() === '剧情链'
        ))
      : null;
    const currentSeeds = getBaseSeedPrompts(String((rawPlotChainReference as PromptItem | null)?.content ?? ''));
    const rawHasAllSeeds = currentSeeds.every((seed) => (
      Array.isArray(rawPrompts)
      && rawPrompts.some((prompt) => (
        prompt
        && typeof prompt === 'object'
        && normalizePromptCategoryName(String((prompt as PromptItem).category ?? UNCATEGORIZED)) === seed.category
        && String((prompt as PromptItem).name ?? '').trim() === seed.name
      ))
    ));
    const rawHasOutdatedSeed = Array.isArray(rawPrompts) && currentSeeds.some((seed) => (
      rawPrompts.some((prompt) => (
        prompt
        && typeof prompt === 'object'
        && (prompt as PromptItem).id === seed.id
        && (String((prompt as PromptItem).content ?? '') !== seed.content
          || String((prompt as PromptItem).description ?? '') !== seed.description)
      ))
    ));
    if (!rawHasAllSeeds || rawHasOutdatedSeed) promptsStorage.write(seededPrompts);

    const syncPromptState = () => {
      setPrompts(promptsStorage.read());
      setRecycleBin(promptRecycleStorage.read());
      setCategories(promptCategoriesStorage.read());
    };
    const syncPromptStorage = (event: StorageEvent) => {
      if (
        event.key
        && ![PROMPTS_KEY, PROMPT_RECYCLE_KEY, PROMPT_CATEGORIES_KEY].includes(event.key)
      ) {
        return;
      }
      syncPromptState();
    };

    window.addEventListener(PROMPTS_UPDATED_EVENT, syncPromptState);
    window.addEventListener('storage', syncPromptStorage);
    return () => {
      window.removeEventListener(PROMPTS_UPDATED_EVENT, syncPromptState);
      window.removeEventListener('storage', syncPromptStorage);
    };
  }, []);

  const categoryStats = useMemo(
    () =>
      categories.map((category) => ({
        category,
        count: prompts.filter((prompt) => prompt.category === category).length,
      })),
    [categories, prompts],
  );

  const persistPrompts = (next: PromptItem[]) => {
    setPrompts(next);
    promptsStorage.write(next);
  };

  const persistRecycle = (next: PromptItem[]) => {
    setRecycleBin(next);
    promptRecycleStorage.write(next);
  };

  const persistCategories = (next: string[]) => {
    const ordered = orderCategories(next);
    setCategories(ordered);
    promptCategoriesStorage.write(ordered);
  };

  const addPrompt = (input: NewPromptInput) => {
    const item: PromptItem = {
      id: createId(),
      name: input.name.trim(),
      description: input.description.trim(),
      content: input.content.trim(),
      category: normalizeCategory(input.category),
      promptType: input.promptType ?? 'novel',
      usageCount: 0,
      isFavorite: false,
      isLocked: false,
      createdAt: nowText(),
      updatedAt: nowText(),
    };
    persistPrompts([item, ...prompts]);
  };

  const updatePrompt = (id: string, updates: Partial<NewPromptInput>) => {
    persistPrompts(
      prompts.map((prompt) =>
        prompt.id === id
          ? {
              ...prompt,
              ...updates,
              category: normalizeCategory(updates.category ?? prompt.category),
              updatedAt: nowText(),
            }
          : prompt,
      ),
    );
  };

  const deletePrompt = (id: string) => {
    const target = prompts.find((prompt) => prompt.id === id);
    if (!target || target.isLocked) return;
    persistPrompts(prompts.filter((prompt) => prompt.id !== id));
    persistRecycle([{ ...target, deletedAt: new Date().toISOString() }, ...recycleBin]);
  };

  const restorePrompt = (id: string) => {
    const target = recycleBin.find((prompt) => prompt.id === id);
    if (!target) return;
    const { deletedAt: _deletedAt, ...restored } = target;
    persistRecycle(recycleBin.filter((prompt) => prompt.id !== id));
    persistPrompts([{ ...restored, updatedAt: nowText() }, ...prompts]);
  };

  const permanentDelete = (id: string) => {
    persistRecycle(recycleBin.filter((prompt) => prompt.id !== id));
  };

  const togglePin = (id: string) => {
    persistPrompts(prompts.map((prompt) => (
      prompt.id === id
        ? {
            ...prompt,
            isFavorite: !prompt.isFavorite,
            pinnedAt: prompt.isFavorite ? undefined : new Date().toISOString(),
          }
        : prompt
    )));
  };

  const toggleLock = (id: string) => {
    persistPrompts(prompts.map((prompt) => (prompt.id === id ? { ...prompt, isLocked: !prompt.isLocked } : prompt)));
  };

  const usePrompt = (id: string) => {
    persistPrompts(prompts.map((prompt) => (
      prompt.id === id ? { ...prompt, usageCount: (prompt.usageCount ?? 0) + 1, updatedAt: nowText() } : prompt
    )));
  };

  const addCategory = (category: string) => {
    const trimmed = normalizeCategory(category);
    if (categories.includes(trimmed)) return;
    persistCategories([...categories.filter((item) => item !== UNCATEGORIZED), trimmed, UNCATEGORIZED]);
  };

  const removeCategory = (category: string) => {
    if (isDefaultPromptCategory(category)) return;
    persistCategories(categories.filter((item) => item !== category));
    persistPrompts(prompts.map((prompt) => (
      prompt.category === category ? { ...prompt, category: UNCATEGORIZED, updatedAt: nowText() } : prompt
    )));
  };

  return {
    prompts,
    recycleBin,
    categories,
    categoryStats,
    addPrompt,
    updatePrompt,
    deletePrompt,
    restorePrompt,
    permanentDelete,
    togglePin,
    toggleLock,
    usePrompt,
    addCategory,
    removeCategory,
  };
}
