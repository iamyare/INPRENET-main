import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Deduccion } from "../../deduccion/entities/net_deduccion.entity";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Tipo_Persona } from "src/modules/Persona/entities/net_tipo_persona.entity";
import { Net_Planilla } from "./net_planilla.entity";
import { net_persona } from "src/modules/Persona/entities/net_persona.entity";
import { Net_Persona_Por_Banco } from "src/modules/banco/entities/net_persona-banco.entity";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";
import { Net_Detalle_Deduccion } from "../../detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Detalle_Pago_Beneficio } from "../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity";

@Entity({ name: 'NET_BANCO_PLANILLA' })
export class Net_BANCO_PLANILLA {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BANCO_PLANILLA', primaryKeyConstraintName: 'PK_ID_BANCO_PLANILLA' })
    id_banco_planilla: string;

    /*  @ManyToOne(() => Net_Persona_Por_Banco, personaBanco => personaBanco.bancoPlanilla, { cascade: true })
     @JoinColumn({ name: 'ID_AF_BANCO', foreignKeyConstraintName: "FK_ID_AF_BANCO_PER_BANCO" })
     personaBanco: Net_Persona_Por_Banco;
 
     @ManyToOne(() => Net_Planilla, planilla => planilla.bancoPlanilla, { cascade: true })
     @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA_BAN_PLAN" })
     planilla: Net_Planilla;
 
     @OneToMany(() => Net_Detalle_Pago_Beneficio, detallePagBenAfil => detallePagBenAfil.bancoPlanilla)
     detalleBenAfil: Net_Detalle_Pago_Beneficio[];
 
     @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.bancoPlanilla)
     detalleDed: Net_Detalle_Deduccion[]; */

}