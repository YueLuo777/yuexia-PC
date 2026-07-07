import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  filterRestorableLocalStorageData,
  replaceRestorableLocalStorageData,
  sanitizeLocalStorageBackup,
} from './DbSettingsPage';

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
      novel_card_settings: '{}',
      novel_library_dashboard_card_widths_v1: '{}',
      script_editor_linked_novel: '1',
      concept_library_ai_request_log_groups: '{}',
      unrelated_extension_token: 'external-token',
      '__proto__': 'polluted',
    });

    expect(filtered).toEqual({
      xinyuexia_novels_v1: '[]',
      workbench_notes: '[]',
      materials: '[]',
      current_novel_id: '1',
      novel_card_settings: '{}',
      novel_library_dashboard_card_widths_v1: '{}',
      script_editor_linked_novel: '1',
      concept_library_ai_request_log_groups: '{}',
    });
  });

  it('replaces current app-owned localStorage data when importing a global backup', () => {
    localStorage.clear();
    localStorage.setItem('xinyuexia_prompts_v1', 'old-prompts');
    localStorage.setItem('xinyuexia_novels_v1', 'old-novels');
    localStorage.setItem('novel_card_settings', 'old-card-settings');
    localStorage.setItem('unrelated_extension_token', 'external-token');

    const restored = replaceRestorableLocalStorageData({
      xinyuexia_prompts_v1: 'home-prompts',
      workbench_notes: 'home-notes',
      unrelated_extension_token: 'should-not-import',
    });

    expect(restored).toEqual({
      xinyuexia_prompts_v1: 'home-prompts',
      workbench_notes: 'home-notes',
    });
    expect(localStorage.getItem('xinyuexia_prompts_v1')).toBe('home-prompts');
    expect(localStorage.getItem('workbench_notes')).toBe('home-notes');
    expect(localStorage.getItem('xinyuexia_novels_v1')).toBeNull();
    expect(localStorage.getItem('novel_card_settings')).toBeNull();
    expect(localStorage.getItem('unrelated_extension_token')).toBe('external-token');
  });

  it('presents the page as global data migration instead of hidden database backup', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DbSettingsPage.tsx'), 'utf8');

    expect(source).toContain('全局数据迁移');
    expect(source).toContain('导出全局备份');
    expect(source).toContain('导入全局备份');
    expect(source).toContain('replaceRestorableLocalStorageData(localStorageData)');
    expect(source).toContain('yuexia-global-backup-');
    expect(source).toContain('API Key、Secret、Token、Password 等密钥字段会被清空');
  });
});
