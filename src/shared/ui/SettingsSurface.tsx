import type { ReactNode } from 'react';

export type SettingsSurfaceMode = 'page' | 'modal' | 'embedded';

interface SettingsSurfaceProps {
  children: ReactNode;
  mode?: SettingsSurfaceMode;
  className?: string;
}

const SURFACE_CLASS: Record<SettingsSurfaceMode, string> = {
  page: 'h-full min-h-0 overflow-hidden bg-slate-50 px-8 py-6',
  modal: 'h-full min-h-0 overflow-hidden bg-white',
  embedded: 'h-full min-h-0 overflow-hidden',
};

export function SettingsSurface({ children, mode = 'page', className = '' }: SettingsSurfaceProps) {
  return <div className={`${SURFACE_CLASS[mode]} ${className}`}>{children}</div>;
}
