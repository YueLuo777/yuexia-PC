import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useNovelLibrary } from './useNovelLibrary';

function NovelLibraryProbe() {
  const { novels } = useNovelLibrary();
  return <div data-testid="first-novel-title">{novels[0]?.title ?? ''}</div>;
}

describe('useNovelLibrary', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists the default novel so the workbench can read it on first launch', () => {
    render(<NovelLibraryProbe />);

    expect(screen.getByTestId('first-novel-title')).toHaveTextContent('默认小说1');
    expect(JSON.parse(localStorage.getItem('xinyuexia_novels_v1') ?? 'null')).toEqual([
      expect.objectContaining({ id: 1, title: '默认小说1', type: 'novel' }),
    ]);
  });
});
