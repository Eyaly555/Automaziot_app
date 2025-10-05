import React from 'react';
import { Filter, X } from 'lucide-react';
import { Badge } from '../Base/Badge';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface ActiveFilters {
  sprint?: string;
  system?: string;
  priority?: string;
  status?: string;
}

export interface TaskQuickFiltersProps {
  filters: {
    sprints: FilterOption[];
    systems: FilterOption[];
    priorities: FilterOption[];
    statuses: FilterOption[];
  };
  activeFilters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

/**
 * TaskQuickFilters Component
 *
 * Advanced task filtering component for Phase 3 developer dashboard.
 *
 * Features:
 * - Filter groups: Sprint, System, Priority, Status
 * - Active filter count badge
 * - Clear all filters button
 * - Clickable filter chips with counts
 * - Toggle selection per filter
 * - Integration with Badge base component
 *
 * @param filters - Available filter options for each category
 * @param activeFilters - Currently active filter selections
 * @param onChange - Callback when filters change
 */
export const TaskQuickFilters: React.FC<TaskQuickFiltersProps> = ({
  filters,
  activeFilters,
  onChange
}) => {
  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;
  const hasActiveFilters = activeFilterCount > 0;

  // Clear all filters
  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <Badge variant="primary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-3">
        <FilterGroup
          label="Sprint"
          options={filters.sprints}
          value={activeFilters.sprint}
          onChange={(value) => onChange({ ...activeFilters, sprint: value })}
        />

        <FilterGroup
          label="System"
          options={filters.systems}
          value={activeFilters.system}
          onChange={(value) => onChange({ ...activeFilters, system: value })}
        />

        <FilterGroup
          label="Priority"
          options={filters.priorities}
          value={activeFilters.priority}
          onChange={(value) => onChange({ ...activeFilters, priority: value })}
        />

        <FilterGroup
          label="Status"
          options={filters.statuses}
          value={activeFilters.status}
          onChange={(value) => onChange({ ...activeFilters, status: value })}
        />
      </div>
    </div>
  );
};

/**
 * FilterGroup Sub-Component
 *
 * Displays a single filter category with selectable options.
 */
interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value?: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  value,
  onChange
}) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Label */}
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        {label}
      </label>

      {/* Options */}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = value === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onChange(isActive ? undefined : option.id)}
              className={`
                px-2.5 py-1 text-xs rounded-full border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                ${isActive
                  ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                }
              `}
              aria-label={`${isActive ? 'Remove' : 'Apply'} ${label} filter: ${option.label}`}
              aria-pressed={isActive}
            >
              {option.label}
              {option.count !== undefined && (
                <span className={`ml-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  ({option.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
