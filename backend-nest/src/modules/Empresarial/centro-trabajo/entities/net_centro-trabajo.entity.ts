import { Net_perf_afil_cent_trab } from "src/modules/afiliado/entities/net_perf_afil_cent_trab";
import { Net_Provincia } from "src/modules/Regional/provincia/entities/net_provincia.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Net_Centro_Trabajo {
    @PrimaryGeneratedColumn('uuid')
    ID_CENTRO_TRABAJO: string;

    @Column('varchar2', { length: 40, nullable: false })
    NOMBRE_CENTRO_TRABAJO: string;

    @Column('varchar2', { length: 40, nullable: false })
    SECTOR_ECONOMICO: string;

    @Column('varchar2', { length: 30, nullable: false })
    TELEFONO_1: string;

    @Column('varchar2', { length: 30, nullable: true })
    TELEFONO_2: string;

    @Column('varchar2', { unique : true, length: 40, nullable: false })
    CORREO_1: string;

    @Column('varchar2', { length: 50, nullable: true })
    CORREO_2: string;

    @Column('nvarchar2', { length: 50, nullable: false })
    APODERADO_LEGAL: string;

    @Column('nvarchar2', { length: 50, nullable: false })
    REPRESENTANTE_LEGAL: string;

    @Column('nvarchar2', { length: 14, nullable: false })
    @Index("UQ_rtn_netCenTrab", {unique:true})
    RTN: string;

    @Column('nvarchar2', { length: 300, nullable: false })
    LOGO: string;

    @Column('nvarchar2', { length: 200, nullable: false })
    UBICACION_COMPLETA: string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.centrosTrabajo)
    @JoinColumn({ name: 'ID_PROVINCIA' })
    provincia: Net_Provincia;

    @OneToMany(() => Net_perf_afil_cent_trab, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    @JoinColumn({ name: 'ID_PERFIL_AFIL_CENTR_TRAB' })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];
}
