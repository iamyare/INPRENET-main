import { Module } from '@nestjs/common';
import { ConasaService } from './conasa.service';
import { ConasaController } from './conasa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Categoria } from './entities/net_categorias.entity';
import { Net_Plan } from './entities/net_planes.entity';

@Module({
  controllers: [ConasaController],
  providers: [ConasaService],
  imports: [TypeOrmModule.forFeature([Net_Categoria, Net_Plan])],
})
export class ConasaModule {}
