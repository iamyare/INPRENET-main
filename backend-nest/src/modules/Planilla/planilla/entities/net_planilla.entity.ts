import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Detalle_Pago_Beneficio } from '../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { Net_Detalle_planilla_ingreso } from '../../Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity';

@Entity({ name: 'NET_PLANILLA' })
@Check(`estado IN ('ACTIVA', 'CERRADA', 'PAGADA')`)
@Check(`beneficios_cargados IN ('SI', 'NO')`)
@Check(`deducc_inprema_cargadas IN ('SI', 'NO')`)
@Check(`deducc_terceros_cargadas IN ('SI', 'NO')`)
export class Net_Planilla {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PLANILLA', primaryKeyConstraintName: 'PK_id_plan_Plan' })
    id_planilla: number;

    @Index("UQ_codPlanilla_netPlan", { unique: true })
    @Column('varchar2', { nullable: false, name: 'CODIGO_PLANILLA' })
    codigo_planilla: string;

    @Column('date', { nullable: false, default: () => 'SYSDATE', name: 'FECHA_APERTURA' })
    fecha_apertura: Date;

    @Column('date', { nullable: true, name: 'FECHA_CIERRE' })
    fecha_cierre: Date;

    @Column('number', { name: 'SECUENCIA' })
    secuencia: number;

    @Column('varchar2', { nullable: true, default: 'ACTIVA', name: 'ESTADO' })
    estado: string;

    @Column('varchar2', { nullable: false, name: 'PERIODO_INICIO' })
    periodoInicio: string;

    @Column('varchar2', { nullable: false, name: 'PERIODO_FINALIZACION' })
    periodoFinalizacion: string;

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_PLANILLA', foreignKeyConstraintName: "FK_ID_TIPO_PLANILLA_PLAN" })
    tipoPlanilla: Net_TipoPlanilla;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.planilla)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detallepagobeneficio => detallepagobeneficio.planilla)
    detallepagobeneficio: Net_Detalle_Pago_Beneficio[];

    @OneToMany(() => Net_Detalle_planilla_ingreso, detallePlanillaIngreso => detallePlanillaIngreso.planilla)
    detallesPlanillaIngreso: Net_Detalle_planilla_ingreso[];

    @Column('varchar2', { nullable: false, default: 'NO', name: 'BENEFICIOS_CARGADOS' })
    beneficios_cargados: string;

    @Column('varchar2', { nullable: false, default: 'NO', name: 'DEDUCC_INPREMA_CARGADAS' })
    deducc_inprema_cargadas: string;

    @Column('varchar2', { nullable: false, default: 'NO', name: 'DEDUCC_TERCEROS_CARGADAS' })
    deducc_terceros_cargadas: string;

    @Column('varchar2', { nullable: false, default: 'NO', name: 'ALTAS_CARGADAS' })
    altas_cargadas: string;

    @Column('varchar2', { nullable: false, default: 'NO', name: 'BAJAS_CARGADAS' })
    bajas_cargadas: string;
}
