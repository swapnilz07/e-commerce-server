import { Global, Module } from '@nestjs/common';
import { CustomLogger } from './logger/winston.logger';
import { RequestIdInterceptor } from './config/request-id.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';


@Global()
@Module({
    providers: [
        CustomLogger,
        RequestIdInterceptor,
        GlobalExceptionFilter,
    ],
    exports: [CustomLogger, RequestIdInterceptor, GlobalExceptionFilter],
})
export class CommonModule { }
