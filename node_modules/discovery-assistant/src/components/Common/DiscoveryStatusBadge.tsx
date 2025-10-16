import React from 'react';

import {
  FileSearch,
  FileCheck,
  Send,
  CheckCircle,
  Rocket,
  Circle,
} from 'lucide-react';
import {
  DiscoveryStatusValue,
  getStatusInfo,
} from '../../services/discoveryStatusService';

interface DiscoveryStatusBadgeProps {
  status: DiscoveryStatusValue;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
}

// Status icon mapper
const getStatusIcon = (status: DiscoveryStatusValue, size: number) => {
  const iconMap: Record<DiscoveryStatusValue, React.ReactElement> = {
    discovery_started: <FileSearch size={size} />,
    proposal: <FileCheck size={size} />,
    proposal_sent: <Send size={size} />,
    technical_details_collection: <CheckCircle size={size} />,
    implementation_started: <Rocket size={size} />,
  };

  return iconMap[status] || <Circle size={size} />;
};

// Status color scheme mapper (Tailwind classes)
const getStatusColor = (status: DiscoveryStatusValue) => {
  const colorMap: Record<
    DiscoveryStatusValue,
    {
      bg: string;
      text: string;
      border: string;
      iconColor: string;
    }
  > = {
    discovery_started: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      iconColor: 'text-blue-600',
    },
    proposal: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-300',
      iconColor: 'text-purple-600',
    },
    proposal_sent: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      iconColor: 'text-orange-600',
    },
    technical_details_collection: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-300',
      iconColor: 'text-teal-600',
    },
    implementation_started: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-300',
      iconColor: 'text-green-600',
    },
  };

  return colorMap[status];
};

// Size configuration
const getSizeConfig = (size: 'sm' | 'md' | 'lg') => {
  const sizeMap = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      iconSize: 12,
      gap: 'gap-1',
    },
    md: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      iconSize: 16,
      gap: 'gap-2',
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      iconSize: 20,
      gap: 'gap-2',
    },
  };

  return sizeMap[size];
};

export const DiscoveryStatusBadge: React.FC<DiscoveryStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showDescription = false,
  className = '',
}) => {
  const statusInfo = getStatusInfo(status);
  const colors = getStatusColor(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <div className={`inline-flex flex-col ${className}`} dir="rtl">
      <div
        className={`
          inline-flex items-center
          ${sizeConfig.gap}
          ${sizeConfig.padding}
          ${sizeConfig.text}
          ${colors.bg}
          ${colors.text}
          border ${colors.border}
          rounded-full
          font-semibold
          transition-all duration-200
          hover:shadow-md
        `}
      >
        {showIcon && (
          <span className={colors.iconColor}>
            {getStatusIcon(status, sizeConfig.iconSize)}
          </span>
        )}
        <span>{statusInfo.label}</span>
      </div>

      {showDescription && (
        <p
          className={`mt-2 text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        >
          {statusInfo.description}
        </p>
      )}
    </div>
  );
};

// Alternative: Progress-style badge showing all 5 stages
interface DiscoveryStatusProgressProps {
  currentStatus: DiscoveryStatusValue;
  className?: string;
}

export const DiscoveryStatusProgress: React.FC<
  DiscoveryStatusProgressProps
> = ({ currentStatus, className = '' }) => {
  const statuses: DiscoveryStatusValue[] = [
    'discovery_started',
    'proposal',
    'proposal_sent',
    'technical_details_collection',
    'implementation_started',
  ];

  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir="rtl">
      <div className="flex items-center justify-between gap-2">
        {statuses.map((status, index) => {
          const statusInfo = getStatusInfo(status);
          const colors = getStatusColor(status);
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isActive ? `${colors.bg} ${colors.border}` : ''}
                  ${isCompleted ? 'bg-green-100 border-green-500' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 border-gray-300' : ''}
                `}
              >
                <span
                  className={`
                    ${isActive ? colors.iconColor : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}
                >
                  {getStatusIcon(status, 20)}
                </span>
              </div>
              <span
                className={`
                  mt-2 text-xs text-center font-medium
                  ${isActive ? colors.text : ''}
                  ${isCompleted ? 'text-green-700' : ''}
                  ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                `}
              >
                {statusInfo.shortLabel || statusInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-l from-green-500 to-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / statuses.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
