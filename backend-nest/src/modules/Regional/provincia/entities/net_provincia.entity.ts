import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pais } from "../../pais/entities/pais.entity";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Municipio } from "../../municipio/entities/municipio.entity";
import { Net_Afiliado } from "src/modules/afiliado/entities/net_afiliado";


@Entity()
export class Net_Provincia {
    @PrimaryGeneratedColumn('uuid')
    id_provincia

    @Column('varchar2', {length: 30 ,nullable:false})
    nombre_provincia: string

    @ManyToOne(() => Pais, pais => pais.provincia)
    pais: Pais;

    @OneToMany(() => Municipio, municipio => municipio.provincia)
    municipio: Municipio[];

    @OneToMany(() => Net_Afiliado, afiliado => afiliado.provincia)
    afiliado: Net_Afiliado[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: Net_Centro_Trabajo[];
}
