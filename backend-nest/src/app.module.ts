import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AfiliadoModule } from './modules/afiliado/afiliado.module';
import { BancoModule } from './modules/banco/banco.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TipoIdentificacionModule } from './modules/tipo_identificacion/tipo_identificacion.module';
import { PlanillaModule } from './modules/Planilla/planilla.module';
import { RegionalModule } from './modules/Regional/regional.module';
import { EmpresarialModule } from './modules/Empresarial/empresarial.module';
import * as oracledb from 'oracledb'; // Importa oracledb


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
      connectString: process.env.CONNECT_STRING,
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
export class AppModule {
  constructor() {
    this.initializeOracleClient();
  }

  async initializeOracleClient() {
    try {
      await oracledb.initOracleClient();
    } catch (error) {
      console.error('Error initializing Oracle client:', error);
    }
  }
}