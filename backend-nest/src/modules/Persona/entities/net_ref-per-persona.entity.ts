import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";

@Entity({ name: 'NET_REF_PER_PERS' })
@Check("CK_TIPO_REFERENCIA_NET_REF_PER_PERS", `TIPO_REFERENCIA IN ('REFERENCIA PERSONAL', 'REFERENCIA FAMILIAR')`)
@Check("CK_DEPENDIENTE_ECONOMICO_NET_REF_PER_PERS", `DEPENDIENTE_ECONOMICO IN ('SI', 'NO')`)
export class Net_Ref_Per_Pers {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_REF_PERSONAL_AFIL', primaryKeyConstraintName: 'PK_ID_REF_PERSONAL_NET_REF_PER_PERS' })
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

    @ManyToOne(() => net_persona, persona => persona.referenciasPersonalPersona, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_NET_REF_PER_PERS' })
    persona: net_persona;

    @ManyToOne(() => net_persona, persona => persona.referenciasHechas, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA_REFERENCIA', foreignKeyConstraintName: 'FK_ID_PERSONA_REFERENCIA_NET_REF_PER_PERS' })
    referenciada: net_persona;
}
