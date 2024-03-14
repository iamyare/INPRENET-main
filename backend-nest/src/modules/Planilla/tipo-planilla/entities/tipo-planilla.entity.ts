import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';

@Entity({ name: 'NET_TIPO_PLANILLA' })
@Check("CK_CLASE_PLANILLA",`CLASE_PLANILLA IN ('INGRESO', 'EGRESO')`)
export class Net_TipoPlanilla {

    @PrimaryGeneratedColumn({type: 'int', name: 'ID_TIPO_PLANILLA',  primaryKeyConstraintName: 'PK_id_tip_plan_TipPlan' })
    id_tipo_planilla: number;

    @Column('varchar2', { length: 100, nullable: false, name: 'NOMBRE_PLANILLA' })
    nombre_planilla: string;

    @Column('varchar2', { length: 7, nullable: true, name: 'CLASE_PLANILLA' })
    clase_planilla: string;

    @Column('varchar2', { length: 200, nullable: true, name: 'DESCRIPCION' })
    descripcion: string;

    @OneToMany(() => Net_Planilla, planilla => planilla.tipoPlanilla)
    planilla: Net_Planilla[];

    /* @OneToMany(() => Net_Detalle_Deduccion, net_Ded_Planilla => net_Ded_Planilla.detDeduccion)
    net_Ded_Planilla: Net_Detalle_Deduccion[]; */
}
