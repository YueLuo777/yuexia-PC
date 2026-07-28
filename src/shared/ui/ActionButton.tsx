import type { ButtonHTMLAttributes, ReactNode } from 'react';

import {
  DANGER_TEXT_BUTTON_CLASS,
  DANGER_OUTLINE_TEXT_BUTTON_CLASS,
  GHOST_TEXT_BUTTON_CLASS,
  INLINE_PRIMARY_TEXT_BUTTON_CLASS,
  PRIMARY_TEXT_BUTTON_CLASS,
  SECONDARY_TEXT_BUTTON_CLASS,
} from '@/shared/ui/actionButtonClasses';

export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';
export type ActionButtonSize = 'sm' | 'md';

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  className?: string;
}

const VARIANT_CLASS: Record<ActionButtonVariant, string> = {
  primary: PRIMARY_TEXT_BUTTON_CLASS,
  secondary: SECONDARY_TEXT_BUTTON_CLASS,
  danger: DANGER_TEXT_BUTTON_CLASS,
  dangerOutline: DANGER_OUTLINE_TEXT_BUTTON_CLASS,
  ghost: GHOST_TEXT_BUTTON_CLASS,
};

const SIZE_CLASS: Record<ActionButtonSize, string> = {
  sm: INLINE_PRIMARY_TEXT_BUTTON_CLASS,
  md: PRIMARY_TEXT_BUTTON_CLASS,
};

const SECONDARY_SIZE_CLASS: Record<ActionButtonSize, string> = {
  sm: 'min-w-[64px] px-3',
  md: '',
};

export function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...buttonProps
}: ActionButtonProps) {
  const baseClassName = variant === 'primary' ? SIZE_CLASS[size] : VARIANT_CLASS[variant];
  return (
    <button
      type={type}
      className={`${baseClassName} ${variant === 'primary' ? '' : SECONDARY_SIZE_CLASS[size]} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
