import { Module } from '@nestjs/common';
import { ProvinciaService } from './provincia.service';
import { ProvinciaController } from './provincia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';

@Module({
  controllers: [ProvinciaController],
  providers: [ProvinciaService],
  imports: [
    TypeOrmModule.forFeature([Municipio])
  ]
})
export class ProvinciaModule {}
