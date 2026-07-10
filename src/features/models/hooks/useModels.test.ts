import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readModelSnapshot, useModels } from './useModels';

const ORIGINAL_PINAI_ENV = {
  apiKey: import.meta.env.VITE_PINAI_API_KEY,
  baseUrl: import.meta.env.VITE_PINAI_BASE_URL,
  modelId: import.meta.env.VITE_PINAI_MODEL_ID,
  modelName: import.meta.env.VITE_PINAI_MODEL_NAME,
};

function setPinaiEnv() {
  import.meta.env.VITE_PINAI_API_KEY = 'sk-test-secret-that-must-not-enter-the-bundle';
  import.meta.env.VITE_PINAI_BASE_URL = 'https://example.test/v1';
  import.meta.env.VITE_PINAI_MODEL_ID = 'unsafe-env-model';
  import.meta.env.VITE_PINAI_MODEL_NAME = 'Unsafe Env Model';
}

function restorePinaiEnv() {
  import.meta.env.VITE_PINAI_API_KEY = ORIGINAL_PINAI_ENV.apiKey;
  import.meta.env.VITE_PINAI_BASE_URL = ORIGINAL_PINAI_ENV.baseUrl;
  import.meta.env.VITE_PINAI_MODEL_ID = ORIGINAL_PINAI_ENV.modelId;
  import.meta.env.VITE_PINAI_MODEL_NAME = ORIGINAL_PINAI_ENV.modelName;
}

describe('useModels storage', () => {
  beforeEach(() => {
    localStorage.clear();
    setPinaiEnv();
  });

  afterEach(() => {
    localStorage.clear();
    window.xinyuexiaModelSecrets = undefined;
    restorePinaiEnv();
  });

  it('does not auto-create a model from Vite frontend environment secrets', () => {
    expect(readModelSnapshot()).toEqual([]);
  });

  it('migrates legacy plaintext API keys into Electron secure storage', async () => {
    localStorage.setItem(
      'xinyuexia_api_settings_v1',
      JSON.stringify({
        models: [
          {
            id: 'model-1',
            instanceId: 'model-instance-1',
            name: '模型一',
            enabled: true,
            baseUrl: 'https://example.test/v1',
            apiKey: 'sk-legacy-plaintext',
            model: 'model-1',
          },
        ],
      }),
    );
    const setSecret = vi.fn().mockResolvedValue({ ok: true, hasSecret: true });
    window.xinyuexiaModelSecrets = {
      status: vi.fn().mockResolvedValue({
        ok: true,
        encryptionAvailable: true,
        secrets: { 'model-instance-1': true },
      }),
      get: vi.fn(),
      set: setSecret,
      remove: vi.fn(),
    };

    const { result } = renderHook(() => useModels());

    await waitFor(() => expect(result.current.models[0]).toMatchObject({ apiKey: '', hasApiKey: true }));
    expect(setSecret).toHaveBeenCalledWith('model-instance-1', 'sk-legacy-plaintext');
    expect(localStorage.getItem('xinyuexia_api_settings_v1')).not.toContain('sk-legacy-plaintext');
  });
});
