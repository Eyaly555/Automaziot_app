import React from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalNavigation } from './GlobalNavigation';
import { Breadcrumbs } from './Breadcrumbs';
import { QuickActions } from './QuickActions';
import { useMeetingStore } from '../../store/useMeetingStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * App Layout Component
 * Main layout wrapper with sidebar navigation, breadcrumbs, and quick actions
 * Adapts to current phase and language settings
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentMeeting } = useMeetingStore();

  const isEnglish = currentMeeting?.phase === 'development';

  // Routes where we hide the sidebar (login, clients list, mobile)
  const hideSidebarRoutes = ['/login', '/clients', '/mobile'];
  const shouldHideSidebar = hideSidebarRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Routes where we hide breadcrumbs
  const hideBreadcrumbsRoutes = ['/login', '/clients', '/dashboard'];
  const shouldHideBreadcrumbs = hideBreadcrumbsRoutes.includes(location.pathname);

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={isEnglish ? 'ltr' : 'rtl'}
    >
      {/* Main layout container */}
      <div className="flex">
        {/* Sidebar Navigation - Right side for RTL, Left for LTR */}
        {!shouldHideSidebar && (
          <aside className={`flex-shrink-0 ${isEnglish ? 'order-first' : 'order-last'}`}>
            <GlobalNavigation />
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          {!shouldHideBreadcrumbs && <Breadcrumbs />}

          {/* Page content */}
          <div className="relative">
            {children}
          </div>

          {/* Quick Actions - floating bottom bar */}
          <QuickActions />
        </main>
      </div>
    </div>
  );
};
