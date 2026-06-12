import {
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  Layers,
  Link2,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type OutlineSectionId =
  | 'goal'
  | 'carry'
  | 'conflict'
  | 'flow'
  | 'foreshadow'
  | 'hook'
  | 'notes';

type StateSectionId = 'character' | 'item' | 'faction' | 'relation' | 'clue';

type OutlineSection = {
  id: OutlineSectionId;
  label: string;
  tag: string;
  description: string;
  rows: string;
};

type StateSection = {
  id: StateSectionId;
  label: string;
  placeholder: string;
};

const outlineSections: OutlineSection[] = [
  {
    id: 'goal',
    label: '本章目标',
    tag: '本章目标',
    description: '本章必须完成的剧情目标、人物目标和读者情绪目标。',
    rows: 'h-24',
  },
  {
    id: 'carry',
    label: '前情承接',
    tag: '前情承接',
    description: '从上一章或前文哪一处接起，避免正文生成突然跳戏。',
    rows: 'h-24',
  },
  {
    id: 'conflict',
    label: '核心冲突',
    tag: '核心冲突',
    description: '本章最主要的阻碍、对抗或选择压力。',
    rows: 'h-24',
  },
  {
    id: 'flow',
    label: '剧情流程',
    tag: '剧情流程',
    description: '4 到 8 步推进，包含事件、行动、结果变化。',
    rows: 'h-44',
  },
  {
    id: 'foreshadow',
    label: '伏笔和信息',
    tag: '伏笔和信息',
    description: '本章埋下、揭示、回收的信息。',
    rows: 'h-32',
  },
  {
    id: 'hook',
    label: '结尾钩子',
    tag: '结尾钩子',
    description: '本章停在哪里，下一章的打开期待是什么。',
    rows: 'h-24',
  },
  {
    id: 'notes',
    label: '写作注意',
    tag: '写作注意',
    description: '正文生成时不能写错、不能提前暴露或必须保留的限制。',
    rows: 'h-24',
  },
];

const stateSections: StateSection[] = [
  { id: 'character', label: '人物状态', placeholder: '例如：林刻确认妹妹病情恶化，但还没有暴露系统。' },
  { id: 'item', label: '道具状态', placeholder: '例如：旧徽记被守卫注意到，但真实用途仍未知。' },
  { id: 'faction', label: '势力状态', placeholder: '例如：城防军开始记录主角入城信息。' },
  { id: 'relation', label: '关系状态', placeholder: '例如：药铺老板对主角保持交易性试探。' },
  { id: 'clue', label: '线索/信息', placeholder: '例如：失踪案与家族徽记可能有关。' },
];

const chapters = [
  { id: 'chapter-1', volume: '第一卷', title: '第1章 雨夜入城', status: '已完成', words: 1860 },
  { id: 'chapter-2', volume: '第一卷', title: '第2章 黑市药铺', status: '当前章', words: 0 },
  { id: 'chapter-3', volume: '第一卷', title: '第3章 城防军账本', status: '未生成', words: 0 },
  { id: 'chapter-4', volume: '第二卷', title: '第4章 地下旧塔', status: '未生成', words: 0 },
];

const initialOutlineText: Record<OutlineSectionId, string> = {
  goal: '',
  carry: '',
  conflict: '',
  flow: '',
  foreshadow: '',
  hook: '',
  notes: '',
};

const initialStateText: Record<StateSectionId, string> = {
  character: '',
  item: '',
  faction: '',
  relation: '',
  clue: '',
};

const taggedOutlineText: Record<OutlineSectionId, string> = {
  goal:
    '让主角在黑市药铺获得“城防军账本”的线索，同时建立药铺老板并非单纯好人的试探感；读者要感到主角被迫交易，但也看见他开始掌握主动权。',
  carry:
    '承接上一章雨夜入城后的徽记异常和失踪案传闻。主角为了给妹妹找药，按照守卫无意透露的街巷线索进入黑市。',
  conflict:
    '主角急需药材，但药铺老板只愿意用线索交换任务；主角必须在暴露旧徽记风险和救妹妹的迫切之间做选择。',
  flow:
    '1. 开场写主角穿过黑市窄巷，观察药味、暗号和巡逻间隙。\n2. 药铺老板认出旧徽记，只说半句真话，逼主角先拿出筹码。\n3. 主角用假身份试探失败，老板点破他和失踪案有关。\n4. 老板提出交易：取回被城防军扣押的旧账本，才给救命药。\n5. 主角发现账本可能记录家族旧案，表面拒绝，实际记下城防军换岗时间。\n6. 结尾让门外传来城防军搜查声，老板把主角推入后仓暗门。',
  foreshadow:
    '本章埋下：旧徽记可以打开某些黑市门路；药铺老板知道家族旧案。\n本章揭示：城防军扣押过一批和失踪案有关的账本。\n本章回收：上一章守卫提到的失踪案不只是传闻。',
  hook:
    '城防军突然搜查药铺，老板没有解释，直接把主角推进后仓暗门；暗门内贴着和主角家族徽记相同的残破符号。',
  notes:
    '不要提前说明药铺老板真实立场。不要让主角主动暴露系统。不要把黑市写成纯打斗场景，本章重点是交易、试探和信息压力。',
};

const taggedStateText: Record<StateSectionId, string> = {
  character: '主角从被动找药转为被迫接触城防军旧账本；妹妹病情压力继续存在。',
  item: '旧徽记被药铺老板识别；救命药暂未到手；城防军账本成为下一步目标。',
  faction: '城防军开始搜查黑市药铺；黑市势力与旧案存在隐性联系。',
  relation: '主角和药铺老板形成临时交易关系，互不信任但都需要对方。',
  clue: '失踪案、家族徽记、城防军账本三条线第一次连到一起。',
};

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

function buildAiOutput() {
  const outlineText = outlineSections
    .map((section) => `<${section.tag}>\n${taggedOutlineText[section.id]}\n</${section.tag}>`)
    .join('\n\n');
  const stateText = stateSections
    .map((section) => `${section.label}：${taggedStateText[section.id]}`)
    .join('\n');

  return `${outlineText}\n\n<状态变化>\n${stateText}\n</状态变化>`;
}

const promptTemplate = `你是小说章纲策划助手。请根据关联资料和用户要求生成可直接用于正文写作的章纲。

要求：
1. 不要写正文，只写章纲。
2. 必须保留每一个 XML 标签，不能改名、不能删除。
3. 标签内只写对应内容。
4. <状态变化> 记录的是本章预计会发生的状态变化，不代表已经写入正式状态库。

输出格式：
<本章目标>...</本章目标>
<前情承接>...</前情承接>
<核心冲突>...</核心冲突>
<剧情流程>...</剧情流程>
<伏笔和信息>...</伏笔和信息>
<结尾钩子>...</结尾钩子>
<写作注意>...</写作注意>
<状态变化>
人物状态：
道具状态：
势力状态：
关系状态：
线索/信息：
</状态变化>`;

export function StructuredDetailOutlineTagFillTestPage() {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[1].id);
  const [outlineText, setOutlineText] = useState<Record<OutlineSectionId, string>>(initialOutlineText);
  const [stateText, setStateText] = useState<Record<StateSectionId, string>>(initialStateText);
  const [activeTag, setActiveTag] = useState<string>('剧情流程');
  const [showPrompt, setShowPrompt] = useState(false);

  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[1];
  const aiOutput = useMemo(buildAiOutput, []);
  const totalWords = useMemo(() => (
    Object.values(outlineText).join('').length + Object.values(stateText).join('').length
  ), [outlineText, stateText]);

  const fillFromTags = () => {
    setOutlineText(taggedOutlineText);
    setStateText(taggedStateText);
    setActiveTag('状态变化');
  };

  const resetFields = () => {
    setOutlineText(initialOutlineText);
    setStateText(initialStateText);
    setActiveTag('剧情流程');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900">结构化章纲标签填充测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            测试 XML 标签输出、自动填入章纲字段、状态变化独立显示的页面方案。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#08AACE]/20 bg-[#EAF9FD] px-3 py-2 text-xs font-black text-[#078FAE]">
          <Check className="h-4 w-4" />
          UI 使用“状态变化”，不显示“预期”
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[250px_minmax(540px,1fr)_420px] gap-4">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-black text-slate-900">章节目录</div>
            <div className="mt-1 text-xs font-bold text-slate-400">选择章节后，只编辑当前章纲。</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="mb-2 rounded-lg bg-[#08AACE] px-3 py-2 text-sm font-black text-white">第一卷</div>
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const selected = chapter.id === selectedChapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? 'border-[#08AACE] bg-[#F0FBFE] shadow-sm ring-2 ring-[#08AACE]/10'
                        : 'border-slate-100 bg-slate-50 hover:border-[#08AACE]/30 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-slate-500 shadow-sm">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${
                          chapter.status === '当前章'
                            ? 'border-[#08AACE]/30 bg-[#EAF9FD] text-[#078FAE]'
                            : chapter.status === '已完成'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                              : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        {chapter.status}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-black leading-5 text-slate-800">{chapter.title}</div>
                    <div className="mt-1 text-xs font-bold text-slate-400">{chapter.words} 字</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="shrink-0 border-t border-slate-100 p-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-700">
                <ClipboardList className="h-4 w-4 text-[#08AACE]" />
                解析规则
              </div>
              <div className="space-y-1 text-xs font-semibold leading-5 text-slate-500">
                <p>缺少标签：保留原字段</p>
                <p>重复标签：以后者为准</p>
                <p>状态变化：审核后再入库</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black text-[#08AACE]">{selectedChapter.volume}</div>
                <h2 className="mt-1 truncate text-lg font-black text-slate-900">{selectedChapter.title} · 结构化章纲</h2>
              </div>
              <div className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                已填入 {totalWords} 字
              </div>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {outlineSections.slice(0, 3).map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveTag(section.tag)}
                  className={`h-9 rounded-lg border px-3 text-sm font-black transition-colors ${
                    activeTag === section.tag
                      ? 'border-[#08AACE] bg-[#08AACE] text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {outlineSections.map((section) => {
                const active = activeTag === section.tag;
                return (
                  <section
                    key={section.id}
                    className={`rounded-xl border bg-white transition-colors ${
                      active ? 'border-[#08AACE] shadow-sm ring-2 ring-[#08AACE]/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{section.label}</span>
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
                            &lt;{section.tag}&gt;
                          </span>
                        </div>
                        <div className="mt-1 truncate text-xs font-bold text-slate-400">{section.description}</div>
                      </div>
                      <span className="shrink-0 text-xs font-black text-slate-400">{countWords(outlineText[section.id])} 字</span>
                    </div>
                    <textarea
                      value={outlineText[section.id]}
                      onFocus={() => setActiveTag(section.tag)}
                      onChange={(event) => {
                        setOutlineText((current) => ({ ...current, [section.id]: event.target.value }));
                      }}
                      placeholder={`AI 输出 <${section.tag}> 后，会自动填入这里。`}
                      className={`editor-scrollbar w-full resize-none rounded-b-xl border-0 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700 outline-none focus:bg-white ${section.rows}`}
                    />
                  </section>
                );
              })}

              <section
                className={`rounded-xl border bg-white transition-colors ${
                  activeTag === '状态变化' ? 'border-[#08AACE] shadow-sm ring-2 ring-[#08AACE]/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">状态变化</span>
                      <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">&lt;状态变化&gt;</span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">
                      这里仍然是本章预计变化，审核确认后再同步到正式状态库。
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-black text-slate-400">
                    {countWords(Object.values(stateText).join(''))} 字
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 xl:grid-cols-2">
                  {stateSections.map((section) => (
                    <label key={section.id} className="block rounded-lg border border-slate-200 bg-white p-3">
                      <div className="mb-2 text-xs font-black text-slate-700">{section.label}</div>
                      <textarea
                        value={stateText[section.id]}
                        onFocus={() => setActiveTag('状态变化')}
                        onChange={(event) => {
                          setStateText((current) => ({ ...current, [section.id]: event.target.value }));
                        }}
                        placeholder={section.placeholder}
                        className="h-20 w-full resize-none border-0 text-sm font-semibold leading-6 text-slate-700 outline-none placeholder:text-slate-300"
                      />
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">AI 标签输出</div>
                <div className="mt-1 text-xs font-bold text-slate-400">生成后按标签填入左侧字段。</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrompt((value) => !value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-500 hover:bg-slate-50"
              >
                提示词
              </button>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {showPrompt && (
              <section className="mb-4 rounded-xl border border-[#08AACE]/20 bg-[#F0FBFE] p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#078FAE]">
                  <Sparkles className="h-4 w-4" />
                  章纲提示词模板
                </div>
                <pre className="editor-scrollbar max-h-64 whitespace-pre-wrap rounded-lg bg-white p-3 text-xs font-semibold leading-5 text-slate-600">
                  {promptTemplate}
                </pre>
              </section>
            )}

            <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                <Link2 className="h-4 w-4 text-[#08AACE]" />
                本次关联
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                <div className="rounded-lg bg-white px-2 py-2 text-slate-600">大纲设定<br /><span className="text-[#08AACE]">2480字</span></div>
                <div className="rounded-lg bg-white px-2 py-2 text-slate-600">前文章纲<br /><span className="text-[#08AACE]">920字</span></div>
                <div className="rounded-lg bg-white px-2 py-2 text-slate-600">用户要求<br /><span className="text-[#08AACE]">86字</span></div>
              </div>
            </section>

            <section className="mb-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <FileText className="h-4 w-4 text-[#08AACE]" />
                  AI 原始输出
                </div>
                <span className="text-xs font-bold text-slate-400">{countWords(aiOutput)} 字</span>
              </div>
              <div className="editor-scrollbar max-h-[430px] overflow-y-auto p-3 text-sm font-semibold leading-6 text-slate-700">
                {aiOutput.split('\n').map((line, index) => {
                  const isTag = /^<\/?[^>]+>$/.test(line.trim());
                  return (
                    <div
                      key={`${line}-${index}`}
                      className={isTag ? 'font-black text-red-500' : line.trim() ? 'text-slate-700' : 'h-3'}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Layers className="h-4 w-4 text-[#08AACE]" />
                标签映射
              </div>
              <div className="space-y-2">
                {[
                  ...outlineSections.map((section) => ({ tag: section.tag, target: section.label, icon: Target })),
                  { tag: '状态变化', target: '状态变化区域', icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTag === item.tag;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => setActiveTag(item.tag)}
                      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-black transition-colors ${
                        active
                          ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE]'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="shrink-0 text-red-500">&lt;{item.tag}&gt;</span>
                      <span className="text-slate-300">→</span>
                      <span className="min-w-0 flex-1 truncate">{item.target}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className="grid shrink-0 grid-cols-3 gap-2 border-t border-slate-100 p-4">
            <button type="button" className="h-9 rounded-lg bg-[#08AACE] text-sm font-black text-white">
              生成章纲
            </button>
            <button
              type="button"
              onClick={fillFromTags}
              className="h-9 rounded-lg border border-[#08AACE]/30 bg-[#EAF9FD] text-sm font-black text-[#078FAE]"
            >
              按标签填入
            </button>
            <button
              type="button"
              onClick={resetFields}
              className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              清空
            </button>
          </footer>
        </aside>
      </main>

      <footer className="mt-4 flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
        <BookOpen className="h-4 w-4 text-[#08AACE]" />
        迁入正式页时，建议 UI 字段叫“状态变化”；发送给 AI 的提示词里说明“这里是本章预计状态变化，不直接进入正式状态库”。
      </footer>
    </div>
  );
}
