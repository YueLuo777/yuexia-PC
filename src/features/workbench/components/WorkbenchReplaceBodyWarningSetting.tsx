import { useState } from 'react';

import {
  MAX_REPLACE_BODY_WARNING_THRESHOLD,
  readReplaceBodyWarningThreshold,
  writeReplaceBodyWarningThreshold,
} from '@/features/workbench/model/workbenchReplaceBodyWarning';

export function WorkbenchReplaceBodyWarningSetting() {
  const [draft, setDraft] = useState(() => String(readReplaceBodyWarningThreshold()));

  const saveDraft = () => {
    const saved = writeReplaceBodyWarningThreshold(draft);
    setDraft(String(saved));
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-base font-bold text-gray-900">替换正文提醒</h3>
      <p className="mt-1 text-sm leading-6 text-gray-500">AI 输出字数过少时，替换当前章节前先弹窗确认。</p>
      <label className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-gray-700">
        <span>少于</span>
        <input
          type="number"
          min={0}
          max={MAX_REPLACE_BODY_WARNING_THRESHOLD}
          step={100}
          value={draft}
          aria-label="替换正文提醒字数"
          onChange={(event) => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);
            if (nextDraft !== '') writeReplaceBodyWarningThreshold(nextDraft);
          }}
          onBlur={saveDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          className="h-9 w-28 rounded-lg border border-gray-200 bg-white px-3 text-center text-sm font-black text-gray-800 outline-none focus:border-brand"
        />
        <span>字时，替换正文会提醒</span>
      </label>
      <p className="mt-2 text-xs leading-5 text-gray-400">默认 2000 字；设为 0 可关闭提醒。</p>
    </section>
  );
}
