import { Module } from '@nestjs/common';
import { DeduccionService } from './deduccion.service';
import { DeduccionController } from './deduccion.controller';

@Module({
  controllers: [DeduccionController],
  providers: [DeduccionService],
})
export class DeduccionModule {}
