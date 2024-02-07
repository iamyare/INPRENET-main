import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from './pais/entities/pais.entity';
import { PaisController } from './pais/pais.controller';
import { PaisService } from './pais/pais.service';
import { Provincia } from './provincia/entities/provincia.entity';
import { Municipio } from './municipio/entities/municipio.entity';
import { MunicipioController } from './municipio/municipio.controller';
import { ProvinciaController } from './provincia/provincia.controller';
import { ProvinciaService } from './provincia/provincia.service';
import { MunicipioService } from './municipio/municipio.service';

@Module({
    controllers: [PaisController, ProvinciaController ,MunicipioController],
    providers: [PaisService, ProvinciaService, MunicipioService],
    imports: [
        TypeOrmModule.forFeature([Pais, Provincia, Municipio])
      ]
})
export class RegionalModule {}
