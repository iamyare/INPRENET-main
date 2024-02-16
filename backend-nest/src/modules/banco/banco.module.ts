import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banco } from './entities/banco.entity';
import { AfiliadosPorBanco } from './entities/afiliados-banco';

@Module({
  controllers: [BancoController],
  providers: [BancoService],
  imports: [
    TypeOrmModule.forFeature([Banco, AfiliadosPorBanco])
  ]
})
export class BancoModule {}
