import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentroTrabajo } from './centro-trabajo/entities/centro-trabajo.entity';
import { Empresa } from './empresas/entities/empresa.entity';
import { Institucion } from './institucion/entities/institucion.entity';
import { InstitucionController } from './institucion/institucion.controller';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { InstitucionService } from './institucion/institucion.service';
import { DetalleDeduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { PlanillaModule } from '../Planilla/planilla.module';
import { Deduccion } from '../Planilla/deduccion/entities/deduccion.entity';
import { Empleado } from './empresas/entities/empleado.entity';
import { EmpleadoEmpresa } from './empresas/entities/empleado-empresa.entity';
import { Provincia } from '../Regional/provincia/entities/provincia.entity';

@Module({
    controllers: [CentroTrabajoController,EmpresasController,InstitucionController],
    providers: [CentroTrabajoService, EmpresasService, InstitucionService],
    imports: [
      TypeOrmModule.forFeature([CentroTrabajo, Empresa, Institucion,
                                Deduccion, DetalleDeduccion, Empleado, EmpleadoEmpresa, Provincia])]
  })
export class EmpresarialModule {}
