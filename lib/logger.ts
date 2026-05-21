type LogContext = Record<string, unknown>;

/**
 * Simple logger service for centralized logging.
 * Can be extended to send logs to PostHog or other services in production.
 */
export const logger = {
  log: (message: string, context?: LogContext): void => {
    if (typeof window === "undefined") {
      // Server-side logging
      console.log(`[LOG] ${message}`, context || "");
    } else {
      // Client-side logging
      console.log(`[LOG] ${message}`, context || "");
    }
  },

  debug: (message: string, context?: LogContext): void => {
    if (process.env.NODE_ENV === "development") {
      if (typeof window === "undefined") {
        console.debug(`[DEBUG] ${message}`, context || "");
      } else {
        console.debug(`[DEBUG] ${message}`, context || "");
      }
    }
  },

  warn: (message: string, context?: LogContext): void => {
    if (typeof window === "undefined") {
      console.warn(`[WARN] ${message}`, context || "");
    } else {
      console.warn(`[WARN] ${message}`, context || "");
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext): void => {
    const errorInfo = error instanceof Error ? error.message : String(error);
    if (typeof window === "undefined") {
      console.error(`[ERROR] ${message}:`, errorInfo, context || "");
    } else {
      console.error(`[ERROR] ${message}:`, errorInfo, context || "");
    }
  },
};
