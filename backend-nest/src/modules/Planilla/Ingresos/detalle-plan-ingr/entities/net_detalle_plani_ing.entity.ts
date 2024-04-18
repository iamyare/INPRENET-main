
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Persona } from "../../../../afiliado/entities/Net_Persona.entity";
import { Net_Centro_Trabajo } from "../../../../Empresarial/entities/net_centro_trabajo.entity";
import { Net_Planilla } from "../../../../Planilla/planilla/entities/net_planilla.entity";

@Entity({ name: 'NET_DETALLE_PLANILLA_ING' })
@Check("CK_ESTADO_PLANING", `ESTADO IN ('NO CARGADO', 'CARGADO','ELIMINADO')`)
export class Net_Detalle_planilla_ingreso {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DETALLE_PLAN_INGRESO', primaryKeyConstraintName: 'PK_id_detPlanIng' })
    id_detalle_plan_Ing: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'SUELDO' })
    sueldo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'PRESTAMOS' })
    prestamos: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'APORTACIONES' })
    aportaciones: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'COTIZACIONES' })
    cotizaciones: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'DEDUCCIONES' })
    deducciones: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'SUELDO_NETO' })
    sueldo_neto: number;

    @Column({ type: 'varchar2', nullable: true, name: 'ESTADO', default: "CARGADO" })
    estado: string;

    @ManyToOne(() => Net_Persona, persona => persona.detallePlanIngreso)
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETPLANING" })
    persona: Net_Persona;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.detalle_plani_ingr)
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: "FK_ID_CENTROTRAB_DETPLANING" })
    centroTrabajo: Net_Centro_Trabajo;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detallesPlanillaIngreso)
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_DETALLE_PLANILLA_PLANILLA" })
    planilla: Net_Planilla;

}