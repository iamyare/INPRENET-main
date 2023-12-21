import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Empleado } from 'src/empresas/entities/empleado.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Empleado]),
    PassportModule.register({ defaultStrategy : 'jwt'}),


    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory : () => {
        console.log('JWT SECRET', process.env.JWT_SECRET);
        
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
