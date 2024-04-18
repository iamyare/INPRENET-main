import { Net_Deduccion } from "../../Planilla/deduccion/entities/net_deduccion.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'NET_INSTITUCION' })
export class Net_Institucion {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_INSTITUCION', primaryKeyConstraintName: 'PK_idIns_Inst' })
    id_institucion: number;

    @Column('varchar2', { length: 40, nullable: false, name: 'NOMBRE_INSTITUCION' })
    nombre_institucion: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'TIPO_INSTITUCION' })
    tipo_institucion: string;

    @OneToMany(() => Net_Deduccion, deduccion => deduccion.institucion)
    deduccion: Net_Deduccion[];
}