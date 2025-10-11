import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

interface Breadcrumb {
  label: string;
  path: string;
}

/**
 * Breadcrumbs Component
 * Dynamic breadcrumb navigation based on current route
 * RTL-aware with proper chevron direction
 */
export const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMeeting } = useMeetingStore();

  const isEnglish = currentMeeting?.phase === 'development';
  const dir = isEnglish ? 'ltr' : 'rtl';
  const ChevronIcon = isEnglish ? ChevronRight : ChevronLeft;

  // Map routes to breadcrumb labels
  const routeLabels: Record<string, { he: string; en: string }> = {
    '/dashboard': { he: 'לוח בקרה', en: 'Dashboard' },
    '/clients': { he: 'לקוחות', en: 'Clients' },
    '/wizard': { he: 'אשף', en: 'Wizard' },
    '/summary': { he: 'סיכום', en: 'Summary' },
    '/module/overview': { he: 'סקירה כללית', en: 'Overview' },
    '/module/leadsAndSales': { he: 'לידים ומכירות', en: 'Leads & Sales' },
    '/module/customerService': { he: 'שירות לקוחות', en: 'Customer Service' },
    '/module/operations': { he: 'תפעול', en: 'Operations' },
    '/module/reporting': { he: 'דיווח', en: 'Reporting' },
    '/module/aiAgents': { he: 'סוכני AI', en: 'AI Agents' },
    '/module/systems': { he: 'מערכות', en: 'Systems' },
    '/module/roi': { he: 'ROI', en: 'ROI' },
    '/module/proposal': { he: 'הצעה', en: 'Proposal' },
    '/phase2': { he: 'מפרט יישום', en: 'Implementation Spec' },
    '/phase2/systems': { he: 'מערכות מפורטות', en: 'System Details' },
    '/phase2/integrations': { he: 'זרימות אינטגרציה', en: 'Integration Flows' },
    '/phase2/agents': { he: 'מפרט AI', en: 'AI Agents Spec' },
    '/phase2/acceptance': { he: 'קריטריוני קבלה', en: 'Acceptance Criteria' },
    '/phase3': { he: 'ניהול פיתוח', en: 'Development Dashboard' },
    '/phase3/sprints': { he: 'ספרינטים', en: 'Sprints' },
    '/phase3/systems': { he: 'תצוגת מערכות', en: 'System View' },
    '/phase3/blockers': { he: 'חסימות', en: 'Blockers' },
    '/phase3/progress': { he: 'מעקב התקדמות', en: 'Progress Tracking' },
    '/settings/ai': { he: 'הגדרות AI', en: 'AI Settings' },
  };

  // Build breadcrumb path from current location
  const buildBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [];
    const pathParts = location.pathname.split('/').filter(Boolean);

    // Always start with home
    breadcrumbs.push({
      label: isEnglish ? 'Home' : 'בית',
      path: '/dashboard',
    });

    // Build cumulative path
    let currentPath = '';
    for (const part of pathParts) {
      currentPath += `/${part}`;

      const routeInfo = routeLabels[currentPath];
      if (routeInfo) {
        breadcrumbs.push({
          label: isEnglish ? routeInfo.en : routeInfo.he,
          path: currentPath,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't show breadcrumbs on home/clients page
  if (breadcrumbs.length <= 1 || location.pathname === '/clients') {
    return null;
  }

  return (
    <nav
      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200"
      aria-label={isEnglish ? 'Breadcrumb' : 'ניווט מסלול'}
      dir={dir}
    >
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={breadcrumb.path}>
            {/* Breadcrumb item */}
            {isLast ? (
              <span className="text-sm font-medium text-gray-900" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(breadcrumb.path)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {isFirst && <Home className="w-4 h-4" />}
                {breadcrumb.label}
              </button>
            )}

            {/* Separator */}
            {!isLast && <ChevronIcon className="w-4 h-4 text-gray-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
