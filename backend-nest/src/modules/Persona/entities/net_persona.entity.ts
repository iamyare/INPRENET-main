import { Net_Pais } from "../../Regional/pais/entities/pais.entity";
import { Check, Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Deduccion } from "../../Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Municipio } from "../../Regional/municipio/entities/net_municipio.entity";
import { NET_CUENTA_PERSONA } from "../../transacciones/entities/net_cuenta_persona.entity";
import { Net_Detalle_planilla_ingreso } from "../../Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity";
import { Net_perf_pers_cent_trab } from "./net_perf_pers_cent_trab.entity";
import { Net_Ref_Per_Pers } from "./net_ref-per-persona.entity";
import { NET_PROFESIONES } from "src/modules/transacciones/entities/net_profesiones.entity";
import { Net_Discapacidad } from "./net_discapacidad.entity";
import { Net_Peps } from "src/modules/Empresarial/entities/net_peps.entity";
import { Net_Tipo_Identificacion } from '../../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { net_detalle_persona } from "./net_detalle_persona.entity";
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_Persona_Colegios } from 'src/modules/transacciones/entities/net_persona_colegios.entity';
@Entity({
    name: 'NET_PERSONA',
})
@Check(`sexo IN ('F', 'M')`)
@Check(`fallecido IN ('SI', 'NO')`)
@Check(`REPRESENTACION IN ('POR CUENTA PROPIA', 'POR TERCEROS')`)
export class net_persona {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_PERSONA' })
    id_persona: number;

    @ManyToOne(() => Net_Tipo_Identificacion, tipoIdentificacion => tipoIdentificacion.personas, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_IDENTIFICACION', foreignKeyConstraintName: 'FK_ID_TIPO_IDENTI_PERS' })
    tipoIdentificacion: Net_Tipo_Identificacion;

    @ManyToOne(() => Net_Pais, pais => pais.persona, { cascade: true })
    @JoinColumn({ name: 'ID_PAIS_NACIONALIDAD', foreignKeyConstraintName: "FK_ID_PAIS_PERS" })
    pais: Net_Pais;

    @Column('varchar2', { length: 15, nullable: true, name: 'N_IDENTIFICACION' })
    @Index("UQ_N_Identificacion_net_persona", { unique: true })
    n_identificacion: string;

    @Column('date', { nullable: true, name: 'FECHA_VENCIMIENTO_IDENT' })
    fecha_vencimiento_ident: string;

    @Column('varchar2', { length: 14, nullable: true, name: 'RTN' })
    rtn: string;

    @Column('varchar2', { length: 14, nullable: true, name: 'RAZA' })
    raza: string;

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

    @Column('varchar2', { length: 30, nullable: true, name: 'GENERO' })
    genero: string;

    @Column('varchar2', { length: 1, nullable: true, name: 'SEXO' })
    sexo: string;

    @Column('varchar2', { length: 2, nullable: false, name: 'FALLECIDO', default: "NO" })
    fallecido: string;

    /* @Column('number', { nullable: true, name: 'CANTIDAD_DEPENDIENTES' })
    cantidad_dependientes: number; */

    @Column('number', { nullable: true, name: 'CANTIDAD_HIJOS' })
    cantidad_hijos: number;

    @Column('varchar2', { length: 40, nullable: true, name: 'PRIMER_NOMBRE_CENSO' })
    primer_nombre_censo: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_NOMBRE_CENSO' })
    segundo_nombre_censo: string;

    @Column('varchar2', { length: 300, nullable: true, name: 'NOMBRE_APELLIDO_ESCALAFON' })
    nombre_apellido_escalafon: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'PRIMER_APELLIDO_CENSO' })
    primer_apellido_censo: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'SEGUNDO_APELLIDO_CENSO' })
    segundo_apellido_censo: string;

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

    @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
    fecha_nacimiento: string;

    @Column('varchar', { nullable: true, name: 'TIPO_DEFUNCION' })
    tipo_defuncion: number;

    @Column('varchar', { nullable: true, name: 'MOTIVO_FALLECIMIENTO' })
    motivo_fallecimiento: number;

    @Column('varchar', { nullable: true, name: 'CERTIFICADO_DEFUNCION' })
    certificado_defuncion: number;

    @Column('date', { nullable: true, name: 'FECHA_DEFUNCION' })
    fecha_defuncion: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'DIRECCION_RESIDENCIA' })
    direccion_residencia: string;

    @Column('blob', { nullable: true, name: 'FOTO_PERFIL' })
    foto_perfil: Buffer;

    @OneToMany(() => net_detalle_persona, detallePersona => detallePersona.persona)
    detallePersona: net_detalle_persona[];

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_RESIDENCIA', foreignKeyConstraintName: "FK_ID_MUNIC_RESID_PERS" })
    municipio: Net_Municipio;

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_DEFUNCION', foreignKeyConstraintName: "FK_ID_MUNIC_DEFUNC_PERS" })
    municipio_defuncion: Net_Municipio;

    @OneToMany(() => Net_Ref_Per_Pers, referenciasPersonalPersona => referenciasPersonalPersona.persona)
    referenciasPersonalPersona: Net_Ref_Per_Pers[];

    @OneToMany(() => Net_Persona_Por_Banco, personasPorBanco => personasPorBanco.persona)
    personasPorBanco: Net_Persona_Por_Banco[];

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.persona)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(
        () => Net_perf_pers_cent_trab,
        (perfPersCentTrab) => perfPersCentTrab.persona,
        { cascade: true })
    perfPersCentTrabs: Net_perf_pers_cent_trab[];

    @OneToMany(() => NET_CUENTA_PERSONA, cuentaPersona => cuentaPersona.persona)
    cuentas: NET_CUENTA_PERSONA[];

    @OneToMany(() => Net_Detalle_planilla_ingreso, detallePlanIngreso => detallePlanIngreso.persona)
    detallePlanIngreso: Net_Detalle_planilla_ingreso[];

    @OneToMany(() => Net_Persona_Colegios, personaColegios => personaColegios.persona)
    colegiosMagisteriales: Net_Persona_Colegios[];

    @ManyToOne(() => NET_PROFESIONES, profesion => profesion.personas, { cascade: true })
    @JoinColumn({ name: 'ID_PROFESION', foreignKeyConstraintName: 'FK_ID_PROFESION_PERSONA' })
    profesion: NET_PROFESIONES;

    @OneToMany(() => Net_Peps, peps => peps.persona)
    peps: Net_Peps[];

    @ManyToMany(() => Net_Discapacidad, discapacidad => discapacidad.personas)
    discapacidades: Net_Discapacidad[];

}
