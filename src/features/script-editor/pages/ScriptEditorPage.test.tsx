import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('ScriptEditorPage', () => {
  it('opens material novel groups by default when new groups appear', () => {
    const source = readSource('src/features/script-editor/pages/ScriptEditorPage.tsx');

    expect(source).toContain('initializedExpandedNovelIdsRef');
    expect(source).toContain('!initializedExpandedNovelIdsRef.current.has(novelId)');
    expect(source).toContain('nextNovelIds.forEach((novelId) => initializedExpandedNovelIdsRef.current.add(novelId));');
    expect(source).toContain('setExpandedNovelIds((prev) => new Set([...prev, ...nextNovelIds]));');
  });
});
