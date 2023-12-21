import { Module } from '@nestjs/common';
import { PaisService } from './pais.service';
import { PaisController } from './pais.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from './entities/pais.entity';
import { Provincia } from './entities/provincia';
import { Municipio } from './entities/municipio';

@Module({
  controllers: [PaisController],
  providers: [PaisService],
  imports: [
    TypeOrmModule.forFeature([Pais, Provincia, Municipio])
  ]
})
export class PaisModule {}
