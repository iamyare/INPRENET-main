import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleBeneficio } from "../../detalle_beneficio/entities/detalle_beneficio.entity";


@Entity()
export class Beneficio {

    @PrimaryGeneratedColumn('uuid')
    id_beneficio: string;

    @Column('varchar2', { length: 30, nullable: false })
    nombre_beneficio: string;

    @Column('varchar2', { length: 200, nullable: false })
    descripcion_beneficio: string;

    @Column()
    estado: string;

    @Column('number', { nullable: false })
    numero_rentas_max: number;

    @OneToMany(() => DetalleBeneficio, detallebeneficio => detallebeneficio.beneficio)
    detallebeneficio : DetalleBeneficio[];
}