import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

function readSource(fileName: string) {
  return readFileSync(join(currentDir, fileName), 'utf8');
}

describe('workbench AI thinking style', () => {
  it('keeps every formal thinking renderer on the shared blue style', () => {
    const styleSource = readSource('workbenchAiThinkingStyles.ts');
    const renderers = [
      'workbenchAiPanelSupport.tsx',
      'workbenchLibraryRequestLog.tsx',
      'chapterEditorPresentation.tsx',
      'EditorAiGenerateModal.tsx',
    ].map(readSource);

    expect(styleSource).toContain("border border-[#08AACE]/25 bg-[#EAF9FD]");
    expect(styleSource).toContain("font-black text-[#078fb0]");
    renderers.forEach((source) => {
      expect(source).toContain('WORKBENCH_AI_THINKING_SURFACE_CLASS');
      expect(source).toContain('WORKBENCH_AI_THINKING_TITLE_CLASS');
    });
    expect(readSource('workbenchLibraryRequestLog.tsx')).not.toContain('bg-white/80');
  });
});
