import { Module } from '@nestjs/common';
import { ProvinciaService } from './provincia.service';
import { ProvinciaController } from './provincia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Municipio } from '../municipio/entities/net_municipio.entity';

@Module({
  controllers: [ProvinciaController],
  providers: [ProvinciaService],
  imports: [
    TypeOrmModule.forFeature([Net_Municipio])
  ]
})
export class ProvinciaModule {}
