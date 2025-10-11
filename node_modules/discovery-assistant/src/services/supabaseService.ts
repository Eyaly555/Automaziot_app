/**
 * Supabase Service
 * Simple wrapper for saving/loading Meeting data to Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Meeting } from '../types';

// Get Supabase config from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client (null if not configured)
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[Supabase] Client initialized');
} else {
  console.warn('[Supabase] Not configured - will use localStorage only');
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * Supabase service for meeting data
 */
export const supabaseService = {
  /**
   * Save complete meeting to Supabase
   * Uses upsert to create or update
   */
  async saveMeeting(meeting: Meeting): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const zohoRecordId = meeting.zohoIntegration?.recordId;

      if (!zohoRecordId) {
        return { success: false, error: 'No Zoho record ID' };
      }

      console.log('[Supabase] Saving meeting:', {
        zohoRecordId,
        clientName: meeting.clientName,
        phase: meeting.phase
      });

      const { error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .upsert({
          zoho_record_id: zohoRecordId,
          meeting_json: meeting as any, // Supabase handles JSON serialization
        }, {
          onConflict: 'zoho_record_id' // Update if exists, insert if not
        })
        .select();

      if (error) {
        console.error('[Supabase] Save error:', error);
        throw error;
      }

      console.log('[Supabase] Save successful');
      return { success: true };
    } catch (error: any) {
      console.error('[Supabase] Save error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  },

  /**
   * Load meeting from Supabase by Zoho record ID
   */
  async loadMeeting(zohoRecordId: string): Promise<Meeting | null> {
    if (!supabase) {
      console.warn('[Supabase] Not configured');
      return null;
    }

    try {
      console.log('[Supabase] Loading meeting:', zohoRecordId);

      const { data, error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .select('meeting_json')
        .eq('zoho_record_id', zohoRecordId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - this is OK, means it's a new client
          console.log('[Supabase] No meeting found (new client)');
          return null;
        }
        console.error('[Supabase] Load error:', error);
        throw error;
      }

      if (!data || !data.meeting_json) {
        console.log('[Supabase] No data found');
        return null;
      }

      console.log('[Supabase] Load successful:', {
        clientName: data.meeting_json.clientName,
        phase: data.meeting_json.phase
      });

      // Return the meeting JSON directly
      return data.meeting_json as Meeting;
    } catch (error: any) {
      console.error('[Supabase] Load error:', error);
      return null;
    }
  },

  /**
   * Delete meeting from Supabase
   */
  async deleteMeeting(zohoRecordId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      console.log('[Supabase] Deleting meeting:', zohoRecordId);

      const { error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .delete()
        .eq('zoho_record_id', zohoRecordId);

      if (error) {
        console.error('[Supabase] Delete error:', error);
        throw error;
      }

      console.log('[Supabase] Delete successful');
      return { success: true };
    } catch (error: any) {
      console.error('[Supabase] Delete error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  },

  /**
   * Search meetings by client name
   */
  async searchMeetings(query: string): Promise<Meeting[]> {
    if (!supabase) {
      return [];
    }

    try {
      console.log('[Supabase] Searching meetings:', query);

      const { data, error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .select('meeting_json')
        .ilike('meeting_json->>clientName', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Search error:', error);
        throw error;
      }

      console.log('[Supabase] Search results:', data?.length || 0);

      return data?.map(row => row.meeting_json as Meeting) || [];
    } catch (error: any) {
      console.error('[Supabase] Search error:', error);
      return [];
    }
  },

  /**
   * Get all meetings (with optional limit)
   */
  async getAllMeetings(limit: number = 100): Promise<Meeting[]> {
    if (!supabase) {
      return [];
    }

    try {
      console.log('[Supabase] Getting all meetings (limit:', limit, ')');

      const { data, error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .select('meeting_json')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Supabase] Get all error:', error);
        throw error;
      }

      console.log('[Supabase] Retrieved meetings:', data?.length || 0);

      return data?.map(row => row.meeting_json as Meeting) || [];
    } catch (error: any) {
      console.error('[Supabase] Get all error:', error);
      return [];
    }
  },

  /**
   * Get meetings by phase
   */
  async getMeetingsByPhase(phase: string): Promise<Meeting[]> {
    if (!supabase) {
      return [];
    }

    try {
      console.log('[Supabase] Getting meetings by phase:', phase);

      const { data, error } = await supabase
        .schema('automaziot')
        .from('meetings')
        .select('meeting_json')
        .eq('meeting_json->>phase', phase)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Get by phase error:', error);
        throw error;
      }

      console.log('[Supabase] Retrieved meetings:', data?.length || 0);

      return data?.map(row => row.meeting_json as Meeting) || [];
    } catch (error: any) {
      console.error('[Supabase] Get by phase error:', error);
      return [];
    }
  }
};

// Export the client for advanced usage
export { supabase };
