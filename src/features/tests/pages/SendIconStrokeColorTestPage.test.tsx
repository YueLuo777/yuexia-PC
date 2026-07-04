import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const testPagePath = resolve(process.cwd(), 'src/features/tests/pages/SendIconStrokeColorTestPage.tsx');
const collectionPagePath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

async function readTestPageSource() {
  return readFile(testPagePath, 'utf8');
}

async function readCollectionPageSource() {
  return readFile(collectionPagePath, 'utf8');
}

describe('SendIconStrokeColorTestPage', () => {
  it('previews darker send arrow stroke options on white backgrounds', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('发送箭头线条颜色测试');
    expect(source).toContain('#9BEFFC');
    expect(source).toContain('#62DFF2');
    expect(source).toContain('#21B8DA');
    expect(source).toContain('#009FC5');
    expect(source).toContain('Send');
    expect(source).toContain('stroke-[1.9]');
    expect(source).toContain('bg-white');
  });

  it('uses only white background previews and removes the old dark or cyan background variants', async () => {
    const source = await readTestPageSource();

    expect(source).toContain('浅青加强');
    expect(source).toContain('标准推荐');
    expect(source).toContain('深青高对比');
    expect(source).toContain('蓝青稳重');
    expect(source).not.toContain('深色底推荐');
    expect(source).not.toContain('浅青底');
  });

  it('adds the send icon stroke color test page to the test collection', async () => {
    const source = await readCollectionPageSource();

    expect(source).toContain('SendIconStrokeColorTestPage');
    expect(source).toContain('/send-icon-stroke-color-test');
    expect(source).toContain('发送箭头线条颜色测试');
  });
});
