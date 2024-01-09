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
import { DedAfilPlanillaModule } from './ded-afil-planilla/ded-afil-planilla.module';
import { DedAfilPlanilla } from './ded-afil-planilla/entities/ded-afil-planilla.entity';
import { DedAfilPlanillaService } from './ded-afil-planilla/ded-afil-planilla.service';
import { DedAfilPlanillaController } from './ded-afil-planilla/ded-afil-planilla.controller';

@Module({
  controllers: [PlanillaController, BeneficioController, BeneficioPlanillaController, DeduccionController, DeduccionController, DedAfilPlanillaController],
  providers: [PlanillaService, BeneficioService, BeneficioPlanillaService, DeduccionService, TipoPlanillaService ,DedAfilPlanillaService],
  imports: [
    TypeOrmModule.forFeature([Beneficio, BeneficioPlanilla, Planilla, Deduccion, TipoPlanilla, DedAfilPlanilla]),
    DedAfilPlanillaModule]
})
export class PlanillaModule {}
