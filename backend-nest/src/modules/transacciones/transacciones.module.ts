import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NET_CUENTA_PERSONA } from './entities/net_cuenta_persona.entity';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entity';
import { Net_Usuario } from '../usuario/entities/net_usuario.entity';
import { Net_Persona } from '../Persona/entities/Net_Persona.entity';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';
import { NET_TIPO_MOVIMIENTO } from './entities/net_tipo_movimiento.entity';
import { Net_Colegios_Magisteriales } from './entities/net_colegios_magisteriales.entity';
import { Net_Persona_Colegios } from './entities/net_persona_colegios.entity';

@Module({
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  imports: [
    TypeOrmModule.forFeature([
      NET_CUENTA_PERSONA, NET_MOVIMIENTO_CUENTA, NET_TIPO_CUENTA, NET_TIPO_MOVIMIENTO, Net_Usuario, Net_Persona, Net_Colegios_Magisteriales, Net_Persona_Colegios
    ])],
    exports: [TypeOrmModule, TransaccionesService],
})
export class TransaccionesModule { }
