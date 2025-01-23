import { Net_Pais } from "../../Regional/pais/entities/pais.entity";
import { Check, Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Net_Detalle_Deduccion } from "../../Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Municipio } from "../../Regional/municipio/entities/net_municipio.entity";
import { NET_CUENTA_PERSONA } from "../../transacciones/entities/net_cuenta_persona.entity";
import { Net_Detalle_planilla_ingreso } from "../../Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity";
import { Net_perf_pers_cent_trab } from "./net_perf_pers_cent_trab.entity";
import { NET_PROFESIONES } from "src/modules/transacciones/entities/net_profesiones.entity";
import { Net_Peps } from "src/modules/Empresarial/entities/net_peps.entity";
import { Net_Tipo_Identificacion } from '../../tipo_identificacion/entities/net_tipo_identificacion.entity';
import { net_detalle_persona } from "./net_detalle_persona.entity";
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_Persona_Colegios } from 'src/modules/transacciones/entities/net_persona_colegios.entity';
import { net_causas_fallecimientos } from "./net_causas_fallecimientos.entity";
import { net_otra_fuente_ingreso } from "./net_otra_fuente_ingreso.entity";
import { Net_Persona_Discapacidad } from "./net_persona_discapacidad.entity";
import { Net_Familia } from "./net_familia.entity";
import { Net_Deducciones_Asignadas } from "src/modules/Planilla/detalle-deduccion/entities/net-deducciones-asignadas.entity";
import { Net_Referencias } from "./net_referencias.entity";
import { Net_Usuario_Empresa } from "src/modules/usuario/entities/net_usuario_empresa.entity";
import { Net_Detalle_Prestamo } from "src/modules/prestamos/entities/net_detalle_prestamo.entity";
@Entity({
    name: 'NET_PERSONA',
})
@Check("CK_SEXO_NET_PERSONA", `sexo IN ('F', 'M', 'NO BINARIO', 'OTRO')`)
@Check("CK_FALLECIDO_NET_PERSONA", `fallecido IN ('SI', 'NO')`)
@Check("CK_REPRESENTACION_NET_PERSONA", `REPRESENTACION IN ('POR CUENTA PROPIA', 'POR TERCEROS')`)
export class net_persona {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_NET_PERSONA' })
    id_persona: number;

    @ManyToOne(() => Net_Tipo_Identificacion, tipoIdentificacion => tipoIdentificacion.personas, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_IDENTIFICACION', foreignKeyConstraintName: 'FK_ID_TIPO_IDENTI_NET_PERSONA' })
    tipoIdentificacion: Net_Tipo_Identificacion;

    @ManyToOne(() => Net_Pais, pais => pais.persona, { cascade: true })
    @JoinColumn({ name: 'ID_PAIS_NACIONALIDAD', foreignKeyConstraintName: "FK_ID_PAIS_NET_PERSONA" })
    pais: Net_Pais;

    @Column('varchar2', { length: 15, nullable: true, name: 'N_IDENTIFICACION' })
    @Index("UQ_N_IDENTIFICACION_NET_PERSONA", { unique: true })
    n_identificacion: string;

    @Column('varchar2', { length: 14, nullable: true, name: 'RTN' })
    rtn: string;

    @Column('varchar2', { length: 14, nullable: true, name: 'GRUPO_ETNICO' })
    grupo_etnico: string;

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

    @Column('varchar2', { length: 10, nullable: true, name: 'SEXO' })
    sexo: string;

    @Column('varchar2', { length: 2, nullable: true, name: 'FALLECIDO', default: "NO" })
    fallecido: string;

    @Column('number', { nullable: true, name: 'CANTIDAD_HIJOS' })
    cantidad_hijos: number;

    @Column('number', { nullable: true, name: 'CANTIDAD_DEPENDIENTES' })
    cantidad_dependientes: number;

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

    @Column('varchar2', { length: 40, nullable: true, name: 'GRADO_ACADEMICO' })
    grado_academico: string;

    @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_1' })
    telefono_1: string;

    @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_2' })
    telefono_2: string;

    @Column('varchar2', { length: 12, nullable: true, name: 'TELEFONO_3' })
    telefono_3: string;

    @Column('varchar2', { length: 60, nullable: true, name: 'CORREO_1' })
    correo_1: string;

    @Column('varchar2', { length: 60, nullable: true, name: 'CORREO_2' })
    correo_2: string;

    @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
    fecha_nacimiento: string;

    @Column('blob', { nullable: true, name: 'CERTIFICADO_DEFUNCION' })
    certificado_defuncion: any;

    @Column('date', { nullable: true, name: 'FECHA_DEFUNCION' })
    fecha_defuncion: Date;

    @Column('date', { nullable: true, name: 'FECHA_REPORTE_FALLECIDO' })
    fechaReporteFallecido: Date;

    @Column('blob', { nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: any;

    @Column('varchar2', { length: 500, nullable: true, name: 'DIRECCION_RESIDENCIA' })
    direccion_residencia: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'DIRECCION_RESIDENCIA_ESTRUCTURADA' })
    direccion_residencia_estructurada: string;

    @Column('varchar2', { length: 500, nullable: true, name: 'OBSERVACION' })
    observacion: string;

    @UpdateDateColumn({ type: 'timestamp', name: 'ULTIMA_FECHA_ACTUALIZACION' })
    ultima_fecha_actualizacion: Date;

    @Column('blob', { nullable: true, name: 'FOTO_PERFIL' })
    foto_perfil: any;

    @OneToMany(() => net_detalle_persona, detallePersona => detallePersona.persona)
    detallePersona: net_detalle_persona[];

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_RESIDENCIA', foreignKeyConstraintName: "FK_ID_MUNIC_RESID_NET_PERSONA" })
    municipio: Net_Municipio;

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_DEFUNCION', foreignKeyConstraintName: "FK_ID_MUNIC_DEFUNC_NET_PERSONA" })
    municipio_defuncion: Net_Municipio;

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_NACIMIENTO', foreignKeyConstraintName: "FK_ID_MUNIC_NACIMIENTO_NET_PERSONA" })
    municipio_nacimiento: Net_Municipio;

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
    @JoinColumn({ name: 'ID_PROFESION', foreignKeyConstraintName: 'FK_ID_PROFESION_NET_PERSONA' })
    profesion: NET_PROFESIONES;

    @OneToMany(() => Net_Peps, peps => peps.persona)
    peps: Net_Peps[];

    @OneToMany(() => Net_Persona_Discapacidad, personaDiscapacidad => personaDiscapacidad.persona)
    personaDiscapacidades: Net_Persona_Discapacidad[];

    @ManyToOne(() => net_causas_fallecimientos, causaFallecimiento => causaFallecimiento.personas, { cascade: true })
    @JoinColumn({ name: 'ID_CAUSA_FALLECIMIENTO', foreignKeyConstraintName: "FK_ID_CAUSA_FALLECIMIENTO_NET_PERSONA" })
    causa_fallecimiento: net_causas_fallecimientos;

    @OneToMany(() => net_otra_fuente_ingreso, otra_fuente_ingreso => otra_fuente_ingreso.persona)
    otra_fuente_ingreso: net_otra_fuente_ingreso[];

    @OneToMany(() => Net_Familia, familia => familia.persona)
    familiares: Net_Familia[];

    @OneToMany(() => Net_Familia, familia => familia.referenciada)
    familiaresReferenciados: Net_Familia[];

    @OneToMany(() => Net_Deducciones_Asignadas, deduccionesAsignadas => deduccionesAsignadas.persona)
    deduccionesAsignadas: Net_Deducciones_Asignadas[];

    @OneToMany(() => Net_Referencias, referencia => referencia.persona)
    referencias: Net_Referencias[];

    @ManyToOne(() => Net_Usuario_Empresa, { nullable: true })
    @JoinColumn({ name: 'ID_USUARIO_EMPRESA', referencedColumnName: 'id_usuario_empresa', foreignKeyConstraintName: 'FK_ID_USUARIO_EMPRESA_PERSONA' })
    usuarioEmpresa: Net_Usuario_Empresa;

    @Column({ type: 'int', nullable: true, name: 'ID_USUARIO_EMPRESA' })
    ID_USUARIO_EMPRESA: number;

    @Column('date', { nullable: true, name: 'FECHA_AFILIACION' })
    fecha_afiliacion: string;

    @OneToMany(() => Net_Detalle_Prestamo, prestamo => prestamo.persona)
    detallePrestamos: Net_Detalle_Prestamo[];

}
