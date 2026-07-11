import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const requestId = uuidv4();
        request.id = requestId;
        request.res.setHeader('X-Request-Id', requestId);
        return next.handle();
    }
}