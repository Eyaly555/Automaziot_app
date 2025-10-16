import React, { useState, useEffect, useMemo } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  analyzeFieldUnification,
  generateCollectionStrategy,
  getServiceCompletionStatus,
} from '../../utils/smartFieldUnification';
import { getRequirementsTemplate } from '../../config/serviceRequirementsTemplates';
import {
  getFieldsForService,
  getFieldById,
  getAutoPopulateFields,
} from '../../config/fieldRegistry';
import {
  prePopulateServiceFields,
  getFieldRecommendations,
} from '../../utils/fieldMapper';
import { Card } from '../Common/Card';
import { Button } from '../Base';
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  Database,
  TrendingUp,
  Layers,
} from 'lucide-react';

/**
 * Smart Requirements Collector - ENHANCED VERSION
 *
 * Intelligent system for collecting technical requirements with:
 * - Field registry integration
 * - Auto-population from Phase 1
 * - Duplicate field detection
 * - Smart collection ordering
 * - Field reuse analytics
 */
export const SmartRequirementsCollector: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
  const [currentStep, setCurrentStep] = useState<
    'analysis' | 'collection' | 'review'
  >('analysis');
  const [collectedData, setCollectedData] = useState<
    Record<string, Record<string, any>>
  >({});
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<
    string | null
  >(null);

  const purchasedServices =
    currentMeeting?.modules?.proposal?.purchasedServices || [];
  const purchasedServiceIds = purchasedServices.map((s: any) => s.id);

  // Analyze field unification (existing)
  const fieldAnalysis = useMemo(() => {
    return analyzeFieldUnification(purchasedServiceIds);
  }, [purchasedServiceIds]);

  // NEW: Field registry analysis
  const registryAnalysis = useMemo(() => {
    if (!currentMeeting)
      return {
        totalFields: 0,
        autoPopulated: 0,
        needsManualEntry: 0,
        hasConflicts: 0,
        serviceBreakdown: {},
      };

    let totalFields = 0;
    let autoPopulated = 0;
    let needsManualEntry = 0;
    let hasConflicts = 0;
    const serviceBreakdown: Record<string, any> = {};

    purchasedServiceIds.forEach((serviceId: string) => {
      const recommendations = getFieldRecommendations(
        currentMeeting,
        serviceId
      );
      const registryFields = getFieldsForService(serviceId);

      totalFields += registryFields.length;
      autoPopulated += recommendations.autoPopulated.length;
      needsManualEntry += recommendations.needsManualEntry.length;
      hasConflicts += recommendations.hasConflicts.length;

      serviceBreakdown[serviceId] = {
        total: registryFields.length,
        autoPopulated: recommendations.autoPopulated.length,
        manual: recommendations.needsManualEntry.length,
        conflicts: recommendations.hasConflicts.length,
        fields: registryFields,
      };
    });

    return {
      totalFields,
      autoPopulated,
      needsManualEntry,
      hasConflicts,
      serviceBreakdown,
    };
  }, [purchasedServiceIds, currentMeeting]);

  // Generate collection strategy
  const collectionStrategy = useMemo(() => {
    return generateCollectionStrategy(
      fieldAnalysis.unifiedFields,
      fieldAnalysis.serviceSpecificFields
    );
  }, [fieldAnalysis]);

  // Get completion status
  const completionStatus = useMemo(() => {
    return getServiceCompletionStatus(purchasedServiceIds, collectedData);
  }, [purchasedServiceIds, collectedData]);

  const handleFieldChange = (
    serviceId: string,
    fieldId: string,
    value: any
  ) => {
    setCollectedData((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [fieldId]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep === 'analysis') {
      setCurrentStep('collection');
    } else if (currentStep === 'collection') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'collection') {
      setCurrentStep('analysis');
    } else if (currentStep === 'review') {
      setCurrentStep('collection');
    }
  };

  const handleComplete = () => {
    // Save collected data to implementation spec
    const updatedMeeting = {
      ...currentMeeting,
      implementationSpec: {
        ...currentMeeting?.implementationSpec,
        collectedRequirements: collectedData,
        completionPercentage: completionStatus.completionPercentage,
      },
    };

    // This would be handled by the parent component or store
    console.log('Collected requirements:', collectedData);
    console.log('Completion status:', completionStatus);
  };

  if (purchasedServices.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-gray-50"
        dir="rtl"
      >
        <Card className="max-w-md">
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              לא נמצאו שירותים שנרכשו
            </h2>
            <p className="text-gray-600 mb-6">
              חזור לשלב ההצעה כדי לאשר שירותים לפני איסוף דרישות טכניות.
            </p>
            <Button onClick={() => window.history.back()} variant="primary">
              חזור לשלב ההצעה
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">איסוף דרישות טכניות חכם</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                {completionStatus.completed.length}/{purchasedServices.length}{' '}
                הושלמו
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completionStatus.completionPercentage}%
              </div>
              <div className="text-sm text-gray-600">השלמה</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${completionStatus.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {currentStep === 'analysis' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* ENHANCED Analysis Summary */}
            <Card
              title="ניתוח שדות חכם - מערכת אינטליגנטית"
              subtitle="זיהוי שדות משותפים ומילוי אוטומטי משלב 1"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <Database className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-3xl font-bold text-blue-600">
                    {registryAnalysis.totalFields}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    סך השדות
                  </div>
                  <div className="text-xs text-gray-600 mt-1">מכל השירותים</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-600">
                    {registryAnalysis.autoPopulated}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    מולאו אוטומטית
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round(
                      (registryAnalysis.autoPopulated /
                        Math.max(registryAnalysis.totalFields, 1)) *
                        100
                    )}
                    % חיסכון
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-orange-600">
                    {registryAnalysis.needsManualEntry}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    דרושה הזנה ידנית
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    שדות ייחודיים
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <Layers className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-3xl font-bold text-purple-600">
                    {fieldAnalysis.unifiedFields.length}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    שדות משותפים
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    בין מספר שירותים
                  </div>
                </div>
              </div>

              {/* Efficiency Gains */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    חיסכון בזמן הודות למילוי אוטומטי
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        (registryAnalysis.autoPopulated /
                          Math.max(registryAnalysis.totalFields, 1)) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      שדות שלא תצטרך למלא
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ~{Math.round(registryAnalysis.autoPopulated * 0.5)} דקות
                    </div>
                    <div className="text-sm text-gray-600">
                      חיסכון בזמן משוער
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {collectionStrategy.totalEstimatedTime} דקות
                    </div>
                    <div className="text-sm text-gray-600">זמן משוער כולל</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  💡 <strong>טיפ:</strong> ככל שמילאת יותר מידע בשלב 1, כך יותר
                  שדות ימולאו אוטומטית כאן!
                </div>
              </div>

              {/* Unified Fields */}
              {fieldAnalysis.unifiedFields.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    שדות מאוחדים
                  </h3>
                  <div className="space-y-3">
                    {fieldAnalysis.unifiedFields.map((field) => (
                      <div
                        key={field.fieldId}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">
                            {field.fieldLabel}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {field.usedByServices.length} שירותים
                          </span>
                        </div>
                        <div className="text-sm text-blue-700">
                          משמש ב:{' '}
                          {field.usedByServices
                            .map((id) => {
                              const template = getRequirementsTemplate(id);
                              return template?.serviceNameHe || id;
                            })
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collection Strategy */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  סדר איסוף מומלץ
                </h3>
                <div className="space-y-2">
                  {collectionStrategy.collectionOrder.map(
                    (serviceId, index) => {
                      const template = getRequirementsTemplate(serviceId);
                      const isComplete =
                        completionStatus.completed.includes(serviceId);
                      const timeEstimate =
                        collectionStrategy.estimatedTimePerService[serviceId];

                      return (
                        <div
                          key={serviceId}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isComplete
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isComplete ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium">{index + 1}.</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {template?.serviceNameHe || serviceId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {fieldAnalysis.serviceSpecificFields[serviceId]
                                ?.length || 0}{' '}
                              שדות ייחודיים • {timeEstimate} דקות
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleNext}>
                התחל איסוף נתונים
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'collection' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Service Selection */}
            <Card
              title="בחר שירות לאיסוף נתונים"
              subtitle="השירותים מסודרים לפי סדר מומלץ"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionStrategy.collectionOrder.map((serviceId, index) => {
                  const template = getRequirementsTemplate(serviceId);
                  const isComplete =
                    completionStatus.completed.includes(serviceId);
                  const isCurrent = index === 0; // Start with first service

                  return (
                    <button
                      key={serviceId}
                      onClick={() => setCurrentStep('collection')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isComplete
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : isCurrent
                            ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {isComplete ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle
                            className={`w-6 h-6 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}
                          />
                        )}
                      </div>
                      <div className="font-medium">
                        {template?.serviceNameHe || serviceId}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {fieldAnalysis.serviceSpecificFields[serviceId]
                          ?.length || 0}{' '}
                        שדות
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={handleBack}>
                חזור לניתוח
              </Button>
              <Button variant="primary" onClick={handleNext}>
                עבור לבדיקה סופית
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Review Summary */}
            <Card title="בדיקה סופית" subtitle="סקירת כל הנתונים שנאספו">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <div className="text-xl font-bold text-green-600">
                      {completionStatus.completed.length}
                    </div>
                    <div className="text-sm text-gray-600">שירותים הושלמו</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <div className="text-xl font-bold text-orange-600">
                      {completionStatus.incomplete.length}
                    </div>
                    <div className="text-sm text-gray-600">שירותים ממתינים</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-xl font-bold text-blue-600">
                      {collectionStrategy.totalEstimatedTime}
                    </div>
                    <div className="text-sm text-gray-600">דקות כולל</div>
                  </div>
                </div>

                {/* Services Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    סטטוס שירותים
                  </h3>
                  <div className="space-y-2">
                    {purchasedServices.map((service: any) => {
                      const template = getRequirementsTemplate(service.id);
                      const isComplete = completionStatus.completed.includes(
                        service.id
                      );

                      return (
                        <div
                          key={service.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isComplete
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-orange-50 border border-orange-200'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-orange-600" />
                          )}
                          <span className="font-medium">
                            {service.nameHe || service.name}
                          </span>
                          <span className="text-sm text-gray-600 ml-auto">
                            {template?.estimatedTimeMinutes || 0} דקות
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={handleBack}>
                חזור לאיסוף
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={completionStatus.completionPercentage < 100}
              >
                השלם איסוף דרישות
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
