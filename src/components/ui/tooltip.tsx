import React from 'react';
import { cn } from '@/lib/utils';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: TooltipSide;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  side = 'bottom',
  className,
}) => {
  return (
    <span className={cn('tooltip', `tooltip--${side}`, className)}>
      {children}
      <span className="tooltip__label" role="tooltip">
        {label}
      </span>
    </span>
  );
};
