import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pais } from "./pais.entity";
import { Municipio } from "./municipio";
import { Afiliado } from "src/afiliado/entities/afiliado.entity";
import { CentroTrabajo } from "src/empresas/entities/centroTrabajo.entity";

@Entity()
export class Provincia{
    @PrimaryGeneratedColumn('uuid')
    id_provincia

    @Column('varchar2', {length: 30 ,nullable:false})
    nombre: string

    @ManyToOne(() => Pais, pais => pais.provincia)
    pais: Pais;

    @OneToMany(() => Municipio, municipio => municipio.provincia)
    municipio: Municipio[];

    @OneToMany(() => Afiliado, afiliado => afiliado.provincia)
    afiliados: Afiliado[];

    @OneToMany(() => CentroTrabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: CentroTrabajo[];

}
