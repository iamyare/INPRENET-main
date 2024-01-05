import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";
import { Deduccion } from "src/modules/Planilla/deduccion/entities/deduccion.entity";

@Entity()
export class HistorialSalario {

    @PrimaryGeneratedColumn('uuid')
    id_historial_salarios: string;

    @Column('date', {
        nullable : false
    })
    fecha_inicio

    @Column('date', {
        nullable : false
    })
    fechaFin

    @Column('varchar2', {
        nullable : false
    })
    salario: string;

    @ManyToOne(() => PerfAfilCentTrab, perfAfilCentTrab => perfAfilCentTrab.historialesSalario)
    @JoinColumn({ name: 'id_perfAfilCentTrab' })
    perfAfilCentTrab: PerfAfilCentTrab;

    @ManyToOne(() => Deduccion, deduccion => deduccion.historialSalario)
    @JoinColumn({ name: 'id_deduccion' })
    deduccion: Deduccion;
}