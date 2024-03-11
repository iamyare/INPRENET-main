import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Pais } from './pais/entities/pais.entity';
import { PaisController } from './pais/pais.controller';
import { PaisService } from './pais/pais.service';
import { Net_Departamento } from './provincia/entities/net_departamento.entity';
/* import { Municipio } from './municipio/entities/municipio.entity'; */
/* import { Provincia } from './provincia/entities/provincia.entity'; */
import { Net_Municipio } from './municipio/entities/net_municipio.entity';
import { MunicipioController } from './municipio/municipio.controller';
import { ProvinciaController } from './provincia/provincia.controller';
import { ProvinciaService } from './provincia/provincia.service';
import { MunicipioService } from './municipio/municipio.service';

@Module({
    controllers: [PaisController, ProvinciaController ,MunicipioController],
    providers: [PaisService, ProvinciaService, MunicipioService],
    imports: [
        TypeOrmModule.forFeature([Net_Pais, Net_Departamento, Net_Municipio])
      ]
})
export class RegionalModule {}
