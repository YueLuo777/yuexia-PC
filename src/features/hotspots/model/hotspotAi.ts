import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_BRAINSTORM_TAB,
  addWorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import type { HotspotItem } from '@/features/hotspots/model/hotspotTypes';

export const HOTSPOT_ANALYSIS_SYSTEM_PROMPT = `你是专业网络小说选题策划编辑，擅长把现实热点转译成虚构网文题材。

你的任务：
1. 根据用户提供的热点，提炼它背后的情绪、矛盾、人群关系、时代焦虑和爽点。
2. 结合网络小说类型进行改编，可选都市、玄幻、科幻、仙侠、灵异、悬疑、末世、系统流、无限流、竞技、娱乐圈等方向。
3. 绝不复述新闻，绝不影射真实人物，绝不照搬真实事件；只能抽象成虚构设定、人物关系和剧情矛盾。
4. 优先判断这个热点适不适合写成长篇网文，其次判断是否适合短篇脑洞或只适合借情绪。
5. 输出要面向作者，给出可以直接进入大纲或脑洞库的小说题材方案。

输出重点：
- 核心卖点：一句话说明读者为什么会点开。
- 适合类型：给出 2-3 个最合适的网文类型，并说明理由。
- 主角设定：身份、欲望、短板、成长方向。
- 金手指：系统、能力、道具、规则优势或信息差，必须和热点情绪相关。
- 世界观：把热点改造成虚构世界规则、行业生态、修炼体系、科技制度或灵异规则。
- 核心冲突：主角和谁冲突，冲突为什么不可调和。
- 爽点链路：从开局受压到反击升级的连续爽点。
- 开篇钩子：给出一个适合第一章开头的强冲突场景。
- 风险规避：说明哪些真实元素必须架空，怎样避免映射真实人物或真实事件。
- 可写性评分：0-100 分，并解释扣分点。`;

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
一句话题材：
核心卖点：
适合类型：
主角设定：
金手指：
世界观：
核心情绪：
核心冲突：
爽点链路：
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
