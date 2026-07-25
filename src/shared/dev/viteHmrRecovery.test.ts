import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Vite HMR recovery', () => {
  it('forces a full renderer reload after invalidation or module pruning', () => {
    const recoverySource = readFileSync(resolve(process.cwd(), 'src/shared/dev/viteHmrRecovery.ts'), 'utf8');
    const mainSource = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
    const detailOutlineToolSource = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/DetailOutlineBorderFontTool.tsx'),
      'utf8',
    );

    expect(recoverySource).toContainSource("hot.on('vite:invalidate', requestFullReload)");
    expect(recoverySource).toContainSource("hot.on('vite:beforePrune', requestFullReload)");
    expect(recoverySource).toContainSource('window.location.reload()');
    expect(recoverySource).toContainSource('if (reloadTimer !== null) return;');
    expect(mainSource).toContainSource("import { installViteHmrRecovery } from './shared/dev/viteHmrRecovery';");
    expect(mainSource).toContainSource('installViteHmrRecovery();');
    expect(detailOutlineToolSource).not.toContainSource('export function normalizeDetailOutlineFontSize');
  });
});
