import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Net_Detalle_Beneficio_Afiliado } from "../../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity";
import { Net_Beneficio_Tipo_Persona } from "../../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity";


@Entity({ name: 'NET_BENEFICIO' })
export class Net_Beneficio {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_BENEFICIO', primaryKeyConstraintName: 'PK_id_beneficio_beneficio' })
    id_beneficio: string;

    @Column('varchar2', { length: 60, nullable: false, name: 'NOMBRE_BENEFICIO' })
    nombre_beneficio: string;

    @Column('varchar2', { length: 20, nullable: false, name: 'CODIGO' })
    codigo: string;

    @Column({ nullable: true, name: 'LEY_APLICABLE' })
    ley_aplicable: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION_BENEFICIO' })
    descripcion_beneficio: string;

    @Column({ name: 'PERIODICIDAD' })
    periodicidad: string;

    @Column('number', { nullable: false, default: 100000, name: 'NUMERO_RENTAS_MAX' })
    numero_rentas_max?: number;

    @Column('number', { nullable: true, name: 'PORCENTAJE_POR_BENEFICIO' })
    porcentaje_por_beneficio?: number;

    @OneToMany(() => Net_Detalle_Beneficio_Afiliado, detalleBeneficioAfiliado => detalleBeneficioAfiliado.beneficio)
    detalleBeneficioAfiliado: Net_Detalle_Beneficio_Afiliado[];

    @OneToMany(() => Net_Beneficio_Tipo_Persona, beneficioTipoPersona => beneficioTipoPersona.beneficio)
    benefTipoPersona: Net_Beneficio_Tipo_Persona[];
}