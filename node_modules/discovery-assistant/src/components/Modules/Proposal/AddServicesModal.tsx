import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Check, Zap, Bot, Link, Database, Settings, Clock } from 'lucide-react';
import { ServiceItem, ServiceCategoryId } from '../../../types/proposal';
import { SERVICES_DATABASE, SERVICE_CATEGORIES, getCategoryById } from '../../../config/servicesDatabase';
import { Input, Select } from '../../Base';

interface AddServicesModalProps {
  onClose: () => void;
  onAddService: (serviceId: string) => void;
  selectedServiceIds: string[]; // IDs of already selected services
}

interface ModalFilters {
  category: ServiceCategoryId | 'all';
  complexity: 'simple' | 'medium' | 'complex' | 'all';
  priceRange: 'all' | '0-2000' | '2000-5000' | '5000-10000' | '10000+';
  searchQuery: string;
}

// Service icon mapper
const getServiceIcon = (category: string, size = 20) => {
  const iconMap: Record<string, React.ReactElement> = {
    automations: <Zap size={size} className="text-blue-500" />,
    ai_agents: <Bot size={size} className="text-purple-500" />,
    integrations: <Link size={size} className="text-green-500" />,
    system_implementation: <Database size={size} className="text-orange-500" />,
    additional_services: <Settings size={size} className="text-gray-500" />,
  };

  return iconMap[category] || <Settings size={size} />;
};

// Category badge color mapper
const getCategoryBadgeColor = (category: string) => {
  const colorMap: Record<string, string> = {
    automations: 'bg-blue-100 text-blue-700 border-blue-300',
    ai_agents: 'bg-purple-100 text-purple-700 border-purple-300',
    integrations: 'bg-green-100 text-green-700 border-green-300',
    system_implementation: 'bg-orange-100 text-orange-700 border-orange-300',
    additional_services: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return colorMap[category] || 'bg-gray-100 text-gray-700';
};

// Complexity badge color
const getComplexityBadgeColor = (complexity: string) => {
  const colorMap: Record<string, string> = {
    simple: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    complex: 'bg-red-100 text-red-700',
  };

  return colorMap[complexity] || 'bg-gray-100 text-gray-700';
};

// Format price helper
const formatPrice = (price: number) => {
  return `₪${price.toLocaleString('he-IL')}`;
};

export const AddServicesModal: React.FC<AddServicesModalProps> = ({
  onClose,
  onAddService,
  selectedServiceIds
}) => {
  const [filters, setFilters] = useState<ModalFilters>({
    category: 'all',
    complexity: 'all',
    priceRange: 'all',
    searchQuery: ''
  });

  const [locallyAddedIds, setLocallyAddedIds] = useState<Set<string>>(new Set());

  // Filter available services (exclude already selected ones)
  const availableServices = useMemo(() => {
    return SERVICES_DATABASE.filter(service => !selectedServiceIds.includes(service.id));
  }, [selectedServiceIds]);

  // Apply filters
  const filteredServices = useMemo(() => {
    let services = [...availableServices];

    // Apply category filter
    if (filters.category !== 'all') {
      services = services.filter(s => s.category === filters.category);
    }

    // Apply complexity filter
    if (filters.complexity !== 'all') {
      services = services.filter(s => s.complexity === filters.complexity);
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        '0-2000': [0, 2000],
        '2000-5000': [2000, 5000],
        '5000-10000': [5000, 10000],
        '10000+': [10000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange as keyof typeof ranges] || [0, Infinity];
      services = services.filter(s => s.basePrice >= min && s.basePrice < max);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      services = services.filter(s =>
        s.nameHe.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.descriptionHe.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return services;
  }, [availableServices, filters]);

  const updateFilters = (newFilters: Partial<ModalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      complexity: 'all',
      priceRange: 'all',
      searchQuery: ''
    });
  };

  const handleAddService = (serviceId: string) => {
    onAddService(serviceId);
    setLocallyAddedIds(prev => new Set([...prev, serviceId]));
  };

  const hasActiveFilters = useMemo(() => {
    return filters.complexity !== 'all' ||
           filters.priceRange !== 'all' ||
           filters.category !== 'all' ||
           filters.searchQuery !== '';
  }, [filters]);

  const isServiceAdded = (serviceId: string) => {
    return selectedServiceIds.includes(serviceId) || locallyAddedIds.has(serviceId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">הוסף שירותים להצעה</h2>
            <p className="text-sm text-gray-500 mt-1">
              {locallyAddedIds.size > 0 && (
                <span className="text-green-600 font-semibold">
                  {locallyAddedIds.size} שירותים נוספו •{' '}
                </span>
              )}
              {filteredServices.length} שירותים זמינים
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 border-b p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <Input
              placeholder="חפש שירות..."
              value={filters.searchQuery}
              onChange={(val) => updateFilters({ searchQuery: val })}
              icon={<Search size={18} />}
              dir="rtl"
            />

            {/* Category filter */}
            <Select
              value={filters.category}
              onChange={(val) => updateFilters({ category: val as ServiceCategoryId | 'all' })}
              options={[
                { value: 'all', label: 'כל הקטגוריות' },
                ...SERVICE_CATEGORIES.map(cat => ({ value: cat.id, label: cat.nameHe }))
              ]}
              dir="rtl"
            />

            {/* Complexity filter */}
            <Select
              value={filters.complexity}
              onChange={(val) => updateFilters({ complexity: val as any })}
              options={[
                { value: 'all', label: 'כל רמות המורכבות' },
                { value: 'simple', label: 'נמוכה' },
                { value: 'medium', label: 'בינונית' },
                { value: 'complex', label: 'גבוהה' }
              ]}
              dir="rtl"
            />

            {/* Price range */}
            <Select
              value={filters.priceRange}
              onChange={(val) => updateFilters({ priceRange: val as any })}
              options={[
                { value: 'all', label: 'כל טווחי המחירים' },
                { value: '0-2000', label: 'עד ₪2,000' },
                { value: '2000-5000', label: '₪2,000 - ₪5,000' },
                { value: '5000-10000', label: '₪5,000 - ₪10,000' },
                { value: '10000+', label: '₪10,000+' }
              ]}
              dir="rtl"
            />
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">סינונים פעילים:</span>
              {filters.category !== 'all' && (
                <button
                  onClick={() => updateFilters({ category: 'all' })}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200"
                >
                  קטגוריה: {SERVICE_CATEGORIES.find(c => c.id === filters.category)?.nameHe}
                  <X size={12} />
                </button>
              )}
              {filters.complexity !== 'all' && (
                <button
                  onClick={() => updateFilters({ complexity: 'all' })}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200"
                >
                  מורכבות: {filters.complexity === 'simple' ? 'נמוכה' : filters.complexity === 'medium' ? 'בינונית' : 'גבוהה'}
                  <X size={12} />
                </button>
              )}
              {filters.priceRange !== 'all' && (
                <button
                  onClick={() => updateFilters({ priceRange: 'all' })}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200"
                >
                  מחיר: {filters.priceRange}
                  <X size={12} />
                </button>
              )}
              {filters.searchQuery && (
                <button
                  onClick={() => updateFilters({ searchQuery: '' })}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200"
                >
                  חיפוש: "{filters.searchQuery}"
                  <X size={12} />
                </button>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                נקה הכל
              </button>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(service => {
                const categoryInfo = getCategoryById(service.category);
                const isAdded = isServiceAdded(service.id);

                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-lg border-2 shadow-sm transition-all hover:shadow-md ${
                      isAdded ? 'border-green-400 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-shrink-0">
                          {getServiceIcon(service.category, 24)}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadgeColor(service.category)}`}>
                          {categoryInfo?.nameHe}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-2">
                        {service.nameHe}
                      </h3>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.descriptionHe}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          <Clock size={12} />
                          {service.estimatedDays} ימים
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getComplexityBadgeColor(service.complexity)}`}>
                          {service.complexity === 'simple' ? 'פשוט' :
                           service.complexity === 'medium' ? 'בינוני' : 'מורכב'}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="border-t border-gray-200 pt-3 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">מחיר</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(service.basePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Add button */}
                      <button
                        onClick={() => handleAddService(service.id)}
                        disabled={isAdded}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          isAdded
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} />
                            נוסף
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            הוסף לסל
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                לא נמצאו שירותים
              </h3>
              <p className="text-gray-500 mb-4">
                נסה לשנות את הסינונים או החיפוש
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                נקה סינונים
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {locallyAddedIds.size > 0 && (
              <span className="font-semibold text-green-600">
                ✓ {locallyAddedIds.size} שירותים נוספו להצעה
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

