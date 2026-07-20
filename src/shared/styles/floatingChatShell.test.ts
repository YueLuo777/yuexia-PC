import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const css = Array.from({ length: 12 }, (_, index) =>
  readFileSync(
    resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
    'utf8',
  ),
).join('\n');

const readRule = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
};

describe('floating chat shell styles', () => {
  it('uses the original left-edge session toolbar placement from yuexia-PC', () => {
    const sessionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool');

    expect(sessionToolRule).toContainSource('left: 1.1rem');
    expect(sessionToolRule).toContainSource('max-width: calc(100% - 8.5rem)');
    expect(sessionToolRule).not.toContainSource('left: var(--xy-chat-session-tool-left');
    expect(sessionToolRule).not.toContainSource('max-width: calc(100% - var(--xy-chat-session-tool-left');
    expect(sessionToolRule).not.toContainSource('transform: none');
    expect(sessionToolRule).not.toContainSource('transform: translateY(-50%)');
    expect(sessionToolRule).not.toContainSource('top: 0.65rem');
  });

  it('does not reserve extra top padding for an in-content session toolbar', () => {
    const previewRule = readRule('.xy-floating-field.xy-floating-chat-shell .xy-floating-rich-preview');

    expect(previewRule).toContainSource('padding: 1.35rem 1rem 2.3rem');
    expect(previewRule).not.toContainSource('padding: 2.75rem 1rem 2.3rem');
  });

  it('removes the white backplate behind the chat session and action tools', () => {
    const sessionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool');
    const actionToolRule = readRule('.xy-floating-edge-tool.xy-floating-chat-action-tool');
    const toolChildRule = readRule(
      '.xy-floating-edge-tool.xy-floating-chat-session-tool > div,\n.xy-floating-edge-tool.xy-floating-chat-action-tool > div',
    );
    const sessionScrollRule = readRule('.xy-floating-edge-tool.xy-floating-chat-session-tool .scrollbar-hidden');

    expect(sessionToolRule).toContainSource('background: transparent !important');
    expect(sessionToolRule).toContainSource('padding-right: 0 !important');
    expect(sessionToolRule).toContainSource('padding-left: 0 !important');
    expect(actionToolRule).toContainSource('background: transparent !important');
    expect(actionToolRule).toContainSource('padding-right: 0 !important');
    expect(actionToolRule).toContainSource('padding-left: 0 !important');
    expect(toolChildRule).toContainSource('background: transparent !important');
    expect(sessionScrollRule).toContainSource('background: transparent !important');
  });

  it('keeps session buttons separated while masking the output border behind them', () => {
    const buttonGroupRule = readRule('.xy-floating-session-buttons');
    const maskRule = readRule('.xy-floating-session-buttons > button,\n.xy-floating-session-buttons > * > button');

    expect(buttonGroupRule).toContainSource('gap: 0.375rem');
    expect(buttonGroupRule).toContainSource('isolation: isolate');
    expect(maskRule).toContainSource('box-shadow: 0 0 0 3px var(--xy-floating-session-line-mask, #f9fafb)');
    expect(buttonGroupRule).not.toContainSource('margin-left: -1px');
    expect(maskRule).not.toContainSource('border-top-left-radius: 0');
    expect(maskRule).not.toContainSource('border-top-right-radius: 0');
  });
});
