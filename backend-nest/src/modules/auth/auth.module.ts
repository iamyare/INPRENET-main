import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { SessionModule } from '../session/session.module'; // Importa el módulo de sesión
import { UsersService } from './sesion-activa/users.service'; // Importa UsersService

@Module({
  imports: [
    ConfigModule, // Asegúrate de que ConfigModule esté disponible globalmente o importado aquí
    PassportModule.register({ defaultStrategy: 'jwt' }), // Registra Passport con estrategia por defecto JWT
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        // Las secret y expiration se manejan ahora directamente en AuthService y JwtStrategy
        // al generar/validar, usando ConfigService. No es necesario configurarlas globalmente aquí
        // si las estrategias y el servicio las obtienen de ConfigService.
        // Sin embargo, si algún otro servicio inyecta JwtService directamente y usa sign/verify
        // sin especificar secret/expiresIn, necesitarías configuraciones por defecto aquí.
        // secret: configService.get<string>('JWT_ACCESS_SECRET'), // Ejemplo si necesitaras un default
        // signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME') }, // Ejemplo
      }),
      inject: [ConfigService], // Inyecta ConfigService en useFactory
    }),
    // Importa SessionModule para que AuthService y JwtStrategy puedan usar SessionService
    // Usa forwardRef si hay dependencias circulares (ej: SessionModule importa AuthModule)
    forwardRef(() => SessionModule),
  ],
  controllers: [AuthController],
  // Proveedores: AuthService (lógica principal), JwtStrategy (validación de tokens), UsersService
  providers: [AuthService, JwtStrategy, UsersService], // Añade UsersService a los providers
  // Exporta AuthService y JwtModule si otros módulos necesitan usarlos
  exports: [AuthService, JwtModule, PassportModule, UsersService], // Exporta UsersService si es necesario en otros módulos
})
export class AuthModule {}
