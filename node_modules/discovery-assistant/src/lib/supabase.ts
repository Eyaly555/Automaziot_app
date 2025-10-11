import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// These will be replaced with actual values when Supabase project is created
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug: Log env vars to console in development
if (import.meta.env.DEV) {
  console.log('Supabase URL from env:', supabaseUrl ? 'Set' : 'Not set');
  console.log('Supabase Key from env:', supabaseAnonKey ? 'Set' : 'Not set');
}

// Fallback for when env vars are not loaded
const finalSupabaseUrl = supabaseUrl || 'https://your-project.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'your-anon-key';

// Global singleton pattern to prevent multiple instances
declare global {
  interface Window {
    __SUPABASE_CLIENT__?: ReturnType<typeof createClient<Database>>;
  }
}

// Create singleton Supabase client
export const supabase = (() => {
  if (typeof window !== 'undefined' && window.__SUPABASE_CLIENT__) {
    return window.__SUPABASE_CLIENT__;
  }

  const client = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  if (typeof window !== 'undefined') {
    window.__SUPABASE_CLIENT__ = client;
  }

  return client;
})();

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  // Check if the environment variables are actually set (not the fallbacks)
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    hasUrl &&
    hasKey &&
    finalSupabaseUrl !== 'https://your-project.supabase.co' &&
    finalSupabaseAnonKey !== 'your-anon-key' &&
    finalSupabaseUrl.startsWith('https://') &&
    finalSupabaseAnonKey.length > 30
  );
};

// Error handling wrapper for Supabase operations
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.details) {
    return error.details;
  }
  if (error?.hint) {
    return error.hint;
  }
  return 'אירעה שגיאה בחיבור לשרת';
};

// Check connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
};

// Realtime channel management
export const createRealtimeChannel = (channelName: string) => {
  return supabase.channel(channelName, {
    config: {
      broadcast: {
        self: false,
        ack: false
      },
      presence: {
        key: ''
      }
    }
  });
};

// Storage helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ url?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    return { error: handleSupabaseError(error) };
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrlData.publicUrl };
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true };
};

// Database helpers with optimistic updates
export const optimisticUpdate = async <T>(
  table: string,
  id: string,
  updates: Partial<T>,
  localUpdate: () => void,
  rollback: () => void
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    // If Supabase is not configured, just do local update
    localUpdate();
    return { success: true };
  }

  // Apply optimistic update locally
  localUpdate();

  try {
    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id);

    if (error) {
      // Rollback on error
      rollback();
      return { success: false, error: handleSupabaseError(error) };
    }

    return { success: true };
  } catch (err) {
    // Rollback on error
    rollback();
    return { success: false, error: 'Network error' };
  }
};

// Batch operations
export const batchInsert = async <T>(
  table: string,
  items: T[]
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { error } = await supabase
    .from(table)
    .insert(items);

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true };
};

// Query builder helpers
export const createQuery = (table: string) => {
  return supabase.from(table);
};

// Auth helpers
export const signIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true, user: data.user };
};

export const signUp = async (
  email: string,
  password: string,
  metadata?: any
): Promise<{ success: boolean; error?: string; user?: any }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true, user: data.user };
};

export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true };
};

export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error) };
  }

  return { success: true };
};

// Session management
export const getSession = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const { data } = supabase.auth.onAuthStateChange(callback);
  // data contains { subscription } where subscription has the unsubscribe method
  return { unsubscribe: () => data.subscription.unsubscribe() };
};