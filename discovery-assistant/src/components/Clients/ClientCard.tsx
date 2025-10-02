import React from 'react';
import { Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ZohoClientListItem, MeetingPhase } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ProgressBar } from '../Common/ProgressBar/ProgressBar';

interface ClientCardProps {
  client: ZohoClientListItem;
  onClick: () => void;
  selected?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, selected }) => {
  const getPhaseConfig = (phase: MeetingPhase) => {
    const configs = {
      discovery: {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: '🔍',
        label: 'Discovery'
      },
      implementation_spec: {
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        icon: '📋',
        label: 'Implementation Spec'
      },
      development: {
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        icon: '⚙️',
        label: 'Development'
      },
      completed: {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: '✅',
        label: 'Completed'
      }
    };
    return configs[phase];
  };

  const getSyncStatusConfig = (status: 'synced' | 'pending' | 'error') => {
    const configs = {
      synced: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'מסונכרן'
      },
      pending: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        icon: <Clock className="w-3 h-3" />,
        label: 'ממתין'
      },
      error: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'שגיאה'
      }
    };
    return configs[status];
  };

  const phaseConfig = getPhaseConfig(client.phase);
  const syncConfig = getSyncStatusConfig(client.syncStatus);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl p-6 shadow-md hover:shadow-xl
        transition-all duration-300 cursor-pointer
        transform hover:-translate-y-1
        ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{phaseConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 truncate">
              {client.clientName}
            </h3>
            {client.companyName && (
              <p className="text-sm text-gray-500 truncate">{client.companyName}</p>
            )}
          </div>
        </div>

        {/* Sync Status Badge */}
        <div
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
            ${syncConfig.bgColor} ${syncConfig.textColor}
          `}
        >
          {syncConfig.icon}
          <span>{syncConfig.label}</span>
        </div>
      </div>

      {/* Phase Badge */}
      <div
        className={`
          inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3
          ${phaseConfig.bgColor} ${phaseConfig.textColor}
        `}
      >
        {phaseConfig.label}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>התקדמות כללית</span>
          <span className="font-semibold">{client.overallProgress}%</span>
        </div>
        <ProgressBar value={client.overallProgress} className="h-2" />
      </div>

      {/* Phase Progress Indicators */}
      {(client.phase2Progress !== undefined || client.phase3Progress !== undefined) && (
        <div className="flex gap-2 text-xs mb-3">
          {client.phase2Progress !== undefined && (
            <div className="flex-1 bg-purple-50 rounded px-2 py-1">
              <span className="text-purple-700 font-medium">
                Phase 2: {client.phase2Progress}%
              </span>
            </div>
          )}
          {client.phase3Progress !== undefined && (
            <div className="flex-1 bg-orange-50 rounded px-2 py-1">
              <span className="text-orange-700 font-medium">
                Phase 3: {client.phase3Progress}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Discovery Modules Completed */}
      {client.discoveryModulesCompleted !== undefined && client.discoveryModulesCompleted > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-blue-50 rounded px-2 py-1">
          <CheckCircle className="w-3 h-3 text-blue-600" />
          <span>{client.discoveryModulesCompleted} מודולים הושלמו</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(client.lastModified)}</span>
        </div>
        {client.owner && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{client.owner}</span>
          </div>
        )}
      </div>

      {/* Discovery Date if available */}
      {client.discoveryDate && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <span>תאריך Discovery:</span>
          <span>{formatDate(client.discoveryDate)}</span>
        </div>
      )}
    </div>
  );
};
