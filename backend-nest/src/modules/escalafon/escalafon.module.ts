import { Module } from '@nestjs/common';
import { EscalafonService } from './escalafon.service';
import { EscalafonController } from './escalafon.controller';
import { net_detalle_envio_escalafon } from './entities/net_detalle_envio_escalafon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [EscalafonController],
  providers: [EscalafonService],
  imports: [
    TypeOrmModule.forFeature([
      net_detalle_envio_escalafon
    ]),
  ],
})
export class EscalafonModule {}
