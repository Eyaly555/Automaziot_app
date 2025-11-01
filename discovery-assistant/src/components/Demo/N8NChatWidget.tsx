/**
 * N8N Chat Widget Wrapper Component
 * Handles initialization and customization of N8N Chat widget
 * Fully optimized for mobile, tablet, and desktop viewports
 */

import React, { useEffect, useRef, useMemo } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export interface N8NChatWidgetProps {
  webhookUrl: string;
  agentName: string;
  initialMessages: string[];
  chatInputKey?: string;
  chatSessionKey?: string;
  loadPreviousSession?: boolean;
  enableStreaming?: boolean;
  metadata?: Record<string, any>;
  onClose?: () => void;
}

/**
 * N8N Chat Widget Wrapper
 * Creates and manages the N8N Chat widget instance
 * Handles proper cleanup and customization for Hebrew language
 */
/**
 * Memoized component to prevent unnecessary re-renders
 * Only re-renders when props actually change
 */
const N8NChatWidgetComponent: React.FC<N8NChatWidgetProps> = ({
  webhookUrl,
  agentName,
  initialMessages,
  chatInputKey = 'chatInput',
  chatSessionKey = 'sessionId',
  loadPreviousSession = true,
  enableStreaming = true,
  metadata = {},
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

  // Memoize metadata to prevent unnecessary re-renders
  const memoizedMetadata = useMemo(() => ({
    agentName,
    ...metadata
  }), [agentName, metadata]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a div for the chat widget if it doesn't exist
    let chatContainer = containerRef.current.querySelector('#n8n-chat');
    if (!chatContainer) {
      chatContainer = document.createElement('div');
      chatContainer.id = 'n8n-chat';
      containerRef.current.appendChild(chatContainer);
    }

    // Initialize the chat widget
    try {
      chatInstanceRef.current = createChat({
        webhookUrl,
        target: '#n8n-chat',
        mode: 'fullscreen',
        chatInputKey,
        chatSessionKey,
        loadPreviousSession,
        enableStreaming,
        metadata: memoizedMetadata,
        defaultLanguage: 'he',
        initialMessages,
        showWelcomeScreen: false,
        i18n: {
          he: {
            title: `שלום מ${agentName}`,
            subtitle: 'אנו כאן כדי לעזור לך',
            footer: '',
            getStarted: 'התחל שיחה',
            inputPlaceholder: 'הקלד את הודעתך כאן...'
          }
        },
        webhookConfig: {
          method: 'POST',
          headers: {}
        }
      });
    } catch (error) {
      console.error('Failed to initialize N8N Chat widget:', error);
    }

    // Cleanup function
    return () => {
      // Chat instance cleanup is handled by the library
      if (chatContainer && chatContainer.parentElement) {
        chatContainer.remove();
      }
    };
  }, [webhookUrl, agentName, initialMessages, chatInputKey, chatSessionKey, loadPreviousSession, enableStreaming, memoizedMetadata]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col"
      dir="rtl"
      style={{
        minHeight: '200px',
        /* Ensure proper touch scrolling on mobile */
        WebkitOverflowScrolling: 'touch',
        /* Prevent content from being cut off by iOS notch */
        paddingLeft: 'max(0px, env(safe-area-inset-left))',
        paddingRight: 'max(0px, env(safe-area-inset-right))'
      }}
    >
      {/* Chat widget will be injected here by N8N createChat - fully responsive across all devices */}
    </div>
  );
};

/**
 * Export memoized component to prevent unnecessary re-renders
 * This prevents the chat from being destroyed/recreated when parent re-renders
 */
export const N8NChatWidget = React.memo(N8NChatWidgetComponent);

export default N8NChatWidget;
