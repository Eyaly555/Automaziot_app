/**
 * Console Logger Service
 *
 * Intercepts and stores console messages for feedback system.
 * Automatically captures all console.log, console.warn, console.error, and console.info calls.
 *
 * @module services/consoleLogger
 */

import type { ConsoleLogEntry } from '../types/feedback';

/**
 * Console Logger Class
 *
 * Intercepts console methods and stores messages in memory
 * for later inclusion in feedback reports.
 */
class ConsoleLogger {
  private logs: ConsoleLogEntry[] = [];
  private maxLogs = 200; // Maximum logs to keep in memory

  constructor() {
    this.interceptConsole();
  }

  /**
   * Intercept console methods
   * Wraps native console methods to capture output
   */
  private interceptConsole() {
    const levels: Array<'log' | 'warn' | 'error' | 'info'> = ['log', 'warn', 'error', 'info'];
    const originalConsole = { ...console };

    levels.forEach(level => {
      console[level] = (...args: any[]) => {
        // Format message from arguments
        const message = args
          .map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (e) {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join(' ');

        // Store log entry
        this.addLog({
          level,
          message,
          timestamp: new Date().toISOString(),
          stack: level === 'error' ? new Error().stack : undefined
        });

        // Call original console method
        originalConsole[level](...args);
      };
    });
  }

  /**
   * Add log entry to storage
   */
  private addLog(log: ConsoleLogEntry) {
    this.logs.push(log);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get recent logs
   *
   * @param count - Number of recent logs to return (default: 50)
   * @returns Array of recent console logs
   */
  getLogs(count: number = 50): ConsoleLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get recent error logs only
   *
   * @param count - Number of recent errors to return (default: 20)
   * @returns Array of recent console errors
   */
  getErrors(count: number = 20): ConsoleLogEntry[] {
    return this.logs
      .filter(log => log.level === 'error')
      .slice(-count);
  }

  /**
   * Get all logs
   *
   * @returns All stored console logs
   */
  getAllLogs(): ConsoleLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Get logs count
   */
  getCount(): number {
    return this.logs.length;
  }

  /**
   * Get errors count
   */
  getErrorsCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }
}

// Create singleton instance and export
export const consoleLogger = new ConsoleLogger();
