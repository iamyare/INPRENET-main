import { Column, PrimaryGeneratedColumn, OneToMany, Entity, Index } from 'typeorm';
import { Net_Afiliados_Por_Banco } from './net_afiliados-banco';

@Entity()
export class Net_Banco {
    @PrimaryGeneratedColumn('uuid')
    ID_BANCO : string;

    @Column('varchar2', {length: 30, nullable: false})
    @Index("UQ_nomBanc_netBanco", {unique:true})
    NOMBRE_BANCO : string;
    
    @Column('varchar2', {length: 10, nullable: false})
    @Index("UQ_net_banco_cod_banco", {unique:true})
    COD_BANCO : string;

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.banco)
    afiliadosDeBanco : Net_Afiliados_Por_Banco[];
}
