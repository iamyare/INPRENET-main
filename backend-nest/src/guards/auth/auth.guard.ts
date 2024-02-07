import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
      if (!requiredRoles) {
          return true;
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user || !user.rol) {
          return false; // O manejar según la lógica de tu aplicación
      }
  
      return requiredRoles.some((role) => user.rol.nombre_rol.includes(role));
  }
}
