import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pais } from "./pais.entity";
import { Municipio } from "./municipio";
import { Afiliado } from "src/afiliado/entities/afiliado.entity";
import { CentroTrabajo } from "src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity";


@Entity()
export class Provincia{
    @PrimaryGeneratedColumn('uuid')
    id_provincia

    @Column('varchar2', {length: 30 ,nullable:false})
    nombre_provincia: string

    @ManyToOne(() => Pais, pais => pais.provincia)
    pais: Pais;

    @OneToMany(() => Municipio, municipio => municipio.provincia)
    municipio: Municipio[];

    @OneToMany(() => Afiliado, afiliado => afiliado.provincia)
    afiliados: Afiliado[];

    @OneToMany(() => CentroTrabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: CentroTrabajo[];

}
