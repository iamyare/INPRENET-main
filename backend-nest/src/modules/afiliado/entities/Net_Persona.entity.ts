import { Net_TipoIdentificacion } from "../../tipo_identificacion/entities/net_tipo_identificacion.entity";
import { Net_Pais } from "../../Regional/pais/entities/pais.entity";
import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Ref_Per_Afil } from "./net_ref-Per-Afiliado.entity"; import { Net_perf_afil_cent_trab } from "./net_perf_afil_cent_trab.entity";
import { Net_Detalle_Deduccion } from "../../Planilla/detalle-deduccion/entities/detalle-deduccion.entity";
import { Net_Afiliados_Por_Banco } from "../../banco/entities/net_afiliados-banco.entity";
import { Net_Municipio } from "../../Regional/municipio/entities/net_municipio.entity";
import { NET_CUENTA_PERSONA } from "../../transacciones/entities/net_cuenta_persona.entity";
import { IsIn } from "class-validator";
import { NET_MOVIMIENTO_CUENTA } from "../../transacciones/entities/net_movimiento_cuenta.entity";
import { Net_Detalle_planilla_ingreso } from "../../Planilla/Ingresos/detalle-plan-ingr/entities/net_detalle_plani_ing.entity";
import { Net_Estado_Afiliado } from "./net_estado_afiliado.entity";
import { NET_DETALLE_PERSONA } from "./Net_detalle_persona.entity";

@Entity({
    name: 'NET_PERSONA',
})
@Check("CK_Sexo", `SEXO IN ('F', 'M')`)
export class Net_Persona {
    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_PERSONA', primaryKeyConstraintName: 'PK_ID_PERSONA_PERSONA' })
    id_persona: number;

    @ManyToOne(() => Net_TipoIdentificacion, tipoIdentificacion => tipoIdentificacion.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_IDENTIFICACION', foreignKeyConstraintName: "FK_ID_TIPO_IDENTI_PERS" })
    tipoIdentificacion: Net_TipoIdentificacion;

    @ManyToOne(() => Net_Pais, pais => pais.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_PAIS', foreignKeyConstraintName: "FK_ID_PAIS_PERS" })
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

    @Column('varchar2', { length: 40, nullable: true, name: 'COLEGIO_MAGISTERIAL' })
    colegio_magisterial: string;

    @Column('varchar2', { length: 40, nullable: true, name: 'NUMERO_CARNET' })
    numero_carnet: string;

    @Column('date', { nullable: true, name: 'FECHA_NACIMIENTO' })
    fecha_nacimiento: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'ARCHIVO_IDENTIFICACION' })
    archivo_identificacion: string;

    @OneToMany(() => NET_DETALLE_PERSONA, detalleAfiliado => detalleAfiliado.afiliado)
    detalleAfiliado: NET_DETALLE_PERSONA[];

    @Column('varchar2', { length: 200, nullable: true, name: 'DIRECCION_RESIDENCIA' })
    direccion_residencia: string;

    @ManyToOne(() => Net_Municipio, municipio => municipio.afiliado, { cascade: true })
    @JoinColumn({ name: 'ID_MUNICIPIO_RESIDENCIA', foreignKeyConstraintName: "FK_ID_MUNIC_RESID_PERS" })
    municipio: Net_Municipio;

    @ManyToOne(() => Net_Estado_Afiliado, estadoAfiliado => estadoAfiliado.persona, { cascade: true })
    @JoinColumn({ name: 'ID_ESTADO_AFILIADO', foreignKeyConstraintName: "FK_ID_ESTADO_AFIL_PERS" })
    estadoAfiliado: Net_Estado_Afiliado;

    @OneToMany(() => NET_DETALLE_PERSONA, detalleAfiliado => detalleAfiliado.afiliado)
    detallesAfiliado: NET_DETALLE_PERSONA[];

    @OneToMany(() => Net_Ref_Per_Afil, referenciaPersonalAfiliado => referenciaPersonalAfiliado.afiliado)
    referenciasPersonalAfiliado: Net_Ref_Per_Afil[];

    @OneToMany(() => Net_Afiliados_Por_Banco, afiliadosPorBanco => afiliadosPorBanco.afiliado)
    afiliadosPorBanco: Net_Afiliados_Por_Banco[];

    @OneToMany(() => Net_Detalle_Deduccion, detalleDeduccion => detalleDeduccion.afiliado)
    detalleDeduccion: Net_Detalle_Deduccion[];

    @OneToMany(
        () => Net_perf_afil_cent_trab,
        (perfAfilCentTrab) => perfAfilCentTrab.afiliado,
        { cascade: true })
    perfAfilCentTrabs: Net_perf_afil_cent_trab[];

    @OneToMany(() => NET_CUENTA_PERSONA, cuentaPersona => cuentaPersona.persona)
    cuentas: NET_CUENTA_PERSONA[];

    @OneToMany(() => Net_Detalle_planilla_ingreso, detallePlanIngreso => detallePlanIngreso.persona)
    detallePlanIngreso: Net_Detalle_planilla_ingreso[];

}