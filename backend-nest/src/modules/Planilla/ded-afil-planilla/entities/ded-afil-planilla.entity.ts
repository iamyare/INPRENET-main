import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Deduccion } from '../../deduccion/entities/deduccion.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';

@Entity()
export class DedAfilPlanilla {

    @PrimaryGeneratedColumn('uuid')
    id_dedAfil: string;

    @Column('varchar2', { length: 20, nullable: false })
    monto_deduccion: string;

    @ManyToOne(() => Deduccion, deduccion => deduccion.dedAfilPlanilla)
    @JoinColumn({ name: 'id_deduccion' })
    deduccion: Deduccion;

    @ManyToOne(() => Afiliado, afiliado => afiliado.dedAfilPlanilla)
    @JoinColumn({ name: 'id_afiliado' })
    afiliado: Afiliado;
}
