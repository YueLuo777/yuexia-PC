import { useState } from 'react';

import type { StandardModeBrainstormView } from './standardModeWorkbenchTestData';

function StageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-slate-200 px-6 py-4">
      <h1 className="text-xl font-black text-slate-900">{title}</h1>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
    </header>
  );
}

function BrainstormGeneratePreview() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {[
        ['小说类型', '例如：东方玄幻、仙侠经营'],
        ['预计篇幅', '例如：长篇，约200万字'],
        ['主角是谁', '填写身份、处境和最初目标'],
        ['核心优势', '填写能力、身份、机缘或特别之处'],
      ].map(([label, placeholder]) => (
        <label key={label} className="block text-sm font-black text-slate-700">
          {label}
          <input
            aria-label={label}
            placeholder={placeholder}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#08AACE]"
          />
        </label>
      ))}
      <label className="col-span-2 block text-sm font-black text-slate-700">
        补充想法
        <textarea
          aria-label="补充想法"
          placeholder="可以只写一句灵感，其余内容交给AI补全。"
          className="mt-2 h-28 w-full resize-none rounded-md border border-slate-200 bg-white p-3 text-sm font-medium leading-6 text-slate-700 outline-none focus:border-[#08AACE]"
        />
      </label>
    </div>
  );
}

const BRAINSTORM_LIBRARY = [
  {
    title: '看见功法缺陷后，我在仙门崛起',
    meta: '玄幻升级 · 长篇',
    summary: '主角能看见功法的隐藏缺陷，从边境宗门起步，逐步查清修炼体系被篡改的真相。',
    goal: '修复残缺功法并查明父亲失踪真相。',
    conflict: '既得利益势力阻止主角公开功法缺陷。',
  },
  {
    title: '我在万界开仙坊',
    meta: '仙侠经营 · 长篇',
    summary: '主角经营一座连接不同修真世界的坊市，以交易资源和情报改变各界格局。',
    goal: '修复破败仙坊，并建立不受任何势力控制的跨界交易秩序。',
    conflict: '各界大势力试图垄断仙坊的跨界通道。',
  },
  {
    title: '重生后我只修一剑',
    meta: '东方玄幻 · 中长篇',
    summary: '前世剑道走入歧途的主角重回少年时期，以最基础的一剑重新挑战天下强者。',
    goal: '重建剑道根基，阻止前世宗门覆灭。',
    conflict: '前世仇敌提前布局，主角必须隐藏重生秘密。',
  },
] as const;

function BrainstormLibraryPreview({ linkedBrainstorm }: { linkedBrainstorm?: string }) {
  const initialTitle = BRAINSTORM_LIBRARY.some((item) => item.title === linkedBrainstorm)
    ? linkedBrainstorm!
    : BRAINSTORM_LIBRARY[0].title;
  const [previewTitle, setPreviewTitle] = useState(initialTitle);
  const preview = BRAINSTORM_LIBRARY.find((item) => item.title === previewTitle) ?? BRAINSTORM_LIBRARY[0];
  return (
    <div className="grid min-h-[360px] grid-cols-[210px_1fr]">
      <aside className="border-r border-slate-200 bg-slate-50 p-3">
        <div className="px-2 pb-2 text-xs font-black text-slate-400">脑洞目录</div>
        {BRAINSTORM_LIBRARY.map((item) => (
          <button
            key={item.title}
            type="button"
            aria-current={item.title === previewTitle ? 'page' : undefined}
            onClick={() => setPreviewTitle(item.title)}
            className={`mb-2 w-full rounded-md border px-3 py-3 text-left text-xs font-black ${
              item.title === previewTitle
                ? 'border-[#08AACE] bg-white text-[#078FAB]'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {item.title}
          </button>
        ))}
      </aside>
      <article className="p-6">
        <div className="text-xs font-black text-slate-400">{preview.meta}</div>
        <h2 className="mt-2 text-lg font-black text-slate-900">{preview.title}</h2>
        <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{preview.summary}</p>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-100 pt-5 text-sm">
          <div>
            <strong className="block text-slate-800">主角目标</strong>
            <span className="mt-1 block text-slate-500">{preview.goal}</span>
          </div>
          <div>
            <strong className="block text-slate-800">主要冲突</strong>
            <span className="mt-1 block text-slate-500">{preview.conflict}</span>
          </div>
        </div>
        {linkedBrainstorm ? (
          <p className="mt-5 text-sm font-black text-[#078FAB]">当前已关联：{linkedBrainstorm}</p>
        ) : null}
      </article>
    </div>
  );
}

export function BrainstormStagePreview({
  view,
  linkedBrainstorm,
}: {
  view: StandardModeBrainstormView;
  linkedBrainstorm?: string;
}) {
  const heading =
    view === 'generate'
      ? ['生成脑洞', '填写几个关键问题，再由AI整理成可以继续扩展的小说脑洞。']
      : view === 'library'
        ? ['脑洞库', '从左侧目录切换脑洞，在右侧查看完整内容。']
        : ['关联脑洞', '预览脑洞内容后，为当前小说关联或更换脑洞。'];
  return (
    <div data-testid="brainstorm-stage-preview">
      <StageHeader title={heading[0]} description={heading[1]} />
      {view === 'generate' ? (
        <BrainstormGeneratePreview />
      ) : (
        <BrainstormLibraryPreview linkedBrainstorm={linkedBrainstorm} />
      )}
    </div>
  );
}

const settingGroups = [
  ['作品设定', '12'],
  ['核心设定', '4'],
  ['作品定位', ''],
  ['世界背景', ''],
  ['力量体系', ''],
  ['剧情规划', '3'],
  ['整体剧情', ''],
  ['第一卷', ''],
] as const;

export function SettingStagePreview({ templateName }: { templateName?: string }) {
  return (
    <div data-testid="setting-workspace-preview">
      <StageHeader title="大纲设定" description="左侧选择设定，右侧直接查看和完善对应字段。" />
      <div className="flex min-h-[430px]">
        <aside className="w-48 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 text-xs font-black text-slate-400">设定目录</div>
          {settingGroups.map(([label, count], index) => (
            <button
              key={label}
              type="button"
              className={`mb-1 flex h-10 w-full items-center justify-between rounded-md border px-3 text-left text-sm font-black ${
                index === 0 || index === 1
                  ? 'border-[#9DDFEA] bg-[#DFF6FA] text-slate-800'
                  : index === 2
                    ? 'border-[#08AACE] bg-white text-[#078FAB]'
                    : 'border-transparent bg-white text-slate-600'
              }`}
            >
              <span>{label}</span>
              <span className="text-xs text-slate-400">{count}</span>
            </button>
          ))}
        </aside>
        <section className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(180px,0.75fr)] gap-4">
            <label className="min-w-0 text-sm font-black text-slate-700">
              设定名
              <input
                aria-label="设定名"
                defaultValue="作品定位"
                className="mt-2 h-11 min-w-0 w-full rounded-md border border-slate-300 px-3 text-sm font-medium"
              />
            </label>
            <label className="min-w-0 text-sm font-black text-slate-700">
              所属分组
              <select
                aria-label="所属分组"
                defaultValue="核心设定"
                className="mt-2 h-11 min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
              >
                <option>核心设定</option>
                <option>剧情规划</option>
              </select>
            </label>
          </div>
          {templateName ? <p className="mt-4 text-sm font-black text-[#078FAB]">当前模板：{templateName}</p> : null}
          <div className="mt-5 border-b border-[#CDEFF6] pb-2 text-sm font-black text-slate-700">作品定位</div>
          <div className="mt-4 grid min-w-0 grid-cols-2 gap-4">
            {[
              ['小说类型', '东方玄幻，升级流长篇小说。'],
              ['故事年代', '架空修真时代，宗门统治地方秩序。'],
              ['作品卖点', '主角能看见功法缺陷，并通过修复功法成长。'],
              ['一句话主线', '林刻从边境宗门崛起，追查修炼体系被篡改的真相。'],
            ].map(([label, value]) => (
              <label key={label} className="min-w-0 text-sm font-black text-slate-700">
                {label}
                <textarea
                  aria-label={label}
                  defaultValue={value}
                  className="mt-2 h-24 min-w-0 w-full resize-none rounded-md border border-slate-300 p-3 text-sm font-medium leading-6"
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ChapterOutlineStagePreview() {
  return (
    <div className="flex min-h-[500px]" data-testid="chapter-outline-preview">
      <aside className="w-44 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-black text-slate-400">章纲目录</div>
        <div className="rounded-md border border-[#9DDFEA] bg-[#DFF6FA] px-3 py-3 text-sm font-black">第一卷</div>
        {['第1章 山门测试', '第2章 残缺功法', '第3章 第一次修炼'].map((title, index) => (
          <button
            key={title}
            type="button"
            className={`mt-2 h-10 w-full rounded-md border px-3 text-left text-xs font-black ${index === 1 ? 'border-[#08AACE] bg-white text-[#078FAB]' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {title}
          </button>
        ))}
      </aside>
      <section className="min-w-0 flex-1 p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">第2章</span>
          <input
            aria-label="章纲标题"
            defaultValue="残缺功法"
            className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm font-bold"
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {[
            ['本章目标', '让林刻第一次验证看见功法缺陷的能力。'],
            ['主要冲突', '执事要求所有弟子修炼存在隐患的入门功法。'],
            ['关键事件', '林刻修改第三道运行路线，避开经脉反噬。'],
            ['章末钩子', '功法修复后，石碑上出现父亲留下的标记。'],
          ].map(([label, value]) => (
            <label key={label} className="text-sm font-black text-slate-700">
              {label}
              <textarea
                aria-label={label}
                defaultValue={value}
                className="mt-2 h-28 w-full resize-none rounded-md border border-slate-200 p-3 text-sm font-medium leading-6"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WritingStagePreview() {
  return (
    <div className="flex min-h-[500px]" data-testid="writing-workspace-preview">
      <aside className="w-44 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <strong className="text-sm">未发布</strong>
          <span className="text-xs font-black text-[#078FAB]">2章</span>
        </div>
        <div className="mt-3 rounded-md border border-[#9DDFEA] bg-[#DFF6FA] px-3 py-3 text-sm font-black">第一卷</div>
        <button
          type="button"
          className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-black text-slate-600"
        >
          第1章
        </button>
        <button
          type="button"
          className="mt-2 h-10 w-full rounded-md border border-[#08AACE] bg-white px-3 text-left text-sm font-black text-[#078FAB]"
        >
          第2章
        </button>
      </aside>
      <section className="min-w-0 flex-1 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
          <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">第一卷</span>
          <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">第2章</span>
          <input
            aria-label="章节标题"
            placeholder="请输入章节标题"
            className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm font-bold"
          />
        </div>
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-black text-[#078FAB]">
          <button type="button" className="h-9 rounded-md border border-[#08AACE] px-3">
            字体设置
          </button>
          <button type="button" className="h-9 rounded-md border border-[#08AACE] px-3">
            智能排版
          </button>
          <button type="button" className="h-9 rounded-md border border-[#08AACE] px-3">
            词语高亮
          </button>
          <button type="button" className="h-9 rounded-md border border-[#08AACE] px-3">
            文字替换
          </button>
          <span className="ml-auto text-xs text-slate-400">0字</span>
        </div>
        <textarea
          aria-label="正文编辑区"
          placeholder="从这里开始创作正文……"
          className="h-[370px] w-full resize-none bg-[linear-gradient(to_bottom,transparent_31px,#dbe4ee_32px)] bg-[length:100%_32px] px-12 py-7 text-base leading-8 text-slate-700 outline-none"
        />
      </section>
    </div>
  );
}
