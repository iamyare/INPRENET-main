import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AfiliadoModule } from './afiliado/afiliado.module';
import { BancoModule } from './banco/banco.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TipoIdentificacionModule } from './modules/tipo_identificacion/tipo_identificacion.module';
import { PlanillaModule } from './modules/Planilla/planilla.module';
import { RegionalModule } from './modules/Regional/regional.module';
import { EmpresarialModule } from './modules/Empresarial/empresarial.module';

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
    CommonModule,
    AfiliadoModule,
    BancoModule,
    UsuarioModule,
    TipoIdentificacionModule,
    PlanillaModule,
    RegionalModule,
    EmpresarialModule
  ]
})
export class AppModule {}
