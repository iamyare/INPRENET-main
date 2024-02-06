import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';
import { DetallePlanilla } from './detalle_planilla.entity';
import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { DetalleBeneficio } from '../../detalle_beneficio/entities/detalle_beneficio.entity';
/* import { Afiliado } from 'src/afiliado/entities/detalle_afiliado.entity';
import { DatosIdentificacion } from 'src/afiliado/entities/afiliado'; */

@Entity()
export class Planilla {

    @PrimaryGeneratedColumn('uuid')
    id_planilla : string

    @Column('varchar2', {  nullable: false })
    codigo_planilla : string;

    @Column('date', { nullable: false, default: () => 'SYSDATE' })
    fecha_apertura: Date;

    @Column('number')
    secuencia : number;

    @Column('varchar2', { nullable: true, default: 'ACTIVA' })
    estado: string;

    @Column('varchar2', {  nullable: false })
    periodoInicio: string;

    @Column('varchar2', {  nullable: false })
    periodoFinalizacion: string; 

    @ManyToOne(() => TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla,  { cascade: true })
    @JoinColumn({ name: 'id_tipo_planilla' })
    tipoPlanilla: TipoPlanilla;

    /* @OneToMany(() => DetallePlanilla, detallePlanilla => detallePlanilla.planilla)
    detallePlanilla: DetallePlanilla[]; */

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.planilla)
    detalleDeduccion: DetalleDeduccion[];

    @OneToMany(() => DetalleBeneficio, detallebeneficio => detallebeneficio.planilla)
    detallebeneficio: DetalleBeneficio[];

}
