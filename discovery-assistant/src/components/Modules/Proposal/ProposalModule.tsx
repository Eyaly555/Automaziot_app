import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, FileText, DollarSign, Clock, Target,
  Zap, Bot, Link, Database, Settings, ShoppingCart, X,
  Search, BarChart, Sparkles, FileX, ChevronDown, Filter,
  TrendingUp, Calendar, Plus
} from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { generateProposal } from '../../../utils/proposalEngine';
import { ProposedService, SelectedService, ProposalData } from '../../../types/proposal';
import {
  SERVICE_CATEGORIES,
  getCategoryById,
  SERVICES_DATABASE,
  ServiceItem,
  ServiceCategoryId
} from '../../../config/servicesDatabase';
import { getSmartRecommendations } from '../../../utils/smartRecommendationsEngine';

// Type for filters
interface Filters {
  category: ServiceCategoryId | 'all';
  complexity: 'simple' | 'medium' | 'complex' | 'all';
  priceRange: 'all' | '0-10000' | '10000-25000' | '25000+';
  searchQuery: string;
}

// Service icon mapper
const getServiceIcon = (category: string, size = 24) => {
  const iconMap: Record<string, JSX.Element> = {
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

export const ProposalModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule, completeMeeting } = useMeetingStore();

  const [proposedServices, setProposedServices] = useState<ProposedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [proposalSummary, setProposalSummary] = useState<any>(null);
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});

  // UI state
  const [activeTab, setActiveTab] = useState<ServiceCategoryId | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    complexity: 'all',
    priceRange: 'all',
    searchQuery: ''
  });
  const [showComparison, setShowComparison] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Generate proposal when component mounts
  useEffect(() => {
    if (!currentMeeting) {
      console.log('[ProposalModule] No current meeting available');
      return;
    }

    console.log('[ProposalModule] Current meeting:', currentMeeting.meetingId, currentMeeting.clientName);

    // Check if proposal already exists
    const existingProposal = currentMeeting.modules?.proposal;

    if (existingProposal) {
      console.log('[ProposalModule] Loading existing proposal');
      setProposalSummary(existingProposal.summary);
      setProposedServices(existingProposal.proposedServices);
      setSelectedServices(existingProposal.selectedServices);
    } else {
      console.log('[ProposalModule] Generating new proposal...');
      try {
        const { summary, proposedServices: services } = generateProposal(currentMeeting);
        console.log('[ProposalModule] Generated summary:', summary);
        console.log('[ProposalModule] Generated services count:', services.length);

        setProposalSummary(summary);
        setProposedServices(services);

        // Initialize selected services (all selected by default, user can uncheck)
        const initial: SelectedService[] = services.map(service => ({
          ...service,
          selected: service.relevanceScore >= 7,
          customPrice: undefined,
          customDescription: undefined,
          customDescriptionHe: undefined,
          notes: undefined
        }));
        setSelectedServices(initial);
      } catch (error) {
        console.error('[ProposalModule] Error generating proposal:', error);
        setProposalSummary({
          totalServices: 0,
          totalAutomations: 0,
          totalAIAgents: 0,
          totalIntegrations: 0,
          identifiedProcesses: 0,
          potentialMonthlySavings: 0,
          potentialWeeklySavingsHours: 0
        });
        setProposedServices([]);
        setSelectedServices([]);
      }
    }
  }, [currentMeeting]);

  // Get AI recommendations
  const recommendedServices = useMemo(() => {
    if (!currentMeeting) return [];
    try {
      const recommendations = getSmartRecommendations(currentMeeting);
      return recommendations.slice(0, 3); // Top 3 recommendations
    } catch (error) {
      console.error('[ProposalModule] Error getting recommendations:', error);
      return [];
    }
  }, [currentMeeting]);

  // Filter services based on active filters
  const filteredServices = useMemo(() => {
    let services = [...proposedServices];

    // Apply category filter
    if (activeTab !== 'all') {
      services = services.filter(s => s.category === activeTab);
    }

    // Apply complexity filter
    if (filters.complexity !== 'all') {
      services = services.filter(s => s.complexity === filters.complexity);
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(p => parseInt(p.replace('+', '')));
      services = services.filter(s => {
        const price = s.basePrice;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      services = services.filter(s =>
        s.nameHe.toLowerCase().includes(query) ||
        s.descriptionHe.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
      );
    }

    return services;
  }, [proposedServices, activeTab, filters]);

  // Get selected services for cart
  const cartServices = useMemo(() => {
    return selectedServices.filter(s => s.selected);
  }, [selectedServices]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.map(s => s.id === serviceId ? { ...s, selected: !s.selected } : s)
    );
  };

  const updateServicePrice = (serviceId: string, newPrice: number) => {
    setEditingPrices(prev => ({ ...prev, [serviceId]: newPrice }));
    setSelectedServices(prev =>
      prev.map(s => s.id === serviceId ? { ...s, customPrice: newPrice } : s)
    );
  };

  const calculateTotals = () => {
    const selected = selectedServices.filter(s => s.selected);
    const totalPrice = selected.reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0);
    const totalDays = selected.length > 0 ? Math.max(...selected.map(s => s.estimatedDays)) : 0;

    return {
      totalPrice,
      totalDays,
      totalServices: selected.length,
      byCategory: {
        automations: selected.filter(s => s.category === 'automations').length,
        aiAgents: selected.filter(s => s.category === 'ai_agents').length,
        integrations: selected.filter(s => s.category === 'integrations').length,
        systems: selected.filter(s => s.category === 'system_implementation').length,
        additional: selected.filter(s => s.category === 'additional_services').length
      },
      byPrice: {
        automations: selected.filter(s => s.category === 'automations')
          .reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0),
        aiAgents: selected.filter(s => s.category === 'ai_agents')
          .reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0),
        integrations: selected.filter(s => s.category === 'integrations')
          .reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0),
        systems: selected.filter(s => s.category === 'system_implementation')
          .reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0),
        additional: selected.filter(s => s.category === 'additional_services')
          .reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0)
      }
    };
  };

  const handleSaveProposal = () => {
    const totals = calculateTotals();
    const proposalData: ProposalData = {
      meetingId: currentMeeting?.meetingId || '',
      generatedAt: new Date(),
      summary: proposalSummary,
      proposedServices,
      selectedServices,
      totalPrice: totals.totalPrice,
      totalDays: totals.totalDays,
      expectedROIMonths: Math.ceil(totals.totalPrice / (proposalSummary?.potentialMonthlySavings || 1)),
      monthlySavings: proposalSummary?.potentialMonthlySavings || 0
    };

    updateModule('proposal', proposalData);
    completeMeeting();
    navigate('/');
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      complexity: 'all',
      priceRange: 'all',
      searchQuery: ''
    });
    setActiveTab('all');
  };

  const hasActiveFilters = useMemo(() => {
    return filters.complexity !== 'all' ||
           filters.priceRange !== 'all' ||
           filters.searchQuery !== '';
  }, [filters]);

  const totals = calculateTotals();

  if (!proposalSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">מייצר הצעת מחיר...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">הצעת מחיר ופתרונות</h1>
            </div>
            <button
              onClick={handleSaveProposal}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              שמור והמשך
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl pb-32">
        {/* Summary Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">סיכום מה זוהה</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">תהליכים</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {proposalSummary.identifiedProcesses}
              </div>
              <div className="text-sm text-gray-600 mt-1">לאוטומציה</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">סוכני AI</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {proposalSummary.totalAIAgents}
              </div>
              <div className="text-sm text-gray-600 mt-1">הזדמנויות</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">חיסכון</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                ₪{proposalSummary.potentialMonthlySavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">לחודש (פוטנציאלי)</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">זמן</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {proposalSummary.potentialWeeklySavingsHours}
              </div>
              <div className="text-sm text-gray-600 mt-1">שעות/שבוע</div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendedServices.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Sparkles className="text-purple-600 ml-2" size={20} />
              <h3 className="font-semibold text-purple-800">
                שירותים מומלצים עבורך בעדיפות גבוהה
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedServices.map(rec => (
                <div
                  key={rec.id}
                  className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.titleHebrew}</h4>
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                      Quick Win
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      השפעה: {rec.impactScore}/10
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      מאמץ: {rec.effortScore}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="חפש שירות..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Complexity filter */}
            <select
              value={filters.complexity}
              onChange={(e) => updateFilters({ complexity: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">כל רמות המורכבות</option>
              <option value="simple">נמוכה</option>
              <option value="medium">בינונית</option>
              <option value="complex">גבוהה</option>
            </select>

            {/* Price range */}
            <select
              value={filters.priceRange}
              onChange={(e) => updateFilters({ priceRange: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">כל טווחי המחירים</option>
              <option value="0-10000">עד ₪10,000</option>
              <option value="10000-25000">₪10,000 - ₪25,000</option>
              <option value="25000+">₪25,000+</option>
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  נקה סינון
                </button>
              )}
              {cartServices.length >= 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart size={16} />
                  השווה ({cartServices.length})
                </button>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">סינונים פעילים:</span>
              {filters.complexity !== 'all' && (
                <button
                  onClick={() => updateFilters({ complexity: 'all' })}
                  className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200"
                >
                  מורכבות: {filters.complexity}
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
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-x-auto">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              הכל ({proposedServices.length})
            </button>
            {SERVICE_CATEGORIES.map(category => {
              const count = proposedServices.filter(s => s.category === category.id).length;
              if (count === 0) return null;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id as ServiceCategoryId)}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === category.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.nameHe} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {filteredServices.map(service => {
              const isSelected = selectedServices.find(s => s.id === service.id)?.selected || false;
              const categoryInfo = getCategoryById(service.category);

              return (
                <div
                  key={service.id}
                  className={`group bg-white rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-blue-400 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                        {getServiceIcon(service.category, 32)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadgeColor(service.category)}`}>
                        {categoryInfo?.nameHe}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {service.nameHe}
                    </h3>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {service.descriptionHe}
                    </p>

                    {/* Why Relevant */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{service.reasonSuggestedHe}</span>
                      </div>
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        <Clock size={12} />
                        {service.estimatedDays} ימים
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getComplexityBadgeColor(service.complexity)}`}>
                        {service.complexity === 'simple' ? 'פשוט' :
                         service.complexity === 'medium' ? 'בינוני' : 'מורכב'}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        רלוונטיות: {service.relevanceScore}/10
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-gray-200 pt-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">מחיר</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(service.basePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Selection button */}
                    <button
                      onClick={() => toggleServiceSelection(service.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={16} />
                          נבחר
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
          <div className="text-center py-12 bg-white rounded-lg border">
            <FileX size={64} className="mx-auto text-gray-300 mb-4" />
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

        {/* Total Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 mt-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">סיכום ההצעה</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left: Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">פילוח לפי קטגוריות:</h3>
              <div className="space-y-2">
                {totals.byCategory.automations > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">⚡ אוטומציות ({totals.byCategory.automations})</span>
                    <span className="font-semibold">{formatPrice(totals.byPrice.automations)}</span>
                  </div>
                )}
                {totals.byCategory.aiAgents > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">🤖 סוכני AI ({totals.byCategory.aiAgents})</span>
                    <span className="font-semibold">{formatPrice(totals.byPrice.aiAgents)}</span>
                  </div>
                )}
                {totals.byCategory.integrations > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">🔗 אינטגרציות ({totals.byCategory.integrations})</span>
                    <span className="font-semibold">{formatPrice(totals.byPrice.integrations)}</span>
                  </div>
                )}
                {totals.byCategory.systems > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">💼 הטמעות ({totals.byCategory.systems})</span>
                    <span className="font-semibold">{formatPrice(totals.byPrice.systems)}</span>
                  </div>
                )}
                {totals.byCategory.additional > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">💡 שירותים נוספים ({totals.byCategory.additional})</span>
                    <span className="font-semibold">{formatPrice(totals.byPrice.additional)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Totals */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">סה"כ שירותים:</span>
                  <span className="font-semibold text-lg">{totals.totalServices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">זמן יישום משוער:</span>
                  <span className="font-semibold text-lg">{totals.totalDays} ימים</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">זמן יישום בשבועות:</span>
                  <span className="font-semibold text-lg">{Math.ceil(totals.totalDays / 5)} שבועות</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">סה"כ השקעה:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(totals.totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-700">חיסכון חודשי צפוי:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {formatPrice(proposalSummary.potentialMonthlySavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">החזר השקעה תוך:</span>
                  <span className="font-semibold text-orange-600 text-lg">
                    {Math.ceil(totals.totalPrice / (proposalSummary.potentialMonthlySavings || 1))} חודשים
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              חזור
            </button>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              ייצא ל-PDF
            </button>

            <button
              onClick={handleSaveProposal}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              שמור והשלם שלב 1
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Shopping Cart Footer */}
      {cartServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-2xl p-4 z-30">
          <div className="container mx-auto flex items-center justify-between">
            {/* Cart summary */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <ShoppingCart size={28} className="text-blue-600" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartServices.length}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">סך הכל</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(totals.totalPrice)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">זמן משוער</p>
                <p className="text-lg font-semibold text-gray-800">
                  {totals.totalDays} ימים
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">שירותים</p>
                <p className="text-lg font-semibold text-gray-800">
                  {cartServices.length}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {cartServices.length >= 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <BarChart size={20} />
                  השווה שירותים
                </button>
              )}
              <button
                onClick={handleSaveProposal}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold shadow-lg"
              >
                המשך לדרישות
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">השוואת שירותים</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-right p-3 border font-semibold">תכונה</th>
                    {cartServices.map(service => (
                      <th key={service.id} className="p-3 border text-center">
                        <div className="font-semibold">{service.nameHe}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">מחיר</td>
                    {cartServices.map(service => (
                      <td key={service.id} className="p-3 border text-center">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(service.customPrice || service.basePrice)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">משך זמן</td>
                    {cartServices.map(service => (
                      <td key={service.id} className="p-3 border text-center">
                        {service.estimatedDays} ימים
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">מורכבות</td>
                    {cartServices.map(service => (
                      <td key={service.id} className="p-3 border text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${getComplexityBadgeColor(service.complexity)}`}>
                          {service.complexity === 'simple' ? 'פשוט' :
                           service.complexity === 'medium' ? 'בינוני' : 'מורכב'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">רלוונטיות</td>
                    {cartServices.map(service => (
                      <td key={service.id} className="p-3 border text-center">
                        <span className="font-semibold">{service.relevanceScore}/10</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">קטגוריה</td>
                    {cartServices.map(service => {
                      const cat = getCategoryById(service.category);
                      return (
                        <td key={service.id} className="p-3 border text-center">
                          <span className={`px-3 py-1 rounded-full text-sm border ${getCategoryBadgeColor(service.category)}`}>
                            {cat?.nameHe}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 border font-semibold bg-gray-50">למה רלוונטי</td>
                    {cartServices.map(service => (
                      <td key={service.id} className="p-3 border text-sm">
                        {service.reasonSuggestedHe}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end">
              <button
                onClick={() => setShowComparison(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
