import { Module } from '@nestjs/common';
import { TipoIdentificacionService } from './tipo_identificacion.service';
import { TipoIdentificacionController } from './tipo_identificacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoIdentificacion } from './entities/tipo_identificacion.entity';

@Module({
  controllers: [TipoIdentificacionController],
  providers: [TipoIdentificacionService],
  imports: [
    TypeOrmModule.forFeature([TipoIdentificacion])
  ]
})
export class TipoIdentificacionModule {}
