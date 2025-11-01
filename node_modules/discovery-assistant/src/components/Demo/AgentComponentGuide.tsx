/**
 * Agent Component Design Guide
 *
 * This file demonstrates best practices for creating beautiful,
 * fully-functional demo agent components that work seamlessly
 * with react-grid-layout's drag/resize features
 *
 * Key Features:
 * ✓ Fully resizable and draggable
 * ✓ Smooth animations and transitions
 * ✓ Dark mode support
 * ✓ Mobile responsive
 * ✓ Minimize/expand functionality
 * ✓ Remove capability
 * ✓ Visual feedback for all interactions
 */

import React from 'react';
import { DemoAgent } from '../../types/demoAgents';
import { ChevronDown, ChevronUp, X, GripVertical, MessageCircle, BarChart3, HelpCircle } from 'lucide-react';

/**
 * BEST PRACTICE COMPONENT: Professional Agent Card
 *
 * Features:
 * - Clean header with drag handle
 * - Responsive content area
 * - Smooth minimize/expand animation
 * - Proper color gradients
 * - Icon indicators for agent type
 */
export const ProfessionalAgentCard: React.FC<{
  agent: DemoAgent;
  isMinimized?: boolean;
  onToggleMinimize?: (id: string) => void;
  onRemove?: (id: string) => void;
}> = ({ agent, isMinimized = false, onToggleMinimize, onRemove }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      {/* Premium Header */}
      <div className={`drag-handle bg-gradient-to-r ${agent.color} px-4 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing group`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle Icon */}
          <div className="text-white opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <GripVertical size={18} />
          </div>

          {/* Agent Avatar */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex-shrink-0 text-white font-bold text-sm">
            {agent.name.charAt(0)}
          </div>

          {/* Agent Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate leading-tight">
              {agent.name}
            </h3>
            <p className="text-xs text-white/80 truncate">
              {agent.category}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleMinimize && (
            <button
              onClick={() => onToggleMinimize(agent.id)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white active:bg-white/30"
              title={isMinimized ? 'הרחב' : 'הזער'}
            >
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(agent.id)}
              className="p-2 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-white active:bg-red-500/50"
              title="הסר סוכן"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area - Smooth Expand/Collapse */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 dark:bg-slate-900">
          {/* Placeholder for agent content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-blue-500" />
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    סטטוס
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  סוכן פעיל וזמין לצ'אט
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-green-500" />
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    סטטיסטיקות
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">שיחות</p>
                    <p className="font-bold text-gray-900 dark:text-white">1,234</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">שביעות רצון</p>
                    <p className="font-bold text-green-600">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
              פתח צ'אט
            </button>
          </div>
        </div>
      )}

      {/* Minimized State Indicator */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">הוזעק</p>
        </div>
      )}
    </div>
  );
};

/**
 * ADVANCED COMPONENT: Agent with Stats Dashboard
 *
 * Includes real-time statistics and advanced features
 */
export const AdvancedAgentCard: React.FC<{
  agent: DemoAgent;
  isMinimized?: boolean;
  onToggleMinimize?: (id: string) => void;
  onRemove?: (id: string) => void;
  stats?: {
    conversations: number;
    satisfaction: number;
    responseTime: string;
  };
}> = ({ agent, isMinimized = false, onToggleMinimize, onRemove, stats }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className={`drag-handle bg-gradient-to-r ${agent.color} px-4 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical size={18} className="text-white flex-shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">{agent.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{agent.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/80">{agent.category}</p>
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleMinimize && (
            <button
              onClick={() => onToggleMinimize(agent.id)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-white" />}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(agent.id)}
              className="p-2 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 p-4">
          {stats && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">שיחות</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.conversations}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">שביעות רצון</p>
                  <p className="text-lg font-bold text-green-600">{stats.satisfaction}%</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">זמן תגובה</p>
                  <p className="text-lg font-bold text-blue-600">{stats.responseTime}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * TIPS FOR CREATING BEAUTIFUL DEMO AGENTS:
 *
 * 1. HEADER DESIGN
 *    - Use gradient backgrounds for visual appeal
 *    - Include drag handle icon for UX clarity
 *    - Keep text readable with proper contrast
 *    - Add smooth hover effects
 *
 * 2. CONTENT AREA
 *    - Ensure proper flex layout for responsiveness
 *    - Use overflow-hidden and overflow-auto appropriately
 *    - Add padding/margins for breathing room
 *    - Support dark mode with dark: classes
 *
 * 3. INTERACTIONS
 *    - Use cursor: grab/grabbing for drag feedback
 *    - Add transition classes for smooth animations
 *    - Include hover states for all buttons
 *    - Provide clear visual feedback on interactions
 *
 * 4. RESIZE HANDLES
 *    - The resize handle is at the bottom-right corner (automatic)
 *    - Make it visible with proper styling
 *    - Add visual feedback on hover
 *    - Ensure it doesn't interfere with content
 *
 * 5. DARK MODE
 *    - Always use dark: prefix for dark mode variants
 *    - Test contrast ratios for accessibility
 *    - Use colors that work in both modes
 *
 * 6. MINIMIZE FEATURE
 *    - Store isMinimized state in parent
 *    - Animate smooth transitions
 *    - Keep header visible when minimized
 *
 * WORKING WITH REACT-GRID-LAYOUT:
 *
 * ✓ The draggableHandle=".drag-handle" prop in GridLayout
 *   makes only that class draggable
 * ✓ Resize handles are automatic and appear at bottom-right
 * ✓ Use minH and maxH in layout to prevent extreme sizes
 * ✓ Use containerPadding to ensure items don't touch edges
 * ✓ Use margin to space items apart
 */
