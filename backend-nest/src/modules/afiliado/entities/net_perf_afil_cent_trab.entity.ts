import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Centro_Trabajo } from "../../Empresarial/entities/net_centro_trabajo.entity";
import { Net_Persona } from "./Net_Persona.entity";

@Entity({ name: 'NET_PERF_AFIL_CENT_TRAB' })
export class Net_perf_afil_cent_trab {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PERF_AFIL_CENTR_TRAB', primaryKeyConstraintName: 'PK_id_pAfCentTrab_PCenTrab' })
    id_perf_afil_centro_trab: number;

    @Column('varchar2', { length: 40, nullable: false, name: 'CARGO' })
    cargo: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'NUMERO_ACUERDO' })
    numero_acuerdo: string;

    @Column('number', { nullable: true, name: 'SALARIO_BASE' })
    salario_base: number;

    @Column('date', { nullable: false, name: 'FECHA_INGRESO' })
    fecha_ingreso: string;

    @Column('date', { nullable: true, name: 'FECHA_EGRESO' })
    fecha_egreso: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'CLASE_CLIENTE' })
    clase_cliente: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'SECTOR_ECONOMICO' })
    sector_economico: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @ManyToOne(() => Net_Persona, afiliado => afiliado.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERS_PERAFCET" })
    afiliado: Net_Persona;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: "FK_ID_CENT_TRAB_PERAFCET" })
    centroTrabajo: Net_Centro_Trabajo;
}
