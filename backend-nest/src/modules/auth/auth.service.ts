import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './sesion-activa/users.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SessionGateway } from './session.gateway';
import { UserSessionRepository } from '../../repositories/user-session.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionGateway: SessionGateway,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.password )) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any, userAgent: string) {
    const payload = { username: user.username, sub: user.userId };
    const token = this.jwtService.sign(payload);

    // Check for existing active sessions
    const existingSession = await this.userSessionRepository.findOne({
      where: { user: { id: user.userId }, token: existingUser?.token }
    });

    if (existingSession) {
      // Notify the user of the existing session that they're being logged out
      this.sessionGateway.notifySessionExpired(user.userId);
      
      // Delete the existing session
      await this.userSessionRepository.delete(existingSession.id);
    }

    // Create new session
    const newSession = this.userSessionRepository.create({
      user: { id: user.userId },
      token,
      userAgent
    });
    await this.userSessionRepository.save(newSession);

    return { access_token: token };
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (user.token !== token) {
      throw new UnauthorizedException('Sesión caducada');
    }
    return true;
  }
  
  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) return;  // No hacer nada si el usuario no existe
    await this.usersService.updateUserToken(userId, null, null);
  }
}