import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";
import { AfiliadosPorBanco } from "src/banco/entities/afiliados-banco";
import { IsString } from "class-validator";
import { Provincia } from "src/modules/Regional/provincia/entities/provincia.entity";
import { Pais } from "src/modules/Regional/pais/entities/pais.entity";
import { TipoIdentificacion } from "src/modules/tipo_identificacion/entities/tipo_identificacion.entity";
import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/beneficio_planilla.entity";
import { Usuario } from "src/modules/usuario/entities/usuario.entity";
import { DedAfilPlanilla } from "src/modules/Planilla/ded-afil-planilla/entities/ded-afil-planilla.entity";

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

    @Column('varchar2', { length: 40, nullable: false })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: false })
    numero_carnet: string;

    @Column('varchar2', { length: 200, nullable: false })
    direccion_residencia: string;

    @Column('varchar2', { length: 40, default: 'ACTIVO' })
    estado: string;

    @Column('varchar2', { length: 40, nullable: true })
    porcentaje: number;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @OneToMany(
        () => PerfAfilCentTrab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: PerfAfilCentTrab[];
    
    @OneToMany(() => ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: ReferenciaPersonalAfiliado[];

    @ManyToOne(() => Pais, pais => pais.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_pais' })
    pais: Pais;

    @OneToMany(() => AfiliadosPorBanco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco : AfiliadosPorBanco[];


    @ManyToOne(() => Provincia, provincia => provincia.afiliados, { cascade: true })
    @JoinColumn({ name: 'id_provincia' })
    provincia: Provincia;

    // Relación Uno a Muchos consigo mismo
    @OneToMany(() => Afiliado, afiliado => afiliado.padreIdAfiliado)
    hijos: Afiliado[];

    // Relación Muchos a Uno consigo mismo
    @ManyToOne(() => Afiliado, afiliado => afiliado.hijos, { cascade: true })
    @JoinColumn({ name: 'padreIdAfiliado' })
    @IsString()
    padreIdAfiliado: Afiliado;

    @ManyToOne(() => TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliados, { cascade: true })
    @JoinColumn({ name: 'id_tipo_identificacion' })
    tipoIdentificacion: TipoIdentificacion;

    @OneToOne(() => Usuario, { cascade: true })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @OneToMany(() => DedAfilPlanilla, dedAfilPlanilla => dedAfilPlanilla.afiliado)
    dedAfilPlanilla: DedAfilPlanilla[];
}