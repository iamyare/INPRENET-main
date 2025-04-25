import { Injectable, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/services/session.service';
import { UsersService } from './sesion-activa/users.service';
import { SessionStatus } from '../session/entities/net-session.entity';
import { Request } from 'express'; // Importa Request de express

// Asume que esta interfaz coincide con el payload que generas
interface JwtPayload {
  sub: number; // ID del usuario (idUsuarioEmpresa)
  username: string;
  // otros campos...
}

// Asume que esta interfaz representa al usuario que quieres adjuntar a `req.user`
interface AuthenticatedUser {
    idUsuarioEmpresa: number;
    username: string;
    // otros campos relevantes (roles, etc.)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    // Inyecta SessionService
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
    // Inyecta UsersService para obtener datos frescos del usuario si es necesario
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae token del header 'Authorization: Bearer <token>'
      ignoreExpiration: false, // passport-jwt valida la expiración automáticamente
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'), // Clave secreta para validar firma
      passReqToCallback: true, // Pasar el objeto request al método validate
    });
  }

  /**
   * Valida el payload del token JWT y verifica la sesión en la DB.
   * Este método es llamado por Passport después de verificar la firma y expiración del token.
   * @param req - El objeto Request de Express.
   * @param payload - El payload decodificado del JWT.
   * @returns El objeto de usuario si la validación es exitosa. Lanza UnauthorizedException si falla.
   */
  async validate(req: Request, payload: JwtPayload): Promise<AuthenticatedUser> { // Usa Request de express
    this.logger.verbose(`Validating token for user ID: ${payload.sub}`);

    // 1. Validación básica del payload (ya hecha por passport-jwt: exp, firma)
    //    Podrías añadir chequeos extra aquí si es necesario.
    if (!payload || !payload.sub) {
        this.logger.warn('JWT validation failed: Invalid payload structure.');
        throw new UnauthorizedException('Token inválido o corrupto.');
    }

    // 2. Obtener el token real de la solicitud para buscar en la sesión
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
        // Esto no debería ocurrir si la estrategia se activa, pero por si acaso.
        this.logger.warn('JWT validation failed: Token not found in request header.');
        throw new UnauthorizedException('Token de autorización no encontrado.');
    }


    // 3. Verificar si la sesión asociada al token está activa en la DB
    //    (Usando el Access Token para buscar)
    const session = await this.sessionService.findActiveSessionByAccessToken(token);

    if (!session) {
      this.logger.warn(`JWT validation failed: No active session found for token (User ID: ${payload.sub})`);
      // Podrías querer diferenciar entre "no encontrado" y "encontrado pero no activo"
      throw new UnauthorizedException('Sesión inválida o cerrada.');
    }

    // 4. (Opcional) Verificar que el usuario del token coincide con el de la sesión
    if (session.idUsuarioEmpresa !== payload.sub) {
        this.logger.error(`JWT validation failed: Token user ID (${payload.sub}) does not match session user ID (${session.idUsuarioEmpresa}). Session ID: ${session.idSession}`);
        // Esto indica una posible brecha de seguridad o error lógico.
        // Invalida la sesión por seguridad.
        await this.sessionService.updateSessionStatus(session.idSession, SessionStatus.REVOKED);
        throw new UnauthorizedException('Inconsistencia en la sesión.');
    }

    // 5. (Opcional pero recomendado) Actualizar la última actividad de la sesión
    //    Esto ayuda a rastrear sesiones activas y potencialmente limpiar las inactivas.
    await this.sessionService.updateLastActivity(session.idSession);


    // 6. (Opcional) Obtener datos frescos del usuario desde la DB
    //    Esto asegura que `req.user` tenga la información más reciente (ej: roles actualizados).
    //    Si el payload ya tiene todo lo necesario, puedes omitir esto.
    // Corrige la llamada a findOneById por findById
    const user = await this.usersService.findById(payload.sub); // Necesitas este método en UsersService
    if (!user) {
        this.logger.error(`JWT validation failed: User with ID ${payload.sub} not found in DB.`);
        throw new UnauthorizedException('Usuario asociado al token no encontrado.');
    }

    // 7. Devolver el objeto de usuario que se adjuntará a `req.user`
    //    Asegúrate de devolver solo la información necesaria y segura.
    const authenticatedUser: AuthenticatedUser = {
        idUsuarioEmpresa: user.idUsuarioEmpresa,
        username: user.username, // o email
        // Añade otros campos como roles si los necesitas en tus controladores/servicios
        // roles: user.roles,
    };

    this.logger.verbose(`Token validated successfully for user: ${authenticatedUser.username}`);
    return authenticatedUser; // Este objeto estará disponible como req.user en rutas protegidas
  }
}
