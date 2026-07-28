import { useState } from 'react';
import type { ReactNode } from 'react';

type StageId = 'preparation' | 'settings' | 'creation' | 'check';

type StageAction = {
  id: string;
  label: string;
};

type Stage = {
  id: StageId;
  number: number;
  label: string;
  purpose: string;
  actions: StageAction[];
};

type NavigationState = {
  stageId: StageId;
  actionId: string;
};

const STAGES: Stage[] = [
  {
    id: 'preparation',
    number: 1,
    label: '开书',
    purpose: '先确定作品方向',
    actions: [
      { id: 'details', label: '作品详情' },
      { id: 'brainstorm', label: '生成脑洞' },
      { id: 'brainstormLibrary', label: '脑洞库' },
    ],
  },
  {
    id: 'settings',
    number: 2,
    label: '设定',
    purpose: '完善人物、世界与规则',
    actions: [
      { id: 'settingsList', label: '作品设定' },
      { id: 'changeTemplate', label: '更换设定模板' },
    ],
  },
  {
    id: 'creation',
    number: 3,
    label: '创作',
    purpose: '从章纲推进到正文',
    actions: [
      { id: 'chapterOutline', label: '生成章纲' },
      { id: 'writing', label: '生成正文' },
    ],
  },
  {
    id: 'check',
    number: 4,
    label: '检查',
    purpose: '检查剧情并收束资料',
    actions: [
      { id: 'storyAudit', label: '审核剧情' },
      { id: 'statusUpdate', label: '更新状态' },
      { id: 'summary', label: '生成梗概' },
    ],
  },
];

const INITIAL_STATE: NavigationState = { stageId: 'settings', actionId: 'settingsList' };

function getStage(stageId: StageId) {
  return STAGES.find((stage) => stage.id === stageId) ?? STAGES[0];
}

function PrototypeFrame({
  name,
  summary,
  recommended = false,
  children,
}: {
  name: string;
  summary: string;
  recommended?: boolean;
  children: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#dce1e8] bg-white" data-guided-navigation-prototype={name}>
      <header className="flex min-h-14 items-center justify-between gap-6 border-b border-[#edf0f3] bg-[#fbfcfd] px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-[#27313d]">{name}</h2>
            {recommended ? (
              <span className="rounded border border-[#9DDFEA] bg-[#EAF9FD] px-2 py-0.5 text-[11px] font-bold text-[#078FAB]">
                推荐先看
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-medium text-[#7b8794]">{summary}</p>
        </div>
      </header>
      <div className="bg-[#f5f7f9] p-5">{children}</div>
    </article>
  );
}

function usePrototypeNavigation() {
  const [navigation, setNavigation] = useState<NavigationState>(INITIAL_STATE);
  const stage = getStage(navigation.stageId);
  const action = stage.actions.find((item) => item.id === navigation.actionId) ?? stage.actions[0];

  const selectStage = (stageId: StageId) => {
    const nextStage = getStage(stageId);
    setNavigation({ stageId, actionId: nextStage.actions[0].id });
  };

  const selectAction = (actionId: string) => setNavigation((current) => ({ ...current, actionId }));

  return { navigation, stage, action, selectStage, selectAction };
}

function RelayNavigation() {
  const { navigation, stage, action, selectStage, selectAction } = usePrototypeNavigation();

  return (
    <div className="rounded-lg border border-[#cfd8e2] bg-white p-3 shadow-sm">
      <div className="grid grid-cols-4 gap-1 rounded-md bg-[#f2f5f7] p-1">
        {STAGES.map((item) => {
          const selected = item.id === navigation.stageId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectStage(item.id)}
              className={`h-9 rounded text-xs font-bold transition-colors ${
                selected ? 'bg-white text-[#078FAB] shadow-sm' : 'text-[#657180] hover:bg-white/70'
              }`}
            >
              {item.number} {item.label}阶段
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-3">
        <div className="w-48 shrink-0 border-r border-[#dce1e8] pr-3">
          <div className="text-[10px] font-black tracking-[0.15em] text-[#08AACE]">当前阶段</div>
          <div className="mt-1 truncate text-sm font-black text-[#27313d]">{stage.purpose}</div>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {stage.actions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === navigation.actionId ? 'page' : undefined}
              onClick={() => selectAction(item.id)}
              className={`h-9 rounded-md border px-4 text-xs font-bold transition-colors ${
                item.id === navigation.actionId
                  ? 'border-[#08AACE] bg-[#DFF6FB] text-[#078FAB]'
                  : 'border-[#dce1e8] bg-white text-[#657180] hover:border-[#9DDFEA]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="shrink-0 rounded-md bg-[#F1FAFC] px-4 py-2 text-right">
          <div className="text-[10px] font-bold text-[#7b8794]">正在前往</div>
          <div className="mt-0.5 text-xs font-black text-[#078FAB]">{action.label}</div>
        </div>
      </div>
    </div>
  );
}

function StationNavigation() {
  const { navigation, stage, action, selectStage, selectAction } = usePrototypeNavigation();

  return (
    <div className="rounded-lg border border-[#cfd8e2] bg-white px-5 py-4 shadow-sm">
      <div className="relative grid grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-[#cbd5df]" aria-hidden="true" />
        {STAGES.map((item) => {
          const selected = item.id === navigation.stageId;
          const passed = item.number < stage.number;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectStage(item.id)}
              className="relative z-10 flex min-w-0 flex-col items-center focus-visible:outline-none"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-black ${
                  selected
                    ? 'border-[#08AACE] bg-[#08AACE] text-white shadow-[0_0_0_4px_#EAF9FD]'
                    : passed
                      ? 'border-[#8fd8e7] bg-[#EAF9FD] text-[#078FAB]'
                      : 'border-[#cbd5df] bg-white text-[#7b8794]'
                }`}
              >
                {item.number}
              </span>
              <span className={`mt-2 text-xs font-black ${selected ? 'text-[#078FAB]' : 'text-[#657180]'}`}>
                {item.label}阶段
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-[#bdebf4] bg-[#F3FCFE] px-4 py-2.5">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-[#078FAB]">本阶段建议：</span>
          <span className="ml-1 text-xs font-bold text-[#46515f]">{stage.purpose}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {stage.actions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === navigation.actionId ? 'page' : undefined}
              onClick={() => selectAction(item.id)}
              className={`h-8 rounded border px-3 text-xs font-bold ${
                item.id === action.id
                  ? 'border-[#08AACE] bg-white text-[#078FAB]'
                  : 'border-transparent text-[#657180] hover:border-[#9DDFEA] hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectoryNavigation() {
  const { navigation, stage, action, selectStage, selectAction } = usePrototypeNavigation();

  return (
    <div className="flex min-h-24 items-stretch overflow-hidden rounded-lg border border-[#cfd8e2] bg-white shadow-sm">
      <nav aria-label="阶段目录" className="grid w-[48%] shrink-0 grid-cols-4 border-r border-[#dce1e8] bg-[#f8fafb] p-2">
        {STAGES.map((item) => {
          const selected = item.id === navigation.stageId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectStage(item.id)}
              className={`rounded-md px-2 text-left transition-colors ${selected ? 'bg-[#DFF6FB]' : 'hover:bg-white'}`}
            >
              <span className={`block text-[10px] font-black ${selected ? 'text-[#08AACE]' : 'text-[#9aa5b1]'}`}>
                0{item.number}
              </span>
              <span className={`mt-1 block text-sm font-black ${selected ? 'text-[#078FAB]' : 'text-[#52606d]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="flex min-w-0 flex-1 items-center gap-4 px-4">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black tracking-wider text-[#8a96a3]">{stage.label}阶段任务</div>
          <div className="mt-2 flex items-center gap-2">
            {stage.actions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={item.id === navigation.actionId ? 'page' : undefined}
                onClick={() => selectAction(item.id)}
                className={`h-8 rounded border px-3 text-xs font-bold ${
                  item.id === action.id
                    ? 'border-[#08AACE] bg-[#08AACE] text-white'
                    : 'border-[#dce1e8] bg-white text-[#657180] hover:border-[#9DDFEA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-44 shrink-0 border-l border-[#dce1e8] pl-4">
          <div className="text-[10px] font-bold text-[#8a96a3]">创作指导</div>
          <div className="mt-1 text-xs font-black leading-5 text-[#27313d]">先完成“{action.label}”</div>
        </div>
      </div>
    </div>
  );
}

function FocusNavigation() {
  const { navigation, stage, action, selectStage, selectAction } = usePrototypeNavigation();

  return (
    <div className="rounded-lg border border-[#cfd8e2] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        {STAGES.map((item) => {
          const selected = item.id === navigation.stageId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectStage(item.id)}
              className={`flex h-11 items-center rounded-md border px-4 text-left transition-all ${
                selected
                  ? 'min-w-48 flex-1 border-[#08AACE] bg-[#EAF9FD]'
                  : 'w-28 shrink-0 border-[#dce1e8] bg-white hover:border-[#9DDFEA]'
              }`}
            >
              <span className={`mr-2 text-xs font-black ${selected ? 'text-[#08AACE]' : 'text-[#a0aab5]'}`}>{item.number}</span>
              <span className="min-w-0">
                <span className={`block text-xs font-black ${selected ? 'text-[#078FAB]' : 'text-[#657180]'}`}>{item.label}阶段</span>
                {selected ? <span className="mt-0.5 block truncate text-[10px] font-bold text-[#657180]">{item.purpose}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex h-10 items-center rounded-md bg-[#f5f7f9] px-3">
        <span className="mr-3 text-[11px] font-black text-[#7b8794]">可前往</span>
        <div className="flex items-center gap-1.5">
          {stage.actions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === navigation.actionId ? 'page' : undefined}
              onClick={() => selectAction(item.id)}
              className={`h-7 rounded px-3 text-xs font-bold ${
                item.id === action.id ? 'bg-white text-[#078FAB] shadow-sm' : 'text-[#657180] hover:bg-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] font-bold text-[#078FAB]">当前：{action.label}</span>
      </div>
    </div>
  );
}

function GuideCardNavigation() {
  const { navigation, stage, action, selectStage, selectAction } = usePrototypeNavigation();
  const nextActionIndex = stage.actions.findIndex((item) => item.id === action.id) + 1;
  const nextAction = stage.actions[nextActionIndex] ?? STAGES[stage.number]?.actions[0];

  return (
    <div className="grid min-h-28 grid-cols-[1fr_280px] overflow-hidden rounded-lg border border-[#cfd8e2] bg-white shadow-sm">
      <div className="min-w-0 p-3">
        <div className="flex items-center gap-1 border-b border-[#edf0f3] pb-2">
          {STAGES.map((item) => {
            const selected = item.id === navigation.stageId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectStage(item.id)}
                className={`h-8 flex-1 rounded text-xs font-black ${
                  selected ? 'bg-[#DFF6FB] text-[#078FAB]' : 'text-[#657180] hover:bg-[#f5f7f9]'
                }`}
              >
                {item.number} {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="mr-1 text-[11px] font-bold text-[#7b8794]">{stage.label}工具</span>
          {stage.actions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === navigation.actionId ? 'page' : undefined}
              onClick={() => selectAction(item.id)}
              className={`h-8 rounded border px-3 text-xs font-bold ${
                item.id === action.id
                  ? 'border-[#08AACE] bg-white text-[#078FAB]'
                  : 'border-[#dce1e8] text-[#657180] hover:border-[#9DDFEA]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <aside className="flex flex-col justify-center border-l border-[#bdebf4] bg-[#F3FCFE] px-5" aria-label="下一步指导">
        <div className="text-[10px] font-black tracking-[0.16em] text-[#08AACE]">下一步建议</div>
        <div className="mt-1.5 text-sm font-black text-[#27313d]">{nextAction ? nextAction.label : '本轮流程已完成'}</div>
        <div className="mt-1 text-[11px] font-medium leading-4 text-[#657180]">完成当前页面后，可按建议继续推进，也可直接切换其他阶段。</div>
      </aside>
    </div>
  );
}

export function StandardModeGuidedNavigationTestPage() {
  return (
    <main className="h-full overflow-y-auto bg-[#f5f7f9]" data-testid="guided-navigation-variants-test">
      <header className="border-b border-[#dce1e8] bg-white px-8 py-6">
        <p className="text-[11px] font-black tracking-[0.18em] text-[#08AACE]">标准模式 · 导航与创作指导</p>
        <h1 className="mt-2 text-2xl font-black text-[#27313d]">五套全新顶部导航方案</h1>
        <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-[#657180]">
          重点比较阶段定位、任务跳转和下一步指引。每套方案都可独立点击阶段与功能按钮，当前展示“设定阶段 / 作品设定”。
        </p>
        <div className="mt-4 grid max-w-5xl grid-cols-2 gap-3 text-xs font-medium leading-5">
          <div className="rounded-md border border-[#bdebf4] bg-[#F3FCFE] px-4 py-3 text-[#52606d]">
            <strong className="text-[#078FAB]">可以替换：</strong>布局结构、阶段呈现方式、选中态、指导文案位置和导航区域高度。
          </div>
          <div className="rounded-md border border-[#dce1e8] bg-[#fbfcfd] px-4 py-3 text-[#52606d]">
            <strong className="text-[#27313d]">必须保留：</strong>四阶段顺序、全部正式功能、真实跳转关系、作品数据和创作业务规则。
          </div>
        </div>
      </header>

      <div className="space-y-5 p-8">
        <PrototypeFrame name="方案 A · 任务接力棒" summary="四阶段稳定在上层；下层只展开当前阶段任务，并明确正在前往哪里。" recommended>
          <RelayNavigation />
        </PrototypeFrame>
        <PrototypeFrame name="方案 B · 路线站点" summary="用站点和连线表达创作顺序；当前阶段下方直接承接建议与操作。">
          <StationNavigation />
        </PrototypeFrame>
        <PrototypeFrame name="方案 C · 阶段目录" summary="左侧像目录一样快速定位阶段；右侧集中当前工具和一句创作指导。">
          <DirectoryNavigation />
        </PrototypeFrame>
        <PrototypeFrame name="方案 D · 焦点伸缩" summary="当前阶段自动展开目的说明，其余阶段保持紧凑，第二行承载功能跳转。">
          <FocusNavigation />
        </PrototypeFrame>
        <PrototypeFrame name="方案 E · 导航 + 指导卡" summary="导航和功能区保持克制，把下一步建议固定在右侧独立区域。">
          <GuideCardNavigation />
        </PrototypeFrame>
      </div>
    </main>
  );
}

export default StandardModeGuidedNavigationTestPage;
