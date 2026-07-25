import { SendHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { PreviewId } from '@/features/tests/pages/workSettingTaxonomyProposalData';

const AI_PROMPT_BY_PREVIEW: Record<PreviewId, string> = {
  'work-positioning': '根据当前作品定位补全所选字段，保持故事类型、核心创意和一句话概括互相一致。',
  'world-background': '根据当前世界背景补全所选字段，保持时代背景、世界格局和社会秩序互相一致。',
  'lin-ke': '根据当前男主设定补全所选字段，保持基础档案、金手指规则、实力手段、当前状态和人物关系一致。',
  'su-wan-ning': '根据当前女主设定补全所选字段，保持基础档案、实力手段、剧情定位和人物关系一致。',
  'han-zhen': '根据当前重要配角设定补全所选字段，保持基础档案、实力边界、剧情作用和阵营立场一致。',
  'xue-wu-hen': '根据当前反派设定补全所选字段，保持基础档案、实力手段、反派计划和弱点破绽一致。',
};

export function WorkSettingTaxonomyAiPanel({ selectedId }: { selectedId: PreviewId }) {
  const [input, setInput] = useState('');

  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-[#F8FAFC] p-3">
      <div className="flex h-11 items-center gap-2 border-b border-slate-200 px-1">
        <Sparkles className="h-4 w-4 text-[#08AACE]" />
        <h2 className="text-sm font-black text-slate-800">生成设定</h2>
        <span className="ml-auto rounded border border-[#AEE7F1] bg-[#EAF9FD] px-2 py-1 text-[10px] font-black text-[#078FAE]">
          AI
        </span>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-lg border-2 border-[#078FAE] bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">模型提示词</div>
        <div className="min-h-0 flex-1 px-4 py-3 text-sm font-medium leading-7 text-slate-500">
          {AI_PROMPT_BY_PREVIEW[selectedId]}
        </div>
      </div>
      <label className="mt-3 flex min-h-11 items-end gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <textarea
          aria-label="AI对话输入"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="输入对话指令..."
          rows={1}
          className="min-h-8 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm outline-none"
        />
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#08AACE] text-white"
          title="发送"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </label>
    </aside>
  );
}
