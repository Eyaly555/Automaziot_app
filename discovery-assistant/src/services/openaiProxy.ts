/**
 * OpenAI Proxy Service
 * Proxies OpenAI API calls through our server to avoid exposing API keys in the browser
 */

interface OpenAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
}

interface OpenAIMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  seed: number;
  max_output_tokens: number;
  temperature: number;
  response_format: {
    type: 'json_schema';
    json_schema: any;
  };
}

/**
 * Call OpenAI Responses API through our server proxy
 */
export async function callOpenAIThroughProxy(request: OpenAIRequest): Promise<OpenAIResponse> {
  try {
    const response = await fetch('/api/openai/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Server error: ${response.status} ${response.statusText} - ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.output_text,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
      model: data.model,
    };
  } catch (error) {
    console.error('OpenAI proxy call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Test OpenAI connection through proxy
 */
export async function testOpenAIConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/openai/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Say "Hello" in Hebrew',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText} - ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Connection successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}
