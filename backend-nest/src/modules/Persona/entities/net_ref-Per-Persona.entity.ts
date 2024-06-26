import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_ReferenciaPersonal } from "./referencia-personal.entity";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({ name: 'NET_REF_PER_PERS' })
@Check(`TIPO_REFERENCIA IN ('REFERENCIA PERSONAL', 'REFERENCIA REFERENCIA FAMILIAR')`)
@Check(`DEPENDIENTE_ECONOMICO IN ('SI', 'NO')`)
export class Net_Ref_Per_Pers {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REF_PERSONAL_AFIL', primaryKeyConstraintName: 'PK_id_refPer_refPer' })
    id_ref_personal_afil: number;

    @Column('varchar2', {
        length: 50,
        nullable: false,
        name: 'TIPO_REFERENCIA'
    })
    tipo_referencia: string;

    @Column('varchar2', {
        length: 50,
        nullable: false,
        name: 'DEPENDIENTE_ECONOMICO'
    })
    dependiente_economico: string;

    @Column('varchar2', {
        length: 30,
        nullable: false,
        name: 'PARENTESCO'
    })
    parentesco: string;

    @ManyToOne(() => Net_Persona, persona => persona.referenciasPersonalPersona)
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_REF_PER_PERS" })
    persona: any;

    @ManyToOne(() => Net_ReferenciaPersonal, referenciaPersonal => referenciaPersonal.referenciasPersonalesAfiliado, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID_REF_PERSONAL', foreignKeyConstraintName: "FK_ID_REF_PERSONAL_REF_PER_AFIL" })
    referenciaPersonal: any;
}