import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NET_DETALLE_PERSONA } from "./Net_detalle_persona.entity";

@Entity({name:'NET_TIPO_PERSONA'})
export class Net_Tipo_Persona {

    @PrimaryGeneratedColumn({type: 'int', name: 'ID_TIPO_PERSONA',  primaryKeyConstraintName: 'PK_id_tipoA_tipoA'})
    id_tipo_persona: number;

    @Column('varchar2', { length: 1000, nullable: false, name: 'TIPO_PERSONA' })
    tipo_persona: string;

    @OneToMany(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.tipoPersona)
    detallesPersona: NET_DETALLE_PERSONA[];
}