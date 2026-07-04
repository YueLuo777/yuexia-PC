import type { CSSProperties, PointerEvent as ReactPointerEvent, PointerEventHandler } from 'react';

import {
  BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MAX_WIDTH,
  BRAINSTORM_LAYOUT_RIGHT_MIN_WIDTH,
  BRAINSTORM_PREVIEW_MAX_WIDTH,
  BRAINSTORM_PREVIEW_MIN_WIDTH,
  OUTLINE_ACTION_RIGHT_MIN_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
  PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
  PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH,
  PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
  PLOT_POINT_LAYOUT_TREE_MIN_WIDTH,
  SETTING_LIBRARY_RIGHT_MAX_WIDTH,
  SETTING_LIBRARY_RIGHT_MIN_WIDTH,
} from './workbenchLibraryPanelConstants';
import { BRAINSTORM_TAB, DETAIL_OUTLINE_TAB, OUTLINE_LIBRARY_TAB, SETTING_TAB } from './workbenchLibraryTabs';
import {
  getSettingLibraryLeftMaxWidth,
  getSettingLibraryLeftMinWidth,
  persistPlotPointLayoutWidth,
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
  plotPointLayoutTreeWidth: number;
  plotPointLayoutLeftWidth: number;
  plotPointLayoutRightWidth: number;
  setSettingLibraryLeftWidth: ResizeWidthSetter;
  setSettingLibraryRightWidth: ResizeWidthSetter;
  setBrainstormPreviewWidth: ResizeWidthSetter;
  setPlotPointLayoutTreeWidth: ResizeWidthSetter;
  setPlotPointLayoutLeftWidth: ResizeWidthSetter;
  setPlotPointLayoutRightWidth: ResizeWidthSetter;
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
  plotPointLayoutTreeWidth,
  plotPointLayoutLeftWidth,
  plotPointLayoutRightWidth,
  setSettingLibraryLeftWidth,
  setSettingLibraryRightWidth,
  setBrainstormPreviewWidth,
  setPlotPointLayoutTreeWidth,
  setPlotPointLayoutLeftWidth,
  setPlotPointLayoutRightWidth,
}: WorkbenchLibraryResizeHandlesOptions) {
  const startLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const isBrainstormTab = activeTab === BRAINSTORM_TAB;
    const minWidth = getSettingLibraryLeftMinWidth(activeTab, eventScale);
    const maxWidth = Math.max(
      minWidth,
      isBrainstormTab ? BRAINSTORM_LAYOUT_LEFT_MAX_WIDTH : getSettingLibraryLeftMaxWidth(activeTab, eventScale),
    );
    const startWidth = Math.min(maxWidth, Math.max(minWidth, settingLibraryLeftWidth));

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
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
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + deltaX),
      );
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
      const nextWidth = Math.min(
        maxWidth,
        Math.max(BRAINSTORM_PREVIEW_MIN_WIDTH, startWidth + deltaX),
      );
      setBrainstormPreviewWidth(nextWidth);
      persistSettingLibraryWidth(storageKey, activeTab, 'brainstormPreview', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  const startPlotPointTreeWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, plotPointLayoutTreeWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_TREE_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_TREE_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutTreeWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'tree', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  const startPlotPointLeftWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, plotPointLayoutLeftWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (moveEvent.clientX - startX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_LEFT_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_LEFT_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutLeftWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'left', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  const startPlotPointRightWidthResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { eventScale, startX } = prepareResize(event, scale);
    const startWidth = Math.min(
      PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
      Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, plotPointLayoutRightWidth),
    );

    const handleMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaX = (startX - moveEvent.clientX) / eventScale;
      const nextWidth = Math.min(
        PLOT_POINT_LAYOUT_RIGHT_MAX_WIDTH,
        Math.max(PLOT_POINT_LAYOUT_RIGHT_MIN_WIDTH, startWidth + deltaX),
      );
      setPlotPointLayoutRightWidth(nextWidth);
      persistPlotPointLayoutWidth(storageKey, 'right', nextWidth);
    };
    bindWindowResize(handleMove);
  };

  return {
    leftResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startLeftWidthResize}
        style={activeTab === SETTING_TAB ? { gridColumn: 2, gridRow: 2 } : undefined}
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
      <WorkbenchLibraryResizeHandle
        onPointerDown={startBrainstormPreviewWidthResize}
        title="拖拽调整脑洞预览宽度"
      />
    ),
    plotPointLeftResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startPlotPointLeftWidthResize}
        title="拖拽调整剧情链左侧宽度"
        widthClass="w-3"
      />
    ),
    plotPointTreeResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startPlotPointTreeWidthResize}
        title="拖拽调整剧情链目录宽度"
        widthClass="w-3"
      />
    ),
    plotPointRightResizeHandle: (
      <WorkbenchLibraryResizeHandle
        onPointerDown={startPlotPointRightWidthResize}
        title="拖拽调整剧情链右侧宽度"
        widthClass="w-3"
      />
    ),
  };
}
