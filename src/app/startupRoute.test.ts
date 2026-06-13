import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const readSource = (relativePath: string) => readFileSync(join(repoRoot, relativePath), 'utf8');

describe('startup routing', () => {
  it('opens the novel library instead of the removed dashboard page', () => {
    const app = readSource('src/app/App.tsx');
    const tabs = readSource('src/shared/tabs/WorkspaceTabsContext.tsx');
    const electronMain = readSource('electron/main.cjs');
    const launcher = readSource('launch-xinyuexia.mjs');

    expect(app).toContain('<Route path="/" element={<Navigate to="/novels" replace />} />');
    expect(app).toContain('<Route path="*" element={<Navigate to="/novels" replace />} />');
    expect(app).not.toContain('@/pages/DashboardPage');
    expect(app).not.toContain('path="/dashboard"');

    expect(tabs).toContain("path: '/novels'");
    expect(tabs).not.toContain("path: '/dashboard'");

    expect(electronMain).toContain('#/novels');
    expect(electronMain).not.toContain('#/dashboard');
    expect(launcher).toContain('#/novels');
    expect(launcher).not.toContain('#/dashboard');
  });
});
