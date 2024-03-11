import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Pais } from "../../pais/entities/pais.entity";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Municipio } from "../../municipio/entities/net_municipio.entity";
import { Net_Persona } from "src/modules/afiliado/entities/Net_Persona";


@Entity({ name: 'NET_DEPARTAMENTO' })
export class Net_Departamento {
    @PrimaryGeneratedColumn('uuid', { name: 'ID_DEPARTAMENTO' ,primaryKeyConstraintName: 'PK_id_depart_departamento' })
    id_departamento

    @Column('varchar2', {length: 30 ,nullable:false, name: 'NOMBRE_DEPARTAMENTO' })
    nombre_departamento: string

    @ManyToOne(() => Net_Pais, pais => pais.departamento, )
    @JoinColumn({name: 'ID_PAIS' })
    pais: Net_Pais;

    @OneToMany(() => Net_Municipio, municipio => municipio.departamento)
    municipio: Net_Municipio[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.departamento)
    centrosTrabajo: Net_Centro_Trabajo[];
}
