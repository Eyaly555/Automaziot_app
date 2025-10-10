import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, FileText, DollarSign, Clock, Target,
  Zap, Bot, Link, Database, Settings, ShoppingCart, X,
  Search, BarChart, Sparkles, FileX,
  Plus, Send, Pencil, Download
} from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { Input, Select } from '../../Base';
import { generateProposal } from '../../../utils/proposalEngine';
import { ProposedService, SelectedService, ProposalData } from '../../../types/proposal';
import {
  SERVICE_CATEGORIES,
  getCategoryById,
  ServiceCategoryId
} from '../../../config/servicesDatabase';
import { getSmartRecommendations } from '../../../utils/smartRecommendationsEngine';
import { generateProposalPDF } from '../../../utils/exportProposalPDF';
import { downloadProposalPDF } from '../../../utils/downloadProposalPDF';
import { sendProposalViaWhatsApp } from '../../../services/whatsappService';
import { openGmailCompose } from '../../../services/emailService';
import { ContactCompletionModal, ClientContact } from './ContactCompletionModal';
import { markProposalAsSent } from '../../../services/discoveryStatusService';
import { aiProposalGenerator } from '../../../services/aiProposalGenerator';
import { AiProposalDoc } from '../../../schemas/aiProposal.schema';

// Type for filters
interface Filters {
  category: ServiceCategoryId | 'all';
  complexity: 'simple' | 'medium' | 'complex' | 'all';
  priceRange: 'all' | '0-10000' | '10000-25000' | '25000+';
  searchQuery: string;
}

// Service icon mapper
const getServiceIcon = (category: string, size = 24) => {
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

export const ProposalModule: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule, updatePhaseStatus } = useMeetingStore();

  const [proposedServices, setProposedServices] = useState<ProposedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [proposalSummary, setProposalSummary] = useState<any>(null);
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: number }>({});

  // NEW: Additional editing state
  const [editingDurations, setEditingDurations] = useState<{ [key: string]: number }>({});

  // Track which fields are actively being edited
  const [activeEditPrice, setActiveEditPrice] = useState<string | null>(null);
  const [activeEditDuration, setActiveEditDuration] = useState<string | null>(null);

  // NEW: Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [clientContact, setClientContact] = useState<ClientContact>({
    name: '',
    company: '',
    email: '',
    phone: '',
  });

  // NEW: Loading state for PDF generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // NEW: PM note for AI proposal generation
  const [pmNote, setPmNote] = useState('');

  // NEW: AI proposal generation state
  const [isGeneratingAIProposal, setIsGeneratingAIProposal] = useState(false);
  const [aiProposal, setAiProposal] = useState<AiProposalDoc | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<ServiceCategoryId | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    complexity: 'all',
    priceRange: 'all',
    searchQuery: ''
  });
  const [showComparison, setShowComparison] = useState(false);

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

  // NEW: Update service duration
  const updateServiceDuration = (serviceId: string, newDuration: number) => {
    setEditingDurations(prev => ({ ...prev, [serviceId]: newDuration }));
    setSelectedServices(prev =>
      prev.map(s => s.id === serviceId ? { ...s, customDuration: newDuration } : s)
    );
  };

  // NEW: Get client contact info from meeting data or Zoho
  const getClientContact = (): ClientContact => {
    // Try Zoho integration first
    const zohoContact = currentMeeting?.zohoIntegration?.contactInfo;
    if (zohoContact?.phone && zohoContact?.email) {
      return {
        name: currentMeeting?.clientName || '',
        company: currentMeeting?.modules?.overview?.companyName || '',
        email: zohoContact.email,
        phone: zohoContact.phone,
      };
    }

    // Try overview module
    const overview = currentMeeting?.modules?.overview;
    return {
      name: currentMeeting?.clientName || '',
      company: overview?.companyName || '',
      email: overview?.contactEmail || '',
      phone: overview?.contactPhone || '',
    };
  };

  // NEW: Handle send proposal button click
  const handleSendProposal = async () => {
    const contact = getClientContact();

    // Check if contact info is complete
    if (!contact.phone || !contact.email || !contact.name) {
      // Show modal to complete contact info
      setClientContact(contact);
      setShowContactModal(true);
      return;
    }

    // Contact info is complete, proceed with sending
    await sendProposalToClient(contact);
  };

  // NEW: Send proposal to client (WhatsApp + Email)
  const sendProposalToClient = async (contact: ClientContact) => {
    try {
      setIsGeneratingPDF(true);

      // Generate PDF
      const pdfBlob = await generateProposalPDF({
        clientName: contact.name,
        clientCompany: contact.company,
        services: selectedServices.filter(s => s.selected),
        proposalData: {
          meetingId: currentMeeting?.meetingId || '',
          generatedAt: new Date(),
          summary: proposalSummary,
          proposedServices,
          selectedServices,
          totalPrice: calculateTotals().totalPrice,
          totalDays: calculateTotals().totalDays,
          expectedROIMonths: Math.ceil(calculateTotals().totalPrice / (proposalSummary?.potentialMonthlySavings || 1)),
          monthlySavings: proposalSummary?.potentialMonthlySavings || 0,
        },
        aiProposal: aiProposal || undefined,
      });

      setIsGeneratingPDF(false);

      // ✅ NEW: Mark proposal as sent
      if (currentMeeting) {
        await markProposalAsSent(currentMeeting.meetingId, updateModule as (moduleName: keyof Modules, data: any) => void);
        console.log('[ProposalModule] Proposal marked as sent (via Send button)');
      }

      // Close modal if open
      setShowContactModal(false);

      // Send via WhatsApp (only include ROI if data exists)
      const includeROI = (proposalSummary?.potentialMonthlySavings || 0) > 0;
      sendProposalViaWhatsApp(contact.phone, contact.name, pdfBlob, includeROI);

      // Small delay to avoid blocking
      setTimeout(() => {
        // Open Gmail compose
        openGmailCompose({
          clientEmail: contact.email,
          clientName: contact.name,
          clientCompany: contact.company,
          proposalData: {
            meetingId: currentMeeting?.meetingId || '',
            generatedAt: new Date(),
            summary: proposalSummary,
            proposedServices,
            selectedServices,
            totalPrice: calculateTotals().totalPrice,
            totalDays: calculateTotals().totalDays,
            expectedROIMonths: Math.ceil(calculateTotals().totalPrice / (proposalSummary?.potentialMonthlySavings || 1)),
            monthlySavings: proposalSummary?.potentialMonthlySavings || 0,
          },
          pdfBlob,
        });
      }, 1000);

      // Show success message
      alert('✅ הצעת המחיר נשלחה בהצלחה!\n\n📱 WhatsApp נפתח\n📧 Gmail נפתח\n📄 קובץ PDF ירד למחשב');

    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('❌ שגיאה בשליחת ההצעה. אנא נסה שוב.');
      setIsGeneratingPDF(false);
    }
  };

  // NEW: Download PDF directly (no WhatsApp/Email)
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      const contact = getClientContact();

      // Download PDF directly
      await downloadProposalPDF({
        clientName: contact.name || 'לקוח',
        clientCompany: contact.company,
        services: selectedServices.filter(s => s.selected),
        proposalData: {
          meetingId: currentMeeting?.meetingId || '',
          generatedAt: new Date(),
          summary: proposalSummary,
          proposedServices,
          selectedServices,
          totalPrice: calculateTotals().totalPrice,
          totalDays: calculateTotals().totalDays,
          expectedROIMonths: Math.ceil(calculateTotals().totalPrice / (proposalSummary?.potentialMonthlySavings || 1)),
          monthlySavings: proposalSummary?.potentialMonthlySavings || 0,
        },
        aiProposal: aiProposal || undefined,
      });

      setIsGeneratingPDF(false);

      // ✅ NEW: Mark proposal as sent
      if (currentMeeting) {
        await markProposalAsSent(currentMeeting.meetingId, updateModule as (moduleName: keyof Modules, data: any) => void);
        console.log('[ProposalModule] Proposal marked as sent (via Download button)');
      }

      alert('✅ קובץ PDF הורד בהצלחה!');

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('❌ שגיאה בהורדת הקובץ. אנא נסה שוב.');
      setIsGeneratingPDF(false);
    }
  };

  const calculateTotals = () => {
    const selected = selectedServices.filter(s => s.selected);
    const totalPrice = selected.reduce((sum, s) => sum + (s.customPrice || s.basePrice), 0);
    // NEW: Use customDuration if available, otherwise use estimatedDays
    const totalDays = selected.length > 0 ? Math.max(...selected.map(s => s.customDuration || s.estimatedDays)) : 0;

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
      monthlySavings: proposalSummary?.potentialMonthlySavings || 0,
      pmNote: pmNote || undefined,
      aiProposal: aiProposal ? {
        createdAt: new Date().toISOString(),
        model: 'gpt-5',
        status: 'success',
        sections: aiProposal
      } : undefined
    };

    updateModule('proposal' as keyof Modules, proposalData);
    updatePhaseStatus('awaiting_client_decision');
    navigate('/approval');
  };

  // NEW: Generate AI proposal
  const handleGenerateAIProposal = async () => {
    if (cartServices.length === 0) {
      alert('❌ בחר לפחות שירות אחד כדי ליצור הצעת מחיר');
      return;
    }

    try {
      setIsGeneratingAIProposal(true);

      const result = await aiProposalGenerator.generateProposal({
        meeting: currentMeeting!,
        selectedServices: cartServices,
        pmNote: pmNote || undefined
      });

      if (result.success && result.sections) {
        setAiProposal(result.sections);

        // ✅ NEW: Save AI proposal to meeting data and Supabase automatically
        const proposalData: ProposalData = {
          meetingId: currentMeeting?.meetingId || '',
          generatedAt: new Date(),
          summary: proposalSummary,
          proposedServices,
          selectedServices: cartServices, // Use cartServices as selectedServices
          totalPrice: calculateTotals().totalPrice,
          totalDays: calculateTotals().totalDays,
          expectedROIMonths: Math.ceil(calculateTotals().totalPrice / (proposalSummary?.potentialMonthlySavings || 1)),
          monthlySavings: proposalSummary?.potentialMonthlySavings || 0,
          pmNote: pmNote || undefined,
          aiProposal: {
            createdAt: new Date().toISOString(),
            model: 'gpt-5',
            status: 'success',
            sections: result.sections,
            rawMarkdown: result.rawMarkdown,
            usage: result.usage,
            instructions: pmNote || undefined
          }
        };

        // Save to meeting data (this will auto-save to Supabase)
        updateModule('proposal' as keyof Modules, proposalData);
        console.log('[ProposalModule] AI proposal saved to meeting and Supabase automatically');

        setShowPreviewModal(true);
      } else {
        alert(`❌ שגיאה ביצירת הצעת המחיר: ${result.error}`);
      }
    } catch (error) {
      console.error('AI proposal generation error:', error);
      alert('❌ שגיאה ביצירת הצעת המחיר. אנא נסה שוב.');
    } finally {
      setIsGeneratingAIProposal(false);
    }
  };

  // NEW: Regenerate AI proposal with additional instructions
  const handleRegenerateAIProposal = async () => {
    if (!additionalInstructions.trim()) {
      alert('❌ הכנס הוראות נוספות לשיפור ההצעה');
      return;
    }

    if (cartServices.length === 0) {
      alert('❌ בחר לפחות שירות אחד כדי ליצור הצעת מחיר');
      return;
    }

    try {
      setIsRegenerating(true);

      const result = await aiProposalGenerator.regenerateProposal({
        meeting: currentMeeting!,
        selectedServices: cartServices,
        pmNote: pmNote || undefined
      }, additionalInstructions);

      if (result.success && result.sections) {
        setAiProposal(result.sections);
        setAdditionalInstructions(''); // Clear instructions after successful regeneration
      } else {
        alert(`❌ שגיאה בשיפור ההצעה: ${result.error}`);
      }
    } catch (error) {
      console.error('AI proposal regeneration error:', error);
      alert('❌ שגיאה בשיפור ההצעה. אנא נסה שוב.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // NEW: Open saved AI proposal for editing
  const handleOpenSavedProposal = () => {
    // Check if there's a saved AI proposal
    const savedProposal = currentMeeting?.modules?.proposal?.aiProposal;

    if (savedProposal?.sections) {
      // Load saved proposal into state and open modal
      setAiProposal(savedProposal.sections);
      setShowPreviewModal(true);
      console.log('[ProposalModule] Opened saved AI proposal for editing');
    } else {
      // No saved proposal - offer to create new one
      alert('❌ אין הצעה שמורה. לחץ על "ייצר הצעת מחיר" כדי ליצור הצעה חדשה.');
    }
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
                onClick={() => navigate('/dashboard')}
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
        {/* PM Note Section */}
        <div className="bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200">
          <h2 className="text-lg font-semibold mb-3 text-yellow-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            הערת מנהל פרויקט
          </h2>
          <p className="text-sm text-yellow-700 mb-3">
            הערה זו תיכלל ביצירת הצעת המחיר AI ותעזור להתאים את ההצעה לצרכים הספציפיים של הלקוח
          </p>
          <textarea
            value={pmNote}
            onChange={(e) => setPmNote(e.target.value)}
            placeholder="הוסף הערות מיוחדות, דגשים חשובים, או הוראות ספציפיות ליצירת ההצעה..."
            className="w-full h-24 p-3 border border-yellow-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            dir="rtl"
          />
        </div>

        {/* Summary Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">סיכום מה זוהה</h2>
          <div className={`grid gap-4 ${proposalSummary.potentialMonthlySavings > 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
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

            {/* Only show ROI cards if data exists */}
            {proposalSummary.potentialMonthlySavings > 0 && (
              <>
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
              </>
            )}
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
            <Input
              placeholder="חפש שירות..."
              value={filters.searchQuery}
              onChange={(val) => updateFilters({ searchQuery: val })}
              icon={<Search size={18} />}
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
                { value: '0-10000', label: 'עד ₪10,000' },
                { value: '10000-25000', label: '₪10,000 - ₪25,000' },
                { value: '25000+', label: '₪25,000+' }
              ]}
              dir="rtl"
            />

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
                      {/* Editable Duration */}
                      <div className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded group">
                        <Clock size={12} />
                        {activeEditDuration === service.id ? (
                          <input
                            type="number"
                            min="1"
                            value={editingDurations[service.id] !== undefined ? editingDurations[service.id] : (selectedServices.find(s => s.id === service.id)?.customDuration || service.estimatedDays)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setEditingDurations(prev => ({ ...prev, [service.id]: value }));
                            }}
                            onBlur={() => {
                              const value = editingDurations[service.id];
                              if (value && value > 0) {
                                updateServiceDuration(service.id, value);
                              }
                              setActiveEditDuration(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = editingDurations[service.id];
                                if (value && value > 0) {
                                  updateServiceDuration(service.id, value);
                                }
                                setActiveEditDuration(null);
                              } else if (e.key === 'Escape') {
                                setActiveEditDuration(null);
                              }
                            }}
                            autoFocus
                            className="w-12 text-center bg-white border border-gray-300 rounded px-1"
                          />
                        ) : (
                          <span className="flex items-center gap-1">
                            {selectedServices.find(s => s.id === service.id)?.customDuration || service.estimatedDays} ימים
                            <button
                              onClick={() => {
                                setActiveEditDuration(service.id);
                                setEditingDurations(prev => ({
                                  ...prev,
                                  [service.id]: selectedServices.find(s => s.id === service.id)?.customDuration || service.estimatedDays
                                }));
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil size={10} className="text-gray-500 hover:text-blue-600" />
                            </button>
                          </span>
                        )}
                      </div>
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
                      <div className="flex justify-between items-center group">
                        <span className="text-sm text-gray-500">מחיר</span>
                        {activeEditPrice === service.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">₪</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={editingPrices[service.id] !== undefined ? editingPrices[service.id] : (selectedServices.find(s => s.id === service.id)?.customPrice || service.basePrice)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setEditingPrices(prev => ({ ...prev, [service.id]: value }));
                              }}
                              onBlur={() => {
                                const value = editingPrices[service.id];
                                if (value !== undefined && value >= 0) {
                                  updateServicePrice(service.id, value);
                                }
                                setActiveEditPrice(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = editingPrices[service.id];
                                  if (value !== undefined && value >= 0) {
                                    updateServicePrice(service.id, value);
                                  }
                                  setActiveEditPrice(null);
                                } else if (e.key === 'Escape') {
                                  setActiveEditPrice(null);
                                }
                              }}
                              autoFocus
                              className="w-24 text-right text-xl font-bold text-blue-600 bg-white border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(selectedServices.find(s => s.id === service.id)?.customPrice || service.basePrice)}
                            </span>
                            <button
                              onClick={() => {
                                setActiveEditPrice(service.id);
                                setEditingPrices(prev => ({
                                  ...prev,
                                  [service.id]: selectedServices.find(s => s.id === service.id)?.customPrice || service.basePrice
                                }));
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil size={14} className="text-gray-500 hover:text-blue-600" />
                            </button>
                          </div>
                        )}
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

                {/* Only show ROI data if it exists */}
                {proposalSummary.potentialMonthlySavings > 0 && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              חזור
            </button>

            {/* NEW: Generate AI Proposal Button */}
            <button
              onClick={handleGenerateAIProposal}
              disabled={isGeneratingAIProposal || cartServices.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 font-semibold"
            >
              {isGeneratingAIProposal ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  יוצר הצעת מחיר...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  ייצר הצעת מחיר
                </>
              )}
            </button>

            {/* NEW: Open Saved Proposal Button */}
            <button
              onClick={handleOpenSavedProposal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {currentMeeting?.modules?.proposal?.aiProposal?.sections ? 'ערוך הצעה שמורה' : 'היכנס להצעה שמורה'}
            </button>

            <button
              onClick={handleSaveProposal}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              שמור והמשך
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
                        {service.customDuration || service.estimatedDays} ימים
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

      {/* NEW: Contact Completion Modal */}
      {showContactModal && (
        <ContactCompletionModal
          clientContact={clientContact}
          onUpdate={setClientContact}
          onSend={() => sendProposalToClient(clientContact)}
          onCancel={() => setShowContactModal(false)}
        />
      )}

      {/* NEW: AI Proposal Preview Modal */}
      {showPreviewModal && aiProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-purple-600" />
                הצעת מחיר AI
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Executive Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">סיכום מנהלים</h3>
                <div className="prose prose-lg max-w-none" dir="rtl">
                  {aiProposal.executiveSummary.map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">פירוט השירותים</h3>
                <div className="space-y-6">
                  {aiProposal.services.map((service, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold mb-3 text-gray-900">
                        {service.titleHe}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">למה זה רלוונטי:</h5>
                          <p className="text-gray-600">{service.whyRelevantHe}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">מה כלול:</h5>
                          <p className="text-gray-600">{service.whatIncludedHe}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">סיכום פיננסי</h3>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-700 mb-2">השקעה כוללת:</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ₪{aiProposal.financialSummary.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2">זמן יישום משוער:</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {aiProposal.financialSummary.totalDays} ימים
                      </p>
                    </div>
                  </div>
                  {aiProposal.financialSummary.monthlySavings && (
                    <div className="mt-4 pt-4 border-t border-blue-300">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-700 mb-2">חיסכון חודשי צפוי:</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₪{aiProposal.financialSummary.monthlySavings.toLocaleString()}
                          </p>
                        </div>
                        {aiProposal.financialSummary.expectedROIMonths && (
                          <div>
                            <p className="text-gray-700 mb-2">החזר השקעה תוך:</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {aiProposal.financialSummary.expectedROIMonths} חודשים
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">תנאים</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <ul className="space-y-2">
                    {aiProposal.terms.map((term, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-gray-700">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">הצעדים הבאים</h3>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <ol className="space-y-2">
                    {aiProposal.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-6">
              {/* Additional Instructions Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600" />
                  שפר את ההצעה
                </h4>
                <div className="flex gap-3">
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="הוסף הוראות נוספות לשיפור ההצעה... (למשל: 'הדגש יותר את החיסכון בזמן', 'הוסף פרטים טכניים נוספים', 'שנה את הטון ליותר פורמלי')"
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    rows={2}
                    dir="rtl"
                  />
                  <button
                    onClick={handleRegenerateAIProposal}
                    disabled={isRegenerating || !additionalInstructions.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
                  >
                    {isRegenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        משפר...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        שפר
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    הצעה זו נוצרה באמצעות בינה מלאכותית ומותאמת ללקוח
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    סגור
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        מוריד...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        הורד PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSendProposal}
                    disabled={isGeneratingPDF}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        שולח...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        שלח ללקוח
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
