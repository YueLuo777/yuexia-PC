import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  filterRestorableLocalStorageData,
  replaceRestorableLocalStorageData,
  sanitizeLocalStorageBackup,
} from './DbSettingsPage';

describe('DbSettingsPage backup guards', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });
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
    expect(backup.xinyuexia_novels_v1).toContainSource('测试小说');
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
      __proto__: 'polluted',
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

  it('rolls back to the previous snapshot when a backup write fails midway', () => {
    localStorage.setItem('xinyuexia_prompts_v1', 'old-prompts');
    localStorage.setItem('xinyuexia_novels_v1', 'old-novels');
    localStorage.setItem('unrelated_extension_token', 'external-token');
    const originalSetItem = Storage.prototype.setItem;
    let failed = false;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'workbench_notes' && !failed) {
        failed = true;
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    });

    expect(() =>
      replaceRestorableLocalStorageData({
        xinyuexia_prompts_v1: 'new-prompts',
        workbench_notes: 'new-notes',
      }),
    ).toThrow('导入失败，已恢复导入前的数据');

    expect(localStorage.getItem('xinyuexia_prompts_v1')).toBe('old-prompts');
    expect(localStorage.getItem('xinyuexia_novels_v1')).toBe('old-novels');
    expect(localStorage.getItem('workbench_notes')).toBeNull();
    expect(localStorage.getItem('unrelated_extension_token')).toBe('external-token');
  });

  it('presents the page as global data migration instead of hidden database backup', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'DbSettingsPage.tsx'), 'utf8');

    expect(source).toContainSource('全局数据迁移');
    expect(source).toContainSource('导出全局备份');
    expect(source).toContainSource('导入全局备份');
    expect(source).toContainSource('replaceRestorableLocalStorageData(localStorageData)');
    expect(source).toContainSource('yuexia-global-backup-');
    expect(source).toContainSource('API Key、Secret、Token、Password 等密钥字段会被清空');
  });
});
