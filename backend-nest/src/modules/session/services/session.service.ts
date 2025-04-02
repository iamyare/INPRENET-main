import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Net_Session } from '../entities/net-session.entity';
import { AuthData } from '../interfaces/auth-data.interface';
import { SseService } from './sse.service';
import { addDays } from 'date-fns';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Net_Session)
    private readonly sessionRepository: Repository<Net_Session>,
    private readonly jwtService: JwtService,
    private readonly sseService: SseService,
  ) {
    // Iniciar limpieza de sesiones expiradas
    this.cleanupExpiredSessions();
  }

  async createSession(userId: number, authData: AuthData): Promise<Net_Session> {
    // Crear nueva sesión
    const session = this.sessionRepository.create({
      token: authData.token,
      refresh_token: authData.refreshToken,
      user_agent: authData.userAgent,
      ip_address: authData.ipAddress,
      fecha_expiracion: addDays(new Date(), 1),
      estado: 'ACTIVA',
      usuario_empresa: { id_usuario_empresa: userId },
    });

    return this.sessionRepository.save(session);
  }

  async invalidatePreviousSessions(userId: number): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: {
        usuario_empresa: { id_usuario_empresa: userId },
        estado: 'ACTIVA',
      },
    });

    if (activeSessions.length > 0) {
      await this.sessionRepository.update(
        activeSessions.map(session => session.id_session),
        { estado: 'REVOCADA' }
      );

      // Notificar a los clientes conectados sobre la invalidación
      activeSessions.forEach(session => {
        this.sseService.emitToUser(userId, {
          type: 'session-invalidated',
          message: 'Tu sesión ha sido cerrada porque se ha iniciado sesión en otro dispositivo',
          sessionId: session.id_session,
        });
      });
    }
  }

  async validateSession(token: string): Promise<boolean> {
    try {
      // Verificar el token JWT
      const payload = this.jwtService.verify(token);
      
      // Buscar la sesión
      const session = await this.sessionRepository.findOne({
        where: { token, estado: 'ACTIVA' },
        relations: ['usuario_empresa'],
      });

      if (!session) {
        return false;
      }

      // Verificar si la sesión ha expirado
      if (session.fecha_expiracion < new Date()) {
        await this.updateSessionStatus(session.id_session, 'EXPIRADA');
        return false;
      }

      // Actualizar última actividad
      await this.updateLastActivity(session.id_session);
      return true;
    } catch (error) {
      this.logger.error(`Error validando sesión: ${error.message}`);
      return false;
    }
  }

  async updateLastActivity(sessionId: number): Promise<void> {
    await this.sessionRepository.update(
      { id_session: sessionId },
      { ultima_actividad: new Date() }
    );
  }

  async refreshToken(refreshToken: string): Promise<{ token: string, refreshToken: string }> {
    const session = await this.sessionRepository.findOne({
      where: { refresh_token: refreshToken, estado: 'ACTIVA' },
      relations: ['usuario_empresa'],
    });

    if (!session) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    // Generar nuevos tokens
    const payload = {
      sub: session.usuario_empresa.id_usuario_empresa,
    };
    const newToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    const newRefreshToken = this.jwtService.sign({}, { expiresIn: '7d' });

    // Actualizar sesión
    session.token = newToken;
    session.refresh_token = newRefreshToken;
    session.ultima_actividad = new Date();
    session.fecha_expiracion = addDays(new Date(), 1);
    await this.sessionRepository.save(session);

    return { token: newToken, refreshToken: newRefreshToken };
  }

  async updateSessionStatus(sessionId: number, status: 'ACTIVA' | 'EXPIRADA' | 'REVOCADA' | 'CERRADA'): Promise<void> {
    await this.sessionRepository.update(
      { id_session: sessionId },
      { estado: status }
    );
  }

  private async cleanupExpiredSessions(): Promise<void> {
    try {
      // Marcar sesiones expiradas
      const result = await this.sessionRepository.update(
        {
          fecha_expiracion: LessThan(new Date()),
          estado: 'ACTIVA',
        },
        { estado: 'EXPIRADA' }
      );

      this.logger.log(`Sesiones expiradas marcadas: ${result.affected}`);

      // Programar la próxima limpieza en una hora
      setTimeout(() => this.cleanupExpiredSessions(), 3600000);
    } catch (error) {
      this.logger.error(`Error durante la limpieza de sesiones: ${error.message}`);
      // Reintentar en 5 minutos en caso de error
      setTimeout(() => this.cleanupExpiredSessions(), 300000);
    }
  }

  async getActiveSessionByUserId(userId: number): Promise<Net_Session[]> {
    return this.sessionRepository.find({
      where: {
        usuario_empresa: { id_usuario_empresa: userId },
        estado: 'ACTIVA',
      },
    });
  }
}