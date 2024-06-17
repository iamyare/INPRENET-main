import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Net_Centro_Trabajo } from "./net_centro_trabajo.entity";

@Entity({ name: 'NET_ESTADO_Centro_TRABAJO' })
export class Net_Estado_Centro_Trabajo {

    @PrimaryColumn({ type: 'int', name: 'ID_ESTADO_CENTRO_TRAB', primaryKeyConstraintName: 'PK_NET_ESTADO_CENTRO_TRABAJO' })
    id_estado_centro_trab: number;

    @Column('varchar2', { length: 50, nullable: false, name: 'NOMBRE_ESTADO' })
    nombre_estado: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    Descripcion: string;

    @OneToMany(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.estado)
    centro_trabajo: Net_Centro_Trabajo;
}
