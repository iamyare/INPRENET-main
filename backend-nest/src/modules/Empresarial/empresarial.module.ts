import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './entities/net_centro_trabajo.entity';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity';
import { Net_Jornada } from './entities/net_jornada.entity';
import { Net_Centro_Trabajo_Nivel } from './entities/net_centro_trabajo_nivel.entity';
import { Net_Centro_Trabajo_Jornada } from './entities/net_centro_trabajo_jornada.entity';
import { Net_Referencia_Centro_Trabajo } from './entities/net_referencia_centro_trabajo.entity';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { Net_Sociedad_Centro_Trabajo } from './entities/net_sociedad_centro.entity';
import { Net_Peps } from './entities/net_peps.entity';
import { Net_Socio } from './entities/net_socio.entity';
import { Net_Sociedad_Socio } from './entities/net_sociedad_socio.entity';
import { Net_Estado_Centro_Trabajo } from './entities/net_estado_centro_trabajo.entity';
import { Net_Usuario_Empresa } from '../usuario/entities/net_usuario_empresa.entity';
import { Net_Detalle_Deduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Sociedad } from './entities/net.sociedad.entity';
import { Net_Empleado_Centro_Trabajo } from './entities/net_empleado_centro_trabajo.entity';
import { Net_Empleado } from './entities/net_empleado.entity';
import { Net_Nivel_Educativo } from './entities/net_nivel_educativo.entity';
import { Net_Cargo_Publico } from './entities/net_cargo_publico.entity';
import { Net_Familia_Pep } from './entities/net_familia_pep.entity';

@Module({
  controllers: [CentroTrabajoController, EmpresasController],
  providers: [CentroTrabajoService, EmpresasService],
  imports: [
    TypeOrmModule.forFeature([
      Net_Cargo_Publico,
      Net_Familia_Pep,
      Net_Jornada,
      Net_Centro_Trabajo_Jornada,
      Net_Nivel_Educativo,
      Net_Centro_Trabajo_Nivel,
      Net_Centro_Trabajo,
      Net_Empleado_Centro_Trabajo,
      Net_Estado_Centro_Trabajo,
      Net_Deduccion,
      Net_Departamento,
      Net_Detalle_Deduccion,
      Net_Empleado,
      Net_Referencia_Centro_Trabajo,
      Net_Municipio,
      Net_Sociedad,
      Net_Sociedad_Centro_Trabajo,
      Net_Peps,
      Net_Socio,
      Net_Sociedad_Socio,
      Net_Usuario_Empresa
    ]),
  ],
})
export class EmpresarialModule { }
