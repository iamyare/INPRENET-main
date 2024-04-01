import { Net_perf_afil_cent_trab } from "src/modules/afiliado/entities/net_perf_afil_cent_trab";
import { Net_Detalle_planilla_ingreso } from "src/modules/Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity";
import { Net_Departamento } from "src/modules/Regional/provincia/entities/net_departamento.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'NET_CENTRO_TRABAJO' })
export class Net_Centro_Trabajo {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_CENTRO_TRABAJO', primaryKeyConstraintName: 'PK_id_centTrab_centTrab' })
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

    @Column('nvarchar2', { length: 200, nullable: false, name: 'UBICACION_COMPLETA' })
    ubicacion_completa: string;

    @ManyToOne(() => Net_Departamento, departamento => departamento.centrosTrabajo)
    @JoinColumn({ name: 'ID_DEPARTAMENTO', foreignKeyConstraintName: "FK_ID_DEPARTAMENTO_CENT_TRAB" })
    departamento: Net_Departamento;

    @OneToMany(() => Net_perf_afil_cent_trab, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    @JoinColumn({ name: 'ID_PERFIL_AFIL_CENTR_TRAB' })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];

    @OneToMany(() => Net_Detalle_planilla_ingreso, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    detalle_plani_ingr: Net_Detalle_planilla_ingreso;
}
