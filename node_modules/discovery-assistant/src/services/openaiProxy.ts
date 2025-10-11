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
  seed?: number; // Optional - not all models support seed
  max_output_tokens: number;
  temperature?: number; // Optional - newer models may not support custom temperature
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
    // Build request body dynamically, excluding undefined optional parameters
    const requestBody: any = {
      model: request.model,
      messages: request.messages,
      max_output_tokens: request.max_output_tokens,
      response_format: request.response_format
    };

    // Add optional parameters only if provided
    if (request.seed !== undefined) {
      requestBody.seed = request.seed;
    }

    if (request.temperature !== undefined) {
      requestBody.temperature = request.temperature;
    }

    const response = await fetch('/api/openai/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
      data: data.choices?.[0]?.message?.content || data.output_text,
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
