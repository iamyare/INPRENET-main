import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './sesion-activa/users.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionGateway } from './session.gateway';
import { UserSessionRepository } from '../../repositories/user-session.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [AuthService, UsersService, JwtStrategy, RolesGuard, SessionGateway, UserSessionRepository],
  exports: [AuthService, UsersService, RolesGuard, JwtModule],
})

export class AuthModule {}
