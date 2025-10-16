/**
 * Design System Types
 *
 * Core type definitions for the Discovery Assistant design system.
 * These types ensure consistency across all UI components.
 *
 * @module types/design-system
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Color token types for semantic UI states
 *
 * @example
 * ```typescript
 * const buttonColor: ColorToken = 'primary';
 * const errorColor: ColorToken = 'danger';
 * ```
 */
export type ColorToken =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

/**
 * Extended color palette including semantic and neutral colors
 */
export type ColorPalette =
  | ColorToken
  | 'gray'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange';

// ============================================================================
// SIZE TOKENS
// ============================================================================

/**
 * Standard size scale for components
 *
 * @example
 * ```typescript
 * const buttonSize: SizeToken = 'md'; // Medium
 * const iconSize: SizeToken = 'xs';   // Extra small
 * ```
 */
export type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Spacing scale following 4px grid system
 *
 * @description
 * - 0 = 0px
 * - 1 = 4px
 * - 2 = 8px
 * - 3 = 12px
 * - 4 = 16px
 * - 5 = 20px
 * - 6 = 24px
 * - 8 = 32px
 * - 10 = 40px
 * - 12 = 48px
 * - 16 = 64px
 * - 20 = 80px
 * - 24 = 96px
 *
 * @example
 * ```typescript
 * const padding: SpacingToken = 4; // 16px
 * const margin: SpacingToken = 2;  // 8px
 * ```
 */
export type SpacingToken =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

/**
 * Button component visual variants
 *
 * @description
 * - primary: Main call-to-action (blue, solid)
 * - secondary: Secondary actions (gray, solid)
 * - success: Positive actions (green, solid)
 * - danger: Destructive actions (red, solid)
 * - ghost: Minimal style, transparent background
 * - link: Text-only, no background or border
 *
 * @example
 * ```typescript
 * <Button variant="primary">Submit</Button>
 * <Button variant="ghost">Cancel</Button>
 * ```
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'link';

/**
 * Card component visual variants
 *
 * @description
 * - default: Standard white card with subtle shadow
 * - bordered: Card with visible border, no shadow
 * - elevated: Card with prominent shadow
 * - highlighted: Card with colored border and background
 *
 * @example
 * ```typescript
 * <Card variant="elevated">
 *   <h3>Important Content</h3>
 * </Card>
 * ```
 */
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'highlighted';

/**
 * Badge component visual variants
 *
 * @description
 * Used for status indicators, counts, and labels
 *
 * @example
 * ```typescript
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * ```
 */
export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Alert/Message component variants
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Font weight options
 */
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text size variants
 */
export type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

/**
 * Heading level types
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// ============================================================================
// LAYOUT
// ============================================================================

/**
 * Component padding sizes
 */
export type PaddingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Border radius options
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Shadow depth levels
 */
export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Standard animation duration values (in milliseconds)
 *
 * @description
 * - 150ms: Quick interactions (hover, focus)
 * - 200ms: Standard transitions (dropdowns, tooltips)
 * - 300ms: Complex animations (modals, slides)
 * - 500ms: Page transitions
 *
 * @example
 * ```typescript
 * const duration: AnimationDuration = 200;
 * transition: `all ${duration}ms ease-in-out`;
 * ```
 */
export type AnimationDuration = 150 | 200 | 300 | 500;

/**
 * Animation easing functions
 */
export type AnimationEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: AnimationDuration;
  easing: AnimationEasing;
  delay?: number;
}

// ============================================================================
// INTERACTION STATES
// ============================================================================

/**
 * Component interaction states
 */
export type InteractionState =
  | 'idle'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled';

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Responsive breakpoint names
 *
 * @description
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Responsive value type for dynamic sizing
 *
 * @example
 * ```typescript
 * const padding: ResponsiveValue<SpacingToken> = {
 *   sm: 2,
 *   md: 4,
 *   lg: 6
 * };
 * ```
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ============================================================================
// DIRECTION & ALIGNMENT
// ============================================================================

/**
 * Text direction for RTL/LTR support
 */
export type Direction = 'rtl' | 'ltr';

/**
 * Horizontal alignment
 */
export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Vertical alignment
 */
export type VerticalAlign = 'top' | 'middle' | 'bottom';

/**
 * Flex alignment options
 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Flex justify options
 */
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

// ============================================================================
// ICONS
// ============================================================================

/**
 * Icon size variants
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon placement in components
 */
export type IconPlacement = 'left' | 'right' | 'top' | 'bottom';

// ============================================================================
// COMPONENT BASE PROPS
// ============================================================================

/**
 * Common props shared by all components
 */
export interface BaseComponentProps {
  /** Custom CSS class names */
  className?: string;

  /** Inline styles */
  style?: React.CSSProperties;

  /** Component ID */
  id?: string;

  /** Data attributes for testing */
  'data-testid'?: string;

  /** ARIA label for accessibility */
  'aria-label'?: string;

  /** Text direction (for RTL support) */
  dir?: Direction;
}

/**
 * Props for interactive components
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Disabled state */
  disabled?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;

  /** ARIA attributes */
  'aria-disabled'?: boolean;
  'aria-busy'?: boolean;
}

/**
 * Props for focusable components
 */
export interface FocusableComponentProps extends InteractiveComponentProps {
  /** Auto focus on mount */
  autoFocus?: boolean;

  /** Tab index */
  tabIndex?: number;

  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;

  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
}
