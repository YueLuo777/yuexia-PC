import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  StandardModeWorkbenchNavigation,
  type StandardNavigationGroup,
  type StandardStageAction,
} from './StandardModeWorkbenchNavigation';

function NavigationHarness({ locked = false }: { locked?: boolean }) {
  const [action, setAction] = useState<StandardStageAction>('writing');
  const [group, setGroup] = useState<StandardNavigationGroup>('creationFlow');
  return (
    <>
      <StandardModeWorkbenchNavigation
        locked={locked}
        activeAction={action}
        onSelectAction={(nextGroup, nextAction) => {
          setGroup(nextGroup);
          setAction(nextAction);
        }}
      />
      <output data-testid="selected-group">{group}</output>
    </>
  );
}

describe('StandardModeWorkbenchNavigation', () => {
  it('renders the two requested compact capsule groups in a single row', () => {
    render(<NavigationHarness />);

    expect(screen.getByRole('banner')).toHaveClass('h-12', 'overflow-x-auto', 'overflow-y-hidden');
    const navigation = screen.getByRole('navigation', { name: '标准模式创作导航' });
    expect(navigation).toHaveClass('min-w-max', 'justify-center');
    const creation = screen.getByRole('region', { name: '创作流程' });
    const tools = screen.getByRole('region', { name: '功能栏' });
    expect(creation).toHaveClass('xy-capsule-group');
    expect(tools).toHaveClass('xy-capsule-group');
    expect(within(creation).getAllByRole('button').map((button) => button.textContent)).toEqual([
      '作品详情',
      '作品设定',
      '生成正文',
      '审核检查',
    ]);
    expect(within(tools).getAllByRole('button').map((button) => button.textContent)).toEqual([
      '生成脑洞',
      '取名',
      '生成章纲',
      '更新状态',
      '生成梗概',
    ]);
    expect(document.querySelectorAll('[data-stage-flow-arrow="true"]')).toHaveLength(0);
    expect(screen.queryByText('开书阶段')).not.toBeInTheDocument();
    expect(screen.queryByText('更换设定模板')).not.toBeInTheDocument();
    expect(screen.queryByText('脑洞库')).not.toBeInTheDocument();
  });

  it('selects actions independently across the creation flow and tool groups', () => {
    render(<NavigationHarness />);

    expect(screen.getByRole('button', { name: '生成正文' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: '审核检查' }));
    expect(screen.getByRole('button', { name: '审核检查' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('selected-group')).toHaveTextContent('creationFlow');

    fireEvent.click(screen.getByRole('button', { name: '更新状态' }));
    expect(screen.getByRole('button', { name: '更新状态' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '审核检查' })).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('selected-group')).toHaveTextContent('tools');
  });

  it('keeps indirect settings and brainstorm pages highlighted under their public entry', () => {
    const { rerender } = render(
      <StandardModeWorkbenchNavigation activeAction="createSettings" onSelectAction={() => {}} />,
    );
    expect(screen.getByRole('button', { name: '作品设定' })).toHaveAttribute('aria-current', 'page');

    rerender(<StandardModeWorkbenchNavigation activeAction="changeSettingTemplate" onSelectAction={() => {}} />);
    expect(screen.getByRole('button', { name: '作品设定' })).toHaveAttribute('aria-current', 'page');

    rerender(<StandardModeWorkbenchNavigation activeAction="brainstormLibrary" onSelectAction={() => {}} />);
    expect(screen.getByRole('button', { name: '生成脑洞' })).toHaveAttribute('aria-current', 'page');
  });

  it('locks every navigation action during setting generation', () => {
    render(<NavigationHarness locked />);

    expect(screen.getByRole('banner')).toHaveAttribute('inert');
    expect(screen.getByRole('banner')).toHaveAttribute('data-standard-navigation-locked', 'true');
    expect(screen.getByRole('banner')).toHaveClass('pointer-events-none', 'opacity-60');
  });

  it('defaults each opened book to writing and maps every navigation entry to the formal page', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../pages/StandardModeWorkbenchPage.tsx'),
      'utf8',
    );

    expect(source).toContain("useState<StandardStageAction>('writing')");
    expect(source).toContain("setActiveAction('writing')");
    expect(source).toContain("setActiveAction(hasSettings ? 'settingsList' : 'createSettings')");
    expect(source).toContain("activeAction === 'workDetails' || activeAction === 'naming'");
    expect(source).toContain("externalAiOptimizerTarget={activeAction === 'naming' ? 'both' : null}");
    expect(source).toContain("activeAction === 'storyAudit'");
    expect(source).toContain("activeAction === 'statusUpdate'");
    expect(source).toContain("activeAction === 'summary'");
    expect(source).not.toContain('PROCESS_STEPS');
  });
});
