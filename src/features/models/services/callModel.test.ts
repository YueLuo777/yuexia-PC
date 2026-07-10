import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ModelItem } from '@/features/models/model/modelTypes';

import { callModel } from './callModel';

const model: ModelItem = {
  id: 'model-1',
  instanceId: 'model-instance-1',
  name: '模型一',
  enabled: true,
  baseUrl: 'https://example.test/v1',
  apiKey: '',
  hasApiKey: true,
  model: 'model-1',
  provider: 'openai-compatible',
};

afterEach(() => {
  window.xinyuexiaModel = undefined;
  window.xinyuexiaModelSecrets = undefined;
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('callModel secure secret routing', () => {
  it('sends only the secret identifier through Electron and keeps the API key out of renderer headers', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: JSON.stringify({ choices: [{ message: { content: '连接成功' } }] }),
    });
    window.xinyuexiaModel = {
      request,
      stream: vi.fn(),
      cancelStream: vi.fn(),
    };
    window.xinyuexiaModelSecrets = {
      status: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    };

    await expect(
      callModel({ model, prompt: '测试', userContent: '只回复连接成功', recordType: 'api_test' }),
    ).resolves.toBe('连接成功');

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatchObject({
      endpoint: 'https://example.test/v1/chat/completions',
      modelSecretId: 'model-instance-1',
      provider: 'openai-compatible',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(request.mock.calls[0][0].headers).not.toHaveProperty('Authorization');
    expect(JSON.stringify(request.mock.calls[0][0])).not.toContain('sk-');
  });
});
