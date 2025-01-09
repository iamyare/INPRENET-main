import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";
import { Net_Clasificacion_Beneficios } from "../../planilla/entities/net_clasificacion_beneficios.entity";
import { Net_Regimen } from "./net_regimen.entity";
import { Net_Beneficio_Tipo_Persona } from "../../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity";
import { Net_Deduccion_Tipo_Planilla } from "../../deduccion/entities/net_deduccion_tipo_planilla.entity";

@Check("CK_ESTADO_NET_BENEFICIO", `estado IN ('HABILITADO', 'INHABILITADO')`)
@Entity({ name: 'NET_BENEFICIO' })
export class Net_Beneficio {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BENEFICIO', primaryKeyConstraintName: 'PK_id_beneficio_beneficio' })
    id_beneficio: string;

    @Column('varchar2', { length: 60, nullable: false, name: 'NOMBRE_BENEFICIO' })
    nombre_beneficio: string;

    @Column('varchar2', { length: 60, default: "HABILITADO", nullable: false, name: 'ESTADO' })
    estado: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'CODIGO' })
    codigo: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION_BENEFICIO' })
    descripcion_beneficio: string;

    @Column({ name: 'PERIODICIDAD' })
    periodicidad: string;

    @Column('number', { nullable: true, name: 'NUMERO_RENTAS_MAX' })
    numero_rentas_max?: number;

    @Column('number', { nullable: true, name: 'PORCENTAJE_POR_BENEFICIO' })
    porcentaje_por_beneficio?: number;

    @OneToMany(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.beneficio)
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];

    @OneToMany(() => Net_Beneficio_Tipo_Persona, beneficioTipoPersona => beneficioTipoPersona.beneficio)
    benefTipoPersona: Net_Beneficio_Tipo_Persona[];

    @OneToMany(() => Net_Clasificacion_Beneficios, beneficio => beneficio.beneficio)
    BenDedTipPlan: Net_Clasificacion_Beneficios[]

    @ManyToOne(() => Net_Regimen, regimen => regimen.beneficio)
    @JoinColumn({ name: 'ID_REGIMEN' })
    regimen: Net_Regimen;

    @OneToMany(() => Net_Deduccion_Tipo_Planilla, dedTipoPlan => dedTipoPlan.beneficio)
    dedTipoPlanilla: Net_Deduccion_Tipo_Planilla[];


    /*     @ManyToOne(() => Net_Tipo_Persona, tipo_persona => tipo_persona.beneficio)
        @JoinColumn({ name: 'ID_TIPO_PERSONA' })
        tipoPersona: Net_Tipo_Persona; */
}