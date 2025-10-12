import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import {
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Card } from '../Common/Card';
import { Input } from '../Base';
import { formatCurrency } from '../../utils/formatters';
import type { ProposalData, SelectedService } from '../../types/proposal';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({
  title,
  children,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
};

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl" dir="rtl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">בקשת שינויים</h2>
        </div>

        <p className="text-gray-600 mb-4">
          אנא פרט מה תרצה לשנות או להוסיף להצעה. המשוב שלך יעזור לנו לשפר את ההצעה
          ולהתאים אותה בצורה מיטבית לצרכים שלך.
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="מה תרצה לשנות בהצעה? (לדוגמה: להוסיף שירות נוסף, לשנות מחיר, לקבל הסבר מפורט יותר...)"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            שלח משוב
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClientApprovalView: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentMeeting,
    updateModule,
    updatePhaseStatus
  } = useMeetingStore();

  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Get proposal data
  const proposalData = currentMeeting?.modules?.proposal as ProposalData | undefined;
  const selectedServices = proposalData?.selectedServices || [];
  const roiData = currentMeeting?.modules?.roi;

  // Track which services client actually purchased
  const [purchasedServiceIds, setPurchasedServiceIds] = useState<Set<string>>(
    new Set(proposalData?.purchasedServices?.map(s => s.id) || selectedServices.map(s => s.id))
  );

  // Initialize client name from meeting
  useEffect(() => {
    if (currentMeeting?.clientName) {
      setClientName(currentMeeting.clientName);
    }
  }, [currentMeeting?.clientName]);

  // Redirect if no proposal exists
  useEffect(() => {
    if (!currentMeeting) {
      navigate('/dashboard');
      return;
    }
    if (!proposalData || selectedServices.length === 0) {
      navigate('/module/proposal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMeeting, proposalData, navigate]);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setValidationError('');
  };

  const getSignatureData = (): string | null => {
    if (signaturePadRef.current?.isEmpty()) {
      return null;
    }
    return signaturePadRef.current?.toDataURL() || null;
  };

  const toggleServicePurchase = (serviceId: string) => {
    setPurchasedServiceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleApprove = async () => {
    // Validate at least one service is purchased
    if (purchasedServiceIds.size === 0) {
      setValidationError('נא לבחור לפחות שירות אחד שהלקוח רכש');
      return;
    }

    // Validate signature
    const signatureData = getSignatureData();
    if (!signatureData) {
      setValidationError('נא לחתום על ההצעה לפני האישור');
      return;
    }

    if (!clientName.trim()) {
      setValidationError('נא למלא את שם החותם');
      return;
    }

    setValidationError('');

    // Get only the purchased services
    const purchasedServices = selectedServices.filter(s => purchasedServiceIds.has(s.id));

    // Save signature, approval data, and purchased services to meeting
    const updatedProposal: ProposalData = {
      ...proposalData!,
      purchasedServices,
      approvalSignature: signatureData,
      approvedBy: clientName.trim(),
      approvedAt: new Date().toISOString(),
      approvalNotes: notes.trim() || undefined
    };

    updateModule('proposal', updatedProposal);

    // Update phase status
    updatePhaseStatus('client_approved');

    // Show confirmation
    setShowConfirmation(true);

    // Navigate to implementation spec phase after delay
    // Phase transition will happen automatically in ImplementationSpecDashboard
    setTimeout(() => {
      navigate('/phase2');
    }, 2500);
  };

  const handleRequestChanges = () => {
    setShowRejectionModal(true);
  };

  const handleSubmitRejection = (feedback: string) => {
    // Save rejection feedback
    const updatedProposal: ProposalData = {
      ...proposalData!,
      rejectionFeedback: feedback,
      rejectedAt: new Date().toISOString()
    };

    updateModule('proposal', updatedProposal);

    // Update phase status
    updatePhaseStatus('awaiting_client_decision');

    // Close modal and navigate back to proposal
    setShowRejectionModal(false);
    navigate('/module/proposal');
  };

  if (!currentMeeting || !proposalData) {
    return null;
  }

  // Calculate totals for PURCHASED services only
  const purchasedServices = selectedServices.filter(s => purchasedServiceIds.has(s.id));

  // חישוב מחיר בסיס ללא הנחות (כבר מופחת ב-30%)
  const baseTotalPrice = purchasedServices.reduce(
    (sum, service) => sum + (service.customPrice || service.basePrice || 0),
    0
  );

  // אין הפחתה אוטומטית נוספת - המחירים כבר מופחתים ב-30%

  // חישוב זמן יישום מופחת ביום אחד לכל שירות
  const totalDays = purchasedServices.reduce(
    (sum, service) => sum + Math.max(1, (service.estimatedDays || 0) - 1),
    0
  );

  // קבועי מע"מ והנחה
  const VAT_RATE = 0.18; // 18% מע"מ

  // מחיר כולל עם מע"מ (ללא הנחה נוספת)
  const totalPriceWithVat = baseTotalPrice * (1 + VAT_RATE);

  // מחיר לאחר הנחה נוספת (ללא מע"מ)
  const discountedPrice = baseTotalPrice * (1 - (discountPercentage / 100));

  // מחיר סופי עם מע"מ לאחר הנחה נוספת
  const finalPriceWithVat = discountedPrice * (1 + VAT_RATE);

  // Group ALL PROPOSED services by category (for display)
  const servicesByCategory = selectedServices.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, SelectedService[]>);

  const categoryNames: Record<string, string> = {
    automations: 'אוטומציות',
    ai_agents: 'סוכני AI',
    integrations: 'אינטגרציות',
    system_implementation: 'הטמעת מערכות',
    additional_services: 'שירותים נוספים'
  };

  return (
    <>
      {/* Confirmation Overlay */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-green-600 rounded-full mb-6 shadow-2xl animate-scale-in">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-3">
              ההצעה אושרה בהצלחה!
            </h2>
            <p className="text-xl text-green-700">
              תודה על האישור. עובר לשלב מפרט היישום...
            </p>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleSubmitRejection}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4" dir="rtl">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  אישור הצעת פרויקט
                </h1>
                <p className="text-lg text-gray-600">
                  נא לעיין בפרטי ההצעה ולחתום לאישור
                </p>
              </div>
              <FileText className="w-16 h-16 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">שם הלקוח</p>
                  <p className="font-semibold text-gray-900">
                    {currentMeeting.clientName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">תאריך</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(currentMeeting.date).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">מספר הצעה</p>
                  <p className="font-semibold text-gray-900 font-mono">
                    {currentMeeting.meetingId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Summary */}
          <div className="space-y-4">
            {/* Business Overview */}
            <CollapsibleSection title="סקירת העסק">
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">שם העסק</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentMeeting.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">סוג עסק</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentMeeting.modules?.overview?.businessType || 'לא צוין'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">מספר עובדים</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentMeeting.modules?.overview?.employees || 'לא צוין'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">אתגר מרכזי</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentMeeting.modules?.overview?.mainChallenge || 'לא צוין'}
                    </p>
                  </div>
                </div>
              </Card>
            </CollapsibleSection>

            {/* Selected Services - with checkboxes for purchase selection */}
            <CollapsibleSection title="שירותים מוצעים - סמן מה הלקוח רכש" defaultExpanded={true}>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>הוראות:</strong> סמן את השירותים שהלקוח החליט לרכוש. רק שירותים מסומנים יועברו לשלב מפרט היישום.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  שירותים שנבחרו: <strong>{purchasedServiceIds.size}</strong> מתוך {selectedServices.length}
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <Card key={category} className="bg-gradient-to-br from-white to-blue-50">
                    <div className="mb-4 pb-3 border-b border-blue-200">
                      <h4 className="text-xl font-bold text-blue-900">
                        {categoryNames[category] || category}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {services.map((service, idx) => {
                        const isPurchased = purchasedServiceIds.has(service.id);
                        return (
                          <div
                            key={idx}
                            className={`p-4 bg-white rounded-lg border-2 transition-all cursor-pointer ${
                              isPurchased
                                ? 'border-green-500 shadow-md ring-2 ring-green-200'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => toggleServicePurchase(service.id)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <div className="flex-shrink-0 mt-1">
                                <input
                                  type="checkbox"
                                  checked={isPurchased}
                                  onChange={() => toggleServicePurchase(service.id)}
                                  className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              {/* Service Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="text-lg font-semibold text-gray-900">
                                    {service.nameHe}
                                  </h5>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${isPurchased ? 'text-green-600' : 'text-blue-600'}`}>
                                      {formatCurrency(service.customPrice || service.basePrice)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      כולל מע"מ (18%)
                                    </div>
                                  </div>
                                </div>

                                <p className="text-gray-600 mb-3">
                                  {service.customDescriptionHe || service.descriptionHe}
                                </p>

                                <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>משך זמן משוער: {Math.max(1, (service.estimatedDays || 0) - 1)} ימי עבודה</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>רמת מורכבות: {
                                      service.complexity === 'simple' ? 'פשוט' :
                                      service.complexity === 'medium' ? 'בינוני' : 'מורכב'
                                    }</span>
                                  </div>
                                </div>

                                {service.notes && (
                                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                      <span className="font-semibold">הערות:</span> {service.notes}
                                    </p>
                                  </div>
                                )}

                                {isPurchased && (
                                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    נבחר לרכישה
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleSection>

            {/* Pricing & Timeline - for PURCHASED services */}
            <CollapsibleSection title="מחיר ולוח זמנים (שירותים שנרכשו)" defaultExpanded={true}>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>שים לב:</strong> המחיר והזמן המוצגים כאן מתייחסים רק לשירותים שסומנו כנרכשו.
                </p>
              </div>

              {/* שדה אחוזי הנחה */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-medium text-blue-800">אחוז הנחה נוסף</label>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-32"
                  dir="rtl"
                />
                <p className="text-xs text-blue-600 mt-1">
                  הנחה נוספת על המחירים שכבר מופחתים ב-30% (לפני מע"מ)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">מחיר בסיס (כבר מופחת ב-30%, ללא מע"מ)</p>
                      <p className="text-xl font-bold text-green-900">
                        {formatCurrency(baseTotalPrice)}
                      </p>
                      {discountPercentage > 0 && (
                        <>
                          <p className="text-sm text-green-700 mb-1 mt-2">מחיר לאחר הנחה נוספת ({discountPercentage}%) (ללא מע"מ)</p>
                          <p className="text-xl font-bold text-green-900">
                            {formatCurrency(discountedPrice)}
                          </p>
                        </>
                      )}
                      <p className="text-sm text-green-700 mb-1 mt-2">מחיר סופי כולל מע"מ (18%)</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(finalPriceWithVat)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {purchasedServiceIds.size} שירותים
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">משך הפרויקט המשוער</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {totalDays} ימי עבודה
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        כ-{Math.ceil(totalDays / 5)} שבועות
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
            </CollapsibleSection>

            {/* ROI Projections */}
            {roiData && (
              <CollapsibleSection title="תחזית החזר על השקעה (ROI)">
                <Card>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 mb-2">שעות חודשיות נחסכות</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {roiData.scenarios?.realistic?.monthlySavingsHours?.toFixed(0) || 0}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">שעות/חודש</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 mb-2">חיסכון חודשי</p>
                      <p className="text-3xl font-bold text-green-900">
                        {formatCurrency(roiData.scenarios?.realistic?.monthlySavings || 0)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">₪/חודש</p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700 mb-2">תקופת החזר</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {roiData.scenarios?.realistic?.paybackMonths?.toFixed(1) || 0}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">חודשים</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          ROI צפוי לשנה הראשונה
                        </p>
                        <p className="text-sm text-gray-700">
                          בתרחיש ריאליסטי, הפרויקט צפוי לחסוך{' '}
                          <span className="font-bold text-green-700">
                            {formatCurrency((roiData.scenarios?.realistic?.monthlySavings || 0) * 12)}
                          </span>
                          {' '}בשנה הראשונה, עם החזר על ההשקעה תוך{' '}
                          <span className="font-bold text-blue-700">
                            {roiData.scenarios?.realistic?.paybackMonths?.toFixed(1) || 0} חודשים
                          </span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </CollapsibleSection>
            )}

            {/* Signature Section */}
            <Card className="bg-white border-2 border-blue-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">חתימה ואישור</h3>
                <p className="text-gray-600">
                  נא לחתום על ההצעה להמשך הפרויקט למפרט טכני והיישום
                </p>
              </div>

              {/* Client Name Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שם החותם *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="הזן את שמך המלא"
                />
              </div>

              {/* Signature Canvas */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    חתימה *
                  </label>
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    נקה חתימה
                  </button>
                </div>

                <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
                  <SignatureCanvas
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full h-48 md:h-64 cursor-crosshair',
                      style: { touchAction: 'none' }
                    }}
                    backgroundColor="white"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  חתום בתוך המסגרת באמצעות העכבר או המגע
                </p>
              </div>

              {/* Date (auto-filled) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  תאריך
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('he-IL')}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-lg"
                />
              </div>

              {/* Optional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  הערות נוספות (אופציונלי)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="כל הערה או דרישה נוספת..."
                />
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 font-medium">{validationError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleRequestChanges}
                  className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold text-lg"
                >
                  <Edit3 className="w-5 h-5" />
                  בקש שינויים
                </button>

                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  אשר ועבור למפרט יישום
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                אישור יעביר אותך לשלב מפרט היישום עם השירותים שסומנו בלבד
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
};
