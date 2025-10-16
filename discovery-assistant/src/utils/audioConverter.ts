import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton instance of FFmpeg, managed via a promise to prevent race conditions
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

/**
 * Gets or creates the FFmpeg instance in a race-condition-safe way.
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = new Promise(async (resolve, reject) => {
      const ffmpeg = new FFmpeg();
      try {
        const baseURL = '/ffmpeg-core';
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          ),
        });
        resolve(ffmpeg);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        ffmpegLoadPromise = null; // Reset for a potential retry
        reject(new Error('Failed to initialize audio converter.'));
      }
    });
  }
  return ffmpegLoadPromise;
}

/**
 * Converts an audio file to lightweight MP3 if necessary (due to size or format).
 *
 * @param file - The original audio file
 * @param onProgress - Progress callback (0-100)
 * @returns Converted MP3 file
 */
export async function convertAudio(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  try {
    const ffmpeg = await getFFmpeg();

    // Detach old listeners to prevent multiple triggers
    ffmpeg.off('progress');

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    const inputFileName = `input.${getFileExtension(file.name) || 'bin'}`;
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    const outputFileName = 'output.mp3';

    // Lightweight MP3 settings
    const ffmpegArgs = [
      '-i',
      inputFileName,
      '-b:a',
      '64k', // Audio bitrate 64kbps
      '-ar',
      '16000', // Sample rate 16kHz
      '-ac',
      '1', // Mono audio
      '-f',
      'mp3', // Output format MP3
      outputFileName,
    ];

    await ffmpeg.exec(ffmpegArgs);

    const data = await ffmpeg.readFile(outputFileName);

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
 * Checks if a file needs conversion due to size.
 */
export function shouldConvertForSize(file: File): boolean {
  const MAX_SIZE_WITHOUT_CONVERSION = 4 * 1024 * 1024; // 4MB
  return file.size > MAX_SIZE_WITHOUT_CONVERSION;
}

/**
 * Gets file extension from filename
 */
function getFileExtension(filename: string): string | null {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
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
export function getCompressionRatio(
  originalSize: number,
  convertedSize: number
): number {
  return Math.round((1 - convertedSize / originalSize) * 100);
}
