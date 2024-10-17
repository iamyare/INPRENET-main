import { Net_Tipo_Persona } from "src/modules/Persona/entities/net_tipo_persona.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Beneficio } from "../../beneficio/entities/net_beneficio.entity";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";

@Entity({ name: 'NET_BENEFICIO_TIPO_PERSONA' })
export class Net_Beneficio_Tipo_Persona {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BENEFICIO_TIPO_PERSONA', primaryKeyConstraintName: 'PK_ID_BENEFICIO_TIPO_PERS' })
    id_beneficio_tipo_persona: string;

    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.benefTipoPersona)
    @JoinColumn({ name: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BENEFICIO_BEN_TIPO_PERS" })
    beneficio: Net_Beneficio;

    @ManyToOne(() => Net_Tipo_Persona, tipPersona => tipPersona.benfTipoPersona)
    @JoinColumn({ name: 'ID_TIPO_PERSONA', foreignKeyConstraintName: "FK_ID_TIPO_PERSONA_BEN_TIPO_PERS" })
    tipPersona: Net_Tipo_Persona;

    @ManyToOne(() => Net_TipoPlanilla, tipoP => tipoP.bentipPer)
    @JoinColumn({ name: 'ID_TIPO_PLANILLA', foreignKeyConstraintName: "FK_ID_TIPO_PLANILLA_BEN_TIPO_PERS" })
    tipo_planilla: Net_TipoPlanilla;

}