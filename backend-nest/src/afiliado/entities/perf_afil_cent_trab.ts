import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Afiliado } from "./afiliado.entity";
import { CentroTrabajo } from "src/empresas/entities/centroTrabajo.entity";
import { HistorialSalario } from "./historialSalarios.entity";

@Entity()
export class PerfAfilCentTrab {
    @PrimaryGeneratedColumn('uuid')
    id_perf_afil_cent_trab : string;

    @Column('varchar2', { length: 40, nullable: false })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: false })
    numero_carnet: string;

    @Column('varchar2', { length: 40, nullable: false })
    cargo: string;

    @Column('varchar2', { length: 40, nullable: false })
    sector_economico: string;

    @Column('varchar2', { length: 40 })
    actividad_economica: string;

    @Column('varchar2', { length: 40, nullable: true })
    clase_cliente: string;

    @Column('date', { nullable: true })
    fecha_ingreso: string;

    @Column('date', { nullable: false })
    fecha_pago: string;

    @Column('varchar2', {  length: 40, nullable: false })
    numero_acuerdo: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @ManyToOne(() => Afiliado, afiliado => afiliado.perfAfilCentTrabs)
    afiliado: Afiliado;

    @ManyToOne(() => CentroTrabajo, centroTrabajo => centroTrabajo.perfAfilCentTrabs)
    centroTrabajo: CentroTrabajo;

    @OneToMany(() => HistorialSalario, historialSalario => historialSalario.perfAfilCentTrab, { cascade: true })
    historialesSalario: HistorialSalario[];
}
