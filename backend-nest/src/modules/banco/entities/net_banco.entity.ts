import { Column, PrimaryGeneratedColumn, OneToMany, Entity, Index, Check } from 'typeorm';
import { Net_Persona_Por_Banco } from './net_persona-banco.entity';

@Entity({ name: 'NET_BANCO' })
@Check("CHK_NOMBRE_BANCO", `"NOMBRE_BANCO" IS NOT NULL`)
@Check("CHK_COD_BANCO", `"COD_BANCO" IS NOT NULL`)
export class Net_Banco {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BANCO', primaryKeyConstraintName: 'PK_id_banco_Banco' })
    id_banco: number;

    @Column('varchar2', { length: 80, name: 'NOMBRE_BANCO' })
    @Index("UQ_NOMB_BANC_NET_BANCO")
    nombre_banco: string;

    @Column('varchar2', { length: 80, name: 'COD_BANCO' })
    @Index("UQ_net_banco_cod_banco")
    cod_banco: string;

    @Column('varchar2', {nullable:true, length: 80, name: 'CODIGO_ACH' })
    @Index("UQ_net_banco_codigo_ach")
    codigo_ach: string;

    @OneToMany(() => Net_Persona_Por_Banco, personasPorBanco => personasPorBanco.banco)
    personasDeBanco: Net_Persona_Por_Banco[];
} 
