import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'src/features/workbench/components/ChapterReviewPreview.tsx'), 'utf8');

describe('ChapterReviewPreview detail labels', () => {
  it('styles both detail labels like the passed status pill', () => {
    const pillClass =
      'mb-1 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700';

    expect(source.match(new RegExp(pillClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))).toHaveLength(2);
    expect(source).toContain('>\n                                      说明\n');
    expect(source).toContain('>\n                                      建议\n');
    expect(source).not.toContain('text-[11px] font-black text-slate-400">说明');
    expect(source).not.toContain('text-[11px] font-black text-slate-400">建议');
  });
});
