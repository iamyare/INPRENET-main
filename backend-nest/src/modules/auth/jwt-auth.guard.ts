import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // Usa la estrategia 'jwt' que definimos
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Verifica si la ruta está marcada como pública usando el decorador @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Método del controlador
      context.getClass(),   // Clase del controlador
    ]);

    // Si es pública, permite el acceso sin token
    if (isPublic) {
      return true;
    }

    // Si no es pública, procede con la validación JWT estándar de AuthGuard('jwt')
    return super.canActivate(context);
  }

  // Opcional: Puedes sobreescribir handleRequest para personalizar el manejo de errores
  handleRequest(err, user, info, context: ExecutionContext) {
    // Si hay un error (ej: token inválido, expirado) o no hay usuario, lanza UnauthorizedException
    if (err || !user) {
       // Verifica si es pública de nuevo (por si acaso, aunque canActivate debería manejarlo)
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true; // No lanzar error si es pública

        // Puedes loguear 'info' para ver detalles del error (ej: TokenExpiredError)
        // console.error('JWT Auth Error:', info?.message || err?.message);
        throw err || new UnauthorizedException('Token inválido o expirado');
    }
    // Si la autenticación es exitosa, devuelve el usuario
    return user;
  }
}
