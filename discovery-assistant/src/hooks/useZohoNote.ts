import { useState, useCallback } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import {
  generateContextualNote,
  type NoteContextType,
  type NoteGenerationContext,
} from '../utils/zohoNoteGenerator';
import type { Modules } from '../types';

/**
 * Custom hook for managing Zoho note composer state
 *
 * Features:
 * - Auto-generates note content based on context
 * - Manages modal open/close state
 * - Provides current note title and content
 *
 * @param contextType - The type of context for the note
 * @param options - Additional options for note generation
 */
export function useZohoNote(
  contextType: NoteContextType,
  options?: {
    moduleId?: keyof Modules;
    specificId?: string;
    additionalData?: any;
  }
) {
  const { currentMeeting } = useMeetingStore();
  const [isOpen, setIsOpen] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<{
    title: string;
    content: string;
  } | null>(null);

  /**
   * Open the note composer with generated content
   */
  const openComposer = useCallback(() => {
    if (!currentMeeting) {
      console.warn('[useZohoNote] No current meeting found');
      return;
    }

    // Generate note content based on context
    const context: NoteGenerationContext = {
      contextType,
      meeting: currentMeeting,
      moduleId: options?.moduleId,
      specificId: options?.specificId,
      moduleData: options?.moduleId
        ? currentMeeting.modules[options.moduleId]
        : undefined,
      additionalData: options?.additionalData,
    };

    const note = generateContextualNote(context);
    setGeneratedNote(note);
    setIsOpen(true);
  }, [contextType, currentMeeting, options]);

  /**
   * Close the note composer
   */
  const closeComposer = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Handle successful note send
   */
  const handleSuccess = useCallback(() => {
    console.log('[useZohoNote] Note sent successfully');
    // Could add toast notification here
  }, []);

  return {
    isOpen,
    suggestedTitle: generatedNote?.title || '',
    suggestedContent: generatedNote?.content || '',
    openComposer,
    closeComposer,
    handleSuccess,
  };
}
