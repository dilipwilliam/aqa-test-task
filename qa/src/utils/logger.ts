/**
 * Centralized logger using Winston.
 * Supports info, error, warn, debug; logs to console and rotating file.
 */
import path from 'path';
import winston from 'winston';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'framework.log');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `${timestamp as string} [${level}] ${message as string}\n${stack as string}`
      : `${timestamp as string} [${level}] ${message as string}`;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: { error: 0, warn: 1, info: 2, debug: 3 },
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: logFile,
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
  ],
});

export function getLogger(): winston.Logger {
  return logger;
}
