import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Planilla } from "../../planilla/entities/net_planilla.entity";
import { Net_Detalle_Beneficio_Afiliado } from "./net_detalle_beneficio_afiliado.entity";
export enum EstadoEnum {
    PAGADA = 'PAGADA',
    NO_PAGADA = 'NO PAGADA',
    INCONSISTENCIA = 'INCONSISTENCIA'
}
@Entity({ name: 'NET_DETALLE_PAGO_BENEFICIO' })
export class Net_Detalle_Pago_Beneficio {
    @PrimaryGeneratedColumn({type: 'int',name: 'ID_BENEFICIO_PLANILLA', primaryKeyConstraintName: 'PK_benPlan_detPagB'})
    id_beneficio_planilla: number;

    @Column({ default: "NO PAGADA", enum: ['NO PAGADA', 'PAGADA'], name: 'ESTADO' })
    estado: string;

    @CreateDateColumn({ name: 'FECHA_CARGA' })
    fecha_carga: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_A_PAGAR' })
    monto_a_pagar: number;
    
    @ManyToOne(() => Net_Planilla, planilla => planilla.detallepagobeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName:"FK_ID_PLANILLA_DETPAGBEN" })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.detalleBeneficio, { cascade: true })
    @JoinColumn({ name: 'ID_BENEFICIO_PLANILLA_AFIL', foreignKeyConstraintName:"FK_ID_BEN_PLAN_AFIL_DETPAGBEN" })
    detalleBeneficioAfiliado: string;
}