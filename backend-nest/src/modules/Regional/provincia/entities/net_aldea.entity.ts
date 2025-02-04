import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Municipio } from '../../municipio/entities/net_municipio.entity';

@Entity({ name: 'NET_ALDEA' })
export class Net_Aldea {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_ALDEA', primaryKeyConstraintName: 'PK_id_aldea' })
    id_aldea: number;

    @Column('varchar2', { nullable: false, length: 50, name: 'NOMBRE_ALDEA' })
    nombre_aldea: string;

    @ManyToOne(() => Net_Municipio, municipio => municipio.aldeas)
    @JoinColumn({ name: 'ID_MUNICIPIO', foreignKeyConstraintName: "FK_IDMUNIC_ALDEA" })
    municipio: Net_Municipio;
}
