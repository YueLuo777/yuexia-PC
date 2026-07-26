export type StandardStageId = 'prepare' | 'settings' | 'creation' | 'audit';
export type PreparationView = 'generate' | 'library';
export type CreationView = 'outline' | 'writing';
export type SettingGenerationStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface StandardTestBook {
  title: string;
  genre: string;
}

export interface StandardTestBrainstorm {
  id: string;
  title: string;
  summary: string;
  content: string;
}

export interface StandardTestSettingField {
  id: string;
  category: string;
  label: string;
  generated: string;
}

export interface StandardTestChapter {
  number: number;
  title: string;
  outlines: string[];
  selectedVersion: number;
  body: string;
  auditResult: string;
}

export const STANDARD_FOUR_STAGE_STORAGE_KEY = 'xinyuexia_standard_four_stage_test_v2';

export const STANDARD_STAGES: Array<{ id: StandardStageId; number: number; title: string }> = [
  { id: 'prepare', number: 1, title: '准备阶段' },
  { id: 'settings', number: 2, title: '设定阶段' },
  { id: 'creation', number: 3, title: '创作阶段' },
  { id: 'audit', number: 4, title: '审核阶段' },
];

export const DEFAULT_BRAINSTORMS: StandardTestBrainstorm[] = [
  {
    id: 'brainstorm-example-1',
    title: '九重天劫',
    summary: '底层少年能看见功法缺陷，从修补残篇开始逆袭。',
    content:
      '林刻进入青岳宗后，发现自己能直接看见功法、阵法和法宝中的缺陷。他从修补一门无人问津的残缺功法起步，在宗门竞争和九重天灾中逐层成长，并逐渐发现所谓天劫其实是上界筛选修士的工具。',
  },
  {
    id: 'brainstorm-example-2',
    title: '万界商途',
    summary: '主角经营一家能连通不同修仙世界的商铺。',
    content:
      '主角继承一间破旧商铺，夜间却能连接不同修仙世界。他利用各界资源差价经营商路，同时必须处理交易规则、势力争夺和跨界灾难。',
  },
];

export const STANDARD_SETTING_FIELDS: StandardTestSettingField[] = [
  {
    id: 'novel-position',
    category: '作品设定',
    label: '小说定位',
    generated: '玄幻升级长篇，核心看点是主角识别并修补万物缺陷，以小优势滚成大势。',
  },
  {
    id: 'main-conflict',
    category: '作品设定',
    label: '主线冲突',
    generated: '主角要摆脱底层命运，却不断触碰宗门和上界维持旧秩序的利益。',
  },
  {
    id: 'world-background',
    category: '世界设定',
    label: '世界背景',
    generated: '九重天域由下至上排列，每层天域都由不同宗门和王朝控制，越往上修炼资源越集中。',
  },
  {
    id: 'world-rules',
    category: '世界设定',
    label: '世界运行规则',
    generated: '修士通过功法吸收灵气，突破必须同时满足境界积累、资源和心境条件，失败会损伤根基。',
  },
  {
    id: 'protagonist-profile',
    category: '人物设定',
    label: '主角基础档案',
    generated: '林刻，十八岁，外冷内稳，做事先观察后出手，当前目标是通过青岳宗外门考核。',
  },
  {
    id: 'protagonist-ability',
    category: '人物设定',
    label: '主角能力',
    generated: '可以看见目标当前最关键的一处缺陷，但不能直接给出完整解决办法，必须自行验证和修补。',
  },
  {
    id: 'power-system',
    category: '力量体系',
    label: '修炼境界',
    generated: '炼体、聚气、筑基、金丹、元婴、化神六个大境界，每境分前中后三期。',
  },
  {
    id: 'first-volume',
    category: '剧情规划',
    label: '第一卷规划',
    generated: '主角进入青岳宗，从修补残缺功法开始积累优势，卷末揭开第一次天劫异常并进入内门。',
  },
];

export function createInitialChapters(): StandardTestChapter[] {
  return [
    { number: 1, title: '山门测试', outlines: [], selectedVersion: 0, body: '', auditResult: '' },
    { number: 2, title: '残缺功法', outlines: [], selectedVersion: 0, body: '', auditResult: '' },
    { number: 3, title: '第一次修炼', outlines: [], selectedVersion: 0, body: '', auditResult: '' },
  ];
}

export function buildBrainstorm(book: StandardTestBook, request: string): StandardTestBrainstorm {
  const direction = request.trim() || '主角从底层起步，依靠独特优势持续成长';
  return {
    id: `brainstorm-${Date.now()}`,
    title: book.title,
    summary: `${book.genre}方向：${direction}`,
    content: `《${book.title}》是一部${book.genre}小说。${direction}。故事从一次改变主角命运的意外开始，逐步扩大到势力冲突和世界真相，并为长期连载保留清晰的成长目标。`,
  };
}

export function buildChapterOutlines(chapterNumber: number, versionCount: number, requirement: string) {
  const extra = requirement.trim() ? `并满足“${requirement.trim()}”` : '并保持升级节奏紧凑';
  return Array.from({ length: versionCount }, (_, index) =>
    `版本${index + 1}：第${chapterNumber}章承接上一章结果，主角遇到新的阻碍，利用已建立的能力线索解决问题，${extra}。章末留下能自然进入下一章的钩子。`,
  );
}

export function buildChapterBody(chapter: StandardTestChapter) {
  const outline = chapter.outlines[chapter.selectedVersion] ?? '主角开始处理眼前的新难题。';
  return `晨雾尚未散尽，林刻已经站在青岳宗的山门前。\n\n${outline}\n\n石阶尽头的试功碑布满裂纹。其他弟子只看见岁月留下的痕迹，林刻眼中却浮现出一行清晰提示。`;
}
