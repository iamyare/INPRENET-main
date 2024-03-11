import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";
import { Net_Persona } from "./Net_Persona";

@Entity()
export class Net_perf_afil_cent_trab {
    @PrimaryGeneratedColumn('uuid')
    ID_PERF_AFIL_CENTR_TRAB : string;

    @Column('varchar2', { length: 40, nullable: false })
    CARGO: string;

    @Column('varchar2', { length: 40, nullable: false })
    CLASE_CLIENTE: string;

    @Column('date', { nullable: false })
    FECHA_INGRESO: string;

    @Column('date', { nullable: false })
    FECHA_PAGO: string;

    @Column('number', { nullable: true})
    SALARIO_BASE: number;

    @Column('varchar2', {  length: 40, nullable: false })
    NUMERO_ACUERDO: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @ManyToOne(() => Net_Persona, afiliado => afiliado.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_DETALLE_AFILIADO' })
    afiliado: Net_Persona;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    @JoinColumn({ name: 'ID_CENTRO_TRABJO' })
    centroTrabajo: Net_Centro_Trabajo;
}
