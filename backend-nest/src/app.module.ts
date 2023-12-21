import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { EmpresasModule } from './empresas/empresas.module';
import { AfiliadoModule } from './afiliado/afiliado.module';
import { PaisModule } from './pais/pais.module';
import { BancoModule } from './banco/banco.module';
import { UsuarioModule } from './usuario/usuario.module';
import { TipoIdentificacionModule } from './tipo_identificacion/tipo_identificacion.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'oracle',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities : true
    }),
    EmpresasModule,
    CommonModule,
    AfiliadoModule,
    PaisModule,
    BancoModule,
    UsuarioModule,
    TipoIdentificacionModule
  ]
})
export class AppModule {}
