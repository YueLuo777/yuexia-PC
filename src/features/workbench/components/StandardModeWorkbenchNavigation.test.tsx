import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  StandardModeWorkbenchNavigation,
  type StandardStage,
  type StandardStageAction,
} from './StandardModeWorkbenchNavigation';

function NavigationHarness() {
  const [stage, setStage] = useState<StandardStage | null>(null);
  const [action, setAction] = useState<StandardStageAction | null>(null);
  return (
    <StandardModeWorkbenchNavigation
      title="九重天劫"
      channelLabel="男频"
      categoryLabel="玄幻"
      activeStage={stage}
      activeAction={action}
      workInfoOpen={false}
      onSelectHome={() => {
        setStage(null);
        setAction(null);
      }}
      onSelectStage={(nextStage) => {
        setStage(nextStage);
        setAction(null);
      }}
      onSelectAction={(nextStage, nextAction) => {
        setStage(nextStage);
        setAction(nextAction);
      }}
      onOpenWorkInfo={() => undefined}
      endAction={<button type="button">设定生成流程</button>}
    />
  );
}

describe('StandardModeWorkbenchNavigation', () => {
  it('renders the four bordered stages and their requested branch actions', () => {
    render(<NavigationHarness />);

    expect(screen.getByRole('banner')).toHaveClass('overflow-x-auto', 'overflow-y-hidden');
    ['准备阶段', '设定阶段', '创作阶段', '检查阶段'].forEach((label) => {
      expect(screen.getByRole('button', { name: new RegExp(label) }).closest('section')).toHaveClass('border');
    });
    ['脑洞库', '生成脑洞', '新建设定', '设定列表', '章纲', '正文', '审核剧情', '更新状态', '生成梗概'].forEach(
      (label) => expect(screen.getByRole('button', { name: label })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: '完善设定' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '工作台首页' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '工作台首页' })).toHaveClass('h-10');
    expect(screen.getByRole('button', { name: '工作台首页' })).not.toHaveClass('mt-0.5');
    expect(screen.getByRole('button', { name: /准备阶段/ })).toHaveClass('border-b');
    expect(screen.getByRole('button', { name: '设定生成流程' })).toBeInTheDocument();
    expect(screen.getByText('九重天劫')).toBeInTheDocument();
    expect(screen.getByText('男频')).toBeInTheDocument();
    expect(screen.getByText('玄幻')).toBeInTheDocument();
  });

  it('selects a branch action together with its parent stage', () => {
    render(<NavigationHarness />);

    fireEvent.click(screen.getByRole('button', { name: '更新状态' }));

    expect(screen.getByRole('button', { name: /检查阶段/ }))
      .toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /检查阶段/ }).closest('section'))
      .toHaveClass('border-[#08AACE]', 'bg-[#F3FCFE]');
    expect(screen.getByRole('button', { name: '更新状态' }))
      .toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '更新状态' }))
      .toHaveClass('border-[#08AACE]', 'bg-[#DFF6FB]');
    expect(screen.getByRole('button', { name: '工作台首页' })).not.toHaveAttribute('aria-current');
  });

  it('routes create settings to template selection and setting list to the initialized workspace', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../pages/StandardModeWorkbenchPage.tsx'),
      'utf8',
    );

    expect(source).toContain("activeAction === 'createSettings' || activeAction === 'settingsList'");
    expect(source).toContain("forceTemplateSelection={activeAction === 'createSettings'}");
    expect(source).toContain("setActiveAction('settingsList')");
    expect(source).toContain("ownerTestMode && activeAction === 'settingsList'");
  });
});
