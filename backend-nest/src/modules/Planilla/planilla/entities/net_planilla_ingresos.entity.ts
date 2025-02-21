import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Net_TipoPlanilla } from "../../tipo-planilla/entities/tipo-planilla.entity";

@Entity({ name: 'NET_PLANILLA_INGRESOS' })
export class Net_Planilla_Ingresos {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PLANILLA_INGRESOS', primaryKeyConstraintName: 'PK_ID_PLANILLA_INGRESOS' })
    id_planilla_ingresos: number;

    @Column({ length: 20, nullable: false, name: 'CODIGO_PLANILLA' })
    codigo_planilla: string;

    @Column({ type: 'int', nullable: false, name: 'MES' })
    mes: number;

    @Column({ type: 'int', nullable: false, name: 'ANO' })
    ano: number;

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla)
    @JoinColumn({ name: 'ID_TIPO_PLANILLA', referencedColumnName: 'id_tipo_planilla', foreignKeyConstraintName: "FK_ID_TIPO_PLANILLA_NET_PLANILLA_INGRESOS" })
    tipoPlanilla: Net_TipoPlanilla;
}
