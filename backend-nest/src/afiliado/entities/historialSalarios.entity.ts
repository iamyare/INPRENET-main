import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";

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
    perfAfilCentTrab: PerfAfilCentTrab;
}