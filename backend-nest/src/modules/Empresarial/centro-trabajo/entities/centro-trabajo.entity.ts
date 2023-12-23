import { PerfAfilCentTrab } from "src/afiliado/entities/perf_afil_cent_trab";
import { Provincia } from "src/pais/entities/provincia";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CentroTrabajo {
    @PrimaryGeneratedColumn('uuid')
    id_centro_trabajo: string;

    @Column('varchar2', { length: 40, nullable: false })
    nombre_Centro_Trabajo: string;

    @Column('varchar2', { length: 30, nullable: false })
    telefono_1: string;

    @Column('varchar2', { length: 30, nullable: true })
    telefono_2: string;

    @Column('varchar2', { unique : true, length: 40, nullable: false })
    correo_1: string;

    @Column('varchar2', { length: 50, nullable: true })
    correo_2: string;

    @Column('nvarchar2', { length: 50, nullable: false })
    apoderado_legal: string;

    @Column('nvarchar2', { length: 50, nullable: false })
    representante_legal: string;

    @Column('nvarchar2', { unique : true, length: 14, nullable: false })
    rtn: string;

    @Column('nvarchar2', { length: 300, nullable: false })
    logo: string;

    @Column('nvarchar2', { length: 200, nullable: false })
    UbicacionCompleta: string;

    @ManyToOne(() => Provincia, provincia => provincia.centrosTrabajo)
    @JoinColumn({ name: 'id_provincia' })
    provincia: Provincia;

    @OneToMany(() => PerfAfilCentTrab, perfAfilCentTrab => perfAfilCentTrab.centroTrabajo)
    @JoinColumn({ name: 'id_perfAfilCentTrabs' })
    perfAfilCentTrabs: PerfAfilCentTrab[];
}
