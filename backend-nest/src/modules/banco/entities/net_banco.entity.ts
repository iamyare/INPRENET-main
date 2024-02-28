import { Column, PrimaryGeneratedColumn, OneToMany, Entity, Index } from 'typeorm';
import { Net_Afiliados_Por_Banco } from './net_afiliados-banco';

@Entity()
export class Net_Banco {
    @PrimaryGeneratedColumn('uuid')
    id_banco : string;

    @Column('varchar2', {length: 30, nullable: false, unique : true})
    nombre_banco : string;
    
    @Column('varchar2', {unique: true ,length: 10, nullable: false})
    cod_banco : string;

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.banco)
    afiliadosDeBanco : Net_Afiliados_Por_Banco[];
}
