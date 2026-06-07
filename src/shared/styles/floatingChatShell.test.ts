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
  it('uses the original left-edge session toolbar placement from yuexia-PC', () => {
    const sessionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool');

    expect(sessionToolRule).toContain('left: 1.1rem');
    expect(sessionToolRule).toContain('max-width: calc(100% - 8.5rem)');
    expect(sessionToolRule).not.toContain('left: var(--xy-chat-session-tool-left');
    expect(sessionToolRule).not.toContain('max-width: calc(100% - var(--xy-chat-session-tool-left');
    expect(sessionToolRule).not.toContain('transform: none');
    expect(sessionToolRule).not.toContain('transform: translateY(-50%)');
    expect(sessionToolRule).not.toContain('top: 0.65rem');
  });

  it('does not reserve extra top padding for an in-content session toolbar', () => {
    const previewRule = readRule('.xy-floating-field.xy-floating-chat-shell .xy-floating-rich-preview');

    expect(previewRule).toContain('padding: 1.35rem 1rem 2.3rem');
    expect(previewRule).not.toContain('padding: 2.75rem 1rem 2.3rem');
  });

  it('removes the white backplate behind the chat session and action tools', () => {
    const sessionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool');
    const actionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-action-tool');
    const toolChildRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool > div,\n.xy-floating-edge-tool.xy-floating-chat-action-tool > div');
    const sessionScrollRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool .scrollbar-hidden');

    expect(sessionToolRule).toContain('background: transparent !important');
    expect(sessionToolRule).toContain('padding-right: 0 !important');
    expect(sessionToolRule).toContain('padding-left: 0 !important');
    expect(actionToolRule).toContain('background: transparent !important');
    expect(actionToolRule).toContain('padding-right: 0 !important');
    expect(actionToolRule).toContain('padding-left: 0 !important');
    expect(toolChildRule).toContain('background: transparent !important');
    expect(sessionScrollRule).toContain('background: transparent !important');
  });

  it('keeps session buttons separated while masking the output border behind them', () => {
    const buttonGroupRule = readRule('.xy-floating-session-buttons');
    const maskRule = readRule('.xy-floating-session-buttons > button,\n.xy-floating-session-buttons > * > button');

    expect(buttonGroupRule).toContain('gap: 0.375rem');
    expect(buttonGroupRule).toContain('isolation: isolate');
    expect(maskRule).toContain('box-shadow: 0 0 0 3px var(--xy-floating-session-line-mask, #f9fafb)');
    expect(css).not.toContain('margin-left: -1px');
    expect(css).not.toContain('border-top-left-radius: 0');
    expect(css).not.toContain('border-top-right-radius: 0');
  });
});
