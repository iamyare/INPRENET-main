import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, AfterInsert, getRepository, AfterLoad, Unique, OneToMany, Check } from 'typeorm';
import { Net_Persona } from 'src/modules/afiliado/entities/Net_Persona';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';
import { Net_Deduccion } from '../../deduccion/entities/net_deduccion.entity';

@Entity({ name: 'NET_DETALLE_DEDUCCION' })
@Check("CK_ESTADO_DED",`estado_aplicacion IN ('COBRADA', 'NO COBRADA', 'EN PLANILLA')`)
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

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', name: 'FECHA_APLICACO' })
    fecha_aplicaco: Date;

    @ManyToOne(() => Net_Persona, afiliado => afiliado.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName:"FK_ID_PERSONA_DETDED" })
    afiliado: Net_Persona;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName:"FK_ID_PLANILLA_DETDED" })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName:"FK_ID_DEDUCCION_DETDED" })
    deduccion: Net_Deduccion;
}