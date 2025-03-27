import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';
import { NET_TIPO_MOVIMIENTO } from './entities/net_tipo_movimiento.entity';
import { Net_Colegios_Magisteriales } from './entities/net_colegios_magisteriales.entity';
import { Net_Persona_Colegios } from './entities/net_persona_colegios.entity';
import { NET_PROFESIONES } from './entities/net_profesiones.entity';
import { Net_Usuario_Empresa } from '../usuario/entities/net_usuario_empresa.entity';
import { Net_Cuenta_Persona } from './entities/net_cuenta_persona.entity';
import { Net_Tipo_Cuenta } from './entities/net_tipo_cuenta.entity';
import { Net_Movimientos } from './entities/net_movimientos.entity';
import { Net_Planilla_Movimientos } from './entities/net_planilla_movimientos.entity';

@Module({
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  imports: [
    TypeOrmModule.forFeature([Net_Movimientos, Net_Planilla_Movimientos,
      Net_Cuenta_Persona, NET_MOVIMIENTO_CUENTA, Net_Tipo_Cuenta, NET_TIPO_MOVIMIENTO, Net_Usuario_Empresa, net_persona, Net_Colegios_Magisteriales, Net_Persona_Colegios, NET_PROFESIONES
    ])],
  exports: [TypeOrmModule, TransaccionesService],
})
export class TransaccionesModule { }
