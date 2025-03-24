import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Departamento } from "../../provincia/entities/net_departamento.entity";
import { net_persona } from "../../../Persona/entities/net_persona.entity";

@Entity({ name: 'NET_PAIS' })
export class Net_Pais {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PAIS', primaryKeyConstraintName: 'PK_id_ben_pan_detp_ag_ben' })
    id_pais: number;

    @Column('varchar2', { length: 20, nullable: false, name: 'NOMBRE_PAIS' })
    nombre_pais: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'NACIONALIDAD' })
    nacionalidad: string;

    @OneToMany(() => net_persona, persona => persona.pais)
    persona: net_persona[];

    @OneToMany(() => Net_Departamento, departamento => departamento.pais)
    departamento: Net_Departamento[];
}
