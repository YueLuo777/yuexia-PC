import { describe, expect, it } from 'vitest';

const readDashboardLayoutSource = async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DashboardLayout.tsx'), 'utf8');
};

describe('DashboardLayout profile block', () => {
  it('centers the avatar with the user name underneath', async () => {
    const source = await readDashboardLayoutSource();
    const profileStart = source.indexOf('<div className="shrink-0 border-b border-[#e7e9ee] px-3 py-7">');
    const navStart = source.indexOf('<div\n          ref={sidebarRef}', profileStart);
    const profileSource = source.slice(profileStart, navStart);

    expect(profileSource).toContain('flex flex-col items-center justify-center');
    expect(profileSource).toContain('className="group relative flex h-12 w-12');
    expect(profileSource).toContain('className="mt-3 w-full min-w-0"');
    expect(profileSource).toContain('text-center text-[15px]');
    expect(profileSource).not.toContain('flex items-center gap-2.5');
  });
});
