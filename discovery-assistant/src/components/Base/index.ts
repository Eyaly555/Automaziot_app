/**
 * Base Components Index
 * Centralized exports for all base UI components
 */

// Button Components
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Card Components
export { Card } from './Card';
export type { CardProps } from './Card';

// Badge Components
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// Form Components (Layer 4)
export { Input } from './Input';
export { Select } from './Select';
export { TextArea } from './TextArea';
export type { Option } from './Select';

// Progress & Loading Components (Layer 4)
export { ProgressBar } from './ProgressBar';
export {
  Skeleton,
  ModuleSkeleton,
  DashboardSkeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
} from './LoadingSkeleton';
