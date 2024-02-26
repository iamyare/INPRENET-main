import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { DetallePagoBeneficio } from '../../detalle_beneficio/entities/detalle_pago_beneficio.entity';

@Entity()
export class Net_Planilla {

    @PrimaryGeneratedColumn('uuid')
    id_planilla : string

    @Column('varchar2', { unique: true,  nullable: false })
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

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.planilla)
    detalleDeduccion: DetalleDeduccion[];

    @OneToMany(() => DetallePagoBeneficio, detallepagobeneficio => detallepagobeneficio.planilla)
    detallepagobeneficio: DetallePagoBeneficio[];

}
