import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Empresa } from './empresas/entities/net_empresa.entity';
import { Net_Institucion } from './institucion/entities/net_institucion.entity';
import { InstitucionController } from './institucion/institucion.controller';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { InstitucionService } from './institucion/institucion.service';
/* import { DetalleDeduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity'; */
import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity';
/* import { Empleado } from './empresas/entities/empleado.entity'; */
/* import { EmpleadoEmpresa } from './empresas/entities/empleado-empresa.entity'; */
import { Net_Provincia } from '../Regional/provincia/entities/net_provincia.entity';
import { Net_Detalle_Deduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { PlanillaModule } from '../Planilla/planilla.module';
/* import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity'; */
import { Net_Empleado } from './empresas/entities/net_empleado.entity';
import { Net_Empleado_Empresa } from './empresas/entities/net_empleado-empresa.entity';
/* import { Provincia } from '../Regional/provincia/entities/provincia.entity'; */

@Module({
    controllers: [CentroTrabajoController,EmpresasController,InstitucionController],
    providers: [CentroTrabajoService, EmpresasService, InstitucionService],
    imports: [
      TypeOrmModule.forFeature([Net_Centro_Trabajo,
        Net_Deduccion, Net_Provincia,
     Net_Centro_Trabajo, Net_Empresa, Net_Institucion,
        Net_Deduccion, Net_Detalle_Deduccion, Net_Empleado, Net_Empleado_Empresa])]
  })
export class EmpresarialModule {}
