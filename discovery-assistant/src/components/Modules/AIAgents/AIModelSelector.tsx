import React, { useState, useMemo } from 'react';
import { CheckCircle, DollarSign, Zap, Languages, Info, TrendingUp } from 'lucide-react';
import { Card } from '../../Common/Card';
import { AIModelComparison, AIAgentUseCase } from '../../../types';
import { useMeetingStore } from '../../../store/useMeetingStore';

interface AIModelSelectorProps {
  useCase?: AIAgentUseCase;
  onSelectModel?: (modelId: string) => void;
}

// Model data with Hebrew support and pricing
const AI_MODELS: AIModelComparison[] = [
  {
    modelId: 'gpt-4-turbo',
    modelName: 'GPT-4 Turbo',
    provider: 'OpenAI',
    version: 'gpt-4-turbo-preview',
    costPer1MTokensInput: 10,
    costPer1MTokensOutput: 30,
    maxTokens: 4096,
    hebrewSupport: 'excellent',
    responseSpeed: 'medium',
    contextWindow: 128000,
    strengths: ['הבנת הקשר מצוינת', 'תגובות מפורטות', 'יכולות חשיבה מתקדמות'],
    bestFor: ['שירות לקוחות מורכב', 'ייעוץ מכירות', 'תשובות טכניות'],
    limitations: ['מחיר גבוה', 'מהירות בינונית']
  },
  {
    modelId: 'gpt-3.5-turbo',
    modelName: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    version: 'gpt-3.5-turbo',
    costPer1MTokensInput: 0.5,
    costPer1MTokensOutput: 1.5,
    maxTokens: 4096,
    hebrewSupport: 'good',
    responseSpeed: 'fast',
    contextWindow: 16385,
    strengths: ['מחיר נמוך', 'מהירות גבוהה', 'מספיק לרוב המשימות'],
    bestFor: ['מענה ראשוני ללידים', 'שאלות נפוצות', 'טפסים'],
    limitations: ['פחות מתקדם', 'הקשר קצר יותר']
  },
  {
    modelId: 'claude-3-opus',
    modelName: 'Claude 3 Opus',
    provider: 'Anthropic',
    version: 'claude-3-opus-20240229',
    costPer1MTokensInput: 15,
    costPer1MTokensOutput: 75,
    maxTokens: 4096,
    hebrewSupport: 'excellent',
    responseSpeed: 'medium',
    contextWindow: 200000,
    strengths: ['הקשר ארוך מאוד', 'מדויק ומהימן', 'עברית מצוינת'],
    bestFor: ['ניתוח מסמכים', 'תמיכה טכנית מורכבת', 'שיחות ארוכות'],
    limitations: ['מחיר גבוה מאוד', 'לא המהיר ביותר']
  },
  {
    modelId: 'claude-3.5-sonnet',
    modelName: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'claude-3-5-sonnet-20241022',
    costPer1MTokensInput: 3,
    costPer1MTokensOutput: 15,
    maxTokens: 8192,
    hebrewSupport: 'excellent',
    responseSpeed: 'fast',
    contextWindow: 200000,
    strengths: ['יחס מחיר/ביצועים מצוין', 'מהיר', 'עברית מצוינת'],
    bestFor: ['כל סוגי המשימות', 'שירות לקוחות', 'מכירות'],
    limitations: ['פחות מתקדם מ-Opus']
  },
  {
    modelId: 'gemini-pro',
    modelName: 'Gemini Pro',
    provider: 'Google',
    version: '1.5-pro',
    costPer1MTokensInput: 1.25,
    costPer1MTokensOutput: 5,
    maxTokens: 8192,
    hebrewSupport: 'good',
    responseSpeed: 'fast',
    contextWindow: 1000000,
    strengths: ['הקשר ענק', 'מחיר תחרותי', 'אינטגרציה עם Google'],
    bestFor: ['ניתוח מסמכים רבים', 'חיפוש ב-Gmail', 'אינטגרציה עם Workspace'],
    limitations: ['עברית פחות מדויקת', 'חדש יחסית']
  }
];

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({ useCase, onSelectModel }) => {
  const { updateModule, currentMeeting } = useMeetingStore();
  const moduleData = currentMeeting?.modules?.aiAgents || {};

  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Calculate estimated monthly cost based on expected volume
  const calculateMonthlyCost = (model: AIModelComparison, volume: number) => {
    // Estimate: average conversation uses ~2000 tokens input + 1000 tokens output
    const avgInputTokens = 2000;
    const avgOutputTokens = 1000;

    const inputCost = (avgInputTokens * volume * model.costPer1MTokensInput) / 1000000;
    const outputCost = (avgOutputTokens * volume * model.costPer1MTokensOutput) / 1000000;

    return (inputCost + outputCost).toFixed(2);
  };

  // Get recommendation based on use case
  const getRecommendation = (model: AIModelComparison): 'excellent' | 'good' | 'ok' | null => {
    if (!useCase) return null;

    // Sales use cases - prefer fast and economical
    if (useCase.department === 'sales') {
      if (model.modelId === 'claude-3.5-sonnet' || model.modelId === 'gpt-3.5-turbo') {
        return 'excellent';
      }
      if (model.modelId === 'gpt-4-turbo') return 'good';
    }

    // Service use cases - prefer excellent Hebrew and reliability
    if (useCase.department === 'service') {
      if (model.modelId === 'claude-3.5-sonnet' || model.modelId === 'claude-3-opus') {
        return 'excellent';
      }
      if (model.modelId === 'gpt-4-turbo') return 'good';
    }

    // Operations use cases - prefer fast and economical
    if (useCase.department === 'operations') {
      if (model.modelId === 'gpt-3.5-turbo' || model.modelId === 'gemini-pro') {
        return 'excellent';
      }
    }

    // High volume needs - prefer economical
    if (useCase.expectedVolume > 1000) {
      if (model.modelId === 'gpt-3.5-turbo' || model.modelId === 'gemini-pro') {
        return 'good';
      }
    }

    return 'ok';
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);

    if (useCase && onSelectModel) {
      onSelectModel(modelId);

      // Save selection to store
      const model = AI_MODELS.find(m => m.modelId === modelId);
      if (model) {
        const selection = {
          useCaseId: useCase.id,
          selectedModelId: modelId,
          reasoning: `נבחר עבור ${useCase.name}`,
          estimatedMonthlyCost: parseFloat(calculateMonthlyCost(model, useCase.expectedVolume)),
          estimatedTokensPerMonth: useCase.expectedVolume * 3000 // 3000 tokens average per interaction
        };

        const existingSelections = moduleData.selectedModels || [];
        const updatedSelections = existingSelections.filter(s => s.useCaseId !== useCase.id);
        updatedSelections.push(selection);

        updateModule('aiAgents', {
          ...moduleData,
          selectedModels: updatedSelections
        });
      }
    }
  };

  const hebrewSupportBadge = (level: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-700 border-green-300',
      good: 'bg-blue-100 text-blue-700 border-blue-300',
      basic: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      none: 'bg-gray-100 text-gray-700 border-gray-300'
    };

    const labels = {
      excellent: 'מצוינת',
      good: 'טובה',
      basic: 'בסיסית',
      none: 'אין'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[level as keyof typeof colors]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  const speedBadge = (speed: string) => {
    const colors = {
      fast: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      slow: 'bg-red-100 text-red-700'
    };

    const labels = {
      fast: 'מהיר',
      medium: 'בינוני',
      slow: 'איטי'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[speed as keyof typeof colors]}`}>
        {labels[speed as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card
        title="בחירת מודל AI"
        subtitle={useCase ? `עבור: ${useCase.name}` : 'השוואת מודלים זמינים'}
        variant="glass"
      >
        {useCase && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">המלצה אוטומטית</p>
                <p>בהתבסס על מחלקה: <strong>{useCase.department}</strong>, נפח צפוי: <strong>{useCase.expectedVolume.toLocaleString()} פניות/חודש</strong></p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {AI_MODELS.map((model) => {
            const recommendation = getRecommendation(model);
            const isSelected = selectedModelId === model.modelId;
            const monthlyCost = useCase ? calculateMonthlyCost(model, useCase.expectedVolume) : '0';

            return (
              <div
                key={model.modelId}
                className={`border-2 rounded-lg p-4 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                  ${recommendation === 'excellent' ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
                `}
                onClick={() => handleSelectModel(model.modelId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{model.modelName}</h3>
                      {recommendation === 'excellent' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          מומלץ ביותר
                        </span>
                      )}
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{model.provider} • {model.version}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Input</p>
                      <p className="text-sm font-semibold">${model.costPer1MTokensInput}/1M</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Output</p>
                      <p className="text-sm font-semibold">${model.costPer1MTokensOutput}/1M</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">מהירות</p>
                      {speedBadge(model.responseSpeed)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">עברית</p>
                      {hebrewSupportBadge(model.hebrewSupport)}
                    </div>
                  </div>
                </div>

                {/* Estimated Monthly Cost */}
                {useCase && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">עלות חודשית משוערת:</span>
                      <span className="text-2xl font-bold text-purple-700">${monthlyCost}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      בהנחה של ~3000 טוקנים לכל שיחה
                    </p>
                  </div>
                )}

                {/* Toggle Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(showDetails === model.modelId ? null : model.modelId);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showDetails === model.modelId ? 'הסתר פרטים' : 'הצג פרטים'}
                </button>

                {/* Detailed Information */}
                {showDetails === model.modelId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">יתרונות:</h4>
                      <ul className="space-y-1">
                        {model.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">מתאים ל:</h4>
                      <ul className="space-y-1">
                        {model.bestFor.map((use, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {use}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">מגבלות:</h4>
                      <ul className="space-y-1">
                        {model.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">הקשר מקסימלי</p>
                        <p className="text-sm font-semibold">{model.contextWindow.toLocaleString()} טוקנים</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">פלט מקסימלי</p>
                        <p className="text-sm font-semibold">{model.maxTokens.toLocaleString()} טוקנים</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary / Comparison Table */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">טבלת השוואה מהירה</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">מודל</th>
                  <th className="px-4 py-3 text-right font-semibold">מחיר Input</th>
                  <th className="px-4 py-3 text-right font-semibold">מחיר Output</th>
                  <th className="px-4 py-3 text-right font-semibold">עברית</th>
                  <th className="px-4 py-3 text-right font-semibold">מהירות</th>
                  <th className="px-4 py-3 text-right font-semibold">הקשר</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {AI_MODELS.map((model) => (
                  <tr key={model.modelId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{model.modelName}</td>
                    <td className="px-4 py-3">${model.costPer1MTokensInput}/1M</td>
                    <td className="px-4 py-3">${model.costPer1MTokensOutput}/1M</td>
                    <td className="px-4 py-3">{hebrewSupportBadge(model.hebrewSupport)}</td>
                    <td className="px-4 py-3">{speedBadge(model.responseSpeed)}</td>
                    <td className="px-4 py-3">{(model.contextWindow / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};