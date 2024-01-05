import { Module } from '@nestjs/common';
import { CentroTrabajoService } from './centro-trabajo.service';
import { CentroTrabajoController } from './centro-trabajo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentroTrabajo } from './entities/centro-trabajo.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';

@Module({
  controllers: [CentroTrabajoController],
  providers: [CentroTrabajoService],
  imports: [
    TypeOrmModule.forFeature([CentroTrabajo, Provincia])
  ]
})
export class CentroTrabajoModule {}
