import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Provincia } from '../../provincia/entities/net_provincia.entity';

@Entity({name:'NET_MUNICIPIO'})
export class Net_Municipio {
    @PrimaryGeneratedColumn('uuid',{name:'ID_MUNICIPIO'})
    id_municipio : string;

    @Column('varchar2', {nullable: false, length: 30, name:'NOMBRE_MUNICIPIO'})
    nombre_municipio : string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.municipio)
    @JoinColumn({ name: 'ID_PROVINCIA', referencedColumnName: 'id_provincia' })
    provincia : Net_Provincia;
}
