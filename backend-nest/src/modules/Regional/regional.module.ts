import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Pais } from './pais/entities/pais.entity';
import { PaisController } from './pais/pais.controller';
import { PaisService } from './pais/pais.service';
import { Net_Departamento } from './provincia/entities/net_departamento.entity';
import { Net_Municipio } from './municipio/entities/net_municipio.entity';
import { MunicipioController } from './municipio/municipio.controller';
import { MunicipioService } from './municipio/municipio.service';
import { DepartamentoController } from './provincia/departamento.controller';
import { DepartamentoService } from './provincia/departamento.service';

@Module({
    controllers: [PaisController, DepartamentoController ,MunicipioController],
    providers: [PaisService, DepartamentoService, MunicipioService],
    imports: [
        TypeOrmModule.forFeature([Net_Pais, Net_Departamento, Net_Municipio])
      ],
      exports: [TypeOrmModule,PaisService, DepartamentoService, MunicipioService]
})
export class RegionalModule {}
