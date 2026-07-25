import { describe, expect, it, vi } from 'vitest';

import { extractOptimizedDepUrls, inspectViteOptimizedDeps } from './viteOptimizedDepsHealth.mjs';

function response({ ok = true, status = 200, statusText = 'OK', text = '' } = {}) {
  return { ok, status, statusText, text: async () => text };
}

describe('Vite optimized dependency health', () => {
  it('extracts unique optimized dependency module URLs', () => {
    const source = [
      'import "/node_modules/.vite/deps/react.js?v=123";',
      'import "/node_modules/.vite/deps/react.js?v=123";',
      'import "/src/app/App.tsx";',
    ].join('\n');

    expect(extractOptimizedDepUrls(source, 'http://127.0.0.1:18328/')).toEqual([
      'http://127.0.0.1:18328/node_modules/.vite/deps/react.js?v=123',
    ]);
  });

  it('reports healthy when the main module and optimized dependencies load', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ text: 'import "/node_modules/.vite/deps/react.js?v=123";' }))
      .mockResolvedValueOnce(response());

    await expect(inspectViteOptimizedDeps({ baseUrl: 'http://127.0.0.1:18328/', fetchImpl })).resolves.toEqual({
      healthy: true,
      checkedDependencyCount: 1,
    });
  });

  it('reports the failed optimized dependency without checking later modules', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          text: [
            'import "/node_modules/.vite/deps/react.js?v=123";',
            'import "/node_modules/.vite/deps/react-dom.js?v=456";',
          ].join('\n'),
        }),
      )
      .mockResolvedValueOnce(response({ ok: false, status: 504, statusText: 'Stale dependency' }));

    await expect(inspectViteOptimizedDeps({ baseUrl: 'http://127.0.0.1:18328/', fetchImpl })).resolves.toEqual({
      healthy: false,
      checkedDependencyCount: 1,
      failedUrl: 'http://127.0.0.1:18328/node_modules/.vite/deps/react.js?v=123',
      status: 504,
      statusText: 'Stale dependency',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('reports an unavailable main module as unhealthy', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ ok: false, status: 404, statusText: 'Not Found' }));

    await expect(inspectViteOptimizedDeps({ baseUrl: 'http://127.0.0.1:18328/', fetchImpl })).resolves.toMatchObject({
      healthy: false,
      checkedDependencyCount: 0,
      failedUrl: 'http://127.0.0.1:18328/src/main.tsx',
      status: 404,
    });
  });
});
