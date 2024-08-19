import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Banco } from "./net_banco.entity";
import { net_persona } from "src/modules/Persona/entities/net_persona.entity";
import { Net_Detalle_Pago_Beneficio } from "src/modules/Planilla/detalle_beneficio/entities/net_detalle_pago_beneficio.entity";

@Entity({ name: 'NET_PERSONA_POR_BANCO' })
export class Net_Persona_Por_Banco {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_AF_BANCO', primaryKeyConstraintName: 'PK_id_af_banco_AfilBan' })
    id_af_banco: number;

    @Column('varchar2', { nullable: false, length: 20, name: 'NUM_CUENTA' })
    num_cuenta: string;

    @Column('varchar2', { nullable: false, length: 20, name: 'ESTADO', default: "INACTIVO" })
    estado: string;

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detallePagoBen => detallePagoBen.personaporbanco)
    detallePagoBen: Net_Detalle_Pago_Beneficio[];

    @ManyToOne(() => Net_Banco, banco => banco.personasDeBanco, { cascade: true })
    @JoinColumn({ name: 'ID_BANCO', foreignKeyConstraintName: "FK_ID_BANCO_PERSBANC" })
    banco: Net_Banco;

    @ManyToOne(() => net_persona, persona => persona.personasPorBanco, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_PERSBANC" })
    persona: net_persona;
}