/**
 * Demo Page Component
 * Main page for demonstrating AI agents
 * Allows selection of agents and displays N8N chat widget
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { DemoAgent } from '../../types/demoAgents';
import { DEMO_AGENTS } from '../../config/demoAgents';
import { Button } from '../Base/Button';
import { AgentCard } from './AgentCard';
import { N8NChatWidget } from './N8NChatWidget';
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from '../Feedback/PageTransition';

/**
 * Demo Page Component
 * Displays agent selection grid and chat interface
 */
export const DemoPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<DemoAgent | null>(null);
  const navigate = useNavigate();

  const handleSelectAgent = (agent: DemoAgent) => {
    setSelectedAgent(agent);
  };

  const handleBackToSelection = () => {
    setSelectedAgent(null);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  // Main content: Agent selection view
  if (!selectedAgent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <FadeIn>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  הדגמת סוכני AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  בחר סוכן AI כדי לראות את היכולות שלו בפעולה
                </p>
              </div>
            </FadeIn>

            <Button
              variant="ghost"
              size="md"
              icon={<Home size={20} />}
              iconPosition="right"
              onClick={handleNavigateHome}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              חזור לעמוד הראשי
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction Section */}
          <SlideIn direction="down" delay={0.1}>
            <div className="mb-12 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                בעזרת סוכני AI שלנו, תוכל לחוות ממשק שיחה מתקדם ואינטליגנטי.
                כל סוכן מתמחה בתחום שונה ומוכן לעזור בשאלות ובעיות ספציפיות.
              </p>
            </div>
          </SlideIn>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerChildren staggerDelay={0.1}>
              {DEMO_AGENTS.map(agent => (
                <StaggerItem key={agent.id}>
                  <AgentCard
                    agent={agent}
                    onSelect={handleSelectAgent}
                    isSelected={selectedAgent?.id === agent.id}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          {/* Info Section */}
          <SlideIn direction="up" delay={0.3}>
            <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                💡 טיפ: כיצד להשתמש בסוכנים
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                <li>• בחר סוכן מהרשת למעלה</li>
                <li>• השתמש בשדה השיחה כדי לשאול שאלות או להציג בעיות</li>
                <li>• הסוכן יענה בעברית עם מידע רלוונטי ופתרונות</li>
                <li>• אתה יכול לחזור בחזרה לבחירת סוכן בכל עת</li>
              </ul>
            </div>
          </SlideIn>
        </main>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900" dir="rtl">
      {/* Chat Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-full">
          <FadeIn>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <span className="text-white text-sm font-semibold">
                  {selectedAgent.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedAgent.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedAgent.category}
                </p>
              </div>
            </div>
          </FadeIn>

          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={handleBackToSelection}
          >
            בחר סוכן אחר
          </Button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
        <N8NChatWidget
          webhookUrl={selectedAgent.webhookUrl}
          agentName={selectedAgent.name}
          initialMessages={selectedAgent.initialMessages}
          metadata={{
            agentId: selectedAgent.id,
            agentCategory: selectedAgent.category
          }}
        />
      </div>
    </div>
  );
};

export default DemoPage;
