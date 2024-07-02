import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { net_detalle_persona } from "./net_detalle_persona.entity";

@Entity({ name: 'NET_ESTADO_AFILIACION' })
export class net_estado_afiliacion {

    @PrimaryColumn({ type: 'int', name: 'CODIGO' })
    codigo: number;

    @Column('varchar2', { length: 50, nullable: false, name: 'NOMBRE_ESTADO' })
    nombre_estado: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    Descripcion: string;

    @OneToMany(() => net_detalle_persona, persona => persona.estadoAfiliacion)
    persona: net_detalle_persona[];
}
