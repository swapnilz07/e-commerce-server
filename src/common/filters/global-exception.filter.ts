import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/winston.logger';

const logger = new CustomLogger();

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.message : 'Internal server error';

        logger.error(message, exception instanceof Error ? exception.stack : '', `ExceptionFilter - ${request.method} ${request.url}`);

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: (request as any).id,
            ...(process.env.NODE_ENV === 'development' && { stack: exception instanceof Error ? exception.stack : undefined }),
        });
    }
}