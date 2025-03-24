import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './sesion-activa/users.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.password )) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any, userAgent: string){
    const payload = { username: user.username, sub: user.userId };
    const token = this.jwtService.sign(payload);

    //Cerrar sesión anterior si existe (solo cuando el token es diferente)
    const existingUser = await this.usersService.findById(user.userId);
    if (existingUser?. token && existingUser.userAgent !== userAgent ) {
      await this.logout(existingUser.userId);
    }

    //Actualizar token y userAgent del usuario
    await this.usersService.updateUserToken(user.userId, token, userAgent);
    return { access_token: token};
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