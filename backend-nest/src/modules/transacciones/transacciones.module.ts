import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NET_CUENTA_PERSONA } from './entities/net_cuenta_persona.entity';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entitiy';
import { NET_TIPO_MOVIMIENTO_CUENTA } from './entities/net_tipo_movimiento.entity';
import { Net_Usuario } from '../usuario/entities/net_usuario.entity';
import { Net_Persona } from '../afiliado/entities/Net_Persona';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';

@Module({
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  imports: [
    TypeOrmModule.forFeature([
      NET_CUENTA_PERSONA, NET_MOVIMIENTO_CUENTA, NET_TIPO_CUENTA, NET_TIPO_MOVIMIENTO_CUENTA, Net_Usuario, Net_Persona
    ])]
})
export class TransaccionesModule { }
