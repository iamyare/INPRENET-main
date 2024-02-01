import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pais } from "../../pais/entities/pais.entity";
import { CentroTrabajo } from "src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity";
import { Municipio } from "../../municipio/entities/municipio.entity";
import { Afiliado } from "src/afiliado/entities/afiliado";


@Entity()
export class Provincia {
    @PrimaryGeneratedColumn('uuid')
    id_provincia

    @Column('varchar2', {length: 30 ,nullable:false})
    nombre_provincia: string

    @ManyToOne(() => Pais, pais => pais.provincia)
    pais: Pais;

    @OneToMany(() => Municipio, municipio => municipio.provincia)
    municipio: Municipio[];

    @OneToMany(() => Afiliado, afiliado => afiliado.provincia)
    afiliado: Afiliado[];

    @OneToMany(() => CentroTrabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: CentroTrabajo[];
}
