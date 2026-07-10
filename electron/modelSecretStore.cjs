const fs = require('node:fs');
const path = require('node:path');

const STORE_VERSION = 1;
const BLOCKED_SECRET_IDS = new Set(['__proto__', 'prototype', 'constructor']);

function normalizeSecretId(value) {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id || id.length > 240 || BLOCKED_SECRET_IDS.has(id)) return '';
  return id;
}

function readEncryptedSecrets(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (parsed?.version !== STORE_VERSION || !parsed.secrets || typeof parsed.secrets !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed.secrets).filter(
        ([id, value]) => normalizeSecretId(id) && typeof value === 'string' && value.length > 0,
      ),
    );
  } catch {
    return {};
  }
}

function writeEncryptedSecrets(filePath, secrets) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify({ version: STORE_VERSION, secrets }, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

function createModelSecretStore({ safeStorage, filePath }) {
  const encryptionAvailable = () => Boolean(safeStorage?.isEncryptionAvailable?.());

  const readSecret = (secretId) => {
    const id = normalizeSecretId(secretId);
    if (!id) return { ok: false, apiKey: '', message: '模型密钥标识无效。' };
    if (!encryptionAvailable()) return { ok: false, apiKey: '', message: '系统安全存储当前不可用。' };
    const encrypted = readEncryptedSecrets(filePath)[id];
    if (!encrypted) return { ok: false, apiKey: '', message: '模型 API Key 尚未保存。' };
    try {
      return { ok: true, apiKey: safeStorage.decryptString(Buffer.from(encrypted, 'base64')) };
    } catch {
      return { ok: false, apiKey: '', message: '模型 API Key 无法解密，请重新填写。' };
    }
  };

  return {
    status() {
      const secrets = Object.fromEntries(Object.keys(readEncryptedSecrets(filePath)).map((id) => [id, true]));
      return { ok: true, encryptionAvailable: encryptionAvailable(), secrets };
    },
    get(secretId) {
      return readSecret(secretId);
    },
    set(secretId, apiKey) {
      const id = normalizeSecretId(secretId);
      const normalizedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
      if (!id) return { ok: false, message: '模型密钥标识无效。' };
      if (!normalizedKey) return this.remove(id);
      if (!encryptionAvailable()) return { ok: false, message: '系统安全存储当前不可用。' };
      try {
        const secrets = readEncryptedSecrets(filePath);
        secrets[id] = safeStorage.encryptString(normalizedKey).toString('base64');
        writeEncryptedSecrets(filePath, secrets);
        return { ok: true, hasSecret: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '保存模型 API Key 失败。' };
      }
    },
    remove(secretId) {
      const id = normalizeSecretId(secretId);
      if (!id) return { ok: false, message: '模型密钥标识无效。' };
      try {
        const secrets = readEncryptedSecrets(filePath);
        delete secrets[id];
        writeEncryptedSecrets(filePath, secrets);
        return { ok: true, hasSecret: false };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '删除模型 API Key 失败。' };
      }
    },
  };
}

module.exports = {
  createModelSecretStore,
  normalizeSecretId,
};
