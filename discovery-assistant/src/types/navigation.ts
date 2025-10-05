/**
 * Navigation Types
 *
 * Type definitions for navigation components, breadcrumbs, and quick actions.
 *
 * @module types/navigation
 */

import { ReactNode } from 'react';
import { MeetingPhase } from './index';
import { ButtonVariant } from './design-system';

// ============================================================================
// BREADCRUMB TYPES
// ============================================================================

/**
 * Single breadcrumb item in navigation trail
 *
 * @example
 * ```typescript
 * const breadcrumb: BreadcrumbItem = {
 *   label: 'לקוחות',
 *   path: '/clients',
 *   icon: <Users className="w-4 h-4" />
 * };
 * ```
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;

  /** Navigation path */
  path: string;

  /** Optional icon */
  icon?: ReactNode;

  /** Is this item clickable? */
  disabled?: boolean;

  /** Metadata for tracking */
  metadata?: Record<string, any>;
}

/**
 * Breadcrumb trail configuration
 */
export interface BreadcrumbConfig {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];

  /** Separator component/string */
  separator?: ReactNode | string;

  /** Maximum items to show before collapse */
  maxItems?: number;

  /** Show home icon as first item? */
  showHome?: boolean;

  /** Custom home path */
  homePath?: string;
}

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

/**
 * Main navigation item for sidebar/menu
 *
 * @example
 * ```typescript
 * const navItem: NavigationItem = {
 *   id: 'overview',
 *   label: 'סקירה כללית',
 *   path: '/module/overview',
 *   icon: <Home className="w-5 h-5" />,
 *   badge: 3,
 *   active: true
 * };
 * ```
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Navigation path */
  path: string;

  /** Icon component */
  icon: ReactNode;

  /** Badge count/text */
  badge?: number | string;

  /** Is this item active? */
  active?: boolean;

  /** Is this item disabled? */
  disabled?: boolean;

  /** Sub-items for nested navigation */
  children?: NavigationItem[];

  /** Click handler (if different from navigation) */
  onClick?: () => void;

  /** Color/variant for styling */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';

  /** Tooltip text */
  tooltip?: string;

  /** Required role/permission */
  requiredRole?: string;
}

/**
 * Navigation group for organizing items
 */
export interface NavigationGroup {
  /** Group identifier */
  id: string;

  /** Group title */
  title?: string;

  /** Items in this group */
  items: NavigationItem[];

  /** Is group collapsible? */
  collapsible?: boolean;

  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  /** Navigation groups */
  groups: NavigationGroup[];

  /** Current active path */
  activePath?: string;

  /** Collapse behavior */
  collapseMode?: 'accordion' | 'independent';

  /** Show group titles? */
  showGroupTitles?: boolean;
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

/**
 * Quick action button configuration
 *
 * @example
 * ```typescript
 * const action: QuickAction = {
 *   id: 'save',
 *   label: 'שמור',
 *   icon: <Save className="w-4 h-4" />,
 *   onClick: handleSave,
 *   variant: 'primary',
 *   loading: isSaving,
 *   shortcut: 'Ctrl+S'
 * };
 * ```
 */
export interface QuickAction {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon component */
  icon: ReactNode;

  /** Click handler */
  onClick: () => void;

  /** Button variant */
  variant?: ButtonVariant;

  /** Is action loading? */
  loading?: boolean;

  /** Is action disabled? */
  disabled?: boolean;

  /** Keyboard shortcut hint */
  shortcut?: string;

  /** Tooltip text */
  tooltip?: string;

  /** Confirmation required? */
  requireConfirm?: boolean;

  /** Confirmation message */
  confirmMessage?: string;

  /** Success message */
  successMessage?: string;

  /** Show in mobile menu? */
  showInMobile?: boolean;
}

/**
 * Quick actions group
 */
export interface QuickActionsGroup {
  /** Primary actions (always visible) */
  primary: QuickAction[];

  /** Secondary actions (overflow menu) */
  secondary?: QuickAction[];

  /** Action alignment */
  align?: 'left' | 'right' | 'center';

  /** Show labels or icons only? */
  showLabels?: boolean;
}

// ============================================================================
// PHASE NAVIGATION
// ============================================================================

/**
 * Phase navigation item
 *
 * @description
 * Special navigation for switching between project phases
 */
export interface PhaseNavigationItem {
  /** Phase identifier */
  phase: MeetingPhase;

  /** Display label */
  label: string;

  /** Icon component */
  icon: ReactNode;

  /** Is this phase available? */
  available: boolean;

  /** Is this phase complete? */
  completed: boolean;

  /** Progress percentage */
  progress: number;

  /** Estimated completion date */
  estimatedCompletion?: Date;

  /** Requirements to unlock */
  requirements?: string[];
}

/**
 * Phase navigation configuration
 */
export interface PhaseNavigationConfig {
  /** Current phase */
  currentPhase: MeetingPhase;

  /** Available phases */
  phases: PhaseNavigationItem[];

  /** Phase change handler */
  onPhaseChange: (phase: MeetingPhase) => void;

  /** Show progress indicators? */
  showProgress?: boolean;

  /** Allow backward navigation? */
  allowBackward?: boolean;
}

// ============================================================================
// MODULE NAVIGATION
// ============================================================================

/**
 * Module navigation item (for Phase 1)
 */
export interface ModuleNavigationItem {
  /** Module identifier */
  id: string;

  /** Display name */
  name: string;

  /** Hebrew name */
  hebrewName: string;

  /** Icon/emoji */
  icon: string;

  /** Navigation path */
  path: string;

  /** Completion percentage */
  progress: number;

  /** Is module required? */
  required?: boolean;

  /** Dependencies (other module IDs) */
  dependencies?: string[];

  /** Estimated time (minutes) */
  estimatedTime?: number;
}

/**
 * Module navigation configuration
 */
export interface ModuleNavigationConfig {
  /** Current module ID */
  currentModule?: string;

  /** Available modules */
  modules: ModuleNavigationItem[];

  /** Module change handler */
  onModuleChange: (moduleId: string) => void;

  /** Show as list or grid? */
  layout?: 'list' | 'grid';

  /** Sort order */
  sortBy?: 'order' | 'progress' | 'name';
}

// ============================================================================
// SIDEBAR
// ============================================================================

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  /** Navigation items */
  navigation: NavigationConfig;

  /** Quick actions */
  quickActions?: QuickActionsGroup;

  /** Is sidebar collapsible? */
  collapsible?: boolean;

  /** Default collapsed state */
  defaultCollapsed?: boolean;

  /** Collapse width (in pixels) */
  collapsedWidth?: number;

  /** Expanded width (in pixels) */
  expandedWidth?: number;

  /** Position */
  position?: 'left' | 'right';

  /** Show user profile? */
  showProfile?: boolean;

  /** Footer content */
  footer?: ReactNode;
}

/**
 * Sidebar state
 */
export interface SidebarState {
  /** Is sidebar collapsed? */
  collapsed: boolean;

  /** Toggle collapse */
  toggle: () => void;

  /** Expand sidebar */
  expand: () => void;

  /** Collapse sidebar */
  collapse: () => void;
}

// ============================================================================
// TABS
// ============================================================================

/**
 * Tab item configuration
 */
export interface TabItem {
  /** Tab identifier */
  id: string;

  /** Tab label */
  label: string;

  /** Icon component */
  icon?: ReactNode;

  /** Badge count */
  badge?: number | string;

  /** Is tab disabled? */
  disabled?: boolean;

  /** Tab content */
  content?: ReactNode;

  /** Has errors? */
  hasError?: boolean;

  /** Is loading? */
  loading?: boolean;
}

/**
 * Tabs configuration
 */
export interface TabsConfig {
  /** Available tabs */
  tabs: TabItem[];

  /** Active tab ID */
  activeTab: string;

  /** Tab change handler */
  onChange: (tabId: string) => void;

  /** Tab variant */
  variant?: 'default' | 'pills' | 'underline';

  /** Alignment */
  align?: 'left' | 'center' | 'right';

  /** Allow keyboard navigation? */
  keyboardNavigation?: boolean;
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page (1-based) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Items per page */
  pageSize: number;

  /** Total number of items */
  totalItems: number;

  /** Page change handler */
  onPageChange: (page: number) => void;

  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;

  /** Available page sizes */
  pageSizeOptions?: number[];

  /** Show page size selector? */
  showPageSize?: boolean;

  /** Show item count? */
  showItemCount?: boolean;

  /** Maximum page buttons to show */
  maxButtons?: number;
}

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page */
  page: number;

  /** Items per page */
  size: number;

  /** Offset for data fetching */
  offset: number;

  /** Has previous page? */
  hasPrev: boolean;

  /** Has next page? */
  hasNext: boolean;

  /** Go to page */
  goToPage: (page: number) => void;

  /** Next page */
  nextPage: () => void;

  /** Previous page */
  prevPage: () => void;

  /** Change page size */
  changePageSize: (size: number) => void;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

/**
 * Search configuration
 */
export interface SearchConfig {
  /** Placeholder text */
  placeholder?: string;

  /** Search handler */
  onSearch: (query: string) => void;

  /** Initial query */
  initialQuery?: string;

  /** Debounce delay (ms) */
  debounce?: number;

  /** Show clear button? */
  showClear?: boolean;

  /** Search suggestions */
  suggestions?: string[];

  /** Show search button? */
  showButton?: boolean;

  /** Loading state */
  loading?: boolean;
}

/**
 * Filter option
 */
export interface FilterOption {
  /** Option value */
  value: string;

  /** Display label */
  label: string;

  /** Option count/badge */
  count?: number;

  /** Is selected? */
  selected?: boolean;

  /** Icon */
  icon?: ReactNode;
}

/**
 * Filter group
 */
export interface FilterGroup {
  /** Group ID */
  id: string;

  /** Group label */
  label: string;

  /** Filter options */
  options: FilterOption[];

  /** Allow multiple selections? */
  multiple?: boolean;

  /** Is group collapsible? */
  collapsible?: boolean;

  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Filter groups */
  groups: FilterGroup[];

  /** Active filters */
  activeFilters: Record<string, string | string[]>;

  /** Filter change handler */
  onChange: (filters: Record<string, string | string[]>) => void;

  /** Clear filters handler */
  onClear?: () => void;

  /** Show active count? */
  showCount?: boolean;
}
