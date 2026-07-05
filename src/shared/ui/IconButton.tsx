import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { ICON_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  label: string;
  children: ReactNode;
  className?: string;
}

export function IconButton({
  label,
  children,
  className = '',
  type = 'button',
  title,
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={title ?? label}
      aria-label={label}
      className={`${ICON_BUTTON_CLASS} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
