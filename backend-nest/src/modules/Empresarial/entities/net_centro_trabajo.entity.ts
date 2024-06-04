import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Municipio } from 'src/modules/Regional/municipio/entities/net_municipio.entity';
import { Net_perf_pers_cent_trab } from 'src/modules/Persona/entities/net_perf_pers_cent_trab.entity';
import { Net_Detalle_planilla_ingreso } from 'src/modules/Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity';
import { Net_Deduccion } from 'src/modules/Planilla/deduccion/entities/net_deduccion.entity';
import { Net_Empleado_Centro_Trabajo } from './net_empleado_centro_trabajo.entity';
import { Net_Rol_Empresa } from 'src/modules/usuario/entities/net_rol_empresa.entity';
import { Net_Sociedad_Centro_Trabajo } from './net_sociedad_centro.entity';
import { Net_Referencia_Centro_Trabajo } from './net_referencia_centro_trabajo.entity';
import { Net_Centro_Trabajo_Jornada } from './Net_Centro_Trabajo_Jornada.entity';
import { Net_Centro_Trabajo_Nivel } from './Net_Centro_Trabajo_Nivel.entity';

@Entity({ name: 'NET_CENTRO_TRABAJO' })
export class Net_Centro_Trabajo {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_centro_trabajo' })
    id_centro_trabajo: number;

    @Column('varchar2', { length: 40, nullable: false, name: 'NOMBRE_CENTRO_TRABAJO' })
    nombre_centro_trabajo: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'SECTOR_ECONOMICO' })
    sector_economico: string;

    @Column('varchar2', { length: 30, nullable: false, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'CORREO_1' })
    @Index("UQ_Correo_centro_trab", { unique: true })
    correo_1: string;

    @Column('varchar2', { length: 50, nullable: true, name: 'CORREO_2' })
    correo_2: string;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'APODERADO_LEGAL' })
    apoderado_legal: string;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'REPRESENTANTE_LEGAL' })
    representante_legal: string;

    @Column('nvarchar2', { length: 14, nullable: false, name: 'RTN' })
    @Index("UQ_rtn_netCenTrab", { unique: true })
    rtn: string;

    @Column('nvarchar2', { length: 300, nullable: false, name: 'LOGO' })
    logo: string;

    @Column('nvarchar2', { length: 200, nullable: false, name: 'DIRECCION_1' })
    direccion_1: string;

    @Column('nvarchar2', { length: 200, nullable: false, name: 'DIRECCION_2' })
    direccion_2: string;

    @Column('varchar2', { length: 50, nullable: false, name: 'NUMERO_ACUERDO' })
    numero_acuerdo: string;

    @Column('date', { nullable: false, name: 'FECHA_EMISION' })
    fecha_emision: Date;

    @Column('date', { nullable: false, name: 'FECHA_INICIO_OPERACIONES' })
    fecha_inicio_operaciones: Date;

    @Column('int', { nullable: false, name: 'NUMERO_EMPLEADOS' })
    numero_empleados: number;
    
    @Column('number', { precision: 18, scale: 2, nullable: false, name: 'MONTO_ACTIVOS_TOTALES' })
    monto_activos_totales: number;

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

    @OneToMany(() => Net_Rol_Empresa, rolEmpresa => rolEmpresa.centroTrabajo)
    rolEmpresas: Net_Rol_Empresa[];

    @OneToMany(() => Net_Sociedad_Centro_Trabajo, sociedadCentroTrabajo => sociedadCentroTrabajo.centroTrabajo)
    sociedadCentroTrabajos: Net_Sociedad_Centro_Trabajo[];

    @OneToMany(() => Net_Referencia_Centro_Trabajo, referencia => referencia.centroTrabajo)
    referencias: Net_Referencia_Centro_Trabajo[];

    @OneToMany(() => Net_Centro_Trabajo_Nivel, centroTrabajoNivel => centroTrabajoNivel.centroTrabajo)
    centroTrabajoNiveles: Net_Centro_Trabajo_Nivel[];

    @OneToMany(() => Net_Centro_Trabajo_Jornada, centroTrabajoJornada => centroTrabajoJornada.centroTrabajo)
    centroTrabajoJornadas: Net_Centro_Trabajo_Jornada[];
}
