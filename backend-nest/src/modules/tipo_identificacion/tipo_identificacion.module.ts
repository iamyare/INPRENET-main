import { Module } from '@nestjs/common';
import { TipoIdentificacionService } from './tipo_identificacion.service';
import { TipoIdentificacionController } from './tipo_identificacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_TipoIdentificacion } from './entities/net_tipo_identificacion.entity';

@Module({
  controllers: [TipoIdentificacionController],
  providers: [TipoIdentificacionService],
  imports: [
    TypeOrmModule.forFeature([Net_TipoIdentificacion])
  ]
})
export class TipoIdentificacionModule {}
