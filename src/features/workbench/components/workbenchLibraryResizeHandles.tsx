import type { CSSProperties, PointerEvent as ReactPointerEvent, PointerEventHandler } from 'react';

import {
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX,
  WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN,
  readSharedWorkbenchLeftNavWidthEnabled,
} from '@/features/workbench/model/workbenchSharedLeftNavWidth';
import {
  BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
  BRAINSTORM_PREVIEW_MAX_WIDTH,
  BRAINSTORM_PREVIEW_MIN_WIDTH,
  OUTLINE_ACTION_RIGHT_MIN_WIDTH,
  SETTING_LIBRARY_RIGHT_MAX_WIDTH,
  SETTING_LIBRARY_RIGHT_MIN_WIDTH,
} from './workbenchLibraryPanelConstants';
import { BRAINSTORM_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB, SETTING_TAB } from './workbenchLibraryTabs';
import {
  getSettingLibraryLeftMaxWidth,
  getSettingLibraryLeftMinWidth,
  persistSettingLibraryWidth,
} from './workbenchLibraryStorageState';

type WorkbenchLibraryResizeHandleProps = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  title: string;
  style?: CSSProperties;
  widthClass?: string;
  zClass?: string;
};

export function WorkbenchLibraryResizeHandle({
  onPointerDown,
  title,
  style,
  widthClass = 'w-4',
  zClass = 'z-30',
}: WorkbenchLibraryResizeHandleProps) {
  return (
    <div
      data-no-modal-drag="true"
      onPointerDown={onPointerDown}
      className={`group relative ${zClass} flex h-full ${widthClass} -translate-x-1/2 shrink-0 cursor-ew-resize touch-none items-stretch justify-center bg-transparent`}
      style={style}
      title={title}
    >
      <div className="h-full w-px bg-[#08AACE] opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

type ResizeWidthSetter = (value: number) => void;

type WorkbenchLibraryResizeHandlesOptions = {
  activeTab: string;
  storageKey: string;
  scale: number;
  settingLibraryLeftWidth: number;
  settingLibraryRightWidth: number;
  brainstormPreviewWidth: number;
  setSettingLibraryLeftWidth: ResizeWidthSetter;
  setSettingLibraryRightWidth: ResizeWidthSetter;
  setBrainstormPreviewWidth: ResizeWidthSetter;
};

function getResizeEventScale(element: HTMLElement, fallbackScale: number) {
  const rectWidth = element.getBoundingClientRect().width;
  const layoutWidth = element.offsetWidth;
  if (!rectWidth || !layoutWidth) return fallbackScale || 1;
  return rectWidth / layoutWidth || fallbackScale || 1;
}

function prepareResize(event: ReactPointerEvent<HTMLDivElement>, fallbackScale: number) {
  event.preventDefault();
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Window-level listeners keep the resize alive.
  }
  return {
    eventScale: getResizeEventScale(event.currentTarget, fallbackScale),
    startX: event.clientX,
  };
}

function bindWindowResize(handleMove: (moveEvent: PointerEvent) => void) {
  const stopResize = () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', stopResize);
}

export function useWorkbenchLibraryResizeHandles({
  activeTab,
  storageKey,
  scale,
  settingLibraryLeftWidth,
  settingLibraryRightWidth,
  brainstormPreviewWidth,
  setSettingLibraryLeftWidth,
  setSettingLibraryRightWidth,
  setBrainstormPreviewWidth,
}: WorkbenchLibraryResizeHandlesOptions) {
  const startLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const sharedNavigationWidth = readSharedWorkbenchLeftNavWidthEnabled();
    const minWidth = sharedNavigationWidth
      ? WORKBENCH_SHARED_LEFT_NAV_WIDTH_MIN
      : getSettingLibraryLeftMinWidth(activeTab, eventScale);
    const maxWidth = sharedNavigationWidth
      ? WORKBENCH_SHARED_LEFT_NAV_WIDTH_MAX
      : Math.max(
          minWidth,
          isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),
        );
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryLeftWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
      setSettingLibraryLeftWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'left', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  const startRightWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const isOutlineActionTab = activeTab === DETAIL_OUTLINE_TAB || activeTab === OUTLINE_LIBRARY_TAB;
    const minWidth = isBrainstormTab
      ? BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH
      : isOutlineActionTab
        ? OUTLINE_ACTION_RIGHT_MIN_WIDTH
        : SETTING_LIBRARY_RIGHT_MIN_WIDTH;
    const maxWidth = isBrainstormTab ? BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH : SETTING_LIBRARY_RIGHT_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryRightWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (startX - moveEvent.clientX) / eventScale;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
      setSettingLibraryRightWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'right', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  const startBrainstormPreviewWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const maxWidth = activeTab === BRAINSTORM_TAB ? BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH : BRAINSTORM_PREVIEW_MAX_WIDTH;
    const startWidth = Math.min(maxWidth, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, brainstormPreviewWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(maxWidth, Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX));
      setBrainstormPreviewWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'brainstormPreview', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  return {
    leftResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startLeftWidthResize}
        style={activeTab === SETTING_TAB ? { gridColumn: 2, gridRow: 1 } : undefined}
        title="拖拽调整左侧宽度"
        zClass="z-50"
      />
    ),
    rightResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startRightWidthResize}
        style={activeTab === SETTING_TAB ? { gridColumn: 4, gridRow: '1 / 3' } : undefined}
        title="拖拽调整右侧宽度"
        zClass="z-50"
      />
    ),
    brainstormPreviewResizeHandle: (
      <WorkbenchLibraryResizeHandle onPointerDown={startBrainstormPreviewWidthResize} title="拖拽调整脑洞预览宽度" />
    ),
  };
}
