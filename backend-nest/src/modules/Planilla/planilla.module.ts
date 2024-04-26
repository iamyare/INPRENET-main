import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Net_Deduccion } from './deduccion/entities/net_deduccion.entity';
import { Net_Detalle_Beneficio_Afiliado } from './detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';
import { Net_Detalle_Pago_Beneficio } from './detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { Net_Institucion } from '../Empresarial/entities/net_institucion.entity';
import { Net_Detalle_Deduccion } from './detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_TipoPlanilla } from './tipo-planilla/entities/tipo-planilla.entity';
import { Net_Beneficio } from './beneficio/entities/net_beneficio.entity';
import { Net_Planilla } from './planilla/entities/net_planilla.entity';
import { Net_Detalle_planilla_ingreso } from './Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity';

import { PlanillaController } from './planilla/planilla.controller';
import { BeneficioController } from './beneficio/beneficio.controller';
import { DeduccionController } from './deduccion/deduccion.controller';
import { DeduccionService } from './deduccion/deduccion.service';
import { DetalleDeduccionService } from './detalle-deduccion/detalle-deduccion.service';
import { TipoPlanillaController } from './tipo-planilla/tipo-planilla.controller';
import { AfiliadoController } from '../Persona/afiliado.controller';
import { DetalleBeneficioController } from './detalle_beneficio/detalle_beneficio.controller';
import { DetalleDeduccionController } from './detalle-deduccion/detalle-deduccion.controller';
import { DetallePlanIngrController } from './ingresos/detalle-plan-ingr/detalle-plan-ingr.controller';

import { DetalleBeneficioService } from './detalle_beneficio/detalle_beneficio.service';
import { AfiliadoService } from '../Persona/afiliado.service';
import { TipoPlanillaService } from './tipo-planilla/tipo-planilla.service';
import { BeneficioService } from './beneficio/beneficio.service';
import { PlanillaService } from './planilla/planilla.service';
import { DetallePlanillaIngresoService } from './ingresos/detalle-plan-ingr/detalle-planilla-ing.service';
import { Net_SALARIO_COTIZABLE } from './Ingresos/detalle-plan-ingr/entities/net_salario_cotizable.entity';
import { AfiliadoModule } from '../Persona/afiliado.module';
import { TransaccionesModule } from '../transacciones/transacciones.module';

@Module({
  controllers: [DetallePlanIngrController, PlanillaController, BeneficioController, DetalleBeneficioController, DeduccionController,
    DeduccionController, DetalleDeduccionController, TipoPlanillaController, AfiliadoController],
  providers: [PlanillaService, DetallePlanillaIngresoService, BeneficioService, DetalleBeneficioService, DeduccionService,
    TipoPlanillaService, DetalleDeduccionService, AfiliadoService],
  imports: [AfiliadoModule, TransaccionesModule,
    TypeOrmModule.forFeature([Net_SALARIO_COTIZABLE, Net_Beneficio, Net_Detalle_Pago_Beneficio,
                              Net_Planilla, Net_Deduccion, Net_TipoPlanilla, Net_Detalle_Deduccion,
                              Net_Institucion,Net_Detalle_Beneficio_Afiliado, Net_Detalle_planilla_ingreso]),]
})
export class PlanillaModule { }