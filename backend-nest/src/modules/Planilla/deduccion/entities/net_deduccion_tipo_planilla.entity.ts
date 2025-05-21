import { Column, Entity, Generated, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity'; import { Net_Centro_Trabajo }
    from 'src/modules/Empresarial/entities/net_centro_trabajo.entity';
import { Net_Deducciones_Asignadas } from '../../detalle-deduccion/entities/net-deducciones-asignadas.entity';
import { Net_Deduccion } from './net_deduccion.entity';
import { Net_TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Beneficio } from '../../beneficio/entities/net_beneficio.entity';

@Entity({ name: 'NET_DEDUCCION_TIPO_PLANILLA' })
export class Net_Deduccion_Tipo_Planilla {

    @PrimaryGeneratedColumn({ type: 'int', name: 'ID_DEDUCCION_TIPO_PLANILLA', primaryKeyConstraintName: 'PK_id_ded_tip_plan_net_ded_tipP' })
    id_deduccion_tipo_planilla: number;

    @ManyToOne(() => Net_Deduccion, deduccion => deduccion.dedTipoPlanilla, { cascade: true })
    @JoinColumn({ name: 'ID_DEDUCCION', foreignKeyConstraintName: "FK_ID_DEDUCCION_NET_DED_TIP_PLAN" })
    deduccion: Net_Deduccion;

    @ManyToOne(() => Net_TipoPlanilla, tipoPlanilla => tipoPlanilla.dedTipoPlanilla, { cascade: true })
    @JoinColumn({ name: 'ID_TIPO_PLANILLA', foreignKeyConstraintName: "FK_ID_TIPO_PLANILLA_NET_DED_TIP_PLAN" })
    tipo_planilla: Net_TipoPlanilla;

    @ManyToOne(() => Net_Beneficio, beneficio => beneficio.dedTipoPlanilla, { cascade: true })
    @JoinColumn({ name: 'ID_BENEFICIO', foreignKeyConstraintName: "FK_ID_BENEFICIO_NET_DED_TIP_PLAN" })
    beneficio: Net_TipoPlanilla;

}