import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Pais } from "../../pais/entities/pais.entity";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Municipio } from "../../municipio/entities/net_municipio.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";


@Entity()
export class Net_Provincia {
    @PrimaryGeneratedColumn('uuid')
    ID_PROVINCIA : string;

    @Column('varchar2', {length: 30 ,nullable:false})
    NOMBRE_PROVINCIA: string

    @ManyToOne(() => Net_Pais, pais => pais.provincia)
    pais: Net_Pais;

    @OneToMany(() => Net_Municipio, municipio => municipio.provincia)
    municipio: Net_Municipio[];

    @OneToMany(() => Net_Persona, afiliado => afiliado.provincia)
    afiliado: Net_Persona[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: Net_Centro_Trabajo[];
}
