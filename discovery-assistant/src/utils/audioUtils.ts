import type {
  AudioFile,
  AudioValidationResult,
  SupportedAudioFormat,
} from '../types/conversation';

// Maximum file size: 25MB (OpenAI's limit)
export const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024;

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS: SupportedAudioFormat[] = [
  'mp3',
  'mp4',
  'mpeg',
  'mpga',
  'm4a',
  'wav',
  'webm',
  'ogg',
  'flac',
];

// MIME types mapping
export const AUDIO_MIME_TYPES: Record<string, SupportedAudioFormat> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
  'video/mp4': 'mp4', // MP4 can contain audio
  'video/webm': 'webm', // WebM can contain audio
};

/**
 * Validates an audio file for transcription
 */
export function validateAudioFile(file: File): AudioValidationResult {
  const warnings: string[] = [];

  // Check file size
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'הקובץ ריק',
    };
  }

  if (file.size > MAX_AUDIO_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `הקובץ גדול מדי (${sizeMB}MB). הגודל המקסימלי המותר הוא 25MB`,
    };
  }

  // Check file format by extension
  const extension = getFileExtension(file.name);
  if (
    !extension ||
    !SUPPORTED_AUDIO_FORMATS.includes(extension as SupportedAudioFormat)
  ) {
    return {
      isValid: false,
      error: `פורמט הקובץ .${extension || 'unknown'} אינו נתמך. פורמטים נתמכים: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`,
    };
  }

  // Check MIME type
  if (file.type && !AUDIO_MIME_TYPES[file.type]) {
    warnings.push(
      `סוג MIME ${file.type} לא מוכר, אך הסיומת ${extension} נתמכת`
    );
  }

  // Info: File will be automatically converted if needed (>4MB)
  if (file.size > 4 * 1024 * 1024 && file.size <= 20 * 1024 * 1024) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    warnings.push(
      `ℹ️ הקובץ גדול (${sizeMB}MB) - המערכת תמיר אותו אוטומטית לפורמט קל לפני העלאה (זמן המרה משוער: ~30-60 שניות).`
    );
  }

  // Warn if file is very large (>20MB)
  if (file.size > 20 * 1024 * 1024) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    warnings.push(
      `⚠️ הקובץ גדול מאוד (${sizeMB}MB) - ההמרה והתמלול עשויים לקחת מספר דקות.`
    );
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Checks if an audio file requires conversion due to its format.
 * Conversion is required if the format is not one of the directly supported ones.
 * This is a placeholder for a more robust check, as currently all supported formats are listed.
 * We might add formats here that we can convert FROM but are not directly supported by the API.
 * For now, we assume any validly recognized format is supported.
 * The primary trigger for conversion will be file size.
 * @param file The file to check.
 * @returns boolean indicating if conversion is required.
 */
export function isConversionRequired(file: File): boolean {
  const extension = getFileExtension(file.name);
  if (!extension) return true; // Convert if no extension

  // If the extension is not in our list of supported formats, it needs conversion.
  // This helps catch formats that are valid audio but not on our list.
  return !SUPPORTED_AUDIO_FORMATS.includes(extension as SupportedAudioFormat);
}

/**
 * Creates an AudioFile object from a File
 */
export function createAudioFile(file: File): AudioFile {
  return {
    file,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string | null {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formats duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Checks if a file is a supported audio format
 */
export function isSupportedAudioFormat(filename: string): boolean {
  const extension = getFileExtension(filename);
  return extension
    ? SUPPORTED_AUDIO_FORMATS.includes(extension as SupportedAudioFormat)
    : false;
}

/**
 * Gets a user-friendly error message for common validation errors
 */
export function getValidationErrorMessage(error: string | undefined): string {
  if (!error) return '';

  // Already in Hebrew from validateAudioFile
  return error;
}

/**
 * Estimates transcription time based on file size
 * This is a rough estimate - actual time depends on audio length and API load
 */
export function estimateTranscriptionTime(fileSize: number): number {
  // Rough estimate: ~1-2 seconds per MB
  const sizeMB = fileSize / (1024 * 1024);
  return Math.ceil(sizeMB * 1.5);
}
