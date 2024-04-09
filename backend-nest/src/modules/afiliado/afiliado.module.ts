import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_ReferenciaPersonal } from './entities/referencia-personal';
import { Net_Ref_Per_Afil } from './entities/net_ref-Per-Afiliado';
import { Net_Afiliados_Por_Banco } from '../banco/entities/net_afiliados-banco';
import { Net_Centro_Trabajo } from '../Empresarial/centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_TipoIdentificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { Net_Persona } from './entities/Net_Persona';
import { Net_Detalle_Afiliado } from './entities/Net_detalle_persona.entity';
import { Net_perf_afil_cent_trab } from './entities/net_perf_afil_cent_trab';
import { Net_Tipo_Persona } from './entities/net_tipo_persona.entity';
import { Net_Estado_Afiliado } from './entities/net_estado_afiliado.entity';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Net_Estado_Afiliado, Net_Persona, Net_perf_afil_cent_trab,
      Net_Ref_Per_Afil,
      Net_ReferenciaPersonal,
      Net_Afiliados_Por_Banco, Net_Departamento,
      Net_Pais, Net_TipoIdentificacion,
      Net_Centro_Trabajo, Net_Banco, Net_Detalle_Afiliado, Net_Tipo_Persona])
  ]

})
export class AfiliadoModule { }
