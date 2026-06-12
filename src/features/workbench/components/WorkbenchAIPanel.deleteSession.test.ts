import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const sourcePath = join(dirname(fileURLToPath(import.meta.url)), 'WorkbenchAIPanel.tsx');
const source = readFileSync(sourcePath, 'utf8');

const readFunctionBody = (functionName: string) => {
  const start = source.indexOf(`const ${functionName} =`);
  if (start === -1) throw new Error(`Cannot find ${functionName}`);

  const end = source.indexOf('\n  const ', start + 1);
  return source.slice(start, end === -1 ? undefined : end);
};

describe('WorkbenchAIPanel session deletion', () => {
  it('does not show a top status after deleting the current chat session', () => {
    const deleteSessionBody = readFunctionBody('deleteSession');

    expect(deleteSessionBody).not.toContain('flashStatus(');
    expect(deleteSessionBody).not.toContain('已删除当前会话');
  });

  it('does not show a top status after resetting chat sessions', () => {
    const resetSessionsBody = readFunctionBody('resetSessions');

    expect(resetSessionsBody).not.toContain('flashStatus(');
    expect(resetSessionsBody).not.toContain('已新开空会话');
  });

  it('uses an opaque active session background so the border line does not show through', () => {
    const sessionControlsBody = readFunctionBody('renderSessionControls');

    expect(sessionControlsBody).toContain('bg-[#EAF9FD]');
    expect(sessionControlsBody).not.toContain('bg-brand/10');
  });

  it('keeps session buttons separated without restoring the white backplate', () => {
    const sessionControlsBody = readFunctionBody('renderSessionControls');

    expect(sessionControlsBody).toContain('xy-floating-session-buttons scrollbar-hidden flex min-w-0 items-center overflow-x-auto');
    expect(sessionControlsBody).not.toContain('items-center gap-1 overflow-x-auto');
    expect(sessionControlsBody).toContain('flex h-7 max-w-full items-center overflow-visible');
    expect(sessionControlsBody).not.toContain('overflow-hidden bg-white');
  });

  it('renders the AI output font size control in the workbench header tool area', () => {
    expect(source).toContain("setHeaderToolPortalTarget(document.getElementById('workbench-header-extra-tools'))");
    expect(source).toContain('createPortal(outputFontSizeTool, headerToolPortalTarget)');
    expect(source).toContain('ariaLabel="AI 输出字号"');
    expect(source).not.toContain('className="xy-floating-chat-font-tool"');
  });
});
