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
import { DetalleDeduccionController } from './detalle-deduccion/detalle-deduccion.controller';
import { DetalleDeduccion } from './detalle-deduccion/entities/detalle-deduccion.entity';
import { DetalleDeduccionService } from './detalle-deduccion/detalle-deduccion.service';
import { Institucion } from '../Empresarial/institucion/entities/institucion.entity';
/* import { Afiliado } from 'src/afiliado/entities/detalle_afiliado.entity'; */
/* import { DatosIdentificacion } from 'src/afiliado/entities/afiliado'; */
import { TipoPlanillaController } from './tipo-planilla/tipo-planilla.controller';
import { AfiliadoService } from 'src/afiliado/afiliado.service';
import { AfiliadoController } from 'src/afiliado/afiliado.controller';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { DetalleAfiliado } from 'src/afiliado/entities/detalle_afiliado.entity';
import { DetallePlanilla } from './planilla/entities/detalle_planilla.entity';

@Module({
  controllers: [PlanillaController, BeneficioController, BeneficioPlanillaController, DeduccionController,
                DeduccionController, DetalleDeduccionController,TipoPlanillaController,AfiliadoController ],
  providers: [PlanillaService, BeneficioService, BeneficioPlanillaService, DeduccionService,
              TipoPlanillaService, DetalleDeduccionService, AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Beneficio, BeneficioPlanilla, Planilla, Deduccion, TipoPlanilla, DetalleDeduccion, Institucion, Afiliado, DetalleAfiliado,
    DetallePlanilla]),]
})
export class PlanillaModule {}