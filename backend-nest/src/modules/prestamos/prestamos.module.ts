import { Module } from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Detalle_Prestamo } from './entities/net_detalle_prestamo.entity';

@Module({
  controllers: [PrestamosController],
  providers: [PrestamosService],
  imports: [ TypeOrmModule.forFeature([Net_Detalle_Prestamo])
]
})
export class PrestamosModule {}
