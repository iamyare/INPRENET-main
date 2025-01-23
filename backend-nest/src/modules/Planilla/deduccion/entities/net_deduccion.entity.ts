import { Column, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity'; import { Net_Centro_Trabajo }
    from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Deducciones_Asignadas } from '../../detalle-deduccion/entities/net-deducciones-asignadas.entity';
import { Net_Deduccion_Tipo_Planilla } from './net_deduccion_tipo_planilla.entity';
import { Net_Detalle_Prestamo } from 'src/modules/prestamos/entities/net_detalle_prestamo.entity';

@Entity({ name: 'NET_DEDUCCION' })
export class Net_Deduccion {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DEDUCCION', primaryKeyConstraintName: 'PK_id_deduccion_net_deduccion' })
    id_deduccion: number;

    @Column('varchar2', { name: 'NOMBRE_DEDUCCION', length: 50, nullable: false, unique: true })
    nombre_deduccion: string;

    @Column('varchar2', { name: 'DESCRIPCION_DEDUCCION', length: 100, nullable: true })
    descripcion_deduccion: string;

    @Column('number', { name: 'COD_DEDUCCION', nullable: true, })
    @Index("UQ_codDed_netDed", { unique: true })
    codigo_deduccion: number;

    @Column('number', { name: 'PRIORIDAD', nullable: true })
    prioridad: number;

    @ManyToOne(() => Net_Centro_Trabajo, centroTrabajo => centroTrabajo.deduccion, { cascade: true })
    @JoinColumn({ name: 'ID_CENTRO_TRABAJO', foreignKeyConstraintName: "FK_ID_CENTRO_DED" })
    centroTrabajo: Net_Centro_Trabajo;

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.deduccion)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(() => Net_Deducciones_Asignadas, deduccionesAsignadas => deduccionesAsignadas.deduccion)
    deduccionesAsignadas: Net_Deducciones_Asignadas[];

    @OneToMany(() => Net_Deduccion_Tipo_Planilla, dedTipoPlanilla => dedTipoPlanilla.deduccion)
    dedTipoPlanilla: Net_Deduccion_Tipo_Planilla[];

    /* @OneToMany(() => Net_Detalle_Prestamo, prestamo => prestamo.deduccion)
    detallePrestamos: Net_Detalle_Prestamo[]; */



}