import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { net_detalle_persona } from "./net_detalle_persona.entity";

@Entity({ name: 'NET_TIPO_PERSONA' })
export class Net_Tipo_Persona {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_TIPO_PERSONA', primaryKeyConstraintName: 'PK_id_tipoA_tipoA' })
    id_tipo_persona: number;

    @Column('varchar2', { length: 1000, nullable: false, name: 'TIPO_PERSONA' })
    tipo_persona: string;

    @Column('varchar2', { length: 1000, nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

    @OneToMany(() => net_detalle_persona, detallePersona => detallePersona.tipoPersona)
    detallesPersona: net_detalle_persona[];

    @OneToMany(() => net_detalle_persona, detallePersona => detallePersona.tipoPersona)
    benfTipoPersona: net_detalle_persona[];
}