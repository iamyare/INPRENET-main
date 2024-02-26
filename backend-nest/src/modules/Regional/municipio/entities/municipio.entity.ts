import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Net_Provincia } from '../../provincia/entities/net_provincia.entity';

@Entity()
export class Municipio {
    @PrimaryGeneratedColumn('uuid')
    id_municipio : string;

    @Column('varchar2', {nullable: false, length: 30})
    nombre_municipio : string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.municipio)
    provincia : Net_Provincia;
}
