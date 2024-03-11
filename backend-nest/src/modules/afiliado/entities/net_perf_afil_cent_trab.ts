import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";
import { Net_Persona } from "./Net_Persona";

@Entity({ name: 'NET_PERF_AFIL_CENT_TRAB' })
export class Net_perf_afil_cent_trab {
    @PrimaryGeneratedColumn('uuid', { name: 'ID_PERF_AFIL_CENTR_TRAB',primaryKeyConstraintName: 'PK_id_pAfCentTrab_PCenTrab' })
    id_perf_afil_centro_trab: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'CARGO' })
    cargo: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'CLASE_CLIENTE' })
    clase_cliente: string;

    @Column('date', { nullable: false, name: 'FECHA_INGRESO' })
    fecha_ingreso: string;

    @Column('date', { nullable: false, name: 'FECHA_PAGO' })
    fecha_pago: string;

    @Column('number', { nullable: true, name: 'SALARIO_BASE' })
    salario_base: number;

    @Column('varchar2', { length: 40, nullable: false, name: 'NUMERO_ACUERDO' })
    numero_acuerdo: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @ManyToOne(() => Net_Persona, afiliado => afiliado.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_DETALLE_PERSONA' })
    afiliado: Net_Persona;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_CENTRO_TRABJO' })
    centroTrabajo: Net_Centro_Trabajo;
}
