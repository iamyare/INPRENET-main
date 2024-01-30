import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "../../provincia/entities/provincia.entity";
import { DatosIdentificacion } from "src/afiliado/entities/datos_identificacion";

@Entity()
export class Pais {

    @PrimaryGeneratedColumn('uuid')
    id_pais : string;

    @Column('varchar2', { length: 20, nullable: false })
    nombre_pais : string;

    @Column('varchar2', { length: 20, nullable: false })
    nacionalidad : string;

    @OneToMany(() => DatosIdentificacion, datosIdentificacion => datosIdentificacion.pais)
    datosIdentificacion: DatosIdentificacion[];

    @OneToMany(() => Provincia, provincia => provincia.pais)
    provincia: Provincia[];
}
