import { useState } from 'react';

import { ProfessionalSettingDiyCardsVariant } from './ProfessionalSettingDiyCardsVariant';
import { ProfessionalSettingDiyColumnsVariant } from './ProfessionalSettingDiyColumnsVariant';
import { ProfessionalSettingDiyPathVariant } from './ProfessionalSettingDiyPathVariant';
import { DiySurfaceFooter } from './ProfessionalSettingDiyShared';
import { ProfessionalSettingDiyTreeVariant } from './ProfessionalSettingDiyTreeVariant';
import { useProfessionalTemplateDiyController } from './useProfessionalTemplateDiyController';

type VariantId = 'columns' | 'tree' | 'cards' | 'path';

const VARIANTS: Array<{
  id: VariantId;
  title: string;
  recommendation: string;
  description: string;
}> = [
  { id: 'columns', title: 'E · 四栏联动', recommendation: '推荐：快速定位', description: '逐级进入，操作位置稳定' },
  { id: 'tree', title: 'F · 层级树', recommendation: '推荐：看清归属', description: '父子结构纵向完整展开' },
  { id: 'cards', title: 'G · 分层卡片', recommendation: '推荐：自由拼装', description: '按层铺开，局部集中编辑' },
  { id: 'path', title: 'H · 路径工作台', recommendation: '推荐：精确检查', description: '左看全路径，右改当前节点' },
];

export function ProfessionalTemplateDiyVariantsTestPage() {
  const [variantId, setVariantId] = useState<VariantId>('columns');
  const controller = useProfessionalTemplateDiyController();

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-[#F5F8FA] text-slate-700"
      data-testid="professional-template-diy-variants-test"
      data-active-variant={variantId}
      data-domain-count={controller.summary.domainCount}
    >
      <header className="flex h-[102px] shrink-0 items-center gap-5 border-b border-slate-200 bg-white px-6">
        <div className="w-[285px] shrink-0">
          <h1 className="text-base font-black">专业模板 DIY 设计</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">同一份结构，比较四种自由增删与锁定方式</p>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-2" aria-label="专业模板DIY方案">
          {VARIANTS.map((variant) => {
            const active = variant.id === variantId;
            return (
              <button
                type="button"
                key={variant.id}
                onClick={() => setVariantId(variant.id)}
                className={`h-[70px] min-w-0 rounded-lg border px-3 text-left transition ${
                  active
                    ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_rgba(8,170,206,0.08)]'
                    : 'border-slate-200 bg-white hover:border-[#9DDFEA] hover:bg-[#F8FCFD]'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className={`truncate text-sm ${active ? 'text-[#078FAB]' : 'text-slate-700'}`}>{variant.title}</strong>
                  <span className={`shrink-0 text-[10px] font-black ${active ? 'text-[#08AACE]' : 'text-slate-400'}`}>
                    {variant.recommendation}
                  </span>
                </span>
                <span className={`mt-2 block truncate text-xs font-semibold ${active ? 'text-[#35AFC6]' : 'text-slate-400'}`}>
                  {variant.description}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="min-w-0 truncate text-sm font-bold text-slate-500">
          当前路径：
          <span className="text-[#078FAB]">
            {controller.domain?.title ?? '未选择'} ＞ {controller.group?.title ?? '未选择'} ＞{' '}
            {controller.entry?.title ?? '未选择'}
          </span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-400">删除默认锁定；各方案共享当前 DIY 结构</span>
      </div>

      {variantId === 'columns' ? <ProfessionalSettingDiyColumnsVariant controller={controller} /> : null}
      {variantId === 'tree' ? <ProfessionalSettingDiyTreeVariant controller={controller} /> : null}
      {variantId === 'cards' ? <ProfessionalSettingDiyCardsVariant controller={controller} /> : null}
      {variantId === 'path' ? <ProfessionalSettingDiyPathVariant controller={controller} /> : null}

      <DiySurfaceFooter controller={controller} />
    </div>
  );
}

export default ProfessionalTemplateDiyVariantsTestPage;
