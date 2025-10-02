import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Edit2, FileText, DollarSign, Clock, Target } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Card } from '../../Common/Card';
import { generateProposal } from '../../../utils/proposalEngine';
import { ProposedService, SelectedService, ProposalData } from '../../../types/proposal';
import { SERVICE_CATEGORIES, getCategoryById } from '../../../config/servicesDatabase';

export const ProposalModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule, completeMeeting } = useMeetingStore();

  const [proposedServices, setProposedServices] = useState<ProposedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [proposalSummary, setProposalSummary] = useState<any>(null);
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});

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
      // Load existing proposal data
      setProposalSummary(existingProposal.summary);
      setProposedServices(existingProposal.proposedServices);
      setSelectedServices(existingProposal.selectedServices);
    } else {
      console.log('[ProposalModule] Generating new proposal...');
      try {
        // Generate new proposal
        const { summary, proposedServices: services } = generateProposal(currentMeeting);
        console.log('[ProposalModule] Generated summary:', summary);
        console.log('[ProposalModule] Generated services count:', services.length);

        setProposalSummary(summary);
        setProposedServices(services);

        // Initialize selected services (all selected by default, user can uncheck)
        const initial: SelectedService[] = services.map(service => ({
          ...service,
          selected: service.relevanceScore >= 7, // Auto-select high relevance items
          customPrice: undefined,
          customDescription: undefined,
          customDescriptionHe: undefined,
          notes: undefined
        }));
        setSelectedServices(initial);
      } catch (error) {
        console.error('[ProposalModule] Error generating proposal:', error);
        // Set default empty proposal to unblock UI
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
    const totalDays = Math.max(...selected.map(s => s.estimatedDays), 0);

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

    // Save to meeting modules & complete Phase 1
    updateModule('proposal', proposalData);
    completeMeeting();
    navigate('/');
  };

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">💰 הצעת מחיר ופתרונות</h1>
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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Summary Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 סיכום מה זוהה</h2>
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
                <span className="font-semibold">🤖 סוכני AI</span>
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

        {/* Services by Category */}
        {SERVICE_CATEGORIES.map(category => {
          const categoryServices = selectedServices.filter(s => s.category === category.id);
          if (categoryServices.length === 0) return null;

          const categoryInfo = getCategoryById(category.id);
          const isPrimary = category.priority === 'primary';

          return (
            <Card
              key={category.id}
              title={`${category.icon} ${category.nameHe}`}
              subtitle={category.descriptionHe}
            >
              <div className="space-y-3">
                {categoryServices.map(service => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 transition-all ${
                      service.selected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={service.selected}
                          onChange={() => toggleServiceSelection(service.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      {/* Service Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {service.nameHe}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.descriptionHe}
                            </p>

                            {/* Why Relevant */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-600 font-semibold text-sm">💡 למה רלוונטי:</span>
                                <span className="text-sm text-gray-700">{service.reasonSuggestedHe}</span>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {service.estimatedDays} ימים
                              </span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                service.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                                service.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {service.complexity === 'simple' ? 'פשוט' :
                                 service.complexity === 'medium' ? 'בינוני' : 'מורכב'}
                              </span>
                              <span>•</span>
                              <span className="text-xs text-gray-400">
                                רלוונטיות: {service.relevanceScore}/10
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-left mr-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editingPrices[service.id] ?? service.customPrice ?? service.basePrice}
                                onChange={(e) => updateServicePrice(service.id, parseInt(e.target.value) || 0)}
                                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-left font-semibold text-lg focus:ring-2 focus:ring-blue-500"
                                disabled={!service.selected}
                              />
                              <span className="text-gray-600">₪</span>
                              <button
                                className="p-1 hover:bg-gray-100 rounded"
                                title="ערוך מחיר"
                              >
                                <Edit2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            {service.customPrice && service.customPrice !== service.basePrice && (
                              <div className="text-xs text-gray-500 mt-1">
                                מחיר מקורי: ₪{service.basePrice}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}

        {/* Total Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 mt-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">💰 סיכום ההצעה</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left: Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">פילוח לפי קטגוריות:</h3>
              <div className="space-y-2">
                {totals.byCategory.automations > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">⚡ אוטומציות ({totals.byCategory.automations})</span>
                    <span className="font-semibold">₪{totals.byPrice.automations.toLocaleString()}</span>
                  </div>
                )}
                {totals.byCategory.aiAgents > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">🤖 סוכני AI ({totals.byCategory.aiAgents})</span>
                    <span className="font-semibold">₪{totals.byPrice.aiAgents.toLocaleString()}</span>
                  </div>
                )}
                {totals.byCategory.integrations > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">🔗 אינטגרציות ({totals.byCategory.integrations})</span>
                    <span className="font-semibold">₪{totals.byPrice.integrations.toLocaleString()}</span>
                  </div>
                )}
                {totals.byCategory.systems > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">💼 הטמעות ({totals.byCategory.systems})</span>
                    <span className="font-semibold">₪{totals.byPrice.systems.toLocaleString()}</span>
                  </div>
                )}
                {totals.byCategory.additional > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">💡 שירותים נוספים ({totals.byCategory.additional})</span>
                    <span className="font-semibold">₪{totals.byPrice.additional.toLocaleString()}</span>
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
                      ₪{totals.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-700">חיסכון חודשי צפוי:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    ₪{proposalSummary.potentialMonthlySavings.toLocaleString()}
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
    </div>
  );
};
