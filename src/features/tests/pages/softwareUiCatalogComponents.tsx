import { BookOpen, Database, GripVertical, Search, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import type { TechItem } from './softwareUiCatalogTypes';

export function TechPreview({ item }: { item: TechItem }) {
  const previewShell = 'min-h-[86px] rounded-2xl border border-slate-100 bg-white p-3';

  if (item.id === 'T-01') {
    return (
      <div className={`${previewShell} grid grid-cols-[1fr_12px_1fr] items-stretch gap-2 bg-slate-50`}>
        <div className="rounded-xl bg-white p-2 text-xs font-black text-slate-500">左侧栏</div>
        <div className="flex items-center justify-center rounded-full bg-[#E6F7FB] text-[#08AACE]">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="rounded-xl bg-white p-2 text-xs font-black text-slate-500">正文区</div>
      </div>
    );
  }

  if (item.id === 'T-02') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        <div className="absolute left-4 top-4 h-12 w-24 rounded-xl border-2 border-[#08AACE] bg-white shadow-sm" />
        <div className="absolute bottom-4 right-4 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-[#08AACE]" />
      </div>
    );
  }

  if (item.id === 'T-03') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="absolute h-11 w-28 rounded-xl border border-slate-200 bg-white shadow-sm"
            style={{ left: 18 + index * 18, top: 18 + index * 10, zIndex: index }}
          />
        ))}
        <span className="absolute bottom-3 right-3 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black text-white">
          Esc
        </span>
      </div>
    );
  }

  if (item.id === 'T-04') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-900/10`}>
        <div className="h-12 w-28 rounded-xl bg-white p-2 text-center text-xs font-black text-slate-700 shadow-sm">
          弹窗
        </div>
      </div>
    );
  }

  if (item.id === 'T-05') {
    return (
      <div className={`${previewShell} overflow-hidden bg-slate-50 p-0`}>
        <div className="grid grid-cols-2 bg-[#E6F7FB] px-3 py-2 text-[11px] font-black text-[#078fb0]">
          <span>原文</span>
          <span>替换为</span>
        </div>
        {[1, 2, 3].map((row) => (
          <div key={row} className="mx-3 border-b border-slate-100 py-1.5 text-xs text-slate-400">
            滚动内容 {row}
          </div>
        ))}
      </div>
    );
  }

  if (item.id === 'T-06') {
    return (
      <div className={`${previewShell} bg-slate-50`}>
        <div className="h-9 rounded-xl border border-[#08AACE] bg-white px-3 py-2 text-xs font-bold text-slate-500">
          输入一行
        </div>
        <div className="mt-2 h-12 rounded-xl border border-[#08AACE] bg-white px-3 py-2 text-xs font-bold text-slate-500">
          内容变多后自动变高
        </div>
      </div>
    );
  }

  if (item.id === 'T-07') {
    return (
      <div className={`${previewShell} bg-slate-50`}>
        <div className="h-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">
          只读内容，可以选中复制
        </div>
      </div>
    );
  }

  if (item.id === 'T-08') {
    return (
      <div className={`${previewShell} flex items-center justify-center gap-3 bg-slate-50`}>
        <Settings className="h-5 w-5 text-[#08AACE]" />
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">已记住</span>
      </div>
    );
  }

  if (item.id === 'T-09') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {['设定', '角色', '脑洞'].map((tab) => (
            <span
              key={tab}
              className={`rounded-lg px-3 py-1.5 text-xs font-black ${tab === '角色' ? 'bg-white text-[#08AACE] shadow-sm' : 'text-slate-400'}`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'T-10') {
    return (
      <div className={`${previewShell} flex items-center gap-2 bg-slate-50`}>
        <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">角色A</div>
        <span className="text-[#08AACE]">→</span>
        <div className="rounded-xl border border-dashed border-[#08AACE] px-3 py-2 text-xs font-black text-[#08AACE]">
          新分类
        </div>
      </div>
    );
  }

  if (item.id === 'T-11') {
    return (
      <div className={`${previewShell} relative bg-slate-50`}>
        <div className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">右键章节</div>
        <div className="absolute bottom-3 right-3 w-24 overflow-hidden rounded-xl border border-slate-100 bg-white text-xs font-black text-slate-600 shadow-lg">
          <div className="px-3 py-1.5">修改</div>
          <div className="px-3 py-1.5 text-red-500">删除</div>
        </div>
      </div>
    );
  }

  if (item.id === 'T-12') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
        <div className="relative h-12 w-36">
          <div className="absolute left-2 top-6 h-1 w-28 rounded-full bg-[#08AACE]" />
          <div className="absolute left-1 top-4 h-5 w-5 rounded-full bg-[#08AACE]" />
          <span className="absolute right-0 top-2 text-xl font-black text-[#08AACE]">←</span>
        </div>
      </div>
    );
  }

  if (item.id === 'T-13') {
    return (
      <div
        className={`${previewShell} grid grid-cols-3 items-center gap-2 bg-slate-50 text-center text-[11px] font-black text-slate-600`}
      >
        <div className="rounded-xl bg-white py-2 shadow-sm">输入</div>
        <div className="rounded-xl bg-[#E6F7FB] py-2 text-[#08AACE]">AI</div>
        <div className="rounded-xl bg-white py-2 shadow-sm">结果</div>
      </div>
    );
  }

  if (item.id === 'T-14') {
    return (
      <div
        className={`${previewShell} grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-slate-50 text-[11px] font-black`}
      >
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">设定库</div>
        <Search className="h-4 w-4 text-[#08AACE]" />
        <div className="rounded-xl bg-[#E6F7FB] p-2 text-[#078fb0]">相关上下文</div>
      </div>
    );
  }

  if (item.id === 'T-15') {
    return (
      <div className={`${previewShell} flex items-center justify-center gap-3 bg-slate-50`}>
        <Database className="h-7 w-7 text-[#08AACE]" />
        <div className="text-xs font-black text-slate-600">本地 PostgreSQL</div>
      </div>
    );
  }

  if (item.id === 'T-16') {
    return (
      <div
        className={`${previewShell} flex items-center justify-center gap-2 bg-slate-50 text-xs font-black text-slate-600`}
      >
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">App</div>
        <span>+</span>
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">资源</div>
      </div>
    );
  }

  if (item.id === 'T-17') {
    return (
      <div className={`${previewShell} flex justify-end bg-slate-50 pr-4`}>
        <div className="h-full w-2 rounded-full bg-transparent">
          <div className="mt-4 h-9 w-2 rounded-full bg-[#08AACE]" />
        </div>
      </div>
    );
  }

  if (item.id === 'T-18') {
    return (
      <div className={`${previewShell} grid grid-cols-[70px_1fr] gap-2 bg-slate-50 text-xs font-black`}>
        <div className="rounded-xl bg-[#08AACE] p-2 text-white">第3章</div>
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">对应梗概 / 细纲</div>
      </div>
    );
  }

  if (item.id === 'T-20') {
    return (
      <div className={`${previewShell} flex items-center justify-center bg-slate-50 px-5`}>
        <div className="relative h-20 w-full rounded-[22px] border-2 border-slate-900 bg-white">
          <span className="xy-border-embedded-transparent-backplate absolute left-6 top-0 -translate-y-1/2 text-xs font-black leading-5 text-slate-950">
            第1章 我只是想修个水管 正文：<span className="text-[#08AACE]">3056</span>
            <span className="text-slate-400"> 字</span>
          </span>
          <span className="xy-border-embedded-transparent-backplate absolute bottom-0 right-5 translate-y-1/2 text-[11px] font-black text-[#08AACE]">
            89 字
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${previewShell} flex items-center justify-center bg-slate-50`}>
      <div className="inline-flex overflow-hidden rounded-xl border border-[#08AACE] bg-white text-xs font-black">
        <button className="px-3 py-2 text-[#08AACE]">复制</button>
        <button className="border-l border-[#08AACE] bg-[#08AACE] px-3 py-2 text-white">优化</button>
      </div>
    </div>
  );
}

export function TechDictionaryCard({
  item,
  action,
  tone = 'soft',
}: {
  item: TechItem;
  action: ReactNode;
  tone?: 'soft' | 'white';
}) {
  const articleBg = tone === 'white' ? 'bg-white' : 'bg-slate-50';
  const codeBg = tone === 'white' ? 'bg-slate-50' : 'bg-white';

  return (
    <article id={`catalog-${item.id}`} className={`scroll-mt-7 rounded-xl border border-slate-100 ${articleBg} p-4`}>
      <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)_320px_auto] xl:items-start">
        <NumberPill id={item.id} />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900">
            {item.id === 'T-01' ? (
              <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{item.plain}</div>
        </div>
        <div className="min-w-0">
          <TechPreview item={item} />
        </div>
        <div className="flex justify-end xl:pt-0.5">{action}</div>
      </div>
      <code className={`mt-3 block rounded-lg ${codeBg} px-3 py-2 text-xs font-bold leading-5 text-slate-500`}>
        {item.tech}
      </code>
    </article>
  );
}

export function SectionTitle({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export function NumberPill({ id }: { id: string }) {
  return <div className="text-2xl font-black leading-none text-brand">{id}</div>;
}
