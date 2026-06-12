import { Check, EyeOff, Search, Star, Tags } from 'lucide-react';
import { useMemo, useState } from 'react';

type PromptCategory = '脑洞' | '大纲' | '章纲' | '正文续写' | '审核点评' | '通用';

type PromptItem = {
  id: string;
  title: string;
  category: PromptCategory;
  tags: string[];
  scene: string;
  favorite?: boolean;
  recent?: boolean;
  disabled?: boolean;
};

const categories: PromptCategory[] = ['脑洞', '大纲', '章纲', '正文续写', '审核点评', '通用'];

const pageTagMap: Record<PromptCategory, string[]> = {
  脑洞: ['开书', '题材', '卖点', '强期待'],
  大纲: ['世界观', '主线', '分卷', '人物关系'],
  章纲: ['章节拆分', '承接前文', '节奏', '伏笔'],
  正文续写: ['文风', '场景', '对话', '爽点'],
  审核点评: ['查错', '点评', '节奏优化', '逻辑'],
  通用: ['通用', '改写', '压缩', '扩写'],
};

const prompts: PromptItem[] = [
  { id: 'brainstorm-1', title: '开书脑洞生成', category: '脑洞', tags: ['开书', '题材', '卖点', '强期待'], scene: '从零生成小说方向，先找题材和核心卖点。', favorite: true, recent: true },
  { id: 'brainstorm-2', title: '强情绪脑洞', category: '脑洞', tags: ['开书', '强冲突', '强情绪'], scene: '强调羞辱、压迫、反击和期待感。' },
  { id: 'outline-1', title: '大纲设定整理', category: '大纲', tags: ['世界观', '主线', '人物关系'], scene: '把设定整理成可持续写作的大纲结构。', favorite: true },
  { id: 'outline-2', title: '分卷节奏规划', category: '大纲', tags: ['分卷', '节奏', '主线'], scene: '把长篇小说拆成多个卷，每卷有目标和转折。' },
  { id: 'plot-chain-1', title: '剧情点候选转章纲', category: '章纲', tags: ['开头', '衔接', '强冲突', '强爽点'], scene: '把同一进度的剧情点候选整理成本章可执行章纲。', favorite: true, recent: true },
  { id: 'plot-chain-2', title: '剧情点续接章纲', category: '章纲', tags: ['衔接', '强期待', '变量替换'], scene: '根据已选剧情点继续生成下一步章纲素材。', recent: true },
  { id: 'plot-chain-old', title: '剧情库混合旧版', category: '章纲', tags: ['剧情库', '混合', '旧版'], scene: '旧剧情库来源，暂时隐藏到后面。', disabled: true },
  { id: 'chapter-outline-1', title: '章纲生成', category: '章纲', tags: ['章节拆分', '承接前文', '节奏'], scene: '把剧情链展开成当前章节的章纲。', favorite: true },
  { id: 'chapter-outline-2', title: '伏笔回收章纲', category: '章纲', tags: ['伏笔', '承接前文', '节奏'], scene: '让本章回收前文信息并埋下一步钩子。' },
  { id: 'continue-1', title: '正文续写', category: '正文续写', tags: ['文风', '场景', '对话'], scene: '根据章纲和上下文继续写正文。', recent: true },
  { id: 'continue-2', title: '爽点强化续写', category: '正文续写', tags: ['爽点', '强情绪', '节奏'], scene: '保持正文推进，同时强化读者情绪回报。' },
  { id: 'review-1', title: '章节审核', category: '审核点评', tags: ['查错', '逻辑', '节奏优化'], scene: '检查错字、逻辑断点、节奏问题。', favorite: true },
  { id: 'review-2', title: '章节点评', category: '审核点评', tags: ['点评', '节奏优化', '爽点'], scene: '从读者体验角度点评本章优缺点。' },
  { id: 'common-1', title: '压缩总结', category: '通用', tags: ['通用', '压缩'], scene: '把长内容压缩成短梗概。' },
];

const tagOptions = Array.from(new Set(prompts.flatMap((prompt) => prompt.tags)));

function pillClass(active: boolean) {
  return active
    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
    : 'border-slate-200 bg-white text-slate-500 hover:border-[#08AACE]/40 hover:text-[#08AACE]';
}

export function PromptTaxonomyTestPage() {
  const [activePage, setActivePage] = useState<PromptCategory>('章纲');
  const [activeTag, setActiveTag] = useState<string>('全部');
  const [search, setSearch] = useState('');

  const filteredPrompts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const categoryMatched = prompt.category === activePage || prompt.category === '通用';
      const tagMatched = activeTag === '全部' || prompt.tags.includes(activeTag);
      const keywordMatched = !keyword || [prompt.title, prompt.category, prompt.scene, ...prompt.tags].some((text) => text.toLowerCase().includes(keyword));
      return categoryMatched && tagMatched && keywordMatched;
    });
  }, [activePage, activeTag, search]);

  const visibleDropdownPrompts = filteredPrompts
    .filter((prompt) => !prompt.disabled)
    .sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || Number(Boolean(b.recent)) - Number(Boolean(a.recent)));

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-[#08AACE]">06号测试</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">提示词分类优化测试</h1>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">
          <Tags className="h-4 w-4 text-[#08AACE]" />
          少分类 + 多标签 + 页面自动筛选
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_320px] gap-5 overflow-hidden">
        <aside className="min-h-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-sm font-black text-slate-950">主流程分类</div>
            <div className="mt-1 text-xs font-bold text-slate-400">分类只表达它用于哪个流程</div>
          </div>
          <div className="editor-scrollbar min-h-0 space-y-2 overflow-y-auto p-3">
            {categories.map((category) => {
              const active = category === activePage;
              const count = prompts.filter((prompt) => prompt.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActivePage(category);
                    setActiveTag('全部');
                  }}
                  className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-black transition-colors ${pillClass(active)}`}
                >
                  <span>{category}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-slate-950">当前页面：{activePage}</div>
                <div className="mt-1 text-xs font-bold text-slate-400">使用页只显示相关提示词，复杂筛选留在管理页</div>
              </div>
              <label className="relative block w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索标题、标签、用途"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-[#08AACE] focus:bg-white"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['全部', ...pageTagMap[activePage], ...tagOptions.filter((tag) => !pageTagMap[activePage].includes(tag)).slice(0, 5)].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`h-8 rounded-full border px-3 text-xs font-black transition-colors ${pillClass(activeTag === tag)}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {filteredPrompts.map((prompt) => (
                <article
                  key={prompt.id}
                  className={`rounded-2xl border p-4 ${prompt.disabled ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-slate-950">{prompt.title}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{prompt.category}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {prompt.favorite && <Star className="h-4 w-4 fill-[#F6C343] text-[#F6C343]" />}
                      {prompt.disabled && <EyeOff className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  <p className="mt-3 min-h-[44px] text-sm font-medium leading-6 text-slate-600">{prompt.scene}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#08AACE]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-sm font-black text-slate-950">下拉框预览</div>
            <div className="mt-1 text-xs font-bold text-slate-400">真实使用时只给用户看少量相关项</div>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="rounded-2xl border-2 border-[#08AACE] bg-white p-3">
              <div className="-mt-6 w-fit bg-white px-2 text-xs font-black text-[#08AACE]">提示词</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="min-w-0 truncate text-sm font-black text-slate-950">{visibleDropdownPrompts[0]?.title ?? '暂无可用提示词'}</div>
                <span className="text-xs font-black text-slate-400">管理</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {visibleDropdownPrompts.map((prompt, index) => (
                <button
                  key={prompt.id}
                  type="button"
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    index === 0 ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white hover:border-[#08AACE]/40'
                  }`}
                >
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${index === 0 ? 'bg-[#08AACE] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {index === 0 && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-slate-950">{prompt.title}</span>
                    <span className="mt-1 block truncate text-xs font-bold text-slate-400">
                      {prompt.favorite ? '收藏' : prompt.recent ? '最近使用' : '同分类'} · {prompt.tags.slice(0, 3).join(' / ')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold leading-5 text-slate-500">
            禁用提示词不进入使用下拉框，只在管理页里显示；收藏和最近使用靠前。
          </div>
        </aside>
      </main>
    </div>
  );
}

export default PromptTaxonomyTestPage;
