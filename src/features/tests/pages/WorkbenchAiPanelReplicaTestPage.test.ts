import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, 'WorkbenchAiPanelReplicaTestPage.tsx'), 'utf8');

describe('WorkbenchAiPanelReplicaTestPage chat shell', () => {
  it('keeps writing chat controls on the output border instead of inside the scroll area', () => {
    expect(source).toContain('top-0 z-10 flex h-7 -translate-y-1/2');
    expect(source).toContain('right-3 top-0 z-10 flex h-6 -translate-y-1/2');
    expect(source).not.toContain('left-3 top-2 z-10 flex h-7');
  });

  it('uses normal empty-state top padding for the writing chat output', () => {
    expect(source).toContain("isChat ? 'pt-5 text-xl font-bold text-slate-400'");
    expect(source).not.toContain("isChat ? 'pt-12 text-xl font-bold text-slate-400'");
  });
});
