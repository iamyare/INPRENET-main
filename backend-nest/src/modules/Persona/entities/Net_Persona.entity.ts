import { Net_TipoIdentificacion } from "../../tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Pais } from "../../Regional/pais/entities/pais.entity";
import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Deduccion } from "../../Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Municipio } from "../../Regional/municipio/entities/net_municipio.entity";
import { NET_CUENTA_PERSONA } from "../../transacciones/entities/net_cuenta_persona.entity";
import { IsIn } from "class-validator";
import { Net_Detalle_planilla_ingreso } from "../../Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity";
import { Net_Estado_Persona } from "./net_estado_persona.entity";
import { NET_DETALLE_PERSONA } from "./Net_detalle_persona.entity";
import { Net_Persona_Colegios } from "src/modules/transacciones/entities/net_persona_colegios.entity";
import { Net_Persona_Por_Banco } from "src/modules/banco/entities/net_persona-banco.entity";
import { Net_perf_pers_cent_trab } from "./net_perf_pers_cent_trab.entity";
import { Net_Ref_Per_Pers } from "./net_ref-Per-Persona.entity";

@Entity({
    name: 'NET_PERSONA',
})
@Check("CK_Sexo", `SEXO IN ('F', 'M')`)
export class Net_Persona {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_PERSONA' })
    id_persona: number;

    @ManyToOne(() => Net_TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.persona, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_IDENTIFICACION', foreignKeyConstraintName: "FK_ID_TIPO_IDENTI_PERS" })
    tipoIdentificacion: Net_TipoIdentificacion;

    @ManyToOne(() => Net_Pais, pais => pais.persona, { cascade: true })
    @JoinColumn({ name: 'ID_PAIS_NACIONALIDAD', foreignKeyConstraintName: "FK_ID_PAIS_PERS" })
    pais: Net_Pais;

    @Column('varchar2', { length: 40, nullable: true, name: 'DNI' })
    @Index("UQ_DNI_net_persona", { unique: true })
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
    @IsIn(['F', 'M'])
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

    @Column('varchar2', { length: 40, nullable: true, name: 'NUMERO_CARNET' })
    numero_carnet: string;

    @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
    fecha_nacimiento: string;

    @Column('date', { nullable: true, name: 'FECHA_DEFUNCION' })
    fecha_defuncion: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: string;

    @OneToMany(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.persona)
    detallePersona: NET_DETALLE_PERSONA[];

    @Column('varchar2', { length: 200, nullable: true, name: 'DIRECCION_RESIDENCIA' })
    direccion_residencia: string;

    @ManyToOne(() => Net_Municipio, municipio => municipio.persona, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_RESIDENCIA', foreignKeyConstraintName: "FK_ID_MUNIC_RESID_PERS" })
    municipio: Net_Municipio;

    @ManyToOne(() => Net_Estado_Persona, estadoPersona => estadoPersona.personas, { cascade: true })
    @JoinColumn({ name: 'ID_ESTADO_PERSONA', foreignKeyConstraintName: "FK_NET_PERSONA_ESTADO_PERSONA" })
    estadoPersona: Net_Estado_Persona;

    @OneToMany(() => NET_DETALLE_PERSONA, detallePersona => detallePersona.persona)
    detallesPersona: NET_DETALLE_PERSONA[];

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


}