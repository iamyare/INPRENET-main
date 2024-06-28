import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Net_Persona } from "./net_Persona.entity";
import { NET_DETALLE_PERSONA } from "./Net_detalle_persona.entity";

@Entity({ name: 'NET_ESTADO_AFILIACION' })
export class Net_Estado_Persona {

    @PrimaryColumn({ type: 'int', name: 'CODIGO', primaryKeyConstraintName: 'PK_NET_ESTADO_AFILIACION' })
    codigo: number;

    @Column('varchar2', { length: 50, nullable: false, name: 'NOMBRE_ESTADO' })
    nombre_estado: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    Descripcion: string;

    @OneToMany(() => NET_DETALLE_PERSONA, persona => persona.estadoAfiliacion)
    persona: NET_DETALLE_PERSONA;
}
