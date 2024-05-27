import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Rol_Empresa } from './entities/net_rol_empresa.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { SesionActivaMiddleware } from './middlewares/sesion-activa/sesion-activa.middleware';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';
import { MailService } from 'src/common/services/mail.service';
import { Net_Seguridad } from './entities/net_seguridad.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, MailService],
  imports: [
    TypeOrmModule.forFeature([
      Net_Usuario_Empresa,
      Net_Rol_Empresa, 
      Net_Empleado, 
      Net_TipoIdentificacion, 
      NET_USUARIO_PRIVADA, 
      Net_Centro_Trabajo, 
      NET_SESION,
      Net_Seguridad,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '3h'
          }
        };
      }
    }),
    CommonModule
  ]
})
export class UsuarioModule{
}


/* 
export class UsuarioModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SesionActivaMiddleware)
      .forRoutes({ path: 'api/usuario/logout', method: RequestMethod.POST });
  }
}
*/