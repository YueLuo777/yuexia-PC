import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('StandardModeWorkbenchPage setting-clear navigation', () => {
  it('keeps the workbench on the existing setting list after contents are cleared', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'StandardModeWorkbenchPage.tsx'),
      'utf8',
    );
    const listenerStart = source.indexOf('() => subscribeStandardModeSettingNavigationAction');
    const listenerEnd = source.indexOf('[settingsStorageKey]', listenerStart);
    const listener = source.slice(listenerStart, listenerEnd);

    expect(listener).toContain("setActiveAction('settingsList')");
    expect(listener).not.toContain("setActiveAction('createSettings')");
  });
});
