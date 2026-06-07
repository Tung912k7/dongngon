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
    let errorInfo = "";
    if (error instanceof Error) {
      errorInfo = error.message;
    } else if (error && typeof error === "object") {
      const errObj = error as Record<string, unknown>;
      const msg = errObj.message ? String(errObj.message) : "";
      const details = errObj.details ? String(errObj.details) : "";
      errorInfo = msg || details || JSON.stringify(error);
    } else {
      errorInfo = String(error);
    }
    if (typeof window === "undefined") {
      console.error(`[ERROR] ${message}:`, errorInfo, context || "");
    } else {
      console.error(`[ERROR] ${message}:`, errorInfo, context || "");
    }
  },
};
