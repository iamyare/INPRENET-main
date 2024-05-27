import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from './entities/net_centro_trabajo.entity';
import { EmpresasController } from './empresas/empresas.controller';
import { CentroTrabajoController } from './centro-trabajo/centro-trabajo.controller';
import { CentroTrabajoService } from './centro-trabajo/centro-trabajo.service';
import { EmpresasService } from './empresas/empresas.service';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_Detalle_Deduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Empleado } from './entities/net_empleado.entity';
import { Net_Deduccion } from '../Planilla/deduccion/entities/net_deduccion.entity';

@Module({
    controllers: [CentroTrabajoController,EmpresasController],
    providers: [CentroTrabajoService, EmpresasService],
    imports: [
      TypeOrmModule.forFeature([Net_Centro_Trabajo,
        Net_Deduccion, Net_Departamento,
     Net_Centro_Trabajo, Net_Detalle_Deduccion, Net_Empleado])]
  })
export class EmpresarialModule {}
