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
    const shellSource = readSource('WorkbenchAiThinkingShell.tsx');
    const renderers = [
      'workbenchAiPanelSupport.tsx',
      'workbenchLibraryRequestLog.tsx',
      'chapterEditorPresentation.tsx',
      'EditorAiGenerateModal.tsx',
    ].map(readSource);

    expect(styleSource).toContain("border border-[#08AACE]/30 bg-white");
    expect(styleSource).toContain("bg-[#EAF9FD] px-3 py-2");
    expect(styleSource).toContain("bg-white px-3 py-2");
    expect(styleSource).toContain("font-black text-[#078fb0]");
    expect(shellSource).toContain('WORKBENCH_AI_THINKING_HEADER_CLASS');
    expect(shellSource).toContain('WORKBENCH_AI_THINKING_BODY_CLASS');
    renderers.forEach((source) => {
      expect(source).toContain('WorkbenchAiThinkingShell');
    });
    expect(readSource('workbenchLibraryRequestLog.tsx')).not.toContain('bg-white/80');
  });
});
