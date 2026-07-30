import { useMemo, useState } from 'react';

import { SMART_TEMPLATE_PRESETS } from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type {
  TemplateDomainNode,
  TemplateEntryNode,
  TemplateFieldNode,
  TemplateGroupNode,
} from '@/features/workbench/model/standardModeTemplateModel';

type Level = 1 | 2 | 3 | 4;

type StructureCard = {
  id: string;
  title: string;
  level: Level;
  path: string;
  summary: string;
};

type GenerationStep = {
  id: string;
  title: string;
  prompt: string;
};

const fantasyTemplate = SMART_TEMPLATE_PRESETS.find((preset) => preset.id === 'male-fantasy-xianxia');
const templateStructure = fantasyTemplate?.structure ?? [];

const LEVEL_LABELS: Record<Level, string> = {
  1: '一级分类',
  2: '二级分类',
  3: '三级设定',
  4: '四级字段',
};

const LEVEL_STYLES: Record<Level, string> = {
  1: 'border-[#D7A51C] bg-[#FFF7DA] text-[#7A5410]',
  2: 'border-[#B38AF2] bg-[#F5EDFF] text-[#6338A6]',
  3: 'border-[#7CB8F2] bg-[#EAF5FF] text-[#235C9A]',
  4: 'border-[#7EC99B] bg-[#ECFAF1] text-[#247446]',
};

const LEVEL_NAME_STYLES: Record<Level, string> = {
  1: 'bg-[#F8D36A] text-[#5F3E00] ring-[#D7A51C]',
  2: 'bg-[#D7B8FF] text-[#4C238A] ring-[#B38AF2]',
  3: 'bg-[#B9DBFF] text-[#174C86] ring-[#7CB8F2]',
  4: 'bg-[#B9E8C9] text-[#145C31] ring-[#7EC99B]',
};

const INITIAL_STEPS: GenerationStep[] = [
  { id: 'world', title: '01 核心框架', prompt: '先确定作品定位、世界规则和主线矛盾。' },
  { id: 'lead', title: '02 主角与金手指', prompt: '补齐主角档案、能力来源、限制与成长代价。' },
  { id: 'plot', title: '03 剧情推进', prompt: '围绕阶段目标、冲突升级和伏笔回收生成可执行设定。' },
  { id: 'review', title: '04 一致性审核', prompt: '检查设定冲突、缺口、命名不统一和后续写作风险。' },
];

function flattenFields(entry: TemplateEntryNode) {
  return entry.sections.flatMap((section) => section.fields);
}

function buildDomainCard(domain: TemplateDomainNode): StructureCard {
  const groupCount = domain.groups.length;
  const entryCount = domain.groups.reduce((total, group) => total + group.entries.length, 0);
  return {
    id: `domain:${domain.id}`,
    title: domain.title,
    level: 1,
    path: domain.title,
    summary: `${groupCount} 个二级分类 · ${entryCount} 个三级设定`,
  };
}

function buildGroupCard(domain: TemplateDomainNode, group: TemplateGroupNode): StructureCard {
  const fieldCount = group.entries.reduce((total, entry) => total + flattenFields(entry).length, 0);
  return {
    id: `group:${domain.id}:${group.id}`,
    title: group.title,
    level: 2,
    path: `${domain.title} ＞ ${group.title}`,
    summary: `${group.entries.length} 个三级设定 · ${fieldCount} 个四级字段`,
  };
}

function buildEntryCard(domain: TemplateDomainNode, group: TemplateGroupNode, entry: TemplateEntryNode): StructureCard {
  return {
    id: `entry:${domain.id}:${group.id}:${entry.id}`,
    title: entry.title,
    level: 3,
    path: `${domain.title} ＞ ${group.title} ＞ ${entry.title}`,
    summary: `${flattenFields(entry).length} 个四级字段`,
  };
}

function buildFieldCard(
  domain: TemplateDomainNode,
  group: TemplateGroupNode,
  entry: TemplateEntryNode,
  field: TemplateFieldNode,
): StructureCard {
  return {
    id: `field:${domain.id}:${group.id}:${entry.id}:${field.id}`,
    title: field.title,
    level: 4,
    path: `${domain.title} ＞ ${group.title} ＞ ${entry.title} ＞ ${field.title}`,
    summary: field.placeholder || '随步骤生成时补齐具体内容',
  };
}

function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-black ${LEVEL_STYLES[level]}`}
      data-level-badge={level}
    >
      {LEVEL_LABELS[level]}
    </span>
  );
}

function SettingNameMark({ card }: { card: StructureCard }) {
  return (
    <strong
      className={`inline-flex max-w-full items-center truncate rounded px-2 py-1 text-sm font-black ring-1 ${LEVEL_NAME_STYLES[card.level]}`}
      data-setting-name-level={card.level}
      title={card.title}
    >
      {card.title}
    </strong>
  );
}

function StructureButton({
  card,
  selected,
  onClick,
}: {
  card: StructureCard;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[72px] w-full rounded-md border px-3 py-2 text-left transition-colors ${LEVEL_STYLES[card.level]} ${
        selected ? 'shadow-[0_0_0_2px_rgba(15,23,42,0.16)]' : 'hover:brightness-[0.98]'
      }`}
      data-structure-card={card.id}
      data-level={card.level}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0">
          <SettingNameMark card={card} />
        </span>
        <LevelBadge level={card.level} />
      </span>
      <span className="mt-1 block truncate text-xs font-bold opacity-70">{card.summary}</span>
    </button>
  );
}

function SelectedCard({ card, onRemove }: { card: StructureCard; onRemove: () => void }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${LEVEL_STYLES[card.level]}`}
      data-step-card={card.id}
      data-level={card.level}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0">
          <SettingNameMark card={card} />
        </span>
        <LevelBadge level={card.level} />
      </div>
      <div className="mt-1 truncate text-[11px] font-bold opacity-70">{card.path}</div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 h-7 rounded border border-current bg-white/55 px-2 text-xs font-black"
      >
        移除
      </button>
    </div>
  );
}

export function TemplateGenerationStepCardsTestPage() {
  const initialDomain = templateStructure[0];
  const initialGroup = initialDomain?.groups[0];
  const [activeDomainId, setActiveDomainId] = useState(initialDomain?.id ?? '');
  const [activeGroupId, setActiveGroupId] = useState(initialGroup?.id ?? '');
  const [activeStepId, setActiveStepId] = useState(INITIAL_STEPS[0].id);
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [stepCardIds, setStepCardIds] = useState<Record<string, string[]>>({
    world: [],
    lead: [],
    plot: [],
    review: [],
  });

  const activeDomain = useMemo(
    () => templateStructure.find((domain) => domain.id === activeDomainId) ?? templateStructure[0] ?? null,
    [activeDomainId],
  );
  const activeGroup = useMemo(
    () => activeDomain?.groups.find((group) => group.id === activeGroupId) ?? activeDomain?.groups[0] ?? null,
    [activeDomain, activeGroupId],
  );
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];

  const visibleCards = useMemo(() => {
    const cards: StructureCard[] = [];
    if (activeDomain) cards.push(buildDomainCard(activeDomain));
    activeDomain?.groups.forEach((group) => cards.push(buildGroupCard(activeDomain, group)));
    activeGroup?.entries.forEach((entry) => {
      cards.push(buildEntryCard(activeDomain as TemplateDomainNode, activeGroup, entry));
      flattenFields(entry).forEach((field) => {
        cards.push(buildFieldCard(activeDomain as TemplateDomainNode, activeGroup, entry, field));
      });
    });
    return cards;
  }, [activeDomain, activeGroup]);

  const cardById = useMemo(
    () => new Map(visibleCards.map((card) => [card.id, card])),
    [visibleCards],
  );
  const activeStepCards = (stepCardIds[activeStep.id] ?? [])
    .map((id) => cardById.get(id))
    .filter((card): card is StructureCard => Boolean(card));
  const activeIds = new Set(stepCardIds[activeStep.id] ?? []);

  const selectDomain = (domain: TemplateDomainNode) => {
    setActiveDomainId(domain.id);
    setActiveGroupId(domain.groups[0]?.id ?? '');
  };

  const addCardToStep = (card: StructureCard) => {
    setStepCardIds((current) => {
      const ids = current[activeStep.id] ?? [];
      if (ids.includes(card.id)) return current;
      return { ...current, [activeStep.id]: [...ids, card.id] };
    });
  };

  const removeCardFromStep = (cardId: string) => {
    setStepCardIds((current) => ({
      ...current,
      [activeStep.id]: (current[activeStep.id] ?? []).filter((id) => id !== cardId),
    }));
  };

  const moveStep = (stepId: string, direction: -1 | 1) => {
    setSteps((current) => {
      const index = current.findIndex((step) => step.id === stepId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  return (
    <div
      className="flex h-full min-h-[760px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-testid="template-generation-step-cards-test"
      data-active-step={activeStep.id}
    >
      <header className="flex min-h-[78px] shrink-0 items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-black">模板生成步骤设定卡片方案</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            读取模板结构，点击设定后嵌入当前生成步骤；四种底色分别标明分类级别。
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-4 gap-2" aria-label="四级分类颜色">
          {([1, 2, 3, 4] as Level[]).map((level) => (
            <div key={level} className={`rounded-md border px-3 py-2 text-xs font-black ${LEVEL_STYLES[level]}`}>
              {LEVEL_LABELS[level]}
            </div>
          ))}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(520px,1fr)_420px] overflow-hidden">
        <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <div className="mb-2 px-2 text-xs font-black text-slate-400">一级分类</div>
          <div className="space-y-2">
            {templateStructure.map((domain) => (
              <button
                key={domain.id}
                type="button"
                aria-pressed={domain.id === activeDomain?.id}
                onClick={() => selectDomain(domain)}
                className={`min-h-11 w-full rounded-md border px-3 text-left text-sm font-black transition-colors ${
                  domain.id === activeDomain?.id
                    ? LEVEL_STYLES[1]
                    : 'border-transparent bg-white text-slate-600 hover:border-[#E0C15A] hover:bg-[#FFF9E9]'
                }`}
              >
                {domain.title}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <nav className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-[#FBFCFD] px-4" aria-label="二级分类">
            {activeDomain?.groups.map((group) => (
              <button
                key={group.id}
                type="button"
                aria-pressed={group.id === activeGroup?.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`h-8 min-w-[104px] rounded-md border px-3 text-xs font-black transition-colors ${
                  group.id === activeGroup?.id
                    ? LEVEL_STYLES[2]
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#B38AF2] hover:bg-[#FAF6FF]'
                }`}
              >
                {group.title}
              </button>
            ))}
          </nav>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
              {visibleCards.map((card) => (
                <StructureButton
                  key={card.id}
                  card={card}
                  selected={activeIds.has(card.id)}
                  onClick={() => addCardToStep(card)}
                />
              ))}
            </div>
          </div>
        </main>

        <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-200 px-4 py-4">
            <h2 className="text-sm font-black">生成步骤顺序</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">选中步骤后，左侧点击的设定会嵌入这里。</p>
          </div>
          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const active = step.id === activeStep.id;
                const cards = stepCardIds[step.id] ?? [];
                return (
                  <section
                    key={step.id}
                    className={`rounded-lg border bg-white ${active ? 'border-[#08AACE] shadow-[0_0_0_1px_#08AACE]' : 'border-slate-200'}`}
                    data-generation-step={step.id}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveStepId(step.id)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 px-3 text-left"
                    >
                      <span className="min-w-0">
                        <strong className="block truncate text-sm font-black text-slate-800">{step.title}</strong>
                        <span className="mt-1 block truncate text-xs font-semibold text-slate-400">{step.prompt}</span>
                      </span>
                      <span className="shrink-0 rounded bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#078FAB]">
                        {cards.length} 张
                      </span>
                    </button>
                    <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveStep(step.id, -1)}
                        className="h-7 rounded border border-slate-200 bg-white px-2 text-xs font-bold text-slate-500 disabled:text-slate-300"
                      >
                        上移
                      </button>
                      <button
                        type="button"
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(step.id, 1)}
                        className="h-7 rounded border border-slate-200 bg-white px-2 text-xs font-bold text-slate-500 disabled:text-slate-300"
                      >
                        下移
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>

            <section className="mt-4 rounded-lg border border-slate-200 bg-[#FBFCFD] p-3" aria-label="当前步骤发送给AI的设定卡片">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black">{activeStep.title}</h3>
                <span className="text-xs font-bold text-slate-400">{activeStepCards.length} 张设定卡</span>
              </div>
              <div className="space-y-2">
                {activeStepCards.length > 0 ? activeStepCards.map((card) => (
                  <SelectedCard key={card.id} card={card} onRemove={() => removeCardFromStep(card.id)} />
                )) : (
                  <div className="grid min-h-[112px] place-items-center rounded-md border border-dashed border-slate-300 bg-white text-xs font-bold text-slate-400">
                    当前步骤暂未嵌入设定卡片
                  </div>
                )}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TemplateGenerationStepCardsTestPage;
