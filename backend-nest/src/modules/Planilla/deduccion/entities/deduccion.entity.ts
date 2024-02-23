import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetalleDeduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';
import { TipoDeduccion } from './tipo-deduccion.entity';

@Entity()
export class Deduccion {

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

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion : DetalleDeduccion[];

    @ManyToOne(() => TipoDeduccion, tipoDeduccion => tipoDeduccion.deduccion, { cascade: true})
    @JoinColumn({ name: 'id_tipo_deduccion' })
    tipoDeduccion: TipoDeduccion;
}