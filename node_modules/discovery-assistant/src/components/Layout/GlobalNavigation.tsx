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
  ChevronDown,
  ChevronUp,
  AlertCircle,
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
  const { currentMeeting, getModuleProgress, getPhaseProgress } =
    useMeetingStore();

  const moduleProgress = getModuleProgress();

  // Phase 1 - Discovery navigation sub-items (without Dashboard and Proposal)
  const discoveryModuleItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'סקירה כללית',
      path: '/module/overview',
      icon: <FileText />,
      moduleKey: 'overview',
    },
    {
      id: 'essentialDetails',
      label: 'איפיון ממוקד',
      path: '/module/essentialDetails',
      icon: <Target />,
      moduleKey: 'essentialDetails',
    },
    {
      id: 'leadsAndSales',
      label: 'לידים ומכירות',
      path: '/module/leadsAndSales',
      icon: <Users />,
      moduleKey: 'leadsAndSales',
    },
    {
      id: 'customerService',
      label: 'שירות לקוחות',
      path: '/module/customerService',
      icon: <Package />,
      moduleKey: 'customerService',
    },
    {
      id: 'operations',
      label: 'תפעול',
      path: '/module/operations',
      icon: <Settings />,
      moduleKey: 'operations',
    },
    {
      id: 'reporting',
      label: 'דיווח',
      path: '/module/reporting',
      icon: <BarChart3 />,
      moduleKey: 'reporting',
    },
    {
      id: 'aiAgents',
      label: 'סוכני AI',
      path: '/module/aiAgents',
      icon: <Bot />,
      moduleKey: 'aiAgents',
    },
    {
      id: 'systems',
      label: 'מערכות',
      path: '/module/systems',
      icon: <Server />,
      moduleKey: 'systems',
    },
    {
      id: 'roi',
      label: 'ROI',
      path: '/module/roi',
      icon: <TrendingUp />,
      moduleKey: 'roi',
    },
  ];

  // Phase 2 - top-level static items inside the group
  const implementationStaticItems: NavigationItem[] = [
    {
      id: 'phase2-dashboard',
      label: 'מפרט יישום – לוח',
      labelEn: 'Spec Dashboard',
      path: '/phase2',
      icon: <Briefcase />,
      phase: 'implementation_spec',
    },
    {
      id: 'phase2-requirements',
      label: 'איסוף דרישות',
      labelEn: 'Requirements',
      path: '/phase2/service-requirements',
      icon: <FileText />,
      phase: 'implementation_spec',
    },
  ];

  // Phase 3 - Development navigation items
  const developmentItems: NavigationItem[] = [
    {
      id: 'phase3-dashboard',
      label: 'Development Dashboard',
      path: '/phase3',
      icon: <Code />,
      phase: 'development',
    },
    {
      id: 'phase3-sprints',
      label: 'Sprints',
      path: '/phase3/sprints',
      icon: <Rocket />,
      phase: 'development',
    },
    {
      id: 'phase3-systems',
      label: 'Systems',
      path: '/phase3/systems',
      icon: <Server />,
      phase: 'development',
    },
  ];

  // Determine active phase and items
  const currentPhase = currentMeeting?.phase || 'discovery';
  const isEnglish = currentPhase === 'development';

  // Collapse state (defaults depend on phase)
  const [discoveryOpen, setDiscoveryOpen] = React.useState(
    currentPhase === 'discovery'
  );
  const [specOpen, setSpecOpen] = React.useState(
    currentPhase === 'implementation_spec'
  );

  React.useEffect(() => {
    // Auto toggle groups when phase changes
    setDiscoveryOpen(currentPhase === 'discovery');
    setSpecOpen(currentPhase === 'implementation_spec');
  }, [currentPhase]);

  const getProgressIndicator = (moduleKey?: string) => {
    if (!moduleKey) return null;

    const moduleData = moduleProgress.find((m) => m.moduleId === moduleKey);
    if (!moduleData) return null;

    // Calculate percentage from completed and total
    const progress =
      moduleData.total > 0
        ? Math.round((moduleData.completed / moduleData.total) * 100)
        : 0;
    if (progress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (progress > 0) {
      return (
        <Badge variant="primary" size="sm">
          {progress}%
        </Badge>
      );
    }
    return <Circle className="w-4 h-4 text-gray-300" />;
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  // Phase progress badges for group headers
  const discoveryProgress = getPhaseProgress('discovery');
  const specProgress = getPhaseProgress('implementation_spec');

  // Phase 2 purchased services
  const purchasedServices =
    currentMeeting?.modules?.proposal?.purchasedServices || [];

  // Build a set of completed service IDs from implementationSpec
  const completedServiceIds = React.useMemo(() => {
    const set = new Set<string>();
    const spec = currentMeeting?.implementationSpec as any;
    if (!spec) return set;
    const collect = (arr?: any[]) =>
      arr?.forEach((x) => {
        if (x?.serviceId) set.add(x.serviceId);
      });
    collect(spec.automations);
    collect(spec.aiAgentServices);
    collect(spec.integrationServices);
    collect(spec.systemImplementations);
    collect(spec.additionalServices);
    return set;
  }, [currentMeeting?.implementationSpec]);

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
          <p
            className="text-sm text-gray-600 mt-1 truncate"
            title={currentMeeting.clientName}
          >
            {currentMeeting.clientName}
          </p>
        )}
      </div>

      {/* Phase indicator */}
      {currentMeeting && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            {currentPhase === 'discovery' && (
              <FileText className="w-4 h-4 text-blue-600" />
            )}
            {currentPhase === 'implementation_spec' && (
              <Briefcase className="w-4 h-4 text-blue-600" />
            )}
            {currentPhase === 'development' && (
              <Code className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium text-blue-900">
              {currentPhase === 'discovery' &&
                (isEnglish ? 'Phase 1: Discovery' : 'שלב 1: גילוי')}
              {currentPhase === 'implementation_spec' &&
                (isEnglish ? 'Phase 2: Spec' : 'שלב 2: מפרט')}
              {currentPhase === 'development' && 'Phase 3: Development'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="p-2">
        {/* Dashboard on top */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
            transition-all duration-200
            ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
            ${isEnglish ? 'text-left' : 'text-right'}
          `}
          aria-current={isActive('/dashboard') ? 'page' : undefined}
        >
          <span
            className={`flex-shrink-0 ${isActive('/dashboard') ? 'text-blue-700' : 'text-gray-500'}`}
          >
            <Home />
          </span>
          <span className="flex-1 truncate">
            {isEnglish ? 'Dashboard' : 'לוח בקרה'}
          </span>
        </button>

        {/* Discovery group */}
        <div className="mt-2">
          <button
            onClick={() => setDiscoveryOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              ${discoveryOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}
              ${isEnglish ? 'text-left' : 'text-right'}
            `}
          >
            <span className="flex-shrink-0 text-gray-600">
              <FileText />
            </span>
            <span className="flex-1 truncate">
              {isEnglish ? 'Phase 1: Discovery' : 'שלב 1: גילוי'}
            </span>
            <span className="ml-2">
              {discoveryProgress >= 100 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Badge variant="primary" size="sm">
                  {discoveryProgress}%
                </Badge>
              )}
            </span>
            {discoveryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {discoveryOpen && (
            <div className="mt-1 space-y-1">
              {discoveryModuleItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                      ${isEnglish ? 'text-left' : 'text-right'}
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={`flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {getProgressIndicator(item.moduleKey)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Proposal single item */}
        <div className="mt-2">
          <button
            onClick={() => navigate('/module/proposal')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              ${isActive('/module/proposal') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
              ${isEnglish ? 'text-left' : 'text-right'}
            `}
          >
            <span
              className={`flex-shrink-0 ${isActive('/module/proposal') ? 'text-blue-700' : 'text-gray-500'}`}
            >
              <FileCheck />
            </span>
            <span className="flex-1 truncate">
              {isEnglish ? 'Proposal' : 'הצעה'}
            </span>
          </button>
        </div>

        {/* Phase 2 group */}
        <div className="mt-2">
          <button
            onClick={() => setSpecOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              ${specOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}
              ${isEnglish ? 'text-left' : 'text-right'}
            `}
          >
            <span className="flex-shrink-0 text-gray-600">
              <Briefcase />
            </span>
            <span className="flex-1 truncate">
              {isEnglish ? 'Phase 2: Implementation Spec' : 'שלב 2: מפרט יישום'}
            </span>
            <span className="ml-2">
              {specProgress >= 100 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Badge variant="primary" size="sm">
                  {specProgress}%
                </Badge>
              )}
            </span>
            {specOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {specOpen && (
            <div className="mt-1 space-y-1">
              {implementationStaticItems.map((item) => {
                const active = isActive(item.path);
                const disabled = currentPhase !== 'implementation_spec';
                return (
                  <button
                    key={item.id}
                    onClick={() => !disabled && navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      ${active ? 'bg-blue-100 text-blue-700 font-medium' : disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
                      ${isEnglish ? 'text-left' : 'text-right'}
                    `}
                    aria-current={active ? 'page' : undefined}
                    title={disabled ? 'יש לקבל אישור לקוח' : undefined}
                  >
                    <span
                      className={`flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">
                      {isEnglish && item.labelEn ? item.labelEn : item.label}
                    </span>
                  </button>
                );
              })}

              {/* Dynamic purchased services */}
              {purchasedServices.length === 0 ? (
                <button
                  onClick={() => navigate('/module/proposal')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100
                    ${isEnglish ? 'text-left' : 'text-right'}
                  `}
                >
                  <span className="flex-shrink-0 text-gray-500">
                    <AlertCircle />
                  </span>
                  <span className="flex-1 truncate">
                    {isEnglish
                      ? 'No purchased services – go to Proposal'
                      : 'לא נרכשו שירותים – עבור להצעה'}
                  </span>
                </button>
              ) : (
                purchasedServices.map((svc: any) => {
                  const path = `/phase2/service-requirements/${svc.id}`;
                  const active = isActive(path);
                  const isDone = completedServiceIds.has(svc.id);
                  const disabled = currentPhase !== 'implementation_spec';
                  return (
                    <button
                      key={svc.id}
                      onClick={() => !disabled && navigate(path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        ${active ? 'bg-blue-100 text-blue-700 font-medium' : disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
                        ${isEnglish ? 'text-left' : 'text-right'}
                      `}
                      aria-current={active ? 'page' : undefined}
                      title={disabled ? 'יש לקבל אישור לקוח' : undefined}
                    >
                      <span
                        className={`flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`}
                      >
                        <FileText />
                      </span>
                      <span className="flex-1 truncate">
                        {svc.nameHe || svc.name}
                      </span>
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Phase 3 static items (if needed) */}
        {currentPhase === 'development' && (
          <div className="mt-2">
            {developmentItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                    ${isEnglish ? 'text-left' : 'text-right'}
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className={`flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
