import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/HotspotLayoutPreviewTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('HotspotLayoutPreviewTestPage', () => {
  it('previews several hotspot board layout options for comparison', async () => {
    const source = await readFile(testPagePath, 'utf8');

    expect(source).toContain('HotspotLayoutPreviewTestPage');
    expect(source).toContain('HOTSPOT_LAYOUT_SCHEMES');
    expect(source).toContain("id: 'command-center'");
    expect(source).toContain("id: 'radar-board'");
    expect(source).toContain("id: 'editor-desk'");
    expect(source).toContain("id: 'card-wall'");
    expect(source).toContain('layout.render()');
  });

  it('adds the hotspot layout preview to the end of the UI test collection group', async () => {
    const source = await readFile(collectionPagePath, 'utf8');

    expect(source).toContain('HotspotLayoutPreviewTestPage');
    expect(source).toContain('/hotspot-layout-preview-test');
    expect(source.indexOf('/workbench-ai-right-width-preview-test')).toBeLessThan(
      source.indexOf('/hotspot-layout-preview-test'),
    );
    expect(source.indexOf('/hotspot-layout-preview-test')).toBeLessThan(source.indexOf("title: 'AI "));
  });
});
