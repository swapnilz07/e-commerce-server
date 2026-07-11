import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

const { combine, timestamp, json, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp, context, ...meta }) => {
    return `${timestamp} [${level}] ${context ? '[' + context + '] ' : ''}${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
});

const isDev = process.env.NODE_ENV === 'development';

const winstonLogger = winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        isDev ? devFormat : json(),
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true,
        }),
    ],
    exitOnError: false,
});

export class CustomLogger implements LoggerService {
    log(message: any, context?: string) { winstonLogger.info(message, { context }); }
    error(message: any, trace?: string, context?: string) { winstonLogger.error(message, { context, trace }); }
    warn(message: any, context?: string) { winstonLogger.warn(message, { context }); }
    debug(message: any, context?: string) { winstonLogger.debug(message, { context }); }
    verbose(message: any, context?: string) { winstonLogger.verbose(message, { context }); }
}

export default winstonLogger;