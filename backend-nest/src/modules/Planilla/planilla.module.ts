import { Module } from '@nestjs/common';
import { PlanillaService } from './planilla/planilla.service';
import { PlanillaController } from './planilla/planilla.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficio } from './beneficio/entities/beneficio.entity';
import { BeneficioPlanilla } from './beneficio_planilla/entities/beneficio_planilla.entity';
import { Planilla } from './planilla/entities/planilla.entity';
import { BeneficioController } from './beneficio/beneficio.controller';
import { BeneficioService } from './beneficio/beneficio.service';
import { BeneficioPlanillaController } from './beneficio_planilla/beneficio_planilla.controller';
import { BeneficioPlanillaService } from './beneficio_planilla/beneficio_planilla.service';
import { DeduccionController } from './deduccion/deduccion.controller';
import { TipoPlanillaService } from './tipo-planilla/tipo-planilla.service';
import { Deduccion } from './deduccion/entities/deduccion.entity';
import { TipoPlanilla } from './tipo-planilla/entities/tipo-planilla.entity';
import { DeduccionService } from './deduccion/deduccion.service';

@Module({
  controllers: [PlanillaController, BeneficioController, BeneficioPlanillaController, DeduccionController, DeduccionController],
  providers: [PlanillaService, BeneficioService, BeneficioPlanillaService, DeduccionService, TipoPlanillaService],
  imports: [
    TypeOrmModule.forFeature([Beneficio, BeneficioPlanilla, Planilla, Deduccion, TipoPlanilla])]
})
export class PlanillaModule {}
