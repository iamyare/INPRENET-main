import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_USUARIO_PRIVADA } from './entities/net_usuario_privada.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { MailService } from 'src/common/services/mail.service';
import { Net_Seguridad } from './entities/net_seguridad.entity';
import { net_modulo } from './entities/net_modulo.entity';
import { net_rol_modulo } from './entities/net_rol_modulo.entity';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { net_usuario_modulo } from './entities/net_usuario_modulo.entity';
import { AuthModule } from '../auth/auth.module';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { Net_Empleado } from '../Empresarial/entities/net_empleado.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, MailService],
  imports: [
    TypeOrmModule.forFeature([
      Net_Empleado, 
      Net_Tipo_Identificacion, 
      NET_USUARIO_PRIVADA, 
      Net_Centro_Trabajo,
      Net_Seguridad,
      Net_Empleado_Centro_Trabajo,
      net_rol_modulo,
      net_modulo,
      Net_Usuario_Empresa,
      net_usuario_modulo,
    ]),
    CommonModule,
    AuthModule
  ]
})
export class UsuarioModule {}
