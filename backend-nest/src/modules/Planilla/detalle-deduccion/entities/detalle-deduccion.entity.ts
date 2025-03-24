import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { IsEnum } from 'class-validator';
import { Net_Deduccion } from '../../deduccion/entities/net_deduccion.entity';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { Net_Deducciones_Asignadas } from './net-deducciones-asignadas.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';

@Entity({ name: 'NET_DETALLE_DEDUCCION' })
@Check("CK_ESTADO_DED", `estado_aplicacion IN ('COBRADA', 'NO COBRADA', 'EN PRELIMINAR', 'RECHAZADO', 'ENVIADO A BANCO')`)
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

    @Column('varchar2', { length: 20, nullable: true, name: 'N_PRESTAMO_INPREMA' })
    n_prestamo_inprema: string;

    @Column('varchar2', { length: 20, nullable: true, name: 'TIPO_PRESTAMO_INPREMA' })
    tipo_prestamo_inprema: string;

    @ManyToOne(() => net_persona, persona => persona.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PERSONA', foreignKeyConstraintName: "FK_ID_PERSONA_DETDED" })
    persona: net_persona;

    @ManyToOne(() => Net_Planilla, planilla => planilla.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_PLANILLA', foreignKeyConstraintName: "FK_ID_PLANILLA" })
    planilla: Net_Planilla;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.detalleDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: "FK_ID_DEDUCCION_DETDED" })
    deduccion: Net_Deduccion;

    @ManyToOne(() => Net_Deducciones_Asignadas, deduccionAsignada => deduccionAsignada.detallesDeduccion, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION_ASIGNADA', foreignKeyConstraintName: 'FK_ID_DEDUCCION_ASIGNADA_DETDED' })
    deduccionAsignada: Net_Deducciones_Asignadas;

    @ManyToOne(() => Net_Persona_Por_Banco, personaPorBanco => personaPorBanco.detallePagoBen, { cascade: true })
    @JoinColumn({ name: 'ID_AF_BANCO', foreignKeyConstraintName: "FK_ID_AF_BANCO_DETDED" })
    personaPorBanco: Net_Persona_Por_Banco;

    @ManyToOne(() => Net_Usuario_Empresa, { nullable: true })
    @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_ID_USUARIO_EMPRESA_DET_DEDUCCION' })
    usuarioEmpresa: Net_Usuario_Empresa;

    @Column({ type: 'int', nullable: true, name: 'ID_USUARIO_EMPRESA' })
    ID_USUARIO_EMPRESA: number;
}