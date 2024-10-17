import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Banco } from './entities/net_banco.entity';
import { Net_Persona_Por_Banco } from './entities/net_persona-banco.entity';
import { Net_Cuenta_Centro_Trabajo } from './entities/net_cuenta_centro_trabajo.entity';

@Module({
  controllers: [BancoController],
  providers: [BancoService],
  imports: [
    TypeOrmModule.forFeature([Net_Banco, Net_Persona_Por_Banco,Net_Cuenta_Centro_Trabajo])
  ]
})
export class BancoModule {}
