import type { ReactNode } from 'react';
import { WorkbenchModal } from './WorkbenchModal';

export function ModalShell({
  title,
  icon,
  children,
  onClose,
  widthClass = 'w-[520px]',
  closeOnBackdrop = true,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
  closeOnBackdrop?: boolean;
}) {
  return (
    <WorkbenchModal
      title={title}
      isOpen
      onClose={onClose}
      widthClass={widthClass}
      heightClass="h-auto max-h-[88vh]"
      headerExtra={icon}
      closeOnBackdrop={closeOnBackdrop}
      storageId={`editor_tool_${title}`}
      zIndexClass="z-[240]"
      contentClassName="min-h-0 overflow-y-auto"
    >
        {children}
    </WorkbenchModal>
  );
}
