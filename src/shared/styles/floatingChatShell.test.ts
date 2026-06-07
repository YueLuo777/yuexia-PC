import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(currentDir, 'index.css'), 'utf8');

const readRule = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
};

describe('floating chat shell styles', () => {
  it('keeps the session toolbar embedded on the top border instead of inside the content area', () => {
    const sessionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool');

    expect(sessionToolRule).toContain('top: 0');
    expect(sessionToolRule).toContain('transform: translateY(-50%)');
    expect(sessionToolRule).not.toContain('top: 0.65rem');
    expect(sessionToolRule).not.toContain('transform: none');
  });

  it('does not reserve extra top padding for an in-content session toolbar', () => {
    const previewRule = readRule('.xy-floating-field.xy-floating-chat-shell .xy-floating-rich-preview');

    expect(previewRule).toContain('padding: 1.35rem 1rem 2.3rem');
    expect(previewRule).not.toContain('padding: 2.75rem 1rem 2.3rem');
  });
});
