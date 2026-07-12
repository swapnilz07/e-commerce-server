import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access (public route)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();


    if (!user || !user.role) {
      throw new ForbiddenException('You must be logged in to access this resource');
    }

    // Check if the user's role matches any of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}
