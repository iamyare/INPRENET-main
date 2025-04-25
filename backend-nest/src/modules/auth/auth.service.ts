import { Injectable, UnauthorizedException, Logger, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SessionStatus } from '../session/entities/net-session.entity';
import { Request } from 'express'; // Para obtener IP y User Agent
import { UsersService } from './sesion-activa/users.service';
import { SessionService } from '../session/services/session.service';
import { LoginDto } from './dto/login.dto';

// Asume que tienes una interfaz o clase para el payload del JWT
interface JwtPayload {
  sub: number; // ID del usuario (idUsuarioEmpresa)
  username: string; // O email, lo que uses para identificar
  // Puedes añadir otros campos como roles si los necesitas
}

// Asume que tienes una interfaz o clase para la entidad de usuario
interface User {
    idUsuarioEmpresa: number;
    username: string; // o email
    password?: string; // Hash de la contraseña
    // otros campos...
}


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    // Inyecta tu servicio de usuarios real
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // Inyecta el SessionService
    @Inject(forwardRef(() => SessionService)) // Usa forwardRef si hay dependencias circulares
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Valida las credenciales del usuario.
   * @param username - Nombre de usuario o email.
   * @param pass - Contraseña en texto plano.
   * @returns El objeto de usuario si la validación es exitosa, null en caso contrario.
   */
  async validateUser(username: string, pass: string): Promise<Omit<User, 'password'> | null> {
    // Busca al usuario en tu DB (reemplaza esto con tu lógica real)
    // Corrige la llamada a findOneByUsername por findOne
    const user = await this.usersService.findOne(username); // Necesitas este método en UsersService

    if (user && user.password) {
      // Compara la contraseña proporcionada con el hash almacenado
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user; // No devolver el hash de la contraseña
        return result;
      }
    }
    return null;
  }

  /**
   * Procesa el login, valida al usuario, genera tokens y crea una sesión.
   * @param loginDto - Credenciales de login.
   * @param req - Objeto Request de Express para obtener IP y User Agent.
   * @returns Objeto con access_token y refresh_token.
   */
  async login(loginDto: LoginDto, req: Request) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      this.logger.warn(`Login failed for user: ${loginDto.username}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Login successful for user: ${user.username} (ID: ${user.idUsuarioEmpresa})`);

    // Opcional: Invalidar sesiones anteriores del mismo usuario
    // await this.sessionService.invalidateUserSessions(user.idUsuarioEmpresa);

    // Generar tokens
    const payload: JwtPayload = { username: user.username, sub: user.idUsuarioEmpresa };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    // Obtener tiempos de expiración de la configuración
    const refreshTokenExpiresIn = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', '604800'), 10); // Default 7 días

    // Obtener IP y User Agent
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    // Crear la sesión en la base de datos
    try {
      await this.sessionService.createSession(
        user.idUsuarioEmpresa,
        accessToken, // Guardar el access token actual en la sesión
        refreshToken,
        refreshTokenExpiresIn,
        ipAddress,
        userAgent,
      );
      this.logger.log(`Session created for user ${user.idUsuarioEmpresa}`);
    } catch (error) {
        this.logger.error(`Failed to create session for user ${user.idUsuarioEmpresa}: ${error.message}`, error.stack);
        // Decide si lanzar un error aquí o permitir el login pero sin sesión persistente
        throw new Error('Error al crear la sesión del usuario.');
    }


    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Genera un Access Token JWT.
   * @param payload - Datos a incluir en el token.
   * @returns El token JWT.
   */
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME', '900s'), // Default 15 minutos
    });
  }

  /**
   * Genera un Refresh Token JWT.
   * @param payload - Datos a incluir en el token (usualmente solo el sub).
   * @returns El token JWT.
   */
  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
     // Para el refresh token, usualmente solo necesitas el 'sub' (ID de usuario)
     const refreshPayload = { sub: payload.sub };
     return this.jwtService.signAsync(refreshPayload, {
       secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
       expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', '604800s'), // Default 7 días
     });
   }


  /**
   * Procesa la solicitud de refresco de token.
   * @param refreshToken - El refresh token recibido.
   * @returns Nuevos access_token y refresh_token.
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
        throw new BadRequestException('Refresh token no proporcionado');
    }

    try {
      // 1. Validar el refresh token (firma y expiración básica)
      const refreshPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2. Buscar la sesión asociada en la DB
      const session = await this.sessionService.findActiveSessionByRefreshToken(refreshToken);

      if (!session) {
        this.logger.warn(`Refresh token not found or session inactive: ${refreshToken}`);
        throw new UnauthorizedException('Refresh token inválido o sesión no encontrada');
      }

      // 3. Verificar que el token pertenece al usuario del payload (redundante si la búsqueda ya lo hizo, pero seguro)
      if (session.idUsuarioEmpresa !== refreshPayload.sub) {
          this.logger.error(`Refresh token user mismatch. Token sub: ${refreshPayload.sub}, Session user: ${session.idUsuarioEmpresa}`);
          throw new UnauthorizedException('Inconsistencia en el refresh token');
      }

      // 4. Verificar si el refresh token ya expiró según la DB (doble chequeo)
      if (session.fechaExpiracion < new Date()) {
        this.logger.warn(`Refresh token expired in DB for session ${session.idSession}`);
        await this.sessionService.updateSessionStatus(session.idSession, SessionStatus.REVOKED); // Marcar como revocada
        throw new UnauthorizedException('Refresh token expirado');
      }

      // 5. Obtener datos del usuario para el nuevo payload
      //    (Asume que UsersService puede buscar por idUsuarioEmpresa)
      // Corrige la llamada a findOneById por findById
      const user = await this.usersService.findById(session.idUsuarioEmpresa);
      if (!user) {
          this.logger.error(`User not found for session ${session.idSession} during refresh.`);
          throw new UnauthorizedException('Usuario asociado al token no encontrado');
    }

      // 6. Generar nuevos tokens
      const newPayload: JwtPayload = { username: user.username, sub: user.idUsuarioEmpresa };
      const newAccessToken = await this.generateAccessToken(newPayload);
      const newRefreshToken = await this.generateRefreshToken(newPayload); // Generar un NUEVO refresh token

      // 7. Actualizar la sesión en la DB con los NUEVOS tokens y marcar el antiguo refresh token como USADO o REVOCADO
      //    Una opción es actualizar la sesión existente:
      const refreshTokenExpiresIn = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', '604800'), 10);
      await this.sessionService.updateSessionTokens(
          session.idSession,
          newAccessToken,
          newRefreshToken,
          refreshTokenExpiresIn
      );
      this.logger.log(`Tokens refreshed for session ${session.idSession}, user ${user.idUsuarioEmpresa}`);

      //    Alternativa (más segura contra reutilización): Marcar sesión antigua como REVOCADA y crear una NUEVA sesión.
      //    await this.sessionService.updateSessionStatus(session.idSession, SessionStatus.REVOKED);
      //    await this.sessionService.createSession(user.idUsuarioEmpresa, newAccessToken, newRefreshToken, ...);


      // 8. Devolver los nuevos tokens
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };

    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message}`, error.stack);
      // Si jwtService.verifyAsync falla por firma inválida o expiración básica, lanzará una excepción
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
          throw error;
      }
      // Captura errores específicos de JWT si es necesario (JsonWebTokenError, TokenExpiredError)
      if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Refresh token expirado (JWT)');
      }
       if (error.name === 'JsonWebTokenError') {
           throw new UnauthorizedException('Refresh token inválido (JWT)');
       }
      // Error genérico si algo más falló
      throw new UnauthorizedException('Error al refrescar el token');
    }
  }


  /**
   * Procesa el logout invalidando la sesión asociada al token.
   * @param accessToken - El access token actual (usado para encontrar la sesión).
   * @returns boolean indicando si el logout fue exitoso.
   */
  async logout(accessToken: string): Promise<boolean> {
    if (!accessToken) return false;

    try {
       // 1. Validar el token (opcional, pero bueno para obtener el payload si es necesario)
       // const payload = await this.jwtService.verifyAsync(accessToken, { secret: this.configService.get<string>('JWT_ACCESS_SECRET') });

       // 2. Buscar la sesión por el Access Token (si lo guardaste)
       //    Si no guardas el access token en la sesión, necesitarías buscar por refresh token
       //    o requerir que el cliente envíe ambos tokens al hacer logout.
       //    Buscar por Access Token es más simple si está disponible.
       const session = await this.sessionService.findActiveSessionByAccessToken(accessToken);

       if (session) {
         // 3. Actualizar el estado de la sesión a CERRADA o REVOCADA
         const success = await this.sessionService.updateSessionStatus(session.idSession, SessionStatus.CLOSED);
         if (success) {
            this.logger.log(`Session ${session.idSession} closed successfully for user ${session.idUsuarioEmpresa}.`);
         } else {
             this.logger.warn(`Failed to update session status to CLOSED for session ${session.idSession}.`);
         }
         return success;
       } else {
         this.logger.warn(`Logout attempt with non-existent or inactive session for token: ${accessToken.substring(0, 10)}...`);
         // Considera si devolver true o false. True podría ser mejor para el cliente.
         return true; // El estado deseado (no sesión activa) ya se cumple.
       }
    } catch (error) {
        // Captura errores de validación de token si descomentas el verifyAsync
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
             this.logger.warn(`Logout attempt with invalid/expired token: ${error.message}`);
             // Probablemente la sesión ya no es válida de todos modos.
             return true; // Considera éxito ya que no hay sesión activa que cerrar.
        }
        this.logger.error(`Error during logout: ${error.message}`, error.stack);
        return false; // Hubo un error inesperado
    }
  }
}
