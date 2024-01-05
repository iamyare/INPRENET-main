import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BeneficioPlanilla } from '../../beneficio_planilla/entities/beneficio_planilla.entity';
import { TipoPlanilla } from '../../tipo-planilla/entities/tipo-planilla.entity';

@Entity()
export class Planilla {

    @PrimaryGeneratedColumn('uuid')
    id_planilla : string

    @Column('date', { nullable: false })
    fecha_apertura : string;

    @Column('varchar2', { length: 40, nullable: true })
    secuencia : string;

    @OneToMany(() => BeneficioPlanilla, beneficioPlanilla => beneficioPlanilla.planilla)
    beneficioPlanilla : BeneficioPlanilla[];

    @ManyToOne(() => TipoPlanilla, tipoPlanilla => tipoPlanilla.planilla)
    @JoinColumn({ name: 'id_tipo_planilla' })
    tipoPlanilla: TipoPlanilla;


}
