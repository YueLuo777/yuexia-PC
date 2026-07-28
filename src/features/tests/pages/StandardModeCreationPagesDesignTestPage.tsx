import { useState } from 'react';

import { ProfessionalWorkbenchBaselineTestPage } from './ProfessionalWorkbenchBaselineTestPage';
import type { WorkbenchCreationFlowPageKey } from '@/features/workbench/model/workbenchCreationFlow';

type PreviewPage = 'setting' | 'outline' | 'writing' | 'audit';
type PreviewFlow = Extract<WorkbenchCreationFlowPageKey, 'outline' | 'chapterOutline' | 'writing' | 'audit'>;

const PAGE_TABS: Array<{ id: PreviewPage; label: string; flow: PreviewFlow }> = [
  { id: 'setting', label: '设定', flow: 'outline' },
  { id: 'outline', label: '章纲', flow: 'chapterOutline' },
  { id: 'writing', label: '正文', flow: 'writing' },
  { id: 'audit', label: '审核剧情', flow: 'audit' },
];

export function StandardModeCreationPagesDesignTestPage() {
  const [activePage, setActivePage] = useState<PreviewPage>('setting');
  const activeTab = PAGE_TABS.find((tab) => tab.id === activePage) ?? PAGE_TABS[0];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-testid="standard-mode-professional-logic-preview">
      <div className="flex h-12 shrink-0 items-center justify-center border-b border-[#dce1e8] bg-[#f8fafc] px-4">
        <div className="grid h-8 w-[480px] grid-cols-4 overflow-hidden rounded-md border border-[#BFC8D2] bg-white">
          {PAGE_TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activePage === tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`text-sm font-bold transition-colors ${index > 0 ? 'border-l border-[#BFC8D2]' : ''} ${
                activePage === tab.id ? 'bg-[#DFF7FC] text-[#078FAB]' : 'text-[#657180] hover:bg-[#f8fafc]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ProfessionalWorkbenchBaselineTestPage experience="standard" fixedFlow={activeTab.flow} showHeader={false} />
      </div>
    </div>
  );
}

export default StandardModeCreationPagesDesignTestPage;
