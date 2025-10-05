import React from 'react';
import { Undo, Redo, Save, Download, Zap } from 'lucide-react';
import { Button } from '../Base/Button';

export interface IntegrationFlowToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onTemplates?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  unsavedChanges: boolean;
}

/**
 * IntegrationFlowToolbar Component
 *
 * Sticky toolbar for integration flow builder with history management,
 * save functionality, and export options.
 *
 * Features:
 * - Undo/Redo buttons with state management
 * - Save button with unsaved changes indicator
 * - Export button for flow download
 * - Templates button (optional)
 * - Sticky positioning below main header
 * - Integration with Button base component
 *
 * @param onUndo - Callback for undo action
 * @param onRedo - Callback for redo action
 * @param onSave - Callback for save action
 * @param onExport - Callback for export action
 * @param onTemplates - Optional callback for templates modal
 * @param canUndo - Whether undo is available
 * @param canRedo - Whether redo is available
 * @param unsavedChanges - Whether there are unsaved changes
 */
export const IntegrationFlowToolbar: React.FC<IntegrationFlowToolbarProps> = ({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onTemplates,
  canUndo,
  canRedo,
  unsavedChanges
}) => {
  return (
    <div
      className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-30 shadow-sm"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - History Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Undo className="w-4 h-4" />}
            iconPosition="right"
            onClick={onUndo}
            disabled={!canUndo}
            ariaLabel="—Ÿÿ’‹ ‰‚’‹‘ –◊Ë’‡‘"
          >
            —Ÿÿ’‹
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Redo className="w-4 h-4" />}
            iconPosition="right"
            onClick={onRedo}
            disabled={!canRedo}
            ariaLabel="◊÷Ë‘ ‚‹ ‰‚’‹‘"
          >
            ◊÷Ë‘
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 mx-1" />

          {/* Templates Button */}
          {onTemplates && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Zap className="w-4 h-4" />}
              iconPosition="right"
              onClick={onTemplates}
              ariaLabel="‰Í◊ Í—‡Ÿ’Í ÷ËŸﬁ‘"
            >
              Í—‡Ÿ’Í
            </Button>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Unsaved Changes Indicator */}
          {unsavedChanges && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-600 font-medium">
                ÈŸ‡’ŸŸ› ‹– ‡ÈﬁË’
              </span>
            </div>
          )}

          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            iconPosition="right"
            onClick={onExport}
            ariaLabel="ŸŸÊ’– ÷ËŸﬁ‘"
          >
            ŸŸÊ’–
          </Button>

          {/* Save Button */}
          <Button
            variant="success"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            iconPosition="right"
            onClick={onSave}
            ariaLabel="Èﬁ’Ë ÷ËŸﬁ‘"
          >
            Èﬁ’Ë
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span>ÁŸÊ’ËŸ ﬁÁ‹”Í: </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs mx-1">
          Ctrl+Z
        </kbd>
        <span>—Ÿÿ’‹ " </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs mx-1">
          Ctrl+Y
        </kbd>
        <span>◊÷Ë‘ " </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs mx-1">
          Ctrl+S
        </kbd>
        <span>ÈﬁŸË‘</span>
      </div>
    </div>
  );
};
