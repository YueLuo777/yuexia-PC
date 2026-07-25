import { useMemo, useState } from 'react';

import {
  STRUCTURED_SETTING_FIELD_SETS,
  type StructuredSettingFieldSet,
} from '@/features/workbench/components/workbenchStructuredSettings';

import { StructuredSettingCompactPreview } from './StructuredSettingCompactPreview';
import {
  ROLE_PREVIEW_FIELD_SET,
  STRUCTURED_SETTING_REPLICA_DOMAINS,
} from './structuredSettingCompactLayout';

const replicaFieldSets = [...STRUCTURED_SETTING_FIELD_SETS, ROLE_PREVIEW_FIELD_SET];
const flowTitles = ['脑洞', '设定', '章纲', '正文', '剧情审核', '文笔润色', '综合点评', '更新状态', '生成梗概'];

function ReplicaFlowHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-5 overflow-hidden border-b border-slate-200 bg-white px-4">
      <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-200 text-sm font-bold">
        <span className="px-3 py-1.5 text-slate-700">月下测试作品</span>
        <button type="button" className="border-l border-slate-200 px-3 text-slate-500 hover:bg-slate-50">
          作品信息
        </button>
      </div>
      <div className="scrollbar-hidden flex min-w-0 items-center gap-1.5 overflow-x-auto">
        {flowTitles.map((title) => (
          <button
            key={title}
            type="button"
            className={`h-8 shrink-0 rounded-lg px-3 text-xs font-bold transition ${
              title === '设定' ? 'bg-[#08AACE] text-white' : 'border border-slate-200 bg-white text-slate-500'
            }`}
          >
            {title}
          </button>
        ))}
      </div>
      <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
        测试复刻
      </span>
    </header>
  );
}

function ReplicaAiPanel() {
  const [instruction, setInstruction] = useState('');
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-100 bg-slate-50 px-3 pb-3 pt-3">
      <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#08AACE]/40 bg-white">
        <button type="button" className="border-r border-slate-200 px-3 py-2 text-left">
          <span className="block text-[11px] font-bold text-[#08AACE]">模型</span>
          <b className="block truncate text-xs text-slate-600">暂无可用模型</b>
        </button>
        <button type="button" className="px-3 py-2 text-left">
          <span className="block text-[11px] font-bold text-[#08AACE]">提示词</span>
          <b className="block truncate text-xs text-slate-600">设定</b>
        </button>
      </div>

      <section className="mt-3 flex min-h-[220px] flex-1 flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex h-10 items-center justify-between border-b border-slate-100 px-3">
          <b className="text-sm text-slate-700">生成设定</b>
          <button type="button" className="text-xs font-bold text-red-500">清空</button>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 text-center text-xs leading-5 text-slate-400">
          AI 生成或修改后的设定会显示在这里，测试页不会写入正式资料。
        </div>
      </section>

      <div className="mt-3 flex overflow-hidden rounded-[10px] border border-[#08AACE]/40 bg-white text-xs font-bold">
        <span className="bg-[#E9FAFE] px-2 py-2 text-[#078BA9]">关联</span>
        {['当前设定', '其他设定', '脑洞'].map((label) => (
          <button key={label} type="button" className="border-l border-cyan-100 px-2 text-slate-500 hover:bg-cyan-50">
            {label}
          </button>
        ))}
      </div>

      <button type="button" className="mt-3 h-9 rounded-[10px] bg-[#08AACE] text-sm font-bold text-white">
        智能导入设定
      </button>
      <textarea
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder="输入对话指令……"
        className="mt-3 h-20 resize-none rounded-[10px] border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#08AACE]"
      />
      <button type="button" className="mt-2 h-9 rounded-[10px] border border-[#08AACE] text-sm font-bold text-[#078FAE]">
        发送
      </button>
    </aside>
  );
}

export function StructuredSettingFullPageReplica() {
  const [activeDomainId, setActiveDomainId] = useState('work');
  const [activeFieldSetId, setActiveFieldSetId] = useState(STRUCTURED_SETTING_REPLICA_DOMAINS[0].fieldSetIds[0]);
  const activeDomain = STRUCTURED_SETTING_REPLICA_DOMAINS.find((domain) => domain.id === activeDomainId)!;
  const domainFieldSets = useMemo(
    () =>
      activeDomain.fieldSetIds.flatMap((id) => {
        const fieldSet = replicaFieldSets.find((item) => item.id === id);
        return fieldSet ? [fieldSet] : [];
      }),
    [activeDomain],
  );
  const activeFieldSet = replicaFieldSets.find((fieldSet) => fieldSet.id === activeFieldSetId) ?? domainFieldSets[0];
  const groupedFieldSets = domainFieldSets.reduce<Record<string, StructuredSettingFieldSet[]>>((groups, fieldSet) => {
    (groups[fieldSet.entryType] ??= []).push(fieldSet);
    return groups;
  }, {});

  const selectDomain = (domainId: string) => {
    const nextDomain = STRUCTURED_SETTING_REPLICA_DOMAINS.find((domain) => domain.id === domainId);
    if (!nextDomain) return;
    setActiveDomainId(domainId);
    setActiveFieldSetId(nextDomain.fieldSetIds[0]);
  };

  return (
    <div className="flex h-full min-h-[720px] flex-col overflow-hidden bg-white text-slate-700">
      <ReplicaFlowHeader />

      <nav className="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3">
        {STRUCTURED_SETTING_REPLICA_DOMAINS.map((domain) => {
          const active = domain.id === activeDomainId;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => selectDomain(domain.id)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-black transition ${
                active
                  ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAE] shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'
              }`}
            >
              {domain.title}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white' : 'bg-slate-100 text-slate-400'}`}>
                {domain.count}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(480px,1fr)_280px] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100 px-3">
            <b className="text-sm text-slate-800">{activeDomain.title}</b>
            <button type="button" className="rounded-lg bg-[#08AACE] px-3 py-1.5 text-xs font-bold text-white">新建</button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {Object.entries(groupedFieldSets).map(([groupTitle, fieldSets]) => (
              <section key={groupTitle} className="mb-3">
                <div className="px-2 py-1 text-xs font-black text-slate-400">{groupTitle}</div>
                {fieldSets.map((fieldSet) => {
                  const active = fieldSet.id === activeFieldSet?.id;
                  return (
                    <button
                      key={fieldSet.id}
                      type="button"
                      onClick={() => setActiveFieldSetId(fieldSet.id)}
                      className={`mt-1 flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-sm font-bold ${
                        active ? 'bg-[#E7F8FD] text-[#078FAE]' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{fieldSet.entryTitle}</span>
                      <span className="ml-2 shrink-0 text-[11px] text-slate-400">0字</span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
        </aside>

        <main className="min-h-0 min-w-0 bg-white">
          {activeFieldSet && (
            <StructuredSettingCompactPreview key={activeFieldSet.id} fieldSet={activeFieldSet} variant="workspace" />
          )}
        </main>

        <ReplicaAiPanel />
      </div>
    </div>
  );
}
