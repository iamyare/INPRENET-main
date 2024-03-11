import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { Net_Deduc_Tipo_Planilla } from '../../deduccion/entities/net_ded-planilla.entity';

@Entity()
export class Net_TipoPlanilla {

    @PrimaryGeneratedColumn('uuid')
    ID_TIPO_PLANILLA : string;

    @Column('varchar2', { length: 100, nullable: false })
    NOMBRE_PLANILLA : string;

    @Column('varchar2', { length: 200, nullable: true })
    DESCRIPCION: string;
    
    @OneToMany(() => Net_Planilla, planilla => planilla.tipoPlanilla)
    planilla: Net_Planilla[];

    @OneToMany(() => Net_Deduc_Tipo_Planilla, net_Ded_Planilla => net_Ded_Planilla.net_TipoPlanilla, { cascade: true })
    net_Ded_Planilla: Net_Deduc_Tipo_Planilla[];
}
