import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonal } from "./referencia-personal.entity";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({name:'NET_REF_PER_AFIL'})
export class Net_Ref_Per_Afil {

    @PrimaryGeneratedColumn({ type: 'int',name: 'ID_REF_PERSONAL_AFIL',  primaryKeyConstraintName: 'PK_id_refPer_refPer'})
    id_ref_personal_afil: number;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.referenciasPersonalAfiliado)
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName:"FK_ID_PERSONA_REF_PER_AFIL"})
    afiliado: Net_Persona;

    @ManyToOne(() => Net_ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado)
    @JoinColumn({ name: 'ID_REF_PERSONAL', foreignKeyConstraintName:"FK_ID_REF_PERSONAL_REF_PER_AFIL" })
    referenciaPersonal: Net_ReferenciaPersonal;
}