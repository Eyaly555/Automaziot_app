import { useState, useRef, useEffect } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import {
  exportDiscoveryToExcel,
  exportImplementationSpecToExcel,
  exportDevelopmentToExcel,
} from '../../utils/exportExcel';
import {
  exportTasksToJiraCSV,
  exportTasksToGitHubCSV,
  exportTasksToGenericCSV,
  exportSprintSummaryToCSV,
  exportBlockersToCSV,
} from '../../utils/exportCSV';
import {
  exportMeetingToJSON,
  exportDiscoveryToJSON,
  exportImplementationSpecToJSON,
  exportDevelopmentToJSON,
  exportSystemsInventoryToJSON,
  exportROIAnalysisToJSON,
  exportTasksToJSON,
  exportN8NWorkflowsToJSON,
  exportPainPointsToJSON,
  copyMeetingToClipboard,
} from '../../utils/exportJSON';
import {
  exportDiscoveryPDF,
  exportImplementationSpecPDF,
  exportDevelopmentPDF,
} from '../../utils/exportTechnicalSpec';
import { exportToMarkdown, exportToText } from '../../utils/englishExport';
import type { Meeting } from '../../types';

interface ExportMenuProps {
  variant?: 'button' | 'icon';
  className?: string;
}

/**
 * Unified export menu component providing access to all export formats
 * Supports Discovery, Implementation Spec, and Development phases
 */
export function ExportMenu({
  variant = 'button',
  className = '',
}: ExportMenuProps) {
  const { currentMeeting } = useMeetingStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentMeeting) {
    return null;
  }

  const phase = currentMeeting.phase || 'discovery';

  const handleExport = async (
    exportFn: (meeting: Meeting) => void | Promise<void>
  ) => {
    try {
      await exportFn(currentMeeting);
      setIsOpen(false);
      setActiveSubmenu(null);
    } catch (error) {
      console.error('Export error:', error);
      alert('שגיאה בייצוא הקובץ. אנא נסה שוב.');
    }
  };

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  return (
    <div
      className={`export-menu-container relative ${className}`}
      ref={menuRef}
    >
      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`export-menu-button ${variant === 'icon' ? 'icon-variant' : 'button-variant'}`}
        style={{
          padding: variant === 'icon' ? '8px' : '10px 20px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = '#4338CA')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = '#4F46E5')
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {variant === 'button' && <span>ייצוא</span>}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="export-menu-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: '280px',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {/* PDF Section */}
          <div className="menu-section">
            <div
              className="menu-header"
              style={{
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151',
              }}
            >
              PDF
            </div>

            <MenuItem
              icon="📄"
              label="דוח גילוי (PDF)"
              onClick={() => handleExport(exportDiscoveryPDF)}
            />

            {(phase === 'implementation_spec' ||
              phase === 'development' ||
              phase === 'completed') && (
              <MenuItem
                icon="📋"
                label="מפרט טכני (PDF)"
                onClick={() => handleExport(exportImplementationSpecPDF)}
              />
            )}

            {(phase === 'development' || phase === 'completed') && (
              <MenuItem
                icon="📊"
                label="דוח התקדמות (PDF)"
                onClick={() => handleExport(exportDevelopmentPDF)}
              />
            )}
          </div>

          {/* Excel Section */}
          <div className="menu-section">
            <div
              className="menu-header"
              style={{
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151',
              }}
            >
              Excel
            </div>

            <MenuItem
              icon="📊"
              label="נתוני גילוי (Excel)"
              onClick={() => handleExport(exportDiscoveryToExcel)}
            />

            {(phase === 'implementation_spec' ||
              phase === 'development' ||
              phase === 'completed') && (
              <MenuItem
                icon="🔧"
                label="מפרט יישום (Excel)"
                onClick={() => handleExport(exportImplementationSpecToExcel)}
              />
            )}

            {(phase === 'development' || phase === 'completed') && (
              <MenuItem
                icon="✅"
                label="משימות פיתוח (Excel)"
                onClick={() => handleExport(exportDevelopmentToExcel)}
              />
            )}
          </div>

          {/* CSV Section (Development phase only) */}
          {(phase === 'development' || phase === 'completed') && (
            <div className="menu-section">
              <div
                className="menu-header"
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#374151',
                }}
              >
                CSV
              </div>

              <MenuItem
                icon="🔄"
                label="ייבוא ל-Jira (CSV)"
                onClick={() => handleExport(exportTasksToJiraCSV)}
              />

              <MenuItem
                icon="🐙"
                label="ייבוא ל-GitHub (CSV)"
                onClick={() => handleExport(exportTasksToGitHubCSV)}
              />

              <MenuItem
                icon="📝"
                label="משימות כלליות (CSV)"
                onClick={() => handleExport(exportTasksToGenericCSV)}
              />

              <MenuItem
                icon="🏃"
                label="סיכום ספרינטים (CSV)"
                onClick={() => handleExport(exportSprintSummaryToCSV)}
              />

              <MenuItem
                icon="🚫"
                label="חסמים (CSV)"
                onClick={() => handleExport(exportBlockersToCSV)}
              />
            </div>
          )}

          {/* JSON Section */}
          <div className="menu-section">
            <div
              className="menu-header"
              style={{
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => toggleSubmenu('json')}
            >
              <span>JSON</span>
              <span
                style={{
                  transform:
                    activeSubmenu === 'json' ? 'rotate(180deg)' : 'none',
                }}
              >
                ▼
              </span>
            </div>

            {activeSubmenu === 'json' && (
              <>
                <MenuItem
                  icon="💾"
                  label="גיבוי מלא (JSON)"
                  onClick={() => handleExport(exportMeetingToJSON)}
                  indented
                />

                <MenuItem
                  icon="🔍"
                  label="נתוני גילוי (JSON)"
                  onClick={() => handleExport(exportDiscoveryToJSON)}
                  indented
                />

                {(phase === 'implementation_spec' ||
                  phase === 'development' ||
                  phase === 'completed') && (
                  <MenuItem
                    icon="🔧"
                    label="מפרט יישום (JSON)"
                    onClick={() => handleExport(exportImplementationSpecToJSON)}
                    indented
                  />
                )}

                {(phase === 'development' || phase === 'completed') && (
                  <MenuItem
                    icon="💻"
                    label="פיתוח (JSON)"
                    onClick={() => handleExport(exportDevelopmentToJSON)}
                    indented
                  />
                )}

                <MenuItem
                  icon="🖥️"
                  label="מלאי מערכות (JSON)"
                  onClick={() => handleExport(exportSystemsInventoryToJSON)}
                  indented
                />

                <MenuItem
                  icon="💰"
                  label="ניתוח ROI (JSON)"
                  onClick={() => handleExport(exportROIAnalysisToJSON)}
                  indented
                />

                <MenuItem
                  icon="⚠️"
                  label="נקודות כאב (JSON)"
                  onClick={() => handleExport(exportPainPointsToJSON)}
                  indented
                />

                {(phase === 'development' || phase === 'completed') && (
                  <MenuItem
                    icon="✅"
                    label="משימות (JSON)"
                    onClick={() => handleExport(exportTasksToJSON)}
                    indented
                  />
                )}

                {(phase === 'implementation_spec' ||
                  phase === 'development' ||
                  phase === 'completed') && (
                  <MenuItem
                    icon="🔄"
                    label="תבניות n8n (JSON)"
                    onClick={() => handleExport(exportN8NWorkflowsToJSON)}
                    indented
                  />
                )}
              </>
            )}
          </div>

          {/* Markdown/Text Section */}
          <div className="menu-section">
            <div
              className="menu-header"
              style={{
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontWeight: '600',
                fontSize: '13px',
                color: '#374151',
              }}
            >
              טקסט
            </div>

            <MenuItem
              icon="📝"
              label="Markdown"
              onClick={() => handleExport(exportToMarkdown)}
            />

            <MenuItem
              icon="📄"
              label="Text"
              onClick={() => handleExport(exportToText)}
            />

            <MenuItem
              icon="📋"
              label="העתק ללוח"
              onClick={() => handleExport(copyMeetingToClipboard)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  indented?: boolean;
}

function MenuItem({ icon, label, onClick, indented = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="menu-item"
      style={{
        width: '100%',
        padding: indented ? '10px 16px 10px 32px' : '10px 16px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#374151',
        textAlign: 'right',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
