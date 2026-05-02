import type { ReactNode } from 'react';
import { HiOutlineInbox } from 'react-icons/hi';
import './EmptyState.scss';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Consistent empty state for "no items match filters", "nothing here yet",
 * "first-time use" placeholders. Drop-in replacement for the inconsistent
 * empty divs scattered around the views.
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) => (
  <div className={`bm-empty-state bm-empty-state--${size}`}>
    <div className="bm-empty-state-icon">
      {icon || <HiOutlineInbox />}
    </div>
    <h3 className="bm-empty-state-title">{title}</h3>
    {description && <p className="bm-empty-state-desc">{description}</p>}
    {action && <div className="bm-empty-state-action">{action}</div>}
  </div>
);

export default EmptyState;
