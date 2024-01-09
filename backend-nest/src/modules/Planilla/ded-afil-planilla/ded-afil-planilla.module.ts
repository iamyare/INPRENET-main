import { Module } from '@nestjs/common';
import { DedAfilPlanillaService } from './ded-afil-planilla.service';
import { DedAfilPlanillaController } from './ded-afil-planilla.controller';

@Module({
  controllers: [DedAfilPlanillaController],
  providers: [DedAfilPlanillaService],
})
export class DedAfilPlanillaModule {}
