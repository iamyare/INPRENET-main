import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sesion } from './entities';
import { SesionActivaMiddleware } from './sesion-activa/sesion-activa.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sesion]),
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
  providers: [JwtStrategy, RolesGuard, SesionActivaMiddleware],
  exports: [RolesGuard, JwtModule, SesionActivaMiddleware],
})
export class AuthModule {}
