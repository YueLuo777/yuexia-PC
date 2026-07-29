import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('formal application mode placement', () => {
  it('temporarily hides the mode switch and uses one unified dual-entry novel card', () => {
    const frame = readFileSync(resolve(process.cwd(), 'src/shared/layout/AppFrameView.tsx'), 'utf8');
    const library = readFileSync(resolve(process.cwd(), 'src/features/novels/pages/NovelLibraryPage.tsx'), 'utf8');

    expect(frame).not.toContain('<OwnerTestModeToggle />');
    expect(frame.indexOf('<BuiltInPromptManagerLauncher />')).toBeGreaterThan(-1);
    expect(frame).not.toContain("import { ApplicationModeToggle } from '@/shared/layout/ApplicationModeToggle';");
    expect(frame).not.toContain('<ApplicationModeToggle />');
    expect(library).not.toContain("applicationMode === 'standard'");
    expect(library).not.toContain('<StandardModeNovelCard');
    expect(library).toContain('<NovelCard');
    expect(library).toContain('stats={readStandardModeNovelCardStats(novel)}');
  });
});
