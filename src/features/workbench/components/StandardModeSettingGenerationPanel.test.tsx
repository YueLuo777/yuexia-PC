import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/prompts/hooks/usePrompts', () => ({
  usePrompts: () => ({
    prompts: [{ id: 'prompt-1', name: '作品设定生成', category: '内置', content: '内置提示词正文' }],
  }),
}));

import { StandardModeSettingGenerationPanel } from './StandardModeSettingGenerationPanel';
import {
  createStandardSettingGenerationState,
  writeStandardSettingGenerationState,
} from '@/features/workbench/model/standardModeSettingGenerationFlow';
import { publishStandardModeSettingNavigationAction } from '@/features/workbench/model/standardModeSettingNavigationEvents';

describe('StandardModeSettingGenerationPanel', () => {
  beforeEach(() => localStorage.clear());

  it('shows five plain-language steps without model or prompt selectors', () => {
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-1"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    ['基础设定', '剧情规划', '主要人物', '地点与势力', '创作补充'].forEach((name) => {
      expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
    });
    expect(screen.queryByText('模型')).not.toBeInTheDocument();
    expect(screen.queryByText('提示词')).not.toBeInTheDocument();
    expect(screen.queryByText('生成作品设定')).not.toBeInTheDocument();
    expect(screen.queryByText('后台按五步生成并写入左侧设定')).not.toBeInTheDocument();
    expect(screen.queryByText('0/5')).not.toBeInTheDocument();
    expect(screen.getAllByText('未生成')).toHaveLength(5);
    expect(screen.getByRole('progressbar', { name: '作品设定生成进度' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('textbox', { name: '作品设定用户要求' })).toHaveClass('h-24', 'flex-none');
    const stepGenerateButtons = screen.getAllByRole('button', { name: '生成' });
    expect(stepGenerateButtons).toHaveLength(1);
    expect(stepGenerateButtons[0]).toBeEnabled();
    const stepCards = screen.getAllByText('未生成').map((status) => status.closest('[data-standard-setting-step]'));
    stepCards.forEach((card) => {
      expect(card).not.toBeNull();
      expect(card?.querySelector('[data-standard-setting-action-slot="true"]')).toHaveClass('w-20');
    });
    expect(stepCards.slice(1).every((card) => card?.querySelector('[data-standard-setting-action-slot="true"]')?.childElementCount === 0)).toBe(true);
    expect(stepGenerateButtons[0]).toHaveClass('whitespace-nowrap');
  });

  it('resets the visible generation steps when setting content is cleared', async () => {
    writeStandardSettingGenerationState('settings-clear-flow', {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 1,
      completedStepIds: ['world-foundation'],
    });
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-clear-flow"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.getByText('已生成')).toBeInTheDocument();
    publishStandardModeSettingNavigationAction({ action: 'settings-cleared', storageKey: 'settings-clear-flow' });

    await waitFor(() => {
      expect(screen.getAllByText('未生成')).toHaveLength(5);
      expect(screen.queryByText('已生成')).not.toBeInTheDocument();
    });
  });

  it('uses the built-in prompt and user requirement when starting the workflow', () => {
    const onGenerate = vi.fn();
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-2"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={onGenerate}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('作品设定用户要求'), { target: { value: '主角做事果断' } });
    expect(screen.getByText('用户要求')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '脑洞' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '一键生成全部' }));

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(onGenerate.mock.calls[0][0]).toContain('内置提示词正文');
    expect(onGenerate.mock.calls[0][0]).toContain('基础设定');
    expect(onGenerate.mock.calls[0][0]).toContain('主角做事果断');
    expect(onGenerate.mock.calls[0][0]).not.toContain('【关联脑洞】');
    expect(onGenerate.mock.calls[0][1]).toBe('生成设定：基础设定');
  });

  it('sends only visible setting content instead of internal storage JSON', () => {
    const onGenerate = vi.fn();
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-visible-context"
        entries={[
          {
            id: 'positioning',
            tab: '大纲',
            title: '作品定位',
            content: JSON.stringify({
              type: '核心设定',
              body: '主打吞噬升级与越级战斗。',
              structuredFieldSetId: 'prompt-work-positioning',
              lockedDefaultEntryId: '核心设定::作品定位',
            }),
            updatedAt: '2026/7/27',
          },
        ]}
        latestOutput=""
        isGenerating={false}
        onGenerate={onGenerate}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: '生成' })[0]);

    const request = onGenerate.mock.calls[0][0] as string;
    expect(request).toContain('【核心设定 / 作品定位】\n主打吞噬升级与越级战斗。');
    expect(request).not.toContain('"structuredFieldSetId"');
    expect(request).not.toContain('"lockedDefaultEntryId"');
    expect(request).not.toContain('"type":"核心设定"');
  });

  it('switches one-click checking to the detailed result view', () => {
    const onJumpToEmptyField = vi.fn();
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-3"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={onJumpToEmptyField}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '一键检查' }));

    expect(screen.getByRole('button', { name: /检查设定/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/发现 \d+ 处未填写/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '跳转' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: '一键生成全部' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新检查' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '跳转' })[0]);
    expect(onJumpToEmptyField).toHaveBeenCalledTimes(1);
  });

  it('shows the linked brainstorm name and sent-content word count', () => {
    localStorage.setItem(
      'xinyuexia_standard_brainstorm_link_5',
      JSON.stringify({
        id: 'brainstorm-5',
        title: '万界吞噬',
        content: '脑洞正文内容',
      }),
    );
    const onGenerate = vi.fn();

    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="xinyuexia_workbench_settings_5"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={onGenerate}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.getByText('已关联')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '万界吞噬' })).toHaveClass('bg-[#08AACE]', 'text-white');
    expect(screen.getByText('共 6 字')).toBeInTheDocument();
    const linkedControl = screen.getByRole('button', { name: '万界吞噬' }).parentElement;
    const requirement = screen.getByLabelText('作品设定用户要求');
    expect(linkedControl).toHaveClass('h-8', 'w-fit');
    expect(requirement.compareDocumentPosition(linkedControl as HTMLElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    fireEvent.click(screen.getByRole('button', { name: '一键生成全部' }));
    expect(onGenerate.mock.calls[0][0]).toContain('万界吞噬');
    expect(onGenerate.mock.calls[0][0]).toContain('脑洞正文内容');
  });

  it('allows manually linking a brainstorm from the professional reader modal', () => {
    localStorage.setItem(
      'xinyuexia_global_brainstorm_library_v1',
      JSON.stringify([
        {
          id: 'manual-brainstorm',
          tab: '脑洞',
          title: '手动脑洞',
          content: '手动选择的脑洞内容',
          updatedAt: '2026/7/27',
        },
      ]),
    );

    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="xinyuexia_workbench_settings_8"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.getByText('关联')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '脑洞' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '选择手动脑洞' }));
    fireEvent.click(screen.getByRole('button', { name: '确认关联' }));

    expect(screen.getByText('已关联')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '手动脑洞' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('xinyuexia_standard_brainstorm_link_8') ?? 'null')).toMatchObject({
      title: '手动脑洞',
      content: '手动选择的脑洞内容',
      sourceEntryId: 'manual-brainstorm',
    });
  });

  it('keeps the panel visually stable and imports only after silent generation finishes', async () => {
    const onImport = vi.fn(() => true);
    const view = render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-stream"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={onImport}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: '生成' })[0]);
    view.rerender(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-stream"
        entries={[]}
        latestOutput="[[THINKING seconds=15 status=thinking]]\n内部推理过程\n[[/THINKING]]\n<作品设定>\n<核心设定>"
        isGenerating
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={onImport}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(onImport).not.toHaveBeenCalled();
    expect(screen.getByText('生成中')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '作品设定生成进度' })).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.queryByText('最近生成结果')).not.toBeInTheDocument();
    expect(screen.queryByText(/status=thinking/)).not.toBeInTheDocument();
    expect(screen.getAllByText('未生成')).toHaveLength(4);
    expect(view.container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '作品设定用户要求' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /^(生成|重新生成)$/ })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '一键生成全部' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '暂停生成' })).toBeInTheDocument();

    view.rerender(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-stream"
        entries={[]}
        latestOutput="<作品设定>\n<核心设定>"
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={onImport}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    await waitFor(() => expect(onImport).toHaveBeenCalledOnce());
  });

  it('does not treat the visible user request as a completed AI response', () => {
    const onImport = vi.fn(() => false);
    const view = render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-request-order"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={onImport}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: '生成' })[0]);
    view.rerender(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-request-order"
        entries={[]}
        latestOutput="[[USER]]\n生成设定：基础设定"
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={onImport}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.queryByText('生成中')).not.toBeInTheDocument();
    expect(screen.queryByText('生成失败')).not.toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });

  it('unlocks only the next step after the previous step is completed', () => {
    writeStandardSettingGenerationState('settings-unlock', {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 1,
      completedStepIds: ['world-foundation'],
    });

    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-unlock"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    const stepGenerateButtons = screen.getAllByRole('button', { name: /^(生成|重新生成)$/ });
    expect(stepGenerateButtons).toHaveLength(2);
    expect(stepGenerateButtons[0]).toHaveTextContent('重新生成');
    expect(stepGenerateButtons[0]).toBeEnabled();
    expect(stepGenerateButtons[1]).toBeEnabled();
    const thirdStep = screen.getByText('3. 主要人物').closest('[data-standard-setting-step]');
    expect(thirdStep).not.toBeNull();
    expect(within(thirdStep as HTMLElement).queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears check results when the panel is recreated', () => {
    const view = render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-check-session"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '一键检查' }));
    expect(screen.getByRole('button', { name: /检查设定 \d+/ })).toBeInTheDocument();
    view.unmount();

    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-check-session"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '检查设定' })).toBeInTheDocument();
  });

  it('does not show output from a generation history that has been reset', () => {
    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-reset-output"
        entries={[]}
        latestOutput="旧模板的基础设定生成结果"
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.queryByText('旧模板的基础设定生成结果')).not.toBeInTheDocument();
    expect(screen.getAllByText('未生成')).toHaveLength(5);
  });

  it('shows an interrupted step as paused and offers to continue it', () => {
    writeStandardSettingGenerationState('settings-4', {
      ...createStandardSettingGenerationState(),
      currentStepIndex: 2,
      completedStepIds: ['world-foundation', 'plot-planning'],
      status: 'running',
    });

    render(
      <StandardModeSettingGenerationPanel
        settingsStorageKey="settings-4"
        entries={[]}
        latestOutput=""
        isGenerating={false}
        onGenerate={vi.fn()}
        onStop={vi.fn()}
        onImport={() => true}
        onJumpToEmptyField={vi.fn()}
      />,
    );

    expect(screen.getAllByText('已生成')).toHaveLength(2);
    expect(screen.getByText('已暂停')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '继续当前步骤' })).toBeInTheDocument();
  });
});
