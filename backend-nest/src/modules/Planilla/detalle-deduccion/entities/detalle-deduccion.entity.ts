import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';
import { Net_Deduccion } from '../../deduccion/entities/net_deduccion.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { Net_Detalle_Pago_Beneficio } from '../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';

@Entity({ name: 'NET_DETALLE_DEDUCCION' })
@Check("CK_ESTADO_DED", `estado_aplicacion IN ('COBRADA', 'NO COBRADA', 'EN PRELIMINAR', 'EN PLANILLA')`)
export class Net_Detalle_Deduccion {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DED_DEDUCCION', primaryKeyConstraintName: 'PK_id_detD' })
    id_ded_deduccion: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_TOTAL' })
    monto_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'MONTO_APLICADO' })
    monto_aplicado: number;

    @Column('varchar2', { length: 20, nullable: true, default: 'NO COBRADA', name: 'ESTADO_APLICACION' })
    @IsEnum({ values: ['COBRADA', 'NO COBRADA', 'INCONSISTENCIA'] })
    estado_aplicacion: string;

    @Column('number', { nullable: true, name: 'ANIO' })
    anio: number;

    @Column('number', { nullable: true, name: 'MES' })
    mes: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', name: 'FECHA_APLICADO' })
    fecha_aplicado: Date;

    @ManyToOne(() => net_persona, persona => persona.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETDED" })
    persona: net_persona;

    @ManyToOne(() => Net_Detalle_Pago_Beneficio, det_pago_beneficio => det_pago_beneficio.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DETALLE_PAGO_BENEFICIO', foreignKeyConstraintName: "FK_ID_DETALLE_PAGO_BENEFICIO_DETDED" })
    detalle_pago_beneficio: Net_Detalle_Pago_Beneficio;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: "FK_ID_DEDUCCION_DETDED" })
    deduccion: Net_Deduccion;
}