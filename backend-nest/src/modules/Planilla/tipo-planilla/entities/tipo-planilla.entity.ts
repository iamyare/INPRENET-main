import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { Net_Clasificacion_Beneficios } from '../../planilla/entities/net_clasificacion_beneficios.entity';
import { Net_Beneficio_Tipo_Persona } from '../../beneficio_tipo_persona/entities/net_beneficio_tipo_persona.entity';
import { Net_Deduccion_Tipo_Planilla } from '../../deduccion/entities/net_deduccion_tipo_planilla.entity';

@Entity({ name: 'NET_TIPO_PLANILLA' })
@Check("CK_CLASE_PLANILLA", `CLASE_PLANILLA IN ('INGRESO', 'EGRESO')`)
export class Net_TipoPlanilla {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_TIPO_PLANILLA', primaryKeyConstraintName: 'PK_id_tip_plan_TipPlan' })
    id_tipo_planilla: number;

    @Column('varchar2', { length: 100, nullable: false, name: 'NOMBRE_PLANILLA' })
    nombre_planilla: string;

    @Column('varchar2', { length: 7, nullable: true, name: 'CLASE_PLANILLA' })
    clase_planilla: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

    @OneToMany(() => Net_Planilla, planilla => planilla.tipoPlanilla)
    planilla: Net_Planilla[];

    @OneToMany(() => Net_Clasificacion_Beneficios, planilla => planilla.tipoPlanilla)
    BenDedTipoPlan: Net_Clasificacion_Beneficios[];

    @OneToMany(() => Net_Beneficio_Tipo_Persona, bentipPer => bentipPer.tipo_planilla)
    bentipPer: Net_Beneficio_Tipo_Persona[];

    @OneToMany(() => Net_Deduccion_Tipo_Planilla, dedTipoPlanilla => dedTipoPlanilla.tipo_planilla)
    dedTipoPlanilla: Net_Deduccion_Tipo_Planilla[];

}
