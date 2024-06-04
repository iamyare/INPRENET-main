import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Departamento } from '../../provincia/entities/net_departamento.entity';
import { Net_Persona } from '../../../Persona/entities/Net_Persona.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Socio } from 'src/modules/Empresarial/entities/net_socio.entity';

@Entity({ name: 'NET_MUNICIPIO' })
export class Net_Municipio {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MUNICIPIO', primaryKeyConstraintName: 'PK_id_mun_mun' })
    id_municipio: number;

    @Column('varchar2', { nullable: false, length: 30, name: 'NOMBRE_MUNICIPIO' })
    nombre_municipio: string;

    @ManyToOne(() => Net_Departamento, departamento => departamento.municipio)
    @JoinColumn({ name: 'ID_DEPARTAMENTO', foreignKeyConstraintName: "FK_IDDEP_MUNIC" })
    departamento: Net_Departamento;

    @OneToMany(() => Net_Persona, persona => persona.municipio)
    persona: Net_Persona[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.municipio)
    centrosTrabajo: Net_Centro_Trabajo[];

    @OneToMany(() => Net_Socio, socio => socio.municipio)
    socios: Net_Socio[];
}
