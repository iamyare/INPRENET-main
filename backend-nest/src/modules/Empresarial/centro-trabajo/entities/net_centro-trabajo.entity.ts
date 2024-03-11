import { Net_perf_afil_cent_trab } from "src/modules/afiliado/entities/net_perf_afil_cent_trab";
import { Net_Provincia } from "src/modules/Regional/provincia/entities/net_provincia.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'NET_CENTRO_TRABAJO'})
export class Net_Centro_Trabajo {
    @PrimaryGeneratedColumn('uuid', { name: 'ID_CENTRO_TRABAJO' })
    id_centro_trabajo: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'NOMBRE_CENTRO_TRABAJO' })
    nombre_centro_trabajo: string;

    @Column('varchar2', { length: 40, nullable: false, name: 'SECTOR_ECONOMICO' })
    sector_economico: string;

    @Column('varchar2', { length: 30, nullable: false, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('varchar2', { length: 30, nullable: true, name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { unique : true, length: 40, nullable: false, name: 'CORREO_1' })
    correo_1: string;

    @Column('varchar2', { length: 50, nullable: true, name: 'CORREO_2' })
    correo_2: string;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'APODERADO_LEGAL' })
    apoderado_legal: string;

    @Column('nvarchar2', { length: 50, nullable: false, name: 'REPRESENTANTE_LEGAL' })
    representante_legal: string;

    @Column('nvarchar2', { length: 14, nullable: false, name: 'RTN' })
    @Index("UQ_rtn_netCenTrab", { unique:true })
    rtn: string;

    @Column('nvarchar2', { length: 300, nullable: false, name: 'LOGO' })
    logo: string;

    @Column('nvarchar2', { length: 200, nullable: false, name: 'UBICACION_COMPLETA' })
    ubicacion_completa: string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.centrosTrabajo)
    @JoinColumn({ name: 'ID_PROVINCIA' })
    provincia: Net_Provincia;

    @OneToMany(() => Net_perf_afil_cent_trab, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    @JoinColumn({ name: 'ID_PERFIL_AFIL_CENTR_TRAB' })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];
}
