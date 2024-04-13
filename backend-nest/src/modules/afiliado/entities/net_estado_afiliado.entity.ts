import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({ name: 'NET_ESTADO_AFILIADO' })
export class Net_Estado_Afiliado {

    @PrimaryColumn({ type: 'int', name: 'CODIGO', primaryKeyConstraintName: 'PK_CODIGO_ESTADO_AFIL' })
    codigo: number;

    @Column('varchar2', { length: 50, nullable: false, name: 'DESCRIPCION' })
    Descripcion: string;

    @OneToMany(() => Net_Persona, persona => persona.estadoAfiliado)
    persona: Net_Persona[];
}