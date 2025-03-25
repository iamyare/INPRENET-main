import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Net_Session } from '../entities/net-session.entity';
import { AuthData } from '../interfaces/auth-data.interface';
import { addDays } from 'date-fns';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Net_Session)
    private readonly sessionRepository: Repository<Net_Session>,
    private readonly jwtService: JwtService
  ) {
    // Iniciar limpieza periódica de sesiones
    this.initializeSessionCleanup();
  }

  private initializeSessionCleanup() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 1000 * 60 * 60); // Ejecutar cada hora
  }

  async createSession(userId: number, authData: AuthData): Promise<void> {
    try {
      // Invalidar sesiones anteriores
      await this.invalidatePreviousSessions(userId);

      // Crear nueva sesión
      const session = this.sessionRepository.create({
        token: authData.token,
        refresh_token: authData.refreshToken,
        user_agent: authData.userAgent,
        ip_address: authData.ipAddress,
        fecha_expiracion: addDays(new Date(), 1),
        estado: 'ACTIVA',
        usuario_empresa: { id_usuario_empresa: userId }
      });

      await this.sessionRepository.save(session);
      this.logger.debug(`Nueva sesión creada para el usuario ${userId}`);
    } catch (error) {
      this.logger.error(`Error al crear sesión para el usuario ${userId}:`, error);
      throw error;
    }
  }

  async invalidatePreviousSessions(userId: number): Promise<void> {
    try {
      await this.sessionRepository.update(
        {
          usuario_empresa: { id_usuario_empresa: userId },
          estado: 'ACTIVA'
        },
        { 
          estado: 'REVOCADA',
          fecha_expiracion: new Date()
        }
      );
      this.logger.debug(`Sesiones anteriores invalidadas para el usuario ${userId}`);
    } catch (error) {
      this.logger.error(`Error al invalidar sesiones para el usuario ${userId}:`, error);
      throw error;
    }
  }

  async validateSession(token: string): Promise<boolean> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { token, estado: 'ACTIVA' }
      });

      if (!session) {
        this.logger.debug('Sesión no encontrada o inactiva');
        return false;
      }

      if (session.fecha_expiracion < new Date()) {
        await this.updateSessionStatus(session.id_session, 'EXPIRADA');
        this.logger.debug(`Sesión ${session.id_session} expirada`);
        return false;
      }

      // Actualizar última actividad
      await this.updateLastActivity(session.id_session);
      return true;
    } catch (error) {
      this.logger.error('Error al validar sesión:', error);
      return false;
    }
  }

  async updateLastActivity(sessionId: number): Promise<void> {
    try {
      await this.sessionRepository.update(
        { id_session: sessionId },
        { ultima_actividad: new Date() }
      );
    } catch (error) {
      this.logger.error(`Error al actualizar última actividad de la sesión ${sessionId}:`, error);
      throw error;
    }
  }

  async updateSessionStatus(sessionId: number, status: 'ACTIVA' | 'EXPIRADA' | 'REVOCADA' | 'CERRADA'): Promise<void> {
    try {
      await this.sessionRepository.update(
        { id_session: sessionId },
        { estado: status }
      );
      this.logger.debug(`Estado de sesión ${sessionId} actualizado a ${status}`);
    } catch (error) {
      this.logger.error(`Error al actualizar estado de sesión ${sessionId}:`, error);
      throw error;
    }
  }

  async refreshSession(refreshToken: string): Promise<string | null> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { refresh_token: refreshToken, estado: 'ACTIVA' },
        relations: ['usuario_empresa']
      });

      if (!session) {
        this.logger.debug('Intento de refresh con token inválido o sesión inactiva');
        return null;
      }

      // Generar nuevo token
      const newToken = this.jwtService.sign({
        sub: session.usuario_empresa.id_usuario_empresa
      });

      // Actualizar sesión
      await this.sessionRepository.update(
        { id_session: session.id_session },
        {
          token: newToken,
          ultima_actividad: new Date(),
          fecha_expiracion: addDays(new Date(), 1)
        }
      );

      this.logger.debug(`Sesión ${session.id_session} refrescada exitosamente`);
      return newToken;
    } catch (error) {
      this.logger.error('Error al refrescar sesión:', error);
      return null;
    }
  }

  private async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.sessionRepository.update(
        {
          fecha_expiracion: LessThan(new Date()),
          estado: 'ACTIVA'
        },
        { estado: 'EXPIRADA' }
      );
      this.logger.debug('Limpieza de sesiones expiradas completada');
    } catch (error) {
      this.logger.error('Error durante la limpieza de sesiones:', error);
    }
  }

  async getUserActiveSessions(userId: number): Promise<Net_Session[]> {
    return this.sessionRepository.find({
      where: {
        usuario_empresa: { id_usuario_empresa: userId },
        estado: 'ACTIVA'
      },
      select: ['id_session', 'user_agent', 'ip_address', 'fecha_creacion', 'ultima_actividad']
    });
  }

  async closeSession(sessionId: number): Promise<void> {
    try {
      await this.updateSessionStatus(sessionId, 'CERRADA');
      this.logger.debug(`Sesión ${sessionId} cerrada manualmente`);
    } catch (error) {
      this.logger.error(`Error al cerrar sesión ${sessionId}:`, error);
      throw error;
    }
  }
}