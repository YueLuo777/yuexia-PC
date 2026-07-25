import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('AiRequestLogGroups', () => {
  it('opens log sections by default and does not persist collapsed state across log opens', () => {
    const groupsSource = readSource('AiRequestLogGroups.tsx');
    const layoutSource = readSource('AiRequestLogModalLayout.tsx');

    expect(groupsSource).toContainSource('defaultCollapsed = false');
    expect(groupsSource).not.toContainSource('AI_REQUEST_LOG_COLLAPSED_KEY');
    expect(groupsSource).not.toContainSource('readCollapsedLogGroupKeys');
    expect(groupsSource).not.toContainSource('writeCollapsedLogGroupKeys');
    expect(groupsSource).not.toContainSource('localStorage.setItem(storageKey');
    expect(layoutSource).toContainSource('defaultCollapsed={false}');
  });

  it('collapses the whole log section instead of only clearing its content', () => {
    const groupsSource = readSource('AiRequestLogGroups.tsx');

    expect(groupsSource).toContainSource('(shouldFillSingleGroup && !collapsed)');
    expect(groupsSource).toContainSource('className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${shouldFillGroup ?');
  });
});
