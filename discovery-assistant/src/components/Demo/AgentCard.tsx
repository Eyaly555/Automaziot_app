/**
 * Agent Card Component
 * Displays individual AI agent card for selection
 */

import { DemoAgent } from '../../types/demoAgents';
import { Card } from '../Base/Card';
import { Badge } from '../Base/Badge';
import * as LucideIcons from 'lucide-react';
import { FadeIn } from '../Feedback/PageTransition';

export interface AgentCardProps {
  agent: DemoAgent;
  onSelect: (agent: DemoAgent) => void;
  isSelected?: boolean;
}

/**
 * AgentCard Component
 * Displays an AI agent with icon, name, description, and category
 */
export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onSelect,
  isSelected = false
}) => {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[agent.icon] || LucideIcons.Zap;

  const handleClick = () => {
    if (!agent.disabled) {
      onSelect(agent);
    }
  };

  return (
    <FadeIn delay={0.1}>
      <Card
        hoverable={!agent.disabled}
        variant={agent.disabled ? 'bordered' : 'elevated'}
        padding="lg"
        onClick={handleClick}
        className={`
          relative overflow-hidden transition-all duration-300
          ${!agent.disabled ? 'cursor-pointer hover:shadow-lg' : 'opacity-75 cursor-not-allowed'}
          ${isSelected ? 'ring-2 ring-teal-500' : ''}
        `}
      >
        {/* Gradient Background */}
        <div
          className={`
            absolute inset-0 opacity-10 transition-opacity duration-300
            ${!agent.disabled ? 'group-hover:opacity-20' : ''}
            bg-gradient-to-br ${agent.color}
          `}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col gap-4">
          {/* Icon Section */}
          <div className="flex items-center justify-between">
            <div
              className={`
                p-3 rounded-lg transition-all duration-300
                bg-gradient-to-br ${agent.color} text-white
                ${!agent.disabled ? 'group-hover:scale-110' : ''}
              `}
            >
              <IconComponent size={28} />
            </div>

            {/* Status Badge */}
            {agent.disabled && (
              <Badge variant="warning" className="text-xs">
                בהכנה
              </Badge>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {agent.description}
            </p>
          </div>

          {/* Category Badge and Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <Badge variant="secondary" className="text-xs">
              {agent.category}
            </Badge>

            {agent.disabled ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {agent.disabledReason}
              </span>
            ) : (
              <button
                className="
                  px-3 py-1 text-xs font-medium rounded-md
                  bg-gradient-to-r from-teal-500 to-cyan-500
                  text-white transition-all duration-300
                  hover:shadow-md active:scale-95
                "
              >
                בחר
              </button>
            )}
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default AgentCard;
