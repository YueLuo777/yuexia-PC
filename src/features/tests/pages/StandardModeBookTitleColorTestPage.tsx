import { useState } from 'react';

import {
  StandardModeWorkbenchNavigation,
  type StandardStageAction,
} from '@/features/workbench/components/StandardModeWorkbenchNavigation';

export type BookTitleColorOption = {
  id: string;
  name: string;
  color: string;
  positioning: string;
  recommendation: string;
  recommended?: boolean;
};

export const BOOK_TITLE_COLOR_OPTIONS: BookTitleColorOption[] = [
  {
    id: 'indigo',
    name: '方案 1 · 深靛蓝',
    color: '#3F4E8C',
    positioning: '沉稳、清晰、有作品标识感',
    recommendation: '首选推荐。能明显区别于青色选中按钮，同时保持专业、耐看的整体气质。',
    recommended: true,
  },
  {
    id: 'midnight-blue',
    name: '方案 2 · 午夜蓝',
    color: '#24415F',
    positioning: '克制、稳重、偏工具感',
    recommendation: '适合希望书名显眼但不过分抢焦点的界面，长时间使用最安静。',
  },
  {
    id: 'slate-teal',
    name: '方案 3 · 黛青蓝',
    color: '#245E70',
    positioning: '延续品牌青，但层级更深',
    recommendation: '适合不想大幅改变现有配色，只希望书名比当前更稳、更有分量。',
  },
  {
    id: 'ink-green',
    name: '方案 4 · 墨绿',
    color: '#2F6957',
    positioning: '文艺、自然、舒缓',
    recommendation: '适合小说创作氛围，辨识度不错，但与现有品牌青的联系会稍弱。',
  },
  {
    id: 'deep-violet',
    name: '方案 5 · 深紫罗兰',
    color: '#654A8E',
    positioning: '创意、轻奢、个性明显',
    recommendation: '适合强化“创作软件”的想象感，视觉更有性格，建议确认后再用于正式页。',
  },
  {
    id: 'wine-red',
    name: '方案 6 · 暗酒红',
    color: '#8B4251',
    positioning: '成熟、温暖、叙事感强',
    recommendation: '适合强调作品名的情绪感，但会成为导航里最强的视觉焦点。',
  },
  {
    id: 'amber-brown',
    name: '方案 7 · 琥珀棕',
    color: '#8A5D2A',
    positioning: '古典、纸张感、偏文学',
    recommendation: '适合古风或传统阅读气质，与当前冷色界面形成温暖对比。',
  },
  {
    id: 'graphite-blue',
    name: '方案 8 · 石墨蓝',
    color: '#46566B',
    positioning: '中性、可靠、低干扰',
    recommendation: '适合追求统一和耐看，不会抢过当前页面按钮，但醒目程度相对温和。',
  },
  {
    id: 'charcoal',
    name: '方案 9 · 炭灰',
    color: '#424B55',
    positioning: '极简、直接、信息优先',
    recommendation: '与正文按钮最统一，适合极简路线；缺点是书名与普通文字的差异最小。',
  },
  {
    id: 'deep-brand-cyan',
    name: '方案 10 · 加深品牌青',
    color: '#066F86',
    positioning: '熟悉、统一、改动最保守',
    recommendation: '保留现有品牌方向，只增强深浅对比；适合不希望引入新色相时采用。',
  },
];

function BookTitleColorPreview({ option }: { option: BookTitleColorOption }) {
  const [activeAction, setActiveAction] = useState<StandardStageAction>('settingsList');

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white ${
        option.recommended ? 'border-[#9DA9D8] shadow-[0_8px_24px_rgba(63,78,140,0.12)]' : 'border-[#DCE1E8]'
      }`}
      data-book-title-color-option={option.id}
      data-book-title-color-recommended={option.recommended ? 'true' : undefined}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDF0F3] bg-[#FBFCFD] px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: option.color }} />
            <h2 className="text-sm font-black text-[#27313D]">{option.name}</h2>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
              {option.color}
            </code>
            {option.recommended ? (
              <span className="rounded-full border border-[#BEC7EC] bg-[#EEF1FF] px-2 py-0.5 text-[11px] font-black text-[#3F4E8C]">
                首选推荐
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{option.positioning}</p>
        </div>
        <p className="max-w-2xl text-xs font-medium leading-5 text-slate-600">{option.recommendation}</p>
      </header>
      <div className="overflow-x-auto bg-white">
        <div className="min-w-[1280px]">
          <StandardModeWorkbenchNavigation
            bookTitle="吞噬系统"
            bookTitleColor={option.color}
            activeAction={activeAction}
            onSelectAction={(_group, action) => setActiveAction(action)}
          />
        </div>
      </div>
    </article>
  );
}

export function StandardModeBookTitleColorTestPage() {
  const recommended = BOOK_TITLE_COLOR_OPTIONS.find((option) => option.recommended);

  return (
    <main className="min-h-full bg-[#F4F6F8] p-5" data-standard-mode-book-title-color-test="true">
      <section className="mx-auto max-w-[1500px]">
        <header className="rounded-xl border border-[#DCE1E8] bg-white px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-black text-[#27313D]">标准模式书名颜色 · 10 种方案</h1>
            <span className="rounded-full bg-[#EEF1FF] px-3 py-1 text-xs font-black text-[#3F4E8C]">
              推荐：{recommended?.name.replace('方案 1 · ', '')}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            首选深靛蓝：它能把“书名”从作品详情等黑色按钮中区分出来，也不会与青色选中态混在一起。
          </p>
          <div className="mt-4 grid gap-3 text-xs font-medium leading-5 text-slate-600 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <strong className="text-emerald-800">可以调整：</strong>书名文字颜色，以及最终确认后的轻微字重微调。
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <strong className="text-slate-700">保持不变：</strong>书名居中、15 字宽度上限、超长截断、流程按钮和功能栏边界。
            </div>
          </div>
        </header>

        <div className="mt-4 space-y-4">
          {BOOK_TITLE_COLOR_OPTIONS.map((option) => (
            <BookTitleColorPreview key={option.id} option={option} />
          ))}
        </div>
      </section>
    </main>
  );
}
