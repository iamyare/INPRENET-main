import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Net_Provincia } from '../../provincia/entities/net_provincia.entity';

@Entity()
export class Net_Municipio {
    @PrimaryGeneratedColumn('uuid')
    ID_MUNICIPIO : string;

    @Column('varchar2', {nullable: false, length: 30})
    NOMBRE_MUNICIPIO : string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.municipio)
    provincia : Net_Provincia;
}
