/**
 * Logger utility - provides consistent logging across the application
 * Debug logs are no-ops in production for performance
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: Parameters<typeof console.debug>) => void;
  info: (...args: Parameters<typeof console.info>) => void;
  warn: (...args: Parameters<typeof console.warn>) => void;
  error: (...args: Parameters<typeof console.error>) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const createLogger = (): Logger => {
  if (isDevelopment) {
    return {
      debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
      info: (...args: any[]) => console.info('[INFO]', ...args),
      warn: (...args: any[]) => console.warn('[WARN]', ...args),
      error: (...args: any[]) => console.error('[ERROR]', ...args),
    };
  }

  // Production: debug is no-op, others delegate to console
  return {
    debug: () => {}, // No-op in production
    info: (...args: any[]) => console.info(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args),
  };
};

export const logger = createLogger();