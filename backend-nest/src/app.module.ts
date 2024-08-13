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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `development.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get('DB_USERNAME');
        const password = configService.get('DB_PASSWORD');
        const connectString = configService.get('CONNECT_STRING');

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
          //autoLoadEntities: true,
          //synchronize: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          dataSource: AppDataSource,
          //migrations: ['src/database/migrations/*{.ts,.js}'],
          //logging: ["query", "schema", "error", "warn", "info", "log", "migration"]
        };
      },
      inject: [ConfigService],
    }),
    CommonModule,
    AfiliadoModule,
    BancoModule,
    TipoIdentificacionModule,
    UsuarioModule,
    PlanillaModule,
    RegionalModule,
    EmpresarialModule,
    TransaccionesModule,
    AuthModule
  ],
  providers: [MantenimientoAfiliacionService],
})
export class AppModule { }
