import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StandardModeGuidedNavigationTestPage } from './StandardModeGuidedNavigationTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('StandardModeGuidedNavigationTestPage', () => {
  it('keeps the guided navigation prototype registered in the UI test group', () => {
    const group = testGroups.find((item) => item.title === 'UI 与主题');
    const entry = group?.items.find((item) => item.path === '/standard-mode-guided-navigation-test');

    expect(entry).toMatchObject({
      serial: 28,
      path: '/standard-mode-guided-navigation-test',
      title: '标准模式导航与创作指导新方案',
    });
    const collectionSource = readTestCollectionSource();
    expect(collectionSource).toContain("const StandardModeGuidedNavigationTestPage = lazy(() =>");
    expect(collectionSource).toContain("case '/standard-mode-guided-navigation-test':");
  });

  it('renders five independent clickable navigation proposals with explicit boundaries', () => {
    render(<StandardModeGuidedNavigationTestPage />);

    expect(screen.getAllByText(/^方案 [A-E] ·/)).toHaveLength(5);
    expect(screen.getByText(/可以替换：/)).toBeInTheDocument();
    expect(screen.getByText(/必须保留：/)).toBeInTheDocument();

    const prototype = document.querySelector('[data-guided-navigation-prototype="方案 A · 任务接力棒"]');
    expect(prototype).not.toBeNull();
    const relayView = within(prototype as HTMLElement);

    fireEvent.click(relayView.getByRole('button', { name: '3 创作阶段' }));
    expect(relayView.getByText('从章纲推进到正文')).toBeInTheDocument();
    fireEvent.click(relayView.getByRole('button', { name: '生成正文' }));
    expect(relayView.getByText('生成正文', { selector: 'div' })).toBeInTheDocument();

    const directory = document.querySelector('[data-guided-navigation-prototype="方案 C · 阶段目录"]');
    expect(directory).not.toBeNull();
    const directoryView = within(directory as HTMLElement);
    fireEvent.click(directoryView.getByRole('button', { name: /4\s*检查/ }));
    expect(directoryView.getByRole('button', { name: '审核剧情' })).toBeInTheDocument();
  });
});
