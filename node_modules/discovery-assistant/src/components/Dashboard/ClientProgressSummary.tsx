import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';
import { Card } from '../Base';
import { RemainingTask, PurchasedService, NextAction, ClientProgressSummary } from '../../utils/dashboardHelpers';
import { formatCurrency } from '../../utils/formatters';

interface ClientProgressSummaryProps {
  progress: ClientProgressSummary;
  onActionClick?: (action: NextAction) => void;
}

export const ClientProgressSummary: React.FC<ClientProgressSummaryProps> = ({
  progress,
  onActionClick
}) => {
  const {
    overallProgress,
    phaseStatus,
    remainingTasks,
    purchasedServices,
    nextActions
  } = progress;

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPhaseText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלם';
      case 'in_progress': return 'בתהליך';
      case 'waiting': return 'ממתין';
      default: return 'טרם התחיל';
    }
  };

  const totalValue = purchasedServices.reduce((sum, service) => sum + (service.price || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" dir="rtl">

      {/* התקדמות כללית */}
      <Card className="progress-summary-card bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">התקדמות כללית</h3>
          <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getPhaseIcon(phaseStatus.discovery)}
              <span className="text-sm font-medium">Discovery Phase</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              phaseStatus.discovery === 'completed'
                ? 'bg-green-100 text-green-700'
                : phaseStatus.discovery === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getPhaseText(phaseStatus.discovery)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getPhaseIcon(phaseStatus.implementation)}
              <span className="text-sm font-medium">Implementation Spec</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              phaseStatus.implementation === 'completed'
                ? 'bg-green-100 text-green-700'
                : phaseStatus.implementation === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : phaseStatus.implementation === 'waiting'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getPhaseText(phaseStatus.implementation)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getPhaseIcon(phaseStatus.development)}
              <span className="text-sm font-medium">Development</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              phaseStatus.development === 'completed'
                ? 'bg-green-100 text-green-700'
                : phaseStatus.development === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : phaseStatus.development === 'waiting'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getPhaseText(phaseStatus.development)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </Card>

      {/* מה נשאר להשלים */}
      <Card className="remaining-tasks-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">מה נשאר להשלים</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {remainingTasks.length} פריטים
          </span>
        </div>

        {remainingTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-700 font-medium">הכל הושלם! 🎉</p>
            <p className="text-sm text-gray-600 mt-1">מוכן למעבר לשלב הבא</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {remainingTasks.map((task, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                task.urgent
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {task.urgent ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{task.description}</p>
                  {task.count && (
                    <p className="text-xs text-gray-600 mt-1">
                      כמות: {task.count}
                    </p>
                  )}
                </div>
                {task.urgent && (
                  <span className="flex-shrink-0 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    דחוף
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* שירותים שנרכשו */}
      <Card className="purchased-services-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">שירותים שנרכשו</h3>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">
              {purchasedServices.length} שירותים
            </span>
          </div>
        </div>

        {purchasedServices.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">טרם נבחרו שירותים</p>
            <p className="text-sm text-gray-500 mt-1">יש לבחור שירותים בהצעה</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {purchasedServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.category}</p>
                  </div>
                </div>
                {service.price && (
                  <span className="text-sm font-semibold text-green-700">
                    ₪{service.price.toLocaleString()}
                  </span>
                )}
              </div>
            ))}

            {totalValue > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">סה"כ:</span>
                  <span className="text-lg font-bold text-green-700">
                    ₪{totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* פעולות הבאות */}
      <Card className="next-actions-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">פעולות הבאות</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {nextActions.length} פעולות
          </span>
        </div>

        {nextActions.length === 0 ? (
          <div className="text-center py-8">
            <ArrowRight className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">אין פעולות מומלצות כרגע</p>
          </div>
        ) : (
          <div className="space-y-2">
            {nextActions.slice(0, 4).map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick?.(action)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  action.urgent
                    ? 'bg-red-50 border border-red-200 hover:bg-red-100'
                    : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{index + 1}.</span>
                  <span className="text-sm text-right">{action.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {action.urgent && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      דחוף
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}

            {nextActions.length > 4 && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  +{nextActions.length - 4} פעולות נוספות
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
};
