/**
 * Logger Utility
 * Provides centralized logging for all application actions
 * Logs are stored both in console and localStorage
 */

class Logger {
  constructor() {
    this.logs = [];
    this.loadLogsFromStorage();
  }

  /**
   * Log an info message
   * @param {string} message - The log message
   * @param {object} data - Optional data to log
   */
  info(message, data = null) {
    this._log('INFO', message, data);
  }

  /**
   * Log an error message
   * @param {string} message - The error message
   * @param {object} error - Optional error object
   */
  error(message, error = null) {
    this._log('ERROR', message, error);
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param {object} data - Optional data to log
   */
  warn(message, data = null) {
    this._log('WARN', message, data);
  }

  /**
   * Log a debug message
   * @param {string} message - The debug message
   * @param {object} data - Optional data to log
   */
  debug(message, data = null) {
    this._log('DEBUG', message, data);
  }

  /**
   * Internal method to handle logging
   * @private
   */
  _log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);
    this.saveLogsToStorage();

    // Console logging
    const color = this._getColorForLevel(level);
    console.log(`%c[${timestamp}] ${level}: ${message}`, `color: ${color}; font-weight: bold;`);
    if (data) {
      console.log('Data:', data);
    }
  }

  /**
   * Get color for log level
   * @private
   */
  _getColorForLevel(level) {
    const colors = {
      'INFO': '#0066cc',
      'ERROR': '#cc0000',
      'WARN': '#ff9900',
      'DEBUG': '#00cc00'
    };
    return colors[level] || '#000000';
  }

  /**
   * Save logs to localStorage
   * @private
   */
  saveLogsToStorage() {
    try {
      const recentLogs = this.logs.slice(-100); // Keep last 100 logs
      localStorage.setItem('appLogs', JSON.stringify(recentLogs));
    } catch (e) {
      console.error('Failed to save logs to storage:', e);
    }
  }

  /**
   * Load logs from localStorage
   * @private
   */
  loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem('appLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs from storage:', e);
    }
  }

  /**
   * Get all logs
   */
  getAllLogs() {
    return this.logs;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('appLogs');
    this.info('Logs cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    this.info('Logs exported');
  }
}

// Create global logger instance
const logger = new Logger();
