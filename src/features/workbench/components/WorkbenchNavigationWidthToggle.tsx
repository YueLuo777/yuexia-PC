import { useEffect, useState } from 'react';

import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT,
  readSharedWorkbenchLeftNavWidthEnabled,
  writeSharedWorkbenchLeftNavWidthEnabled,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';

const CHAPTER_SIDEBAR_WIDTH_STORAGE_KEY = 'xinyuexia_chapter_sidebar_width';
const CHAPTER_SIDEBAR_DEFAULT_WIDTH = 200;
const CHAPTER_SIDEBAR_MIN_WIDTH = 200;
const CHAPTER_SIDEBAR_MAX_WIDTH = 420;

function readStoredChapterSidebarWidth() {
  try {
    const stored = Number(localStorage.getItem(CHAPTER_SIDEBAR_WIDTH_STORAGE_KEY));
    if (!Number.isFinite(stored) || stored <= 0) return CHAPTER_SIDEBAR_DEFAULT_WIDTH;
    return Math.min(CHAPTER_SIDEBAR_MAX_WIDTH, Math.max(CHAPTER_SIDEBAR_MIN_WIDTH, Math.round(stored)));
  } catch {
    return CHAPTER_SIDEBAR_DEFAULT_WIDTH;
  }
}

export function WorkbenchNavigationWidthToggle() {
  const [enabled, setEnabled] = useState(() => readSharedWorkbenchLeftNavWidthEnabled());

  useEffect(() => {
    const syncEnabled = () => setEnabled(readSharedWorkbenchLeftNavWidthEnabled());
    window.addEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncEnabled);
    return () => window.removeEventListener(WORKBENCH_SHARED_LEFT_NAV_WIDTH_EVENT, syncEnabled);
  }, []);

  const updateEnabled = (checked: boolean) => {
    writeSharedWorkbenchLeftNavWidthEnabled(
      checked,
      checked
        ? {
            width: readStoredChapterSidebarWidth(),
            maxWidth: CHAPTER_SIDEBAR_MAX_WIDTH,
            minWidth: CHAPTER_SIDEBAR_MIN_WIDTH,
          }
        : undefined,
    );
    setEnabled(checked);
  };

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand/60">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => updateEnabled(event.target.checked)}
        className="mt-1 h-4 w-4 accent-brand"
      />
      <span>
        <span className="block text-base font-bold text-gray-900">导航宽度统一</span>
        <span className="mt-1 block text-sm leading-6 text-gray-500">
          勾选后，各页面左侧导航宽度跟随正文目录；取消后，各页面可单独拖拽保存。
        </span>
      </span>
    </label>
  );
}
