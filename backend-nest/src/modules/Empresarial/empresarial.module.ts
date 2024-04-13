import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './entities/net_centro_trabajo.entity';
import { Net_Empresa } from './entities/net_empresa.entity';
import { Net_Institucion } from './entities/net_institucion.entity';
import { InstitucionController } from './institucion/institucion.controller';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { InstitucionService } from './institucion/institucion.service';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_Detalle_Deduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Empleado } from './entities/net_empleado.entity';
import { Net_Empleado_Empresa } from './entities/net_empleado-empresa.entity';
import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity';

@Module({
    controllers: [CentroTrabajoController,EmpresasController,InstitucionController],
    providers: [CentroTrabajoService, EmpresasService, InstitucionService],
    imports: [
      TypeOrmModule.forFeature([Net_Centro_Trabajo,
        Net_Deduccion, Net_Departamento,
     Net_Centro_Trabajo, Net_Empresa, Net_Institucion, Net_Detalle_Deduccion, Net_Empleado, Net_Empleado_Empresa])]
  })
export class EmpresarialModule {}
