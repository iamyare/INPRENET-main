import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";

@Entity({ name: 'NET_FAMILIA' })
export class Net_Familia {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_FAMILIA', primaryKeyConstraintName: 'PK_ID_FAMILIA' })
    id_familia: number;

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

    @ManyToOne(() => net_persona, persona => persona.familiares, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_NET_FAMILIA' })
    persona: net_persona;

    @ManyToOne(() => net_persona, persona => persona.familiaresReferenciados, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA_REFERENCIA', foreignKeyConstraintName: 'FK_ID_PERSONA_REFERENCIA_NET_FAMILIA' })
    referenciada: net_persona;
}
