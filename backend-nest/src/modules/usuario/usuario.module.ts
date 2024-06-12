import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { MailService } from 'src/common/services/mail.service';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { Net_Modulo } from './entities/net_modulo.entity';
import { Net_Rol_Modulo } from './entities/net_rol_modulo.entity';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { Net_Usuario_Modulo } from './entities/net_usuario_modulo.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, MailService],
  imports: [
    TypeOrmModule.forFeature([
      Net_Empleado, 
      Net_TipoIdentificacion, 
      NET_USUARIO_PRIVADA, 
      Net_Centro_Trabajo, 
      NET_SESION,
      Net_Seguridad,
      Net_Empleado_Centro_Trabajo,
      Net_Rol_Modulo,
      Net_Modulo,
      Net_Usuario_Empresa,
      Net_Usuario_Modulo,
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