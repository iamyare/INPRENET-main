import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { Net_Afiliados_Por_Banco } from 'src/modules/banco/entities/net_afiliados-banco';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/tipo_identificacion.entity';
import { Net_Afiliado } from './entities/net_afiliado';
import { Net_Detalle_Afiliado } from './entities/detalle_afiliado.entity';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Net_Afiliado, PerfAfilCentTrab,
                              ReferenciaPersonalAfiliado,
                              ReferenciaPersonal,
                              Net_Afiliados_Por_Banco, Provincia,
                              Pais, TipoIdentificacion,
                              Net_Centro_Trabajo, Net_Banco, Net_Detalle_Afiliado])
  ]

})
export class AfiliadoModule {}
