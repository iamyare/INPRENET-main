import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Net_Departamento } from '../../provincia/entities/net_departamento.entity';
import { net_persona } from '../../../Persona/entities/net_persona.entity';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Socio } from 'src/modules/Empresarial/entities/net_socio.entity';
import { Net_Aldea } from '../../provincia/entities/net_aldea.entity';

@Entity({ name: 'NET_MUNICIPIO' })
export class Net_Municipio {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_MUNICIPIO', primaryKeyConstraintName: 'PK_id_mun_mun' })
    id_municipio: number;

    @Column('varchar2', { nullable: false, length: 30, name: 'NOMBRE_MUNICIPIO' })
    nombre_municipio: string;

    @ManyToOne(() => Net_Departamento, departamento => departamento.municipio)
    @JoinColumn({ name: 'ID_DEPARTAMENTO', foreignKeyConstraintName: "FK_IDDEP_MUNIC" })
    departamento: Net_Departamento;

    @OneToMany(() => net_persona, persona => persona.municipio)
    persona: net_persona[];

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.municipio)
    centrosTrabajo: Net_Centro_Trabajo[];

    @OneToMany(() => Net_Socio, socio => socio.municipio)
    socios: Net_Socio[];

    @OneToMany(() => Net_Aldea, aldea => aldea.municipio)
    aldeas: Net_Aldea[];
}
