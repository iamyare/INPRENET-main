import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Net_Planilla_Ingresos } from "./net_planilla_ingresos.entity";
import { Net_Banco } from "src/modules/banco/entities/net_banco.entity";

@Entity({ name: 'NET_FACTURA_INGRESOS' })
export class Net_Factura_Ingresos {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_FACTURA_INGRESOS', primaryKeyConstraintName: 'PK_ID_FACTURA_INGRESOS' })
    id_factura_ingresos: number;

    @ManyToOne(() => Net_Planilla_Ingresos, planillaIngresos => planillaIngresos)
    @JoinColumn({ name: 'ID_PLANILLA_INGRESOS', referencedColumnName: 'id_planilla_ingresos', foreignKeyConstraintName: "FK_ID_PLANILLA_INGRESOS_NET_FACTURA_INGRESOS" })
    planillaIngresos: Net_Planilla_Ingresos;

    @ManyToOne(() => Net_Banco, banco => banco)
    @JoinColumn({ name: 'ID_BANCO', referencedColumnName: 'id_banco', foreignKeyConstraintName: "FK_ID_BANCO_NET_FACTURA_INGRESOS" })
    banco: Net_Banco;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'MONTO' })
    monto: number;

    @Column({ type: 'varchar', length: 20, nullable: false, name: 'TIPO_FACTURA' })
    tipo_factura: string; // Puede ser "TOTAL" o "MORA"

    @Column({ type: 'date', default: () => 'CURRENT_DATE', name: 'FECHA_GENERACION' })
    fecha_generacion: Date;

    @Column({ type: 'date', nullable: true, name: 'FECHA_PAGO' })
    fecha_pago: Date;

    @Column({ type: 'date', nullable: true, name: 'FECHA_EMISION' })
    fecha_emision: Date;

    @Column({ type: 'clob', nullable: true, name: 'OBSERVACION' })
    observacion: string;

    @Column({ type: 'varchar', length: 20, nullable: false, default: 'PENDIENTE', name: 'ESTADO' })
    estado: string; // Puede ser "PENDIENTE", "PAGADA", "CANCELADA"
}
