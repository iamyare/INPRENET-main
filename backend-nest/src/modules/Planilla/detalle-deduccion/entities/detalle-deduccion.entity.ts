import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';
import { Net_Deduccion } from '../../deduccion/entities/net_deduccion.entity';
import { Net_Persona } from 'src/modules/Persona/entities/Net_Persona.entity';

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

    @ManyToOne(() => Net_Persona, persona => persona.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETDED" })
    persona: Net_Persona;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA_DETDED" })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: "FK_ID_DEDUCCION_DETDED" })
    deduccion: Net_Deduccion;
}