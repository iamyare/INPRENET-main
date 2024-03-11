import { Net_Deduccion_Terceros } from "src/modules/Planilla/deduccion/entities/net_deduccion-terceros.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Net_Institucion {

    @PrimaryGeneratedColumn('uuid')
    id_institucion : string;

    @Column('varchar2', { length: 40, nullable: false })
    nombre_institucion: string;

    @Column('varchar2', { length: 40, nullable: false })
    tipo_institucion: string;

    @OneToMany(() => Net_Deduccion_Terceros, deduccion => deduccion.institucion)
    deduccion : Net_Deduccion_Terceros[];
}