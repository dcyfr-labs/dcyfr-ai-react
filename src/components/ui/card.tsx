/**
 * Card component
 */
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Card({ title, description, children, className, footer }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t p-6 pt-4">{footer}</div>}
    </div>
  );
}
