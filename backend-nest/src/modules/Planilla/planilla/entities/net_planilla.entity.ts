import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Detalle_Pago_Beneficio } from '../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';

@Entity()
export class Net_Planilla {

    @PrimaryGeneratedColumn('uuid')
    ID_PLANILLA : string

    @Column('varchar2', {nullable: false })
    @Index("UQ_codPlanilla_netPlan", {unique:true})
    CODIGO_PLANILLA : string;

    @Column('date', { nullable: false, default: () => 'SYSDATE' })
    FECHA_APERTURA: Date;

    @Column('date', { nullable: true })
    FECHA_CIERRE: Date;

    @Column('number')
    SECUENCIA : number;

    @Column('varchar2', { nullable: true, default: 'ACTIVA' })
    ESTADO: string;

    @Column('varchar2', {  nullable: false })
    PERIODO_INICIO: string;

    @Column('varchar2', {  nullable: false })
    PERIODO_FINALIZACION: string; 

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla,  { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_PLANILLA' })
    tipoPlanilla: Net_TipoPlanilla;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.planilla)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detallepagobeneficio => detallepagobeneficio.planilla)
    detallepagobeneficio: Net_Detalle_Pago_Beneficio[];

}
