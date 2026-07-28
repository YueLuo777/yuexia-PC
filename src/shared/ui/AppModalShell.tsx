import { X } from 'lucide-react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import type { ModalGeometry } from '@/shared/hooks/draggableModalGeometry';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';

interface AppModalShellProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  widthClass?: string;
  heightClass?: string;
  titleClassName?: string;
  storageId?: string;
  closeOnBackdrop?: boolean;
  closeOnFloatingShortcut?: boolean;
  zIndexClass?: string;
  backdropClassName?: string;
  backdropPaddingClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  portalTarget?: Element | DocumentFragment;
  defaultGeometry?: ModalGeometry;
  centerOnOpen?: boolean;
}

export function AppModalShell({
  title,
  isOpen,
  onClose,
  children,
  subtitle,
  headerExtra,
  widthClass = 'w-[720px]',
  heightClass = 'h-[78vh] max-h-[86vh]',
  titleClassName = 'text-base',
  storageId,
  closeOnBackdrop = true,
  closeOnFloatingShortcut = true,
  zIndexClass = 'z-[220]',
  backdropClassName = 'bg-black/40',
  backdropPaddingClassName = 'p-4',
  panelClassName = '',
  contentClassName = 'flex min-h-0 flex-1 flex-col overflow-hidden',
  portalTarget,
  defaultGeometry,
  centerOnOpen = false,
}: AppModalShellProps) {
  const draggable = useDraggableModal(storageId ?? `app_modal_${title}`, defaultGeometry, centerOnOpen);
  const { resetToDefault } = draggable;
  const wasOpenRef = useRef(false);
  const centerOnInitialRender = isOpen && centerOnOpen && !wasOpenRef.current;
  const centeredOpeningStyle: CSSProperties = {
    transform: 'translate(0px, 0px)',
    ...(defaultGeometry?.width ? { width: defaultGeometry.width } : null),
    ...(defaultGeometry?.height ? { height: defaultGeometry.height } : null),
  };
  useTopModalEscape(isOpen, onClose);

  useEffect(() => {
    if (isOpen && centerOnOpen && !wasOpenRef.current) resetToDefault();
    wasOpenRef.current = isOpen;
  }, [centerOnOpen, isOpen, resetToDefault]);

  useEffect(() => {
    if (!isOpen || !closeOnFloatingShortcut) return;
    const handleShortcut = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id === 'close_floating') onClose();
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    return () => {
      window.removeEventListener(SHORTCUT_ACTION_EVENT, handleShortcut);
    };
  }, [closeOnFloatingShortcut, isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`modal-sharp fixed inset-0 ${zIndexClass} flex items-center justify-center ${backdropClassName} ${backdropPaddingClassName}`}
      data-app-modal-backdrop="true"
      style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex ${heightClass} ${widthClass} max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${panelClassName}`}
        data-app-modal-panel="true"
        data-draggable-managed="true"
        style={{
          ...(centerOnInitialRender ? centeredOpeningStyle : draggable.style),
          WebkitAppRegion: 'no-drag',
        } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="group flex min-h-14 shrink-0 cursor-move items-center justify-between gap-4 border-b border-gray-100 px-5 py-3 active:cursor-grabbing"
          {...draggable.dragHandleProps}
          style={{ ...draggable.dragHandleProps.style, WebkitAppRegion: 'no-drag' } as CSSProperties}
        >
          <div className="min-w-0 shrink-0 cursor-move">
            <h2 className={`truncate font-bold text-gray-900 ${titleClassName}`}>{title}</h2>
            {subtitle ? (
              <div className="mt-0.5 max-w-[420px] truncate text-xs font-bold text-slate-400">{subtitle}</div>
            ) : null}
          </div>
          <div
            id="app-modal-header-extra"
            data-no-modal-drag="true"
            className="flex min-w-0 flex-1 items-center justify-end"
          >
            {headerExtra}
          </div>
          <button
            type="button"
            onClick={onClose}
            data-no-modal-drag="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#08AACE]/50 hover:bg-[#EAF9FD] hover:text-[#078fb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE4F2]"
            title="关闭"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className={contentClassName}>{children}</div>
        <ModalResizeHandles draggable={draggable} />
      </section>
    </div>,
    portalTarget ?? document.body,
  );
}
