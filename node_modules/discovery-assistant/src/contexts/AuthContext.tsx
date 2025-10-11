import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword,
  getSession,
  getUser,
  onAuthStateChange
} from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseEnabled] = useState(() => isSupabaseConfigured());

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseEnabled) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, [isSupabaseEnabled]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseEnabled) {
        setLoading(false);
        return;
      }

      try {
        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isSupabaseEnabled, fetchProfile]);

  // Subscribe to auth changes
  useEffect(() => {
    if (!isSupabaseEnabled) return;

    const { unsubscribe } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isSupabaseEnabled, fetchProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      // Fallback for local development
      const mockUser = {
        id: 'local-user',
        email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: 'Local User' },
        aud: 'authenticated',
        role: 'authenticated'
      } as User;

      setUser(mockUser);
      return { success: true };
    }

    const result = await supabaseSignIn(email, password);

    if (result.success && result.user) {
      setUser(result.user);
      const profileData = await fetchProfile(result.user.id);
      setProfile(profileData);
    }

    return result;
  }, [isSupabaseEnabled, fetchProfile]);

  // Sign up
  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName?: string,
    company?: string
  ) => {
    if (!isSupabaseEnabled) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const metadata = {
      full_name: fullName,
      company_name: company
    };

    const result = await supabaseSignUp(email, password, metadata);

    if (result.success && result.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: result.user.id,
            email: result.user.email!,
            full_name: fullName || null,
            company_name: company || null
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      setUser(result.user);
      const profileData = await fetchProfile(result.user.id);
      setProfile(profileData);
    }

    return result;
  }, [isSupabaseEnabled, fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!isSupabaseEnabled) {
      setUser(null);
      setProfile(null);
      return;
    }

    await supabaseSignOut();
    setUser(null);
    setProfile(null);
  }, [isSupabaseEnabled]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseEnabled) {
      return { success: false, error: 'Supabase is not configured' };
    }

    return await supabaseResetPassword(email);
  }, [isSupabaseEnabled]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!isSupabaseEnabled || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setProfile(data as Profile);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }, [isSupabaseEnabled, user]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (!isSupabaseEnabled) return;

    const currentUser = await getUser();
    if (currentUser) {
      setUser(currentUser);
      const profileData = await fetchProfile(currentUser.id);
      setProfile(profileData);
    }
  }, [isSupabaseEnabled, fetchProfile]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isSupabaseEnabled,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, loading, isSupabaseEnabled } = useAuth();

    if (!isSupabaseEnabled) {
      // If Supabase is not configured, allow access
      return <Component {...props} />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login component
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

// Hook to check if user has specific permissions
export const usePermission = (permission: string): boolean => {
  const { profile } = useAuth();

  if (!profile) return false;

  // Check permissions in profile.preferences
  const preferences = profile.preferences as any;
  return preferences?.permissions?.includes(permission) || false;
};

// Hook to get user's organization
export const useOrganization = () => {
  const { profile, isSupabaseEnabled } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!isSupabaseEnabled || !profile) {
        setLoading(false);
        return;
      }

      try {
        // Get organization based on email domain
        const domain = profile.email.split('@')[1];
        const { data } = await supabase
          .from('organizations')
          .select('*')
          .eq('domain', domain)
          .single();

        if (data) {
          setOrganization(data);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [profile, isSupabaseEnabled]);

  return { organization, loading };
};