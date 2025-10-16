import type {
  AIProvider,
  AIConfig,
  AIRequest,
  AIResponse,
  AIRecommendation,
  AIInsight,
  AIAnalysisResult,
} from '../types';
import { Meeting, PainPoint } from '../types';

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;
  private config: AIConfig | null = null;
  private isConfigured: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes
  private requestQueue: AIRequest[] = [];

  private constructor() {
    this.provider = this.detectProvider();
    this.loadConfig();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Detect and configure AI provider from environment
  private detectProvider(): AIProvider {
    const provider = import.meta.env.VITE_AI_PROVIDER as AIProvider;

    // Validate provider
    const validProviders: AIProvider[] = [
      'openai',
      'anthropic',
      'cohere',
      'huggingface',
      'local',
    ];
    if (provider && validProviders.includes(provider)) {
      return provider;
    }

    return 'local'; // Default fallback
  }

  // Load configuration from environment
  private loadConfig(): void {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    const model = import.meta.env.VITE_AI_MODEL;
    const enabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';

    if (!enabled || !apiKey || apiKey === 'your-api-key') {
      this.isConfigured = false;
      return;
    }

    this.config = {
      provider: this.provider,
      apiKey,
      model: model || this.getDefaultModel(),
      enabled,
      maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
      enableCache: true,
      fallbackToLocal: true,
      rateLimitPerMinute: 10,
    };

    this.isConfigured = true;
  }

  // Get default model for provider
  private getDefaultModel(): string {
    // Use environment variable if available, otherwise fallback to provider defaults
    const envModel = import.meta.env.VITE_AI_MODEL;
    if (envModel) return envModel;

    switch (this.provider) {
      case 'openai':
        return 'gpt-5-mini-2025-08-07';
      case 'anthropic':
        return 'claude-3-opus-20240229';
      case 'cohere':
        return 'command-r-plus';
      case 'huggingface':
        return 'meta-llama/Llama-2-70b-chat-hf';
      default:
        return 'local';
    }
  }

  // Check if AI is configured and available
  isAvailable(): boolean {
    return this.isConfigured && this.config?.enabled === true;
  }

  // Get current configuration
  getConfig(): AIConfig | null {
    return this.config;
  }

  // Update configuration
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config!, ...config };
    this.isConfigured = true;
  }

  // Generate recommendations for a meeting
  async generateRecommendations(
    meeting: Meeting,
    module?: string
  ): Promise<AIRecommendation[]> {
    if (!this.isAvailable()) {
      return this.generateLocalRecommendations(meeting, module);
    }

    // Check cache first
    const cacheKey = `recommendations:${meeting.meetingId}:${module || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = this.buildRecommendationsPrompt(meeting, module);
      const response = await this.callAI(prompt);

      if (response.success && response.data) {
        const recommendations = this.parseRecommendations(response.data);
        this.saveToCache(cacheKey, recommendations);
        return recommendations;
      }

      // Fallback to local if AI fails
      return this.generateLocalRecommendations(meeting, module);
    } catch (error) {
      console.error('AI recommendation generation failed:', error);
      return this.generateLocalRecommendations(meeting, module);
    }
  }

  // Generate insights from meeting data
  async generateInsights(meeting: Meeting): Promise<AIInsight[]> {
    if (!this.isAvailable()) {
      return this.generateLocalInsights(meeting);
    }

    // Check cache
    const cacheKey = `insights:${meeting.meetingId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = this.buildInsightsPrompt(meeting);
      const response = await this.callAI(prompt);

      if (response.success && response.data) {
        const insights = this.parseInsights(response.data);
        this.saveToCache(cacheKey, insights);
        return insights;
      }

      return this.generateLocalInsights(meeting);
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return this.generateLocalInsights(meeting);
    }
  }

  // Analyze pain points and suggest solutions
  async analyzePainPoints(painPoints: PainPoint[]): Promise<AIAnalysisResult> {
    if (!this.isAvailable()) {
      return this.analyzeLocalPainPoints(painPoints);
    }

    const cacheKey = `analysis:${painPoints.map((p) => p.id).join(',')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = this.buildAnalysisPrompt(painPoints);
      const response = await this.callAI(prompt);

      if (response.success && response.data) {
        const analysis = this.parseAnalysis(response.data);
        this.saveToCache(cacheKey, analysis);
        return analysis;
      }

      return this.analyzeLocalPainPoints(painPoints);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.analyzeLocalPainPoints(painPoints);
    }
  }

  // Call AI API based on provider
  private async callAI(prompt: string): Promise<AIResponse> {
    if (!this.isConfigured || !this.config) {
      return { success: false, error: 'AI not configured' };
    }

    // Rate limiting
    await this.checkRateLimit();

    try {
      switch (this.provider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'anthropic':
          return await this.callAnthropic(prompt);
        case 'cohere':
          return await this.callCohere(prompt);
        case 'huggingface':
          return await this.callHuggingFace(prompt);
        default:
          return { success: false, error: 'Unsupported provider' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI call failed',
      };
    }
  }

  // OpenAI API call
  private async callOpenAI(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config!.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a business automation expert providing recommendations in Hebrew.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  // Anthropic API call
  private async callAnthropic(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config!.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.content[0].text,
    };
  }

  // Cohere API call
  private async callCohere(prompt: string): Promise<AIResponse> {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config!.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config!.model,
        prompt,
        max_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.generations[0].text,
    };
  }

  // HuggingFace API call
  private async callHuggingFace(prompt: string): Promise<AIResponse> {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.config!.model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: this.config!.maxTokens,
            temperature: this.config!.temperature,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data[0].generated_text,
    };
  }

  // Build recommendations prompt
  private buildRecommendationsPrompt(
    meeting: Meeting,
    module?: string
  ): string {
    const context = module
      ? `עבור המודול ${module}, על בסיס הנתונים: ${JSON.stringify(meeting.modules[module])}`
      : `עבור כל המפגש, על בסיס הנתונים: ${JSON.stringify(meeting.modules)}`;

    return `
      אתה מומחה באוטומציה עסקית. נתח את הנתונים הבאים וספק המלצות מעשיות.

      חברה: ${meeting.companyName}
      ${context}

      צור רשימת המלצות בפורמט JSON עם המבנה הבא:
      [
        {
          "title": "כותרת ההמלצה",
          "description": "תיאור מפורט",
          "priority": "critical/high/medium/low",
          "effort": "low/medium/high",
          "estimatedValue": מספר,
          "module": "שם המודול"
        }
      ]

      ספק לפחות 5 המלצות מעשיות.
    `;
  }

  // Build insights prompt
  private buildInsightsPrompt(meeting: Meeting): string {
    return `
      נתח את נתוני המפגש העסקי הבא וספק תובנות מעמיקות:

      חברה: ${meeting.companyName}
      נתונים: ${JSON.stringify(meeting.modules)}
      נקודות כאב: ${JSON.stringify(meeting.painPoints)}

      צור רשימת תובנות בפורמט JSON:
      [
        {
          "type": "opportunity/risk/trend",
          "title": "כותרת התובנה",
          "description": "תיאור מפורט",
          "impact": "high/medium/low",
          "actionable": true/false,
          "relatedModules": ["module1", "module2"]
        }
      ]

      התמקד בתובנות שניתן לפעול לפיהן.
    `;
  }

  // Build analysis prompt
  private buildAnalysisPrompt(painPoints: PainPoint[]): string {
    return `
      נתח את נקודות הכאב הבאות וספק פתרונות:

      ${JSON.stringify(painPoints)}

      עבור כל נקודת כאב, ספק:
      1. ניתוח שורש הבעיה
      2. פתרונות אפשריים
      3. סדר עדיפויות
      4. השפעה צפויה

      החזר בפורמט JSON מובנה.
    `;
  }

  // Parse recommendations from AI response
  private parseRecommendations(data: string): AIRecommendation[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = data.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: parse as structured text
      return this.parseStructuredText(data, 'recommendation');
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
      return [];
    }
  }

  // Parse insights from AI response
  private parseInsights(data: string): AIInsight[] {
    try {
      const jsonMatch = data.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.parseStructuredText(data, 'insight');
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return [];
    }
  }

  // Parse analysis from AI response
  private parseAnalysis(data: string): AIAnalysisResult {
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        summary: data,
        rootCauses: [],
        solutions: [],
        priorities: [],
        expectedImpact: {},
      };
    } catch (error) {
      console.error('Failed to parse analysis:', error);
      return {
        summary: data,
        rootCauses: [],
        solutions: [],
        priorities: [],
        expectedImpact: {},
      };
    }
  }

  // Parse structured text response
  private parseStructuredText(
    text: string,
    type: 'recommendation' | 'insight'
  ): any[] {
    const lines = text.split('\n').filter((line) => line.trim());
    const results: any[] = [];
    let current: any = {};

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        if (Object.keys(current).length > 0) {
          results.push(current);
        }
        current =
          type === 'recommendation'
            ? {
                title: line.replace(/^\d+\./, '').trim(),
                description: '',
                priority: 'medium',
                effort: 'medium',
                estimatedValue: 0,
                module: 'general',
              }
            : {
                type: 'opportunity',
                title: line.replace(/^\d+\./, '').trim(),
                description: '',
                impact: 'medium',
                actionable: true,
                relatedModules: [],
              };
      } else if (current.title) {
        current.description += line + ' ';
      }
    }

    if (Object.keys(current).length > 0) {
      results.push(current);
    }

    return results;
  }

  // Generate local recommendations (fallback)
  private generateLocalRecommendations(
    meeting: Meeting,
    _module?: string
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Analyze each module for potential recommendations
    if (meeting.modules.leadsAndSales) {
      const { speedToLead, followUp } = meeting.modules.leadsAndSales;

      if (speedToLead && speedToLead > 60) {
        recommendations.push({
          title: 'שיפור זמן תגובה ללידים',
          description: 'הטמעת מערכת אוטומטית לחלוקת לידים ותגובה מהירה',
          priority: 'high',
          effort: 'medium',
          estimatedValue: 15000,
          module: 'leadsAndSales',
          confidence: 0.85,
        });
      }

      if (!followUp || followUp.manual) {
        recommendations.push({
          title: 'אוטומציה של תהליכי מעקב',
          description: 'הגדרת רצפי מעקב אוטומטיים עם תזכורות ותבניות',
          priority: 'medium',
          effort: 'low',
          estimatedValue: 8000,
          module: 'leadsAndSales',
          confidence: 0.9,
        });
      }
    }

    if (meeting.modules.customerService) {
      const { automationLevel } = meeting.modules.customerService;

      if (automationLevel === 'low' || !automationLevel) {
        recommendations.push({
          title: "הטמעת צ'אטבוט לשירות לקוחות",
          description: 'בוט חכם שיכול לטפל ב-60% מהפניות הנפוצות',
          priority: 'high',
          effort: 'medium',
          estimatedValue: 20000,
          module: 'customerService',
          confidence: 0.8,
        });
      }
    }

    if (meeting.modules.operations) {
      const { bottlenecks } = meeting.modules.operations;

      if (bottlenecks && bottlenecks.length > 0) {
        recommendations.push({
          title: 'אופטימיזציה של תהליכים תפעוליים',
          description: 'זיהוי וסילוק צווארי בקבוק בתהליכים קריטיים',
          priority: 'critical',
          effort: 'high',
          estimatedValue: 30000,
          module: 'operations',
          confidence: 0.75,
        });
      }
    }

    if (meeting.modules.reporting) {
      const { dashboards } = meeting.modules.reporting;

      if (!dashboards || dashboards.manual) {
        recommendations.push({
          title: 'הקמת דשבורדים אוטומטיים',
          description: 'דשבורדים דינמיים עם עדכון בזמן אמת',
          priority: 'medium',
          effort: 'medium',
          estimatedValue: 12000,
          module: 'reporting',
          confidence: 0.85,
        });
      }
    }

    // Add general recommendations based on pain points
    if (meeting.painPoints && meeting.painPoints.length > 0) {
      const criticalPainPoints = meeting.painPoints.filter(
        (p) => p.severity === 'critical'
      );

      if (criticalPainPoints.length > 0) {
        recommendations.push({
          title: 'טיפול בנקודות כאב קריטיות',
          description: `זוהו ${criticalPainPoints.length} נקודות כאב קריטיות הדורשות טיפול מיידי`,
          priority: 'critical',
          effort: 'high',
          estimatedValue: criticalPainPoints.length * 10000,
          module: 'general',
          confidence: 0.95,
        });
      }
    }

    return recommendations;
  }

  // Generate local insights (fallback)
  private generateLocalInsights(meeting: Meeting): AIInsight[] {
    const insights: AIInsight[] = [];

    // Analyze overall digital maturity
    const modules = Object.keys(meeting.modules).filter(
      (key) =>
        meeting.modules[key] && Object.keys(meeting.modules[key]).length > 0
    );

    insights.push({
      type: 'trend',
      title: 'רמת בשלות דיגיטלית',
      description: `הארגון השלים ${modules.length} מתוך 9 מודולי הערכה`,
      impact: modules.length < 5 ? 'high' : 'medium',
      actionable: true,
      relatedModules: modules,
      confidence: 0.9,
      dataPoints: { completedModules: modules.length, totalModules: 9 },
    });

    // Identify automation opportunities
    let automationOpportunities = 0;
    if (meeting.modules.leadsAndSales?.followUp?.manual)
      automationOpportunities++;
    if (meeting.modules.customerService?.automationLevel === 'low')
      automationOpportunities++;
    if (meeting.modules.reporting?.dashboards?.manual)
      automationOpportunities++;

    if (automationOpportunities > 0) {
      insights.push({
        type: 'opportunity',
        title: 'פוטנציאל אוטומציה גבוה',
        description: `זוהו ${automationOpportunities} תחומים עם פוטנציאל אוטומציה משמעותי`,
        impact: 'high',
        actionable: true,
        relatedModules: ['leadsAndSales', 'customerService', 'reporting'],
        confidence: 0.85,
      });
    }

    // Risk analysis
    if (
      meeting.painPoints &&
      meeting.painPoints.filter((p) => p.severity === 'critical').length > 2
    ) {
      insights.push({
        type: 'risk',
        title: 'ריבוי נקודות כאב קריטיות',
        description: 'מספר גבוה של בעיות קריטיות עלול להשפיע על ביצועים עסקיים',
        impact: 'high',
        actionable: true,
        relatedModules: [],
        confidence: 0.95,
      });
    }

    return insights;
  }

  // Analyze local pain points (fallback)
  private analyzeLocalPainPoints(painPoints: PainPoint[]): AIAnalysisResult {
    const grouped = this.groupPainPointsByModule(painPoints);
    const rootCauses: string[] = [];
    const solutions: string[] = [];
    const priorities: string[] = [];

    // Identify patterns
    if (grouped.leadsAndSales?.length > 2) {
      rootCauses.push('תהליכי מכירות לא מאורגנים');
      solutions.push('הטמעת CRM מתקדם עם אוטומציות');
      priorities.push('שיפור תהליכי מכירות - עדיפות גבוהה');
    }

    if (grouped.customerService?.length > 2) {
      rootCauses.push('חוסר במערכות תמיכה אוטומטיות');
      solutions.push('הקמת מרכז שירות דיגיטלי');
      priorities.push('שדרוג שירות לקוחות - עדיפות בינונית');
    }

    const criticalCount = painPoints.filter(
      (p) => p.severity === 'critical'
    ).length;
    if (criticalCount > 0) {
      priorities.unshift(
        `טיפול ב-${criticalCount} בעיות קריטיות - עדיפות מיידית`
      );
    }

    return {
      summary: `נותחו ${painPoints.length} נקודות כאב. ${criticalCount} מהן קריטיות.`,
      rootCauses,
      solutions,
      priorities,
      expectedImpact: {
        timeSaving: '20-30 שעות בחודש',
        costSaving: '15,000-25,000 ₪ בחודש',
        efficiencyGain: '35-45%',
      },
    };
  }

  // Group pain points by module
  private groupPainPointsByModule(
    painPoints: PainPoint[]
  ): Record<string, PainPoint[]> {
    return painPoints.reduce(
      (acc, point) => {
        const module = point.module || 'general';
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push(point);
        return acc;
      },
      {} as Record<string, PainPoint[]>
    );
  }

  // Cache management
  private getFromCache(key: string): any | null {
    if (!this.config?.enableCache) return null;

    const cached = this.cache.get(key);
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
      if (!isExpired) {
        return cached.data;
      }
      this.cache.delete(key);
    }
    return null;
  }

  private saveToCache(key: string, data: any): void {
    if (!this.config?.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Rate limiting
  private async checkRateLimit(): Promise<void> {
    if (!this.config?.rateLimitPerMinute) return;

    // Simple rate limiting implementation
    // In production, use a more sophisticated approach
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests from queue
    this.requestQueue = this.requestQueue.filter(
      (r) => r.timestamp > oneMinuteAgo
    );

    // Check if we're at the limit
    if (this.requestQueue.length >= this.config.rateLimitPerMinute) {
      const oldestRequest = this.requestQueue[0];
      const waitTime = 60000 - (now - oldestRequest.timestamp);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Add current request to queue
    this.requestQueue.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now,
      prompt: '',
      provider: this.provider,
    });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  // Test AI connection
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    provider: string;
  }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: 'AI service is not configured',
        provider: this.provider,
      };
    }

    try {
      const response = await this.callAI('Say "Hello" in Hebrew');
      return {
        success: response.success,
        message: response.success
          ? 'Connection successful'
          : response.error || 'Connection failed',
        provider: this.provider,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Connection test failed',
        provider: this.provider,
      };
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
