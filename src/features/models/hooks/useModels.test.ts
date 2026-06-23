import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readModelSnapshot } from './useModels';

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
    restorePinaiEnv();
  });

  it('does not auto-create a model from Vite frontend environment secrets', () => {
    expect(readModelSnapshot()).toEqual([]);
  });
});
