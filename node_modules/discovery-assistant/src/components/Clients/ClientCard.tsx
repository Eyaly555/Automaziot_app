import React, { useState } from 'react';
import { Calendar, User, CheckCircle, Clock, AlertCircle, Phone, Mail, MoreVertical, Eye, Edit, MessageCircle } from 'lucide-react';
import { ZohoClientListItem, MeetingPhase } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ProgressBar } from '../Common/ProgressBar/ProgressBar';

interface ClientCardProps {
  client: ZohoClientListItem;
  onClick: () => void;
  selected?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, selected }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getPhaseConfig = (phase: MeetingPhase) => {
    const configs = {
      discovery: {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: '🔍',
        label: 'Discovery',
        progressColor: 'bg-blue-500'
      },
      implementation_spec: {
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        icon: '📋',
        label: 'Implementation Spec',
        progressColor: 'bg-purple-500'
      },
      development: {
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        icon: '⚙️',
        label: 'Development',
        progressColor: 'bg-orange-500'
      },
      completed: {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: '✅',
        label: 'Completed',
        progressColor: 'bg-green-500'
      }
    };
    return configs[phase] || configs.discovery;
  };

  const getSyncStatusConfig = (status: 'synced' | 'pending' | 'error') => {
    const configs = {
      synced: {
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'מסונכרן'
      },
      pending: {
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        icon: <Clock className="w-3 h-3" />,
        label: 'ממתין'
      },
      error: {
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'שגיאה'
      }
    };
    return configs[status] || configs.synced;
  };

  const getPriorityLevel = (client: ZohoClientListItem) => {
    if (client.overallProgress < 30) return { level: 'high', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (client.overallProgress > 80) return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { level: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  const phaseConfig = getPhaseConfig(client.phase);
  const syncConfig = getSyncStatusConfig(client.syncStatus);
  const priority = getPriorityLevel(client);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
      className={`
        bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl
        transition-all duration-300 cursor-pointer
        transform hover:-translate-y-1 border border-gray-100
        ${selected ? 'ring-2 ring-blue-500 shadow-xl' : ''}
        relative overflow-hidden
      `}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 right-0 w-2 h-full ${priority.bgColor}`} />

      {/* Header with Quick Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{phaseConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 truncate mb-1">
              {client.clientName}
            </h3>
            {client.companyName && (
              <p className="text-sm text-gray-600 truncate">{client.companyName}</p>
            )}
          </div>
        </div>

        {/* Quick Actions Menu */}
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${priority.bgColor} ${priority.color}`}>
            {priority.level === 'high' ? 'דחוף' : priority.level === 'medium' ? 'בינוני' : 'נמוך'}
          </div>

          {/* Sync Status Badge */}
          <div
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border
              ${syncConfig.bgColor} ${syncConfig.textColor} ${syncConfig.borderColor}
            `}
          >
            {syncConfig.icon}
            <span>{syncConfig.label}</span>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
              <button className="p-1.5 hover:bg-white rounded transition-colors" title="צפה">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-white rounded transition-colors" title="ערוך">
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-white rounded transition-colors" title="צור קשר">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase Badge */}
      <div className="mb-4">
        <span
          className={`
            inline-block px-3 py-1.5 rounded-full text-sm font-semibold
            ${phaseConfig.bgColor} ${phaseConfig.textColor}
          `}
        >
          {phaseConfig.label}
        </span>
      </div>

      {/* Enhanced Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span className="font-medium">התקדמות כללית</span>
          <span className="font-bold text-lg">{client.overallProgress}%</span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${phaseConfig.progressColor}`}
              style={{ width: `${client.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase Progress Indicators */}
      {(client.phase2Progress !== undefined || client.phase3Progress !== undefined) && (
        <div className="flex gap-2 text-xs mb-4">
          {client.phase2Progress !== undefined && (
            <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium">Phase 2</span>
                <span className="text-purple-700 font-bold">{client.phase2Progress}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${client.phase2Progress}%` }}
                />
              </div>
            </div>
          )}
          {client.phase3Progress !== undefined && (
            <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-medium">Phase 3</span>
                <span className="text-orange-700 font-bold">{client.phase3Progress}%</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${client.phase3Progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {client.discoveryModulesCompleted !== undefined && client.discoveryModulesCompleted > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-blue-700">{client.discoveryModulesCompleted}</div>
            <div className="text-xs text-blue-600">מודולים</div>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
          <div className="text-lg font-bold text-gray-700">
            {Math.floor((new Date().getTime() - new Date(client.created).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs text-gray-600">ימים</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
          <div className="text-lg font-bold text-green-700">
            {client.lastModified ? Math.floor((new Date().getTime() - new Date(client.lastModified).getTime()) / (1000 * 60 * 60 * 24)) : '?'}
          </div>
          <div className="text-xs text-green-600">עדכון</div>
        </div>
      </div>

      {/* Contact Info */}
      {(client.phone || client.email) && (
        <div className="flex gap-2 mb-4">
          {client.phone && (
            <button className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
              <Phone className="w-3 h-3" />
              <span>{client.phone}</span>
            </button>
          )}
          {client.email && (
            <button className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{client.email}</span>
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(client.created)}</span>
        </div>
        {client.owner && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{client.owner}</span>
          </div>
        )}
      </div>
    </div>
  );
};
