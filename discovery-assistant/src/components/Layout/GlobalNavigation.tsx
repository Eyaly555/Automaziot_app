import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Badge } from '../Base/Badge';
import {
  Home,
  FileText,
  Users,
  Package,
  BarChart3,
  Bot,
  Server,
  TrendingUp,
  FileCheck,
  Settings,
  CheckCircle,
  Circle,
  Rocket,
  Code,
  Briefcase,
  Target,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  labelEn?: string;
  path: string;
  icon: React.ReactNode;
  moduleKey?: string;
  phase?: 'discovery' | 'implementation_spec' | 'development';
}

/**
 * Global Navigation Sidebar
 * Phase-aware navigation with progress indicators
 * Supports both Hebrew (RTL) and English interfaces
 */
export const GlobalNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMeeting, getModuleProgress } = useMeetingStore();

  const moduleProgress = getModuleProgress();

  // Phase 1 - Discovery navigation items
  const discoveryItems: NavigationItem[] = [
    { id: 'dashboard', label: 'לוח בקרה', labelEn: 'Dashboard', path: '/dashboard', icon: <Home /> },
    { id: 'overview', label: 'סקירה כללית', path: '/module/overview', icon: <FileText />, moduleKey: 'overview' },
    { id: 'essentialDetails', label: 'איפיון ממוקד', path: '/module/essentialDetails', icon: <Target />, moduleKey: 'essentialDetails' },
    { id: 'leadsAndSales', label: 'לידים ומכירות', path: '/module/leadsAndSales', icon: <Users />, moduleKey: 'leadsAndSales' },
    { id: 'customerService', label: 'שירות לקוחות', path: '/module/customerService', icon: <Package />, moduleKey: 'customerService' },
    { id: 'operations', label: 'תפעול', path: '/module/operations', icon: <Settings />, moduleKey: 'operations' },
    { id: 'reporting', label: 'דיווח', path: '/module/reporting', icon: <BarChart3 />, moduleKey: 'reporting' },
    { id: 'aiAgents', label: 'סוכני AI', path: '/module/aiAgents', icon: <Bot />, moduleKey: 'aiAgents' },
    { id: 'systems', label: 'מערכות', path: '/module/systems', icon: <Server />, moduleKey: 'systems' },
    { id: 'roi', label: 'ROI', path: '/module/roi', icon: <TrendingUp />, moduleKey: 'roi' },
    { id: 'proposal', label: 'הצעה', path: '/module/proposal', icon: <FileCheck />, moduleKey: 'proposal' },
  ];

  // Phase 2 - Implementation Spec navigation items
  const implementationItems: NavigationItem[] = [
    { id: 'phase2-dashboard', label: 'מפרט יישום', labelEn: 'Implementation Spec', path: '/phase2', icon: <Briefcase />, phase: 'implementation_spec' },
  ];

  // Phase 3 - Development navigation items
  const developmentItems: NavigationItem[] = [
    { id: 'phase3-dashboard', label: 'Development Dashboard', path: '/phase3', icon: <Code />, phase: 'development' },
    { id: 'phase3-sprints', label: 'Sprints', path: '/phase3/sprints', icon: <Rocket />, phase: 'development' },
    { id: 'phase3-systems', label: 'Systems', path: '/phase3/systems', icon: <Server />, phase: 'development' },
  ];

  // Determine active phase and items
  const currentPhase = currentMeeting?.phase || 'discovery';
  const isEnglish = currentPhase === 'development';

  let navigationItems: NavigationItem[] = [];
  if (currentPhase === 'discovery') {
    navigationItems = discoveryItems;
  } else if (currentPhase === 'implementation_spec') {
    navigationItems = [...discoveryItems, ...implementationItems];
  } else if (currentPhase === 'development') {
    navigationItems = [...discoveryItems, ...implementationItems, ...developmentItems];
  }

  const getProgressIndicator = (moduleKey?: string) => {
    if (!moduleKey || !moduleProgress[moduleKey]) return null;

    const progress = moduleProgress[moduleKey];
    if (progress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (progress > 0) {
      return <Badge variant="primary" size="sm">{progress}%</Badge>;
    }
    return <Circle className="w-4 h-4 text-gray-300" />;
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="w-64 bg-white border-l border-gray-200 h-screen overflow-y-auto sticky top-0"
      dir={isEnglish ? 'ltr' : 'rtl'}
      aria-label={isEnglish ? 'Main Navigation' : 'ניווט ראשי'}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          {isEnglish ? 'Discovery Assistant' : 'מנהל גילויים'}
        </h2>
        {currentMeeting && (
          <p className="text-sm text-gray-600 mt-1 truncate" title={currentMeeting.clientName}>
            {currentMeeting.clientName}
          </p>
        )}
      </div>

      {/* Phase indicator */}
      {currentMeeting && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            {currentPhase === 'discovery' && <FileText className="w-4 h-4 text-blue-600" />}
            {currentPhase === 'implementation_spec' && <Briefcase className="w-4 h-4 text-blue-600" />}
            {currentPhase === 'development' && <Code className="w-4 h-4 text-blue-600" />}
            <span className="text-sm font-medium text-blue-900">
              {currentPhase === 'discovery' && (isEnglish ? 'Phase 1: Discovery' : 'שלב 1: גילוי')}
              {currentPhase === 'implementation_spec' && (isEnglish ? 'Phase 2: Spec' : 'שלב 2: מפרט')}
              {currentPhase === 'development' && 'Phase 3: Development'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="p-2">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const label = isEnglish && item.labelEn ? item.labelEn : item.label;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${active
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
                ${isEnglish ? 'text-left' : 'text-right'}
              `}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {getProgressIndicator(item.moduleKey)}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
