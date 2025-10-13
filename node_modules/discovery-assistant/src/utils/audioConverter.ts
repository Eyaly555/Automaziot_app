import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton instance of FFmpeg
let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoaded = false;

/**
 * Gets or creates the FFmpeg instance
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }

  if (!isFFmpegLoaded) {
    // Load FFmpeg with progress tracking
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isFFmpegLoaded = true;
  }

  return ffmpegInstance;
}

/**
 * Estimates the output file size after conversion
 */
export function estimateConvertedSize(durationSeconds: number, bitrateKbps: number = 64): number {
  // Formula: (bitrate in kbps * duration in seconds) / 8 = size in KB
  const sizeKB = (bitrateKbps * durationSeconds) / 8;
  return sizeKB * 1024; // Convert to bytes
}

/**
 * Converts an audio file to lightweight MP3 format
 * This reduces file size significantly for large audio files
 *
 * @param file - The original audio file
 * @param onProgress - Progress callback (0-100)
 * @returns Converted MP3 file
 */
export async function convertToLightweightMP3(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    const ffmpeg = await getFFmpeg();

    // Set up progress listener
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        // FFmpeg reports progress as 0-1, convert to 0-100
        onProgress(Math.round(progress * 100));
      });
    }

    // Write input file to FFmpeg virtual file system
    const inputFileName = 'input.' + getFileExtension(file.name);
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    onProgress?.(10);

    // Convert to lightweight MP3
    // -b:a 64k = audio bitrate 64kbps (very light)
    // -ar 16000 = sample rate 16kHz (sufficient for speech)
    // -ac 1 = mono (speech doesn't need stereo)
    await ffmpeg.exec([
      '-i', inputFileName,
      '-b:a', '64k',
      '-ar', '16000',
      '-ac', '1',
      '-f', 'mp3',
      'output.mp3'
    ]);

    onProgress?.(90);

    // Read the converted file
    const data = await ffmpeg.readFile('output.mp3');

    // Clean up virtual file system
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile('output.mp3');

    // Create new File object
    const convertedFile = new File(
      [data],
      file.name.replace(/\.[^/.]+$/, '') + '_converted.mp3',
      { type: 'audio/mpeg' }
    );

    onProgress?.(100);

    return convertedFile;
  } catch (error) {
    console.error('Audio conversion error:', error);
    throw new Error('שגיאה בהמרת הקובץ. אנא נסה שוב או השתמש בקובץ MP3 מוכן.');
  }
}

/**
 * Checks if a file needs conversion
 * Returns true if file is too large and would benefit from conversion
 */
export function shouldConvertFile(file: File): boolean {
  const MAX_SIZE_WITHOUT_CONVERSION = 4 * 1024 * 1024; // 4MB
  return file.size > MAX_SIZE_WITHOUT_CONVERSION;
}

/**
 * Gets file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'mp3';
}

/**
 * Formats conversion progress message
 */
export function getConversionMessage(progress: number): string {
  if (progress < 10) {
    return 'מכין את כלי ההמרה...';
  } else if (progress < 90) {
    return `ממיר את הקובץ לפורמט קל... ${progress}%`;
  } else {
    return 'משלים המרה...';
  }
}

/**
 * Gets estimated conversion time based on file size
 */
export function estimateConversionTime(fileSizeMB: number): number {
  // Rough estimate: ~2-4 seconds per MB
  return Math.ceil(fileSizeMB * 3);
}

/**
 * Calculates compression ratio
 */
export function getCompressionRatio(originalSize: number, convertedSize: number): number {
  return Math.round((1 - (convertedSize / originalSize)) * 100);
}
