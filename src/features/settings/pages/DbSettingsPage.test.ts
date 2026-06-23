import { describe, expect, it } from 'vitest';

import { filterRestorableLocalStorageData, sanitizeLocalStorageBackup } from './DbSettingsPage';

describe('DbSettingsPage backup guards', () => {
  it('redacts stored API keys and cloud secrets when exporting local backups', () => {
    const backup = sanitizeLocalStorageBackup({
      xinyuexia_api_settings_v1: JSON.stringify({
        models: [{ id: 'deepseek', apiKey: 'sk-live-secret-1234567890', baseUrl: 'https://api.example.test/v1' }],
      }),
      xinyuexia_concept_cloud_cos_config_v1: JSON.stringify({
        bucket: 'novel-bucket',
        region: 'ap-guangzhou',
        secretId: 'AKID-example',
        secretKey: 'secret-key-example',
      }),
      xinyuexia_novels_v1: JSON.stringify([{ id: 1, title: '测试小说' }]),
      unrelated_extension_token: 'external-token',
    });

    expect(JSON.parse(backup.xinyuexia_api_settings_v1).models[0]).toMatchObject({
      apiKey: '',
      baseUrl: 'https://api.example.test/v1',
    });
    expect(JSON.parse(backup.xinyuexia_concept_cloud_cos_config_v1)).toMatchObject({
      bucket: 'novel-bucket',
      region: 'ap-guangzhou',
      secretId: '',
      secretKey: '',
    });
    expect(backup.xinyuexia_novels_v1).toContain('测试小说');
    expect(backup.unrelated_extension_token).toBeUndefined();
  });

  it('only restores app-owned localStorage keys from imported backups', () => {
    const filtered = filterRestorableLocalStorageData({
      xinyuexia_novels_v1: '[]',
      workbench_notes: '[]',
      materials: '[]',
      current_novel_id: '1',
      unrelated_extension_token: 'external-token',
      '__proto__': 'polluted',
    });

    expect(filtered).toEqual({
      xinyuexia_novels_v1: '[]',
      workbench_notes: '[]',
      materials: '[]',
      current_novel_id: '1',
    });
  });
});
