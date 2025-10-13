import type {
  AudioFile,
  TranscriptionResult,
  TranscriptionOptions,
  AnalysisResult,
  ConversationAnalysisResult
} from '../types/conversation';

/**
 * Transcribes an audio file using OpenAI API
 */
export async function transcribeAudio(
  audioFile: AudioFile,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('audio', audioFile.file);

  // Add optional parameters
  if (options.model) {
    formData.append('model', options.model);
  }
  if (options.language) {
    formData.append('language', options.language);
  }
  if (options.prompt) {
    formData.append('prompt', options.prompt);
  }
  if (options.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  const response = await fetch('/api/audio/transcribe', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Transcription failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result as TranscriptionResult;
}

/**
 * Analyzes a conversation transcript using Claude AI
 */
export async function analyzeConversation(
  transcript: string,
  language: string = 'he'
): Promise<AnalysisResult> {
  const response = await fetch('/api/conversation/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transcript,
      language
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result as AnalysisResult;
}

/**
 * Complete conversation analysis pipeline:
 * 1. Transcribe audio file
 * 2. Analyze transcript
 * 3. Return complete results
 */
export async function analyzeAudioConversation(
  audioFile: AudioFile,
  transcriptionOptions: TranscriptionOptions = {},
  onProgress?: (stage: 'transcribing' | 'analyzing', progress: number) => void
): Promise<ConversationAnalysisResult> {
  try {
    // Step 1: Transcribe audio
    onProgress?.('transcribing', 0);
    const transcription = await transcribeAudio(audioFile, transcriptionOptions);
    onProgress?.('transcribing', 100);

    // Step 2: Analyze transcript
    onProgress?.('analyzing', 0);
    const analysis = await analyzeConversation(transcription.text, transcription.language);
    onProgress?.('analyzing', 100);

    // Return complete result
    return {
      audioFile,
      transcription,
      analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Conversation analysis pipeline error:', error);
    throw error;
  }
}

/**
 * Validates API configuration
 */
export async function validateAPIConfiguration(): Promise<{
  openai: boolean;
  anthropic: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let openaiConfigured = false;
  let anthropicConfigured = false;

  // Test OpenAI configuration
  try {
    const testFormData = new FormData();
    const testBlob = new Blob(['test'], { type: 'audio/mpeg' });
    const testFile = new File([testBlob], 'test.mp3', { type: 'audio/mpeg' });
    testFormData.append('audio', testFile);

    const openaiResponse = await fetch('/api/audio/transcribe', {
      method: 'POST',
      body: testFormData
    });

    if (openaiResponse.status !== 400) { // 400 is expected for invalid audio, but confirms API is configured
      const data = await openaiResponse.json();
      if (data.error && data.error.includes('not configured')) {
        errors.push('OpenAI API key not configured');
      } else {
        openaiConfigured = true;
      }
    } else {
      openaiConfigured = true; // API is configured, just rejected our test file
    }
  } catch (error) {
    errors.push(`OpenAI API test failed: ${error}`);
  }

  // Test Anthropic configuration
  try {
    const anthropicResponse = await fetch('/api/conversation/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transcript: 'test'
      })
    });

    if (anthropicResponse.status !== 500) {
      const data = await anthropicResponse.json();
      if (data.error && data.error.includes('not configured')) {
        errors.push('Anthropic API key not configured');
      } else {
        anthropicConfigured = true;
      }
    } else {
      const data = await anthropicResponse.json();
      if (data.error && data.error.includes('not configured')) {
        errors.push('Anthropic API key not configured');
      } else {
        anthropicConfigured = true;
      }
    }
  } catch (error) {
    errors.push(`Anthropic API test failed: ${error}`);
  }

  return {
    openai: openaiConfigured,
    anthropic: anthropicConfigured,
    errors
  };
}

/**
 * Gets estimated processing time for an audio file
 */
export function getEstimatedProcessingTime(fileSizeMB: number): {
  transcription: number;
  analysis: number;
  total: number;
} {
  // Rough estimates in seconds
  const transcription = Math.ceil(fileSizeMB * 1.5); // ~1.5 seconds per MB
  const analysis = 5; // Claude analysis typically takes 3-7 seconds
  const total = transcription + analysis;

  return {
    transcription,
    analysis,
    total
  };
}
