interface EmbeddedBrowserEnv {
  DEV?: boolean;
  VITE_ENABLE_EMBEDDED_BROWSER?: string;
}

function getDefaultBrowserEnv(): EmbeddedBrowserEnv {
  return {
    DEV: import.meta.env.DEV,
    VITE_ENABLE_EMBEDDED_BROWSER: import.meta.env.VITE_ENABLE_EMBEDDED_BROWSER,
  };
}

export function isEmbeddedBrowserEnabled(env: EmbeddedBrowserEnv = getDefaultBrowserEnv()) {
  return env.DEV === true || env.VITE_ENABLE_EMBEDDED_BROWSER === '1';
}

export function normalizeBrowserUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getBrowserHostLabel(value: string) {
  try {
    return new URL(normalizeBrowserUrl(value)).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

export function isMobileOptimizedBrowserUrl(value: string) {
  try {
    const url = new URL(normalizeBrowserUrl(value));
    return url.searchParams.get('force_mobile') === '1' || url.hostname.startsWith('m.');
  } catch {
    return /(^|[?&])force_mobile=1(&|$)/.test(value) || /:\/\/m\./i.test(value);
  }
}
