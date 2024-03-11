import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Pais } from "../../pais/entities/pais.entity";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Municipio } from "../../municipio/entities/net_municipio.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";


@Entity({name:'NET_PROVINCIA'})
export class Net_Provincia {
    @PrimaryGeneratedColumn('uuid',{name:'ID_PROVINCIA'})
    id_provincia : string;

    @Column('varchar2', {length: 30 ,nullable:false, name:'NOMBRE_PROVINCIA'})
    nombre_provincia: string

    @ManyToOne(() => Net_Pais, pais => pais.provincia)
    @JoinColumn({ name: 'ID_PAIS', referencedColumnName: 'id_pais' })
    pais: Net_Pais;

    @OneToMany(() => Net_Municipio, municipio => municipio.provincia)
    municipio: Net_Municipio[];

    @OneToMany(() => Net_Persona, afiliado => afiliado.provincia)
    afiliado: Net_Persona[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.provincia)
    centrosTrabajo: Net_Centro_Trabajo[];
}
