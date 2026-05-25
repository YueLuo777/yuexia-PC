import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type MainTab = '提炼剧情' | '剧情库';

const tabs: MainTab[] = ['提炼剧情', '剧情库'];

const plotCards = [
  { title: '月落初临', meta: '第一章 · 世界观', text: '月亮碎片坠落，村镇出现第一批孽变者，主角被迫进入守夜队视野。' },
  { title: '阴阳阙线索', meta: '第三章 · 伏笔', text: '旧碑上出现阴阳阙残名，暗示灾变并非天灾，而是旧神封印松动。' },
  { title: '焚香师规矩', meta: '第六章 · 体系', text: '焚香师以香火稳定心神，香灰颜色可判断邪气污染程度。' },
  { title: '太阴星君传说', meta: '第九章 · 神明', text: '太阴星君并非正神，而是被后世美化过的月孽源头之一。' },
];

function TextButton({ children, onClick, tone = 'plain' }: { children: string; onClick?: () => void; tone?: 'plain' | 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-xl border px-4 text-sm font-bold transition-colors ${
        tone === 'primary'
          ? 'border-brand bg-brand text-white hover:bg-brand-dark'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export function ExtractPlotTabsTestPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>('提炼剧情');

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">提炼剧情 + 剧情库标签测试</h1>
          <p className="mt-0.5 text-xs text-slate-400">预览把剧情库合并到提炼剧情页面后的顶部胶囊标签。</p>
        </div>
        <div className="flex gap-2">
          <TextButton onClick={() => navigate('/test-collection')}>返回其他测试</TextButton>
          <TextButton onClick={() => navigate('/extract')} tone="primary">打开提炼剧情</TextButton>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-6">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-slate-100 px-7">
            <div className="flex rounded-[22px] bg-slate-100 p-1.5">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-11 min-w-[132px] rounded-[18px] px-7 text-xl font-bold transition-all ${
                      active
                        ? 'bg-white text-sky-500 shadow-sm'
                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="text-sm font-bold text-slate-400">当前：{activeTab}</div>
          </header>

          {activeTab === '提炼剧情' ? <ExtractPreview /> : <PlotLibraryPreview />}
        </section>
      </main>
    </div>
  );
}

function ExtractPreview() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] overflow-hidden">
      <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
        <h2 className="text-base font-bold text-slate-900">导入正文</h2>
        <textarea
          readOnly
          value="这里模拟粘贴小说正文，或上传 txt/docx 后等待提炼。"
          className="mt-3 h-[calc(100%-52px)] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600 outline-none"
        />
      </aside>

      <section className="min-h-0 overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">提炼结果</h2>
          <div className="flex gap-2">
            <TextButton tone="primary">开始提炼</TextButton>
            <TextButton>暂停</TextButton>
          </div>
        </div>
        <div className="space-y-3">
          {plotCards.slice(0, 3).map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-500">待导入</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="min-h-0 border-l border-slate-100 bg-slate-50 p-4">
        <h2 className="text-base font-bold text-slate-900">模块预览</h2>
        <div className="mt-3 space-y-2">
          {['剧情点', '人物动机', '冲突升级', '伏笔线索'].map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function PlotLibraryPreview() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)] overflow-hidden">
      <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
        <h2 className="text-base font-bold text-slate-900">剧情分类</h2>
        <div className="mt-3 space-y-2">
          {['全部剧情', '世界观', '伏笔', '人物', '体系', '冲突'].map((item, index) => (
            <button
              key={item}
              className={`flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold ${
                index === 0 ? 'bg-brand text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{item}</span>
              <span className="text-xs opacity-75">{index === 0 ? 24 : index + 2}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-h-0 overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">剧情库</h2>
            <p className="mt-1 text-xs text-slate-400">这里显示已经导入的剧情点，后续正式页会直接复用剧情库数据。</p>
          </div>
          <div className="flex gap-2">
            <input className="h-9 w-56 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand" placeholder="搜索剧情点" />
            <TextButton>回收站</TextButton>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {plotCards.concat(plotCards).map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-bold text-slate-900">{item.title}</div>
              <div className="mt-1 text-xs font-bold text-slate-400">{item.meta}</div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
