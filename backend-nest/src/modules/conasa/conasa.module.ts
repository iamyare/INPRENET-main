import { Module } from '@nestjs/common';
import { ConasaService } from './conasa.service';
import { ConasaController } from './conasa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Categoria } from './entities/net_categorias.entity';
import { Net_Plan } from './entities/net_planes.entity';
import { Net_Contratos_Conasa } from './entities/net_contratos_conasa.entity';
import { Net_Beneficiarios_Conasa } from './entities/net_beneficiarios_conasa.entity';
import { AfiliadoModule } from '../Persona/afiliado.module';

@Module({
  controllers: [ConasaController],
  providers: [ConasaService],
  imports: [TypeOrmModule.forFeature([Net_Categoria, Net_Plan,Net_Contratos_Conasa, Net_Beneficiarios_Conasa]), AfiliadoModule],
})
export class ConasaModule {}
