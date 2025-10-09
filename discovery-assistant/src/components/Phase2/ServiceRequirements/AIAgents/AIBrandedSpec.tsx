import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import type { AIBrandedRequirements } from '../../../../types/aiAgentServices';
import { Card } from '../../../Common/Card';
import { Save, Bot, MessageSquare } from 'lucide-react';

export function AIBrandedSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  const [config, setConfig] = useState<AIBrandedRequirements>({
    branding: {
      companyName: '',
      logoUrl: '',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      brandVoice: 'professional',
      tone: 'helpful_friendly'
    },
    capabilities: {
      conversationStyle: 'conversational',
      responseLength: 'medium',
      useEmojis: false,
      formalLanguage: true,
      personalizedResponses: true
    },
    knowledgeBase: {
      companyInfo: {
        history: '',
        values: '',
        uniqueSellingPoints: [],
        faq: []
      },
      productKnowledge: {
        services: [],
        pricing: '',
        commonObjections: []
      },
      industryContext: {
        marketPosition: '',
        competitors: [],
        trends: []
      }
    },
    conversationFlow: {
      greeting: 'שלום! אני העוזר הוירטואלי של {companyName}. איך אוכל לעזור לך היום?',
      fallback: 'מצטער, לא הבנתי לגמרי. האם תוכל לנסח אחרת או לשאול על נושאים ספציפיים כמו השירותים שלנו או פרטי התקשרות?',
      closing: 'תודה שפנית אלינו! אם יש לך עוד שאלות, אני כאן לעזור.',
      transferTriggers: ['מבקש לדבר עם אדם', 'בעיה טכנית מורכבת', 'תלונה']
    },
    integration: {
      crmSync: true,
      leadCapture: true,
      conversationLogging: true,
      analytics: true
    },
    training: {
      brandGuidelines: '',
      forbiddenTopics: ['מחירים פנימיים', 'מידע סודי', 'השוואות למתחרים'],
      escalationKeywords: ['בעיה', 'תקלה', 'לא עובד', 'מבטל']
    }
  });

  useEffect(() => {
    if (currentMeeting?.implementationSpec?.aiAgents) {
      const existing = currentMeeting.implementationSpec.aiAgents.find(
        (a: any) => a.serviceId === 'ai-branded'
      );
      if (existing) {
        setConfig(existing.requirements);
      }
    }
  }, [currentMeeting]);

  const saveConfig = () => {
    if (!currentMeeting) return;

    const updatedAIAgents = [...(currentMeeting.implementationSpec?.aiAgents || [])];
    const existingIndex = updatedAIAgents.findIndex((a: any) => a.serviceId === 'ai-branded');

    const agentData = {
      serviceId: 'ai-branded',
      serviceName: 'סוכן AI ממותג',
      requirements: config,
      completedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedAIAgents[existingIndex] = agentData;
    } else {
      updatedAIAgents.push(agentData);
    }

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        aiAgents: updatedAIAgents,
        lastUpdated: new Date()
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="סוכן AI ממותג" subtitle="יצירת סוכן AI המותאם למותג ולקול של החברה שלכם">
        <div className="space-y-6">
          {/* מיתוג בסיסי */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              מיתוג בסיסי
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם החברה</label>
                <input
                  type="text"
                  value={config.branding.companyName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, companyName: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="שם החברה שלכם"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">לוגו (URL)</label>
                <input
                  type="url"
                  value={config.branding.logoUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, logoUrl: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">צבע ראשי</label>
                <input
                  type="color"
                  value={config.branding.primaryColor}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, primaryColor: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">צבע משני</label>
                <input
                  type="color"
                  value={config.branding.secondaryColor}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, secondaryColor: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg h-10"
                />
              </div>
            </div>
          </div>

          {/* סגנון שיחה */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              סגנון שיחה
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">סגנון שיחה</label>
                <select
                  value={config.capabilities.conversationStyle}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    capabilities: { ...prev.capabilities, conversationStyle: e.target.value as any }
                  }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="formal">פורמלי</option>
                  <option value="conversational">שיחתי</option>
                  <option value="friendly">ידידותי</option>
                  <option value="professional">מקצועי</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">אורך תגובה</label>
                <select
                  value={config.capabilities.responseLength}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    capabilities: { ...prev.capabilities, responseLength: e.target.value as any }
                  }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="short">קצר</option>
                  <option value="medium">בינוני</option>
                  <option value="detailed">מפורט</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useEmojis"
                  checked={config.capabilities.useEmojis}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    capabilities: { ...prev.capabilities, useEmojis: e.target.checked }
                  }))}
                />
                <label htmlFor="useEmojis" className="text-sm">השתמש באימוג'ים</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formalLanguage"
                  checked={config.capabilities.formalLanguage}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    capabilities: { ...prev.capabilities, formalLanguage: e.target.checked }
                  }))}
                />
                <label htmlFor="formalLanguage" className="text-sm">שפה פורמלית</label>
              </div>
            </div>
          </div>

          {/* בסיס ידע - מידע על החברה */}
          <div>
            <h4 className="font-medium mb-3">מידע על החברה</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">היסטוריה ורקע</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.history}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    knowledgeBase: {
                      ...prev.knowledgeBase,
                      companyInfo: { ...prev.knowledgeBase.companyInfo, history: e.target.value }
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="ספר על ההיסטוריה והרקע של החברה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ערכים וחזון</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.values}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    knowledgeBase: {
                      ...prev.knowledgeBase,
                      companyInfo: { ...prev.knowledgeBase.companyInfo, values: e.target.value }
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="מה הערכים והחזון של החברה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">נקודות חוזק ייחודיות</label>
                <textarea
                  value={config.knowledgeBase.companyInfo.uniqueSellingPoints.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    knowledgeBase: {
                      ...prev.knowledgeBase,
                      companyInfo: {
                        ...prev.knowledgeBase.companyInfo,
                        uniqueSellingPoints: e.target.value.split('\n').filter(s => s.trim())
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - נקודת חוזק אחת..."
                />
              </div>
            </div>
          </div>

          {/* זרימת שיחה */}
          <div>
            <h4 className="font-medium mb-3">זרימת שיחה</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">הודעת פתיחה</label>
                <input
                  type="text"
                  value={config.conversationFlow.greeting}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    conversationFlow: { ...prev.conversationFlow, greeting: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="שלום! אני העוזר הוירטואלי של {companyName}..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הודעת חזרה (כשלא מבין)</label>
                <textarea
                  value={config.conversationFlow.fallback}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    conversationFlow: { ...prev.conversationFlow, fallback: e.target.value }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="מצטער, לא הבנתי לגמרי..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">הודעת סיום</label>
                <input
                  type="text"
                  value={config.conversationFlow.closing}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    conversationFlow: { ...prev.conversationFlow, closing: e.target.value }
                  }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="תודה שפנית אלינו!..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מילות מפתח להעברה לאדם</label>
                <textarea
                  value={config.conversationFlow.transferTriggers.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    conversationFlow: {
                      ...prev.conversationFlow,
                      transferTriggers: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - מילת מפתח אחת..."
                />
              </div>
            </div>
          </div>

          {/* הגדרות אימון */}
          <div>
            <h4 className="font-medium mb-3">הגדרות אימון</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">הנחיות מותג</label>
                <textarea
                  value={config.training.brandGuidelines}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    training: { ...prev.training, brandGuidelines: e.target.value }
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="איך הסוכן צריך לייצג את המותג..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">נושאים אסורים</label>
                <textarea
                  value={config.training.forbiddenTopics.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    training: {
                      ...prev.training,
                      forbiddenTopics: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - נושא אסור אחד..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מילות מפתח להסלמה</label>
                <textarea
                  value={config.training.escalationKeywords.join('\n')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    training: {
                      ...prev.training,
                      escalationKeywords: e.target.value.split('\n').filter(s => s.trim())
                    }
                  }))}
                  rows={2}
                  className="w-full p-2 border rounded-lg"
                  placeholder="כל שורה - מילת מפתח אחת להסלמה..."
                />
              </div>
            </div>
          </div>

          {/* שמירה */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
