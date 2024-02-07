import { DetalleDeduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Institucion {

    @PrimaryGeneratedColumn()
    id_institucion : string;

    @Column('varchar2', { length: 40, nullable: false })
    nombre_institucion: string;

    @Column('varchar2', { length: 40, nullable: false })
    tipo_institucion: string;

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.institucion)
    detalleDeduccion : DetalleDeduccion[];
}