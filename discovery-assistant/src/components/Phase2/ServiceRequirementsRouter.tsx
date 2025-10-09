/**
 * Service Requirements Router
 * Central router for all 59 Phase 2 service requirement forms
 *
 * This component:
 * - Displays purchased services from Phase 1 approval
 * - Routes to the correct requirements form for each service
 * - Tracks completion status across all service categories
 * - Provides navigation between services
 *
 * IMPORTANT: This router uses `purchasedServices` (NOT `selectedServices`)
 * because Phase 2 should only show forms for services the client actually purchased.
 */

import React, { useState, useMemo } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { SERVICE_COMPONENT_MAP, getServiceCategory } from '../../config/serviceComponentMapping';
import { CheckCircle, Circle, AlertCircle, ChevronRight } from 'lucide-react';
import type { SelectedService } from '../../types/proposal';

export const ServiceRequirementsRouter: React.FC = () => {
  const { currentMeeting } = useMeetingStore();

  // DEFENSIVE: Get purchased services with null checks
  const purchasedServices: SelectedService[] = useMemo(() => {
    if (!currentMeeting?.modules?.proposal?.purchasedServices) {
      console.warn('ServiceRequirementsRouter: No purchased services found');
      return [];
    }
    return currentMeeting.modules.proposal.purchasedServices;
  }, [currentMeeting]);

  // Track completed services across all categories
  const completedServices = useMemo((): Set<string> => {
    const completed = new Set<string>();

    if (!currentMeeting?.implementationSpec) {
      return completed;
    }

    const spec = currentMeeting.implementationSpec;

    // Check automations
    spec.automations?.forEach((automation: any) => {
      if (automation.serviceId) {
        completed.add(automation.serviceId);
      }
    });

    // Check AI agent services
    spec.aiAgentServices?.forEach((agent: any) => {
      if (agent.serviceId) {
        completed.add(agent.serviceId);
      }
    });

    // Check integration services
    spec.integrationServices?.forEach((integration: any) => {
      if (integration.serviceId) {
        completed.add(integration.serviceId);
      }
    });

    // Check system implementations
    spec.systemImplementations?.forEach((system: any) => {
      if (system.serviceId) {
        completed.add(system.serviceId);
      }
    });

    // Check additional services
    spec.additionalServices?.forEach((additional: any) => {
      if (additional.serviceId) {
        completed.add(additional.serviceId);
      }
    });

    return completed;
  }, [currentMeeting]);

  // Current service being edited
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const currentService = purchasedServices[currentServiceIndex];

  // Empty state: No purchased services
  if (purchasedServices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            לא נמצאו שירותים שנרכשו
          </h2>
          <p className="text-gray-600 mb-4">
            נראה שהלקוח עדיין לא אישר שירותים. חזור לשלב ההצעה כדי לאשר שירותים.
          </p>
          <div className="text-sm text-gray-500 border-t pt-4">
            <p className="font-medium mb-1">מידע טכני:</p>
            <p>Phase: {currentMeeting?.phase || 'N/A'}</p>
            <p>Status: {currentMeeting?.status || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get component for current service
  const ServiceComponent = currentService ? SERVICE_COMPONENT_MAP[currentService.id] : null;

  // Calculate progress
  const progressPercentage = Math.round(
    (completedServices.size / purchasedServices.length) * 100
  );

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-auto shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            שירותים לפירוט דרישות
          </h3>
          <p className="text-sm text-gray-600">
            {purchasedServices.length} שירותים נרכשו
          </p>
        </div>

        {/* Services List */}
        <div className="p-4 space-y-2">
          {purchasedServices.map((service, index) => {
            const isCompleted = completedServices.has(service.id);
            const isCurrent = index === currentServiceIndex;
            const category = getServiceCategory(service.id);

            return (
              <button
                key={service.id}
                onClick={() => setCurrentServiceIndex(index)}
                className={`
                  w-full text-right p-4 rounded-lg transition-all duration-200
                  ${isCurrent
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-50 text-gray-900 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  {isCompleted ? (
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-green-600'}`} />
                  ) : (
                    <Circle className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                  )}

                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                      {service.nameHe || service.name}
                    </div>
                    <div className={`text-xs mt-1 truncate ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                      {service.name}
                    </div>
                    <div className={`text-xs mt-1 ${isCurrent ? 'text-blue-200' : 'text-gray-400'}`}>
                      {getCategoryLabel(category)}
                    </div>
                  </div>

                  {/* Arrow for current item */}
                  {isCurrent && (
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Section */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">התקדמות כוללת</span>
              <span className="text-gray-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedServices.size} הושלמו</span>
            <span>{purchasedServices.length - completedServices.size} נותרו</span>
          </div>

          {/* Category Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-2">פירוט לפי קטגוריה:</div>
            {getCategoryBreakdown(purchasedServices, completedServices)}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        {ServiceComponent ? (
          <div className="h-full">
            <ServiceComponent />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8" dir="rtl">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                טופס לא זמין עבור השירות הזה
              </h2>
              <p className="text-gray-600 mb-4">
                הקומפוננטה עבור השירות "{currentService?.nameHe || currentService?.name}" עדיין לא נוצרה.
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-left" dir="ltr">
                <p className="font-mono">Service ID: {currentService?.id}</p>
                <p className="font-mono">Category: {getServiceCategory(currentService?.id || '')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Get Hebrew label for category
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'automations': 'אוטומציה',
    'aiAgentServices': 'סוכן AI',
    'integrationServices': 'אינטגרציה',
    'systemImplementations': 'הטמעת מערכת',
    'additionalServices': 'שירות נוסף',
    'unknown': 'לא ידוע',
  };
  return labels[category] || category;
}

/**
 * Get category breakdown statistics
 */
function getCategoryBreakdown(
  purchasedServices: SelectedService[],
  completedServices: Set<string>
): React.ReactNode {
  const categories: Record<string, { total: number; completed: number; label: string }> = {};

  // Count services by category
  purchasedServices.forEach(service => {
    const category = getServiceCategory(service.id);
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        completed: 0,
        label: getCategoryLabel(category),
      };
    }
    categories[category].total++;
    if (completedServices.has(service.id)) {
      categories[category].completed++;
    }
  });

  return (
    <div className="space-y-2">
      {Object.entries(categories).map(([key, data]) => (
        <div key={key} className="flex justify-between items-center text-xs">
          <span className="text-gray-600">{data.label}</span>
          <span className="font-medium text-gray-700">
            {data.completed}/{data.total}
          </span>
        </div>
      ))}
    </div>
  );
}
