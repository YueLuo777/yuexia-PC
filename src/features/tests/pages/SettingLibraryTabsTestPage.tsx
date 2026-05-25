import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SettingTab = '角色' | '大纲' | '细纲' | '概要';

const tabs: SettingTab[] = ['角色', '大纲', '细纲', '概要'];
const DEFAULT_LEFT_WIDTH = 140;
const MIN_LEFT_WIDTH = 110;
const MAX_LEFT_WIDTH = 360;

const tabData: Record<SettingTab, {
  title: string;
  desc: string;
  listTitle: string;
  editorTitle: string;
  samples: string[];
  fields: string[];
}> = {
  角色: {
    title: '角色页面',
    desc: '用于管理人物卡、关系、当前状态和人物变化。',
    listTitle: '角色列表',
    editorTitle: '角色资料',
    samples: ['林刻', '月落道人', '太阴星君', '守夜人首领'],
    fields: ['角色名', '身份定位', '性格关键词', '当前状态'],
  },
  大纲: {
    title: '大纲页面',
    desc: '用于管理世界观、地点、势力、体系、道具等设定。',
    listTitle: '大纲列表',
    editorTitle: '大纲资料',
    samples: ['月落现象', '阴阳阙', '无尽长夜', '焚香体系'],
    fields: ['大纲名', '分类', '关键词', '大纲内容'],
  },
  细纲: {
    title: '细纲页面',
    desc: '用于管理章节级细纲、场景目标和节奏安排。',
    listTitle: '细纲列表',
    editorTitle: '细纲内容',
    samples: ['第1章细纲', '第2章细纲', '第3章细纲', '第4章细纲'],
    fields: ['章节', '场景目标', '冲突变化', '结尾钩子'],
  },
  概要: {
    title: '概要页面',
    desc: '用于查看章节概要、卷概要和概要预览。',
    listTitle: '概要列表',
    editorTitle: '概要内容',
    samples: ['第1章概要', '第2章概要', '第一卷概要', '第二卷概要'],
    fields: ['章节', '章节标题', '章节字数', '概要内容'],
  },
};

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

export function SettingLibraryTabsTestPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingTab>('角色');
  const [selected, setSelected] = useState('');
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);

  const data = tabData[activeTab];
  const selectedName = selected || data.samples[0];

  const previewText = useMemo(() => {
    if (activeTab === '角色') return '林刻：被月落事件卷入阴阳阙，表面冷静，实际对旧神传说保持警惕。';
    if (activeTab === '大纲') return '月落现象：月亮每晚掉落孽化碎片，使人、物、地貌出现不可逆异变。';
    if (activeTab === '细纲') return '本章目标：让主角第一次接触月孽碎片，结尾露出阴阳阙线索。';
    return '第1章 慌什么，完全不关你的事\n3376字\n\n本章概要：主角在月落异象后接触到异常碎片，旧神传说开始浮出水面。';
  }, [activeTab]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = leftWidth;

    const handleMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(MAX_LEFT_WIDTH, Math.max(MIN_LEFT_WIDTH, startWidth + moveEvent.clientX - startX));
      setLeftWidth(nextWidth);
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">作品设定库标签测试</h1>
          <p className="mt-0.5 text-xs text-slate-400">把“极简/高级模式”的 UI 套用到角色、设定、大纲、细纲四个页面切换。</p>
        </div>
        <div className="flex gap-2">
          <TextButton onClick={() => navigate('/test-collection')}>返回其他测试</TextButton>
          <TextButton onClick={() => navigate('/workbench')} tone="primary">打开作品编辑器</TextButton>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-6">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <div className="flex rounded-2xl bg-slate-100 p-1.5">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelected('');
                    }}
                    className={`h-10 rounded-xl px-6 text-base font-bold transition-all ${
                      active
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
              <span>左栏：{Math.round(leftWidth)}px</span>
              <TextButton onClick={() => setLeftWidth(DEFAULT_LEFT_WIDTH)}>恢复一半</TextButton>
              <span>当前页面：{activeTab}</span>
            </div>
          </header>

          <div
            className="grid min-h-0 flex-1 overflow-hidden"
            style={{ gridTemplateColumns: `${leftWidth}px 8px minmax(0,1fr) 320px` }}
          >
            <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{data.listTitle}</h2>
                <TextButton>新建</TextButton>
              </div>
              <div className="space-y-2">
                {data.samples.map((item) => {
                  const active = selectedName === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setSelected(item)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        active
                          ? 'border-brand bg-brand-light text-brand-dark'
                          : 'border-transparent bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="text-sm font-bold">{item}</div>
                      <div className="mt-1 text-xs text-slate-400">{activeTab} · 最近编辑</div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div
              onPointerDown={startResize}
              className="group flex cursor-col-resize items-stretch justify-center bg-white transition-colors hover:bg-brand-light"
              title="拖拽调整左侧宽度"
            >
              <div className="my-3 w-1 rounded-full bg-slate-200 transition-colors group-hover:bg-brand" />
            </div>

            <section className="min-h-0 overflow-y-auto p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">{data.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{data.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {data.fields.slice(0, 3).map((field, index) => (
                  <label key={field} className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-600">{field}</span>
                    <input
                      value={index === 0 ? selectedName : `${field}示例`}
                      readOnly
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-bold text-slate-600">{data.fields[3]}</span>
                <textarea
                  value={previewText}
                  readOnly
                  className="h-[300px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 outline-none"
                />
              </label>
            </section>

            <aside className="min-h-0 border-l border-slate-100 bg-slate-50 p-4">
              <h2 className="text-base font-bold text-slate-900">{data.editorTitle}辅助</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">右侧区域可以继续放 AI 生成、整理、提问或资料调用，不影响上方四个标签切换。</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-700">AI 输入</div>
                <textarea
                  placeholder={`让 AI 帮我整理${activeTab}...`}
                  className="mt-3 h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <TextButton tone="primary">发送</TextButton>
                  <TextButton>暂停</TextButton>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
