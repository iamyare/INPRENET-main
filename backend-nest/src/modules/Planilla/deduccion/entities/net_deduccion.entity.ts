import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
/* import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity'; */
/* import { Net_TipoDeduccion } from './net_tipo-deduccion.entity'; */
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Institucion } from 'src/modules/Empresarial/institucion/entities/net_institucion.entity';
/* import { TipoDeduccion } from './tipo-deduccion.entity'; */

@Entity()
export class Net_Deduccion {

    @PrimaryGeneratedColumn('uuid')
    id_deduccion : string;

    @Column('varchar2', { length: 50, nullable: false })
    nombre_deduccion : string;

    @Column('varchar2', { length: 100, nullable: true })
    descripcion_deduccion : string;

    @Column('number', {nullable: true,})
    @Index("UQ_codDed_netDed", {unique:true})
    codigo_deduccion : number;

    @Column('number', {nullable: true })
    prioridad : number;

    @ManyToOne(() => Net_Institucion, institucion => institucion.deduccion, { cascade: true})
    @JoinColumn({ name: 'id_institucion' })
    institucion: Net_Institucion;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion : Net_Detalle_Deduccion[];
}