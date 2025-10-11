/**
 * Feedback Service
 *
 * Manages feedback storage, retrieval, and export functionality.
 * Uses localStorage for persistence with optional Markdown/JSON export.
 *
 * @module services/feedbackService
 */

import type { FeedbackEntry } from '../types/feedback';

const STORAGE_KEY = 'dev_feedbacks';

/**
 * Feedback Service
 *
 * Provides methods for managing developer feedback entries
 * during production testing.
 */
export const feedbackService = {
  /**
   * Get all feedbacks from localStorage
   *
   * @returns Array of all feedback entries
   */
  getAll(): FeedbackEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      return [];
    }
  },

  /**
   * Get feedback by ID
   *
   * @param id - Feedback ID
   * @returns Feedback entry or undefined
   */
  getById(id: string): FeedbackEntry | undefined {
    return this.getAll().find(f => f.id === id);
  },

  /**
   * Get feedbacks by status
   *
   * @param status - Feedback status
   * @returns Filtered feedbacks
   */
  getByStatus(status: FeedbackEntry['status']): FeedbackEntry[] {
    return this.getAll().filter(f => f.status === status);
  },

  /**
   * Get feedbacks by category
   *
   * @param category - Feedback category
   * @returns Filtered feedbacks
   */
  getByCategory(category: FeedbackEntry['category']): FeedbackEntry[] {
    return this.getAll().filter(f => f.category === category);
  },

  /**
   * Get feedbacks by component
   *
   * @param componentName - Component name
   * @returns Filtered feedbacks
   */
  getByComponent(componentName: string): FeedbackEntry[] {
    return this.getAll().filter(f => f.componentName === componentName);
  },

  /**
   * Save new feedback entry
   *
   * @param feedback - Feedback data (without id and timestamp)
   * @returns Created feedback entry
   */
  save(feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>): FeedbackEntry {
    const entry: FeedbackEntry = {
      ...feedback,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    const all = this.getAll();
    all.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    return entry;
  },

  /**
   * Update existing feedback
   *
   * @param id - Feedback ID
   * @param updates - Partial feedback updates
   * @returns Updated feedback or undefined if not found
   */
  update(id: string, updates: Partial<FeedbackEntry>): FeedbackEntry | undefined {
    const all = this.getAll();
    const index = all.findIndex(f => f.id === id);

    if (index === -1) {
      console.warn(`Feedback with id ${id} not found`);
      return undefined;
    }

    all[index] = { ...all[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    return all[index];
  },

  /**
   * Delete feedback
   *
   * @param id - Feedback ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(f => f.id !== id);

    if (filtered.length === all.length) {
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /**
   * Delete all feedbacks
   */
  deleteAll() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Export feedbacks to Markdown format
   *
   * Formats feedbacks into a structured Markdown document
   * optimized for Claude Code review.
   *
   * @returns Markdown string
   */
  exportMarkdown(): string {
    const feedbacks = this.getAll();
    const grouped = {
      todo: feedbacks.filter(f => f.status === 'todo'),
      doing: feedbacks.filter(f => f.status === 'doing'),
      done: feedbacks.filter(f => f.status === 'done')
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let md = `# 🐛 Development Feedback Report\n\n`;
    md += `**Generated**: ${dateStr} at ${timeStr}\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total Feedbacks**: ${feedbacks.length}\n`;
    md += `- 📋 **TODO**: ${grouped.todo.length}\n`;
    md += `- 🔄 **IN PROGRESS**: ${grouped.doing.length}\n`;
    md += `- ✅ **COMPLETED**: ${grouped.done.length}\n\n`;
    md += `---\n\n`;

    // TODO items
    if (grouped.todo.length > 0) {
      md += `## 📋 TODO (${grouped.todo.length})\n\n`;
      grouped.todo
        .sort((a, b) => {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .forEach((f, i) => {
          md += this.formatFeedbackMarkdown(f, i + 1);
        });
    }

    // DOING items
    if (grouped.doing.length > 0) {
      md += `## 🔄 IN PROGRESS (${grouped.doing.length})\n\n`;
      grouped.doing.forEach((f, i) => {
        md += this.formatFeedbackMarkdown(f, i + 1);
      });
    }

    // DONE items (collapsed)
    if (grouped.done.length > 0) {
      md += `<details>\n`;
      md += `<summary>✅ COMPLETED (${grouped.done.length}) - Click to expand</summary>\n\n`;
      grouped.done.forEach((f, i) => {
        md += this.formatFeedbackMarkdown(f, i + 1);
      });
      md += `</details>\n\n`;
    }

    return md;
  },

  /**
   * Format single feedback entry as Markdown
   *
   * @param feedback - Feedback entry
   * @param index - Display index
   * @returns Formatted Markdown string
   */
  formatFeedbackMarkdown(feedback: FeedbackEntry, index: number): string {
    const categoryIcons: Record<FeedbackEntry['category'], string> = {
      bug: '🐛',
      feature: '✨',
      ui_ux: '🎨',
      error: '❌',
      performance: '⚡',
      note: '📝'
    };

    const priorityBadges: Record<FeedbackEntry['priority'], string> = {
      urgent: '🔴 URGENT',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🟢 Low'
    };

    const icon = categoryIcons[feedback.category];
    const priorityBadge = priorityBadges[feedback.priority];

    let md = `### ${icon} #${index} - ${feedback.title} [${priorityBadge}]\n\n`;
    md += `**Component**: \`${feedback.componentName}\`  \n`;
    md += `**File**: [${feedback.filePath}](${feedback.filePath})`;

    if (feedback.lineNumber) {
      md += `:${feedback.lineNumber}`;
    }

    md += `  \n`;
    md += `**Route**: \`${feedback.route}\`  \n`;

    const date = new Date(feedback.timestamp);
    md += `**Date**: ${date.toLocaleString('he-IL')}  \n\n`;

    if (feedback.description) {
      md += `**Description**:\n${feedback.description}\n\n`;
    }

    // Console Errors
    if (feedback.consoleErrors && feedback.consoleErrors.length > 0) {
      md += `**Console Errors** (${feedback.consoleErrors.length}):\n\`\`\`\n`;
      feedback.consoleErrors.forEach(err => {
        md += `[${err.level.toUpperCase()}] ${err.message}\n`;
        if (err.stack) {
          md += `${err.stack}\n\n`;
        }
      });
      md += `\`\`\`\n\n`;
    }

    // Console Logs (if present and different from errors)
    if (feedback.consoleLogs && feedback.consoleLogs.length > 0) {
      const nonErrorLogs = feedback.consoleLogs.filter(l => l.level !== 'error');
      if (nonErrorLogs.length > 0) {
        md += `<details>\n`;
        md += `<summary>Console Logs (${nonErrorLogs.length})</summary>\n\n`;
        md += `\`\`\`\n`;
        nonErrorLogs.forEach(log => {
          md += `[${log.level.toUpperCase()}] ${log.message}\n`;
        });
        md += `\`\`\`\n\n`;
        md += `</details>\n\n`;
      }
    }

    // Resolution Notes
    if (feedback.notes) {
      md += `**Resolution Notes**:\n${feedback.notes}\n\n`;
    }

    md += `---\n\n`;
    return md;
  },

  /**
   * Export feedbacks to JSON format
   *
   * @returns JSON string
   */
  exportJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  },

  /**
   * Import feedbacks from JSON
   *
   * @param json - JSON string
   * @returns Number of imported feedbacks
   */
  importJSON(json: string): number {
    try {
      const imported: FeedbackEntry[] = JSON.parse(json);
      const existing = this.getAll();

      // Merge, avoiding duplicates by ID
      const merged = [...existing];
      imported.forEach(feedback => {
        if (!merged.find(f => f.id === feedback.id)) {
          merged.push(feedback);
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return imported.length;
    } catch (error) {
      console.error('Error importing feedbacks:', error);
      throw new Error('Invalid feedback JSON format');
    }
  },

  /**
   * Get statistics
   *
   * @returns Feedback statistics
   */
  getStats() {
    const all = this.getAll();

    return {
      total: all.length,
      byStatus: {
        todo: all.filter(f => f.status === 'todo').length,
        doing: all.filter(f => f.status === 'doing').length,
        done: all.filter(f => f.status === 'done').length
      },
      byCategory: {
        bug: all.filter(f => f.category === 'bug').length,
        feature: all.filter(f => f.category === 'feature').length,
        ui_ux: all.filter(f => f.category === 'ui_ux').length,
        error: all.filter(f => f.category === 'error').length,
        performance: all.filter(f => f.category === 'performance').length,
        note: all.filter(f => f.category === 'note').length
      },
      byPriority: {
        urgent: all.filter(f => f.priority === 'urgent').length,
        high: all.filter(f => f.priority === 'high').length,
        medium: all.filter(f => f.priority === 'medium').length,
        low: all.filter(f => f.priority === 'low').length
      }
    };
  }
};
