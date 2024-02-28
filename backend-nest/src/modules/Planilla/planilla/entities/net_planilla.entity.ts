import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
/* import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity'; */
/* import { DetallePagoBeneficio } from '../../detalle_beneficio/entities/detalle_pago_beneficio.entity'; */
/* import { TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity'; */
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Detalle_Pago_Beneficio } from '../../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';

@Entity()
export class Net_Planilla {

    @PrimaryGeneratedColumn('uuid')
    id_planilla : string

    @Column('varchar2', {nullable: false })
    @Index("UQ_codPlanilla_netPlan", {unique:true})
    codigo_planilla : string;

    @Column('date', { nullable: false, default: () => 'SYSDATE' })
    fecha_apertura: Date;

    @Column('date', { nullable: true })
    fecha_cierre: Date;

    @Column('number')
    secuencia : number;

    @Column('varchar2', { nullable: true, default: 'ACTIVA' })
    estado: string;

    @Column('varchar2', {  nullable: false })
    periodoInicio: string;

    @Column('varchar2', {  nullable: false })
    periodoFinalizacion: string; 

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla,  { cascade: true })
    @JoinColumn({ name: 'id_tipo_planilla' })
    tipoPlanilla: Net_TipoPlanilla;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.planilla)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(() => Net_Detalle_Pago_Beneficio, detallepagobeneficio => detallepagobeneficio.planilla)
    detallepagobeneficio: Net_Detalle_Pago_Beneficio[];

}
