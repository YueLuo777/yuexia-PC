import { X } from 'lucide-react';
import { useState } from 'react';

import { ModelManagePage } from '@/features/models/pages/ModelManagePage';
import { PromptsPage } from '@/features/prompts/pages/PromptsPage';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';

type DrawerType = 'models' | 'prompts';

const modelOptions = [
  { value: 'ds-v4-flash', label: 'DS-v4-flash' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
  { value: 'gpt-5', label: 'GPT-5' },
];

const promptOptions = [
  { value: 'brainstorm-test', label: '脑洞-测试版' },
  { value: 'brainstorm-fast', label: '脑洞-快速版' },
  { value: 'outline-default', label: '大纲默认' },
];

const previewText = [
  '灵气复苏三十年后，武道彻底融入现代都市。',
  '高考不再只考文化课，还考气血值、拳力、反应速度和实战评级。',
  '主角原本是一个生活在底层城区的普通少年，气血低、家境差、天赋平平，却意外觉醒了一个特殊能力。',
  '他能回收战斗现场残留的气血、武技经验、精神碎片，并将其转化为自己的修炼资源。',
  '别人打完架之后只留下一片狼藉，主角却能在废墟中捡到别人看不见的武道残渣。',
].join('\n\n');

function DrawerContent({ type }: { type: DrawerType }) {
  return type === 'models' ? <ModelManagePage /> : <PromptsPage initialCategory="脑洞" />;
}

export function ManagementDrawerTestPage() {
  const [drawerType, setDrawerType] = useState<DrawerType | null>(null);
  const [modelId, setModelId] = useState(modelOptions[0].value);
  const [promptId, setPromptId] = useState(promptOptions[0].value);

  const toggleDrawer = (type: DrawerType) => {
    setDrawerType((current) => (current === type ? null : type));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <style>
        {`
          @keyframes xy-management-drawer-in {
            from { transform: translateX(42px); opacity: 0.65; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-[#08AACE]">05号测试</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">右侧滑出管理页测试</h1>
        </div>
        <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm font-black shadow-sm">
          <button
            type="button"
            onClick={() => toggleDrawer('models')}
            className="h-10 px-5 text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
          >
            打开模型管理
          </button>
          <button
            type="button"
            onClick={() => toggleDrawer('prompts')}
            className="h-10 border-l border-slate-200 px-5 text-slate-700 hover:bg-[#EAF9FD] hover:text-[#08AACE]"
          >
            打开提示词管理
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="grid h-full min-h-0 grid-cols-[180px_minmax(0,1fr)_360px]">
          <aside className="min-h-0 border-r border-slate-100 bg-slate-50">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              <div className="text-lg font-black text-slate-950">脑洞列表</div>
              <div className="rounded-full bg-[#08AACE] px-3 py-1 text-xs font-black text-white">2</div>
            </div>
            <div className="space-y-3 p-3">
              {[106, 270, 0].map((count, index) => (
                <button
                  key={index}
                  type="button"
                  className={`flex h-14 w-full items-center justify-between rounded-2xl border px-3 text-left text-sm font-black ${
                    index === 1
                      ? 'border-[#08AACE] bg-[#EAF9FD] text-[#08AACE]'
                      : 'border-transparent bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span>脑洞 {index + 1}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-[#08AACE]">{count}字</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="grid min-h-0 grid-cols-2 gap-6 overflow-hidden p-6">
            <section className="flex min-h-0 flex-col rounded-[28px] border-2 border-slate-900 bg-white p-6">
              <div className="-mt-9 mb-4 w-fit bg-white px-3 text-base font-black text-slate-900">脑洞预览</div>
              <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-lg font-medium leading-9 text-slate-900">
                {previewText}
              </div>
              <div className="mt-3 text-right text-sm font-black text-slate-400">270字</div>
            </section>

            <section className="flex min-h-0 flex-col gap-4">
              <div className="flex h-14 items-center border-b border-slate-100 text-xl font-black text-slate-950">脑洞输出框</div>
              <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border-2 border-slate-900 bg-white p-6">
                <div className="-mt-9 mb-4 w-fit bg-white px-3 text-base font-black text-slate-900">脑洞输出框</div>
                <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-lg font-medium leading-9 text-slate-900">
                  高三学渣林北觉醒前世武神记忆，却发现自己身处灵气枯竭的现代都市，连最基础的炼气都做不到。直到他捡到一枚神秘碎片，发现只要完成日常任务就能解锁前世武技。
                </div>
                <div className="mt-3 text-right text-sm font-black text-slate-400">106字</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex h-12 items-center overflow-hidden rounded-2xl border-2 border-[#08AACE]">
                  <input className="min-w-0 flex-1 px-4 text-sm font-bold outline-none" placeholder="请输入要求" />
                  <button className="h-full w-14 text-[#08AACE]">发送</button>
                </div>
              </div>
            </section>
          </main>

          <aside className="min-h-0 border-l border-slate-100 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">脑洞生成</h2>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">输出日志</button>
            </div>
            <div className="space-y-5">
              <CapsuleSelect
                floatingLabel="模型"
                value={modelId}
                onChange={setModelId}
                options={modelOptions}
                buttonClassName="h-12 rounded-full px-4 text-sm"
                actionLabel="管理"
                onActionClick={() => toggleDrawer('models')}
              />
              <CapsuleSelect
                floatingLabel="提示词"
                value={promptId}
                onChange={setPromptId}
                options={promptOptions}
                buttonClassName="h-12 rounded-full px-4 text-sm"
                actionLabel="管理"
                onActionClick={() => toggleDrawer('prompts')}
                disableToggleActive
                onDisableToggle={() => undefined}
                disableToggleLabel="禁用提示词"
              />
              {['题材', '故事主题', '主角金手指'].map((label, index) => (
                <label key={label} className="block rounded-3xl border-2 border-slate-900 bg-white px-5 py-3">
                  <span className="-mt-6 block w-fit bg-white px-2 text-sm font-black text-slate-700">{label}</span>
                  <input
                    className="h-8 w-full text-base font-black text-slate-400 outline-none"
                    placeholder={index === 0 ? '如都市高武、玄幻、仙侠、科幻' : index === 1 ? '如系统流、凡人流' : '如吞噬系统、神豪系统'}
                  />
                </label>
              ))}
            </div>
            <button className="absolute bottom-6 right-6 h-12 rounded-2xl bg-[#08AACE] px-8 text-base font-black text-white shadow-lg shadow-cyan-200">生成</button>
          </aside>
        </div>

        {drawerType && (
          <div className="absolute inset-y-0 left-0 right-[360px] z-30 overflow-hidden bg-slate-950/10">
            <section className="flex h-full w-full animate-[xy-management-drawer-in_180ms_ease-out] flex-col border-r border-slate-200 bg-slate-50 shadow-[20px_0_60px_rgba(15,23,42,0.16)]">
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
                <div>
                  <div className="text-xs font-black text-[#08AACE]">侧滑管理页</div>
                  <h2 className="text-lg font-black text-slate-950">{drawerType === 'models' ? '模型管理' : '提示词管理'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerType(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="关闭管理页"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>
              <div className="editor-scrollbar min-h-0 flex-1 overflow-auto bg-slate-50">
                <div className={drawerType === 'models' ? 'h-full min-w-[1180px]' : 'h-full min-w-[980px]'}>
                  <DrawerContent type={drawerType} />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
