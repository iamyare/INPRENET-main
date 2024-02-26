import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './centro-trabajo/entities/net_centro-trabajo.entity';
import { Empresa } from './empresas/entities/empresa.entity';
import { Institucion } from './institucion/entities/institucion.entity';
import { InstitucionController } from './institucion/institucion.controller';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { InstitucionService } from './institucion/institucion.service';
import { DetalleDeduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity';
import { Empleado } from './empresas/entities/empleado.entity';
import { EmpleadoEmpresa } from './empresas/entities/empleado-empresa.entity';
import { Net_Provincia } from '../Regional/provincia/entities/net_provincia.entity';

@Module({
    controllers: [CentroTrabajoController,EmpresasController,InstitucionController],
    providers: [CentroTrabajoService, EmpresasService, InstitucionService],
    imports: [
      TypeOrmModule.forFeature([Net_Centro_Trabajo, Empresa, Institucion,
        Net_Deduccion, DetalleDeduccion, Empleado, EmpleadoEmpresa, Net_Provincia])]
  })
export class EmpresarialModule {}
