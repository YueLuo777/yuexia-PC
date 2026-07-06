import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_BRAINSTORM_TAB,
  addWorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { HotspotItem } from '@/features/hotspots/model/hotspotTypes';

function formatHotspotLine(item: HotspotItem) {
  return `${item.sourceName} #${item.rank} ${item.title}${item.heat ? `（热度：${item.heat}）` : ''}`;
}

export function buildHotspotSuitabilityPrompt(item: HotspotItem) {
  return `你是网文策划编辑。请分析这个热点是否适合改编成虚构小说题材。

热点：
${formatHotspotLine(item)}

要求：
1. 不要复述新闻，不要影射真实人物，不要照搬真实事件。
2. 只提炼背后的情绪、冲突、人群关系和商业爽点。
3. 给出小说适合度，分数范围 0-100。
4. 判断适合写成长篇网文、短篇脑洞，还是只适合借情绪。

请按下面格式输出：
小说适合度：
适合类型：
核心情绪：
可写冲突：
人物关系：
开篇钩子：
风险提醒：
推荐改编方案：`;
}

export function buildHotspotCombinationPrompt(items: HotspotItem[]) {
  const lines = items.map((item) => `- ${formatHotspotLine(item)}`).join('\n');
  return `你是网文选题策划。请把下面多个热点组合成一个新的小说题材，不要复述新闻，不要影射真实人物。

选中的热点：
${lines}

目标：
1. 提炼共同情绪和社会冲突。
2. 组合成一个新的小说题材，适合长篇网文。
3. 给出主角、世界观、核心矛盾、前三章钩子和 20 章短大纲。
4. 标出哪些热点只借情绪，哪些热点可以转成设定。

请输出：
题材名称：
一句话卖点：
适合频道/类型：
主角设定：
核心矛盾：
爽点设计：
风险规避：
前三章钩子：
20章短大纲：`;
}

export function createHotspotBrainstormEntry(title: string, content: string): WorkbenchLibraryEntry {
  return {
    id: `hotspot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tab: WORKBENCH_BRAINSTORM_TAB,
    title,
    content,
    updatedAt: new Date().toLocaleString('zh-CN'),
  };
}

export function saveHotspotBrainstorm(title: string, content: string) {
  return addWorkbenchLibraryEntry(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, WORKBENCH_BRAINSTORM_TAB, title, content);
}
