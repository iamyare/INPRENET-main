import { Net_Deduccion } from "src/modules/Planilla/deduccion/entities/net_deduccion.entity";
import { Net_Detalle_Deduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Net_Institucion {

    @PrimaryGeneratedColumn('uuid')
    id_institucion : string;

    @Column('varchar2', { length: 40, nullable: false })
    nombre_institucion: string;

    @Column('varchar2', { length: 40, nullable: false })
    tipo_institucion: string;

    @OneToMany(() => Net_Deduccion, deduccion => deduccion.institucion)
    deduccion : Net_Deduccion[];
}