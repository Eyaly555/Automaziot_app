import React from 'react';
import {
  X,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { ConversationAnalysisResult } from '../../types/conversation';
import { Card } from '../Base';

interface ConversationSummaryViewerProps {
  analysis: ConversationAnalysisResult;
  onClose?: () => void;
}

/**
 * Component for viewing saved conversation analysis
 * Shows the transcript, summary, extracted fields, and analysis metadata
 */
export const ConversationSummaryViewer: React.FC<
  ConversationSummaryViewerProps
> = ({ analysis, onClose }) => {
  // Format the analysis timestamp
  const analysisDate = new Date(analysis.timestamp);
  const formattedDate = analysisDate.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get confidence badge color
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return { color: 'bg-green-100 text-green-800', text: 'גבוהה' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'בינונית' };
      case 'low':
        return { color: 'bg-red-100 text-red-800', text: 'נמוכה' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'לא ידוע' };
    }
  };

  const confidenceBadge = getConfidenceBadge(analysis.analysis.confidence);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                סיכום וניתוח שיחה
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <Card title="מידע כללי">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">שם קובץ:</p>
                <p className="font-medium text-gray-900">
                  {analysis.audioFile.fileName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">משך הקלטה:</p>
                <p className="font-medium text-gray-900">
                  {formatDuration(analysis.transcription.duration)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">שפה:</p>
                <p className="font-medium text-gray-900">
                  {analysis.transcription.language === 'he'
                    ? 'עברית'
                    : analysis.transcription.language}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">רמת ביטחון:</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceBadge.color}`}
                >
                  {confidenceBadge.text}
                </span>
              </div>
            </div>
          </Card>

          {/* Summary Card */}
          <Card title="סיכום השיחה">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis.analysis.summary}
              </p>
            </div>
          </Card>

          {/* Extracted Fields Card */}
          {Object.keys(analysis.analysis.extractedFields).length > 0 && (
            <Card title="שדות שזוהו">
              <div className="space-y-4">
                {Object.entries(analysis.analysis.extractedFields).map(
                  ([moduleName, fields]) => {
                    if (!fields || Object.keys(fields).length === 0)
                      return null;

                    const moduleNames: Record<string, string> = {
                      overview: 'סקירה כללית',
                      leadsAndSales: 'לידים ומכירות',
                      customerService: 'שירות לקוחות',
                      aiAgents: 'סוכני AI',
                      roi: 'ROI',
                    };

                    return (
                      <div
                        key={moduleName}
                        className="border-r-4 border-blue-200 pr-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {moduleNames[moduleName] || moduleName}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {Object.entries(fields as Record<string, any>).map(
                            ([fieldName, fieldValue]) => {
                              if (
                                fieldValue === undefined ||
                                fieldValue === null ||
                                fieldValue === ''
                              )
                                return null;

                              let displayValue: string;
                              if (Array.isArray(fieldValue)) {
                                displayValue =
                                  fieldValue.length > 0
                                    ? `${fieldValue.length} פריטים`
                                    : 'ריק';
                              } else if (typeof fieldValue === 'object') {
                                displayValue = 'מידע מורכב';
                              } else {
                                displayValue = String(fieldValue);
                              }

                              return (
                                <p
                                  key={fieldName}
                                  className="flex items-start gap-2"
                                >
                                  <span className="font-medium text-gray-700">
                                    {fieldName}:
                                  </span>
                                  <span className="flex-1">{displayValue}</span>
                                </p>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          )}

          {/* Next Steps Card */}
          {analysis.analysis.nextSteps &&
            analysis.analysis.nextSteps.length > 0 && (
              <Card title="צעדים הבאים מומלצים">
                <ul className="space-y-2">
                  {analysis.analysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 flex-1">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

          {/* Full Transcript Card */}
          <Card title="תמלול מלא">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="flex items-start gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {analysis.transcription.text}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>
                התמלול נוצר אוטומטית על ידי OpenAI Whisper ועשוי להכיל אי דיוקים
              </span>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
