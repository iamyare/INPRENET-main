import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Municipio } from 'src/modules/Regional/municipio/entities/net_municipio.entity';
import { Net_perf_pers_cent_trab } from 'src/modules/Persona/entities/net_perf_pers_cent_trab.entity';
import { Net_Detalle_planilla_ingreso } from 'src/modules/Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity';
import { Net_Deduccion } from 'src/modules/Planilla/deduccion/entities/net_deduccion.entity';
import { Net_Sociedad_Centro_Trabajo } from './net_sociedad_centro.entity';
import { Net_Referencia_Centro_Trabajo } from './net_referencia_centro_trabajo.entity';
import { Net_Centro_Trabajo_Jornada } from './net_centro_trabajo_jornada.entity';
import { Net_Centro_Trabajo_Nivel } from './net_centro_trabajo_nivel.entity';
import { net_modulo } from 'src/modules/usuario/entities/net_modulo.entity';
import { Net_Estado_Centro_Trabajo } from './net_estado_centro_trabajo.entity';
import { Net_Empleado_Centro_Trabajo } from './net_empleado_centro_trabajo.entity';

@Entity({ name: 'NET_CENTRO_TRABAJO' })
@Check('CK_TIPO_CENTRO_TRAB', `TIPO IN ('EDUCACION', 'INSTITUCION')`)
@Check('CK_SECTOR_ECONOMICO_TRABA', `SECTOR_ECONOMICO IN ('PUBLICO', 'PRIVADO', 'PEDAGOGICO', 'PROHECO', 'ADMINISTRATIVO')`)
export class Net_Centro_Trabajo {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_centro_trabajo' })
    id_centro_trabajo: number;

    @Column('nvarchar2', { length: 14, nullable: true, name: 'RTN' })
    @Index("UQ_rtn_netCenTrab", { unique: true })
    rtn: string;

    @Column('varchar2', { length: 100, nullable: true, name: 'NOMBRE_CENTRO_TRABAJO' })
    nombre_centro_trabajo: string;

    @Column('int', { nullable: true, name: 'NUMERO_EMPLEADOS' })
    numero_empleados: number;

    @Column('nvarchar2', { length: 255, nullable: true, name: 'OBJETIVO_SOCIAL' })
    objetivo_social: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'SECTOR_ECONOMICO' })
    sector_economico: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'NUMERO_ACUERDO' })
    numero_acuerdo: string;

    @Column('date', { nullable: true, name: 'FECHA_EMISION' })
    fecha_emision: Date;

    @Column('date', { nullable: true, name: 'FECHA_INICIO_OPERACIONES' })
    fecha_inicio_operaciones: Date;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'TIPO' })
    tipo: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'CELULAR_1' })
    celular_1: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'CELULAR_2' })
    celular_2: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'CORREO_1' })
    @Index("UQ_Correo_centro_trab", { unique: true })
    correo_1: string;

    @Column('varchar2', { length: 50, nullable: true, name: 'CORREO_2' })
    correo_2: string;

    @Column('nvarchar2', { length: 50, nullable: true, name: 'APODERADO_LEGAL' })
    apoderado_legal: string;

    @Column('nvarchar2', { length: 50, nullable: true, name: 'REPRESENTANTE_LEGAL' })
    representante_legal: string;

    @Column('nvarchar2', { length: 300, nullable: true, name: 'LOGO' })
    logo: string;

    @Column('nvarchar2', { length: 200, nullable: true, name: 'DIRECCION_1' })
    direccion_1: string;

    @Column('nvarchar2', { length: 200, nullable: true, name: 'DIRECCION_2' })
    direccion_2: string;

    @Column('decimal', { precision: 10, scale: 7, nullable: true, name: 'LATITUD' })
    latitud: number;

    @Column('decimal', { precision: 10, scale: 7, nullable: true, name: 'LONGITUD' })
    longitud: number;

    @Column('nvarchar2', { length: 20, nullable: true, name: 'CODIGO' })
    codigo: string;

    @ManyToOne(() => Net_Municipio, municipio => municipio.centrosTrabajo)
    @JoinColumn({ name: 'ID_MUNICIPIO', foreignKeyConstraintName: 'FK_ID_MUNICIPIO_CENT_TRAB' })
    municipio: Net_Municipio;

    @OneToMany(() => Net_perf_pers_cent_trab, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    @JoinColumn({ name: 'ID_PERFIL_AFIL_CENTR_TRAB' })
    perfAfilCentTrabs: Net_perf_pers_cent_trab[];

    @OneToMany(() => Net_Detalle_planilla_ingreso, detallePlanIngreso => detallePlanIngreso.centroTrabajo)
    detalle_plani_ingr: Net_Detalle_planilla_ingreso[];

    @OneToMany(() => Net_Deduccion, deduccion => deduccion.centroTrabajo)
    deduccion: Net_Deduccion[];

    @OneToMany(() => Net_Empleado_Centro_Trabajo, empleadoCentroTrabajo => empleadoCentroTrabajo.centroTrabajo)
    empleadoCentroTrabajos: Net_Empleado_Centro_Trabajo[];

    @OneToMany(() => Net_Sociedad_Centro_Trabajo, sociedadCentroTrabajo => sociedadCentroTrabajo.centroTrabajo)
    sociedadCentroTrabajos: Net_Sociedad_Centro_Trabajo[];

    @OneToMany(() => Net_Referencia_Centro_Trabajo, referencia => referencia.centroTrabajo)
    referencias: Net_Referencia_Centro_Trabajo[];

    @OneToMany(() => Net_Centro_Trabajo_Nivel, centroTrabajoNivel => centroTrabajoNivel.centroTrabajo)
    centroTrabajoNiveles: Net_Centro_Trabajo_Nivel[];

    @OneToMany(() => Net_Centro_Trabajo_Jornada, centroTrabajoJornada => centroTrabajoJornada.centroTrabajo)
    centroTrabajoJornadas: Net_Centro_Trabajo_Jornada[];

    @OneToMany(() => net_modulo, modulo => modulo.centroTrabajo)
    modulos: net_modulo[];

    @ManyToOne(() => Net_Estado_Centro_Trabajo, estado => estado.centro_trabajo)
    @JoinColumn({ name: 'ID_ESTADO_CENTRO_TRAB', foreignKeyConstraintName: 'FK_ID_ESTADO_CENTRO_TRAB_CENT_TRAB' })
    estado: Net_Centro_Trabajo;
}
