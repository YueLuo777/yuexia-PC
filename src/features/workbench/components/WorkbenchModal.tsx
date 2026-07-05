import type { ReactNode } from 'react';

import { AppModalShell } from '@/shared/ui/AppModalShell';

interface WorkbenchModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
  heightClass?: string;
  titleClassName?: string;
  headerExtra?: ReactNode;
  closeOnBackdrop?: boolean;
  storageId?: string;
}

export function WorkbenchModal({
  title,
  isOpen,
  onClose,
  children,
  widthClass = 'w-[720px]',
  heightClass = 'h-[78vh] max-h-[86vh]',
  titleClassName = 'text-base',
  headerExtra,
  closeOnBackdrop = true,
  storageId,
}: WorkbenchModalProps) {
  return (
    <AppModalShell
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      widthClass={widthClass}
      heightClass={heightClass}
      titleClassName={titleClassName}
      headerExtra={headerExtra}
      closeOnBackdrop={closeOnBackdrop}
      storageId={storageId ?? `workbench_${title}`}
      zIndexClass="z-[200]"
    >
      {children}
    </AppModalShell>
  );
}
