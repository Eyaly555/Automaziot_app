/**
 * Agent with Table Card Component
 * Displays an AI agent's chat interface alongside its Airtable data table
 * Resizable, draggable, and minimizable card for agent comparison
 * Features: drag-to-reposition, corner-drag-to-resize, minimize/expand, remove
 * Fully optimized for mobile, tablet, and desktop with responsive stacking
 */

import React, { useMemo, useState, useEffect } from 'react';
import { DemoAgent } from '../../types/demoAgents';
import { N8NChatWidget } from './N8NChatWidget';
import { AirtableEmbed } from './AirtableEmbed';
import { FadeIn } from '../Feedback/PageTransition';
import { ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';

// Hook to detect mobile/tablet viewports for responsive layout
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export interface AgentWithTableCardProps {
  agent: DemoAgent;
  isMinimized?: boolean;
  onToggleMinimize?: (agentId: string) => void;
  onRemove?: (agentId: string) => void;
}

/**
 * AgentWithTableCard Component
 * Displays a single agent with its chat interface and optional Airtable table
 * Fully resizable, draggable, and supports minimize functionality
 */
export const AgentWithTableCard: React.FC<AgentWithTableCardProps> = ({
  agent,
  isMinimized = false,
  onToggleMinimize,
  onRemove
}) => {
  const hasAirtable = agent.airtableEmbedUrl;
  const isMobile = useIsMobile();

  // Memoize metadata to prevent unnecessary N8NChatWidget re-renders
  const chatMetadata = useMemo(() => ({
    agentId: agent.id,
    agentCategory: agent.category
  }), [agent.id, agent.category]);

  return (
    <FadeIn>
      <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ cursor: isMobile ? 'default' : 'grab' }}>
        {/* Card Header with Controls - Mobile optimized with larger touch targets */}
        <div className={`drag-handle bg-gradient-to-r ${agent.color} px-3 sm:px-4 py-3 sm:py-3 flex items-center justify-between ${isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} hover:shadow-md transition-shadow`}>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Hide grip icon on mobile */}
            {!isMobile && <GripVertical size={20} className="text-white flex-shrink-0" />}
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">
                {agent.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                {agent.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                {agent.category}
              </p>
            </div>
          </div>

          {/* Action Buttons - Larger touch targets for mobile (44x44px minimum) */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {onToggleMinimize && (
              <button
                onClick={() => onToggleMinimize(agent.id)}
                className="p-2 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-white/30 rounded transition-colors duration-200 text-white hover:text-white active:bg-white/40 touch-manipulation"
                title={isMinimized ? 'הרחב' : 'הזער'}
                aria-label={isMinimized ? 'expand' : 'minimize'}
              >
                {isMinimized ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(agent.id)}
                className="p-2 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-white/30 rounded transition-colors duration-200 text-white hover:text-red-200 active:bg-white/40 touch-manipulation"
                title="הסר סוכן"
                aria-label="remove agent"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Card Content - Hidden when minimized, stacks vertically on mobile */}
        {!isMinimized && (
          <div className={`flex-1 overflow-hidden flex ${hasAirtable && !isMobile ? 'flex-row' : 'flex-col'} gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-slate-900`}>
            {/* Chat Container - Full width on mobile, half width on desktop when table present */}
            <div className={`${hasAirtable && !isMobile ? 'flex-1 min-w-0' : 'w-full'} ${hasAirtable && isMobile ? 'h-[300px]' : 'flex-1'} bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm flex flex-col`}>
              <N8NChatWidget
                webhookUrl={agent.webhookUrl}
                agentName={agent.name}
                initialMessages={agent.initialMessages}
                metadata={chatMetadata}
              />
            </div>

            {/* Airtable Embed - Stacks below chat on mobile, side-by-side on desktop */}
            {hasAirtable && (
              <div className={`${!isMobile ? 'flex-1 min-w-0' : 'w-full h-[300px]'} bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm`}>
                <AirtableEmbed
                  embedUrl={agent.airtableEmbedUrl!}
                  title={agent.airtableTitle}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default AgentWithTableCard;
