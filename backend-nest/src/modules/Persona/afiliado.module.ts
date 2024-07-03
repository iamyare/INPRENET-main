import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { net_persona } from './entities/net_persona.entity';
import { Net_Tipo_Persona } from './entities/net_tipo_persona.entity';
import { net_detalle_persona } from './entities/net_detalle_persona.entity';
import { Net_Ref_Per_Pers } from './entities/net_ref-per-persona.entity';
import { Net_perf_pers_cent_trab } from './entities/net_perf_pers_cent_trab.entity';
import { RegionalModule } from '../Regional/regional.module';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { TransaccionesModule } from '../transacciones/transacciones.module';
import { AfiliacionController } from './afiliacion/afiliacion.controller';
import { AfiliacionService } from './afiliacion/afiliacion.service';
import { Net_Discapacidad } from './entities/net_discapacidad.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { net_estado_afiliacion } from './entities/net_estado_afiliacion.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { net_causas_fallecimientos } from './entities/net_causas_fallecimientos.entity';

@Module({
  controllers: [AfiliadoController, AfiliacionController],
  providers: [AfiliadoService, AfiliacionService],
  imports: [RegionalModule, TransaccionesModule,
    TypeOrmModule.forFeature([net_persona, Net_Discapacidad, net_estado_afiliacion, net_detalle_persona, Net_perf_pers_cent_trab,
      Net_Ref_Per_Pers,
      Net_Persona_Por_Banco, Net_Departamento,
      Net_Pais, Net_Tipo_Identificacion,net_causas_fallecimientos,
      Net_Centro_Trabajo, Net_Banco, Net_Tipo_Persona, Net_Municipio])
  ],
  exports: [TypeOrmModule, AfiliadoService],
})
export class AfiliadoModule { }
