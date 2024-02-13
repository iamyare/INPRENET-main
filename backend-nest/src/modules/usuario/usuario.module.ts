import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { Empleado } from 'src/modules/Empresarial/empresas/entities/empleado.entity';
import { Usuario } from './entities/usuario.entity';
import { TipoIdentificacion } from '../tipo_identificacion/entities/tipo_identificacion.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Empleado, TipoIdentificacion]),
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
