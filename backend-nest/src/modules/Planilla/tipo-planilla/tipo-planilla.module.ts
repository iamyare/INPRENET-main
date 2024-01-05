import { Module } from '@nestjs/common';
import { TipoPlanillaService } from './tipo-planilla.service';
import { TipoPlanillaController } from './tipo-planilla.controller';

@Module({
  controllers: [TipoPlanillaController],
  providers: [TipoPlanillaService],
})
export class TipoPlanillaModule {}
