import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { Net_Institucion } from 'src/modules/Empresarial/institucion/entities/net_institucion.entity';

@Entity({name:'NET_DEDUCCION'})
export class Net_Deduccion {

    @PrimaryGeneratedColumn('uuid',{name:'ID_DEDUCCION', primaryKeyConstraintName: 'PK_id_deduccion_net_deduccion' })
    id_deduccion : string;

    @Column('varchar2', {name:'NOMBRE_DEDUCCION', length: 50, nullable: false })
    nombre_deduccion : string;

    @Column('varchar2', { name:'DESCRIPCION_DEDUCCION',length: 100, nullable: true })
    descripcion_deduccion : string;

    @Column('number', {name:'COD_DEDUCCION', nullable: true,})
    @Index("UQ_codDed_netDed", {unique:true})
    codigo_deduccion : number;

    @Column('number', {name:'PRIORIDAD',nullable: true })
    prioridad : number;

    @ManyToOne(() => Net_Institucion, institucion => institucion.deduccion, { cascade: true})
    @JoinColumn({ name: 'ID_INSTITUCION' })
    institucion: Net_Institucion;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion : Net_Detalle_Deduccion[];
}