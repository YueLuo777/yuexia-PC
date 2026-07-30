import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TemplateGenerationStepCardsTestPage } from './TemplateGenerationStepCardsTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('TemplateGenerationStepCardsTestPage', () => {
  it('keeps the step card prototype registered at the end of the UI test group', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    expect(uiGroup?.items.find((item) => item.path === '/template-generation-step-cards-test')).toMatchObject({
      serial: 37,
      title: '模板生成步骤设定卡片方案',
      path: '/template-generation-step-cards-test',
    });

    const source = readTestCollectionSource();
    expect(source).toContain('const TemplateGenerationStepCardsTestPage = lazy(() =>');
    expect(source).toContain("case '/template-generation-step-cards-test':");
  });

  it('shows the four classification levels with the required color-backed cards', () => {
    render(<TemplateGenerationStepCardsTestPage />);

    expect(screen.getAllByText('一级分类').length).toBeGreaterThan(0);
    expect(screen.getAllByText('二级分类').length).toBeGreaterThan(0);
    expect(screen.getAllByText('三级设定').length).toBeGreaterThan(0);
    expect(screen.getAllByText('四级字段').length).toBeGreaterThan(0);
    expect(document.querySelector('[data-level="1"]')).toBeInTheDocument();
    expect(document.querySelector('[data-level="2"]')).toBeInTheDocument();
    expect(document.querySelector('[data-level="3"]')).toBeInTheDocument();
    expect(document.querySelector('[data-level="4"]')).toBeInTheDocument();
    expect(document.querySelector('[data-setting-name-level="1"]')).toBeInTheDocument();
    expect(document.querySelector('[data-setting-name-level="2"]')).toBeInTheDocument();
    expect(document.querySelector('[data-setting-name-level="3"]')).toBeInTheDocument();
    expect(document.querySelector('[data-setting-name-level="4"]')).toBeInTheDocument();
  });

  it('embeds clicked template cards into the active generation step and supports removal', () => {
    render(<TemplateGenerationStepCardsTestPage />);

    const firstEntryCard = document.querySelector('[data-level="3"]');
    expect(firstEntryCard).toBeInstanceOf(HTMLElement);
    fireEvent.click(firstEntryCard as HTMLElement);

    const aiPayloadRegion = screen.getByRole('region', { name: '当前步骤发送给AI的设定卡片' });
    expect(within(aiPayloadRegion).getByText('三级设定')).toBeInTheDocument();
    expect(aiPayloadRegion.querySelector('[data-setting-name-level="3"]')).toBeInTheDocument();
    expect(within(aiPayloadRegion).getByRole('button', { name: '移除' })).toBeInTheDocument();

    fireEvent.click(within(aiPayloadRegion).getByRole('button', { name: '移除' }));
    expect(within(aiPayloadRegion).getByText('当前步骤暂未嵌入设定卡片')).toBeInTheDocument();
  });

  it('moves generation steps without losing the active step selection', () => {
    render(<TemplateGenerationStepCardsTestPage />);
    const page = screen.getByTestId('template-generation-step-cards-test');

    fireEvent.click(screen.getByRole('button', { name: /02 主角与金手指/ }));
    expect(page).toHaveAttribute('data-active-step', 'lead');

    const leadStep = document.querySelector('[data-generation-step="lead"]');
    expect(leadStep).toBeInstanceOf(HTMLElement);
    fireEvent.click(within(leadStep as HTMLElement).getByRole('button', { name: '上移' }));

    const stepTitles = screen.getAllByText(/0[12] /).map((node) => node.textContent);
    expect(stepTitles[0]).toContain('02 主角与金手指');
    expect(page).toHaveAttribute('data-active-step', 'lead');
  });
});
