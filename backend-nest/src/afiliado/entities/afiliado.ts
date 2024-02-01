import { Pais } from "src/modules/Regional/pais/entities/pais.entity";
import { TipoIdentificacion } from "src/modules/tipo_identificacion/entities/tipo_identificacion.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Provincia } from "src/modules/Regional/provincia/entities/provincia.entity";
import { Planilla } from "src/modules/Planilla/planilla/entities/planilla.entity";
import { BeneficioPlanilla } from "src/modules/Planilla/beneficio_planilla/entities/beneficio_planilla.entity";
import { ReferenciaPersonalAfiliado } from "./referenciaP-Afiliado";
import { AfiliadosPorBanco } from "src/banco/entities/afiliados-banco";
import { DetalleDeduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { PerfAfilCentTrab } from "./perf_afil_cent_trab";
import { DetalleAfiliado } from "./detalle_afiliado.entity";
import { DetallePlanilla } from "src/modules/Planilla/planilla/entities/detalle_planilla.entity";
 
@Entity()
export class Afiliado {

    @PrimaryGeneratedColumn('uuid')
    id_afiliado: string;

    @ManyToOne(() => TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_tipo_identificacion' })
    tipoIdentificacion: TipoIdentificacion;

    @ManyToOne(() => Pais, pais => pais.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_pais' })
    pais: Pais;
    
    @Column('varchar2', { length: 40, nullable: true, unique: true })
    dni: string;

    @Column('varchar2', { length: 40, nullable: true })
    estado_civil: string;
    
    @Column('varchar2', { length: 40, nullable: true })
    primer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    tercer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true })
    primer_apellido: string;

    @Column('varchar2', { length: 40, nullable: true })
    segundo_apellido: string;

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

    @Column('date', { nullable: true })
    fecha_nacimiento: string;

    @Column('varchar2', { length: 200, nullable: true })
    archivo_identificacion: string;

    @OneToMany(() => DetalleAfiliado, detalleAfiliado => detalleAfiliado.afiliado)
    detalleAfiliado: DetalleAfiliado[];

    @OneToMany(() => DetallePlanilla, detallePlanilla => detallePlanilla.afiliado)
    detallePlanilla: DetallePlanilla[];

    @ManyToOne(() => Provincia, provincia => provincia.afiliado, { cascade: true })
    @JoinColumn({ name: 'id_provincia' })
    provincia: Provincia;

    @OneToMany(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.afiliado)
    beneficioPlanilla: BeneficioPlanilla[];

    @OneToMany(() => ReferenciaPersonalAfiliado, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: ReferenciaPersonalAfiliado[];

    @OneToMany(() => AfiliadosPorBanco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco : AfiliadosPorBanco[];

    @OneToMany(() => DetalleDeduccion, detalleDeduccion => detalleDeduccion.afiliado)
    detalleDeduccion: DetalleDeduccion[];

    @OneToMany(
        () => PerfAfilCentTrab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: PerfAfilCentTrab[];

}