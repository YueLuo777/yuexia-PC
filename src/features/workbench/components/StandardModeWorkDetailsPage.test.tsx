import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';

import { StandardModeWorkDetailsPage } from './StandardModeWorkDetailsPage';

vi.mock('@/features/novels/hooks/useDefaultNovelCover', () => ({
  useDefaultNovelCover: () => ({
    selectedCover: { src: 'default-cover' },
  }),
}));

vi.mock('@/features/novels/model/defaultNovelCoverUpload', () => ({
  DEFAULT_COVER_UPLOAD_ACCEPT: 'image/png,image/jpeg,image/webp',
  prepareDefaultNovelCover: vi.fn(async () => 'uploaded-cover'),
}));

const novel: WorkbenchNovel = {
  id: 7,
  title: '星海问道',
  type: 'novel' as const,
  category: '玄幻',
  channel: 'male' as const,
  synopsis: '旧简介',
  creationStatus: 'planning' as const,
  targetWordCount: 1_000_000,
  createdAt: '2026/7/1',
  lastModifiedAt: '2026/7/27',
};

const stats = {
  wordCount: 1280,
  outlineCount: 3,
  draftCount: 1,
  reviewedChapterCount: 1,
  brainstormCount: 2,
  settingTotalCount: 105,
  settingCompletedCount: 99,
};

function renderPage({
  onSave = vi.fn(),
  onOpenBrainstorm = vi.fn(),
  onOpenBrainstormLibrary = vi.fn(),
  onOpenSettings = vi.fn(),
  onOpenOutline = vi.fn(),
  onOpenWriting = vi.fn(),
  onOpenAudit = vi.fn(),
  externalAiOptimizerTarget = null as 'title' | 'synopsis' | 'both' | null,
  onExternalAiOptimizerClose = vi.fn(),
  pageStats = stats,
  pageNovel = novel,
} = {}) {
  return {
    onSave,
    onOpenBrainstorm,
    onOpenBrainstormLibrary,
    onOpenSettings,
    onOpenOutline,
    onOpenWriting,
    onOpenAudit,
    onExternalAiOptimizerClose,
    ...render(
      <StandardModeWorkDetailsPage
        novel={pageNovel}
        stats={pageStats}
        settingsStorageKey="xinyuexia_workbench_settings_7"
        externalAiOptimizerTarget={externalAiOptimizerTarget}
        onExternalAiOptimizerClose={onExternalAiOptimizerClose}
        onSave={onSave}
        onOpenBrainstorm={onOpenBrainstorm}
        onOpenBrainstormLibrary={onOpenBrainstormLibrary}
        onOpenSettings={onOpenSettings}
        onOpenOutline={onOpenOutline}
        onOpenWriting={onOpenWriting}
        onOpenAudit={onOpenAudit}
      />,
    ),
  };
}

describe('StandardModeWorkDetailsPage', () => {
  beforeEach(() => localStorage.clear());

  it('edits and saves the complete work details', () => {
    const onSave = vi.fn();
    renderPage({ onSave });

    fireEvent.change(screen.getByLabelText('作品名称'), { target: { value: '星海问道·新篇' } });
    fireEvent.click(screen.getByRole('button', { name: '女频' }));
    fireEvent.click(screen.getByLabelText('作品题材'));
    fireEvent.click(screen.getByRole('button', { name: '总裁' }));
    fireEvent.click(screen.getByRole('button', { name: '连载中' }));
    fireEvent.change(screen.getByLabelText('预计篇幅'), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText('作品简介'), { target: { value: '新的作品简介' } });
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: '星海问道·新篇',
      category: '总裁',
      channel: 'female',
      creationStatus: 'serializing',
      targetWordCount: 1_200_000,
      synopsis: '新的作品简介',
    }));
    expect(screen.getByRole('status')).toHaveTextContent('作品资料已保存');
  });

  it('separates empty per-book cover history from software default covers', () => {
    renderPage();

    expect(screen.getByRole('main')).toHaveAttribute('data-standard-work-details-layout', 'three-column-guide');
    expect(screen.getByRole('main')).toHaveClass('grid-cols-[250px_minmax(720px,1fr)_360px]');
    expect(screen.getByText('作品资料')).toBeInTheDocument();
    expect(screen.getByText('创作向导')).toBeInTheDocument();
    expect(screen.queryByText('作品检测')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '一键检测' })).not.toBeInTheDocument();
    expect(screen.queryByText('正文章节')).not.toBeInTheDocument();
    expect(screen.getByLabelText('作品名称')).toHaveAttribute('maxLength', '20');
    expect(screen.getByText('历史封面')).toBeInTheDocument();
    expect(document.querySelector('[data-work-cover-history="true"]')).not.toBeInTheDocument();
    const softwareDefaults = document.querySelector('[data-software-default-covers="true"]');
    expect(softwareDefaults).toBeInTheDocument();
    expect(softwareDefaults?.querySelectorAll('button').length).toBeGreaterThan(0);
    expect(screen.getByText('软件默认封面')).toBeInTheDocument();
    expect(screen.getByLabelText('创作进度')).toHaveTextContent('1,280');
  });

  it('shows concrete workflow progress for brainstorms and setting completion', () => {
    renderPage();

    const guide = document.querySelector('[data-standard-creation-guide="true"]');
    expect(guide).toHaveAttribute('data-creation-guide-layout', 'overview');
    expect(guide).not.toHaveTextContent('下一步');
    expect(screen.getByRole('navigation', { name: '创作步骤总览' })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-guide-step-tab]').length).toBe(5);
    expect(screen.getByText('脑洞库：2 个')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看建立设定' }));
    expect(screen.getByText(/设定完善度：99 \/ 105/)).toBeInTheDocument();
    expect(screen.getByText(/还有 6 个未完善/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看生成章纲' }));
    expect(screen.getByText('已有 3 个章纲')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看生成正文' }));
    expect(screen.getByText('已完成 1 章正文')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看完成检查' }));
    expect(screen.getByText('已审核 1 / 1 章')).toBeInTheDocument();
    expect(document.querySelector('[data-guide-current-task="check"]'))
      .toHaveAttribute('data-guide-step-state', 'complete');
  });

  it('keeps the six work fields in three equal two-column rows and limits the synopsis height', () => {
    renderPage();

    const grid = document.querySelector('[data-work-details-aligned-grid="true"]');
    expect(grid).toHaveClass('grid-cols-2', 'w-full', 'gap-x-8', 'gap-y-5');
    expect(grid).not.toHaveClass('max-w-[760px]');
    expect([...grid!.children].map((element) => element.textContent?.trim())).toEqual([
      expect.stringContaining('作品名称'),
      expect.stringContaining('预计篇幅'),
      expect.stringContaining('作品频道'),
      expect.stringContaining('作品题材'),
      expect.stringContaining('创作状态'),
      expect.stringContaining('作品时间'),
    ]);
    expect(screen.getByLabelText('作品名称')).toHaveClass('w-full');
    expect(screen.getByLabelText('作品题材').parentElement).toHaveClass('w-full');
    expect(screen.getByLabelText('预计篇幅').parentElement).toHaveClass('w-full');
    expect(screen.getByLabelText('作品时间')).toHaveClass('w-full');
    expect(screen.getByLabelText('作品简介')).toHaveClass('min-h-[240px]', 'w-full', 'flex-1');
    expect(screen.getByLabelText('作品简介').closest('label')).toHaveClass('flex-1', 'min-h-[260px]');
  });

  it('uses the shared grouped selector and the common selected-state color', () => {
    renderPage();

    fireEvent.click(screen.getByLabelText('作品题材'));
    expect(screen.getByText('热门题材')).toBeInTheDocument();
    expect(screen.getByText('其他题材')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '男频' }))
      .toHaveClass('border-[#08AACE]', 'bg-[#DFF6FB]', 'text-[#078FAB]');
    expect(screen.getByRole('button', { name: '连载中' }))
      .toHaveClass('border-[#08AACE]', 'bg-[#DFF6FB]', 'text-[#078FAB]');
    expect(screen.getByLabelText('作品名称').closest('label')).toHaveTextContent('*');
    expect(screen.getByLabelText('作品题材').closest('fieldset')?.querySelector('legend')).toHaveTextContent('*');
    expect(screen.getByRole('button', { name: '男频' }).closest('fieldset')?.querySelector('legend')).toHaveTextContent('*');
  });

  it('opens one shared AI optimizer from the title and synopsis fields', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'AI取名' }));
    expect(screen.getByRole('dialog', { name: 'AI优化作品资料' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '书名和简介' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));

    fireEvent.click(screen.getByRole('button', { name: 'AI优化作品简介' }));
    expect(screen.getByRole('button', { name: '只生成简介' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the same naming optimizer from the top function bar request', () => {
    const onExternalAiOptimizerClose = vi.fn();
    renderPage({ externalAiOptimizerTarget: 'both', onExternalAiOptimizerClose });

    expect(screen.getByRole('dialog', { name: 'AI优化作品资料' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '书名和简介' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(onExternalAiOptimizerClose).toHaveBeenCalledTimes(1);
  });

  it('guides the complete creation flow and opens every formal step directly', () => {
    const onOpenBrainstorm = vi.fn();
    const onOpenBrainstormLibrary = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenOutline = vi.fn();
    const onOpenWriting = vi.fn();
    const onOpenAudit = vi.fn();
    renderPage({
      onOpenBrainstorm,
      onOpenBrainstormLibrary,
      onOpenSettings,
      onOpenOutline,
      onOpenWriting,
      onOpenAudit,
      pageStats: { ...stats, draftCount: 3, reviewedChapterCount: 1 },
    });

    ['查看准备脑洞', '查看建立设定', '查看生成章纲', '查看生成正文', '查看完成检查'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
    const brainstormActions = document.querySelector('[data-guide-brainstorm-actions="true"]');
    expect([...brainstormActions!.children].map((button) => button.textContent?.trim())).toEqual(['查看脑洞', '生成脑洞']);
    fireEvent.click(screen.getByRole('button', { name: '查看脑洞' }));
    fireEvent.click(screen.getByRole('button', { name: '生成脑洞' }));
    fireEvent.click(screen.getByRole('button', { name: '查看建立设定' }));
    fireEvent.click(screen.getByRole('button', { name: '开始设定' }));
    fireEvent.click(screen.getByRole('button', { name: '查看生成章纲' }));
    fireEvent.click(screen.getByRole('button', { name: '生成章纲' }));
    fireEvent.click(screen.getByRole('button', { name: '查看生成正文' }));
    fireEvent.click(screen.getByRole('button', { name: '生成正文' }));
    fireEvent.click(screen.getByRole('button', { name: '查看完成检查' }));
    expect(screen.getByText('审核剧情、更新状态并生成梗概')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '审核剧情' }));

    expect(onOpenBrainstorm).toHaveBeenCalledTimes(1);
    expect(onOpenBrainstormLibrary).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onOpenOutline).toHaveBeenCalledTimes(1);
    expect(onOpenWriting).toHaveBeenCalledTimes(1);
    expect(onOpenAudit).toHaveBeenCalledTimes(1);
  });

  it('records the replaced saved cover as history while keeping software defaults separate', async () => {
    const onSave = vi.fn();
    renderPage({ onSave, pageNovel: { ...novel, cover: 'saved-cover' } });

    fireEvent.change(screen.getByLabelText('上传作品封面'), {
      target: { files: [new File(['cover'], 'cover.png', { type: 'image/png' })] },
    });
    await waitFor(() => expect(screen.getByAltText('星海问道封面')).toHaveAttribute('src', 'uploaded-cover'));
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ cover: 'uploaded-cover' }));
    expect(screen.getByRole('button', { name: '使用历史封面1' })).toBeInTheDocument();
    expect(document.querySelector('[data-work-cover-history="true"] button img'))
      .toHaveAttribute('src', 'saved-cover');
    expect(document.querySelector('[data-software-default-covers="true"]')).toBeInTheDocument();
  });
});
