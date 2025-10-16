/**
 * Production-ready logging service
 * Replaces console.log statements with environment-aware logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  source?: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    // Set log level based on environment
    if (typeof window !== 'undefined') {
      const env = import.meta.env?.MODE || 'development';
      this.logLevel = env === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    source?: string
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      source,
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const source = entry.source ? `[${entry.source}]` : '';

    return `${timestamp} ${levelName} ${source} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry): void {
    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data);
        break;
    }
  }

  debug(message: string, data?: any, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data, source);
      this.addLog(entry);
      this.logToConsole(entry);
    }
  }

  info(message: string, data?: any, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, data, source);
      this.addLog(entry);
      this.logToConsole(entry);
    }
  }

  warn(message: string, data?: any, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, data, source);
      this.addLog(entry);
      this.logToConsole(entry);
    }
  }

  error(message: string, data?: any, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, data, source);
      this.addLog(entry);
      this.logToConsole(entry);
    }
  }

  // Get recent logs for debugging
  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    const filteredLogs =
      level !== undefined
        ? this.logs.filter((log) => log.level >= level)
        : this.logs;

    return filteredLogs.slice(-limit);
  }

  // Get errors for error reporting
  getErrors(): LogEntry[] {
    return this.logs.filter((log) => log.level === LogLevel.ERROR);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const consoleLogger = new Logger();

// Convenience functions for common logging patterns
export const logger = {
  debug: (message: string, data?: any) =>
    consoleLogger.debug(message, data, 'APP'),
  info: (message: string, data?: any) =>
    consoleLogger.info(message, data, 'APP'),
  warn: (message: string, data?: any) =>
    consoleLogger.warn(message, data, 'APP'),
  error: (message: string, data?: any) =>
    consoleLogger.error(message, data, 'APP'),

  // Component-specific logging
  component: (componentName: string) => ({
    debug: (message: string, data?: any) =>
      consoleLogger.debug(message, data, componentName),
    info: (message: string, data?: any) =>
      consoleLogger.info(message, data, componentName),
    warn: (message: string, data?: any) =>
      consoleLogger.warn(message, data, componentName),
    error: (message: string, data?: any) =>
      consoleLogger.error(message, data, componentName),
  }),

  // Service-specific logging
  service: (serviceName: string) => ({
    debug: (message: string, data?: any) =>
      consoleLogger.debug(message, data, serviceName),
    info: (message: string, data?: any) =>
      consoleLogger.info(message, data, serviceName),
    warn: (message: string, data?: any) =>
      consoleLogger.warn(message, data, serviceName),
    error: (message: string, data?: any) =>
      consoleLogger.error(message, data, serviceName),
  }),
};
