import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Municipio } from '../../municipio/entities/net_municipio.entity';

@Entity({ name: 'NET_COLONIA' })
export class Net_Colonia {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_COLONIA', primaryKeyConstraintName: 'PK_id_colonia' })
    id_colonia: number;

    @Column('varchar2', { nullable: false, length: 50, name: 'NOMBRE_COLONIA' })
    nombre_colonia: string;

    @ManyToOne(() => Net_Municipio, municipio => municipio.colonias)
    @JoinColumn({ name: 'ID_MUNICIPIO', foreignKeyConstraintName: "FK_IDMUNIC_COLONIA" })
    municipio: Net_Municipio;
}
