import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');

describe('AiRequestLogGroups', () => {
  it('opens log sections by default and does not persist collapsed state across log opens', () => {
    const groupsSource = readSource('AiRequestLogGroups.tsx');
    const layoutSource = readSource('AiRequestLogModalLayout.tsx');

    expect(groupsSource).toContain('defaultCollapsed = false');
    expect(groupsSource).not.toContain('AI_REQUEST_LOG_COLLAPSED_KEY');
    expect(groupsSource).not.toContain('readCollapsedLogGroupKeys');
    expect(groupsSource).not.toContain('writeCollapsedLogGroupKeys');
    expect(groupsSource).not.toContain('localStorage.setItem(storageKey');
    expect(layoutSource).toContain('defaultCollapsed={false}');
  });
});
