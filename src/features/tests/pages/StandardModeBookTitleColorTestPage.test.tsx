import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  BOOK_TITLE_COLOR_OPTIONS,
  StandardModeBookTitleColorTestPage,
} from './StandardModeBookTitleColorTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('StandardModeBookTitleColorTestPage', () => {
  it('registers the title color comparison at the end of the UI test group', () => {
    const group = testGroups.find((item) => item.title === 'UI 与主题');

    expect(group?.items.at(-1)).toMatchObject({
      serial: 29,
      path: '/standard-mode-book-title-color-test',
      title: '标准模式书名颜色十方案',
    });
    const collectionSource = readTestCollectionSource();
    expect(collectionSource).toContain('const StandardModeBookTitleColorTestPage = lazy(() =>');
    expect(collectionSource).toContain("case '/standard-mode-book-title-color-test':");
  });

  it('renders ten real navigation previews with one explicit recommendation', () => {
    render(<StandardModeBookTitleColorTestPage />);

    expect(BOOK_TITLE_COLOR_OPTIONS).toHaveLength(10);
    expect(document.querySelectorAll('[data-book-title-color-option]')).toHaveLength(10);
    expect(document.querySelectorAll('[data-book-title-color-recommended="true"]')).toHaveLength(1);
    expect(screen.getAllByRole('navigation', { name: '标准模式创作导航' })).toHaveLength(10);
    expect(screen.getAllByText('首选推荐')).toHaveLength(1);
    expect(screen.getByText(/书名居中、15 字宽度上限/)).toBeInTheDocument();

    BOOK_TITLE_COLOR_OPTIONS.forEach((option) => {
      const preview = document.querySelector(`[data-book-title-color-option="${option.id}"]`);
      expect(preview).not.toBeNull();
      const title = within(preview as HTMLElement).getByText('吞噬系统');
      expect(title.parentElement).toHaveStyle({ color: option.color });
      expect(within(preview as HTMLElement).getByText(option.recommendation)).toBeInTheDocument();
    });
  });

  it('keeps each preview independently clickable without changing the proposed title color', () => {
    render(<StandardModeBookTitleColorTestPage />);

    const recommended = document.querySelector('[data-book-title-color-option="indigo"]');
    expect(recommended).not.toBeNull();
    const preview = within(recommended as HTMLElement);
    fireEvent.click(preview.getByRole('button', { name: '审核检查' }));
    expect(preview.getByRole('button', { name: '审核检查' })).toHaveAttribute('aria-current', 'page');
    expect(preview.getByText('吞噬系统').parentElement).toHaveStyle({ color: '#3F4E8C' });
  });
});
