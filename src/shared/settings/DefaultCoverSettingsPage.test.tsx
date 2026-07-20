import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  CUSTOM_DEFAULT_NOVEL_COVER_ID,
  CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY,
  DEFAULT_NOVEL_COVER_STORAGE_KEY,
} from '@/features/novels/model/defaultNovelCover';
import { DefaultCoverSettingsPage } from '@/shared/settings/DefaultCoverSettingsPage';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('default cover settings integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('selects the minimal moon-orbit cover initially and saves another cover when clicked', () => {
    render(<DefaultCoverSettingsPage />);

    const options = screen.getAllByRole('radio');
    const moonOrbitCover = screen.getByRole('radio', { name: /简约2号封面.*月轨/ });
    const fourthCover = screen.getByRole('radio', { name: /普通4号封面/ });

    expect(options).toHaveLength(7);
    expect(screen.queryByText('小说默认封面')).not.toBeInTheDocument();
    expect(screen.queryByText(/没有单独上传封面的小说/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '自定义封面' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上传封面' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '普通封面' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '简约封面' })).toBeInTheDocument();
    expect(
      screen
        .getByRole('heading', { name: '简约封面' })
        .compareDocumentPosition(screen.getByRole('heading', { name: '普通封面' })) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(moonOrbitCover).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(fourthCover);

    expect(fourthCover).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem(DEFAULT_NOVEL_COVER_STORAGE_KEY)).toBe('moonlit-04');
  });

  it('shows a saved custom cover as a selectable eighth option', () => {
    localStorage.setItem(CUSTOM_DEFAULT_NOVEL_COVER_STORAGE_KEY, 'data:image/webp;base64,custom-cover');
    localStorage.setItem(DEFAULT_NOVEL_COVER_STORAGE_KEY, CUSTOM_DEFAULT_NOVEL_COVER_ID);

    render(<DefaultCoverSettingsPage />);

    expect(screen.getAllByRole('radio')).toHaveLength(8);
    expect(screen.getByRole('radio', { name: /自定义1号封面/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: '上传封面' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument();
    expect(screen.getByText('1/20')).toBeInTheDocument();
  });

  it('shows seven selectable covers as a peer settings section', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const coverSettings = readSource('src/shared/settings/DefaultCoverSettingsPage.tsx');
    const coverModel = readSource('src/features/novels/model/defaultNovelCover.ts');
    const novelLibrary = readSource('src/features/novels/pages/NovelLibraryPage.tsx');

    expect(settingsPage).toContainSource("id: 'defaultCover'");
    expect(settingsPage).toContainSource("activeSection === 'defaultCover'");
    expect(coverSettings).toContainSource('DEFAULT_NOVEL_COVERS.filter');
    expect(coverSettings).toContainSource('DEFAULT_NOVEL_COVER_GROUPS.map');
    expect(coverSettings).toContainSource('role="radiogroup"');
    expect(coverSettings).toContainSource('role="radio"');
    expect(coverSettings).toContainSource('当前使用');
    expect(coverSettings).not.toContainSource('没有单独上传封面的小说会使用这里选择的封面');
    expect(coverSettings).toContainSource('prepareDefaultNovelCover');
    expect(coverSettings).toContainSource('最多保留最近 20 张');
    expect(coverSettings).toContainSource('customCovers.map');
    expect(coverSettings).toContainSource('deleteCustomCover(cover.id)');
    expect(coverSettings).toContainSource('xl:grid-cols-[minmax(0,1fr)_360px]');
    expect(coverSettings).toContainSource('grid-cols-[repeat(auto-fill,minmax(140px,180px))] gap-2');
    expect(coverSettings).toContainSource('<aside className="min-w-0" aria-labelledby="default-cover-group-custom">');
    expect(coverSettings).not.toContainSource('gap-x-5 gap-y-6');
    expect(coverSettings).not.toContainSource("border-[#08AACE] ring-2 ring-[#08AACE]/25");
    expect(coverSettings).toContainSource("cover.label.replace(/^(普通|简约)/, '')");
    expect(coverSettings).toContainSource('{displayLabel} <span className="text-[#08AACE]">{cover.name}</span>');
    expect(coverSettings).not.toContainSource('{cover.description}');
    expect(coverSettings).not.toContainSource('group min-w-0 rounded-xl border p-3 text-left');
    expect(coverModel).toContainSource("INITIAL_DEFAULT_NOVEL_COVER_ID: DefaultNovelCoverId = 'blue-minimal-03'");
    expect(coverModel.match(/id: 'moonlit-0[1-4]'/g)).toHaveLength(4);
    expect(coverModel.match(/id: 'blue-minimal-0[136]'/g)).toHaveLength(3);
    expect(novelLibrary).toContainSource('defaultCoverSrc={defaultNovelCover.src}');
  });
});
