import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";
import { Pais } from "src/pais/entities/pais.entity";
import { AfiliadosPorBanco } from "src/banco/entities/afiliados-banco";
import { TipoIdentificacion } from "src/tipo_identificacion/entities/tipo_identificacion.entity";
import { Provincia } from "src/pais/entities/provincia";

@Entity()
export class Afiliado {
    @PrimaryGeneratedColumn('uuid')
    id_afiliado: string;

    @Column('varchar2', { length: 40, nullable: false, unique: true })
    dni: string;

    @Column('varchar2', { length: 40, nullable: false })
    estado_civil: string;

    @Column('varchar2', { length: 40, nullable: false })
    tipo_cotizante: string;

    @Column('varchar2', { length: 40, nullable: false })
    primer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    tercer_nombre: string;

    @Column('varchar2', { length: 40, nullable: false })
    primer_apellido: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_apellido: string;

    @Column('date', { nullable: false })
    fecha_nacimiento: string;

    @Column('char', { length: 1, nullable: false })
    sexo: string;

    @Column('number', { nullable: false })
    cantidad_dependientes: number;

    @Column('number', { nullable: false })
    cantidad_hijos: number;

    @Column('varchar2', { length: 30, nullable: false })
    profesion: string;

    @Column('varchar2', { length: 40, nullable: false })
    representacion: string;

    @Column('varchar2', { length: 12, nullable: false })
    telefono_1: string;

    @Column('varchar2', { length: 12, nullable: true })
    telefono_2: string;

    @Column('varchar2', { length: 40, nullable: false })
    correo_1: string;

    @Column('varchar2', { length: 40, nullable: true })
    correo_2: string;

    @Column('varchar2', { length: 200, nullable: false })
    archivo_identificacion: string;

    @Column('varchar2', { length: 200, nullable: false })
    direccion_residencia: string;

    @Column('varchar2', { length: 40, default: 'ACTIVO' })
    estado: string;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @OneToMany(() => PerfAfilCentTrab, perfAfilCentTrab => perfAfilCentTrab.afiliado)
    perfAfilCentTrabs: PerfAfilCentTrab[];
    
    @OneToMany(() => ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: ReferenciaPersonalAfiliado[];

    @ManyToOne(() => Pais, pais => pais.afiliado)
    pais: Pais;

    @OneToMany(() => AfiliadosPorBanco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco : AfiliadosPorBanco[];


    @ManyToOne(() => Provincia, provincia => provincia.afiliados)
    provincia: Provincia;

    // Relación Uno a Muchos consigo mismo
    @OneToMany(() => Afiliado, afiliado => afiliado.padre)
    hijos: Afiliado[];

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Afiliado, afiliado => afiliado.hijos)
    padre: Afiliado;

    @ManyToOne(() => TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliados)
    @JoinColumn({ name: 'id_tipo_identificacion' })
    tipoIdentificacion: TipoIdentificacion;
}