const path = require('node:path');

const DATABASE_COLLECTION_NAMES = new Set(['plotLibrary', 'plotRecycle', 'materials', 'moonfallSettings']);
const MODEL_REQUEST_BODY_LIMIT_BYTES = 4 * 1024 * 1024;
const MODEL_REQUEST_HEADER_NAMES = new Set([
  'accept',
  'anthropic-version',
  'authorization',
  'content-type',
  'x-api-key',
]);

function normalizeCollectionName(collection) {
  return typeof collection === 'string' && DATABASE_COLLECTION_NAMES.has(collection)
    ? collection
    : null;
}

function normalizeItemsArray(items) {
  return Array.isArray(items) ? items : [];
}

function normalizeDatabaseDataDir(input, defaultDataDir) {
  const fallback = String(defaultDataDir ?? '').trim();
  const raw = typeof input === 'string' && input.trim() ? input.trim() : fallback;
  const normalized = path.normalize(raw);
  if (!path.isAbsolute(normalized)) {
    return { ok: false, message: 'Database data directory must be an absolute path.' };
  }
  return { ok: true, dataDir: normalized };
}

function normalizeModelRequestInput(input) {
  const endpoint = String(input?.endpoint ?? '');
  if (!endpoint.startsWith('https://')) {
    return { ok: false, message: 'Only HTTPS model endpoints are allowed.' };
  }
  let parsedEndpoint;
  try {
    parsedEndpoint = new URL(endpoint);
  } catch {
    return { ok: false, message: 'Model endpoint must be a valid HTTPS URL.' };
  }
  if (parsedEndpoint.protocol !== 'https:' || !parsedEndpoint.hostname) {
    return { ok: false, message: 'Model endpoint must be a valid HTTPS URL.' };
  }
  if (parsedEndpoint.username || parsedEndpoint.password) {
    return { ok: false, message: 'Model endpoint must not include credentials.' };
  }

  const rawHeaders = input?.headers && typeof input.headers === 'object' && !Array.isArray(input.headers)
    ? input.headers
    : {};
  const headers = Object.fromEntries(
    Object.entries(rawHeaders)
      .filter(([name, value]) => (
        MODEL_REQUEST_HEADER_NAMES.has(String(name).toLowerCase()) &&
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      ))
      .map(([name, value]) => [name, String(value)]),
  );
  const body = typeof input?.body === 'string' ? input.body : JSON.stringify(input?.body ?? {});
  if (Buffer.byteLength(body, 'utf8') > MODEL_REQUEST_BODY_LIMIT_BYTES) {
    return { ok: false, message: 'Model request body is too large.' };
  }

  return {
    ok: true,
    endpoint: parsedEndpoint.toString(),
    headers,
    body,
  };
}

module.exports = {
  normalizeDatabaseDataDir,
  normalizeCollectionName,
  normalizeItemsArray,
  normalizeModelRequestInput,
};

