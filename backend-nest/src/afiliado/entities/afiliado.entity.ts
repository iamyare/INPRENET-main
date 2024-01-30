import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";
import { AfiliadosPorBanco } from "src/banco/entities/afiliados-banco";
import { IsString } from "class-validator";
import { Provincia } from "src/modules/Regional/provincia/entities/provincia.entity";
import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/beneficio_planilla.entity";
import { DetalleDeduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Planilla } from "src/modules/Planilla/planilla/entities/planilla.entity";
import { DatosIdentificacion } from "./datos_identificacion";

@Entity()
export class Afiliado {
    @PrimaryGeneratedColumn('uuid')
    id_afiliado: string;

    @Column('varchar2', { length: 40, nullable: true })
    estado_civil: string;

    @Column('varchar2', { length: 40, nullable: true })
    tipo_afiliado: string;

    @Column('char', { length: 1, nullable: true })
    sexo: string;

    @Column('number', { nullable: true })
    cantidad_dependientes: number;

    @Column('number', { nullable: true })
    cantidad_hijos: number;

    @Column('varchar2', { length: 30, nullable: true })
    profesion: string;

    @Column('varchar2', { length: 40, nullable: true })
    representacion: string;

    @Column('varchar2', { length: 12, nullable: true })
    telefono_1: string;

    @Column('varchar2', { length: 12, nullable: true })
    telefono_2: string;

    @Column('varchar2', { length: 40, nullable: true })
    correo_1: string;

    @Column('varchar2', { length: 40, nullable: true })
    correo_2: string;

    @Column('varchar2', { length: 40, nullable: true })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: true })
    numero_carnet: string;

    @Column('varchar2', { length: 200, nullable: true })
    direccion_residencia: string;

    @Column('varchar2', { length: 40, default: 'ACTIVO' })
    estado: string;

    @Column('number', { nullable: true})
    salario_base: number;

    @Column('number', { nullable: true })
    porcentaje: number;

    // Relación Uno a Muchos con PerfAfilCentTrab
    @OneToMany(
        () => PerfAfilCentTrab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: PerfAfilCentTrab[];

    @ManyToOne(() => DatosIdentificacion, datosIdentificacion => datosIdentificacion.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_datos_identificacion' })
    datosIdentificacion: DatosIdentificacion;
    
    @OneToMany(() => ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: ReferenciaPersonalAfiliado[];

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


    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.afiliado)
    detalleDeduccion: DetalleDeduccion[];

    @OneToMany(() => Planilla, planilla => planilla.afiliado)
    planilla: Planilla[];

    @OneToMany(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.afiliado)
    beneficioPlanilla: BeneficioPlanilla[];
}