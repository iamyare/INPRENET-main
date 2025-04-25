import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetSession, SessionStatus } from '../entities/net-session.entity';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(NetSession)
    private readonly sessionRepository: Repository<NetSession>,
  ) {}

  /**
   * Crea una nueva sesión en la base de datos.
   * @param idUsuarioEmpresa - ID del usuario
   * @param accessToken - El JWT Access Token
   * @param refreshToken - El JWT Refresh Token
   * @param refreshTokenExpiresIn - Tiempo de vida del refresh token en segundos
   * @param ipAddress - IP del cliente
   * @param userAgent - User Agent del cliente
   * @returns La entidad NetSession creada.
   */
  async createSession(
    idUsuarioEmpresa: number,
    accessToken: string,
    refreshToken: string,
    refreshTokenExpiresIn: number, // en segundos
    ipAddress?: string,
    userAgent?: string,
  ): Promise<NetSession> {
    try {
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + refreshTokenExpiresIn);

      const newSession = this.sessionRepository.create({
        idUsuarioEmpresa,
        token: accessToken, // Guardamos el access token actual
        refreshToken,
        fechaExpiracion: expirationDate, // Fecha de expiración del refresh token
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        estado: SessionStatus.ACTIVE, // Estado inicial
        // fechaCreacion y ultimaActividad son manejadas por TypeORM (@CreateDateColumn, @UpdateDateColumn)
      });

      return await this.sessionRepository.save(newSession);
    } catch (error) {
      this.logger.error(`Error creating session for user ${idUsuarioEmpresa}: ${error.message}`, error.stack);
      throw error; // Relanzar para manejo superior si es necesario
    }
  }

  /**
   * Busca una sesión activa por su Refresh Token.
   * @param refreshToken - El token de refresco a buscar.
   * @returns La entidad NetSession si se encuentra y está activa, null en caso contrario.
   */
  async findActiveSessionByRefreshToken(refreshToken: string): Promise<NetSession | null> {
    try {
      return await this.sessionRepository.findOne({
        where: {
          refreshToken,
          estado: SessionStatus.ACTIVE,
          // Podríamos añadir una condición para fechaExpiracion > NOW() si la DB lo soporta fácilmente
        },
      });
    } catch (error) {
      this.logger.error(`Error finding session by refresh token: ${error.message}`, error.stack);
      return null; // O relanzar dependiendo de la política de errores
    }
  }

  /**
   * Busca una sesión activa por su Access Token.
   * Útil para la validación en JwtStrategy.
   * @param accessToken - El token de acceso a buscar.
   * @returns La entidad NetSession si se encuentra y está activa, null en caso contrario.
   */
  async findActiveSessionByAccessToken(accessToken: string): Promise<NetSession | null> {
     try {
       // Nota: Buscar por Access Token puede ser menos eficiente si no está indexado
       // y si cambian frecuentemente. Considera si esta validación es estrictamente necesaria
       // en cada request o si la validación JWT estándar es suficiente.
       return await this.sessionRepository.findOne({
         where: {
           token: accessToken,
           estado: SessionStatus.ACTIVE,
         },
       });
     } catch (error) {
       this.logger.error(`Error finding session by access token: ${error.message}`, error.stack);
       return null;
     }
   }


  /**
   * Actualiza el estado de una sesión.
   * @param sessionId - ID de la sesión a actualizar.
   * @param newStatus - El nuevo estado para la sesión (e.g., SessionStatus.CLOSED).
   * @returns boolean indicando si la actualización fue exitosa.
   */
  async updateSessionStatus(sessionId: number, newStatus: SessionStatus): Promise<boolean> {
    try {
      const result = await this.sessionRepository.update(sessionId, { estado: newStatus });
      return result.affected > 0;
    } catch (error) {
      this.logger.error(`Error updating status for session ${sessionId}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Actualiza los tokens y la fecha de expiración de una sesión existente (usado en refresh).
   * @param sessionId - ID de la sesión a actualizar.
   * @param newAccessToken - El nuevo Access Token.
   * @param newRefreshToken - El nuevo Refresh Token.
   * @param newRefreshTokenExpiresIn - Nuevo tiempo de expiración en segundos.
   * @returns La entidad NetSession actualizada.
   */
  async updateSessionTokens(
    sessionId: number,
    newAccessToken: string,
    newRefreshToken: string,
    newRefreshTokenExpiresIn: number,
  ): Promise<NetSession | null> {
    try {
      const session = await this.sessionRepository.findOneBy({ idSession: sessionId });
      if (!session) {
        this.logger.warn(`Session not found for update: ${sessionId}`);
        return null;
      }

      const newExpirationDate = new Date();
      newExpirationDate.setSeconds(newExpirationDate.getSeconds() + newRefreshTokenExpiresIn);

      session.token = newAccessToken;
      session.refreshToken = newRefreshToken;
      session.fechaExpiracion = newExpirationDate;
      session.estado = SessionStatus.ACTIVE; // Asegurarse que sigue activa
      // ultimaActividad se actualizará automáticamente por @UpdateDateColumn

      return await this.sessionRepository.save(session);
    } catch (error) {
      this.logger.error(`Error updating tokens for session ${sessionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Invalida todas las sesiones activas de un usuario (opcional, para login).
   * @param idUsuarioEmpresa - ID del usuario.
   * @returns boolean indicando si la operación fue exitosa.
   */
  async invalidateUserSessions(idUsuarioEmpresa: number): Promise<boolean> {
    try {
      // Cambia el estado de todas las sesiones ACTIVAS del usuario a REVOCADA (o CERRADA)
      await this.sessionRepository.update(
        { idUsuarioEmpresa, estado: SessionStatus.ACTIVE },
        { estado: SessionStatus.REVOKED }, // O SessionStatus.CLOSED
      );
      return true;
    } catch (error) {
      this.logger.error(`Error invalidating sessions for user ${idUsuarioEmpresa}: ${error.message}`, error.stack);
      return false;
    }
  }

   /**
   * Actualiza la última actividad de una sesión (llamado desde JwtStrategy).
   * @param sessionId - ID de la sesión.
   * @returns boolean indicando éxito.
   */
   async updateLastActivity(sessionId: number): Promise<boolean> {
    try {
      // TypeORM @UpdateDateColumn debería manejar esto automáticamente si la entidad
      // se carga y se guarda. Si no, se puede forzar así:
      const result = await this.sessionRepository.update(sessionId, { ultimaActividad: new Date() });
      return result.affected > 0;
    } catch (error) {
      this.logger.error(`Error updating last activity for session ${sessionId}: ${error.message}`, error.stack);
      return false;
    }
  }
}
