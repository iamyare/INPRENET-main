import { Module } from '@nestjs/common';
import { PlanillaService } from './planilla/planilla.service';
import { PlanillaController } from './planilla/planilla.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficio } from './beneficio/entities/beneficio.entity';
import { Planilla } from './planilla/entities/planilla.entity';
import { BeneficioController } from './beneficio/beneficio.controller';
import { BeneficioService } from './beneficio/beneficio.service';
import { DeduccionController } from './deduccion/deduccion.controller';
import { TipoPlanillaService } from './tipo-planilla/tipo-planilla.service';
import { Deduccion } from './deduccion/entities/deduccion.entity';
import { TipoPlanilla } from './tipo-planilla/entities/tipo-planilla.entity';
import { DeduccionService } from './deduccion/deduccion.service';
import { DetalleDeduccionController } from './detalle-deduccion/detalle-deduccion.controller';
import { DetalleDeduccion } from './detalle-deduccion/entities/detalle-deduccion.entity';
import { DetalleDeduccionService } from './detalle-deduccion/detalle-deduccion.service';
import { Institucion } from '../Empresarial/institucion/entities/institucion.entity';
import { TipoPlanillaController } from './tipo-planilla/tipo-planilla.controller';
import { AfiliadoService } from 'src/modules/afiliado/afiliado.service';
import { AfiliadoController } from 'src/modules/afiliado/afiliado.controller';
import { Afiliado } from 'src/modules/afiliado/entities/afiliado';
import { DetalleAfiliado } from 'src/modules/afiliado/entities/detalle_afiliado.entity';
import { DetalleBeneficioService } from './detalle_beneficio/detalle_beneficio.service';
import { DetalleBeneficio } from './detalle_beneficio/entities/detalle_beneficio.entity';
import { DetalleBeneficioController } from './detalle_beneficio/detalle_beneficio.controller';
import { DetalleBeneficioAfiliado } from './detalle_beneficio/entities/detalle_beneficio_afiliado.entity';

@Module({
  controllers: [PlanillaController, BeneficioController, DetalleBeneficioController, DeduccionController,
                DeduccionController, DetalleDeduccionController,TipoPlanillaController,AfiliadoController ],
  providers: [PlanillaService, BeneficioService, DetalleBeneficioService, DeduccionService,
              TipoPlanillaService, DetalleDeduccionService, AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Beneficio, DetalleBeneficio, Planilla, Deduccion, TipoPlanilla, DetalleDeduccion, Institucion, Afiliado,
       DetalleAfiliado, DetalleBeneficioAfiliado]),]
})
export class PlanillaModule {}