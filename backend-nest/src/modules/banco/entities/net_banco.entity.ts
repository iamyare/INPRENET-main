import { Column, PrimaryGeneratedColumn, OneToMany, Entity, Index } from 'typeorm';
import { Net_Afiliados_Por_Banco } from './net_afiliados-banco';

@Entity()
export class Net_Banco {
    @PrimaryGeneratedColumn('uuid')
    id_banco : string;

    @Column('varchar2', {length: 30, nullable: false})
    @Index("UQ_nomBanc_netBanco", {unique:true})
    nombre_banco : string;
    
    @Column('varchar2', {length: 10, nullable: false})
    @Index("UQ_net_banco_cod_banco", {unique:true})
    cod_banco : string;

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.banco)
    afiliadosDeBanco : Net_Afiliados_Por_Banco[];
}
