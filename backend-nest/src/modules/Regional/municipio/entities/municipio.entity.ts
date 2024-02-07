import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Provincia } from '../../provincia/entities/provincia.entity';

@Entity()
export class Municipio {
    @PrimaryGeneratedColumn('uuid')
    id_municipio : string;

    @Column('varchar2', {nullable: false, length: 30})
    nombre_municipio : string;

    @ManyToOne(() => Provincia, provincia => provincia.municipio)
    provincia : Provincia;
}
