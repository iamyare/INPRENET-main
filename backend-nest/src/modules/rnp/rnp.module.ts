import { Module } from '@nestjs/common';
import { RnpService } from './rnp.service';
import { RnpController } from './rnp.controller';
import { RnpGateway } from './rnp.gateway';
import { AfiliadoService } from '../Persona/afiliado.service';
import { AfiliadoModule } from '../Persona/afiliado.module';
import { Net_Colegios_Magisteriales } from '../transacciones/entities/net_colegios_magisteriales.entity';
import { Net_Persona_Colegios } from '../transacciones/entities/net_persona_colegios.entity';
import { RegionalModule } from '../Regional/regional.module';
import { TransaccionesModule } from '../transacciones/transacciones.module';
import { net_causas_fallecimientos } from '../Persona/entities/net_causas_fallecimientos.entity';
import { Net_Empleado_Centro_Trabajo } from '../Empresarial/entities/net_empleado_centro_trabajo.entity';
import { net_otra_fuente_ingreso } from '../Persona/entities/net_otra_fuente_ingreso.entity';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { Net_Discapacidad } from '../Persona/entities/net_discapacidad.entity';
import { net_estado_afiliacion } from '../Persona/entities/net_estado_afiliacion.entity';
import { net_detalle_persona } from '../Persona/entities/net_detalle_persona.entity';
import { Net_Ref_Per_Pers } from '../Persona/entities/net_ref-per-persona.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Net_Banco } from '../banco/entities/net_banco.entity';
import { Net_Persona_Por_Banco } from '../banco/entities/net_persona-banco.entity';
import { Net_Centro_Trabajo } from '../Empresarial/entities/net_centro_trabajo.entity';
import { Net_Jornada } from '../Empresarial/entities/net_jornada.entity';
import { Net_Nivel_Educativo } from '../Empresarial/entities/net_nivel_educativo.entity';
import { Net_Familia } from '../Persona/entities/net_familia.entity';
import { Net_perf_pers_cent_trab } from '../Persona/entities/net_perf_pers_cent_trab.entity';
import { Net_Persona_Discapacidad } from '../Persona/entities/net_persona_discapacidad.entity';
import { Net_Referencias } from '../Persona/entities/net_referencias.entity';
import { Net_Tipo_Persona } from '../Persona/entities/net_tipo_persona.entity';
import { Net_Municipio } from '../Regional/municipio/entities/net_municipio.entity';
import { Net_Pais } from '../Regional/pais/entities/pais.entity';
import { Net_Aldea } from '../Regional/provincia/entities/net_aldea.entity';
import { Net_Colonia } from '../Regional/provincia/entities/net_colonia.entity';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { Net_Tipo_Identificacion } from '../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { NET_PROFESIONES } from '../transacciones/entities/net_profesiones.entity';
import { AfiliacionService } from '../Persona/afiliacion/afiliacion.service';

@Module({
  controllers: [RnpController],
  providers: [RnpService, RnpGateway, AfiliadoService, AfiliacionService],
  imports: [RegionalModule, TransaccionesModule,
      TypeOrmModule.forFeature([Net_Empleado_Centro_Trabajo, net_otra_fuente_ingreso, net_persona, Net_Discapacidad, net_estado_afiliacion, net_detalle_persona, Net_perf_pers_cent_trab,
        Net_Ref_Per_Pers, Net_Persona_Discapacidad,
        Net_Persona_Por_Banco, Net_Departamento, Net_Familia,
        Net_Pais, Net_Tipo_Identificacion, net_causas_fallecimientos,
        Net_Centro_Trabajo, Net_Banco, Net_Tipo_Persona, Net_Municipio,
        Net_Jornada, Net_Nivel_Educativo, Net_Referencias, NET_PROFESIONES,
        Net_Colegios_Magisteriales, Net_Aldea, Net_Colonia])
    ],
})
export class RnpModule {}
