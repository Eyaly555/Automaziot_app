import React, { useState, useCallback } from 'react';
import { Upload, FileAudio, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import type {
  AudioFile,
  ProcessingStatus,
  ConversationAnalysisResult,
  MergeSummary
} from '../../types/conversation';
import {
  validateAudioFile,
  createAudioFile,
  formatFileSize,
  formatDuration,
  isConversionRequired,
} from '../../utils/audioUtils';
import {
  mergeExtractedFields,
  getMergeDescription,
  formatMergeResults
} from '../../utils/fieldMergeUtils';
import {
  convertAudio,
  shouldConvertForSize,
  getConversionMessage,
} from '../../utils/audioConverter';
import { analyzeAudioConversation } from '../../services/conversationService';
import { createZohoNote } from '../../services/zohoAPI';
import { Card, Button } from '../Base';

interface ConversationAnalyzerProps {
  onClose?: () => void;
  onComplete?: () => void;
}

export const ConversationAnalyzer: React.FC<ConversationAnalyzerProps> = ({
  onClose,
  onComplete
}) => {
  const { currentMeeting, updateModule } = useMeetingStore();

  // State
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ConversationAnalysisResult | null>(null);
  const [mergeSummary, setMergeSummary] = useState<MergeSummary | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate the file
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'קובץ לא תקין');
      return;
    }

    // Show warnings if any (combine them into error for user to see)
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Audio file warnings:', validation.warnings);
      // Show warning as informational error
      const warningMessage = validation.warnings.join('\n');
      setError(warningMessage);

      // Still allow file to be selected
      const audio = createAudioFile(file);
      setAudioFile(audio);
      setProcessingStatus('idle');
      setAnalysisResult(null);
      setMergeSummary(null);
      return;
    }

    // Create audio file object
    const audio = createAudioFile(file);
    setAudioFile(audio);
    setProcessingStatus('idle');
    setAnalysisResult(null);
    setMergeSummary(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Process the audio file
  const handleProcess = useCallback(async () => {
    if (!audioFile || !currentMeeting) return;

    try {
      setError(null);
      setProgress(0);

      // Prepare the file for processing
      let fileToProcess = audioFile;

      // Check if file needs conversion (>4MB or unsupported format)
      const needsConversion =
        shouldConvertForSize(audioFile.file) || isConversionRequired(audioFile.file);

      if (needsConversion) {
        setProcessingStatus('converting');
        setStatusMessage('מכין את הקובץ להמרה...');

        console.log(
          `File size: ${(audioFile.fileSize / (1024 * 1024)).toFixed(
            2
          )}MB - Converting to lightweight MP3...`
        );

        // Convert file to lightweight MP3
        const convertedFile = await convertAudio(
          audioFile.file,
          (conversionProgress) => {
            setProgress(conversionProgress / 3); // 0-33% for conversion
            setStatusMessage(getConversionMessage(conversionProgress));
          }
        );

        console.log(`Converted size: ${(convertedFile.size / (1024 * 1024)).toFixed(2)}MB`);

        // Update the audio file with converted version
        fileToProcess = {
          ...audioFile,
          file: convertedFile,
          fileName: convertedFile.name,
          fileSize: convertedFile.size,
          mimeType: convertedFile.type
        };

        setProgress(33);
        setStatusMessage('המרה הושלמה בהצלחה');
      }

      // Transcribe and analyze
      setProcessingStatus('transcribing');
      setStatusMessage('מתמלל את הקובץ...');

      const result = await analyzeAudioConversation(
        fileToProcess,
        { language: 'he' }, // Default to Hebrew
        (stage, stageProgress) => {
          if (stage === 'transcribing') {
            setProcessingStatus('transcribing');
            // If we converted: 33-66%, if not: 0-50%
            const baseProgress = needsConversion ? 33 : 0;
            const progressRange = needsConversion ? 33 : 50;
            setProgress(baseProgress + (stageProgress * progressRange) / 100);
            setStatusMessage('מתמלל את הקובץ...');
          } else if (stage === 'analyzing') {
            setProcessingStatus('analyzing');
            // If we converted: 66-100%, if not: 50-100%
            const baseProgress = needsConversion ? 66 : 50;
            const progressRange = needsConversion ? 34 : 50;
            setProgress(baseProgress + (stageProgress * progressRange) / 100);
            setStatusMessage('מנתח את השיחה...');
          }
        }
      );

      setAnalysisResult(result);
      setProcessingStatus('previewing');
      setProgress(100);
      setStatusMessage('התמלול והניתוח הושלמו בהצלחה');

      // Calculate merge preview
      const { summary } = mergeExtractedFields(
        currentMeeting.modules,
        result.analysis.extractedFields
      );
      setMergeSummary(summary);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
      setProcessingStatus('error');
    }
  }, [audioFile, currentMeeting]);

  // Save the extracted fields
  const handleSave = useCallback(async () => {
    if (!analysisResult || !currentMeeting) return;

    try {
      setProcessingStatus('saving');
      setStatusMessage('שומר נתונים...');

      // Step 1: Save the complete analysis result to the meeting
      useMeetingStore.getState().updateMeeting({
        conversationAnalysis: analysisResult
      });

      // Step 2: Merge extracted fields into current modules
      const { updatedModules } = mergeExtractedFields(
        currentMeeting.modules,
        analysisResult.analysis.extractedFields
      );

      // Step 3: Update each modified module
      for (const [moduleName, moduleData] of Object.entries(updatedModules)) {
        updateModule(moduleName as any, moduleData);
      }

      // Step 4: Save summary as Zoho Note (if Zoho integration is enabled)
      if (currentMeeting.zohoIntegration?.recordId) {
        try {
          setStatusMessage('שומר סיכום ב-Zoho CRM...');
          
          // Format the note content (Option 3: Full transcript + summary)
          const noteTitle = `תמלול וסיכום שיחת גילוי - ${new Date().toLocaleDateString('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`;
          
          const noteContent = [
            '=== סיכום השיחה ===',
            analysisResult.analysis.summary,
            '',
            '=== תמלול מלא ===',
            analysisResult.transcription.text,
            '',
            `--- נוצר אוטומטית על ידי Discovery Assistant | ${new Date().toLocaleString('he-IL')}`
          ].join('\n');

          await createZohoNote(
            currentMeeting.zohoIntegration.recordId,
            noteTitle,
            noteContent,
            currentMeeting.zohoIntegration.module || 'Potentials1'
          );

          console.log('[ConversationAnalyzer] ✓ Zoho note created successfully');
        } catch (noteError) {
          // Don't fail the entire save if note creation fails
          console.error('[ConversationAnalyzer] ⚠️ Failed to create Zoho note:', noteError);
          // Note creation failure is not critical - data is still saved locally
          // User will see the success message for data save
        }
      }

      setProcessingStatus('complete');
      setStatusMessage('הנתונים נשמרו בהצלחה');

      // Call completion callback after a brief delay
      setTimeout(() => {
        onComplete?.();
      }, 1500);

    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת הנתונים');
      setProcessingStatus('error');
    }
  }, [analysisResult, currentMeeting, updateModule, onComplete]);

  // Reset state
  const handleReset = useCallback(() => {
    setAudioFile(null);
    setProcessingStatus('idle');
    setProgress(0);
    setStatusMessage('');
    setError(null);
    setAnalysisResult(null);
    setMergeSummary(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">ניתוח שיחת גילוי</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {!audioFile && processingStatus === 'idle' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                גרור קובץ אודיו לכאן או לחץ לבחירה
              </p>
              <p className="text-sm text-gray-500 mb-4">
                פורמטים נתמכים: MP3, MP4, WAV, WebM, M4A, OGG, FLAC (עד 25MB)
              </p>
              <input
                type="file"
                accept="audio/*,video/mp4,video/webm"
                onChange={handleFileInput}
                className="hidden"
                id="audio-file-input"
              />
              <label htmlFor="audio-file-input" className="inline-block cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                  <Upload className="w-4 h-4" />
                  בחר קובץ
                </span>
              </label>
            </div>
          )}

          {/* File Info */}
          {audioFile && processingStatus === 'idle' && (
            <Card title="קובץ נבחר">
              <div className="flex items-start gap-4">
                <FileAudio className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{audioFile.fileName}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(audioFile.fileSize)}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={handleProcess} variant="primary" size="md" className="flex-1">
                  התחל ניתוח
                </Button>
                <Button onClick={handleReset} variant="outline" size="md">
                  בטל
                </Button>
              </div>
            </Card>
          )}

          {/* Processing Status */}
          {(processingStatus === 'converting' || processingStatus === 'transcribing' || processingStatus === 'analyzing') && (
            <Card title="מעבד...">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm text-gray-700">{statusMessage}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {processingStatus === 'converting' && 'ממיר את הקובץ לפורמט קל...'}
                  {processingStatus === 'transcribing' && 'מתמלל את הקובץ...'}
                  {processingStatus === 'analyzing' && 'מנתח את השיחה...'}
                </p>
              </div>
            </Card>
          )}

          {/* Analysis Results Preview */}
          {analysisResult && processingStatus === 'previewing' && (
            <div className="space-y-4">
              <Card title="תוצאות ניתוח">
                <div className="space-y-4">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">סיכום השיחה:</h4>
                    <p className="text-sm text-gray-700">{analysisResult.analysis.summary}</p>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">רמת ביטחון:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        analysisResult.analysis.confidence === 'high'
                          ? 'bg-green-100 text-green-800'
                          : analysisResult.analysis.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysisResult.analysis.confidence === 'high'
                        ? 'גבוהה'
                        : analysisResult.analysis.confidence === 'medium'
                        ? 'בינונית'
                        : 'נמוכה'}
                    </span>
                  </div>

                  {/* Merge Summary */}
                  {mergeSummary && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">מה ימולא?</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        {getMergeDescription(mergeSummary)}
                      </p>
                      {mergeSummary.totalFieldsFilled > 0 && (
                        <div className="text-sm text-gray-600">
                          {formatMergeResults(mergeSummary).map((line, i) => (
                            <p key={i} className="mb-1">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Steps */}
                  {analysisResult.analysis.nextSteps.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">צעדים הבאים מומלצים:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {analysisResult.analysis.nextSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={mergeSummary?.totalFieldsFilled === 0}
                >
                  שמור שדות
                </Button>
                <Button onClick={handleReset} variant="outline" size="md">
                  נתח קובץ אחר
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {processingStatus === 'complete' && (
            <Card title="הצלחה!">
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  הנתונים נשמרו בהצלחה
                </p>
                <p className="text-sm text-gray-600">
                  {mergeSummary && getMergeDescription(mergeSummary)}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
