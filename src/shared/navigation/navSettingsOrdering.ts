import { ArrowLeft, Settings, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { INLINE_PRIMARY_TEXT_BUTTON_CLASS, PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';
import {
  NAV_CONFIG_UPDATED_EVENT,
  getIconByName,
  loadNavConfig,
  normalizeNavConfig,
  resetNavConfig,
  saveNavConfig,
} from '@/shared/navigation/navConfig';
import type { NavGroupConfig, NavItemConfig } from '@/shared/navigation/navConfig';

const SETTINGS_PAGE_BACK_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors border-brand/20 bg-white text-brand hover:bg-brand-light';
const SETTINGS_LIGHT_BUTTON_CLASS = PRIMARY_TEXT_BUTTON_CLASS;
const SETTINGS_INLINE_BUTTON_CLASS = INLINE_PRIMARY_TEXT_BUTTON_CLASS;
const SETTINGS_PAGE_SHELL_CLASS = 'mx-auto flex h-full w-full max-w-[1120px] flex-col overflow-hidden';

interface NavSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NavGroupConfig[];
  onSave: (config: NavGroupConfig[]) => void;
  onReset: () => void;
  variant?: 'modal' | 'page' | 'embedded';
}

const ROOT_NAV_GROUP: NavGroupConfig = {
  title: '导航',
  iconName: 'LayoutGrid',
  dividerAfterItemTo: '/novels',
  dividerAfterItemTos: ['/novels'],
  items: [],
};

function normalizeDraft(config: NavGroupConfig[]) {
  const items = config.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      hidden: item.hidden || group.hidden || undefined,
    })),
  );

  return [
    {
      ...ROOT_NAV_GROUP,
      dividerAfterItemTo: config[0]?.dividerAfterItemTo ?? null,
      dividerAfterItemTos:
        config[0]?.dividerAfterItemTos ?? (config[0]?.dividerAfterItemTo ? [config[0].dividerAfterItemTo] : []),
      items,
    },
  ];
}

function getSwapPreviewItems<T>(items: T[], dragSourceIndex: number | null, targetIndex: number | null) {
  if (
    dragSourceIndex === null ||
    targetIndex === null ||
    dragSourceIndex === targetIndex ||
    dragSourceIndex < 0 ||
    targetIndex < 0 ||
    dragSourceIndex >= items.length ||
    targetIndex >= items.length
  )
    return items;
  const next = [...items];
  const [moved] = next.splice(dragSourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

type NavPointerDragState = {
  sourceIndex: number;
  pointerId: number;
  element: HTMLElement;
  startX: number;
  startY: number;
  active: boolean;
  armed: boolean;
  activationTimer: number;
  lastPreviewX: number;
  lastPreviewY: number;
  lastPreviewTargetKey: string | null;
  cleanup: () => void;
} | null;

export const NAV_POINTER_DRAG_ACTIVATION_DISTANCE = 14;
export const NAV_POINTER_DRAG_ACTIVATION_DELAY_MS = 160;
export const NAV_POINTER_DRAG_RETARGET_DISTANCE = 28;
export const NAV_POINTER_DRAG_RETURN_DISTANCE = 28;

export function hasNavPointerRetargetedTooSoon(
  pointerDrag: NonNullable<NavPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  if (!pointerDrag.lastPreviewTargetKey || pointerDrag.lastPreviewTargetKey === targetKey) return false;
  const distanceFromLastPreview = Math.hypot(clientX - pointerDrag.lastPreviewX, clientY - pointerDrag.lastPreviewY);
  const retargetDistance =
    targetKey === `nav:${pointerDrag.sourceIndex}`
      ? NAV_POINTER_DRAG_RETURN_DISTANCE
      : NAV_POINTER_DRAG_RETARGET_DISTANCE;
  return distanceFromLastPreview < retargetDistance;
}

export function rememberNavPointerPreviewTarget(
  pointerDrag: NonNullable<NavPointerDragState>,
  targetKey: string,
  clientX: number,
  clientY: number,
) {
  pointerDrag.lastPreviewTargetKey = targetKey;
  pointerDrag.lastPreviewX = clientX;
  pointerDrag.lastPreviewY = clientY;
}
