import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma/prisma.service';


@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }
    @Get()
    check() {
        return { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() };
    }

    @Get('ready')
    async readiness() {
        let dbStatus = 'disconnected';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = 'error';
        }

        return {
            status: 'ready',
            database: dbStatus,
            redis: 'pending',
        };
    }
}
