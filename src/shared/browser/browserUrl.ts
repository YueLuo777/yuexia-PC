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
