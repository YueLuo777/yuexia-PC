import { useEffect, useState } from 'react';

import {
  readStandardSettingTemplateState,
  writeStandardSettingTemplateState,
} from '@/features/workbench/model/standardModeSettingModel';
import { buildDefaultTemplateStructure } from '@/features/workbench/model/standardModeTemplateModel';
import { StandardModeSettingPage } from '@/features/workbench/pages/StandardModeSettingPage';

const TEST_NOVEL_ID = 'standard-mode-compact-setting-workspace-test-23';
const TEST_STORAGE_KEY = 'xinyuexia_test_standard_mode_compact_settings_23';

export function StandardModeCompactSettingWorkspaceTestPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!readStandardSettingTemplateState(TEST_NOVEL_ID)) {
      writeStandardSettingTemplateState(TEST_NOVEL_ID, {
        version: 2,
        mode: 'template',
        templateId: 'test-23-current-standard-layout',
        templateName: '当前标准模式设定方案',
        structure: buildDefaultTemplateStructure(),
      });
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="grid h-full place-items-center bg-white text-sm font-semibold text-[#7b8794]">
        正在加载设定页面方案…
      </div>
    );
  }

  return (
    <StandardModeSettingPage
      novelId={TEST_NOVEL_ID}
      novelTitle="23号测试作品"
      novelCategory="玄幻"
      settingsStorageKey={TEST_STORAGE_KEY}
    />
  );
}

export default StandardModeCompactSettingWorkspaceTestPage;
