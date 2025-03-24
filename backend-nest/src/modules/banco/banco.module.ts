import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Banco } from './entities/net_banco.entity';
import { Net_Persona_Por_Banco } from './entities/net_persona-banco.entity';
import { Net_Cuenta_Centro_Trabajo } from './entities/net_cuenta_centro_trabajo.entity';
import { Net_Historial_Pagos_Fallidos } from './entities/net_historial_pagos_fallidos.entity';
import { NetHistorialPagoPlanilla } from './entities/net_historial_pago_planilla.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { Net_Detalle_Pago_Beneficio } from '../Planilla/detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { Net_Detalle_Deduccion } from '../Planilla/detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Planilla } from '../Planilla/planilla/entities/net_planilla.entity';
import { Net_Historial_Pagos_Pendientes } from './entities/net_historial_pagos_pendientes.entity';
import { Net_Usuario_Empresa } from '../usuario/entities/net_usuario_empresa.entity';
import { MailService } from 'src/common/services/mail.service';
import { NetHistorialCuadrePlanillas } from './entities/net_historial_cuadre_planillas.entity';

@Module({
  controllers: [BancoController],
  providers: [BancoService, MailService],
  imports: [
    TypeOrmModule.forFeature([Net_Banco, Net_Persona_Por_Banco,Net_Cuenta_Centro_Trabajo,
      Net_Historial_Pagos_Fallidos,NetHistorialPagoPlanilla, NetHistorialCuadrePlanillas, net_persona, Net_Detalle_Pago_Beneficio,
    Net_Detalle_Deduccion, Net_Planilla,Net_Historial_Pagos_Pendientes, Net_Usuario_Empresa])
  ]
})
export class BancoModule {}
