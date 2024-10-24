import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AfiliadoModule } from './modules/Persona/afiliado.module';
import { BancoModule } from './modules/banco/banco.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TipoIdentificacionModule } from './modules/tipo_identificacion/tipo_identificacion.module';
import { PlanillaModule } from './modules/Planilla/planilla.module';
import { RegionalModule } from './modules/Regional/regional.module';
import { EmpresarialModule } from './modules/Empresarial/empresarial.module';
import { TransaccionesModule } from './modules/transacciones/transacciones.module';
import * as oracledb from 'oracledb';
import { AppDataSource } from '../ormconfig';
import { MantenimientoAfiliacionService } from './modules/Persona/afiliacion/mantenimiento-afiliacion.service';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EscalafonModule } from './modules/escalafon/escalafon.module';
import { BitacoraModule } from './modules/bitacora/bitacora.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const user = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const connectString = process.env.CONNECT_STRING;

        // Ensure Thin mode is used
        oracledb.initOracleClient({ configDir: '', libDir: '', errorDir: '' });

        const pool = await oracledb.createPool({
          user,
          password,
          connectString
        });

        return {
          type: 'oracle',
          username: user,
          password,
          connectString,
          extra: { pool },
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          dataSource: AppDataSource,
          //autoLoadEntities: true,
          //synchronize: true,
          //migrations: ['src/database/migrations/*{.ts,.js}'],
          //logging: ["query", "schema", "error", "warn", "info", "log", "migration"]
        };
      },
      inject: [ConfigService],
    }),
    CommonModule,
    BitacoraModule,
    EmpresarialModule,
    DocumentsModule,
    AfiliadoModule,
    BancoModule,
    TipoIdentificacionModule,
    UsuarioModule,
    PlanillaModule,
    RegionalModule,
    TransaccionesModule,
    AuthModule,
    EscalafonModule,
  ],
  providers: [MantenimientoAfiliacionService],
})
export class AppModule { }
