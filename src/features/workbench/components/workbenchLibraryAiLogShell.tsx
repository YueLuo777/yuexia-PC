import type { ReactNode } from 'react';

import { AppModalShell } from '@/shared/ui/AppModalShell';

export function LibraryAiLogShell({
  id,
  subtitle,
  headerTools,
  onClose,
  children,
}: {
  id: string;
  subtitle: string;
  headerTools?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AppModalShell
      title="输出日志"
      subtitle={subtitle}
      isOpen
      onClose={onClose}
      storageId={id}
      widthClass="w-[min(1120px,94vw)]"
      heightClass="h-[min(820px,88vh)]"
      zIndexClass="z-[285]"
      backdropClassName="bg-black/35"
      closeOnBackdrop
      headerExtra={headerTools ? <div className="flex min-w-0 items-center gap-2">{headerTools}</div> : null}
    >
      {children}
    </AppModalShell>
  );
}
