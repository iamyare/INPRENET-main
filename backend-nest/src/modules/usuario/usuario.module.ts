import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Rol } from './entities/net_rol.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_Usuario } from './entities/net_usuario.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { SesionActivaMiddleware } from './middlewares/sesion-activa/sesion-activa.middleware';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Net_Usuario, Net_Rol, Net_Empleado, Net_TipoIdentificacion, NET_USUARIO_PRIVADA, Net_Centro_Trabajo, NET_SESION]),
    PassportModule.register({ defaultStrategy: 'jwt' }),


    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        //console.log('JWT SECRET', process.env.JWT_SECRET);

        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '3h'
          }
        }
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