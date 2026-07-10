import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock3,
  Database,
  FileText,
  Flag,
  FolderTree,
  Gem,
  Landmark,
  MapPinned,
  ScrollText,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PromptLibrary = {
  id: string;
  path: string;
  title: string;
  icon: LucideIcon;
  tone: string;
  purpose: string;
  files: string[];
  sections: string[];
  sample: string[];
  readBy: string[];
  updatedBy: string[];
};

type PromptWorkflow = {
  id: string;
  title: string;
  trigger: string;
  reads: string[];
  writes: string[];
  result: string;
};

const promptLibraries: PromptLibrary[] = [
  {
    id: 'core',
    path: '00_核心设定',
    title: '核心设定库',
    icon: Sparkles,
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    purpose: '存放整本书不能随便变的底层信息，是所有生成流程最先读取的资料库。',
    files: ['创意白皮书.md', '写作风格指南.md', '整书大纲.md', '时间线发展记录.md', '审核规则.md'],
    sections: ['故事类型', '核心创意', '主角设定', '世界观', '核心设定红线', '主线剧情', '爽点设计', '风格定位'],
    sample: ['## 核心设定', '### 主角设定', '### 世界观', '### 核心设定红线'],
    readBy: ['一键生成细纲', '一键AI续写章节', '一键章节发布', '一键导入已有小说'],
    updatedBy: ['项目初始化', '章节发布后的时间线整理', '导入已有小说后的全局归档'],
  },
  {
    id: 'characters',
    path: '01_人物列表库',
    title: '人物档案库',
    icon: Users,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    purpose: '每个重要人物一份档案，用来保持身份、人设、能力、关系和章节后的状态变化。',
    files: ['_人物索引.md', '主角_XXX.md', '女主_XXX.md', '重要配角_XXX.md'],
    sections: ['基本信息', '表象/真相', '人设核心', '性格特征', '能力设定', '人物关系', '情感弧光', '状态更新记录'],
    sample: ['# 人物档案', '## 基本信息', '## 人设核心', '## 人物关系', '## 状态更新记录'],
    readBy: ['一键生成细纲', '一键AI续写章节', '章节审核'],
    updatedBy: ['一键章节发布', '一键导入已有小说', '人物出场或状态变化后'],
  },
  {
    id: 'factions',
    path: '02_势力设定库',
    title: '势力档案库',
    icon: Landmark,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    purpose: '记录宗门、家族、组织、公司、敌对阵营等群体资料，防止势力关系和立场写乱。',
    files: ['势力名.md', '宗门_XXX.md', '反派组织_XXX.md'],
    sections: [
      '基本信息',
      '势力特点',
      '政治/组织结构',
      '主要人物',
      '势力关系',
      '对主角策略',
      '核心问题/矛盾',
      '状态更新记录',
    ],
    sample: ['# 势力档案', '## 基本信息', '## 组织结构', '## 势力关系', '## 状态更新记录'],
    readBy: ['一键生成细纲', '一键AI续写章节', '势力冲突剧情'],
    updatedBy: ['一键章节发布', '导入已有小说后的势力归档'],
  },
  {
    id: 'maps',
    path: '03_地图库',
    title: '地点场景库',
    icon: MapPinned,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    purpose: '把世界地图、城市、秘境、战场和反复出现的场景分开记录，方便生成时调用空间信息。',
    files: ['地点名.md', '城市_XXX.md', '秘境_XXX.md'],
    sections: ['基本信息', '地点描述', '地理位置', '重要地标', '历史事件', '当前状态', '状态更新记录'],
    sample: ['# 地点档案', '## 地点描述', '## 重要地标', '## 当前状态', '## 状态更新记录'],
    readBy: ['一键生成细纲', '一键AI续写章节', '地图切换剧情'],
    updatedBy: ['一键章节发布', '新地图开启后', '导入已有小说后的地点归档'],
  },
  {
    id: 'items',
    path: '05_重要物品库',
    title: '道具资源库',
    icon: Gem,
    tone: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
    purpose: '记录功法、武器、资源、令牌、传承资格等能推动剧情或影响战力的物件。',
    files: ['物品名.md', '功法_XXX.md', '关键道具_XXX.md'],
    sections: ['基本信息', '物品描述', '效果/功能', '来历', '归属变化', '当前状态', '相关伏笔', '状态更新记录'],
    sample: ['# 物品档案', '## 效果/功能', '## 归属变化', '## 相关伏笔', '## 状态更新记录'],
    readBy: ['一键生成细纲', '一键AI续写章节', '奖励和战斗剧情'],
    updatedBy: ['一键章节发布', '物品易主或消耗后', '导入已有小说后的物品归档'],
  },
  {
    id: 'outlines',
    path: '06_大纲细纲库',
    title: '细纲库',
    icon: BookOpen,
    tone: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    purpose: '存放具体章节或批量章节的细纲，是正文生成前最直接的剧情指令。',
    files: ['第XXX章细纲.md', '第001-010章细纲.md'],
    sections: ['章节目标', '核心事件', '爽点安排', '伏笔处理', '章末钩子', '节奏类型'],
    sample: ['# 第XXX章细纲', '## 本章目标', '## 关键剧情', '## 章末钩子'],
    readBy: ['一键AI续写章节', '章节审核', '章节发布'],
    updatedBy: ['一键生成细纲', '人工调整细纲后'],
  },
  {
    id: 'foreshadow',
    path: '07_伏笔库',
    title: '伏笔库',
    icon: Flag,
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    purpose: '集中管理已埋、已收和总表，生成新剧情时提醒 AI 不要忘记铺垫与回收。',
    files: ['已埋伏笔.md', '已收伏笔.md', '伏笔总表.md'],
    sections: ['伏笔名称', '埋设章节', '埋设内容', '预计回收', '重要性', '回收章节', '效果评估'],
    sample: ['# 已埋伏笔', '| 伏笔名称 | 埋设章节 | 预计回收 |', '# 伏笔总表'],
    readBy: ['一键生成细纲', '一键AI续写章节', '章节审核'],
    updatedBy: ['一键章节发布', '伏笔回收后', '一键导入已有小说'],
  },
  {
    id: 'records',
    path: '08_更新记录',
    title: '更新记录库',
    icon: Clock3,
    tone: 'border-slate-200 bg-slate-100 text-slate-700',
    purpose: '记录导入进度和设定变更原因，方便回头追查某个资料为什么被修改。',
    files: ['导入进度.md', '全局设定更新日志.md', '章节发布记录.md'],
    sections: ['更新时间', '关联章节', '变化对象', '变化原因', '后续注意'],
    sample: ['# 全局设定更新日志', '## 第XXX章发布后', '- 变化对象：'],
    readBy: ['一键导入已有小说', '人工复盘', '问题追查'],
    updatedBy: ['一键章节发布', '一键导入已有小说', '人工修订设定后'],
  },
  {
    id: 'summary',
    path: '09_剧情摘要库',
    title: '剧情摘要库',
    icon: ScrollText,
    tone: 'border-lime-200 bg-lime-50 text-lime-700',
    purpose: '把正文压缩成可长期读取的摘要，解决写到后期上下文太长的问题。',
    files: ['00_全书剧情主线.md', '第一卷摘要.md', '第001-010章摘要.md'],
    sections: ['全书主线', '每10章分段摘要', '卷摘要', '主角状态变化线', '重要人物登场/退场', '待回收伏笔'],
    sample: ['# 00_全书剧情主线', '## 主角身份/状态变化线', '## 核心冲突/阴谋事件线'],
    readBy: ['一键生成细纲', '一键AI续写章节', '长篇续写'],
    updatedBy: ['一键章节发布', '一键初始化摘要系统', '一键导入已有小说'],
  },
];

const promptWorkflows: PromptWorkflow[] = [
  {
    id: 'init',
    title: '项目初始化',
    trigger: '根据创意白皮书建立小说资料库骨架。',
    reads: ['创意白皮书模板.md', '全局创作规范.md'],
    writes: [
      '00_核心设定',
      '01_人物列表库',
      '02_势力设定库',
      '03_地图库',
      '05_重要物品库',
      '07_伏笔库',
      '09_剧情摘要库',
    ],
    result: '先搭好库，后续所有提示词都围绕这些库读写。',
  },
  {
    id: 'outline',
    title: '一键生成细纲',
    trigger: '准备写下一批章节前调用。',
    reads: ['剧情摘要库', '整书大纲.md', '创意白皮书.md', '伏笔库', '出场人物档案'],
    writes: ['06_大纲细纲库'],
    result: '生成可直接喂给正文续写的章节细纲。',
  },
  {
    id: 'draft',
    title: '一键AI续写章节',
    trigger: '有细纲后生成正文。',
    reads: [
      '时间线发展记录.md',
      '当前细纲',
      '剧情摘要库',
      '前1章正文',
      '写作风格指南.md',
      '相关人物档案',
      '审核规则.md',
    ],
    writes: ['正文', '正文_修改版'],
    result: '生成新章节正文，并尽量贴合既有设定和风格。',
  },
  {
    id: 'publish',
    title: '一键章节发布',
    trigger: '确认章节可进入正式正文后调用。',
    reads: ['最新章节正文', '当前细纲', '人物/势力/地点/物品档案', '伏笔库'],
    writes: [
      '人物状态',
      '势力状态',
      '地点状态',
      '物品状态',
      '伏笔库',
      '时间线发展记录.md',
      '08_更新记录',
      '09_剧情摘要库',
    ],
    result: '把章节造成的变化回写到各个资料库。',
  },
  {
    id: 'import',
    title: '一键导入已有小说',
    trigger: '把旧小说迁移进资料库时调用。',
    reads: ['已有正文', '导入规范', '创意白皮书模板.md'],
    writes: ['人物档案', '势力档案', '地点档案', '物品档案', '伏笔库', '整书大纲.md', '导入进度.md'],
    result: '从旧正文里抽出可继续写作的结构化资料。',
  },
];

export function PromptLibraryStructureTestPage() {
  const [activeLibraryId, setActiveLibraryId] = useState(promptLibraries[0].id);
  const activeLibrary = useMemo(
    () => promptLibraries.find((library) => library.id === activeLibraryId) ?? promptLibraries[0],
    [activeLibraryId],
  );
  const ActiveIcon = activeLibrary.icon;

  return (
    <div className="h-full overflow-y-auto bg-[#F6F8FB] p-5 text-slate-900">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                <FolderTree className="h-4 w-4" />
                所有提示词
              </div>
              <h1 className="text-2xl font-black tracking-normal text-slate-950">旧提示词会创建什么库，库里怎么写</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                整理路径 E:\0yuexia\0,月下PC\提示词
                下的工作流：左侧是会创建的资料库，中间是模板字段和写法，右侧是会被谁读取、会被谁更新。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xl font-black text-slate-900">{promptLibraries.length}</div>
                <div className="text-xs font-bold text-slate-400">资料库</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xl font-black text-slate-900">{promptWorkflows.length}</div>
                <div className="text-xs font-bold text-slate-400">工作流</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xl font-black text-slate-900">3</div>
                <div className="text-xs font-bold text-slate-400">读写区</div>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
            <Workflow className="h-4 w-4 text-cyan-600" />
            提示词工作流
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
            {promptWorkflows.map((workflow) => (
              <div key={workflow.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">{workflow.title}</div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-cyan-600" />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{workflow.trigger}</p>
                <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                  {workflow.result}
                </div>
              </div>
            ))}
          </div>
        </section>

        <main className="grid min-h-[680px] grid-cols-[280px_minmax(0,1fr)_360px] gap-4">
          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-2 px-1 text-sm font-black text-slate-800">
              <Database className="h-4 w-4 text-cyan-600" />
              会创建的资料库
            </div>
            <div className="space-y-2">
              {promptLibraries.map((library) => {
                const Icon = library.icon;
                const active = library.id === activeLibrary.id;
                return (
                  <button
                    key={library.id}
                    type="button"
                    onClick={() => setActiveLibraryId(library.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-cyan-200 hover:bg-cyan-50/50'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${active ? library.tone : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-slate-900">{library.path}</span>
                      <span className="block truncate text-xs font-bold text-slate-400">{library.title}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border ${activeLibrary.tone}`}>
                  <ActiveIcon className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-sm font-black text-cyan-700">{activeLibrary.path}</div>
                  <h2 className="text-xl font-black tracking-normal text-slate-950">{activeLibrary.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{activeLibrary.purpose}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  库里有哪些文件
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLibrary.files.map((file) => (
                    <span
                      key={file}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <ClipboardList className="h-4 w-4 text-cyan-600" />
                  模板字段
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLibrary.sections.map((section) => (
                    <span
                      key={section}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <ScrollText className="h-4 w-4 text-cyan-600" />
                  库里怎么写
                </div>
                <div className="rounded-lg border border-slate-900 bg-[#FBFCFE] p-4 font-mono text-sm leading-7 text-slate-800">
                  {activeLibrary.sample.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <BookOpen className="h-4 w-4 text-cyan-600" />
                会被谁读取
              </div>
              <div className="space-y-2">
                {activeLibrary.readBy.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Flag className="h-4 w-4 text-rose-600" />
                会被谁更新
              </div>
              <div className="space-y-2">
                {activeLibrary.updatedBy.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Workflow className="h-4 w-4 text-amber-600" />
                当前理解
              </div>
              <p className="text-sm leading-6 text-slate-500">
                旧提示词不是只生成几个设定条目，而是把小说拆成多个资料库。生成细纲和正文主要读取这些库，章节发布再把变化写回这些库。
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
