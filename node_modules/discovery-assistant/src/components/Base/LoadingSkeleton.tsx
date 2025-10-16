interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) => {
  const getStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
    }
  };

  const getWidth = () => {
    if (width) return typeof width === 'number' ? `${width}px` : width;
    if (variant === 'text') return '100%';
    return undefined;
  };

  const getHeight = () => {
    if (height) return typeof height === 'number' ? `${height}px` : height;
    if (variant === 'circular') return getWidth();
    return undefined;
  };

  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${getStyles()}
        ${className}
      `}
      style={{
        width: getWidth(),
        height: getHeight(),
      }}
      role="status"
      aria-label="טוען..."
    />
  );
};

/**
 * Module loading skeleton
 * Used for module pages while data is loading
 */
export const ModuleSkeleton = () => {
  return (
    <div
      className="space-y-4 p-6"
      role="status"
      aria-label="טוען תוכן מודול..."
    >
      {/* Header */}
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="text" width="50%" height={16} />

      {/* Description */}
      <div className="space-y-3 mt-6">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="90%" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="20%" height={16} />
            <Skeleton variant="rectangular" height={40} />
          </div>
        ))}
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  );
};

/**
 * Dashboard loading skeleton
 * Used for dashboard while data is loading
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6" role="status" aria-label="טוען לוח בקרה...">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={16} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={120} />
      </div>

      {/* Main Content */}
      <Skeleton variant="rectangular" height={300} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rectangular" height={200} />
        <Skeleton variant="rectangular" height={200} />
      </div>
    </div>
  );
};

/**
 * Card loading skeleton
 * Used for individual cards while loading
 */
export const CardSkeleton = () => {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 space-y-3"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
};

/**
 * Table loading skeleton
 * Used for tables while loading
 */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-2" role="status" aria-label="טוען טבלה...">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-3 border-b">
          <Skeleton variant="text" height={16} />
          <Skeleton variant="text" height={16} />
          <Skeleton variant="text" height={16} />
          <Skeleton variant="text" height={16} />
        </div>
      ))}
    </div>
  );
};

/**
 * List loading skeleton
 * Used for lists while loading
 */
export const ListSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="space-y-3" role="status" aria-label="טוען רשימה...">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Form loading skeleton
 * Used for forms while loading
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <div className="space-y-4" role="status" aria-label="טוען טופס...">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="25%" height={16} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      <div className="flex gap-3 mt-6">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  );
};
