/**
 * Feedback & Notification Types
 *
 * Type definitions for user feedback systems including toasts, alerts,
 * auto-save indicators, loading states, and notifications.
 *
 * @module types/feedback
 */

import { ReactNode } from 'react';
import { ColorToken } from './design-system';

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Toast notification types
 *
 * @description
 * - success: Positive confirmation (green)
 * - error: Error messages (red)
 * - warning: Warnings and cautions (yellow/orange)
 * - info: Informational messages (blue)
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position on screen
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast action button configuration
 */
export interface ToastAction {
  /** Action button label */
  label: string;

  /** Click handler */
  onClick: () => void;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'link';
}

/**
 * Toast notification options
 *
 * @example
 * ```typescript
 * const toast: ToastOptions = {
 *   type: 'success',
 *   message: 'הנתונים נשמרו בהצלחה',
 *   duration: 3000,
 *   action: {
 *     label: 'בטל',
 *     onClick: () => handleUndo()
 *   }
 * };
 * ```
 */
export interface ToastOptions {
  /** Toast type/variant */
  type: ToastType;

  /** Message text */
  message: string;

  /** Optional title */
  title?: string;

  /** Display duration in milliseconds (0 = persistent) */
  duration?: number;

  /** Optional action button */
  action?: ToastAction;

  /** Custom icon */
  icon?: ReactNode;

  /** Is dismissible? */
  dismissible?: boolean;

  /** On dismiss callback */
  onDismiss?: () => void;

  /** Position override */
  position?: ToastPosition;

  /** Unique ID (auto-generated if not provided) */
  id?: string;

  /** Priority (higher priority shows on top) */
  priority?: number;
}

/**
 * Toast notification state
 */
export interface ToastState {
  /** Unique toast ID */
  id: string;

  /** Toast options */
  options: ToastOptions;

  /** Is toast visible? */
  visible: boolean;

  /** Creation timestamp */
  createdAt: Date;

  /** Expiration timestamp */
  expiresAt?: Date;
}

/**
 * Toast manager actions
 */
export interface ToastActions {
  /** Show toast */
  show: (options: Omit<ToastOptions, 'id'>) => string;

  /** Show success toast */
  success: (message: string, options?: Partial<ToastOptions>) => string;

  /** Show error toast */
  error: (message: string, options?: Partial<ToastOptions>) => string;

  /** Show warning toast */
  warning: (message: string, options?: Partial<ToastOptions>) => string;

  /** Show info toast */
  info: (message: string, options?: Partial<ToastOptions>) => string;

  /** Dismiss toast by ID */
  dismiss: (id: string) => void;

  /** Dismiss all toasts */
  dismissAll: () => void;

  /** Update existing toast */
  update: (id: string, options: Partial<ToastOptions>) => void;
}

// ============================================================================
// AUTO-SAVE INDICATOR
// ============================================================================

/**
 * Auto-save status states
 *
 * @description
 * - saved: All changes saved successfully
 * - saving: Currently saving changes
 * - error: Save operation failed
 * - idle: No changes to save
 */
export type AutoSaveStatus = 'saved' | 'saving' | 'error' | 'idle';

/**
 * Auto-save indicator state
 *
 * @example
 * ```typescript
 * const autoSave: AutoSaveState = {
 *   status: 'saving',
 *   message: 'שומר...',
 *   lastSaved: new Date(),
 *   error: undefined
 * };
 * ```
 */
export interface AutoSaveState {
  /** Current save status */
  status: AutoSaveStatus;

  /** Status message */
  message?: string;

  /** Last successful save timestamp */
  lastSaved?: Date;

  /** Error message if failed */
  error?: string;

  /** Pending changes count */
  pendingChanges?: number;

  /** Is syncing to cloud? */
  isSyncing?: boolean;

  /** Retry count for failed saves */
  retryCount?: number;
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  /** Debounce delay in milliseconds */
  debounceMs: number;

  /** Show indicator? */
  showIndicator?: boolean;

  /** Indicator position */
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /** Auto-retry on error? */
  autoRetry?: boolean;

  /** Maximum retry attempts */
  maxRetries?: number;

  /** Success callback */
  onSuccess?: () => void;

  /** Error callback */
  onError?: (error: Error) => void;
}

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Loading state configuration
 *
 * @example
 * ```typescript
 * const loading: LoadingState = {
 *   isLoading: true,
 *   message: 'טוען נתונים...',
 *   progress: 45
 * };
 * ```
 */
export interface LoadingState {
  /** Is loading active? */
  isLoading: boolean;

  /** Loading message */
  message?: string;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Current step (for multi-step operations) */
  currentStep?: number;

  /** Total steps */
  totalSteps?: number;

  /** Can be cancelled? */
  cancellable?: boolean;

  /** Cancel handler */
  onCancel?: () => void;
}

/**
 * Loading overlay configuration
 */
export interface LoadingOverlayConfig extends LoadingState {
  /** Overlay background opacity */
  opacity?: number;

  /** Blur background? */
  blur?: boolean;

  /** Show spinner? */
  showSpinner?: boolean;

  /** Spinner size */
  spinnerSize?: 'sm' | 'md' | 'lg';

  /** Custom spinner component */
  spinner?: ReactNode;

  /** Minimum display time (ms) to prevent flashing */
  minimumDuration?: number;
}

/**
 * Skeleton loader configuration
 */
export interface SkeletonConfig {
  /** Skeleton variant */
  variant: 'text' | 'circular' | 'rectangular';

  /** Width */
  width?: string | number;

  /** Height */
  height?: string | number;

  /** Number of lines (for text variant) */
  lines?: number;

  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';

  /** Custom className */
  className?: string;
}

// ============================================================================
// ALERTS & BANNERS
// ============================================================================

/**
 * Alert variant types
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Alert configuration
 *
 * @example
 * ```typescript
 * const alert: AlertConfig = {
 *   variant: 'warning',
 *   title: 'שים לב',
 *   message: 'יש שדות חובה שטרם מולאו',
 *   dismissible: true,
 *   actions: [
 *     { label: 'תקן עכשיו', onClick: handleFix }
 *   ]
 * };
 * ```
 */
export interface AlertConfig {
  /** Alert variant */
  variant: AlertVariant;

  /** Alert title */
  title?: string;

  /** Alert message */
  message: string | ReactNode;

  /** Custom icon */
  icon?: ReactNode;

  /** Is dismissible? */
  dismissible?: boolean;

  /** Action buttons */
  actions?: ToastAction[];

  /** On dismiss callback */
  onDismiss?: () => void;

  /** Show border? */
  bordered?: boolean;

  /** Elevated style? */
  elevated?: boolean;
}

/**
 * Banner notification (persistent alert)
 */
export interface BannerConfig extends AlertConfig {
  /** Banner position */
  position?: 'top' | 'bottom';

  /** Stick to viewport? */
  sticky?: boolean;

  /** Auto-hide after duration (ms) */
  autoHide?: number;

  /** Show close button? */
  closable?: boolean;
}

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

/**
 * Confirmation dialog configuration
 *
 * @example
 * ```typescript
 * const confirm: ConfirmDialogConfig = {
 *   title: 'מחיקת פגישה',
 *   message: 'האם אתה בטוח שברצונך למחוק את הפגישה? פעולה זו אינה ניתנת לביטול.',
 *   confirmText: 'מחק',
 *   cancelText: 'בטל',
 *   variant: 'danger',
 *   onConfirm: handleDelete,
 *   onCancel: handleCancel
 * };
 * ```
 */
export interface ConfirmDialogConfig {
  /** Dialog title */
  title: string;

  /** Confirmation message */
  message: string | ReactNode;

  /** Confirm button text */
  confirmText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Dialog variant (affects styling) */
  variant?: 'default' | 'danger' | 'warning';

  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger' | 'warning';

  /** Confirm callback */
  onConfirm: () => void | Promise<void>;

  /** Cancel callback */
  onCancel?: () => void;

  /** Show icon? */
  showIcon?: boolean;

  /** Custom icon */
  icon?: ReactNode;

  /** Require text confirmation? */
  requireTextConfirm?: boolean;

  /** Required confirmation text */
  confirmationText?: string;

  /** Is async operation? */
  isAsync?: boolean;
}

// ============================================================================
// PROGRESS INDICATORS
// ============================================================================

/**
 * Progress bar configuration
 */
export interface ProgressBarConfig {
  /** Current value (0-100) */
  value: number;

  /** Label text */
  label?: string;

  /** Show percentage? */
  showPercentage?: boolean;

  /** Color variant */
  variant?: ColorToken;

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Animated? */
  animated?: boolean;

  /** Striped pattern? */
  striped?: boolean;

  /** Indeterminate (loading) state? */
  indeterminate?: boolean;

  /** Buffer value (for buffering indicators) */
  buffer?: number;
}

/**
 * Circular progress configuration
 */
export interface CircularProgressConfig {
  /** Current value (0-100) */
  value: number;

  /** Size in pixels */
  size?: number;

  /** Stroke width */
  strokeWidth?: number;

  /** Color variant */
  variant?: ColorToken;

  /** Show percentage text? */
  showValue?: boolean;

  /** Custom center content */
  children?: ReactNode;

  /** Indeterminate (loading) state? */
  indeterminate?: boolean;
}

/**
 * Stepper progress configuration
 */
export interface StepperConfig {
  /** Current step (0-based) */
  currentStep: number;

  /** Total steps */
  totalSteps: number;

  /** Step labels */
  steps: Array<{
    label: string;
    description?: string;
    icon?: ReactNode;
  }>;

  /** Orientation */
  orientation?: 'horizontal' | 'vertical';

  /** Show step numbers? */
  showNumbers?: boolean;

  /** Allow click to navigate? */
  clickable?: boolean;

  /** Step click handler */
  onStepClick?: (step: number) => void;
}

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

/**
 * Notification item
 */
export interface NotificationItem {
  /** Notification ID */
  id: string;

  /** Notification type */
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'system';

  /** Title */
  title: string;

  /** Message */
  message: string;

  /** Icon */
  icon?: ReactNode;

  /** Timestamp */
  timestamp: Date;

  /** Is read? */
  read: boolean;

  /** Click action */
  onClick?: () => void;

  /** Associated link */
  link?: string;

  /** Action buttons */
  actions?: ToastAction[];
}

/**
 * Notification center state
 */
export interface NotificationCenterState {
  /** All notifications */
  notifications: NotificationItem[];

  /** Unread count */
  unreadCount: number;

  /** Is open? */
  isOpen: boolean;

  /** Add notification */
  add: (
    notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => void;

  /** Mark as read */
  markAsRead: (id: string) => void;

  /** Mark all as read */
  markAllAsRead: () => void;

  /** Remove notification */
  remove: (id: string) => void;

  /** Clear all */
  clearAll: () => void;

  /** Toggle open/close */
  toggle: () => void;
}

// ============================================================================
// EMPTY STATES
// ============================================================================

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Icon or illustration */
  icon?: ReactNode;

  /** Title */
  title: string;

  /** Description */
  description?: string;

  /** Primary action */
  primaryAction?: ToastAction & { icon?: ReactNode };

  /** Secondary action */
  secondaryAction?: ToastAction & { icon?: ReactNode };

  /** Custom content */
  children?: ReactNode;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// ERROR BOUNDARIES
// ============================================================================

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  /** Has error occurred? */
  hasError: boolean;

  /** Error object */
  error?: Error;

  /** Error info */
  errorInfo?: React.ErrorInfo;

  /** Reset error state */
  reset: () => void;
}

/**
 * Error fallback configuration
 */
export interface ErrorFallbackConfig {
  /** Error object */
  error: Error;

  /** Error info */
  errorInfo?: React.ErrorInfo;

  /** Reset handler */
  onReset: () => void;

  /** Show technical details? */
  showDetails?: boolean;

  /** Custom message */
  message?: string;

  /** Contact support link */
  supportLink?: string;
}

// ============================================================================
// DEVELOPER FEEDBACK SYSTEM (Personal Use)
// ============================================================================

/**
 * Console log entry for feedback capture
 */
export interface ConsoleLogEntry {
  /** Log level */
  level: 'log' | 'warn' | 'error' | 'info';

  /** Log message */
  message: string;

  /** Timestamp */
  timestamp: string;

  /** Stack trace (errors only) */
  stack?: string;
}

/**
 * Component information for feedback context
 */
export interface ComponentInfo {
  /** Component name */
  name: string;

  /** Display name (Hebrew/English) */
  displayName: string;

  /** File path */
  filePath: string;
}

/**
 * Feedback entry categories
 */
export type FeedbackCategory =
  | 'bug'
  | 'feature'
  | 'ui_ux'
  | 'error'
  | 'performance'
  | 'note';

/**
 * Feedback priority levels
 */
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Feedback status
 */
export type FeedbackStatus = 'todo' | 'doing' | 'done';

/**
 * Developer feedback entry
 *
 * @description
 * Captures bugs, features, and notes during production testing
 * for review in Claude Code development sessions.
 *
 * @example
 * ```typescript
 * const feedback: FeedbackEntry = {
 *   id: 'abc-123',
 *   timestamp: '2025-01-09T14:30:00Z',
 *   route: '/phase2/systems',
 *   componentName: 'SystemDeepDive',
 *   filePath: 'src/components/Phase2/SystemDeepDive.tsx',
 *   category: 'bug',
 *   priority: 'high',
 *   title: 'Save button freezes page',
 *   description: 'Clicking save causes 5 second freeze then console error',
 *   consoleLogs: [...],
 *   consoleErrors: [...],
 *   status: 'todo'
 * };
 * ```
 */
export interface FeedbackEntry {
  /** Unique ID */
  id: string;

  /** Creation timestamp (ISO 8601) */
  timestamp: string;

  // Location Context
  /** Current route */
  route: string;

  /** Component name */
  componentName: string;

  /** File path */
  filePath: string;

  /** Optional line number */
  lineNumber?: number;

  // Feedback Content
  /** Feedback category */
  category: FeedbackCategory;

  /** Priority level */
  priority: FeedbackPriority;

  /** Feedback title */
  title: string;

  /** Detailed description */
  description: string;

  // Technical Data
  /** Recent console logs */
  consoleLogs: ConsoleLogEntry[];

  /** Console errors only */
  consoleErrors: ConsoleLogEntry[];

  /** Screenshot (base64) */
  screenshot?: string;

  // Status Tracking
  /** Current status */
  status: FeedbackStatus;

  /** Resolution notes */
  notes?: string;
}
