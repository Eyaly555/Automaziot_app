import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, createRealtimeChannel } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMeetingStore } from '../store/useMeetingStore';
import type { MeetingCollaborator, MeetingActivity, MeetingComment } from '../types/database';

interface CollaboratorPresence {
  userId: string;
  userName: string;
  avatar?: string;
  currentModule?: string;
  currentField?: string;
  isTyping: boolean;
  lastSeen: string;
  cursor?: { x: number; y: number };
  color: string;
}

interface CollaborationState {
  isConnected: boolean;
  collaborators: CollaboratorPresence[];
  activeEditors: Map<string, string>; // field -> userId
  pendingChanges: Map<string, any>; // field -> value
  activities: MeetingActivity[];
  comments: MeetingComment[];
}

interface UseCollaborationOptions {
  meetingId: string;
  onFieldUpdate?: (field: string, value: any, userId: string) => void;
  onCollaboratorJoin?: (collaborator: CollaboratorPresence) => void;
  onCollaboratorLeave?: (userId: string) => void;
  onComment?: (comment: MeetingComment) => void;
  enableCursors?: boolean;
  autoReconnect?: boolean;
}

export const useCollaboration = (options: UseCollaborationOptions) => {
  const { user, profile } = useAuth();
  const { updateMeetingField } = useMeetingStore();
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    collaborators: [],
    activeEditors: new Map(),
    pendingChanges: new Map(),
    activities: [],
    comments: []
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a color for the user
  const getUserColor = useCallback((userId: string): string => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }, []);

  // Initialize collaboration
  const initCollaboration = useCallback(async () => {
    if (!isSupabaseConfigured() || !user || !options.meetingId) {
      return;
    }

    try {
      // Create realtime channel for this meeting
      const channel = createRealtimeChannel(`meeting:${options.meetingId}`);
      channelRef.current = channel;

      // Subscribe to presence updates
      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const collaborators: CollaboratorPresence[] = [];

          Object.keys(newState).forEach(key => {
            const presences = newState[key] as any[];
            presences.forEach(presence => {
              if (presence.userId !== user.id) {
                collaborators.push({
                  userId: presence.userId,
                  userName: presence.userName || 'Anonymous',
                  avatar: presence.avatar,
                  currentModule: presence.currentModule,
                  currentField: presence.currentField,
                  isTyping: presence.isTyping || false,
                  lastSeen: presence.lastSeen || new Date().toISOString(),
                  cursor: presence.cursor,
                  color: presence.color || getUserColor(presence.userId)
                });
              }
            });
          });

          setState(prev => ({
            ...prev,
            collaborators,
            isConnected: true
          }));
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          newPresences.forEach((presence: any) => {
            if (options.onCollaboratorJoin) {
              options.onCollaboratorJoin(presence);
            }
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          leftPresences.forEach((presence: any) => {
            if (options.onCollaboratorLeave) {
              options.onCollaboratorLeave(presence.userId);
            }
          });
        });

      // Subscribe to broadcast events for field updates
      channel
        .on('broadcast', { event: 'field-update' }, ({ payload }) => {
          const { field, value, userId, moduleId } = payload;

          // Update local state if not our own update
          if (userId !== user.id) {
            setState(prev => {
              const newActiveEditors = new Map(prev.activeEditors);
              newActiveEditors.set(`${moduleId}.${field}`, userId);

              return {
                ...prev,
                activeEditors: newActiveEditors
              };
            });

            if (options.onFieldUpdate) {
              options.onFieldUpdate(field, value, userId);
            }

            // Update store
            updateMeetingField(moduleId, field, value);
          }
        })
        .on('broadcast', { event: 'field-focus' }, ({ payload }) => {
          const { field, userId, moduleId } = payload;

          if (userId !== user.id) {
            setState(prev => {
              const newActiveEditors = new Map(prev.activeEditors);
              newActiveEditors.set(`${moduleId}.${field}`, userId);
              return {
                ...prev,
                activeEditors: newActiveEditors
              };
            });
          }
        })
        .on('broadcast', { event: 'field-blur' }, ({ payload }) => {
          const { field, moduleId } = payload;

          setState(prev => {
            const newActiveEditors = new Map(prev.activeEditors);
            newActiveEditors.delete(`${moduleId}.${field}`);
            return {
              ...prev,
              activeEditors: newActiveEditors
            };
          });
        });

      // Subscribe to database changes for activities and comments
      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_activities',
          filter: `meeting_id=eq.${options.meetingId}`
        }, (payload) => {
          setState(prev => ({
            ...prev,
            activities: [...prev.activities, payload.new as MeetingActivity]
          }));
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_comments',
          filter: `meeting_id=eq.${options.meetingId}`
        }, (payload) => {
          const newComment = payload.new as MeetingComment;
          setState(prev => ({
            ...prev,
            comments: [...prev.comments, newComment]
          }));

          if (options.onComment) {
            options.onComment(newComment);
          }
        });

      // Subscribe to cursor movements if enabled
      if (options.enableCursors) {
        channel.on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
          const { userId, x, y } = payload;

          if (userId !== user.id) {
            setState(prev => {
              const collaborators = prev.collaborators.map(c => {
                if (c.userId === userId) {
                  return { ...c, cursor: { x, y } };
                }
                return c;
              });
              return { ...prev, collaborators };
            });
          }
        });
      }

      // Track our own presence
      const userPresence: CollaboratorPresence = {
        userId: user.id,
        userName: profile?.full_name || user.email || 'Anonymous',
        avatar: profile?.avatar_url || undefined,
        currentModule: undefined,
        currentField: undefined,
        isTyping: false,
        lastSeen: new Date().toISOString(),
        color: getUserColor(user.id)
      };

      await channel.track(userPresence);

      // Start channel
      await channel.subscribe();

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        channel.track({
          ...userPresence,
          lastSeen: new Date().toISOString()
        });
      }, 30000); // Every 30 seconds

      setState(prev => ({ ...prev, isConnected: true }));

    } catch (error) {
      console.error('Error initializing collaboration:', error);
      setState(prev => ({ ...prev, isConnected: false }));

      // Attempt reconnection if enabled
      if (options.autoReconnect !== false) {
        reconnectTimeoutRef.current = setTimeout(() => {
          initCollaboration();
        }, 5000);
      }
    }
  }, [user, profile, options, getUserColor, updateMeetingField]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    setState({
      isConnected: false,
      collaborators: [],
      activeEditors: new Map(),
      pendingChanges: new Map(),
      activities: [],
      comments: []
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initCollaboration();
    return cleanup;
  }, [initCollaboration, cleanup]);

  // Broadcast field update
  const broadcastFieldUpdate = useCallback(async (
    moduleId: string,
    field: string,
    value: any
  ) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'field-update',
      payload: {
        moduleId,
        field,
        value,
        userId: user.id,
        timestamp: new Date().toISOString()
      }
    });
  }, [user]);

  // Broadcast field focus
  const broadcastFieldFocus = useCallback(async (
    moduleId: string,
    field: string
  ) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'field-focus',
      payload: {
        moduleId,
        field,
        userId: user.id
      }
    });
  }, [user]);

  // Broadcast field blur
  const broadcastFieldBlur = useCallback(async (
    moduleId: string,
    field: string
  ) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'field-blur',
      payload: {
        moduleId,
        field,
        userId: user.id
      }
    });
  }, [user]);

  // Broadcast cursor position
  const broadcastCursorPosition = useCallback(async (x: number, y: number) => {
    if (!channelRef.current || !user || !options.enableCursors) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: {
        userId: user.id,
        x,
        y
      }
    });
  }, [user, options.enableCursors]);

  // Update presence
  const updatePresence = useCallback(async (updates: Partial<CollaboratorPresence>) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.track({
      userId: user.id,
      ...updates,
      lastSeen: new Date().toISOString()
    });
  }, [user]);

  // Add comment
  const addComment = useCallback(async (
    module: string | null,
    field: string | null,
    comment: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('meeting_comments')
        .insert({
          meeting_id: options.meetingId,
          user_id: user.id,
          module,
          field,
          comment
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add comment' };
    }
  }, [user, options.meetingId]);

  // Resolve comment
  const resolveComment = useCallback(async (
    commentId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('meeting_comments')
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) {
        return { success: false, error: error.message };
      }

      setState(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.id === commentId
            ? { ...c, is_resolved: true, resolved_by: user.id, resolved_at: new Date().toISOString() }
            : c
        )
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to resolve comment' };
    }
  }, [user]);

  // Get field editor
  const getFieldEditor = useCallback((moduleId: string, field: string): string | undefined => {
    return state.activeEditors.get(`${moduleId}.${field}`);
  }, [state.activeEditors]);

  // Check if field is being edited
  const isFieldBeingEdited = useCallback((moduleId: string, field: string): boolean => {
    const editorId = state.activeEditors.get(`${moduleId}.${field}`);
    return editorId !== undefined && editorId !== user?.id;
  }, [state.activeEditors, user]);

  // Get collaborator by ID
  const getCollaborator = useCallback((userId: string): CollaboratorPresence | undefined => {
    return state.collaborators.find(c => c.userId === userId);
  }, [state.collaborators]);

  return {
    // State
    isConnected: state.isConnected,
    collaborators: state.collaborators,
    activities: state.activities,
    comments: state.comments,
    activeEditors: state.activeEditors,

    // Methods
    broadcastFieldUpdate,
    broadcastFieldFocus,
    broadcastFieldBlur,
    broadcastCursorPosition,
    updatePresence,
    addComment,
    resolveComment,
    getFieldEditor,
    isFieldBeingEdited,
    getCollaborator,

    // Utilities
    reconnect: initCollaboration,
    disconnect: cleanup
  };
};