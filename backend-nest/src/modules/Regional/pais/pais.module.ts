import { Module } from '@nestjs/common';
import { PaisService } from './pais.service';
import { PaisController } from './pais.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from './entities/pais.entity';

@Module({
  controllers: [PaisController],
  providers: [PaisService],
  imports: [
    TypeOrmModule.forFeature([Pais])
  ]
})
export class PaisModule {}
