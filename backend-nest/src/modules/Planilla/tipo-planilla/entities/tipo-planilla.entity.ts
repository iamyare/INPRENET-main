import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';
import { Net_Detalle_Deduccion } from '../../detalle-deduccion/entities/detalle-deduccion.entity';

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

/*     @OneToMany(() => Net_Detalle_Deduccion, net_Ded_Planilla => net_Ded_Planilla.detDeduccion)
    net_Ded_Planilla: Net_Detalle_Deduccion[]; */
}
