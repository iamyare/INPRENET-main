import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
/* import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity'; */
import { Net_TipoDeduccion } from './net_tipo-deduccion.entity';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
/* import { TipoDeduccion } from './tipo-deduccion.entity'; */

@Entity()
export class Net_Deduccion {

    @PrimaryGeneratedColumn('uuid')
    id_deduccion : string;

    @Column('varchar2', { length: 50, nullable: false })
    nombre_deduccion : string;

    @Column('varchar2', { length: 100, nullable: true })
    descripcion_deduccion : string;

    @Column('number', {nullable: true, unique: true })
    codigo_deduccion : number;

    @Column('number', {nullable: true })
    prioridad : number;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion : Net_Detalle_Deduccion[];

    @ManyToOne(() => Net_TipoDeduccion, tipoDeduccion => tipoDeduccion.deduccion, { cascade: true})
    @JoinColumn({ name: 'id_tipo_deduccion' })
    tipoDeduccion: Net_TipoDeduccion;
}