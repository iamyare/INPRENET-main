import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Rol } from './entities/net_rol.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { Net_Empleado } from 'src/modules/Empresarial/empresas/entities/net_empleado.entity';
import { Net_Usuario } from './entities/net_usuario.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
/* import { Usuario } from './entities/usuario.entity';
import { TipoIdentificacion } from '../tipo_identificacion/entities/tipo_identificacion.entity'; */

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Net_Usuario, Net_Rol, Net_Empleado, Net_TipoIdentificacion]),
    PassportModule.register({ defaultStrategy : 'jwt'}),


    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory : () => {
        //console.log('JWT SECRET', process.env.JWT_SECRET);
        
        return {
          secret : process.env.JWT_SECRET,
          signOptions : {
          expiresIn : '3h'
        }
      }
    }
  }),
  CommonModule
  ]
})
export class UsuarioModule {}
