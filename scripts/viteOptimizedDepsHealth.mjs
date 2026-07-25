const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_MAX_DEPENDENCIES = 12;

async function fetchText(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    const text = await response.text().catch(() => '');
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      text,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error instanceof Error ? error.message : String(error),
      text: '',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function extractOptimizedDepUrls(source, baseUrl) {
  const urls = new Set();
  const pattern = /["']([^"']*\/node_modules\/\.vite\/deps\/[^"']+\.js(?:\?[^"']*)?)["']/g;
  let match = pattern.exec(source);
  while (match) {
    urls.add(new URL(match[1], baseUrl).href);
    match = pattern.exec(source);
  }
  return [...urls];
}

export async function inspectViteOptimizedDeps({
  baseUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxDependencies = DEFAULT_MAX_DEPENDENCIES,
}) {
  const mainModuleUrl = new URL('/src/main.tsx', baseUrl).href;
  const mainModule = await fetchText(mainModuleUrl, fetchImpl, timeoutMs);
  if (!mainModule.ok) {
    return {
      healthy: false,
      checkedDependencyCount: 0,
      failedUrl: mainModuleUrl,
      status: mainModule.status,
      statusText: mainModule.statusText,
    };
  }

  const depUrls = extractOptimizedDepUrls(mainModule.text, baseUrl).slice(0, maxDependencies);
  for (let index = 0; index < depUrls.length; index += 1) {
    const depUrl = depUrls[index];
    const result = await fetchText(depUrl, fetchImpl, timeoutMs);
    if (!result.ok) {
      return {
        healthy: false,
        checkedDependencyCount: index + 1,
        failedUrl: depUrl,
        status: result.status,
        statusText: result.statusText,
      };
    }
  }

  return { healthy: true, checkedDependencyCount: depUrls.length };
}
