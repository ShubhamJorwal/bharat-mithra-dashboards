import './Skeleton.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

/** A pulsing block. Use for any single bar of placeholder text or a thumbnail. */
export const Skeleton = ({ width, height = '14px', rounded = 'sm', className = '' }: SkeletonProps) => (
  <span
    className={`bm-skel bm-skel--r-${rounded} ${className}`}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }}
    aria-hidden
  />
);

/** A reusable card-shaped skeleton with title + 2 lines + footer. */
export const SkeletonCard = () => (
  <div className="bm-skel-card">
    <Skeleton height={20} width="60%" rounded="md" />
    <Skeleton height={12} width="92%" />
    <Skeleton height={12} width="78%" />
    <div className="bm-skel-card-footer">
      <Skeleton height={28} width={80} rounded="md" />
      <Skeleton height={28} width={28} rounded="full" />
    </div>
  </div>
);

/** Skeleton for a list view — n rows of icon + title + sub. */
export const SkeletonList = ({ rows = 5 }: { rows?: number }) => (
  <div className="bm-skel-list">
    {Array.from({ length: rows }).map((_, i) => (
      <div className="bm-skel-list-row" key={i}>
        <Skeleton width={36} height={36} rounded="full" />
        <div className="bm-skel-list-text">
          <Skeleton width="50%" height={13} />
          <Skeleton width="80%" height={11} />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton for a table — header + n rows × m cells. */
export const SkeletonTable = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="bm-skel-table">
    <div className="bm-skel-table-row bm-skel-table-row--head">
      {Array.from({ length: cols }).map((_, c) => (
        <Skeleton key={c} height={12} width="60%" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div className="bm-skel-table-row" key={r}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height={14} width={c === 0 ? '70%' : '85%'} />
        ))}
      </div>
    ))}
  </div>
);
