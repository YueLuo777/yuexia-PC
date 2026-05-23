const DATABASE_COLLECTION_NAMES = new Set(['plotLibrary', 'plotRecycle', 'materials']);

function normalizeCollectionName(collection) {
  return typeof collection === 'string' && DATABASE_COLLECTION_NAMES.has(collection)
    ? collection
    : null;
}

function normalizeItemsArray(items) {
  return Array.isArray(items) ? items : [];
}

function normalizeModelRequestInput(input) {
  const endpoint = String(input?.endpoint ?? '');
  if (!endpoint.startsWith('https://')) {
    return { ok: false, message: 'Only HTTPS model endpoints are allowed.' };
  }

  const headers = input?.headers && typeof input.headers === 'object' && !Array.isArray(input.headers)
    ? input.headers
    : {};

  return {
    ok: true,
    endpoint,
    headers,
    body: typeof input?.body === 'string' ? input.body : JSON.stringify(input?.body ?? {}),
  };
}

module.exports = {
  normalizeCollectionName,
  normalizeItemsArray,
  normalizeModelRequestInput,
};

