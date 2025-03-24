import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<{ rol: string, modulo: string }[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader && authHeader.split(' ')[1];
    
    if (!bearerToken) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = this.jwtService.verify(bearerToken);
      const userRoles = tokenPayload.rolesModulos;

      const hasRole = requiredRoles.some(requiredRole =>
        userRoles.some(userRole =>
          userRole.rol === requiredRole.rol && userRole.modulo === requiredRole.modulo
        )
      );

      if (!hasRole) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
