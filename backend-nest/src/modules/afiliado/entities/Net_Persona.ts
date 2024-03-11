import { Net_TipoIdentificacion } from "src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Pais } from "src/modules/Regional/pais/entities/pais.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Net_Provincia } from "src/modules/Regional/provincia/entities/net_provincia.entity";
import { Net_Ref_Per_Afil } from "./net_ref-Per-Afiliado";import { Net_perf_afil_cent_trab} from "./net_perf_afil_cent_trab";
import { Net_Detalle_Deduccion } from "src/modules/Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Detalle_Afiliado } from "./detalle_afiliado.entity";
import { Net_Afiliados_Por_Banco } from "src/modules/banco/entities/net_afiliados-banco";
 
@Entity({ name: 'NET_PERSONA' })
export class Net_Persona {
    @PrimaryGeneratedColumn('uuid', { name: 'ID_PERSONA' })
    id_persona: string;

    @ManyToOne(() => Net_TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_IDENTIFICACION' })
    tipoIdentificacion: Net_TipoIdentificacion;

    @ManyToOne(() => Net_Pais, pais => pais.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_PAIS' })
    pais: Net_Pais;

    @Column('varchar2', { length: 40, nullable: true, name: 'DNI' })
    @Index("UQ_DNI_net_afiliado", { unique: true })
    dni: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'ESTADO_CIVIL' })
    estado_civil: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'PRIMER_NOMBRE' })
    primer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_NOMBRE' })
    segundo_nombre: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'TERCER_NOMBRE' })
    tercer_nombre: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'PRIMER_APELLIDO' })
    primer_apellido: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_APELLIDO' })
    segundo_apellido: string;

    @Column('char', { length: 1, nullable: true, name: 'SEXO' })
    sexo: string;

    @Column('number', { nullable: true, name: 'CANTIDAD_DEPENDIENTES' })
    cantidad_dependientes: number;

    @Column('number', { nullable: true, name: 'CANTIDAD_HIJOS' })
    cantidad_hijos: number;

    @Column('varchar2', { length: 30, nullable: true, name: 'PROFESION' })
    profesion: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'REPRESENTACION' })
    representacion: string;

    @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'CORREO_1' })
    correo_1: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'CORREO_2' })
    correo_2: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'COLEGIO_MAGISTERIAL' })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'NUMERO_CARNET' })
    numero_carnet: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DIRECCION_RESIDENCIA' })
    direccion_residencia: string;

    @Column('varchar2', { length: 40, default: 'ACTIVO', name: 'ESTADO' })
    estado: string;

    @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
    fecha_nacimiento: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: string;

    @ManyToOne(() => Net_Provincia, provincia => provincia.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_PROVINCIA' })
    provincia: Net_Provincia;
    
    @OneToMany(() => Net_Detalle_Afiliado, detalleAfiliado => detalleAfiliado.persona)
    detallesAfiliado: Net_Detalle_Afiliado[];
    
    @OneToMany(() => Net_Ref_Per_Afil, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: Net_Ref_Per_Afil[];

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco : Net_Afiliados_Por_Banco[];

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.afiliado)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(
        () => Net_perf_afil_cent_trab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];

}