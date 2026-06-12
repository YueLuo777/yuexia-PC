import { describe, expect, it } from 'vitest';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
};

describe('writer workspace chrome styling', () => {
  it('keeps the writing editor surface free of ruled horizontal lines', async () => {
    const styles = await readSource('../styles/index.css');
    const editorRule = styles.slice(
      styles.indexOf('.xy-wa-editor-surface {'),
      styles.indexOf('.xy-wa-book-cover-empty {'),
    );

    expect(editorRule).toContain('background: var(--xy-wa-editor-bg);');
    expect(editorRule).not.toContain('repeating-linear-gradient');
  });

  it('makes the fixed home tab easier to find than normal work tabs', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const styles = await readSource('../styles/index.css');
    const homeRule = styles.slice(
      styles.indexOf('.workspace-tab-home,'),
      styles.indexOf('.xy-wa-book-cover-empty {'),
    );

    expect(appFrame).toContain('workspace-tab-home');
    expect(appFrame).toContain('workspace-tab-home-inactive');
    expect(homeRule).toContain('font-size: 15px;');
    expect(homeRule).toContain('font-weight: 700;');
  });
});
