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
});
