import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('formal application mode placement', () => {
  it('keeps the mode switch before the internal test tools and changes only the novel card branch', () => {
    const frame = readFileSync(resolve(process.cwd(), 'src/shared/layout/AppFrameView.tsx'), 'utf8');
    const library = readFileSync(resolve(process.cwd(), 'src/features/novels/pages/NovelLibraryPage.tsx'), 'utf8');

    expect(frame).not.toContain('<OwnerTestModeToggle />');
    expect(frame.indexOf('<BuiltInPromptManagerLauncher />')).toBeGreaterThan(-1);
    expect(frame.indexOf('<BuiltInPromptManagerLauncher />')).toBeLessThan(frame.indexOf('<ApplicationModeToggle />'));
    expect(frame.indexOf('<ApplicationModeToggle />')).toBeGreaterThan(-1);
    expect(frame.indexOf('<ApplicationModeToggle />')).toBeLessThan(frame.indexOf('{showInternalTools && ('));
    expect(library).toContain("applicationMode === 'standard'");
    expect(library).toContain('<StandardModeNovelCard');
    expect(library).toContain('<NovelCard');
  });
});
