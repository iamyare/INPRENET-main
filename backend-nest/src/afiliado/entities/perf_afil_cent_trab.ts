import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CentroTrabajo } from "src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity";
import { DetalleAfiliado } from "./detalle_afiliado.entity";
import { Afiliado } from "./afiliado";

@Entity()
export class PerfAfilCentTrab {
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
    @ManyToOne(() => Afiliado, afiliado => afiliado.perfAfilCentTrabs)
    @JoinColumn({ name: 'id_detalle_afiliado' })
    afiliado: Afiliado;

    @ManyToOne(() => CentroTrabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    @JoinColumn({ name: 'id_centroTrabajo' })
    centroTrabajo: CentroTrabajo;
}
