import { useEffect, useState } from 'react';

import { ActionButton } from '@/shared/ui/ActionButton';
import { AppModalShell } from '@/shared/ui/AppModalShell';

const BRAINSTORM_OPTIONS = [
  {
    id: 'broken-technique',
    title: '看见功法缺陷后，我在仙门崛起',
    meta: '玄幻升级 · 长篇',
    summary: '主角能看见功法的隐藏缺陷，从边境宗门起步，逐步查清修炼体系被篡改的真相。',
    protagonist: '林刻，边境小宗门的杂役弟子，因经脉问题无法正常修炼。',
    hook: '能够直接看见功法的缺陷、风险和可修复路线。',
    conflict: '依靠残缺功法控制修士的势力，不允许主角公开真相。',
  },
  {
    id: 'immortal-shop',
    title: '我在万界开仙坊',
    meta: '仙侠经营 · 长篇',
    summary: '主角经营一座能够连接不同修真世界的坊市，以交易资源和情报改变各界格局。',
    protagonist: '沈舟，意外继承破败仙坊的落魄散修。',
    hook: '仙坊每天随机连接一个修真世界，可以跨界交易独有资源。',
    conflict: '各界大势力试图控制仙坊，主角必须在交易与结盟中维持独立。',
  },
  {
    id: 'reborn-sword',
    title: '重生后我只修一剑',
    meta: '东方玄幻 · 中长篇',
    summary: '前世剑道走入歧途的主角重回少年时期，以最基础的一剑重新挑战天下强者。',
    protagonist: '顾长青，前世登临剑道巅峰却因根基缺陷陨落。',
    hook: '保留前世经验，但主动放弃所有高阶剑法，从基础剑式重修。',
    conflict: '前世仇敌提前布局，而主角必须隐藏重生秘密并重建根基。',
  },
] as const;

export function StandardModeCreationDialog({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateFromBrainstorm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
  onCreateFromBrainstorm: (brainstormTitle: string) => void;
}) {
  const [step, setStep] = useState<'method' | 'brainstorm'>('method');
  const [previewBrainstorm, setPreviewBrainstorm] = useState<(typeof BRAINSTORM_OPTIONS)[number]['id']>(
    BRAINSTORM_OPTIONS[0].id,
  );
  const [selectedBrainstorm, setSelectedBrainstorm] = useState<(typeof BRAINSTORM_OPTIONS)[number]['id']>();

  useEffect(() => {
    if (!isOpen) return;
    setStep('method');
    setPreviewBrainstorm(BRAINSTORM_OPTIONS[0].id);
    setSelectedBrainstorm(undefined);
  }, [isOpen]);

  const preview = BRAINSTORM_OPTIONS.find((item) => item.id === previewBrainstorm)!;
  const selected = BRAINSTORM_OPTIONS.find((item) => item.id === selectedBrainstorm);

  return (
    <AppModalShell
      title={step === 'method' ? '新建小说' : '选择一个脑洞'}
      subtitle={step === 'method' ? '两种方式进入同一个创作工作台' : '关联后可以继续扩展设定'}
      isOpen={isOpen}
      onClose={onClose}
      widthClass={step === 'method' ? 'w-[720px]' : 'w-[900px]'}
      heightClass={step === 'method' ? 'h-auto max-h-[82vh]' : 'h-[560px] max-h-[82vh]'}
      storageId="standard_mode_creation_flow_test"
      centerOnOpen
    >
      {step === 'method' ? (
        <div className="grid grid-cols-2 gap-4 p-6">
          <button
            type="button"
            onClick={onCreateBlank}
            className="min-h-[176px] rounded-lg border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#08AACE] hover:bg-[#F4FBFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <strong className="block text-base font-black text-slate-900">新建空白小说</strong>
            <span className="mt-3 block text-sm font-medium leading-6 text-slate-500">
              创建一本空白书籍，进入工作台后从生成脑洞或智能导入开始。
            </span>
            <span className="mt-5 block text-sm font-black text-[#078FAB]">从零开始</span>
          </button>
          <button
            type="button"
            onClick={() => setStep('brainstorm')}
            className="min-h-[176px] rounded-lg border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#08AACE] hover:bg-[#F4FBFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
          >
            <strong className="block text-base font-black text-slate-900">根据脑洞扩展</strong>
            <span className="mt-3 block text-sm font-medium leading-6 text-slate-500">
              从脑洞库选择一个已有脑洞，关联后进入同一个工作台继续生成设定。
            </span>
            <span className="mt-5 block text-sm font-black text-[#078FAB]">选择已有脑洞</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr]">
            <aside className="overflow-y-auto border-r border-slate-200 bg-slate-50 p-3" aria-label="脑洞目录">
              <div className="px-2 pb-2 text-xs font-black text-slate-400">脑洞目录</div>
              {BRAINSTORM_OPTIONS.map((item) => {
                const active = item.id === previewBrainstorm;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setPreviewBrainstorm(item.id)}
                    className={`mb-2 w-full rounded-md border px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2] ${
                      active
                        ? 'border-[#08AACE] bg-white text-[#078FAB]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#8EDFEB]'
                    }`}
                  >
                    <strong className="block text-sm font-black leading-5">{item.title}</strong>
                    <span className="mt-1 block text-xs font-bold text-slate-400">{item.meta}</span>
                  </button>
                );
              })}
            </aside>
            <article className="min-w-0 overflow-y-auto p-6" data-testid="brainstorm-selection-preview">
              <div className="text-xs font-black text-slate-400">{preview.meta}</div>
              <h3 className="mt-2 text-xl font-black text-slate-900">{preview.title}</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{preview.summary}</p>
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                <section>
                  <h4 className="text-sm font-black text-slate-800">主角设想</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{preview.protagonist}</p>
                </section>
                <section>
                  <h4 className="text-sm font-black text-slate-800">核心看点</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{preview.hook}</p>
                </section>
                <section>
                  <h4 className="text-sm font-black text-slate-800">主要冲突</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{preview.conflict}</p>
                </section>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBrainstorm(preview.id)}
                className={`mt-5 h-9 rounded-md px-4 text-sm font-black ${
                  selectedBrainstorm === preview.id
                    ? 'border border-[#08AACE] bg-white text-[#078FAB]'
                    : 'bg-[#08AACE] text-white hover:bg-[#078FAB]'
                }`}
              >
                {selectedBrainstorm === preview.id ? '已选择这个脑洞' : '选择这个脑洞'}
              </button>
            </article>
          </div>
          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <ActionButton variant="secondary" onClick={() => setStep('method')}>
              上一步
            </ActionButton>
            <ActionButton disabled={!selected} onClick={() => selected && onCreateFromBrainstorm(selected.title)}>
              关联并进入工作台
            </ActionButton>
          </footer>
        </>
      )}
    </AppModalShell>
  );
}

const TEMPLATE_OPTIONS = [
  ['默认男频长篇模板', '作品、人物、地点、势力、道具资源、伏笔和怪物图鉴'],
  ['精简开书模板', '只保留作品定位、主角、核心世界规则和第一卷剧情'],
  ['空白自定义模板', '自行添加设定分组和设定名'],
] as const;

export function StandardModeTemplateDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (templateName: string) => void;
}) {
  const [selected, setSelected] = useState<(typeof TEMPLATE_OPTIONS)[number][0]>(TEMPLATE_OPTIONS[0][0]);

  return (
    <AppModalShell
      title="选择设定模板"
      subtitle="模板只决定要生成哪些设定，不会改变已关联的脑洞"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[680px]"
      heightClass="h-auto max-h-[78vh]"
      storageId="standard_mode_template_flow_test"
      centerOnOpen
    >
      <div className="space-y-2 p-6">
        {TEMPLATE_OPTIONS.map(([name, description]) => {
          const active = selected === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(name)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                active ? 'border-[#08AACE] bg-[#F4FBFD]' : 'border-slate-200 bg-white hover:border-[#8EDFEB]'
              }`}
            >
              <strong className="block text-sm font-black text-slate-900">{name}</strong>
              <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">{description}</span>
            </button>
          );
        })}
      </div>
      <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <ActionButton variant="secondary" onClick={onClose}>
          取消
        </ActionButton>
        <ActionButton onClick={() => onConfirm(selected)}>使用这个模板</ActionButton>
      </footer>
    </AppModalShell>
  );
}
