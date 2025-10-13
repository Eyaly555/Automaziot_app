import type {
  OverviewModule,
  LeadsAndSalesModule,
  CustomerServiceModule,
  AIAgentsModule,
  ROIModule
} from './index';

/**
 * Audio file information
 */
export interface AudioFile {
  file: File;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
}

/**
 * Audio file validation result
 */
export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Supported audio formats for OpenAI transcription
 */
export type SupportedAudioFormat = 'mp3' | 'mp4' | 'mpeg' | 'mpga' | 'm4a' | 'wav' | 'webm';

/**
 * OpenAI transcription models
 */
export type TranscriptionModel = 'whisper-1' | 'gpt-4o-mini-transcribe' | 'gpt-4o-transcribe';

/**
 * Transcription request options
 */
export interface TranscriptionOptions {
  model?: TranscriptionModel;
  language?: string; // ISO-639-1 format (e.g., 'he' for Hebrew)
  prompt?: string;
  temperature?: number;
}

/**
 * Result from OpenAI transcription
 */
export interface TranscriptionResult {
  text: string;
  language: string;
  model: string;
  duration: number; // in seconds
  confidence?: number;
}

/**
 * Confidence level for extracted fields
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Extracted fields from conversation analysis
 */
export interface ExtractedFields {
  overview?: Partial<OverviewModule>;
  leadsAndSales?: Partial<LeadsAndSalesModule>;
  customerService?: Partial<CustomerServiceModule>;
  aiAgents?: Partial<AIAgentsModule>;
  roi?: Partial<ROIModule>;
}

/**
 * Analysis result from Claude AI
 */
export interface AnalysisResult {
  summary: string;
  confidence: ConfidenceLevel;
  extractedFields: ExtractedFields;
  nextSteps: string[];
  rawAnalysis?: string;
}

/**
 * Complete conversation analysis pipeline result
 */
export interface ConversationAnalysisResult {
  audioFile: AudioFile;
  transcription: TranscriptionResult;
  analysis: AnalysisResult;
  timestamp: string; // ISO timestamp
}

/**
 * Field merge result for tracking what was filled
 */
export interface FieldMergeResult {
  moduleName: keyof ExtractedFields;
  fieldsFilled: string[];
  fieldsSkipped: string[];
  totalFields: number;
}

/**
 * Complete merge summary after applying all fields
 */
export interface MergeSummary {
  totalFieldsFilled: number;
  totalFieldsSkipped: number;
  moduleResults: FieldMergeResult[];
  timestamp: string;
}

/**
 * Processing status for UI feedback
 */
export type ProcessingStatus =
  | 'idle'
  | 'converting'
  | 'uploading'
  | 'transcribing'
  | 'analyzing'
  | 'previewing'
  | 'saving'
  | 'complete'
  | 'error';

/**
 * Processing state for the conversation analyzer
 */
export interface ProcessingState {
  status: ProcessingStatus;
  progress: number; // 0-100
  message: string;
  error?: string;
}
