// Database types for Supabase integration
// Generated based on the Discovery Assistant data model

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          company_name: string | null
          role: string | null
          avatar_url: string | null
          preferences: Json | null
          is_active: boolean
          last_seen: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          role?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          is_active?: boolean
          last_seen?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          role?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          is_active?: boolean
          last_seen?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          owner_id: string
          company_name: string
          contact_name: string
          contact_role: string
          contact_email: string | null
          contact_phone: string | null
          meeting_date: string
          status: 'draft' | 'in_progress' | 'completed' | 'archived'
          modules: Json
          pain_points: Json
          custom_field_values: Json | null
          wizard_state: Json | null
          ai_insights: Json | null
          is_template: boolean
          template_name: string | null
          version: number
          last_modified_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id: string
          company_name: string
          contact_name: string
          contact_role: string
          contact_email?: string | null
          contact_phone?: string | null
          meeting_date?: string
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          modules?: Json
          pain_points?: Json
          custom_field_values?: Json | null
          wizard_state?: Json | null
          ai_insights?: Json | null
          is_template?: boolean
          template_name?: string | null
          version?: number
          last_modified_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
          company_name?: string
          contact_name?: string
          contact_role?: string
          contact_email?: string | null
          contact_phone?: string | null
          meeting_date?: string
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          modules?: Json
          pain_points?: Json
          custom_field_values?: Json | null
          wizard_state?: Json | null
          ai_insights?: Json | null
          is_template?: boolean
          template_name?: string | null
          version?: number
          last_modified_by?: string | null
        }
      }
      meeting_collaborators: {
        Row: {
          id: string
          created_at: string
          meeting_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
          last_active: string | null
          permissions: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          meeting_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at?: string
          last_active?: string | null
          permissions?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          meeting_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
          last_active?: string | null
          permissions?: Json | null
        }
      }
      meeting_activities: {
        Row: {
          id: string
          created_at: string
          meeting_id: string
          user_id: string
          action: string
          module: string | null
          field: string | null
          old_value: Json | null
          new_value: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          meeting_id: string
          user_id: string
          action: string
          module?: string | null
          field?: string | null
          old_value?: Json | null
          new_value?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          meeting_id?: string
          user_id?: string
          action?: string
          module?: string | null
          field?: string | null
          old_value?: Json | null
          new_value?: Json | null
          metadata?: Json | null
        }
      }
      meeting_comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          meeting_id: string
          user_id: string
          module: string | null
          field: string | null
          comment: string
          is_resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          meeting_id: string
          user_id: string
          module?: string | null
          field?: string | null
          comment: string
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          meeting_id?: string
          user_id?: string
          module?: string | null
          field?: string | null
          comment?: string
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          parent_id?: string | null
        }
      }
      custom_field_definitions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string | null
          field_category: string
          field_name: string
          field_value: string
          field_label: string
          description: string | null
          is_global: boolean
          created_by: string
          usage_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          field_category: string
          field_name: string
          field_value: string
          field_label: string
          description?: string | null
          is_global?: boolean
          created_by: string
          usage_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          field_category?: string
          field_name?: string
          field_value?: string
          field_label?: string
          description?: string | null
          is_global?: boolean
          created_by?: string
          usage_count?: number
        }
      }
      ai_recommendations: {
        Row: {
          id: string
          created_at: string
          meeting_id: string
          module: string
          recommendation_type: string
          title: string
          description: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          effort: 'low' | 'medium' | 'high'
          estimated_value: number | null
          ai_provider: string | null
          ai_model: string | null
          confidence_score: number | null
          is_accepted: boolean | null
          accepted_by: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          meeting_id: string
          module: string
          recommendation_type: string
          title: string
          description: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          effort: 'low' | 'medium' | 'high'
          estimated_value?: number | null
          ai_provider?: string | null
          ai_model?: string | null
          confidence_score?: number | null
          is_accepted?: boolean | null
          accepted_by?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          meeting_id?: string
          module?: string
          recommendation_type?: string
          title?: string
          description?: string
          priority?: 'critical' | 'high' | 'medium' | 'low'
          effort?: 'low' | 'medium' | 'high'
          estimated_value?: number | null
          ai_provider?: string | null
          ai_model?: string | null
          confidence_score?: number | null
          is_accepted?: boolean | null
          accepted_by?: string | null
          accepted_at?: string | null
        }
      }
      meeting_exports: {
        Row: {
          id: string
          created_at: string
          meeting_id: string
          exported_by: string
          export_type: 'pdf' | 'excel' | 'json' | 'docx'
          file_url: string | null
          file_size: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          meeting_id: string
          exported_by: string
          export_type: 'pdf' | 'excel' | 'json' | 'docx'
          file_url?: string | null
          file_size?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          meeting_id?: string
          exported_by?: string
          export_type?: 'pdf' | 'excel' | 'json' | 'docx'
          file_url?: string | null
          file_size?: number | null
          metadata?: Json | null
        }
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          domain: string | null
          logo_url: string | null
          settings: Json | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          subscription_expires_at: string | null
          custom_field_limit: number
          ai_requests_limit: number
          ai_requests_used: number
          storage_limit: number
          storage_used: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_expires_at?: string | null
          custom_field_limit?: number
          ai_requests_limit?: number
          ai_requests_used?: number
          storage_limit?: number
          storage_used?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_expires_at?: string | null
          custom_field_limit?: number
          ai_requests_limit?: number
          ai_requests_used?: number
          storage_limit?: number
          storage_used?: number
        }
      }
    }
    Views: {
      meeting_summary: {
        Row: {
          id: string | null
          company_name: string | null
          contact_name: string | null
          meeting_date: string | null
          status: string | null
          owner_name: string | null
          collaborator_count: number | null
          last_updated: string | null
          completion_percentage: number | null
        }
      }
    }
    Functions: {
      calculate_meeting_completion: {
        Args: {
          meeting_id: string
        }
        Returns: number
      }
      get_user_meetings: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          company_name: string
          contact_name: string
          meeting_date: string
          status: string
          role: string
        }[]
      }
      get_organization_stats: {
        Args: {
          org_id: string
        }
        Returns: {
          total_meetings: number
          active_users: number
          completed_meetings: number
          average_completion: number
          total_exports: number
          ai_usage: number
        }
      }
    }
    Enums: {
      meeting_status: 'draft' | 'in_progress' | 'completed' | 'archived'
      collaborator_role: 'owner' | 'editor' | 'viewer'
      priority: 'critical' | 'high' | 'medium' | 'low'
      effort: 'low' | 'medium' | 'high'
      export_type: 'pdf' | 'excel' | 'json' | 'docx'
      subscription_tier: 'free' | 'pro' | 'enterprise'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Commonly used types
export type Profile = Tables<'profiles'>
export type Meeting = Tables<'meetings'>
export type MeetingCollaborator = Tables<'meeting_collaborators'>
export type MeetingActivity = Tables<'meeting_activities'>
export type MeetingComment = Tables<'meeting_comments'>
export type CustomFieldDefinition = Tables<'custom_field_definitions'>
export type AIRecommendation = Tables<'ai_recommendations'>
export type MeetingExport = Tables<'meeting_exports'>
export type Organization = Tables<'organizations'>

// Type guards
export const isMeeting = (obj: any): obj is Meeting => {
  return obj && typeof obj.id === 'string' && typeof obj.company_name === 'string';
};

export const isProfile = (obj: any): obj is Profile => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};