import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Net_Movimientos } from "./net_movimientos.entity";
import { Net_TipoPlanilla } from "src/modules/Planilla/tipo-planilla/entities/tipo-planilla.entity";

@Entity({ name: "NET_PLANILLA_MOVIMIENTOS" })
export class Net_Planilla_Movimientos {
    @PrimaryGeneratedColumn({ name: "ID_PLANILLA_MOVIMIENTO" })
    id_planilla_movimiento: number;

    @Column({ type: "varchar", length: 50, name: "NOMBRE_PLANILLA" })
    nombre_planilla: string;

    @Column({ type: "varchar", length: 20, name: "ESTADO" })
    estado: string;

    @Column({ type: "number", name: "MES", nullable: false })
    mes: number;

    @Column({ type: "number", name: "ANIO", nullable: false })
    anio: number;

    @Column({ type: "date", name: "FECHA_PAGO", nullable: true })
    fechaPago: Date;

    @OneToMany(() => Net_Movimientos, movimiento => movimiento.planillaMovimiento)
    movimientos: Net_Movimientos[];

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla)
    @JoinColumn({ name: "ID_TIPO_PLANILLA" })
    tipoPlanilla: Net_TipoPlanilla;
}
