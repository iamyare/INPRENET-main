import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_ReferenciaPersonal } from './entities/referencia-personal';
import { Net_ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { Net_Afiliados_Por_Banco } from 'src/modules/banco/entities/net_afiliados-banco';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Net_Provincia } from 'src/modules/Regional/provincia/entities/net_provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { Net_TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity';
import { Net_Afiliado } from './entities/net_afiliado';
import { Net_Detalle_Afiliado } from './entities/detalle_afiliado.entity';
import { Net_perf_afil_cent_trab } from './entities/net_perf_afil_cent_trab';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Net_Afiliado, Net_perf_afil_cent_trab,
                              Net_ReferenciaPersonalAfiliado,
                              Net_ReferenciaPersonal,
                              Net_Afiliados_Por_Banco, Net_Provincia,
                              Pais, Net_TipoIdentificacion,
                              Net_Centro_Trabajo, Net_Banco, Net_Detalle_Afiliado])
  ]

})
export class AfiliadoModule {}
