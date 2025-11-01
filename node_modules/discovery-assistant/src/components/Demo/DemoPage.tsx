/**
 * Demo Page Component
 * Main page for demonstrating AI agents with resizable, draggable, and minimizable cards
 * Uses React Grid Layout for responsive agent comparison dashboard
 * Fully optimized for mobile, tablet, and desktop viewports
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DemoPage.css';
import { DEMO_AGENTS } from '../../config/demoAgents';
import { Button } from '../Base/Button';
import { AgentWithTableCard } from './AgentWithTableCard';
import { FadeIn, SlideIn } from '../Feedback/PageTransition';

// Wrap GridLayout with WidthProvider for responsive width handling
const ResponsiveGridLayout = WidthProvider(GridLayout);

// Responsive breakpoint detection hook for grid configuration
const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(12);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      // Mobile: 1 column, Tablet: 2 columns, Desktop: 2 columns (for side-by-side)
      if (width < 768) {
        setColumns(1); // Mobile: single column layout
      } else if (width < 1024) {
        setColumns(2); // Tablet: two columns
      } else {
        setColumns(12); // Desktop: full grid flexibility
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};

interface GridItem {
  id: string;
  isMinimized: boolean;
}

/**
 * Demo Page Component
 * Displays a resizable, draggable grid of agents with minimize/remove capabilities
 */
export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const columns = useResponsiveColumns();

  // Initialize with enabled agents
  const enabledAgents = DEMO_AGENTS.filter(agent => !agent.disabled);
  const [visibleAgents, setVisibleAgents] = useState<GridItem[]>(
    enabledAgents.map(agent => ({ id: agent.id, isMinimized: false }))
  );

  // Responsive layout calculation based on viewport
  const calculateResponsiveLayout = useCallback((items: GridItem[], cols: number): Layout[] => {
    return items.map((item, index) => {
      if (cols === 1) {
        // Mobile: full width, stacked vertically
        return {
          i: item.id,
          x: 0,
          y: index * 6,
          w: 1,
          h: 6,
          minW: 1,
          minH: 4,
          static: false
        };
      } else if (cols === 2) {
        // Tablet: 2 columns
        return {
          i: item.id,
          x: index % 2,
          y: Math.floor(index / 2) * 6,
          w: 1,
          h: 6,
          minW: 1,
          minH: 4,
          static: false
        };
      } else {
        // Desktop: flexible grid (12 columns)
        return {
          i: item.id,
          x: (index % 2) * 6,
          y: Math.floor(index / 2) * 8,
          w: 6,
          h: 8,
          minW: 3,
          minH: 4,
          static: false
        };
      }
    });
  }, []);

  // Grid layout state - recalculate when columns change
  const [layout, setLayout] = useState<Layout[]>(() =>
    calculateResponsiveLayout(visibleAgents, columns)
  );

  // Update layout when columns change (responsive breakpoint)
  useEffect(() => {
    setLayout(calculateResponsiveLayout(visibleAgents, columns));
  }, [columns, visibleAgents, calculateResponsiveLayout]);

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleAddAgent = useCallback(() => {
    // Find agents not currently visible
    const visibleIds = visibleAgents.map(a => a.id);
    const availableAgent = DEMO_AGENTS.find(a => !visibleIds.includes(a.id) && !a.disabled);

    if (availableAgent) {
      const newItem: GridItem = { id: availableAgent.id, isMinimized: false };
      const updatedAgents = [...visibleAgents, newItem];
      setVisibleAgents(updatedAgents);
      // Layout will be recalculated by useEffect
    }
  }, [visibleAgents]);

  const handleRemoveAgent = useCallback((agentId: string) => {
    setVisibleAgents(prev => prev.filter(item => item.id !== agentId));
    setLayout(prev => prev.filter(item => item.i !== agentId));
  }, []);

  const handleToggleMinimize = useCallback((agentId: string) => {
    setVisibleAgents(prev =>
      prev.map(item =>
        item.id === agentId ? { ...item, isMinimized: !item.isMinimized } : item
      )
    );
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  // Check if there are more agents available to add
  const hasMoreAgentsAvailable = visibleAgents.length < DEMO_AGENTS.filter(a => !a.disabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
      {/* Header - Mobile optimized with safe area support */}
      <header
        className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))'
        }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <FadeIn>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  הדגמת סוכני AI
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  השוו בין סוכני AI בגדלים וצורות שונות
                </p>
              </div>
            </FadeIn>

            {/* Mobile: Full width buttons, Desktop: Auto width */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {hasMoreAgentsAvailable && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={20} />}
                  iconPosition="right"
                  onClick={handleAddAgent}
                  className="flex-1 sm:flex-none text-gray-700 dark:text-gray-300 min-h-[44px] sm:min-h-0"
                >
                  <span className="hidden sm:inline">הוסף סוכן</span>
                  <span className="sm:hidden">הוסף</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="md"
                icon={<Home size={20} />}
                iconPosition="right"
                onClick={handleNavigateHome}
                className="flex-1 sm:flex-none text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] sm:min-h-0"
              >
                <span className="hidden sm:inline">חזור לעמוד הראשי</span>
                <span className="sm:hidden">חזרה</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile optimized spacing */}
      <main className="w-full px-3 py-4 sm:p-6 lg:p-8">
        {/* Introduction Section - Mobile friendly text size */}
        <SlideIn direction="down" delay={0.1}>
          <div className="mb-4 sm:mb-6 text-center px-2">
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              בעזרת סוכני AI שלנו, תוכל לחוות ממשק שיחה מתקדם ואינטליגנטי.
              {/* Show extended text only on larger screens */}
              <span className="hidden sm:inline">
                {' '}כל סוכן ניתן לשינוי גודל, הזעה וסרה מהרשת.
              </span>
            </p>
          </div>
        </SlideIn>

        {/* Resizable Agents Grid - Responsive configuration */}
        <div className="bg-white/40 dark:bg-slate-800/40 rounded-lg p-2 sm:p-4 mb-4 sm:mb-6 w-full">
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            onLayoutChange={handleLayoutChange}
            cols={columns}
            rowHeight={50}
            isDraggable={columns > 1}
            isResizable={columns > 1}
            containerPadding={[8, 8]}
            margin={[8, 8]}
            compactType="vertical"
            preventCollision={false}
            useCSSTransforms={true}
            measureBeforeMount={false}
            draggableHandle=".drag-handle"
          >
            {visibleAgents.map(item => {
              const agent = DEMO_AGENTS.find(a => a.id === item.id);
              if (!agent) return null;

              return (
                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                  <AgentWithTableCard
                    agent={agent}
                    isMinimized={item.isMinimized}
                    onToggleMinimize={handleToggleMinimize}
                    onRemove={handleRemoveAgent}
                  />
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>

        {/* Info Section - Mobile optimized */}
        <SlideIn direction="up" delay={0.3}>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 max-w-3xl mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3">
              💡 טיפ: כיצד להשתמש בסוכנים
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
              {/* Show full instructions on desktop */}
              {columns > 1 && (
                <>
                  <li>• גרור את קצוות הכרטיס כדי לשנות את הגודל</li>
                  <li>• גרור את הכרטיס בכותרת כדי להזיז אותו</li>
                </>
              )}
              {/* Essential instructions for all screen sizes */}
              <li>• לחץ על אייקון החיצי כדי להזעיר/להרחיב את הכרטיס</li>
              <li>• לחץ על אייקון X כדי להסיר כרטיס</li>
              <li>• השתמש בכפתור "הוסף סוכן" כדי להציג סוכנים נוספים</li>
              <li className="hidden sm:list-item">• כל סוכן מוצג עם ממשק צ'אט וטבלת נתונים בזמן אמת</li>
              {/* Mobile-specific tip */}
              {columns === 1 && (
                <li className="font-semibold">📱 במובייל: גלול למעלה ולמטה לצפייה בכל הסוכנים</li>
              )}
            </ul>
          </div>
        </SlideIn>
      </main>
    </div>
  );
};

export default DemoPage;
