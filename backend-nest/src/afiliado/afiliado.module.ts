import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { HistorialSalario } from './entities/historialSalarios.entity';
import { AfiliadosPorBanco } from 'src/banco/entities/afiliados-banco';
import { Pais } from 'src/pais/entities/pais.entity';
import { Provincia } from 'src/pais/entities/provincia';
import { TipoIdentificacion } from 'src/tipo_identificacion/entities/tipo_identificacion.entity';
import { CentroTrabajo } from 'src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Afiliado, PerfAfilCentTrab,
                              ReferenciaPersonalAfiliado,
                              ReferenciaPersonal, HistorialSalario,
                              AfiliadosPorBanco, Provincia,
                              Pais, TipoIdentificacion,
                              CentroTrabajo])
  ]

})
export class AfiliadoModule {}
