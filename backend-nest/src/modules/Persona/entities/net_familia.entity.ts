import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";
import { Net_Familia_Pep } from 'src/modules/Empresarial/entities/net_familia_pep.entity';

@Entity({ name: 'NET_FAMILIA' })
export class Net_Familia {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_FAMILIA', primaryKeyConstraintName: 'PK_ID_FAMILIA' })
    id_familia: number;

    @Column('varchar2', {
        length: 30,
        nullable: false,
        name: 'PARENTESCO'
    })
    parentesco: string;

    @Column('varchar2', {
        length: 30,
        nullable: true,
        name: 'TRABAJA'
    })
    trabaja: string;

    @ManyToOne(() => net_persona, persona => persona.familiares, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_NET_FAMILIA' })
    persona: net_persona;

    @ManyToOne(() => net_persona, persona => persona.familiaresReferenciados, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA_REFERENCIA', foreignKeyConstraintName: 'FK_ID_PERSONA_REFERENCIA_NET_FAMILIA' })
    referenciada: net_persona;

    @OneToMany(() => Net_Familia_Pep, familia_pep => familia_pep.familia)
    familia_pep: Net_Familia_Pep[];
}
