import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  KeyIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CogIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/AIService';
import type { AIProvider, AIConfig } from '../../types';

export const AISettings: React.FC = () => {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    size: number;
    entries: string[];
  } | null>(null);

  // Load current configuration
  useEffect(() => {
    const currentConfig = aiService.getConfig();
    if (currentConfig) {
      setConfig(currentConfig);
    } else {
      // Default configuration
      setConfig({
        provider: 'local',
        apiKey: '',
        model: '',
        enabled: false,
        maxTokens: 4000,
        temperature: 0.7,
        enableCache: true,
        fallbackToLocal: true,
        rateLimitPerMinute: 10
      });
    }

    // Load cache statistics
    setCacheStats(aiService.getCacheStats());
  }, []);

  // Test AI connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await aiService.testConnection();
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  // Save configuration
  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      aiService.updateConfig(config);

      // Save to localStorage for persistence
      localStorage.setItem('ai_config', JSON.stringify(config));

      setTestResult({
        success: true,
        message: 'הגדרות נשמרו בהצלחה'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'שמירת הגדרות נכשלה'
      });
    } finally {
      setSaving(false);
    }
  };

  // Clear cache
  const handleClearCache = () => {
    aiService.clearCache();
    setCacheStats(aiService.getCacheStats());
    setTestResult({
      success: true,
      message: 'המטמון נוקה בהצלחה'
    });
  };

  // Handle input changes
  const handleInputChange = (field: keyof AIConfig, value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      [field]: value
    });
  };

  const providers: { value: AIProvider; label: string; description: string }[] = [
    {
      value: 'openai',
      label: 'OpenAI',
      description: 'GPT-4, GPT-3.5 Turbo'
    },
    {
      value: 'anthropic',
      label: 'Anthropic',
      description: 'Claude 3 Opus, Sonnet, Haiku'
    },
    {
      value: 'cohere',
      label: 'Cohere',
      description: 'Command R+, Command R'
    },
    {
      value: 'huggingface',
      label: 'HuggingFace',
      description: 'Llama 2, Mistral, Falcon'
    },
    {
      value: 'local',
      label: 'מקומי (ללא AI)',
      description: 'המלצות מובנות בלבד'
    }
  ];

  const getModelOptions = (provider: AIProvider): string[] => {
    switch (provider) {
      case 'openai':
        return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
      case 'anthropic':
        return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
      case 'cohere':
        return ['command-r-plus', 'command-r', 'command'];
      case 'huggingface':
        return [
          'meta-llama/Llama-2-70b-chat-hf',
          'mistralai/Mixtral-8x7B-Instruct-v0.1',
          'tiiuae/falcon-180B-chat'
        ];
      default:
        return [];
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <CpuChipIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">הגדרות AI</h2>
            <p className="text-gray-600">הגדר את ספק ה-AI להמלצות דינמיות</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {aiService.isAvailable() ? (
            <>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-700">AI מוגדר ופעיל</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">AI לא מוגדר - משתמש בהמלצות מקומיות</span>
            </>
          )}
        </div>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-blue-600" />
          בחר ספק AI
        </h3>

        <div className="grid gap-3">
          {providers.map(provider => (
            <label
              key={provider.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                config.provider === provider.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={provider.value}
                checked={config.provider === provider.value}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{provider.label}</div>
                <div className="text-sm text-gray-600">{provider.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      {config.provider !== 'local' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-blue-600" />
            הגדרות API
          </h3>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מפתח API
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
                dir="ltr"
              />
              <p className="mt-1 text-sm text-gray-500">
                המפתח מאוחסן באופן מקומי ולא נשלח לשרתים חיצוניים
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מודל
              </label>
              <select
                value={config.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">בחר מודל</option>
                {getModelOptions(config.provider).map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מקסימום טוקנים
                </label>
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  max="32000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טמפרטורה (0-1)
                </label>
                <input
                  type="number"
                  value={config.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="1"
                  step="0.1"
                />
              </div>
            </div>

            {/* Rate Limiting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                הגבלת קריאות לדקה
              </label>
              <input
                type="number"
                value={config.rateLimitPerMinute}
                onChange={(e) => handleInputChange('rateLimitPerMinute', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CogIcon className="h-5 w-5 text-blue-600" />
          תכונות
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>הפעל המלצות AI</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.enableCache}
              onChange={(e) => handleInputChange('enableCache', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>השתמש במטמון לשיפור ביצועים</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.fallbackToLocal}
              onChange={(e) => handleInputChange('fallbackToLocal', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>חזור להמלצות מקומיות בשגיאה</span>
          </label>
        </div>
      </div>

      {/* Cache Management */}
      {config.enableCache && cacheStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5 text-blue-600" />
            ניהול מטמון
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-700">
                פריטים במטמון: <span className="font-semibold">{cacheStats.size}</span>
              </p>
              <p className="text-sm text-gray-500">
                המטמון חוסך קריאות מיותרות ל-API
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
            >
              נקה מטמון
            </button>
          </div>

          {cacheStats.size > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-600 mb-2">מפתחות במטמון:</p>
              {cacheStats.entries.map((entry, index) => (
                <div key={index} className="text-xs text-gray-500 truncate">
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Connection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BeakerIcon className="h-5 w-5 text-blue-600" />
          בדיקת חיבור
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={handleTestConnection}
            disabled={testing || !config.apiKey || config.provider === 'local'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                בודק...
              </>
            ) : (
              <>
                <BeakerIcon className="h-4 w-4" />
                בדוק חיבור
              </>
            )}
          </button>

          {testResult && (
            <div className={`flex items-center gap-2 ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">אודות המלצות AI</p>
            <p>
              כאשר AI מופעל, המערכת תנתח את נתוני המפגש ותספק המלצות מותאמות אישית
              לשיפור תהליכים עסקיים. ההמלצות מבוססות על דפוסים שזוהו בנתונים
              ומותאמות לצרכים הספציפיים של הארגון.
            </p>
            <p className="mt-2">
              במקרה של כשל או חוסר הגדרה, המערכת תשתמש בהמלצות מובנות המבוססות
              על כללים מוגדרים מראש.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};