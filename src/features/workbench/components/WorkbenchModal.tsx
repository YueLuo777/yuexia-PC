import type { ReactNode } from 'react';
import type { ModalGeometry } from '@/shared/hooks/draggableModalGeometry';

import { AppModalShell } from '@/shared/ui/AppModalShell';

interface WorkbenchModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  subtitle?: ReactNode;
  widthClass?: string;
  heightClass?: string;
  titleClassName?: string;
  headerExtra?: ReactNode;
  closeOnBackdrop?: boolean;
  storageId?: string;
  zIndexClass?: string;
  panelClassName?: string;
  contentClassName?: string;
  defaultGeometry?: ModalGeometry;
}

export function WorkbenchModal({
  title,
  isOpen,
  onClose,
  children,
  subtitle,
  widthClass = 'w-[720px]',
  heightClass = 'h-[78vh] max-h-[86vh]',
  titleClassName = 'text-base',
  headerExtra,
  closeOnBackdrop = true,
  storageId,
  zIndexClass = 'z-[260]',
  panelClassName,
  contentClassName,
  defaultGeometry,
}: WorkbenchModalProps) {
  return (
    <AppModalShell
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      subtitle={subtitle}
      widthClass={widthClass}
      heightClass={heightClass}
      titleClassName={titleClassName}
      headerExtra={headerExtra}
      closeOnBackdrop={closeOnBackdrop}
      storageId={storageId ?? `workbench_${title}`}
      zIndexClass={zIndexClass}
      panelClassName={panelClassName}
      contentClassName={contentClassName}
      defaultGeometry={defaultGeometry}
    >
      {children}
    </AppModalShell>
  );
}
