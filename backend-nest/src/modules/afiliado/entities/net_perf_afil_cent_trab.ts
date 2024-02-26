import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Centro_Trabajo } from "src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";
import { Net_Afiliado } from "./net_afiliado";

@Entity()
export class Net_perf_afil_cent_trab {
    @PrimaryGeneratedColumn('uuid')
    id_perf_afil_cent_trab : string;

    @Column('varchar2', { length: 40, nullable: false })
    cargo: string;

    @Column('varchar2', { length: 40, nullable: false })
    sector_economico: string;

    @Column('varchar2', { length: 40, nullable: false })
    actividad_economica: string;

    @Column('varchar2', { length: 40, nullable: false })
    clase_cliente: string;

    @Column('date', { nullable: false })
    fecha_ingreso: string;

    @Column('date', { nullable: false })
    fecha_pago: string;

    @Column('varchar2', {  length: 40, nullable: false })
    numero_acuerdo: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @ManyToOne(() => Net_Afiliado, afiliado => afiliado.perfAfilCentTrabs)
    @JoinColumn({ name: 'id_detalle_afiliado' })
    afiliado: Net_Afiliado;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    @JoinColumn({ name: 'id_centroTrabajo' })
    centroTrabajo: Net_Centro_Trabajo;
}
