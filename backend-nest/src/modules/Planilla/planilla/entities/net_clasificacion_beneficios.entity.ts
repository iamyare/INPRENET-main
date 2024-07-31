import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Deduccion } from "../../deduccion/entities/net_deduccion.entity";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Tipo_Persona } from "src/modules/Persona/entities/net_tipo_persona.entity";

@Entity({ name: 'NET_CLASIFICACION_BENEFICIOS' })
export class Net_Clasificacion_Beneficios {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CLASIFICACION_BENEFICIOS', primaryKeyConstraintName: 'PK_ID_CLASIFICACION_BENEFICIOS' })
    id_clasificacion_beneficios: string;


    /*     @ManyToOne(() => Net_Deduccion, deduccion => deduccion.bendedtipplan, { cascade: true })
        @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: "FK_ID_DEDUCCION_BENDED_TIP_PLAN" })
        deduccion: Net_Deduccion; */


    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.BenDedTipPlan, { cascade: true })
    @JoinColumn({ name: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BENEFICIO_BENDED_TIP_PLAN" })
    beneficio: Net_Beneficio;

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.BenDedTipoPlan, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_PLANILLA', foreignKeyConstraintName: "FK_ID_TIPO_PLANILLA_BENDED_TIP_PLAN" })
    tipoPlanilla: Net_TipoPlanilla;


}