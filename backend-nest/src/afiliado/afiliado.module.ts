import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { AfiliadosPorBanco } from 'src/banco/entities/afiliados-banco';
import { CentroTrabajo } from 'src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity';
import { Banco } from 'src/banco/entities/banco.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/tipo_identificacion.entity';
import { Afiliado } from './entities/afiliado';
import { DetalleAfiliado } from './entities/detalle_afiliado.entity';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Afiliado, PerfAfilCentTrab,
                              ReferenciaPersonalAfiliado,
                              ReferenciaPersonal,
                              AfiliadosPorBanco, Provincia,
                              Pais, TipoIdentificacion,
                              CentroTrabajo, Banco, DetalleAfiliado])
  ]

})
export class AfiliadoModule {}
