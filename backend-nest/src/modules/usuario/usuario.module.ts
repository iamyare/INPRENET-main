import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { net_empleado } from '../Empresarial/entities/net_empleado.entity';
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { NET_SESION } from './entities/net_sesion.entity';
import { MailService } from 'src/common/services/mail.service';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { net_empleado_centro_trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { net_modulo } from './entities/net_modulo.entity';
import { net_rol_modulo } from './entities/net_rol_modulo.entity';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { net_usuario_modulo } from './entities/net_usuario_modulo.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, MailService, JwtAuthGuard],
  imports: [
    TypeOrmModule.forFeature([
      net_empleado, 
      Net_Tipo_Identificacion, 
      NET_USUARIO_PRIVADA, 
      Net_Centro_Trabajo, 
      NET_SESION,
      Net_Seguridad,
      net_empleado_centro_trabajo,
      net_rol_modulo,
      net_modulo,
      Net_Usuario_Empresa,
      net_usuario_modulo,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '8h'
          }
        };
      }
    }),
    CommonModule
  ]
})
export class UsuarioModule {}
