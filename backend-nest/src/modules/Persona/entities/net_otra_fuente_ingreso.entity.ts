import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { net_persona } from "./net_persona.entity";

@Entity({
    name: 'NET_OTRA_FUENTE_INGRESO',
})
export class net_otra_fuente_ingreso {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_OTRA_FUENTE_INGRESO', primaryKeyConstraintName: 'PK_ID_OTRA_FUENTE_INGRESO' })
    id_otra_fuente_ingreso: number;

    @Column('varchar2', { length: 100, nullable: false, name: 'ACTIVIDAD_ECONOMICA' })
    actividad_economica: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'MONTO_INGRESO' })
    monto_ingreso: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'OBSERVACION' })
    observacion: string;

    @ManyToOne(() => net_persona, persona => persona.otra_fuente_ingreso, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: 'FK_ID_PERSONA_PER' })
    persona: net_persona;

}