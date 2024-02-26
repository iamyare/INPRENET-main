import { Module } from '@nestjs/common';
import { PlanillaService } from './planilla/planilla.service';
import { PlanillaController } from './planilla/planilla.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Beneficio } from './beneficio/entities/net_beneficio.entity';
import { Net_Planilla } from './planilla/entities/net_planilla.entity';
import { BeneficioController } from './beneficio/beneficio.controller';
import { BeneficioService } from './beneficio/beneficio.service';
import { DeduccionController } from './deduccion/deduccion.controller';
import { TipoPlanillaService } from './tipo-planilla/tipo-planilla.service';
import { Net_Deduccion } from './deduccion/entities/net_deduccion.entity';
import { Net_TipoPlanilla } from './tipo-planilla/entities/tipo-planilla.entity';
import { DeduccionService } from './deduccion/deduccion.service';
import { DetalleDeduccionController } from './detalle-deduccion/detalle-deduccion.controller';
import { Net_Detalle_Deduccion } from './detalle-deduccion/entities/detalle-deduccion.entity';
import { DetalleDeduccionService } from './detalle-deduccion/detalle-deduccion.service';
import { Net_Institucion } from '../Empresarial/institucion/entities/net_institucion.entity';
import { TipoPlanillaController } from './tipo-planilla/tipo-planilla.controller';
import { AfiliadoService } from 'src/modules/afiliado/afiliado.service';
import { AfiliadoController } from 'src/modules/afiliado/afiliado.controller';
import { Net_Afiliado } from 'src/modules/afiliado/entities/net_afiliado';
import { Net_Detalle_Afiliado } from 'src/modules/afiliado/entities/detalle_afiliado.entity';
import { DetalleBeneficioService } from './detalle_beneficio/detalle_beneficio.service';
import { Net_Detalle_Pago_Beneficio } from './detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { DetalleBeneficioController } from './detalle_beneficio/detalle_beneficio.controller';
import { Net_TipoDeduccion } from './deduccion/entities/net_tipo-deduccion.entity';
import { Net_Detalle_Beneficio_Afiliado } from './detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';
/* import { DetalleBeneficioAfiliado } from './detalle_beneficio/entities/detalle_beneficio_afiliado.entity';
import { TipoDeduccion } from './deduccion/entities/tipo-deduccion.entity'; */

@Module({
  controllers: [PlanillaController, BeneficioController, DetalleBeneficioController, DeduccionController,
                DeduccionController, DetalleDeduccionController,TipoPlanillaController,AfiliadoController ],
  providers: [PlanillaService, BeneficioService, DetalleBeneficioService, DeduccionService,
              TipoPlanillaService, DetalleDeduccionService, AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Net_Beneficio, Net_Detalle_Pago_Beneficio, Net_Planilla, Net_Deduccion, Net_TipoPlanilla, Net_Detalle_Deduccion, Net_Institucion, Net_Afiliado,
      Net_Detalle_Afiliado, Net_Detalle_Beneficio_Afiliado,Net_TipoDeduccion]),]
})
export class PlanillaModule {}