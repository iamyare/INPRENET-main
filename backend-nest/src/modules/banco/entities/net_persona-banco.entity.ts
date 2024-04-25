import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Banco } from "./net_banco.entity";
import { Net_Persona } from "../../Persona/entities/Net_Persona.entity";

@Entity({ name: 'NET_PERSONA_POR_BANCO' })
export class Net_Persona_Por_Banco {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_AF_BANCO', primaryKeyConstraintName: 'PK_id_af_banco_AfilBan' })
    id_af_banco: number;

    @Column('varchar2', { nullable: false, length: 20, name: 'NUM_CUENTA ' })
    @Index("UQ_numCuen_netAfilBanco", { unique: true })
    num_cuenta: string;

    @Column('varchar2', { nullable: false, length: 20, name: 'ESTADO' })
    estado: string;

    @ManyToOne(() => Net_Banco, banco => banco.personasDeBanco, { cascade: true })
    @JoinColumn({ name: 'ID_BANCO', foreignKeyConstraintName: "FK_ID_BANCO_PERSBANC" })
    banco: Net_Banco;

    @ManyToOne(() => Net_Persona, persona => persona.personasPorBanco, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_PERSBANC" })
    persona: Net_Persona;


}