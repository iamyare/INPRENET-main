import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Net_Planilla } from '../../planilla/entities/net_planilla.entity';

@Entity()
export class Net_TipoPlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_tipo_planilla : string;

    @Column('varchar2', { length: 100, nullable: false })
    nombre_planilla : string;

    @Column('varchar2', { length: 200, nullable: true })
    descripcion: string;

/*     @Column('varchar2', { length: 200, nullable: false })
    periodoInicio: string;

    @Column('varchar2', { length: 200, nullable: false })
    periodoFinalizacion: string; */

/*     @Column('varchar2', { length: 50, nullable: true })
    estado: string;
 */
    @OneToMany(() => Net_Planilla, planilla => planilla.tipoPlanilla)
    planilla: Net_Planilla[];
}
