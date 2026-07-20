import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('ScriptEditorPage', () => {
  it('opens material novel groups by default when new groups appear', () => {
    const source = [
      readSource('src/features/script-editor/pages/ScriptEditorPage.tsx'),
      readSource('src/features/script-editor/components/ScriptEditorWorkspacePanels.tsx'),
      readSource('src/features/script-editor/components/ScriptEditorMaterialPanels.tsx'),
    ].join('\n');

    expect(source).toContainSource('initializedExpandedNovelIdsRef');
    expect(source).toContainSource('!initializedExpandedNovelIdsRef.current.has(novelId)');
    expect(source).toContainSource(
      'nextNovelIds.forEach((novelId) => initializedExpandedNovelIdsRef.current.add(novelId));',
    );
    expect(source).toContainSource('setExpandedNovelIds((prev) => new Set([...prev, ...nextNovelIds]));');
  });

  it('stores each script linked novel independently', () => {
    const source = readSource('src/features/script-editor/pages/ScriptEditorPage.tsx');
    const storageSource = readSource('src/features/script-editor/model/scriptLinkedNovelStorage.ts');

    expect(storageSource).toContainSource(
      "export const SCRIPT_LINKED_NOVEL_KEY_PREFIX = 'xinyuexia_script_editor_linked_novel_v2_';",
    );
    expect(storageSource).toContainSource('function getScriptLinkedNovelStorageKey(scriptId: number)');
    expect(source).toContainSource('readScriptLinkedNovelId(currentScript?.id ?? null)');
    expect(source).toContainSource('writeScriptLinkedNovelId(currentScript?.id ?? null, novelId);');
    expect(storageSource).not.toContainSource('localStorage.setItem(LINKED_NOVEL_KEY, String(linkedNovelId));');
  });
});
