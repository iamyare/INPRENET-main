import { Module } from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { AfiliadoController } from './afiliado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { HistorialSalario } from './entities/historialSalarios.entity';

@Module({
  controllers: [AfiliadoController],
  providers: [AfiliadoService],
  imports: [
    TypeOrmModule.forFeature([Afiliado, PerfAfilCentTrab, ReferenciaPersonalAfiliado, ReferenciaPersonal, HistorialSalario])
  ]

})
export class AfiliadoModule {}
