import { Column, PrimaryGeneratedColumn, OneToMany, Entity, Index } from 'typeorm';
import { Net_Persona_Por_Banco } from './net_persona-banco.entity';

@Entity({ name: 'NET_BANCO' })
export class Net_Banco {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BANCO', primaryKeyConstraintName: 'PK_id_banco_Banco' })
    id_banco: number;

    @Column('varchar2', { length: 30, nullable: true, name: 'NOMBRE_BANCO' })
    @Index("UQ_nomBanc_netBanco", { unique: true })
    nombre_banco: string;

    @Column('varchar2', { length: 10, nullable: false, name: 'COD_BANCO' })
    @Index("UQ_net_banco_cod_banco", { unique: true })
    cod_banco: string;

    @OneToMany(() => Net_Persona_Por_Banco, personasPorBanco => personasPorBanco.banco)
    personasDeBanco: Net_Persona_Por_Banco[];
}
