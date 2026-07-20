const crypto = require('node:crypto');

function normalizeConfig(input) {
  const config = input && typeof input === 'object' ? input : {};
  const bucket = typeof config.bucket === 'string' ? config.bucket.trim() : '';
  const region = typeof config.region === 'string' ? config.region.trim() : '';
  const secretId = typeof config.secretId === 'string' ? config.secretId.trim() : '';
  const secretKey = typeof config.secretKey === 'string' ? config.secretKey.trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{2,62}-\d{5,}$/.test(bucket)) {
    return { ok: false, message: 'COS Bucket 格式不正确，应类似 writer-1250000000。' };
  }
  if (!/^[a-z0-9-]{3,40}$/.test(region)) {
    return { ok: false, message: 'COS Region 格式不正确，应类似 ap-guangzhou。' };
  }
  if (!secretId || !secretKey) return { ok: false, message: 'COS SecretId / SecretKey 不能为空。' };
  return { ok: true, config: { bucket, region, secretId, secretKey } };
}

function normalizeObjectKey(value) {
  const key = typeof value === 'string' ? value.trim().replace(/^\/+/, '') : '';
  if (!key || key.includes('\\') || key.includes('\0') || key.split('/').some((part) => part === '..')) {
    return { ok: false, message: 'COS 云端文件路径无效。' };
  }
  return { ok: true, key };
}

function encodeObjectPath(key) {
  return `/${key
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/')}`;
}

function hmacSha1Hex(key, value) {
  return crypto.createHmac('sha1', key).update(value).digest('hex');
}

function createAuthorization({ method, pathname, host, secretId, secretKey }) {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now};${now + 600}`;
  const headerString = `host=${encodeURIComponent(host).toLowerCase()}`;
  const httpString = [method.toLowerCase(), pathname, '', headerString, ''].join('\n');
  const httpHash = crypto.createHash('sha1').update(httpString).digest('hex');
  const signKey = hmacSha1Hex(secretKey, keyTime);
  const signature = hmacSha1Hex(signKey, ['sha1', keyTime, httpHash, ''].join('\n'));
  return [
    'q-sign-algorithm=sha1',
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    'q-header-list=host',
    'q-url-param-list=',
    `q-signature=${signature}`,
  ].join('&');
}

async function requestObject({ method, config, key, body, contentType }) {
  const normalizedConfig = normalizeConfig(config);
  if (!normalizedConfig.ok) return { ok: false, status: 400, message: normalizedConfig.message };
  const normalizedKey = normalizeObjectKey(key);
  if (!normalizedKey.ok) return { ok: false, status: 400, message: normalizedKey.message };
  const { bucket, region, secretId, secretKey } = normalizedConfig.config;
  const host = `${bucket}.cos.${region}.myqcloud.com`;
  const pathname = encodeObjectPath(normalizedKey.key);
  const headers = { Authorization: createAuthorization({ method, pathname, host, secretId, secretKey }) };
  if (method === 'PUT') headers['Content-Type'] = contentType || 'application/json; charset=utf-8';
  try {
    const response = await fetch(`https://${host}${pathname}`, {
      method,
      headers,
      body: method === 'PUT' ? String(body ?? '') : undefined,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      key: normalizedKey.key,
      message: response.ok ? undefined : text.slice(0, 500) || `COS request failed (${response.status}).`,
    };
  } catch (error) {
    return { ok: false, status: 0, message: error instanceof Error ? error.message : 'COS request failed.' };
  }
}

function registerCosIpcHandlers(register) {
  register('cos:put-object', (_event, input) =>
    requestObject({
      method: 'PUT',
      config: input?.config,
      key: input?.key,
      body: input?.body,
      contentType: input?.contentType,
    }),
  );
  register('cos:get-object', (_event, input) =>
    requestObject({ method: 'GET', config: input?.config, key: input?.key }),
  );
}

module.exports = { registerCosIpcHandlers };
