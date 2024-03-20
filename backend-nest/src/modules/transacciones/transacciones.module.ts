import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NET_CUENTAS_PERSONA } from './entities/net_cuentas_persona.entity';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { NET_TIPOS_CUENTA } from './entities/net_tipos_cuenta.entitiy';
import { NET_TIPO_MOVIMIENTO_CUENTA } from './entities/net_tipo_movimiento_cuenta.entity';
import { Net_Usuario } from 'src/modules/usuario/entities/net_usuario.entity';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';

@Module({
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  imports: [
    TypeOrmModule.forFeature([
      NET_CUENTAS_PERSONA, NET_MOVIMIENTO_CUENTA, NET_TIPOS_CUENTA, NET_TIPO_MOVIMIENTO_CUENTA, Net_Usuario, Net_Persona
    ])]
})
export class TransaccionesModule {}
