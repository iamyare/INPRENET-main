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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        connectString: configService.get('CONNECT_STRING'),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        //migrations: ['src/database/migrations/*{.ts,.js}'],
        //logging: ["query", "schema", "error", "warn", "info", "log", "migration"]

      }),
      inject: [ConfigService]

    }),
    CommonModule,
    AfiliadoModule,
    BancoModule,
    UsuarioModule,
    TipoIdentificacionModule,
    PlanillaModule,
    RegionalModule,
    EmpresarialModule,
    TransaccionesModule
  ]
})
export class AppModule {
}

/* connectString: process.env.CONNECT_STRING,
       synchronize: false,
       autoLoadEntities : true, */
/* logging: ["query", "error"], */