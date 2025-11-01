/**
 * N8N Chat Widget Wrapper Component
 * Handles initialization and customization of N8N Chat widget
 */

import { useEffect, useRef, useCallback } from 'react';
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
export const N8NChatWidget: React.FC<N8NChatWidgetProps> = ({
  webhookUrl,
  agentName,
  initialMessages,
  chatInputKey = 'chatInput',
  chatSessionKey = 'sessionId',
  loadPreviousSession = true,
  enableStreaming = false,
  metadata = {},
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

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
        metadata: {
          agentName,
          ...metadata
        },
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
  }, [webhookUrl, agentName, initialMessages, chatInputKey, chatSessionKey, loadPreviousSession, enableStreaming, metadata]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col"
      dir="rtl"
    >
      {/* Chat widget will be injected here by N8N createChat */}
    </div>
  );
};

export default N8NChatWidget;
