import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({ name: 'NET_ESTADO_PERSONA' })
export class Net_Estado_Persona {

    @PrimaryColumn({ type: 'int', name: 'CODIGO', primaryKeyConstraintName: 'PK_NET_ESTADO_PERSONA' })
    codigo: number;

    @Column('varchar2', { length: 50, nullable: false, name: 'DESCRIPCION' })
    Descripcion: string;

    @OneToMany(() => Net_Persona, persona => persona.estadoPersona)
    personas: Net_Persona[];
}