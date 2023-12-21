import { Column, PrimaryGeneratedColumn, OneToMany, Entity } from 'typeorm';
import { AfiliadosPorBanco } from './afiliados-banco';

@Entity()
export class Banco {
    @PrimaryGeneratedColumn('uuid')
    id_banco : string;

    @Column('varchar2', {length: 30, nullable: false, unique : true})
    nombre : string;
    
    @Column('varchar2', {unique: true ,length: 10, nullable: false})
    cod_banco : string;

    @OneToMany(() => AfiliadosPorBanco, afiliadosPorBanco => afiliadosPorBanco.banco)
    afiliadosDeBanco : AfiliadosPorBanco[];
}
